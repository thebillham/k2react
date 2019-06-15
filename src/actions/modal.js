import {
  ADD_TAG,
  DELETE_TAG,
  EDIT_MODAL_DOC_COMMENT,
  EDIT_MODAL_DOC,
  EDIT_MODAL_DOC_STEPS,
  EDIT_MODAL_DOC_SAMPLES,
  EDIT_MODAL_GLOSSARY,
  EDIT_MODAL_SAMPLE,
  EDIT_MODAL,
  GET_SAMPLES,
  RESET_MODAL,
  RESET_MODAL_SECONDARY,
  SET_MODAL_ERROR,
  SHOW_MODAL,
  SHOW_MODAL_SECONDARY,
} from "../constants/action-types";

import { storage, cocsRef, asbestosSamplesRef } from "../config/firebase";

export const resetModal = () => dispatch => {
  dispatch({ type: RESET_MODAL });
};

export const hideModal = () => dispatch => {
  dispatch({
    type: RESET_MODAL
  });
};

export const hideModalSecondary = () => dispatch => {
  dispatch({
    type: RESET_MODAL_SECONDARY
  });
};

export const showModal = ({ modalType, modalProps }) => dispatch => {
  dispatch({
    type: SHOW_MODAL,
    modalType,
    modalProps
  });
};

export const showModalSecondary = ({ modalType, modalProps }) => dispatch => {
  dispatch({
    type: SHOW_MODAL_SECONDARY,
    modalType,
    modalProps,
  })
}

export const onUploadFile = ({ file, storagePath }) => async dispatch => {
  if (!file) return;
  dispatch({
    type: EDIT_MODAL,
    payload: {
      isUploading: true,
      uploadProgress: 0
    }
  });
  var path =
    storagePath +
    "_" +
    parseInt(Math.floor(Math.random() * Math.floor(1000))) +
    "_" +
    file.name;
  var uploadTask = storage.ref(path).put(file);
  uploadTask.on(
    "state_changed",
    snapshot => {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      dispatch({
        type: EDIT_MODAL,
        payload: {
          uploadProgress: progress
        }
      });
    },
    error => {
      console.log(error.code);
    },
    snapshot => {
      uploadTask.snapshot.ref.getDownloadURL().then(url => {
        dispatch({
          type: EDIT_MODAL_DOC,
          payload: {
            fileRef: path,
            fileUrl: url
          }
        });
        dispatch({
          type: EDIT_MODAL,
          payload: {
            isUploading: false,
            progress: 100
          }
        });
      });
    }
  );
};

export const setModalError = error => dispatch => {
  dispatch({
    type: SET_MODAL_ERROR,
    payload: error
  });
};

export const handleModalChange = target => dispatch => {
  if (target.id === 'samples') {
    dispatch({
      type: EDIT_MODAL_DOC_SAMPLES,
      payload: target.value
    });
    dispatch({
      type: GET_SAMPLES,
      cocUid: target.cocUid,
      payload: target.value,
    });
  } else if (target.id === 'comment') {
    dispatch({
      type: EDIT_MODAL_DOC_COMMENT,
      payload: target.value,
    })
  } else {
    dispatch({
      type: EDIT_MODAL_DOC,
      payload: { [target.id]: target.value }
    });
  }
};

export const handleModalChangeStep = target => dispatch => {
  dispatch({
    type: EDIT_MODAL_DOC_STEPS,
    payload: target
  });
};

export const handleGlossaryChange = (number, type, value) => dispatch => {
  dispatch({
    type: EDIT_MODAL_GLOSSARY,
    payload: {
      number: number + 1,
      type: type,
      value: value
    }
  });
};

export const handleModalSubmit = ({ doc, pathRef, docid }) => dispatch => {
  let uid;
  if (docid) {
    pathRef.doc(docid).set({ ...doc, uid: docid });
  } else if (doc.uid) {
    uid = doc.uid;
    pathRef.doc(doc.uid).set(doc);
  } else {
    // console.log(doc.type);
    uid = doc.type + parseInt(Math.floor(Math.random() * Math.floor(1000)));
    // console.log(uid);
    pathRef.doc(uid).set({ ...doc, uid: uid });
  }
  dispatch({ type: RESET_MODAL });
};

export const handleModalSubmitToDoc = ({ doc, pathRef }) => dispatch => {
  pathRef.set(doc);
  dispatch({ type: RESET_MODAL });
};

export const handleTagAddition = addedTag => dispatch => {
  dispatch({
    type: ADD_TAG,
    payload: addedTag
  });
};

export const handleTagDelete = removedTag => dispatch => {
  dispatch({
    type: DELETE_TAG,
    payload: removedTag
  });
};
