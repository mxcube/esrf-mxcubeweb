# -*- coding: utf-8 -*-
import types
import sys
import logging
import copy

import queue_model_objects_v1 as qmo
import scutils
import qutils

from mxcube3 import app as mxcube
from flask import session


def init_sample_list():
    mxcube.SAMPLE_LIST = {"sampleList": {}, 'sampleOrder': []}


def sample_list_set(sample_list):
    mxcube.SAMPLE_LIST = sample_list


def sample_list_set_order(sample_order):
    mxcube.SAMPLE_LIST['sampleOrder'] = sample_order


def sample_list_get(loc=None):
    synch_sample_list_with_queue()
    res = mxcube.SAMPLE_LIST

    if loc:
        res = mxcube.SAMPLE_LIST.get("sampleList").get(loc, {})

    return res


def sample_list_sync_sample(lims_sample):
    lims_code = lims_sample.get("code", None)
    lims_location = lims_sample.get("lims_location")
    sample_to_update = None

    # LIMS sample has code, check if the code was read by SC
    if lims_code and scutils.sc_contetns_from_code_get(lims_code):
        sample_to_update = scutils.sc_contents_from_code_get(lims_code)
    elif lims_location:
        # Asume that the samples have been put in the right place of the SC
        sample_to_update = scutils.sc_contents_from_location_get(lims_location)

    if sample_to_update:
        loc = sample_to_update["sampleID"]
        sample_list_update_sample(loc, lims_sample)


def synch_sample_list_with_queue():
    current_queue = qutils.queue_to_dict()
    sample_order = current_queue.get("sample_order", [])

    for loc, data in mxcube.SAMPLE_LIST["sampleList"].iteritems():
        if loc in sample_order:
            sample = current_queue[loc]
            sample_list_update_sample(loc, sample)
        elif len(data["tasks"]):
            data["tasks"] = []


def sample_list_update_sample(loc, sample):
    _sample = mxcube.SAMPLE_LIST["sampleList"].get(loc, {})

    # If sample exists in sample list update it, otherwise add it
    if _sample:
        mxcube.SAMPLE_LIST["sampleList"].get(loc, {}).update(sample)
    else:
        mxcube.SAMPLE_LIST["sampleList"][loc] = sample
        mxcube.SAMPLE_LIST["sampleOrder"].append(loc)

    return mxcube.SAMPLE_LIST["sampleList"].get(loc, {})


def apply_template(params, sample_model, path_template):
    # Apply subdir template if used:
    if '{' in params.get('subdir', ''):
        params['subdir'] = params['subdir'].format(NAME=sample_model.get_name(),
                                                   ACRONYM=sample_model.crystals[0].protein_acronym)

        if params['subdir'].endswith('-'):
            params['subdir'] = sample_model.get_name()

    if '{' in params.get('prefix', ''):
        sample = sample_list_get(sample_model.loc_str)
        prefix = get_default_prefix(sample, False)
        shape = params["shape"] if params["shape"] > 0 else '';
        params['prefix'] = params['prefix'].format(PREFIX=prefix,
                                                   POSITION=shape)

        if params['prefix'].endswith('_'):
            params['prefix'] = params['prefix'][:-1]

    # mxcube3 passes entire prefix as prefix, including reference, mad and wedge
    # prefix. So we strip those before setting the actual base_prefix.
    params['prefix'] = strip_prefix(path_template, params['prefix'])


def strip_prefix(pt, prefix):
    """
    Strips the reference, wedge and mad prefix from a given prefix. For example 
    removes ref- from the beginning and _w[n] and -pk, -ip, -ipp from the end.

    :param PathTemplate pt: path template used to create the prefix
    :param str prefix: prefix from the client
    :returns: stripped prefix
    """
    if pt.reference_image_prefix and \
       pt.reference_image_prefix == prefix[0:len(pt.reference_image_prefix)]:
        prefix = prefix[len(pt.reference_image_prefix) + 1:]

    if pt.wedge_prefix and pt.wedge_prefix == prefix[-len(pt.wedge_prefix):]:
       prefix = prefix[:-(len(pt.wedge_prefix) + 1)]

    if pt.mad_prefix and pt.mad_prefix == prefix[-len(pt.mad_prefix):]:
        prefix = prefix[:-(len(pt.mad_prefix) + 1)]

    return prefix


