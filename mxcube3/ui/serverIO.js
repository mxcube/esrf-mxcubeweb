import io from 'socket.io-client';
import { addLogRecord } from './actions/logger';
import {
  updatePointsPosition,
  saveMotorPositions,
  setCurrentPhase,
  setBeamInfo
} from './actions/sampleview';
import { setBeamlineAttrAction } from './actions/beamline';
import { setStatus, addTaskResultAction, addTaskAction, collapseTask } from './actions/queue';
import { setLoading } from './actions/general';


export default class ServerIO {

  constructor(store) {
    this.store = store;
    this.dispatch = store.dispatch;

    this.hwrSocket = null;
    this.loggingSocket = null;
    this.uiStateSocket = null;

    this.uiStorage = {
      setItem: (key, value) => {
        this.uiStateSocket.emit('ui_state_set', [key, value]);
      },
      getItem: (key, cb) => {
        this.uiStateSocket.emit('ui_state_get', key, (value) => { cb(false, value); });
      },
      removeItem: (key) => {
        this.uiStateSocket.emit('ui_state_rm', key);
      },
      getAllKeys: (cb) => {
        this.uiStateSocket.emit('ui_state_getkeys', null, (value) => { cb(false, value); });
      }
    };
  }

  listen(statePersistor) {
    this.uiStateSocket = io.connect(`http://${document.domain}:${location.port}/ui_state`);

    this.hwrSocket = io.connect(`http://${document.domain}:${location.port}/hwr`);

    this.loggingSocket = io.connect(`http://${document.domain}:${location.port}/logging`);

    this.uiStateSocket.on('state_update', (newState) => {
      statePersistor.rehydrate(JSON.parse(newState));
    });

    this.loggingSocket.on('log_record', (record) => {
      this.dispatch(addLogRecord(record));
    });

    this.hwrSocket.on('Motors', (record) => {
      this.dispatch(updatePointsPosition(record.CentredPositions));
      this.dispatch(saveMotorPositions(record.Motors));
      switch (record.Signal) {
        case 'minidiffPhaseChanged':
          this.dispatch(setCurrentPhase(record.Data));
          break;
        default:
      }
    });

    this.hwrSocket.on('beam_changed', (record) => {
      this.dispatch(setBeamInfo(record.Data));
    });

    this.hwrSocket.on('beamline_value_change', (data) => {
      this.dispatch(setBeamlineAttrAction(data));
    });

    this.hwrSocket.on('task', (record) => {
      const sampleDisplayData = this.store.getState().queue.displayData[record.sample];
      const taskCollapsed = sampleDisplayData.tasks[record.taskIndex].collapsed;

      if (record.state === 1 && !taskCollapsed) {
        this.dispatch(collapseTask(record.sample, record.taskIndex));
      } else if (record.state === 2 && taskCollapsed) {
        this.dispatch(collapseTask(record.sample, record.taskIndex));
      }
      this.dispatch(addTaskResultAction(record.sample, record.taskIndex, record.state,
                                        record.progress, record.limsResultData));
    });

    this.hwrSocket.on('add_task', (record) => {
      this.dispatch(addTaskAction(record));
    });

    this.hwrSocket.on('queue', (record) => {
      this.dispatch(setStatus(record.Signal));
    });

    this.hwrSocket.on('dialog', (record) => {
      switch (record.signal) {
        case 'wait':
          this.dispatch(setLoading(record.show, record.title, record.message, record.blocking));
          break;
        default:
      }
    });
  }
}
