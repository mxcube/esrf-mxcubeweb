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


class SampleViewContainer extends Component {

  render() {
    const { show } = this.props.sampleViewState.contextMenu;
    const {
      width,
      height,
      points,
      clickCentring,
      clickCentringPoints,
      pixelsPerMm,
      imageRatio,
      currentAperture,
      motors,
      motorSteps
    } = this.props.sampleViewState;
    const { sendMotorPosition, setStepSize, sendStopMotor } = this.props.sampleViewActions;
    const sampleId = this.props.lookup[this.props.current.node];
    return (
      <div className="row">
        <ContextMenu
          {...this.props.sampleViewState.contextMenu}
          sampleActions={this.props.sampleViewActions}
          showForm={this.props.showForm}
          sampleId={sampleId}
          defaultParameters={this.props.defaultParameters}
        />
        <div className="col-xs-1">
            <MotorControl
              save={sendMotorPosition}
              saveStep={setStepSize}
              motors={motors}
              steps={motorSteps}
              stop={sendStopMotor}
            />
        </div>
        <div className="col-xs-8">
            <SampleImage
              sampleActions={this.props.sampleViewActions}
              sampleViewState={this.props.sampleViewState}
              imageHeight={height}
              imageWidth={width}
              pixelsPerMm={pixelsPerMm}
              shapeList={points}
              clickCentring={clickCentring}
              contextMenuShow={show}
              imageRatio={imageRatio}
              currentAperture={currentAperture}
              clickCentringPoints={clickCentringPoints}
            />
        </div>
        <div className="col-xs-3">
          <BeamlineSetupContainer />
          <SampleQueueContainer />
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    current: state.queue.current,
    sampleInformation: state.samples_grid.samples_list,
    sampleViewState: state.sampleview,
    lookup: state.queue.lookup,
    defaultParameters: state.taskForm.defaultParameters
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
