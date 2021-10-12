import socket
import logging
import json
import uuid

import flask
import flask_security

from mxcube3.core.component import Component
from mxcube3.core.user.models import User
from mxcube3.core.util.networkutils import is_local_host, remote_addr
from mxcube3.core.util.convertutils import convert_to_dict


class BaseUserManager(Component):
    def __init__(self, app, server, config):
        super().__init__(app, server, config)

    def get_observers(self):
        return [user for user in User.query.all() if not user.in_control]

    def get_operator(self):
        user = None

        for _u in User.query.all():
            if _u.in_control:
                user = _u
                break

        return user

    def is_operator(self):
        return flask_security.current_user.in_control

    def logged_in_users(self, exclude_inhouse=False):
        users = [user["loginID"] for user in self.app.USERS.values()]

        if exclude_inhouse:
            if isinstance(
                self.app.mxcubecore.beamline_ho.session.in_house_users[0], tuple
            ):
                ih_users = [
                    "%s%s" % (p, c)
                    for (p, c) in self.app.mxcubecore.beamline_ho.session.in_house_users
                ]
            else:
                ih_users = self.app.mxcubecore.beamline_ho.session.in_house_users
            users = [user for user in users if user not in ih_users]

        return users

    def set_operator(self):
        active_in_control = False

        for _u in User.query.all():
            if _u.is_authenticated and _u.in_control:
                active_in_control = True

        # If no user is currently in control set this user to be
        # in control.
        if not active_in_control:
            self.db_set_in_control(flask_security.current_user, True)

        # Set active proposal to that of the active user
        if self.app.mxcubecore.beamline_ho.lims.loginType.lower() != "user":
            # The name of the user is the proposal when using proposalType login
            self.app.lims.select_proposal(flask_security.current_user.name)

    def is_inhouse_user(self, user_id):
        user_id_list = [
            "%s%s" % (code, number)
            for (code, number) in self.app.mxcubecore.beamline_ho.session.in_house_users
        ]

        return user_id in user_id_list

    # Abstract method to be implemented by concrete implementation
    def _login(self, login_id, password):
        pass

    def login(self, login_id, password):
        try:
            login_res = self._login(login_id, password)
        except BaseException:
            raise
        else:
            if not "sid" in flask.session:
                flask.session["sid"] = str(uuid.uuid4())

            user = self.db_create_user(login_id, password, login_res)
            flask_security.login_user(user)

            address, barcode = self.app.sample_changer.get_loaded_sample()

            # If A sample is mounted (and not already marked as such),
            # get sample changer contents and add mounted sample to the queue
            if not self.app.sample_changer.get_current_sample() and address:
                self.app.sample_changer.get_sample_list()

            # For the moment not loading queue from persistent storage (redis),
            # uncomment to enable loading.
            # self.app.queue.load_queue(session)
            # logging.getLogger('MX3.HWR').info('Loaded queue')
            logging.getLogger("MX3.HWR").info(
                "[QUEUE] %s " % self.app.queue.queue_to_json()
            )

            self.set_operator()

            return login_res["status"]

    # Abstract method to be implemented by concrete implementation
    def _signout(self):
        pass

    def signout(self):
        self._signout()
        user = flask_security.current_user

        # If operator logs out clear queue and sample list
        if self.is_operator():
            self.app.queue.save_queue(flask.session)
            self.app.queue.clear_queue()
            self.app.mxcubecore.beamline_ho.sample_view.clear_all()
            self.app.lims.init_sample_list()

            self.app.queue.init_queue_settings()

            if hasattr(self.app.mxcubecore.beamline_ho.session, "clear_session"):
                self.app.mxcubecore.beamline_ho.session.clear_session()

            self.app.CURRENTLY_MOUNTED_SAMPLE = ""

            self.db_set_in_control(flask_security.current_user, False)

            msg = "User %s signed out" % user.username
            logging.getLogger("MX3.HWR").info(msg)

        flask.session.clear()
        flask_security.logout_user()

    def is_authenticated(self):
        return flask_security.is_authenticated()

    def login_info(self):
        # If user object has limsdata attribute if logged in:
        if hasattr(flask_security.current_user, "limsdata"):
            login_info = json.loads(flask_security.current_user.limsdata)
        else:
            login_info = {}

        self.set_operator()

        login_info = convert_to_dict(login_info)

        proposal_list = [
            {
                "code": prop["Proposal"]["code"],
                "number": prop["Proposal"]["number"],
                "proposalId": prop["Proposal"]["proposalId"],
            }
            for prop in login_info["proposalList"]
        ]

        res = {
            "synchrotronName": self.app.mxcubecore.beamline_ho.session.synchrotron_name,
            "beamlineName": self.app.mxcubecore.beamline_ho.session.beamline_name,
            "loggedIn": True,
            "loginType": self.app.mxcubecore.beamline_ho.lims.loginType.title(),
            "proposalList": proposal_list,
            "user": {
                "username": flask_security.current_user.username,
                "email": flask_security.current_user.email,
                "isstaff": "staff" in flask_security.current_user.roles,
                "name": flask_security.current_user.name
                if hasattr(flask_security.current_user, "name")
                else "",
                "inControl": flask_security.current_user.in_control,
                "ip": flask_security.current_user.last_login_ip,
            },
        }

        res["selectedProposal"] = "%s%s" % (
            self.app.mxcubecore.beamline_ho.session.proposal_code,
            self.app.mxcubecore.beamline_ho.session.proposal_number,
        )

        res["selectedProposalID"] = self.app.mxcubecore.beamline_ho.session.proposal_id

        return flask_security.current_user, res

    def db_create_user(self, user, password, lims_data):
        sid = flask.session["sid"]
        user_datastore = self.app.server.user_datastore
        username = f"{user}-{sid}"

        # Make sure that the roles staff and incontrol always
        # exists
        if not user_datastore.find_role("staff"):
            user_datastore.create_role(name="staff")
            user_datastore.create_role(name="incontrol")
            self.app.server.user_datastore.commit()

        _u = user_datastore.find_user(username=username)

        if not _u:
            user_datastore.create_user(
                username=username,
                password=flask_security.hash_password("password"),
                name=user,
                last_session_id=sid,
                selected_proposal=user,
                limsdata=json.dumps(lims_data),
                roles=["staff"],
            )
        else:
            _u.limsdata = json.dumps(lims_data)

        self.app.server.user_datastore.commit()

        return user_datastore.find_user(username=username)

    def db_set_in_control(self, user, control):
        user_datastore = self.app.server.user_datastore

        if control:
            for _u in User.query.all():
                if _u.username == user.username:
                    _u.in_control = True
                else:
                    _u.in_control = False

                user_datastore.put(_u)
        else:
            _u = user_datastore.find_user(username=user.username)
            _u.in_control = control
            user_datastore.put(_u)

        self.app.server.user_datastore.commit()


