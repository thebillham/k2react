import { HIDE_MODAL, SHOW_MODAL, EDIT_MODAL, EDIT_MODAL_DOC,
  ADD_TAG, DELETE_TAG, RESET_MODAL,
 } from "../constants/action-types";

import { storage } from "../config/firebase";
import store from '../store';

export const resetModal = () => dispatch => {
  dispatch({ type: RESET_MODAL });
}

export const hideModal = () => dispatch => {
  dispatch({
    type: HIDE_MODAL
  });
  dispatch({
    type: RESET_MODAL
  });
}

export const showModal = ({ modalType, modalProps }) => dispatch => {
  dispatch({
    type: SHOW_MODAL,
    modalType,
    modalProps
  });
}

export const onUploadFile = ({ file, storagePath }) => async dispatch => {
  dispatch({
    type: EDIT_MODAL,
    payload: {
      isUploading: true,
      uploadProgress: 0,
    }
  });
  var path = storagePath + '_' + parseInt(Math.floor(Math.random() * Math.floor(1000))) + '_' + file.name;
  var uploadTask = storage.ref(path).put(file);
  uploadTask.on('state_changed',
    (snapshot) => {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      dispatch({
        type: EDIT_MODAL,
        payload: {
          uploadProgress: progress,
        }
      });
    }, (error) => {
    console.log(error.code);
  }, (snapshot) => {
    uploadTask.snapshot.ref.getDownloadURL().then((url) => {
      dispatch({
        type: EDIT_MODAL_DOC,
        payload: {
          fileRef: path,
          fileUrl: url,
        }
      });
      dispatch({
        type: EDIT_MODAL,
        payload: {
          isUploading: false,
          progress: 100,
        }
      });
    });
  });
}

export const handleModalChange = target => dispatch => {
  let val;
  if (target.id == 'course' || target.id == 'unit' || target.id == 'class' ) val = target.value.split(','); else val = target.value;
  dispatch({
    type: EDIT_MODAL_DOC,
    payload: {[target.id]: val,}
  });
}

export const handleModalSubmit = ({ doc, pathRef }) => dispatch => {
  let uid;
  if (doc.uid) {
    uid = doc.uid;
    pathRef.doc(doc.uid).set(doc);
  } else {
    uid = doc.type + parseInt(Math.floor(Math.random() * Math.floor(1000)));
  }
  doc.uid = uid;
  pathRef.doc(uid).set(doc);
  dispatch({type: HIDE_MODAL});
}

export const handleTagAddition = addedTag => dispatch => {
  dispatch({
    type: ADD_TAG,
    payload: addedTag
  });
}

export const handleTagDelete = removedTag => dispatch => {
  dispatch({
    type: DELETE_TAG,
    payload: removedTag
  })
}
