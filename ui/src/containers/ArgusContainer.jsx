import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ArgusForm } from '../components/Argus/ArgusForm';
import { showArgusForm, hideArgusForm } from '../actions/argus';
import { executeCommand } from '../actions/beamline';

function ArgusContainer(props) {
  return (
    <ArgusForm
      show={props.showForm}
      handleHide={props.hideArgusForm}
      argus={props.argus}
      sendExecuteCommand={props.sendExecuteCommand}
    />
  );
}

function mapStateToProps(state) {
  return {
    showForm: state.general.showArgusForm,
    argus: state.beamline.hardwareObjects.argus,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showArgusForm: bindActionCreators(showArgusForm, dispatch),
    hideArgusForm: bindActionCreators(hideArgusForm, dispatch),
    sendExecuteCommand: bindActionCreators(executeCommand, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArgusContainer);
