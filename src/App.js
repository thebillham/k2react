import React, { Component } from 'react';
import MainScreen from './components/MainScreen';
import K2SignInScreen from './components/K2SignInScreen';
import { auth } from './config/firebase';
import { fetchStaff, fetchDocuments, fetchUserAuth, editUser, getUser, fetchWFM } from './actions/local';
import { hideModal, showModal, onUploadFile, handleModalChange, handleModalSubmit,
  handleTagAddition, handleTagDelete, } from './actions/modal';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

const mapDispatchToProps = dispatch => {
  return {
    fetchStaff: () => dispatch(fetchStaff()),
    fetchDocuments: () => dispatch(fetchDocuments()),
    fetchUserAuth: () => dispatch(fetchUserAuth()),
    editUser: ({userRef, target}) => dispatch(editUser(userRef, target)),
    getUser: userRef => dispatch(getUser(userRef)),
    fetchWFM: () => dispatch(fetchWFM()),

    hideModal: () => dispatch(hideModal()),
    showModal: document => dispatch(showModal(document)),
    onUploadFile: ({file, pathRef}) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: pathRef => dispatch(handleModalSubmit(pathRef)),

    handleTagAddition: addedTag => dispatch(handleTagAddition(addedTag)),
    handleTagDelete: removedTag => dispatch(handleTagDelete(removedTag)),
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

  componentWillMount() {
    this.props.fetchWFM();
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
