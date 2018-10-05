import React, { Component } from 'react';
import './App.css';
import MainScreen from './components/MainScreen.js';
import K2SignInScreen from './components/K2SignInScreen.js';
import firebase, { auth, provider } from './firebase/firebase.js';
import { IntlProvider } from 'react-intl';

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
      <IntlProvider locale='en-AUS'>
        <div className='wrapper'>
          { (auth.currentUser && (this.whitelist.indexOf(auth.currentUser.uid) > -1)) ?
            // < MainScreen />
            < MainScreen app = {this} />
            :
            < K2SignInScreen app = {this} />
          }
        </div>
      </IntlProvider>
    );
  }
}

export default App;
