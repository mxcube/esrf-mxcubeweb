import { omit } from 'lodash/object';
import { without } from 'lodash/array';
import update from 'react/lib/update';


/**
*  Initial redux state for queue,
*
*  sampleList:  Object consisting of sample objects, each sample object have
*               the following peroperties:
*
*               code        Data Matrix/Barcode of sample
*               id          Unique id for the sample
*               location    Location of sample in sample changer
*               queueOrder  Order of sample in queue
*
*  manulMount: Sample with id is manually mounted if set is true
*
*/

const initialState = {
  queue: {},
  current: { node: null, collapsed: false, running: false },
  todo: { nodes: [], collapsed: false },
  history: { nodes: [], collapsed: false },
  searchString: '',
  queueStatus: 'QueueStopped',
  showRestoreDialog: false,
  queueRestoreState: {},
  sampleList: {},
  manualMount: { set: false, id: 1 },
};


/**
 * Initalizes the list of samples
 *
 * @param {Object} samples - sampleList object (key, sample data) pairs
 * @returns {Object} - initialized sampleList object
 *
 */
function initSampleList(samples) {
  const sampleList = Object.assign({}, samples);

  for (const key in sampleList) {
    if (key) {
      sampleList[key].queueOrder = -1;
    }
  }

  return sampleList;
}


/**
 * Recalculates sample queue order depedning on display order
 *
 * @param {Array} keys - keys to sort
 * @param {Object} gridOrder - Grid display order object containing (key, order) pairs
 * @param {Object} state - redux state object
 * @returns {Object} - sampleList object with queueOrder property updated
 *
 */
function recalculateQueueOrder(keys, gridOrder, state) {
  const sampleList = Object.assign({}, state.sampleList);
  const sortedOrder = Object.entries(gridOrder).sort((a, b) => a[1] > b[1]);

  let i = 0;
  for (const [key] of sortedOrder) {
    if (keys.includes(key)) {
      sampleList[key].queueOrder = i;
      i++;
    }
  }

  return sampleList;
}


