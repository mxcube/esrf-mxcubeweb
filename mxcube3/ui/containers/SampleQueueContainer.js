import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SampleQueueSearch from '../components/SampleQueue/SampleQueueSearch';
import CurrentTree from '../components/SampleQueue/CurrentTree';
import TodoTree from '../components/SampleQueue/TodoTree';
import HistoryTree from '../components/SampleQueue/HistoryTree';
import * as QueueActions from '../actions/queue';
import * as SampleActions from '../actions/samples_grid';
import * as SampleViewActions from '../actions/sampleview';
import * as TaskFormActions from '../actions/taskForm';
import { showTaskForm } from '../actions/taskForm';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';



function mapStateToProps(state) {

  return {
    searchString : state.queue.searchString,
    current : state.queue.current,
    todo: state.queue.todo,
    queueStatus: state.queue.queueStatus,
    history: state.queue.history,
    queue: state.queue.queue,
    sampleInformation: state.samples_grid.samples_list,
    checked: state.queue.checked,
    lookup: state.queue.lookup,
    select_all: state.queue.selectAll,
    mounted : state.samples_grid.manualMount.set,
    collapsedSamples : state.queue.collapsedSample
  };
}

function mapDispatchToProps(dispatch) {
  return {
    queueActions: bindActionCreators(QueueActions, dispatch),
    sampleActions : bindActionCreators(SampleActions, dispatch),
    sampleViewActions : bindActionCreators(SampleViewActions, dispatch),
    showForm : bindActionCreators(showTaskForm, dispatch)
  };
}


@DragDropContext(HTML5Backend)
@connect(mapStateToProps, mapDispatchToProps)
export default class SampleQueueContainer extends React.Component {


  filterList(list) {
    let listFiltered = list.filter((queue_id) => {
       let sampleData = this.props.sampleInformation[this.props.lookup[queue_id]];
       return (this.props.searchString === '' || sampleData.id.indexOf(this.props.searchString) > -1);
     });
    return (listFiltered);
  }


  render() {
    const { checked, lookup, todo, history, current, sampleInformation, queue, mounted, collapsedSamples, showForm, queueStatus } = this.props;
    const { sendToggleCheckBox, sendDeleteSample, sendRunSample, sendPauseQueue, sendUnpauseQueue, sendStopQueue, sendMountSample, sendUnmountSample, changeOrder, changeTaskOrder, collapseList, collapseSample } = this.props.queueActions;
    const { sendDeleteSampleTask } = this.props.sampleActions;

    return (

      <div>
            <div className="queue-body">
                <CurrentTree
                  changeOrder={changeTaskOrder}
                  show={current.collapsed}
                  collapse={collapseList}
                  mounted={current.node}
                  sampleInformation={sampleInformation}
                  queue={queue}
                  lookup={lookup}
                  toggleCheckBox={sendToggleCheckBox}
                  checked={checked}
                  deleteTask={sendDeleteSampleTask}
                  run={sendRunSample}
                  pause={sendPauseQueue}
                  unpause={sendUnpauseQueue}
                  stop={sendStopQueue}
                  showForm={showForm}
                  unmount={sendUnmountSample}
                  queueStatus={queueStatus}
                />
                <HistoryTree show={history.collapsed} collapse={collapseList} collapsedSamples={collapsedSamples} list={this.filterList(history.nodes)} sampleInformation={sampleInformation} queue={queue} lookup={lookup} collapseSample={collapseSample} />
            </div>
      </div>
    );
  }
}
