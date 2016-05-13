import React from 'react';
import { reduxForm } from 'redux-form';
import { Modal } from 'react-bootstrap';


class DataCollection extends React.Component {
  constructor(props) {
    super(props);
    this.runNow = this.handleSubmit.bind(this, true);
    this.addToQueue = this.handleSubmit.bind(this, false);
  }

  handleSubmit(runNow) {
    const parameters = {
      ...this.props.values,
      Type: 'DataCollection',
      point: this.props.pointId
    };
    if (this.props.sampleIds.constructor === Array) {
      this.props.sampleIds.map((sampleId) => {
        const queueId = this.props.lookup[sampleId];

        if (queueId) {
          this.props.addTask(queueId, sampleId, parameters);
        } else {
          this.props.addSampleAndTask(sampleId, parameters);
        }
      });
    } else {
      const { lookup, taskData, sampleIds } = this.props;
      const sampleId = lookup[this.props.sampleIds];
      this.props.changeTask(taskData.queue_id, sampleId, sampleIds, parameters, runNow);
    }

    this.props.hide();
  }

  handleShowHide(e) {
    if (e.target.innerHTML === 'Show More') {
      e.target.innerHTML = 'Show Less';
    } else {
      e.target.innerHTML = 'Show More';
    }
  }


  render() {
    const {
      fields: {
        num_images,
        first_image,
        exp_time,
        resolution,
        osc_start,
        energy,
        osc_range,
        transmission,
        shutterless,
        inverse_beam,
        centringMethod,
        detector_mode,
        kappa,
        kappa_phi,
        space_group,
        prefix,
        run_number,
        beam_size,
        dir
      }
    } = this.props;

    return (
        <Modal show={this.props.show} onHide={this.props.hide}>
            <Modal.Header closeButton>
                <Modal.Title>Standard Data Collection</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                    <div className="task-title-head">
                        <span className="task-title-body">
                            Data location
                        </span>
                    </div>

                    <form className="form-horizontal">

                     <div className="form-group">

                        <label className="col-sm-12 control-label">Path: /home/20160502/RAWDATA/{dir.value} </label>
                    </div>

                     <div className="form-group">

                        <label className="col-sm-2 control-label">Subdirectory</label>
                        <div className="col-sm-4">
                            <input type="text" className="form-control" {...dir} />
                        </div>

                    </div>

                    <div className="form-group">
                        <label className="col-sm-12 control-label">Filename: { prefix.value + '_' + run_number.value + '_xxxx.cbf'}</label>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-3 control-label">Prefix</label>
                        <div className="col-sm-3">
                            <input type="text" className="form-control" {...prefix} />
                        </div>

                        <label className="col-sm-3 control-label">Run number</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...run_number} />
                        </div>

                    </div>
                    </form>

                <div className="task-title-head">
                    <span className="task-title-body">
                        Acquisition
                    </span>
                </div>
                <form className="form-horizontal">

                    <div className="form-group">
                        <label className="col-sm-3 control-label">Oscillation range</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...osc_range} />
                        </div>

