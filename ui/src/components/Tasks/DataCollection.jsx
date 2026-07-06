/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Button, ButtonToolbar, Col, Form, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { formValueSelector, reduxForm, change } from 'redux-form';

import { SPACE_GROUPS } from '../../constants';
import { DraggableModal } from '../DraggableModal';
import asyncValidate from './asyncValidate';
import {
  CollapsableRows,
  FieldsHeader,
  FieldsRow,
  InputField,
  resetLastUsedParameters,
  saveToLastUsedParameters,
  SelectField,
  StaticField,
  toFixed,
} from './fields';
import validate from './validate';
import warn from './warning';

class DataCollection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      targetTotalRange: null,
    };

    this.submitAddToQueue = this.submitAddToQueue.bind(this);
    this.showFooter = this.showFooter.bind(this);
    this.showDCFooter = this.showDCFooter.bind(this);
    this.showDPFooter = this.showDPFooter.bind(this);
    this.submitRunNow = this.submitRunNow.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.defaultParameters = this.defaultParameters.bind(this);
    this.handleTotalRangeChange = this.handleTotalRangeChange.bind(this);
  }

  componentDidMount() {
    // Initialize target total range only if we have valid values
    const oscRange = parseFloat(this.props.osc_range) || 0;
    const numImages = parseFloat(this.props.num_images) || 0;
    const calculatedTotal = oscRange * numImages;
    
    if (calculatedTotal > 0) {
      this.setState({ targetTotalRange: calculatedTotal });
    }
  }

  componentDidUpdate(prevProps) {
    const currentOscRange = parseFloat(this.props.osc_range);
    const prevOscRange = parseFloat(prevProps.osc_range);
    const currentNumImages = parseFloat(this.props.num_images);
    const prevNumImages = parseFloat(prevProps.num_images);
    
    // Initialize targetTotalRange if it's not set yet and we now have valid values
    if ((this.state.targetTotalRange === null || this.state.targetTotalRange === 0) &&
        !isNaN(currentOscRange) && currentOscRange > 0 &&
        !isNaN(currentNumImages) && currentNumImages > 0) {
      this.setState({ targetTotalRange: currentOscRange * currentNumImages });
      return;
    }
    
    // If osc_range changes, keep total range constant by updating num_images
    if (!isNaN(currentOscRange) && 
        !isNaN(prevOscRange) && 
        currentOscRange !== prevOscRange && 
        currentOscRange !== 0) {
      
      const targetTotal = this.state.targetTotalRange || (prevOscRange * prevNumImages);
      
      if (targetTotal > 0) {
        const newNumImages = Math.round(targetTotal / currentOscRange);
        this.props.dispatch(change('datacollection', 'num_images', newNumImages));
        // Keep the target total range the same
      }
    }
    // If num_images changes (but osc_range didn't), update target total range
    else if (!isNaN(currentNumImages) && 
             !isNaN(prevNumImages) && 
             currentNumImages !== prevNumImages &&
             currentOscRange === prevOscRange) {
      const newTotalRange = currentOscRange * currentNumImages;
      this.setState({ targetTotalRange: newTotalRange });
    }
  }

  submitAddToQueue() {
    this.props.handleSubmit(this.addToQueue.bind(this, false))();
  }

  submitRunNow() {
    this.props.handleSubmit(this.addToQueue.bind(this, true))();
  }

  addToQueue(runNow, params) {
    const parameters = {
      ...params,
      type: 'DataCollection',
      label: 'Data Collection',
      helical: false,
      mesh: false,
      shape: this.props.pointID,
    };

    // Form gives us all parameter values in strings so we need to transform numbers back
    const stringFields = [
      'shutterless',
      'inverse_beam',
      'centringMethod',
      'detector_roi_mode',
      'space_group',
      'prefix',
      'subdir',
      'type',
      'shape',
      'label',
      'helical',
    ];

    saveToLastUsedParameters(this.props.taskData.type, params);
    this.props.addTask(parameters, stringFields, runNow);
    this.props.hide();
  }

  defaultParameters() {
    resetLastUsedParameters(this);
  }

  handleTotalRangeChange(event) {
    const totalRange = parseFloat(event.target.value);
    const oscRange = parseFloat(this.props.osc_range) || 1;
    
    if (!isNaN(totalRange) && oscRange !== 0) {
      const numImages = Math.round(totalRange / oscRange);
      this.setState({ targetTotalRange: totalRange });
      this.props.dispatch(change('datacollection', 'num_images', numImages));
    }
  }

  showDCFooter() {
    return (
      <Modal.Footer>
        <div className="input-group-btn d-flex">
          <ButtonToolbar
            style={{ bottom: '15px', left: '10px' }}
            className="position-absolute"
          >
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={this.defaultParameters}
            >
              Default Parameters
            </Button>
          </ButtonToolbar>
          <ButtonToolbar>
            <Button
              className="me-3 ms-3"
              size="sm"
              variant="success"
              disabled={
                this.props.taskData.parameters.shape === -1 ||
                this.props.invalid
              }
              onClick={this.submitRunNow}
            >
              Run Now
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={this.props.invalid}
              onClick={this.submitAddToQueue}
            >
              {this.props.taskData.sampleID ? 'Change' : 'Add to Queue'}
            </Button>
          </ButtonToolbar>
        </div>
      </Modal.Footer>
    );
  }

  showDPFooter() {
    return (
      <Modal.Footer>
        <ButtonToolbar className="float-end">
          <Button
            className="me-3"
            variant="success"
            disabled={
              this.props.taskData.parameters.shape === -1 || this.props.invalid
            }
            onClick={this.submitRunNow}
          >
            Run Now
          </Button>
          <Button
            variant="primary"
            disabled={this.props.invalid}
            onClick={this.submitAddToQueue}
          >
            Add Diffraction Plan to Queue
          </Button>
        </ButtonToolbar>
      </Modal.Footer>
    );
  }

  showFooter() {
    const { isDiffractionPlan } = this.props.taskData;
    let foot = '';

    if (isDiffractionPlan) {
      foot = this.showDPFooter();
    } else {
      foot = this.showDCFooter();
    }
    return foot;
  }

  render() {
    const energyScanResult =
      this.props.taskResult.energyScan.length > 0
        ? this.props.taskResult.energyScan[
            this.props.taskResult.energyScan.length - 1
          ]
        : [];

    const energyList = [];

    Object.values(energyScanResult).forEach((result) => {
      energyList.push(result);
    });

    // Get current values
    const oscRange = parseFloat(this.props.osc_range) || 0;
    const numImages = parseFloat(this.props.num_images) || 0;
    
    // Calculate total range from state (preserved value) or from current values
    // Use stored target if it exists and is > 0, otherwise calculate from current values
    const totalRange = (this.state.targetTotalRange !== null && this.state.targetTotalRange > 0)
      ? this.state.targetTotalRange 
      : (oscRange * numImages);

    // Calculate total exposure
    const expTime = parseFloat(this.props.exp_time) || 0;
    const transmission = parseFloat(this.props.transmission) || 100;
    const totalExposure = (expTime * numImages * transmission / 100).toFixed(2);

    return (
      <DraggableModal show={this.props.show} onHide={this.props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Standard Data Collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <StaticField label="Path" data={this.props.path} />
            <StaticField label="Filename" data={this.props.filename} />
            <Row className="mb-2">
              <Col xs={12} style={{ marginTop: '10px' }}>
                <InputField
                  propName="subdir"
                  label="Subdirectory"
                  col1="2"
                  col2="8"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <InputField
                  propName="prefix"
                  label="Prefix"
                  col1="2"
                  col2="8"
                />
              </Col>
              {this.props.taskData.sampleID ? (
                <Col xs={8}>
                  <InputField
                    propName="run_number"
                    disabled
                    label="Run number"
                    col1="4"
                    col2="3"
                  />
                </Col>
              ) : null}
            </Row>
          </Form>

          <FieldsHeader title="Acquisition" />
          <Form>
            <FieldsRow>
              <InputField
                propName="osc_range"
                type="number"
                label="Oscillation range"
              />
              <InputField
                propName="first_image"
                type="number"
                label="First image"
              />
            </FieldsRow>
            <FieldsRow>
              <InputField
                propName="osc_start"
                type="number"
                label="Oscillation start"
              />
              <InputField
                propName="num_images"
                type="number"
                label="Number of images"
              />
            </FieldsRow>
            <FieldsRow>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="6">
                  Total Range (degrees)
                </Form.Label>
                <Col sm="4">
                  <Form.Control
                    type="number"
                    value={totalRange}
                    onChange={this.handleTotalRangeChange}
                    step="any"
                  />
                </Col>
              </Form.Group>
            </FieldsRow>
            <FieldsRow>
              <InputField
                propName="exp_time"
                type="number"
                label="Exposure time (s)"
              />
              <InputField
                disabled={
                  this.props.beamline.hardwareObjects.transmission.readonly
                }
                propName="transmission"
                type="number"
                label="Transmission"
              />
            </FieldsRow>
            <FieldsRow>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="6">
                  Total Exposure (s)
                </Form.Label>
                <Col sm="4">
                  <Form.Control
                    type="text"
                    value={totalExposure}
                    disabled
                    readOnly
                    style={{
                      color: parseFloat(totalExposure) > 10 ? 'red' : 'inherit',
                      fontWeight: parseFloat(totalExposure) > 10 ? 'bold' : 'normal'
                    }}
                  />
                </Col>
              </Form.Group>
            </FieldsRow>
            <FieldsRow>
              <InputField
                disabled={this.props.beamline.hardwareObjects.energy.readonly}
                propName="energy"
                type="number"
                label="Energy"
              />
              <InputField
                propName="resolution"
                type="number"
                label="Resolution"
              />
            </FieldsRow>
            {this.props.taskResult.energyScan.length > 0 && (
              <FieldsRow>
                <SelectField
                  col1="6"
                  col2="4"
                  propName="energy"
                  label="Energy scan result"
                  list={energyList}
                />
              </FieldsRow>
            )}
            <CollapsableRows>
              <FieldsRow>
                <InputField propName="kappa" type="number" label="Kappa" />
                <InputField propName="kappa_phi" type="number" label="Phi" />
              </FieldsRow>
              {this.props.detector_mode_list.length > 0 && (
                <FieldsRow>
                  <SelectField
                    propName="detector_roi_mode"
                    label="Detector mode"
                    list={this.props.detector_mode_list}
                  />
                </FieldsRow>
              )}
            </CollapsableRows>
          </Form>

          {!this.props.initialValues.disable_processing && (
            <div>
              <FieldsHeader title="Processing" />
              <CollapsableRows>
                <Form>
                  <SelectField
                    col1="3"
                    col2="3"
                    propName="space_group"
                    label="Space group"
                    list={SPACE_GROUPS}
                  />
                  <Form.Label className="mb-2 mt-3">
                    <b> Unit Cell: </b>
                  </Form.Label>
                  <FieldsRow>
                    <InputField col1="1" col2="5" propName="cellA" label="a" />
                    <InputField col1="1" col2="5" propName="cellB" label="b" />
                    <InputField col1="1" col2="5" propName="cellC" label="c" />
                  </FieldsRow>
                  <FieldsRow>
                    <InputField
                      col1="1"
                      col2="5"
                      propName="cellAlpha"
                      label="&alpha;"
                    />
                    <InputField
                      col1="1"
                      col2="5"
                      propName="cellBeta"
                      label="&beta;"
                    />
                    <InputField
                      col1="1"
                      col2="5"
                      propName="cellGamma"
                      label="&gamma;"
                    />
                  </FieldsRow>
                </Form>
              </CollapsableRows>
            </div>
          )}
        </Modal.Body>

        {this.props.taskData.state ? '' : this.showFooter()}
      </DraggableModal>
    );
  }
}

