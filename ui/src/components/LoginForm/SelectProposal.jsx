import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  Modal,
  Button,
  Tabs,
  Tab,
  ListGroup,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import styles from './SelectProposal.module.css';
import { LuExternalLink } from 'react-icons/lu';

class SelectProposal extends React.Component {
  constructor(props) {
    super(props);
    this.onClickRow = this.onClickRow.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.state = {
      pId: 0,
      pNumber: null,
      session: null,
    };
  }

  onClickRow(prop) {
    this.setState({
      session: prop,
      pId: prop.session_id,
      pNumber: prop.session_id, //prop.code + prop.number,
    });
  }

  handleCancel() {
    this.props.handleHide();
  }

  getClassNameRowColorBySession(session) {
    if (session.isScheduledBeamline && session.isScheduledTime) {
      return 'white';
    }
    if (
      session.isRescheduled &&
      session.isScheduledTime &&
      session.isScheduledBeamline
    ) {
      return 'bg-info';
    }

    if (!session.isScheduledBeamline) {
      return 'bg-danger';
    }

    return 'bg-warning';
  }

  getDateComponent(startDate, startTime) {
    return (
      <>
        <span className={styles.date}>{startDate}</span>
        <span className={styles.time}>{startTime}</span>
      </>
    );
  }

  getScheduledDateComponent(session, startDate, startTime) {
    if (session.isRescheduled) {
      return <del>{this.getDateComponent(startDate, startTime)}</del>;
    }
    return this.getDateComponent(startDate, startTime);
  }

  getLinkBySession(session) {
    return (
      <Col>
        <ListGroup variant="flush">
          <ListGroup.Item variant="dark">Shortcuts</ListGroup.Item>
          <ListGroup.Item>
            {[
              { title: 'Portal', url: session.dataPortalURL },
              { title: 'A-Form', url: session.userPortalURL },
              { title: 'Logbook', url: session.logbookURL },
            ].map((item) => {
              return (
                <small key={item.url}>
                  <a
                    href={item.url}
                    className="p-1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LuExternalLink /> {item.title}
                  </a>
                </small>
              );
            })}
          </ListGroup.Item>
        </ListGroup>
      </Col>
    );
  }

  getSessionTable(sessions, params) {
    const { showBeamline } = params;

    return sessions.map((session) => {
      const variant =
        this.state.pId === session.session_id ? 'secondary' : 'light';
      return (
        <Card
          bg={variant}
          text={variant.toLowerCase() === 'light' ? 'dark' : 'white'}
          key={session.session_id}
          className="mt-1 p-1"
          onClick={() => this.onClickRow(session)}
        >
          <Card.Body>
            <Card.Title>
              <span style={{ fontWeight: 'bold' }}>
                {session.code + session.number}
              </span>
              <small className="px-2">{session.title}</small>
            </Card.Title>

            <Container>
              <Row>
                <Col>
                  <ListGroup variant="flush">
                    <ListGroup.Item variant="dark"> Start Date</ListGroup.Item>
                    <ListGroup.Item
                      variant={session.isScheduledTime ? '' : 'warning'}
                    >
                      {this.getScheduledDateComponent(
                        session,
                        session.start_date,
                        session.start_time,
                      )}
                    </ListGroup.Item>

                    {session.isRescheduled && (
                      <ListGroup.Item>
                        {this.getDateComponent(
                          session.actual_start_date,
                          session.actual_start_time,
                        )}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>

                <Col>
                  <ListGroup variant="flush">
                    <ListGroup.Item variant="dark">End Date</ListGroup.Item>
                    <ListGroup.Item
                      variant={session.is_scheduled_time ? '' : 'warning'}
                    >
                      {this.getScheduledDateComponent(
                        session,
                        session.end_date,
                        session.end_time,
                      )}
                    </ListGroup.Item>

                    {session.isRescheduled && (
                      <ListGroup.Item>
                        {this.getDateComponent(
                          session.actual_end_date,
                          session.actual_end_time,
                        )}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>
                {showBeamline && (
                  <Col>
                    <ListGroup variant="flush">
                      <ListGroup.Item variant="dark">Beamline</ListGroup.Item>
                      <ListGroup.Item
                        variant={session.is_scheduled_beamline ? '' : 'danger'}
                      >
                        {session.beamline_name}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                )}

                {this.getLinkBySession(session)}
              </Row>
            </Container>
            {session.isRescheduled && (
              <Card.Footer>
                <p className="text-info">Session has been rescheduled</p>
              </Card.Footer>
            )}
          </Card.Body>
        </Card>
      );
    });
  }

  render() {
    const sortedlist = this.props.data.proposalList.sort((a, b) =>
      a.number < b.number ? 1 : -1,
    );

    return (
      <Modal
        show={this.props.show}
        backdrop="static"
        onHide={this.handleCancel}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select a session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="scheduled" id="scheduled-tab">
            <Tab eventKey="scheduled" title="Scheduled">
              <div style={{ overflow: 'auto', height: '550px' }}>
                {this.getSessionTable(
                  sortedlist.filter(
                    (s) => s.is_scheduled_beamline && s.is_scheduled_time,
                  ),
                  { showBeamline: false },
                )}
              </div>
            </Tab>
            <Tab eventKey="non-scheduled" title="Non scheduled">
              <div style={{ overflow: 'auto', height: '550px' }}>
                {this.getSessionTable(
                  sortedlist.filter(
                    (s) => !(s.is_scheduled_beamline && s.is_scheduled_time),
                  ),
                  { showBeamline: true },
                )}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          {this.state.session &&
            this.state.session.isScheduledBeamline === true &&
            this.state.session.isScheduledTime === false && (
              <Button
                variant="warning"
                className="float-end"
                disabled={this.state.pNumber === null}
                onClick={this.sendProposal}
              >
                Reschedule
              </Button>
            )}
          {this.state.session &&
            this.state.session.isScheduledBeamline === false && (
              <Button
                variant="danger"
                className="float-end"
                disabled // {this.state.pNumber === null}
                onClick={this.sendProposal}
              >
                Move here
              </Button>
            )}
          <Button variant="outline-secondary" onClick={this.handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="float-end"
            disabled={
              this.state.pNumber === null ||
              (this.state.session &&
                this.state.session.isScheduledBeamline === false) ||
              this.state.session.isScheduledTime === false
            }
            onClick={this.sendProposal}
          >
            Select Proposal
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const SelectProposalForm = reduxForm({
  form: 'proposals',
})(SelectProposal);

export default connect((state) => ({
  initialValues: { ...state.login.data },
}))(SelectProposalForm);
