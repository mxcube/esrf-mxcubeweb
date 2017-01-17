import { combineReducers } from 'redux';
import login from './login';
import queue from './queue';
import queueGUI from './queueGUI';
import sampleGrid from './sampleGrid';
import sampleChanger from './sampleChanger';
import taskForm from './taskForm';
import sampleview from './sampleview';
import general from './general';
import beamline from './beamline';
import logger from './logger';
import contextMenu from './contextMenu';
import remoteAccess from './remoteAccess';
import points from './points';
import { reducer as formReducer } from 'redux-form';

const mxcubeReducer = combineReducers({
  login,
  queue,
  sampleGrid,
  sampleChanger,
  taskForm,
  sampleview,
  logger,
  general,
  beamline,
  remoteAccess,
  contextMenu,
  points,
  queueGUI,
  form: formReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'SIGNOUT') {
    state = undefined; // eslint-disable-line no-param-reassign
  }

  return mxcubeReducer(state, action);
};

export default rootReducer;

