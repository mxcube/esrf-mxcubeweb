import logging
import json

from flask import request, Response, jsonify
from mxcube3 import app as mxcube
from mxcube3 import socketio
from mxcube3.ho_mediators.beamline_setup import BeamlineSetupMediator
from mxcube3.routes import signals


@mxcube.route("/mxcube/api/v0.1/beamline", methods=['GET'])
def beamline_get_all_attributes():
    ho = BeamlineSetupMediator(mxcube.beamline)
    data = ho.dict_repr()
    return Response(json.dumps(data), status=200, mimetype='application/json')


@mxcube.route("/mxcube/api/v0.1/beamline/<name>/abort", methods=['GET'])
def beamline_abort_action(name):
    """
    Aborts an action in progress.

    :param str name: Owner / Actuator of the process/action to abort
    """
    # This could be made to give access to arbitrary method of HO, possible
    # security issues to be discussed.
    ho = BeamlineSetupMediator(mxcube.beamline).getObjectByRole(name.lower())
    ho.stop()

    return Response('', status=200, mimetype='application/json')


@mxcube.route("/mxcube/api/v0.1/beamline/<name>", methods=['PUT'])
def beamline_set_attribute(name):
    """
    Tries to set <name> to value, replies with the following json:
    
        {name: <name>, value: <value>, msg: <msg>, state: <state>

    Where msg is an arbitrary msg to user, state is the internal state
    of the set operation (for the moment, VALID, ABORTED, ERROR).

    Replies with status code 200 on success and 520 on exceptions.
    """
    data = json.loads(request.data)
    ho = BeamlineSetupMediator(mxcube.beamline).getObjectByRole(name.lower())

    try:
        ho.set(data["value"])
        data = ho.dict_repr()
        result, code = json.dumps(data), 200
    except Exception as ex:
        data["value"] = ho.get()
        data["state"] = "UNUSABLE"
        data["msg"] = str(ex)
        result, code = json.dumps(data), 520

    return Response(result, status=code, mimetype='application/json')


@mxcube.route("/mxcube/api/v0.1/beamline/<name>", methods=['GET'])
def beamline_get_attribute(name):
    """
    Retrieves value of attribute <name>, replies with the following json:
    
        {name: <name>, value: <value>, msg: <msg>, state: <state>

    Where msg is an arbitrary msg to user, state is the internal state
    of the get operation (for the moment, VALID, ABORTED, ERROR).

    Replies with status code 200 on success and 520 on exceptions.
    """
    ho = BeamlineSetupMediator(mxcube.beamline).getObjectByRole(name.lower())
    data = {"name": name, "value": ""}

    try:
        data = ho.dict_repr()
    except Exception as ex:
        data["value"] = ""
        data["state"] = "UNUSABLE"
        data["msg"] = str(ex)
        result, code = json.dumps(data), 520

    return Response(json.dumps(data), status=200, mimetype='application/json')


@mxcube.route("/mxcube/api/v0.1/beamline/beamInfo", methods=['GET'])
def getBeamInfo():
    """Beam information: position,size,shape
    return_data={"position":,"shape":,"size_x":,"size_y":}     
    """
    try:
        beamInfo = mxcube.beamline.getObjectByRole("beam_info")
        if beamInfo is None:
             logging.getLogger('HWR').error("beamInfo is not defined")
             return Response(status=409)
        beamInfoDict = beamInfo.get_beam_info()
        print beamInfoDict
        data = {'position': beamInfo.get_beam_position(), \
                'shape': beamInfoDict["shape"], \
                'size_x': beamInfoDict["size_x"], \
                'size_y': beamInfoDict["size_y"], \
               }       
        resp = jsonify(data)
        resp.status_code = 200
        return resp
    except Exception:
        return Response(status=409)
