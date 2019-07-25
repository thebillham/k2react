import React, { Component } from "react";
import FirebaseAuth from "react-firebaseui/FirebaseAuth";
import firebase, { auth } from "../config/firebase.js";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../config/styles";
// import "../App.css";
import img_Logo from "../images/logo.png";
import ApiCalendar from "react-google-calendar-api";
import CircularProgress from "@material-ui/core/CircularProgress";
import { sendSlackMessage } from "../Slack";

class K2SignInScreen extends Component {
  constructor(props) {
    super(props);

    this.error = "";
    //
    // firebase.auth.GoogleAuthProvider.setCustomParameters({
    //   prompt: 'select_account'
    // });

    this.firebaseUIConfig = {
      signInFlow: "popup",
      signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          this.props.app.logIn();
          ApiCalendar.handleAuthClick();
          return false;
        },
        signInFailure: error => {
          console.error("** Firebase sign-in failed: ", error);
          this.loginFailed(error);
          return false;
        }
      }
    };
  }

  loginFailed(error) {
    this.setState(error);
  }

  render() {
    const { mode, classes, handleLogOut } = this.props;
    return (
      <div>
        <img
          className={classes.signInImage}
          src={img_Logo}
          alt="K2 Environmental Ltd"
        />
        { mode === 'initial' &&
          <div className={classes.signInFirebase}>
            {/* <Button onClick='handleSignIn()'>Sign In</Button> */}
            <FirebaseAuth
              uiConfig={this.firebaseUIConfig}
              firebaseAuth={auth}
            />
          </div>
        }
        { mode === 'loginFailed' &&
          <div className={classes.flexRowCentered}>
            <Button variant="outlined" className={classes.signInLogOut} onClick={handleLogOut}>
              Log Out {auth.currentUser.displayName}
            </Button>
            <div className={classes.signInWarning}>
              You have not been authorised to view this site. Please
              wait for the{" "}<a href="mailto:ben@k2.co.nz">site admin</a>{" "}to create your account.
            </div>
          </div>
        }
        { mode === 'loading' &&
          <CircularProgress className={classes.signInCircle} size={'330px'} thickness={2.5} />
        }
      </div>
    );
  }
}

export default withStyles(styles)(K2SignInScreen);
