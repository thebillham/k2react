import { GET_STAFF, AUTH_USER, HIDE_MODAL, SHOW_MODAL, GET_DOCUMENTS } from "../constants/action-types";
import { auth } from '../config/firebase';

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
        docs.push(doc);
      });
      dispatch({
        type: GET_DOCUMENTS,
        payload: docs
      });
    });
};

export const hideModal = () => ({ type: HIDE_MODAL })

export const showModal = ({ modalType, modalProps }) => ({ type: SHOW_MODAL, modalType, modalProps })
