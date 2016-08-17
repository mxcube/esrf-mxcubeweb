import React from 'react';
import 'bootstrap-webpack';
import SampleItem from './SampleItem';
import './app.less';
import cx from 'classnames';

export default class TodoTree extends React.Component {
  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
    this.collapse = this.props.collapse.bind(this, 'todo');
  }

  moveCard(dragIndex, hoverIndex) {
    this.props.changeOrder('todo', dragIndex, hoverIndex);
  }

  render() {
    const bodyClass = cx('list-body', {
      hidden: this.props.show
    });
    return (
            <div className="m-tree">
                <div className="list-head">
                    <span className="queue-root" onClick={this.collapse}>Queue to do</span>
                    <div className={this.props.list.length ? 'pull-right' : 'hidden'}>
                        <i className="fa fa-play"></i>
                        <i className="fa fa-pause"></i>
                        <i className="fa fa-stop"></i>
                    </div>
                    <hr className="queue-divider" />
                </div>
                <div className={bodyClass}>
                {this.props.list.map((sampleId, i) => {
                  const sampleData = this.props.sampleInformation[id];
                  return (
                        <SampleItem key={sampleId}
                          index={i}
                          id={sampleId}
                          text={`Vial ${sampleData.id}`}
                          moveCard={this.moveCard}
                          deleteSample={this.props.deleteSample}
                          mountSample={this.props.mountSample}
                          sampleId={sampleData.id}
                        />
                    );
                })}
                </div>
            </div>
        );
  }
}
