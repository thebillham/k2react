import React, { Component } from 'react';
import './App.css';
import MainScreen from './MainScreen.js';
import K2SignInScreen from './K2SignInScreen.js';
import firebase, { auth, provider } from './firebase.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
    }
    this.whitelist = [
      'fTVM9JqKb8QNVlcXzmnTcpkyI2j1' // Ben Dodd
    ];

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
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  render() {
    return (
      <div className='wrapper'>
        { (auth.currentUser && (this.whitelist.indexOf(auth.currentUser.uid) > -1)) ?
          // < MainScreen />
          < MainScreen app = {this} />
          :
          < K2SignInScreen app = {this} />
        }
      </div>
    );
  }
}

export default App;
