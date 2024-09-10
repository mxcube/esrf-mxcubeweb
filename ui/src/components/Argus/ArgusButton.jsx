import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Eye from './Eye';
import { showArgusForm } from '../../actions/argus';

import styles from './Argus.module.css';

function ArgusButton(props) {
  const { onClick, recording, running, showArgusForm } = props;

  const handleButtonClick = () => {
    onClick();
    showArgusForm();
  };

  return (
    <button
      className={styles.argusButton}
      type="button"
      onClick={handleButtonClick}
    >
      <div className={`${styles.eyeContainer} me-2`}>
        {running || recording ? (
          <Eye recording={recording} />
        ) : (
          <span className="fas fa-solid fa-eye-slash" />
        )}
      </div>
      Argus
    </button>
  );
}

function mapStateToProps(state) {
  return {
    recording: state.general.showRecording,
    running:
      state.beamline.hardwareObjects.argus.attributes.processes_info
        .closable_running,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showArgusForm: bindActionCreators(showArgusForm, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArgusButton);
