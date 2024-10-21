import React, { useEffect, useRef } from 'react';
import { Button, Card, Stack } from 'react-bootstrap';
import Draggable from 'react-draggable';

import { JSMpeg } from '../SampleView/jsmpeg.min.js';

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

export default function CameraCard(props) {
  const { camera, handleShowVideoCard, vIndex, isVisible } = props;

  const videoRef = useRef(null);

  useEffect(() => {
    let player;
    if (isVisible && videoRef.current) {
      player = new JSMpeg.Player(camera.url, {
        canvas: videoRef.current,
        decodeFirstFrame: false,
        preserveDrawingBuffer: false,
        protocols: [],
        autoplay: true,
      });
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [isVisible, camera.url]);

  if (!isVisible) {
    return null;
  }

  return (
    <div key={`draggable-video_${camera.label}`} className="draggableHandle">
      <Draggable defaultPosition={{ x: 200, y: 100  50 * vIndex }}>
        <Card className={styles.draggableHandle}>
          <Card.Header>
            <Stack direction="horizontal" gap={3}>
              <div className={styles.headerTitle}>{camera.label}</div>
              <div className="p-2 ms-auto">
                <Button
                  variant="outline-secondary"
                  onClick={() =>
                    handleImageClick(camera.url, camera.width, camera.height)
                  }
                  size="sm"
                >
                  <img src={pip} alt="PIP Icon" />
                </Button>
              </div>
              <div className="vr" />
              <div>
                <MdClose
                  color="red"
                  onClick={() => handleShowVideoCard(vIndex, false)}
                  size="1.5em"
                  className={styles.closeBtn}
                />
              </div>
            </Stack>
          </Card.Header>
          <Card.Body>
            {camera.format === 'jpg' ? (
              <img
                src={camera.url}
                alt={camera.label}
                width={camera.width}
                height={camera.height}
              />
            ) : (
              <canvas
                ref={videoRef}
                id={`video-${camera.label}`}
                style={{ width: '400px', height: '500px' }}
                alt={camera.label}
              />
            )}
          </Card.Body>
        </Card>
      </Draggable>
    </div>
  );
}