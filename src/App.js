import React, { Component } from "react";
import MainScreen from "./components/MainScreen";
import K2SignInScreen from "./components/K2SignInScreen";
import { auth } from "./config/firebase";
import { withRouter } from "react-router-dom";
import * as serviceWorker from "./registerServiceWorker";

require("dotenv").config();

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null
    };

    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn() {
    // auth.updateProfile();
    this.setState({});
  }

  logOut() {
    auth.signOut().then(() => {
      serviceWorker.unregister();
      this.setState({});
    });
  }

  componentWillMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  render() {
    return (
      <div className="wrapper">
        {auth.currentUser ? (
          <MainScreen key="mainscreen" />
        ) : (
          <K2SignInScreen mode="initial" />
        )}
      </div>
    );
  }
}

export default withRouter(App);
