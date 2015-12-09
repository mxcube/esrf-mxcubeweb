from flask import session, redirect, url_for, render_template, request, Response, stream_with_context
from mxcube3 import app as mxcube
import time, logging, collections
import gevent.event
import os, json
import queue_model_objects_v1 as qmo

###----QUEUE ACTIONS----###
@mxcube.route("/mxcube/api/v0.1/queue/start", methods=['PUT'])
def queueStart():
    """Queue: start execution of the queue
    Args: None
    Return: boolean, success?
    """
    logging.getLogger('HWR').info('[QUEUE] Queue going to start')
    try:
    	mxcube.queue.start()
    	logging.getLogger('HWR').info('[QUEUE] Queue started')
		return "True"
	except:
    	logging.getLogger('HWR').error('[QUEUE] Queue could not be started')
		return "False"

@mxcube.route("/mxcube/api/v0.1/queue/stop", methods=['PUT'])
def queueStop():
    """Queue: stop execution of the queue
    Args: None
    Return: boolean, success?
    """
    logging.getLogger('HWR').info('[QUEUE] Queue going to stop')
    try:
    	mxcube.queue.stop()
    	logging.getLogger('HWR').info('[QUEUE] Queue stopped')
		return "True"
	except:
    	logging.getLogger('HWR').error('[QUEUE] Queue could not be stopped')
		return "False"

@mxcube.route("/mxcube/api/v0.1/queue/abort", methods=['PUT'])
def queueAbort():
    """Queue: abort execution of the queue
    Args: None
    Return: boolean, success?
    """
    logging.getLogger('HWR').info('[QUEUE] Queue going to abort')
    try:
    	mxcube.queue.abort()
    	logging.getLogger('HWR').info('[QUEUE] Queue aborted')
		return "True"
	except:
    	logging.getLogger('HWR').error('[QUEUE] Queue could not be aborted')
		return "False"

@mxcube.route("/mxcube/api/v0.1/queue/pause", methods=['PUT'])
def queuePause():
    """Queue: start execution of the queue
    Args: None
    Return: boolean, success?
    """
    logging.getLogger('HWR').info('[QUEUE] Queue going to pause')
    try:
    	mxcube.queue.pause()
    	logging.getLogger('HWR').info('[QUEUE] Queue paused')
		return "True"
	except:
    	logging.getLogger('HWR').error('[QUEUE] Queue could not be paused')
		return "False"

@mxcube.route("/mxcube/api/v0.1/queue/clear", methods=['PUT'])
def queueClear():
    """Queue: clear the queue
    Args: None
    Return: boolean, success?
    """
    logging.getLogger('HWR').info('[QUEUE] Queue going to clear')
    try:
        mxcube.queue.clear_model(mxcube.queue.get_model_root()._name)#model name?? rootNode?
        #mxcube.queue.queue_hwobj.clear()#already done in the previous call
        logging.getLogger('HWR').info('[QUEUE] Queue cleared')
        return "True"
    except:
        logging.getLogger('HWR').error('[QUEUE] Queue could not be cleared')
        return "False"

@mxcube.route("/mxcube/api/v0.1/queue", methods=['GET'])
def queueGet():
    """Queue: get the queue
    Args: None
    Return: a lits of queue entries
    """
    logging.getLogger('HWR').info('[QUEUE] Queue getting')
    try:
        return mxcube.queue._queue_entry_list 
    except:
        logging.getLogger('HWR').error('[QUEUE] Queue could not get')
        return "False"

@mxcube.route("/mxcube/api/v0.1/queue/save", methods=['GET'])
def queueSave():
    """Queue: save the queue
    Args: None
    Return: True/False
    """
    logging.getLogger('HWR').info('[QUEUE] Queue saving')
    try:
        f = open('./queue-backup.txt', 'w')

        return mxcube.queue._queue_entry_list # here it should be saved somewhere? file?
    except:
        logging.getLogger('HWR').error('[QUEUE] Queue could saved')
        return "False"
        
@mxcube.route("/mxcube/api/v0.1/queue/entry/", methods=['GET'])
def getCurrentEntry():
    """Queue: get current entry
    Args: None
    Return:    The currently executing QueueEntry:
                :rtype: QueueEntry
    """
    logging.getLogger('HWR').info('[QUEUE] Queue getting current entry')
    try:
        return mxcube.queue.get_current_entry()
    except:
        logging.getLogger('HWR').error('[QUEUE] Queue could not get current entry')
        return "False"

@mxcube.route("/mxcube/api/v0.1/queue/entry/", methods=['PUT'])
def setCurrentEntry(entry):
    """Queue: Sets the currently executing QueueEntry to <entry>.
    Args: None
    Return:    The currently executing QueueEntry:
                :rtype: QueueEntry
    """
    logging.getLogger('HWR').info('[QUEUE] Queue getting current entry')
    try:
        return mxcube.queue.set_current_entry(entry)
    except:
        logging.getLogger('HWR').error('[QUEUE] Queue could not get current entry')
        return "False"

@mxcube.route("/mxcube/api/v0.1/queue/<entry>/execute", methods=['PUT'])
def executeEntryWithId(entry):
    """Queue: start execution of the queue
    Args: None
    Return: boolean, success?
    """
    logging.getLogger('HWR').info('[QUEUE] Queue going to execute entry with id: %s' %id)
    try:
    	mxcube.queue.execute_entry(entry)
    	logging.getLogger('HWR').info('[QUEUE] Queue executing entry with id: %s' %id)
		return "True"
	except:
    	logging.getLogger('HWR').error('[QUEUE] Queue could not be started')
		return "False"

