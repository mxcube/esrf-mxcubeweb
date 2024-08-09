import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ArgusForm } from '../components/Argus/ArgusForm';
import { showArgusForm, hideArgusForm } from '../actions/argus';

function ArgusContainer(props) {
  return <ArgusForm show={props.showForm} handleHide={props.hideArgusForm} />;
}

function mapStateToProps(state) {
  return {
    showForm: state.general.showArgusForm,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showArgusForm: bindActionCreators(showArgusForm, dispatch),
    hideArgusForm: bindActionCreators(hideArgusForm, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArgusContainer);
