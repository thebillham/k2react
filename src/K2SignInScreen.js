import React, { Component } from 'react';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
import firebase, { auth, provider } from './firebase.js';
import './App.css';
import img_Logo from './images/logo.png';
import Button from '@material-ui/core/Button';

export default class K2SignInScreen extends Component {

  constructor(props) {
    super(props);

    this.error = '';
    //
    // firebase.auth.GoogleAuthProvider.setCustomParameters({
    //   prompt: 'select_account'
    // });

    this.firebaseUIConfig = {
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
            this.props.app.logIn();
            return false;
        },
        signInFailure: (error) => {
          console.error("** Firebase sign-in failed: ", error);
          this.loginFailed(error);
          return false;
        },
      }
    };
  }

  loginFailed(error) {
    this.setState(( error ));
  }

  render() {
    const style_background = {
      width: '100%',
      height: '100%',
    };
    const style_background_outer = {
        backgroundColor: '#f6f6f6',
        pointerEvents: 'none',
     };
    const style_image = {
        height: 'auto',
        pointerEvents: 'none',
     };

    return (
      <div className="AppScreen K2SignInScreen">
        <div className="background">
          <div className='appBg containerMinHeight elBackground' style={style_background_outer}>
            <div style={style_background} />

          </div>

        </div>
        <div className="screenFgContainer">
          <div className="foreground">
            <img className='elImage' style={style_image} src={img_Logo} alt=""  />
            <div className='elFirebaseLogin'>
              {/* <Button onClick='handleSignIn()'>Sign In</Button> */}
              <FirebaseAuth uiConfig={this.firebaseUIConfig} firebaseAuth={auth}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
