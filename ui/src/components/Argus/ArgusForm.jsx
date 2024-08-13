import React from 'react';
import { Button, Modal } from 'react-bootstrap';

import styles from './Argus.module.css';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function ArgusForm(props) {
  const { argus, handleHide, sendExecuteCommand, show } = props;

  const handleCancel = () => {
    handleHide();
  };

  const { processes_info, last_response } = argus.attributes;
  const { status, error_message } = last_response;
  const capitalizedStatus = `${status ? capitalize(status) : ''}! `;

  const runningButtons = (key) => {
    return (
      <div className={styles.processButtons}>
        <Button variant="primary">Send Command</Button>
        <Button
          variant="danger"
          onClick={() =>
            sendExecuteCommand('argus', 'stop_process', { name: [key] })
          }
        >
          Stop
        </Button>
      </div>
    );
  };

  return (
    <Modal id="ArgusModal" show={show} onHide={handleCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Argus Processes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.keys(processes_info.running).map((key) => (
          <div className={styles.processContainer} key={`${key}-process`}>
            <span>
              {key}
              {` (${processes_info.running[key].type})`}
            </span>
            {key === 'Error' ? <div /> : runningButtons(key)}
          </div>
        ))}
        <hr />
        <div className={styles.typesContainer}>
          {Object.keys(processes_info.available).map((type) => (
            <Button
              className={styles.typeButton}
              variant="outlined"
              key={`${type}-typeButton`}
            >
              {capitalize(type)}
            </Button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {last_response ? (
          <div>
            <span style={{ color: status === 'success' ? 'green' : 'red' }}>
              {capitalizedStatus}
            </span>
            <span>{error_message}</span>
          </div>
        ) : (
          <div />
        )}
      </Modal.Footer>
    </Modal>
  );
}