###----QUEUE ELEMENTs MANAGEMENT----###
## Deprecating Sample.py
###----SAMPLE----###
import queue_entry as qe
from queue_entry import QueueEntryContainer

@mxcube.route("/mxcube/api/v0.1/queue/<id>", methods=['POST','PUT'])
def addUpdateSampleEntry(id):
    """Add the information of the sample with id:"id"
    id: integer
    data = {generic_data, "SampleId":id, sample_data={'holderLength': 22.0, 'code': None, 'containerSampleChangerLocation': '1', 'proteinAcronym': 'Mnth', 'cellGamma': 0.0, 'cellAlpha': 0.0, 'sampleId': 444179, 'cellBeta': 0.0, 'crystalSpaceGroup': 'R32', 'sampleLocation': '2', 'sampleName': 'sample-E02', 'cellA': 0.0, 'diffractionPlan': {}, 'cellC': 0.0, 'cellB': 0.0, 'experimentType': 'Default'}}
    return_data={"result": True/False}
    """
    content = request.get_json() # agree with fredrik
    #data = dict(request.POST.items())

    logging.getLogger('HWR').info('[QUEUE] Queue going to add entry with id: %s' %id)

    if qm.get_node(id):
        #already exist, so just update the element
        logging.getLogger('HWR').info('[QUEUE] element already exist, updating')
        #update model and apply to the queue entry
    else:
        sampleNode = qmo.Sample()
        if sampleNode.has_lims_data():
            sampleNode.init_from_lims_object(lims_sample)
        # check if it has lims data and fill, apply received data
        sampleEntry = qe.SampleQueueEntry()
        sampleEntry.set_data_model(sampleNode)
        try:
            mxcube.queue.add_child(sampleNode)
            mxcube.queue.enqueue(sampleEntry)
            logging.getLogger('HWR').info('[QUEUE] Queue sample added')
            return "True"
        except:
            logging.getLogger('HWR').error('[QUEUE] Queue sample could added')
            return "False"

@mxcube.route("/mxcube/api/v0.1/queue/<id>", methods=['GET'])
def getSample(id):
    """Get the information of the sample with id:"id"
    data = {generic_data, "SampleId":id}
    return_data={"SampleId":id, sample_data={'holderLength': 22.0, 'code': None, 'containerSampleChangerLocation': '1', 'proteinAcronym': 'Mnth', 'cellGamma': 0.0, 'cellAlpha': 0.0, 'sampleId': 444179, 'cellBeta': 0.0, 'crystalSpaceGroup': 'R32', 'sampleLocation': '2', 'sampleName': 'sample-E02', 'cellA': 0.0, 'diffractionPlan': {}, 'cellC': 0.0, 'cellB': 0.0, 'experimentType': 'Default'}}
    """
    try:
        if qm.get_node(id):
            return qm.get_node(id)#mmm... jsonify??
        else:
            return "False"
    except:
            logging.getLogger('HWR').error('[QUEUE] Queued sample could not be retrieved')
            return "False"

@mxcube.route("/mxcube/api/v0.1/queue/<id>", methods=['DELETE'])
def deleteSample(id):
    """Delete the sample with id:"id"
    data = {generic_data, "SampleId":id}
    return_data={"result": True/False}
    """
    try:
        node = qm.get_node(id)
        qm.del_child(qm._selected_model, node)
        entry = qm.queue_hwobj.get_entry_with_model(node)
        qm.queue_hwobj.dequeue(entry)
        logging.getLogger('HWR').info('[QUEUE] Queued sample deleted')
        return "True"
    except:
        logging.getLogger('HWR').error('[QUEUE] Queued sample could not be deleted')
        return "False"


###to be programmed....
@mxcube.route("/mxcube/api/v0.1/samples", methods=['GET'])
def getSampleList():
    """Get the sample list already on the queue
    data = {generic_data}
    return_data={"SampleId1":id, ..., "SampleIdN":id}
    """
    data = dict(request.POST.items())
    return samples.getSampleList()

@mxcube.route("/mxcube/api/v0.1/queue/<id>/mode", methods=['POST'])
def set_sample_mode(id):
    """Set sample changer mode: sample changer, manually mounted, ... (maybe it is enoug to set for all the same mode)
    data = {generic_data, "Mode": mode}
    return_data={"result": True/False}
    """
    data = dict(request.POST.items())
    return samples.getMode(data)

@mxcube.route("/mxcube/api/v0.1/queue/<id>/centring", methods=['PUT'])
def set_centring_mode(id):
    """Set centring method: semi auto, fully auto,  ...
    data = {generic_data, "Mode": mode}
    return_data={"result": True/False}
    """
    data = dict(request.POST.items())
    return samples.setCentring(data)

###----SAMPLECHANGER----###
@mxcube.route("/mxcube/api/v0.1/queue/<id>/mount", methods=['PUT'])
def mount_sample(id):
    """Mount sample with id:"id"
    data = {generic_data, "SampleId": id}
    return_data={"result": True/False}
    """
    data = dict(request.POST.items())
    return samples.mountSample(data)

@mxcube.route("/mxcube/api/v0.1/queue/<id>/umount", methods=['PUT'])
def umount_sample():
    """Umount mounted sample
    data = {generic_data}
    return_data={"result": True/False}
    """
    data = dict(request.POST.items())
    return samples.umountSample(data)
