import { GET_STAFF, AUTH_USER, GET_DOCUMENTS, EDIT_USER, GET_USER, GET_WFM } from "../constants/action-types";
import { auth } from '../config/firebase';
import {parseString}from 'xml2js';

import { usersRef, docsRef } from "../config/firebase";

export const fetchUserAuth = () => async dispatch => {
  auth.currentUser &&
  usersRef.doc(auth.currentUser.uid).get().then((doc) => {
    dispatch({ type: AUTH_USER, payload: { admin: doc.data().auth_admin }});
  });
};

export const fetchStaff = () => async dispatch => {
  usersRef.orderBy('name')
    .onSnapshot((querySnapshot) => {
      var users = [];
      querySnapshot.forEach((doc) => {
        let attrs = [];
        let jobs = [];
        let user = doc.data();
        usersRef.doc(doc.id).collection("attr")
          .onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              attrs.push(doc.data());
            });
          });
        usersRef.doc(doc.id).collection("myjobs")
          .onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              jobs.push(doc.data());
            });
          });
        user.uid = doc.id;
        user.attrs = attrs;
        user.jobs = jobs;
        users.push(user);
      });
      dispatch(
        { type: GET_STAFF, payload: users});
    });
}

export const fetchDocuments = () => async dispatch => {
  docsRef.orderBy('title')
    .onSnapshot((querySnapshot) => {
      var docs = [];
      querySnapshot.forEach((doc) => {
        docs.push(doc.data());
      });
      dispatch({
        type: GET_DOCUMENTS,
        payload: docs
      });
    });
};

export const editUser = ({userRef, target}) => dispatch => {
  usersRef.doc(userRef).set({
    [target.id]: target.value
  }, { merge: true });
};

export const getUser = userRef => async dispatch => {
  usersRef.doc(userRef).onSnapshot((doc) => {
    dispatch({
      type: GET_USER,
      payload: doc.data()
    });
  });
};


export const fetchWFM = () => async dispatch => {
  fetch('path')
  .then(xml => {
    parseString(xml, (err, result));
    return JSON.stringify(result);
  }).then(data => {
    let jobs = [];
    dispatch({
      type: GET_WFM,
      payload: jobs
    });
  });
};
