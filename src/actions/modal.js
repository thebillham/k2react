import { SHOW_MODAL, EDIT_MODAL, EDIT_MODAL_DOC,
  ADD_TAG, DELETE_TAG, RESET_MODAL, SET_MODAL_ERROR,
  EDIT_MODAL_SAMPLE,
 } from "../constants/action-types";

import { storage, cocsRef } from "../config/firebase";

export const resetModal = () => dispatch => {
  dispatch({ type: RESET_MODAL });
}

export const hideModal = () => dispatch => {
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

export const setModalError = error => dispatch => {
  dispatch({
    type: SET_MODAL_ERROR,
    payload: error,
  });
}

export const handleModalChange = target => dispatch => {
  let val;
  if (target.id === 'course' || target.id === 'unit' || target.id === 'class' ) val = target.value.split(','); else val = target.value;
  dispatch({
    type: EDIT_MODAL_DOC,
    payload: {[target.id]: val,}
  });
}

export const handleSampleChange = (number, type, value) => dispatch => {
  console.log(`Changing sample ${number} (${type}) to ${value}`);
  dispatch({
    type: EDIT_MODAL_SAMPLE,
    payload: {
      number: number + 1,
      type: type,
      value: value,
    }
  });
}

export const handleModalSubmit = ({ doc, pathRef, docid }) => dispatch => {
  let uid;
  if (docid) {
    pathRef.doc(docid).set({ ...doc, uid: docid });
  } else if (doc.uid) {
    uid = doc.uid;
    pathRef.doc(doc.uid).set(doc);
  } else {
    uid = doc.type + parseInt(Math.floor(Math.random() * Math.floor(1000)));
    pathRef.doc(uid).set({ ...doc, uid: uid, });
  }
  dispatch({type: RESET_MODAL});
}

export const handleCocSubmit = ({ doc, docid}) => dispatch => {
  if (doc.samples) {
    Object.keys(doc.samples).forEach(sample => {
      cocsRef.doc(docid).collection('samples').doc(sample).set({...doc.samples[sample], samplenumber: sample});
    });
  }
  let doc2 = doc;
  if (doc2.samples) delete doc2.samples;
  doc2.uid = docid;
  cocsRef.doc(docid).set(doc2);
  dispatch({type: RESET_MODAL});
}

export const handleModalSubmitToDoc = ({ doc, pathRef }) => dispatch => {
  pathRef.set(doc);
  dispatch({type: RESET_MODAL});
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
