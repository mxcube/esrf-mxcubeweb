import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { doLogin, getLoginInfo } from '../actions/login';
import MXNavbar from '../components/MXNavbar/MXNavbar'
import { doSignOut } from '../actions/login'
import { sendState, getState } from '../actions/queue'



class MXNavbarContainer extends Component {

  render() {
    return (
    	<MXNavbar userInfo={this.props.userInfo} signOut={this.props.signOut} loggedIn={this.props.loggedIn} />
    )
  }
}


function mapStateToProps(state) {
        return { 
            userInfo: state.login.data,
            loggedIn: state.login.loggedIn,
            queueState: state.queue,
            sampleGridState: state.samples_grid
        }
}

function mapDispatchToProps(dispatch) {
    return {
        signOut: () => dispatch(doSignOut()),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MXNavbarContainer);