class UserManager(BaseUserManager):
    def __init__(self, app, server, config):
        super().__init__(app, server, config)

    def _login(self, login_id, password):
        login_res = self.app.lims.lims_login(login_id, password, create_session=False)
        inhouse = self.is_inhouse_user(login_id)

        info = {
            "valid": self.app.lims.lims_valid_login(login_res),
            "local": is_local_host(),
            "existing_session": self.app.lims.lims_existing_session(login_res),
            "inhouse": inhouse,
        }

        _users = self.logged_in_users(exclude_inhouse=True)

        # Only allow in-house log-in from local host
        if inhouse and not (inhouse and is_local_host()):
            raise Exception("In-house only allowed from localhost")

        # Only allow other users to log-in if they are from the same proposal
        if (not inhouse) and _users and (login_id not in _users):
            raise Exception("Another user is already logged in")

        # Only allow local login when remote is disabled
        if not self.app.ALLOW_REMOTE and not is_local_host():
            raise Exception("Remote access disabled")

        # Only allow remote logins with existing sessions
        if self.app.lims.lims_valid_login(login_res) and is_local_host():
            if not self.app.lims.lims_existing_session(login_res):
                login_res = self.app.lims.create_lims_session(login_res)

            msg = "[LOGIN] Valid login from local host (%s)" % str(info)
            logging.getLogger("MX3.HWR").info(msg)
        elif self.app.lims.lims_valid_login(
            login_res
        ) and self.app.lims.lims_existing_session(login_res):
            msg = "[LOGIN] Valid remote login from %s with existing session (%s)"
            msg += msg % (remote_addr(), str(info))
            logging.getLogger("MX3.HWR").info(msg)
        else:
            logging.getLogger("MX3.HWR").info("Invalid login %s" % info)
            raise Exception(str(info))

        return login_res

    def _signout(self):
        pass
