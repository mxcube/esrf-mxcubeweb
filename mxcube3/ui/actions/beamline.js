import fetch from 'isomorphic-fetch';


// The different states a beamline attribute can assume.
export const STATE = {
  IDLE: 'READY',
  BUSY: 'MOVING',
  ABORT: 'UNUSABLE'
};


// Action types
export const BL_ATTR_SET = 'BL_ATTR_SET';
export const BL_ATTR_GET_ALL = 'BL_ATTR_GET_ALL';
export const BL_ATTR_SET_STATE = 'BL_ATTR_SET_STATE';
export const BL_ATTR_MOV_SET_STATE = 'BL_ATTR_MOV_SET_STATE';
export const BL_ATTR_ACT_SET_STATE = 'BL_ATTR_ACT_SET_STATE';
export const BL_MACH_INFO = 'BL_MACH_INFO';
export const BL_ATTR_MOV_SET = 'BL_ATTR_MOV_SET';
export const BL_ATTR_ACT_SET = 'BL_ATTR_ACT_SET';

export function setBeamlineAttrAction(data) {
  return { type: BL_ATTR_SET, data };
}

export function setBeamlineMovAttrAction(data) {
  return { type: BL_ATTR_MOV_SET, data };
}

export function setBeamlineActAttrAction(data) {
  return { type: BL_ATTR_ACT_SET, data };
}

export function getBeamlineAttrsAction(data) {
  return { type: BL_ATTR_GET_ALL, data };
}

export function setMachInfo(info) {
  return { type: BL_MACH_INFO, info };
}

export function busyStateAction(name) {
  return {
    type: BL_ATTR_SET_STATE,
    data: { name, state: STATE.BUSY }
  };
}

export function busyMovStateAction(name) {
  return {
    type: BL_ATTR_MOV_SET_STATE,
    data: { name, state: STATE.BUSY }
  };
}

export function busyActStateAction(name) {
  return {
    type: BL_ATTR_ACT_SET_STATE,
    data: { name, state: STATE.BUSY }
  };
}


export function sendGetAllAttributes() {
  const url = 'mxcube/api/v0.1/beamline';

  return (dispatch) => {
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      credentials: 'include'
    }).then(response => response.json())
          .then(data => {
            dispatch(getBeamlineAttrsAction(data));
          }, () => {
            throw new Error(`GET ${url} failed`);
          });
  };
}


export function sendSetAttribute(name, value, type) {
  const url = `mxcube/api/v0.1/beamline/${name}`;

  return (dispatch) => {
    if (type === 'movable') {
      dispatch(busyMovStateAction(name));
    } else if (type === 'actuator') {
      dispatch(busyActStateAction(name));
    } else {
      dispatch(busyStateAction(name));
    }
    fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, value })
    }).then(response => response.json())
          .then(data => {
            if (data.type === 'actuator') {
              dispatch(setBeamlineActAttrAction(data));
            } else if (data.type === 'movable') {
              dispatch(setBeamlineMovAttrAction(data));
            } else {
              dispatch(setBeamlineAttrAction(data));
            }
          }, () => {
            throw new Error(`PUT ${url} failed`);
          });
  };
}


export function sendAbortCurrentAction(name) {
  return () => {
    fetch(`mxcube/api/v0.1/beamline/${name}/abort`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      credentials: 'include'
    });
  };
}

