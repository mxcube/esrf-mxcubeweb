import React, { useState } from 'react';
import Eye from './Eye';

import styles from './Argus.module.css';

export default function ArgusButton(props) {
  const [running, toggleProcesses] = useState(false);
  const [recording, toggleRecording] = useState(false);

  const handleButtonClick = () => {
    props.onClick();
    toggleProcesses(!running);
    toggleRecording(!recording);
  };

  return (
    <button
      className={styles.argusButton}
      type="button"
      onClick={handleButtonClick}
    >
      <div className={`${styles.eyeContainer} me-2`}>
        {running ? (
          <Eye recording={recording && running} />
        ) : (
          <span className="fas fa-solid fa-eye-slash" />
        )}
      </div>
      Argus
    </button>
  );
}
