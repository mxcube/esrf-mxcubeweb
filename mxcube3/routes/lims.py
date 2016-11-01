# -*- coding: utf-8 -*-
import StringIO

from flask import jsonify, Response, send_file
from mxcube3 import app as mxcube
from . import limsutils

@mxcube.route("/mxcube/api/v0.1/lims/samples/<proposal_id>")
def proposal_samples(proposal_id):
    # session_id is not used, so we can pass None as second argument to
    # 'db_connection.get_samples'
    lims_samples = mxcube.db_connection.get_samples(proposal_id, None)
    samples_info_list = [limsutils.convert_to_dict(x) for x in lims_samples]

    for sample_info in samples_info_list:
        sample_info["limsID"] = sample_info.pop("sampleId")
        sample_info["limsLink"] = mxcube.rest_lims.sample_link()
        sample_info["defaultPrefix"] = limsutils.get_default_prefix(sample_info, False)
        
        try:
            basket = int(sample_info["containerSampleChangerLocation"])
        except (TypeError, ValueError):
            continue
        else:
            if mxcube.sample_changer.__class__.__TYPE__ == 'Robodiff':
                cell = int(round((basket+0.5)/3.0))
                puck = basket-3*(cell-1)
                sample_info["containerSampleChangerLocation"] = "%d:%d" % (cell, puck)

    return jsonify({"samples_info": samples_info_list})


@mxcube.route("/mxcube/api/v0.1/lims/dc/thumbnail/<image_id>", methods=['GET'])
def get_dc_thumbnail(image_id):
    fname, data = mxcube.rest_lims.get_dc_thumbnail(image_id)
    data = StringIO.StringIO(data)
    data.seek(0)    
    return send_file(data, attachment_filename=fname, as_attachment=True)


@mxcube.route("/mxcube/api/v0.1/lims/dc/<dc_id>", methods=['GET'])
def get_dc(dc_id):
    data = mxcube.rest_lims.get_dc_(dc_id)
    return jsonify(data)
