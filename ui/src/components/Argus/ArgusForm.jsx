import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import ArgusProcessControl from './ArgusProcessControl';
import styles from './Argus.module.css';

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function ArgusForm(props) {
  const { argus, handleHide, sendExecuteCommand, show } = props;

  const [startState, setStartState] = useState({
    show: false,
    title: 'Default',
    initArgs: [],
  });
  const [sendCommandState, setSendCommandState] = useState({
    show: false,
    title: 'Default',
    commands: {},
  });

  const showStart = (title, initArgs) => {
    setStartState((prevState) => ({
      ...prevState,
      show: true,
      title,
      initArgs,
    }));
  };

  const showSendCommand = (title, commands) => {
    setSendCommandState((prevState) => ({
      ...prevState,
      show: true,
      title,
      commands,
    }));
  };

  const hideChildren = () => {
    setStartState((prevState) => ({
      ...prevState,
      show: false,
    }));
    setSendCommandState((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const handleCancel = () => {
    handleHide();
  };

  const { processes_info, last_response } = argus.attributes;
  const { status, error_message } = last_response;
  const capitalizedStatus = status ? `${capitalize(status)} !` : '';

  const runningButtons = (key) => {
    return (
      <div className={styles.processButtons}>
        <Button
          variant="primary"
          onClick={() =>
            showSendCommand(key, processes_info.running[key].commands)
          }
        >
          Send Command
        </Button>
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
    <div>
      <ArgusProcessControl
        state={startState}
        type="start"
        hide={hideChildren}
        sendExecuteCommand={sendExecuteCommand}
      />
      <ArgusProcessControl
        state={sendCommandState}
        type="sendCommand"
        hide={hideChildren}
        sendExecuteCommand={sendExecuteCommand}
      />
      <Modal
        id="ArgusModal"
        show={show && !startState.show && !sendCommandState.show}
        onHide={handleCancel}
      >
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
          {Object.keys(processes_info.available).length === 0 ? (
            <span>No available processes</span>
          ) : (
            <div className={styles.typesContainer}>
              {Object.keys(processes_info.available).map((type) => (
                <Button
                  className={styles.typeButton}
                  variant="outlined"
                  key={`${type}-typeButton`}
                  onClick={() =>
                    showStart(type, processes_info.available[type].args)
                  }
                >
                  {capitalize(type)}
                </Button>
              ))}
            </div>
          )}
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
    </div>
  );
}
