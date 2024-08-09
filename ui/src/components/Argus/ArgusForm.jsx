import React from 'react';
import { Modal } from 'react-bootstrap';

export function ArgusForm(props) {
  const { handleHide, show } = props;

  const handleCancel = () => {
    handleHide();
  };

  return (
    <Modal id="ArgusModal" show={show} onHide={handleCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Argus Processes</Modal.Title>
      </Modal.Header>
      <Modal.Body />
      <Modal.Footer />
    </Modal>
  );
}
