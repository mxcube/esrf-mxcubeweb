import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';

import CameraCard from './CameraCard';

function BeamlineCamera(props) {
  const { cameraSetup, argusStreams } = props;
  const [allCameras, setCameras] = useState(cameraSetup.components);

  const [showVideoModal, setShowVideoModal] = useState({});

  function handleShowVideoCard(key, value) {
    setShowVideoModal({ ...showVideoModal, [key]: value });
  }

  function renderVideo() {
    const DraggableElements = [];
    allCameras.forEach((camera, vIndex) => {
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

  useEffect(() => {
    const argusCameras = Object.entries(argusStreams).map(([key, value]) => {
      return {
        description: null,
        format: null,
        height: 1280,
        width: 960,
        label: key,
        url: `ws://localhost:9090/ws/${value}`,
      };
    });
    if (cameraSetup && cameraSetup.components.length > 0) {
      setCameras([...cameraSetup.components, ...argusCameras]);
    } else {
      setCameras(argusCameras);
    }
  }, [argusStreams, cameraSetup]);

  if (!allCameras || allCameras.length <= 0) {
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
          {allCameras.map((camera, cIndex) => [
            <Dropdown.Item
              key={`ddVideo_${camera.label}`}
              onClick={() => handleShowVideoCard(cIndex, true)}
            >
              {camera.label} <i className="fas fa-video" />
            </Dropdown.Item>,
            allCameras.length > cIndex + 1 && <Dropdown.Divider />,
          ])}
        </Dropdown.Menu>
      </Dropdown>
      {renderVideo()}
    </>
  );
}

function mapStateToProps(state) {
  return {
    argusStreams:
      state.beamline.hardwareObjects.argus.attributes.camera_streams,
  };
}

export default connect(mapStateToProps)(BeamlineCamera);
