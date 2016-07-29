import React from 'react';
import { Button, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap';

export default class SampleTaskButtons extends React.Component {
  constructor(props) {
    super(props);
    this.showCharacterisationForm = this.handleSubmit.bind(this, 'Characterisation');
    this.showDataCollectionForm = this.handleSubmit.bind(this, 'DataCollection');
  }


  handleSubmit(formName) {
    const samples = this.props.samples;
    this.props.showForm(formName, Object.keys(samples).filter(x => samples[x] === true), this.props.defaultParameters);
  }


  render() {
    return (
      <DropdownButton
        bsStyle="primary"
        title="Pipeline Mode"
      >
        <MenuItem eventKey="1">
          <Button className="btn-primary" onClick={this.showCharacterisationForm}>
            <Glyphicon glyph="plus" /> Characterisation
          </Button>
        </MenuItem>
        <MenuItem eventKey="2">
          <Button className="btn-primary" onClick={this.showDataCollectionForm}>
            <Glyphicon glyph="plus" /> Data collection
          </Button>
        </MenuItem>
      </DropdownButton>
    );
  }
}

