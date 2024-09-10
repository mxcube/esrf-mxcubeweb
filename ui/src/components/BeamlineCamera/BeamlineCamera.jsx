import React, { useState } from 'react';
import { Button, Dropdown, Card, Stack } from 'react-bootstrap';
import Draggable from 'react-draggable';

import { MdClose } from 'react-icons/md';

import styles from './beamlineCamera.module.css';
import pip from './picture_in_picture.svg';

function handleImageClick(url, width, height) {
  window.open(
    url,
    'webcam',
    `toolbar=0,location=0,menubar=0,addressbar=0,height=${height},width=${width}`,
    'popup',
  );
}

export default function BeamlineCamera(props) {
  const { cameraSetup } = props;

  const [showVideoModal, setShowVideoModal] = useState({});

  function handleShowVideoCard(key, value) {
    setShowVideoModal({ ...showVideoModal, [key]: value });
  }

  function renderVideo() {
    const DraggableElements = [];
    cameraSetup.components.forEach((camera, vIndex) => {
      DraggableElements.push(
        <CameraCard
          camera={camera}
          vIndex={vIndex}
          handleShowVideoCard={handleShowVideoCard}
          isVisible={showVideoModal[vIndex]}
          key={`CameraCard_${camera.label}`}
        />,
      );
    });
    return DraggableElements;
  }

  if (!cameraSetup || cameraSetup.components.length <= 0) {
    return null;
  }

  return (
    <>
      <Dropdown
        title="Beamline Cameras"
        id="beamline-cameras-dropdown"
        variant="outline-secondary"
        autoClose="outside"
        key="beamline-cameras-dropdown"
      >
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          className="mb-1"
          style={{ width: '150px' }}
        >
          Beamline Cameras
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {cameraSetup.components.map((camera, cIndex) => [
            <Dropdown.Item
              key={`ddVideo_${camera.label}`}
              onClick={() => handleShowVideoCard(cIndex, true)}
            >
              {camera.label} <i className="fas fa-video" />
            </Dropdown.Item>,
            cameraSetup.components.length > cIndex + 1 && <Dropdown.Divider />,
          ])}
        </Dropdown.Menu>
      </Dropdown>
      {renderVideo()}
    </>
  );
}