const DataCollectionForm = reduxForm({
  form: 'datacollection',
  validate,
  asyncValidate,
  warn,
})(DataCollection);

const selector = formValueSelector('datacollection');

export default connect((state) => {
  const subdir = selector(state, 'subdir');
  const osc_range = selector(state, 'osc_range');
  const num_images = selector(state, 'num_images');
  const exp_time = selector(state, 'exp_time');
  const transmission = selector(state, 'transmission');

  let position = state.taskForm.pointID === '' ? 'PX' : state.taskForm.pointID;
  if (typeof position === 'object') {
    const vals = Object.values(position).sort();
    position = `[${vals}]`;
  }

  let fname = '';

  if (state.taskForm.sampleID) {
    fname = state.taskForm.taskData.parameters.fileName;
  } else {
    const prefix = selector(state, 'prefix');
    fname = `${prefix}_[RUN#]_[IMG#]`;
  }

  const { type } = state.taskForm.taskData;
  const { limits, acq_parameters } =
    state.taskForm.defaultParameters[type.toLowerCase()];
  const { parameters } = state.taskForm.taskData;

  if (Number.parseFloat(parameters.osc_range) === 0) {
    parameters.osc_range =
      state.taskForm.defaultParameters[
        type.toLowerCase()
      ].acq_parameters.osc_range;
  }

  const {
    cellA,
    cellAlpha,
    cellB,
    cellBeta,
    cellC,
    cellGamma,
    crystalSpaceGroup,
  } = state.sampleGrid.sampleList[state.queue.currentSampleID];

  return {
    path: `${state.login.rootPath}/${subdir}`,
    filename: fname,
    acqParametersLimits: limits,
    beamline: state.beamline,
    detector_mode_list: acq_parameters.detector_mode_list,
    components: state.uiproperties.sample_view_motors.components,
    osc_range,
    num_images,
    exp_time,
    transmission,
    initialValues: {
      ...parameters,
      beam_size: state.sampleview.currentAperture,
      resolution: toFixed(state, 'resolution'),
      energy: toFixed(state, 'energy'),
      transmission: toFixed(state, 'transmission'),
      osc_start: toFixed(state, 'diffractometer.omega', 'osc_start'),
      cellA,
      cellAlpha,
      cellB,
      cellBeta,
      cellC,
      cellGamma,
      crystalSpaceGroup,
    },
  };
})(DataCollectionForm);
