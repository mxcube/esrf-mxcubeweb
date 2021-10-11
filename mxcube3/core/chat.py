import datetime

from flask import session, request, Response
from flask_security import current_user

from mxcube3.core.component import Component
from mxcube3.core.user.models import User, Message, MessagesUsers
from mxcube3.core.util.networkutils import remote_addr

class Chat(Component):
    def __init__(self, app, server, config):
        super().__init__(app, server, config)
        self.MESSAGES = []

    def db_add_message(self, user, message):
        m = self.app.server.user_datastore.create_message(message=message)
        self.app.server.user_datastore.add_message_to_user(user, m)
        self.app.server.user_datastore.commit()

    def append_message(self, message, sid):
        user = current_user.name

        data = {
            "message": message,
            "sid": sid,
            "user": user,
            "host": remote_addr(),
            "date": datetime.datetime.now().strftime("%H:%M"),
        }

        self.MESSAGES.append(data)
        db_add_message(current_user, message)
        server.emit("ra_chat_message", data, namespace="/hwr")


    def get_all_messages(self):
        message_db_list = self.app.server.user_datastore.get_all_messages()
        message_list = []
        
        for m in message_list:
            user = m.users.all()[0]

            message_list.append({
                "message": message,
                "sid": user.last_session_id,
                "user": user.username,
                "host": user.last_login_ip,
                "date": message.at.strftime("%H:%M"),
            })

        return message_list