def lims_login(loginID, password):
    """
    :param str loginID: Username
    :param str password: Password
    :returns dict: On the format:

      {'status': { 'code': 'ok', 'msg': msg },
      'proposalList':[]
      }
    """
    login_res = {}

    try:
        mxcube.rest_lims.authenticate(loginID, password)
    except:
        logging.getLogger('HWR').error('[LIMS-REST] Could not authenticate')
        return dict({'status': {'code': '0'}})

    if mxcube.db_connection.loginType.lower() == 'user':
        # soap will autocreate a session if empty, this is the only reason for this
        # login_res = mxcube.db_connection.login(loginID, password)
        # the rest interface does not create session, but the soap login only returns one proposal
        # if we auth by username we need all the associated proposals for later select

        try:
            proposals = mxcube.db_connection.get_proposals_by_user(loginID)

            logging.getLogger('HWR').info('[LIMS] Retrieving proposal list for user: %s, proposals: %s' % (loginID, proposals))
            session['proposal_list'] = copy.deepcopy(proposals)
        except:
            logging.getLogger('HWR').error('[LIMS] Could not retreive proposal list, %s' % sys.exc_info()[1])
            return dict({'status': {'code': '0'}})
        for prop in session['proposal_list']:
            # if len(prop['Session']) == 0:
            todays_session = mxcube.db_connection.get_todays_session(prop)
            prop['Session'] = [todays_session]
            # elif not prop['Session'][0]['scheduled']:
            #     todays_session = mxcube.db_connection.get_todays_session(prop)
            #     prop['Session'] = [todays_session]

    	# append a dummy proposal data so staff can select instead of their own research
        if hasattr(mxcube.session, 'commissioning_fake_proposal') and mxcube.session.is_inhouse(loginID, None):
            dummy = mxcube.session.commissioning_fake_proposal
    	    session['proposal_list'].append(dummy)

        login_res['proposalList'] = session['proposal_list']
        login_res['status'] = {"code": "ok", "msg": "Successful login"}

    else:
        try:
            aux = mxcube.db_connection.login(loginID, password)
            status = aux['status']
            aux = mxcube.db_connection.get_proposal(
                 aux['Proposal']['code'], aux['Proposal']['number'])
        except:
            logging.getLogger('HWR').error('[LIMS] Could not login to LIMS')
            return dict({'status': {'code': '0'}})

        login_res['proposalList'] = [aux]
        login_res['status'] = status
        session['proposal_list'] = [aux]

    logging.getLogger('HWR').info('[LIMS] Logged in, proposal data: %s' % login_res)

    return login_res


def get_proposal_info(proposal):
    """
    Search for the given proposal in the proposal list.
    """
    logging.getLogger('HWR').info("[LIMS] Serching for proposal: %s" % proposal)
    for prop in session.get('proposal_list', []):
        _p = "%s%s" % (prop.get('Proposal').get('code', '').lower(),
                       prop.get('Proposal').get('number', ''))

        if _p == proposal.lower():
            return prop

    return {}


def select_proposal(proposal):
    if not proposal.lower().startswith('mx'):
	aux_prop = "{}{}".format('mx', proposal)
    else:
	aux_prop = proposal
    
    proposal_info = get_proposal_info(aux_prop)
    logging.getLogger('HWR').info("[LIMS] Selecting proposal: %s" % proposal)
    logging.getLogger('HWR').info("[LIMS] Proposal info: %s" % proposal_info)
    if mxcube.db_connection.loginType.lower() == 'user' and 'Commissioning' in proposal_info['Proposal']['title']:
        if hasattr(mxcube.session, 'set_in_commissioning'):
            mxcube.session.set_in_commissioning(proposal_info)
    	    logging.getLogger('HWR').info("[LIMS] Commissioning proposal flag set.")

    if proposal_info:
        mxcube.session.proposal_code = proposal_info.get('Proposal').get('code', '')
        mxcube.session.proposal_number = proposal_info.get('Proposal').get('number', '')
        mxcube.session.session_id = proposal_info.get('Session')[0].get('session').get('sessionId')

        if hasattr(mxcube.session, 'prepare_directories'):
            try:
                logging.getLogger('HWR').info('[LIMS] Creating data directories for proposal %s'
                                              % proposal)
                mxcube.session.prepare_directories(proposal_info)
            except:
                logging.getLogger('HWR').info('[LIMS] Error creating data directories, %s'
                                              % sys.exc_info()[1])
        return True
    else:
        return False


def get_default_prefix(sample_data, generic_name):
    sample = qmo.Sample()
    sample.code = sample_data.get("code", "")
    sample.name = sample_data.get("sampleName", "")
    sample.location = sample_data.get("location", "").split(':')
    sample.lims_id = sample_data.get("limsID", -1)
    sample.crystals[0].protein_acronym = sample_data.get("proteinAcronym", "")

    return mxcube.session.get_default_prefix(sample, generic_name)

def get_default_subdir(sample_data):
    subdir = ""

    sample_name = sample_data.get("sampleName", "")
    protein_acronym = sample_data.get("proteinAcronym", "")

    if protein_acronym:
        subdir = "%s/%s-%s/" %(protein_acronym, protein_acronym, sample_name)
    else:
        subdir = "%s/" % sample_name

    return subdir


def convert_to_dict(ispyb_object):
    d = {}

    if type(ispyb_object) == types.DictType:
        d.update(ispyb_object)
    else:
        for key in ispyb_object.__keylist__:
            val = getattr(ispyb_object, key)
            if type(val) == types.InstanceType:
                val = convert_to_dict(val)
            elif type(val) == types.ListType:
                val = [convert_to_dict(x)
                        if type(x) == types.InstanceType else x
                        for x in val]
            elif type(val) == types.DictType:
                val = dict([(k, convert_to_dict(x)
                            if type(x) == types.InstanceType else x)
                            for k, x in val.iteritems()])

            d[key] = val

    return d
