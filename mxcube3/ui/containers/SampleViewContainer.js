import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SampleImage from '../components/SampleView/SampleImage';
import MotorControl from '../components/SampleView/MotorControl';
import ContextMenu from '../components/SampleView/ContextMenu';
import * as SampleViewActions from '../actions/sampleview';
import { showTaskForm } from '../actions/taskForm';
import BeamlineSetupContainer from './BeamlineSetupContainer';
import SampleQueueContainer from './SampleQueueContainer';
import MachInfo from '../components/MachInfo/MachInfo';

class SampleViewContainer extends Component {

  render() {
    const { imageRatio, motorSteps } = this.props.sampleViewState;
    const { sendMotorPosition, setStepSize, sendStopMotor } = this.props.sampleViewActions;
    const sampleId = this.props.current.node;

    return (
      <div className="row">
        <div className="col-xs-1"
          style={ { 'margin-top': '0em', 'padding-right': '5px', 'padding-left': '1.5em' } }
        >
            <MotorControl
              save={sendMotorPosition}
              saveStep={setStepSize}
              motors={this.props.beamline.motors}
              steps={motorSteps}
              stop={sendStopMotor}
            />
        </div>
        <div className="col-xs-11">
            <div className="row">
              <div className="col-xs-9">
                <BeamlineSetupContainer />
              </div>
              <div className="col-xs-3">
                <MachInfo
                  info={this.props.machinfo}
                />
              </div>
            </div>
            <div className="row" style={ { display: 'flex' } }>
              <div className="col-xs-9">
                <ContextMenu
                  {...this.props.contextMenu}
                  sampleActions={this.props.sampleViewActions}
                  showForm={this.props.showForm}
                  sampleId={sampleId}
                  samplesInformation={this.props.sampleInformation}
                  defaultParameters={this.props.defaultParameters}
                  imageRatio={imageRatio}
                />
                <SampleImage
                  sampleActions={this.props.sampleViewActions}
                  {...this.props.sampleViewState}
                  {...this.props.beamline}
                  contextMenuVisible={this.props.contextMenu.show}
                  points={this.props.points.points}
                />
              </div>
              <div className="col-xs-3" style={ { display: 'flex' } }>
                <SampleQueueContainer />
            </div>
            </div>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    current: state.queue.current,
    sampleInformation: state.queue.sampleList,
    sampleViewState: state.sampleview,
    contextMenu: state.contextMenu,
    beamline: state.beamline,
    machinfo: state.beamline.machinfo,
    defaultParameters: state.taskForm.defaultParameters,
    points: state.points
  };
}

function mapDispatchToProps(dispatch) {
  return {
    sampleViewActions: bindActionCreators(SampleViewActions, dispatch),
    showForm: bindActionCreators(showTaskForm, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SampleViewContainer);
