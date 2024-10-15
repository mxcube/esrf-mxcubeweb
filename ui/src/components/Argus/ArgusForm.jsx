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
  });

  const [settingsState, setSettingsState] = useState({
    show: false,
    title: 'Default',
    settings: {},
  });

  const showStart = (title) => {
    setStartState((prevState) => ({
      ...prevState,
      show: true,
      title,
    }));
  };

  const showSettingsState = (title, settings) => {
    setSettingsState((prevState) => ({
      ...prevState,
      show: true,
      title,
      settings,
    }));
  };

  const hideChildren = () => {
    setStartState((prevState) => ({
      ...prevState,
      show: false,
    }));
    setSettingsState((prevState) => ({
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
        {Object.values(processes_info.running[key].commands).map((element) => {
          if (key === 'Recorder') {
            const { recording } = processes_info.running[key].settings;
            if (
              (element === 'start' && recording) ||
              (element === 'stop' && !recording)
            ) {
              return null;
            }
          }
          return (
            <Button
              key={`${key}-command-${element}`}
              variant="primary"
              onClick={() =>
                sendExecuteCommand('argus', 'manage_process', {
                  name: key,
                  command: element,
                })
              }
            >
              {capitalize(element)}
            </Button>
          );
        })}
        <Button
          variant="secondary"
          onClick={() =>
            showSettingsState(key, processes_info.running[key].settings)
          }
        >
          <i className="fa fa-cog" />
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            sendExecuteCommand('argus', 'stop_process', { name: key })
          }
        >
          X
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
        state={settingsState}
        type="settings"
        hide={hideChildren}
        sendExecuteCommand={sendExecuteCommand}
      />
      <Modal
        id="ArgusModal"
        show={show && !startState.show && !settingsState.show}
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
              {Object.values(processes_info.available).map((type) => (
                <Button
                  className={styles.typeButton}
                  variant="outlined"
                  key={`${type}-typeButton`}
                  onClick={() => showStart(type)}
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
