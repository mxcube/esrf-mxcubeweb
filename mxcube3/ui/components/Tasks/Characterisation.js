'use strict';

import React from 'react';
import { reduxForm } from 'redux-form';
import { Modal } from 'react-bootstrap';


class Characterisation extends React.Component {


  constructor(props) {
    super(props);
    this.runNow = this.handleSubmit.bind(this, true);
    this.addToQueue = this.handleSubmit.bind(this, false);
  }

  handleSubmit(runNow) {

    let parameters = {
      ...this.props.values,
      Type : 'Characterisation',
      point : this.props.pointId
    };

    if (this.props.sampleIds.constructor == Array) {

      this.props.sampleIds.map((sampleId) => {

        let queueId = this.props.lookup[sampleId];

        if (queueId) {
          this.props.addTask(queueId, sampleId, parameters);
        } else {
                    // the sample is not in queue yet
          this.props.addSampleAndTask(sampleId, parameters);
        }
      });

    } else {
      let sample_queue_id = this.props.lookup[this.props.sampleIds];
      this.props.changeTask(this.props.taskData.queue_id, sample_queue_id, this.props.sampleIds, parameters, runNow);
    }

    this.props.hide();
  }


  render() {

    const {fields: {num_images, exp_time, resolution, osc_start , energy, osc_range, transmission, centringMethod, detector_mode, kappa, kappa_phi, account_rad_damage, opt_sad, space_group, min_crystal_vdim, max_crystal_vdim, min_crystal_vphi, max_crystal_vphi, strategy_complexity, prefix, run_number }} = this.props;

    return (
        <Modal show={this.props.show} onHide={this.props.hide}>
            <Modal.Header closeButton>
                <Modal.Title>Characterisation</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <h5>Acquisition</h5>
                <hr />
                <form className="form-horizontal">

                    <div className="form-group">

                        <label className="col-sm-3 control-label">Number of images:</label>
                        <div className="col-sm-3">
                             <select className="form-control" {...num_images}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="4">4</option>
                            </select>
                        </div>

                        <label className="col-sm-3 control-label">Transmission (%)</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...transmission} />
                        </div>
                    </div>

                    <div className="form-group">

                        <label className="col-sm-3 control-label">Exposure time(ms):</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...exp_time} />
                        </div>

                        <label className="col-sm-3 control-label">Detector mode:</label>
                        <div className="col-sm-3">
                             <select className="form-control" {...detector_mode}>
                                <option value="1"></option>
                                <option value="1">X</option>
                                <option value="1">Y</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">

                        <label className="col-sm-3 control-label">Oscillation range:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...osc_range} />
                        </div>

                        <label className="col-sm-3 control-label">Resolution (A):</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...resolution} />
                        </div>


                    </div>


                    <div className="form-group">

                        <label className="col-sm-3 control-label">Oscillation start:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...osc_start} />
                        </div>

                        <label className="col-sm-3 control-label">Energy (KeV):</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...energy} />
                        </div>

                    </div>

                    <div className="form-group">

                        <label className="col-sm-3 control-label">Kappa:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...kappa} />
                        </div>

                        <label className="col-sm-3 control-label">Phi:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...kappa_phi} />
                        </div>

                    </div>

                    <h5>Data location</h5>
                    <hr />

                     <div className="form-group">

                        <label className="col-sm-12 control-label">File name: /user/biomax/experiment/{prefix.value + '/' + run_number.value}</label>
                    </div>  

                     <div className="form-group">

                        <label className="col-sm-3 control-label">Prefix:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...prefix}/>
                        </div>

                        <label className="col-sm-3 control-label">Run number:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...run_number}/>
                        </div>

                    </div>

                    <h5>Characterisation</h5>
                    <hr />

                    <div className="form-group">

                        <label className="col-sm-6 control-label">Strategy complexity:</label>
                        <div className="col-sm-6">
                             <select className="form-control" {...strategy_complexity}>
                                <option value="1">Single subwedge</option>
                                <option value="2">Multiple subwedge</option>
                            </select>
                        </div>

                    </div>

                    <div className="form-group">

                        <label className="col-sm-6 control-label">
                            <input type="checkbox" {...account_rad_damage} />
                             Account for radiation damage
                        </label>
                        <label className="col-sm-6 control-label">
                            <input type="checkbox" {...opt_sad} />
                             Optimised SAD
                        </label>

                    </div>

                    <h5>Crystal</h5>
                    <hr />

                    <div className="form-group">

                        <label className="col-sm-6 control-label">Space group:</label>
                        <div className="col-sm-6">
                             <select className="form-control" {...space_group}>
                                <option value="1"></option>
                                <option value="1">X</option>
                            </select>
                        </div>

                    </div>
                    <h6>Vertical crystal dimension(mm)</h6>
                    <div className="form-group">

                        <label className="col-sm-3 control-label">Min:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...min_crystal_vdim} />
                        </div>

                        <label className="col-sm-3 control-label">Max:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...max_crystal_vdim} />
                        </div>

                        <label className="col-sm-3 control-label">  &omega; at min:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...min_crystal_vphi} />
                        </div>

                        <label className="col-sm-3 control-label">  &omega; at max:</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...max_crystal_vphi} />
                        </div>

                    </div>

                </form>
            </Modal.Body>
            <Modal.Footer>
          <div className={this.props.pointId === -1 ? 'pull-left' : 'hidden'}>
            <label className="centring-method">
              <input type="radio" {...centringMethod} value="lucid" checked={centringMethod.value === 'lucid'} /> Lucid Only
            </label>
            <label className="centring-method">
              <input type="radio" {...centringMethod} value="xray" checked={centringMethod.value === 'xray'} /> X-ray Centring
            </label>
          </div>
              <button type="button" className={this.props.pointId !== -1 ? 'btn btn-success' : 'hidden'} onClick={this.runNow}>Run Now</button>
              <button type="button" className="btn btn-primary" onClick={this.addToQueue}>{this.props.taskData.queue_id ? 'Change' : 'Add to Queue'}</button>
          </Modal.Footer>
        </Modal>
        );
  }
}

Characterisation = reduxForm({ // <----- THIS IS THE IMPORTANT PART!
  form: 'characterisation',                           // a unique name for this form
  fields: ['num_images', 'exp_time', 'resolution', 'osc_start' , 'energy', 'osc_range', 'transmission', 'centringMethod', 'detector_mode', 'kappa', 'kappa_phi', 'account_rad_damage' , 'opt_sad', 'space_group', 'min_crystal_vdim', 'max_crystal_vdim', 'min_crystal_vphi', 'max_crystal_vphi', 'strategy_complexity', 'prefix', 'run_number' ] // all the fields in your form
},
state => ({ // mapStateToProps
  initialValues: { ...state.taskForm.taskData.parameters } // will pull state into form's initialValues
}))(Characterisation);

export default Characterisation;