export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SAMPLE_LIST': {
      return Object.assign({}, state, { sampleList: initSampleList(action.sampleList) });
    }
    case 'APPEND_TO_SAMPLE_LIST': {
      const sampleData = action.sampleData || {};
      Object.assign(sampleData, { collapsed: false, checked: false });

      const sampleList = { ...state.sampleList, [action.sampleID]: sampleData };

      return Object.assign({}, state, { sampleList });
    }
    case 'SET_SAMPLE_ORDER': {
      const reorderKeys = Object.keys(action.keys).map(key => (action.keys[key] ? key : ''));
      const sampleList = recalculateQueueOrder(reorderKeys, action.order, state);

      return Object.assign({}, state, { sampleList });
    }
    case 'SET_SAMPLES_INFO': {
      const samplesList = {};

      Object.keys(state.samplesList).forEach(key => {
        const sample = state.samplesList[key];
        let sampleInfo;
        for (sampleInfo of action.sampleInfoList) {
          if (sampleInfo.code) {
            // find sample with data matrix code
            if (sample.code === sampleInfo.code) {
              samplesList[key] = Object.assign({}, sample, { sample_info: sampleInfo });
              break;
            }
          } else {
            // check with sample changer location
            const containerLocation = sampleInfo.containerSampleChangerLocation;
            const sampleLocation = sampleInfo.sampleLocation;
            const limsLocation = `${containerLocation} : ${sampleLocation}`;

            if (sample.location === limsLocation) {
              samplesList[key] = Object.assign({}, sample, { sample_info: sampleInfo });
              break;
            }
          }
        }
        if (samplesList[key] === undefined) {
          samplesList[key] = Object.assign({}, sample, { sample_info: null });
        }
      });
      return Object.assign({}, state, { sampleList: samplesList });
    }

    case 'ADD_TASK_RESULT': {
      const tasks = Array.from(state.queue[action.sampleID]);

      // Find element with the right queueID (action.queueID) and update state
      // to action.state
      for (const task of tasks) {
        if (task.queueID === action.taskQueueID) {
          task.state = action.state;
        }
      }

      return Object.assign({}, state, { queue: { ...state.queue, [action.sampleID]: tasks } });
    }
    case 'SET_MANUAL_MOUNT': {
      const data = { manualMount: { ...state.manualMount, set: action.manual } };
      return Object.assign({}, state, data);
    }

    // Adding sample to queue
    case 'ADD_SAMPLE': {
      const sampleList = { ...state.sampleList };
      sampleList[action.sampleID].queueID = action.queueID;

      return Object.assign({}, state,
        {
          todo: { ...state.todo, nodes: state.todo.nodes.concat(action.sampleID) },
          queue: { ...state.queue, [action.sampleID]: [] },
          sampleList,
          manualMount: { ...state.manualMount, id: state.manualMount.id + 1 }
        }
      );
    }
        // Setting state
    case 'SET_QUEUE_STATUS':
      return {
        ...state,
        queueStatus: action.queueState
      };

        // Removing sample from queue
    case 'REMOVE_SAMPLE':
      return Object.assign({}, state,
        { todo: { ...state.todo, nodes: without(state.todo.nodes, action.sampleID) },
          queue: omit(state.queue, action.sampleID),
        });

        // Adding the new task to the queue
    case 'ADD_TASK': {
      // Create a copy of the tasks (array) for a sample with given queueID,
      // or an empty array if no tasks exists for sampleID
      let tasks = Array.from(state.queue[action.sampleID] || []);
      tasks = tasks.concat([{ type: action.parameters.Type,
                              label: action.parameters.Type.split(/(?=[A-Z])/).join(' '),
                              sampleID: action.sampleID,
                              queueID: action.queueID,
                              parameters: action.parameters,
                              state: 0,
                              collapsed: false,
                              checked: false
      }]);

      const queue = { ...state.queue, [action.sampleID]: tasks };
      return Object.assign({}, state, { queue });
    }
    // Removing the task from the queue
    case 'REMOVE_TASK': {
      const sampleID = action.task.sampleID;
      const tasks = without(state.queue[sampleID], action.task);
      return Object.assign({}, state, { queue: { ...state.queue, [sampleID]: tasks } });
    }
    case 'UPDATE_TASK': {
      const taskIndex = state.queue[action.sampleID].indexOf(action.taskData);
      const tasks = Array.from(state.queue[action.sampleID]);

      tasks[taskIndex] = { ...action.taskData,
                           type: action.parameters.Type,
                           parameters: action.parameters };

      return Object.assign({}, state, { queue: { ...state.queue, [action.sampleID]: tasks } });
    }
    // Run Mount, this will add the mounted sample to history
    case 'MOUNT_SAMPLE':
      return Object.assign({}, state,
        {
          current: { ...state.current, node: action.sampleID, running: false },
          todo: { ...state.todo, nodes: without(state.todo.nodes, action.sampleID) },
          history: { ...state.history,
                     nodes: (state.current.node ?
                             state.history.nodes.concat(state.current.node) : state.history.nodes)
          }
        }
      );
        //  UNMount, this will remove the sample from current and add it to history
    case 'UNMOUNT_SAMPLE':
      return Object.assign({}, state,
        {
          current: { node: null, collapsed: false, running: false },
          history: {
            ...state.history,
            nodes: (
              state.current.node ?
              state.history.nodes.concat(state.current.node) : state.history.nodes
            )
          }
        }
      );
        // Run Sample
    case 'RUN_SAMPLE':
      return Object.assign({}, state, { current: { ...state.current, running: true } });
    case 'TOGGLE_CHECKED': {
      const queue = Object.assign({}, state.queue);
      queue[action.sampleID][action.taskIndex].checked ^= true;

      return { ...state, queue };
    }
     // Collapse list
    case 'COLLAPSE_LIST':
      return {
        ...state,
        [action.list_name]: { ...state[action.list_name],
        collapsed: !state[action.list_name].collapsed
        }
      };
    // Toggle sample collapse flag
    case 'COLLAPSE_SAMPLE': {
      const sampleList = Object.assign({}, state.sampleList);
      sampleList[action.sampleID].collapsed = !sampleList[action.sampleID].collapsed;
      return { ...state, sampleList };
    }
    // Toggle task collapse flag
    case 'COLLAPSE_TASK': {
      const queue = Object.assign({}, state.queue);
      queue[action.sampleID][action.taskIndex].collapsed ^= true;

      return { ...state, queue };
    }
    // Change order of samples in queue on drag and drop
    case 'CHANGE_QUEUE_ORDER':

      return {
        ...state,
        [action.listName]: { ...state[action.listName],
                    nodes: update(state[action.listName].nodes, {
                      $splice: [
                            [action.oldIndex, 1],
                            [action.newIndex, 0, state[action.listName].nodes[action.oldIndex]]
                      ] }) }
      };

        // Change order of samples in queue on drag and drop
    case 'CHANGE_METHOD_ORDER':

      return {
        ...state,
        queue: { ...state.queue,
                [action.sampleId]: update(state.queue[action.sampleId], {
                  $splice: [
                    [action.oldIndex, 1],
                    [action.newIndex, 0, state.queue[action.sampleId][action.oldIndex]]
                  ]
                })
              }
      };

    case 'redux-form/CHANGE':
      if (action.form === 'search-sample') {
        return Object.assign({}, state, { searchString: action.value });
      }
      return state;
    case 'CLEAR_ALL':
      {
        return Object.assign({}, state, { ...initialState,
                                          manualMount: { set: state.manualMount.set, id: 1 } });
      }
    case 'SHOW_RESTORE_DIALOG':
      {
        return { ...state, showRestoreDialog: action.show, queueRestoreState: action.queueState };
      }
    case 'QUEUE_STATE':
      {
        return Object.assign({}, state, ...action.queueState);
      }
    case 'SET_INITIAL_STATUS':
      {
        return { ...state, rootPath: action.data.rootPath,
                           manualMount: { set: state.manualMount.set, id: 1 } };
      }
    default:
      return state;
  }
};
