import React, { Component } from 'react';
import MainScreen from './components/MainScreen.js';
import K2SignInScreen from './components/K2SignInScreen.js';
import { auth } from './config/firebase.js';
import { fetchStaff, fetchDocuments, fetchUserAuth } from './actions/index';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

const mapDispatchToProps = dispatch => {
  return {
    fetchStaff: () => dispatch(fetchStaff()),
    fetchDocuments: () => dispatch(fetchDocuments()),
    fetchUserAuth: () => dispatch(fetchUserAuth()),
  };
};

const mapStateToProps = state => {
  return { state };
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
    }

    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn() {
    this.setState({});
  }

  logOut() {
    auth.signOut()
      .then(() => {
        this.setState({});
      });
    }

  componentDidMount() {
    this.props.fetchStaff();
    this.props.fetchDocuments();
    this.props.fetchUserAuth();
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  render() {
    return (
      <div className='wrapper'>
        { auth.currentUser ?
          < MainScreen />
          :
          < K2SignInScreen />
        }
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
