import React from 'react';
import MXNavbarContainer from '../containers/MXNavbarContainer';
import TaskContainer from '../containers/TaskContainer';
import PleaseWaitDialog from '../containers/PleaseWaitDialog';
import ErrorNotificationPanel from '../containers/ErrorNotificationPanel';
import QueueRestoreDialog from '../containers/QueueRestoreDialog';
import './Main.css';

export default class Main extends React.Component {
  render() {
    return (
      <div>
        <TaskContainer />
        <PleaseWaitDialog />
        <ErrorNotificationPanel />
        <QueueRestoreDialog />
        <MXNavbarContainer location={this.props.location} />
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12 main-content">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
