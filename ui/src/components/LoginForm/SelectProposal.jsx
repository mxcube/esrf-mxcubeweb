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
    this.selectProposal = this.selectProposal.bind(this);
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
  
  selectProposal() {
    this.props.selectProposal(this.state.pNumber);
  }

  getClassNameRowColorBySession(session) {
    if (session.is_scheduled_beamline && session.is_scheduled_time) {
      return 'white';
    }
    if (
      session.is_rescheduled &&
      session.is_scheduled_time &&
      session.is_scheduled_beamline
    ) {
      return 'bg-info';
    }

    if (!session.is_scheduled_beamline) {
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
    if (session.is_rescheduled) {
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
              { title: 'Portal', url: session.data_portal_URL },
              { title: 'A-Form', url: session.user_portal_URL },
              { title: 'Logbook', url: session.logbook_URL },
            ].map((item) => {
              return (
                <a
                  href={item.url}
                  className="p-1"
                  target="_blank"
                  rel="noreferrer"
                >
                  <LuExternalLink /> {item.title}
                </a>
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
                      variant={session.is_scheduled_time ? '' : 'warning'}
                    >
                      {this.getScheduledDateComponent(
                        session,
                        session.start_date,
                        session.start_time,
                      )}
                    </ListGroup.Item>

                    {session.is_rescheduled && (
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

                    {session.is_rescheduled && (
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
            {session.is_rescheduled && (
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
    const session = this.state.session;
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
              <div style={{ overflow: 'auto', height: '550px', padding: 10 }}>
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
          {session &&
            session.is_scheduled_beamline === true &&
            session.is_scheduled_time === false && (
              <Button
                variant="warning"
                className="float-end"
                disabled={this.state.pNumber === null}
                onClick={this.selectProposal}
              >
                Reschedule
              </Button>
            )}
          {session && session.is_scheduled_beamline === false && (
            <Button
              variant="danger"
              className="float-end"
              disabled // {this.state.pNumber === null}
              onClick={this.selectProposal}
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
              (session && session.is_scheduled_beamline === false) ||
              session.is_scheduled_time === false
            }
            onClick={this.selectProposal}
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
