import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

import { capitalize } from './ArgusForm';

import styles from './Argus.module.css';

// helpful function to keep types in forms
function convertToType(previousValue, item) {
  if (Number.isInteger(previousValue)) {
    return Number.parseInt(item, 10);
  } else if (
    !Number.isNaN(previousValue) &&
    Number.parseFloat(previousValue) === previousValue
  ) {
    return Number.parseFloat(item);
  } else if (typeof previousValue === 'object') {
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } else {
    return item; // Keep it as a string by default
  }
}

export default function ArgusProcessControl(props) {
  const { state, type, hide, sendExecuteCommand } = props;
  const { show, title, settings } = state;
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (type === 'start') {
      setFormData({ name: '' });
    } else if (type === 'settings') {
      setFormData(settings);
    }
  }, [type, settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      // keep the array structure if needed
      if (Array.isArray(prevData[name])) {
        return {
          ...prevData,
          [name]: value.split(',').map((item, index) => {
            return convertToType(prevData[name][index], item);
          }),
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const { name, ...args } = formData;

    if (type === 'start') {
      sendExecuteCommand('argus', 'start_process', {
        name,
        type: title,
      });
    } else if (type === 'settings') {
      sendExecuteCommand('argus', 'change_settings', {
        name: title,
        settings: args,
      });
    }

    hide();
  };

  return (
    <Modal id={`${type}-${title}`} show={show} onHide={hide}>
      <Modal.Header closeButton>
        <Modal.Title>{`${capitalize(type)}: ${capitalize(title)}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