                        <label className="col-sm-3 control-label">First Image</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...first_image} />
                        </div>

                    </div>

                    <div className="form-group">
                        <label className="col-sm-3 control-label">Oscillation start</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...osc_start} />
                        </div>

                        <label className="col-sm-3 control-label">Number of images</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...num_images} />
                        </div>

                    </div>

                    <div className="form-group">

                        <label className="col-sm-3 control-label">Exposure time(ms)</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...exp_time} />
                        </div>
                        <label className="col-sm-3 control-label">Transmission (%)</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" {...transmission} />
                        </div>

                    </div>

                    <div className="form-group">

                        <label className="col-sm-3 control-label">Energy (KeV)</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" step="0.1" {...energy} />
                        </div>

                        <label className="col-sm-3 control-label">
                        <input type="checkbox" />
                        MAD
                        </label>
                        <div className="col-sm-3">
                             <select className="form-control" >
                                <option value="ip">ip:-</option>
                                <option value="pk">pk:-</option>
                            </select>
                        </div>

                    </div>

                    <div className="form-group">


                        <label className="col-sm-3 control-label">Resolution (Å)</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" step="0.1" {...resolution} />
                        </div>

                    </div>

                    <div className="collapse" id="acquistion">

                        <div className="form-group">

                            <label className="col-sm-3 control-label">Kappa</label>
                            <div className="col-sm-3">
                                <input type="number" className="form-control" {...kappa} />
                            </div>

                            <label className="col-sm-3 control-label">Phi</label>
                            <div className="col-sm-3">
                                <input type="number" className="form-control" {...kappa_phi} />
                            </div>

                        </div>


                        <div className="form-group">

                            <label className="col-sm-3 control-label">Beam size</label>
                            <div className="col-sm-3">
                                <select className="form-control" {...beam_size}>
                                    {this.props.apertureList.map((val, i) => {
                                      return <option key={i} value={val}>{val}</option>;
                                    })}
                                </select>
                            </div>


                            <label className="col-sm-3 control-label">Subwedge size</label>
                            <div className="col-sm-3">
                                <input type="number" className="form-control" />
                            </div>

                        </div>


                        <div className="form-group">
                            <label className="col-sm-3 control-label">Detector mode</label>
                            <div className="col-sm-3">
                                 <select className="form-control" {...detector_mode}>
                                    <option value="0">0</option>
                                    <option value="C18">C18</option>
                                    <option value="C2">C2</option>
                                </select>
                            </div>

                            <label className="col-sm-3 control-label">
                                <input type="checkbox" {...shutterless} />
                                Shutterless
                            </label>

                            <label className="col-sm-3 control-label">
                                <input type="checkbox" {...inverse_beam} />
                                Inverse beam
                            </label>

                        </div>

                    </div>
                    <p className="text-right">
                        <a data-toggle="collapse" data-target="#acquistion" aria-expanded="false" aria-controls="acquistion" onClick={this.handleShowHide} >
                            Show More
                        </a>
                    </p>

                    <div className="task-title-head">
                        <span className="task-title-body">
                            Processing
                        </span>
                    </div>

                    <div className="collapse" id="processing">

                    <div className="form-group">
                        <label className="col-sm-3 control-label">N.o. residues</label>
                        <div className="col-sm-3">
                            <input type="number" className="form-control" />
                        </div>

                        <label className="col-sm-3 control-label">Space group</label>
                        <div className="col-sm-3">
                             <select className="form-control" {...space_group}>
                                <option value="1"></option>
                                <option value="1">X</option>
                                <option value="1">Y</option>
                            </select>
                        </div>

                    </div>

                    <h6>Unit cell:</h6>
                    <div className="form-group">

                        <label className="col-sm-2 control-label">a</label>
                        <div className="col-sm-2">
                            <input type="number" className="form-control" />
                        </div>

                        <label className="col-sm-2 control-label">b</label>
                        <div className="col-sm-2">
                            <input type="number" className="form-control" />
                        </div>

                        <label className="col-sm-2 control-label">c</label>
                        <div className="col-sm-2">
                            <input type="number" className="form-control" />
                        </div>

                        <label className="col-sm-2 control-label"> &alpha;</label>
                        <div className="col-sm-2">
                            <input type="number" className="form-control" />
                        </div>

                        <label className="col-sm-2 control-label">  &beta;</label>
                        <div className="col-sm-2">
                            <input type="number" className="form-control" />
                        </div>

                        <label className="col-sm-2 control-label">  &gamma;</label>
                        <div className="col-sm-2">
                            <input type="number" className="form-control" />
                        </div>
                        </div>

                    </div>
                    <p className="text-right">
                        <a data-toggle="collapse" data-target="#processing" aria-expanded="false" aria-controls="processing" onClick={this.handleShowHide}>
                            Show More
                        </a>
                    </p>
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

DataCollection = reduxForm({ // <----- THIS IS THE IMPORTANT PART!
  form: 'datacollection',                           // a unique name for this form
  fields: ['num_images', 'first_image', 'exp_time', 'resolution', 'osc_start', 'energy', 'osc_range', 'transmission', 'shutterless', 'inverse_beam', 'centringMethod', 'detector_mode', 'kappa', 'kappa_phi', 'space_group', 'prefix', 'run_number', 'beam_size', 'dir'] // all the fields in your form
},
state => ({ // mapStateToProps
  initialValues: { ...state.taskForm.taskData.parameters, beam_size: state.sampleview.currentAperture, prefix: 'data', run_number: 1, dir: 'username' } // will pull state into form's initialValues
}))(DataCollection);

export default DataCollection;
