import {
  ADD_TAG,
  DELETE_TAG,
  EDIT_MODAL_DOC,
  EDIT_MODAL_DOC_STEPS,
  EDIT_MODAL_GLOSSARY,
  EDIT_MODAL_SAMPLE,
  EDIT_MODAL,
  RESET_MODAL,
  SET_MODAL_ERROR,
  SHOW_MODAL
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

export const showModal = ({ modalType, modalProps }) => dispatch => {
  dispatch({
    type: SHOW_MODAL,
    modalType,
    modalProps
  });
};

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
  dispatch({
    type: EDIT_MODAL_DOC,
    payload: { [target.id]: target.value }
  });
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

export const handleSampleChange = (number, type, value) => dispatch => {
  dispatch({
    type: EDIT_MODAL_SAMPLE,
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
    console.log(doc.type);
    uid = doc.type + parseInt(Math.floor(Math.random() * Math.floor(1000)));
    console.log(uid);
    pathRef.doc(uid).set({ ...doc, uid: uid });
  }
  dispatch({ type: RESET_MODAL });
};

export const handleCocSubmit = ({ doc, docid }) => dispatch => {
  console.log(doc.samples);
  let sampleList = [];
  if (doc.samples) {
    Object.keys(doc.samples).forEach(sample => {
      if (!doc.samples[sample].uid) {
        let datestring = new Intl.DateTimeFormat("en-GB", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
          .format(new Date())
          .replace(/[.:/,\s]/g, "_");
        let uid = `${
          doc.jobNumber
        }-SAMPLE-${sample}-CREATED-${datestring}-${Math.round(
          Math.random() * 1000
        )}`;
        console.log(`UID for new sample is ${uid}`);
        doc.samples[sample].uid = uid;
        sampleList.push(uid);
      } else {
        sampleList.push(doc.samples[sample].uid);
      }
      if (
        (doc.samples[sample].description || doc.samples[sample].material) &&
        !doc.samples[sample].disabled &&
        (doc.samples[sample].cocUid === undefined ||
          doc.samples[sample].cocUid === doc.uid)
      ) {
        console.log(`Submitting sample ${sample} to ${docid}`);
        let sample2 = doc.samples[sample];
        if (sample2.description)
          sample2.description =
            sample2.description.charAt(0).toUpperCase() +
            sample2.description.slice(1);
        if (doc.type === "air") {
          sample2.isAirSample = true;
          sample2.material = "Air Sample";
        }
        sample2.jobNumber = doc.jobNumber;
        sample2.cocUid = docid;
        sample2.sampleNumber = parseInt(sample, 10);
        if ("disabled" in sample2) delete sample2.disabled;
        console.log("Sample 2");
        console.log(sample2);
        asbestosSamplesRef.doc(doc.samples[sample].uid).set(sample2);
      }
    });
  }
  let doc2 = doc;
  if ("samples" in doc2) delete doc2.samples;
  doc2.uid = docid;
  doc2.sampleList = sampleList;
  console.log(doc2);
  cocsRef.doc(docid).set(doc2);
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
