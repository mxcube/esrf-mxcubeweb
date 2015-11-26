import ReactDOM from 'react-dom';
import React from 'react';
import classNames from 'classnames';
import "bootstrap-webpack!bootstrap-webpack/bootstrap.config.js";
import { Nav, Input, ButtonInput } from "react-bootstrap";

export default class LoginForm extends React.Component {
    propTypes: {
	proposal: React.PropTypes.object,
	signIn: React.PropTypes.func.isRequired,
	logOut: React.PropTypes.func.isRequired
    }

    signIn() {
        let proposal = this.refs.proposal.getValue();
        let password = this.refs.password.getValue();
        this.props.signIn(proposal, password);
    }

    logOut() {
        this.props.signOut()
    }

    render() {
        let login_input_form = "";
        if (this.props.proposal.Proposal) {
            login_input_form = (<div>
                                    <p className="navbar-text" style={{float: 'none', display: 'inline-block'}}>{this.props.proposal.Proposal.title}</p>
                                    <button className="btn btn-sm btn-info" style={{marginRight: '15px'}} onClick={this.logOut.bind(this)}>Log out</button>
                               </div>);
        } else {
            login_input_form = (<form className="navbar-form" action="">
                                    <Input bsSize="small" ref="proposal" type="text" name="proposal" placeholder="Proposal"/>{' '}
                                    <Input bsSize="small" ref="password" type="password" name="password" placeholder="Password"/>{' '}
                                    <ButtonInput bsSize="small" bsStyle="info" value="Sign in" onClick={this.signIn.bind(this)}/>
                                </form>);
        }
	return (<Nav right eventKey={0}>{login_input_form}</Nav>);
    }    
}

