import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { hideRecording, showRecording } from '../../actions/argus';
import { capitalize } from './ArgusForm';

import styles from './Argus.module.css';

export default function ArgusProcessControl(props) {
  const { state, type, hide, sendExecuteCommand } = props;
  const { show, title, initArgs, commands } = state;
  const [formData, setFormData] = useState({});
  const [availableCommands, setAvailableCommands] = useState({
    selectedCommand: '',
  });

  const dispatch = useDispatch();

  const setCommandData = (args) => {
    const current_command_data = { wait_time: '5' };
    if (args) {
      args.forEach((arg) => {
        current_command_data[arg] = '';
      });
    }
    setFormData(current_command_data);
  };

  useEffect(() => {
    if (type === 'start') {
      const data = { name: '' };
      if (initArgs) {
        initArgs.forEach((arg) => {
          data[arg] = '';
        });
      }
      setFormData(data);
    } else if (type === 'sendCommand') {
      if (!commands) {
        setFormData({});
        setAvailableCommands({ selectedCommand: '' });
        return;
      }

      const command_data = Object.values(commands).reduce(
        (acc, { command, args }) => {
          if (!acc[command]) {
            acc[command] = [];
          }
          if (args) {
            acc[command].push(...args);
          }
          return acc;
        },
        {},
      );

      const keys = Object.keys(command_data);
      if (keys.length > 0) {
        setCommandData(command_data[keys[0]]);
        setAvailableCommands({ selectedCommand: keys[0], ...command_data });
      } else {
        setAvailableCommands({ selectedCommand: '' });
      }
    }
  }, [type, initArgs, commands]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCommandSelection = (e) => {
    setAvailableCommands((prevstate) => ({
      ...prevstate,
      selectedCommand: e.target.value,
    }));
    setCommandData(availableCommands[e.target.value]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const { name, wait_time, ...args } = formData;

    if (type === 'start') {
      sendExecuteCommand('argus', 'start_process', {
        name,
        type: title,
        args: Object.values(args),
      });
    } else if (type === 'sendCommand') {
      const { selectedCommand } = availableCommands;
      sendExecuteCommand('argus', 'manage_process', {
        name: title,
        command: selectedCommand,
        wait_time: Number.parseInt(wait_time),
        args: Object.values(args),
      });
      // this is a special call to show/end the recording point on the argus button
      // if a recording is started/ended
      if (selectedCommand === 'start' && title === 'Recorder') {
        dispatch(showRecording());
      } else if (selectedCommand === 'stop' && title === 'Recorder') {
        dispatch(hideRecording());
      }
    }

    hide();
  };

  return (
    <Modal id={`${type}-${title}`} show={show} onHide={hide}>
      <Modal.Header closeButton>
        <Modal.Title>{`${capitalize(type)}: ${capitalize(title)}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {type === 'sendCommand' ? (
          <Form.Select onChange={handleCommandSelection}>
            {Object.keys(availableCommands).map((key) =>
              key === 'selectedCommand' ? null : (
                <option key={`${key}-option`}>{key}</option>
              ),
            )}
          </Form.Select>
        ) : (
          <div />
        )}
        <Form onSubmit={onSubmit}>
          <div className={styles.commandContainer}>
            {Object.keys(formData).map((key) => (
              <Form.Label key={`${key}-label`}>
                {capitalize(key)}:
                <Form.Control
                  label={capitalize(key)}
                  name={key}
                  type="text"
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </Form.Label>
            ))}
          </div>
          <div className={styles.submitButtonContainer}>
            <Button type="submit">Submit</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
