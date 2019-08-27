import {
  EDIT_MODAL_DOC,
  EDIT_MODAL_SAMPLE,
  DELETE_COC,
  GET_ASBESTOS_ANALYSIS,
  GET_COCS,
  GET_SAMPLES,
  GET_SAMPLE_LOG,
  RESET_ASBESTOS_LAB,
  RESET_MODAL,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  SET_ANALYSIS_SESSION_ID,
} from "../constants/action-types";
import { DOWNLOAD_LAB_CERTIFICATE } from "../constants/modal-types";
import { styles } from "../config/styles";
import { dateOf } from "./local";
import moment from "moment";
import momentbusinessdays from "moment-business-days";
import momenttimezone from "moment-timezone";
import momentbusinesstime from "moment-business-time";
import { addLog } from "./local";
import {
  asbestosSamplesRef,
  asbestosAnalysisRef,
  asbestosSampleLogRef,
  cocsRef,
  stateRef,
  firebase,
} from "../config/firebase";
import React from "react";
import Button from "@material-ui/core/Button";

export const resetAsbestosLab = () => dispatch => {
  dispatch({ type: RESET_ASBESTOS_LAB });
};

//
// GET DATA
//

export const fetchCocs = update => async dispatch => {
  //console.log('Fetching COCs');
  // Make all calls update for now
  update = true;
  if (update) {
    cocsRef
      .where("deleted", "==", false)
      .where("versionUpToDate", "==", false)
      // .orderBy("lastModified")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
    cocsRef
      .where("deleted", "==", false)
      .where("versionUpToDate", "==", true)
      .where("lastModified", ">", moment().subtract(1, 'days').toDate())
      // .orderBy("lastModified")
      // .orderBy("dueDate", "desc")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
  } else {
    stateRef.doc("cocs").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_COCS, payload: doc.data() });
      } else {
        //console.log("Coc doesn't exist");
      }
    });
  }
};

export const fetchCocsByJobNumber = (jobNumber) => async dispatch => {
  cocsRef
    .where("deleted", "==", false)
    .where("jobNumber", "==", jobNumber.toUpperCase())
    .orderBy("lastModified")
    .onSnapshot(querySnapshot => {
      var cocs = {};
      querySnapshot.forEach(doc => {
        cocs[doc.id] = doc.data();
      });
      dispatch({
        type: GET_COCS,
        payload: cocs,
        update: true
      });
    });
};

export const fetchCocsBySearch = (client, startDate, endDate) => async dispatch => {
  //console.log(client);
  //console.log(startDate);
  //console.log(endDate);
  if (startDate === "") startDate = moment().subtract(6, 'months').toDate(); else startDate = new Date(startDate);
  if (endDate === "") endDate = new Date(); else endDate = new Date(endDate);
  //console.log(startDate);
  //console.log(endDate);
  if (client !== "") {
    cocsRef
      .where("deleted", "==", false)
      .where("client", "==", client)
      .where("lastModified", ">=", startDate)
      .where("lastModified", "<=", endDate)
      .orderBy("lastModified")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
  } else {
    //console.log('blank client');
    cocsRef
      .where("deleted", "==", false)
      .where("lastModified", ">=", startDate)
      .where("lastModified", "<=", endDate)
      .orderBy("lastModified")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
  }
};

// export const deleteCoc = (coc, cocs) => async dispatch => {
//   let newCocs = {...cocs};
//   delete newCocs[coc];
//   dispatch({
//     type: GET_COCS,
//     payload: newCocs,
//     update: true
//   });
// }

export const fetchAsbestosAnalysis = update => async dispatch => {
  if (update) {
    asbestosAnalysisRef
      .onSnapshot(querySnapshot => {
        var analysis = [];
        querySnapshot.forEach(doc => {
          analysis.push(doc.data());
        });
        dispatch({
          type: GET_ASBESTOS_ANALYSIS,
          payload: { analysis },
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosanalysis").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_ASBESTOS_ANALYSIS, payload: doc.data() });
      } else {
        //console.log("Asbestos Analysis doesn't exist");
      }
    });
  }
}

export const fetchSamples = (cocUid, jobNumber, modal) => async dispatch => {
  //console.log('fetching samples');
  asbestosSamplesRef
    .where("jobNumber", "==", jobNumber)
    .where("deleted","==",false)
    .onSnapshot(sampleSnapshot => {
      let samples = {};
      sampleSnapshot.forEach(sampleDoc => {
        let sample = sampleDoc.data();
        sample.uid = sampleDoc.id;
        samples[sample.sampleNumber] = sample;
        dispatch({
          type: GET_SAMPLES,
          cocUid: cocUid,
          payload: samples
        });
        if (modal) {
          dispatch({
            type: EDIT_MODAL_DOC,
            payload: {samples: samples},
          });
        }
      });
    });
};

export const fetchSampleLog = (update) => async dispatch => {
  if (update) {
    let startDate = moment().subtract(20, 'days').toDate();
    asbestosSampleLogRef
      .where("reportDate", ">", startDate)
      .orderBy("reportDate")
      .onSnapshot(logSnapshot => {
        let logs = {};
        logSnapshot.forEach(logDoc => {
          let log = logDoc.data();
          log.uid = logDoc.id;
          logs[log.uid] = log;
        });
        dispatch({
          type: GET_SAMPLE_LOG,
          payload: logs,
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosSampleLog").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_SAMPLE_LOG, payload: doc.data() });
      } else {
        //console.log("Sample log doesn't exist");
      }
    });

  }
};


//
// SETTINGS
//

export const setAnalyst = analyst => dispatch => {
  dispatch({
    type: SET_ANALYST,
    payload: analyst
  });
};

export const setAnalysisMode = mode => dispatch => {
  dispatch({
    type: SET_ANALYSIS_MODE,
    payload: mode
  });
};

export const setSessionID = session => dispatch => {
  dispatch({
    type: SET_ANALYSIS_SESSION_ID,
    payload: session,
  });
}

//
// COC EDIT
//

export const handleCocSubmit = ({ doc, me, originalSamples }) => dispatch => {
  //console.log(doc);
  // //console.log(doc.samples);
  let sampleList = [];
  if (doc.samples) {
    // //console.log(doc.samples);
    Object.keys(doc.samples).forEach(sample => {
      if (doc.samples[sample].genericLocation || doc.samples[sample].specificLocation || doc.samples[sample].description || doc.samples[sample].material) {
        // //console.log(sample);
        if (!doc.samples[sample].uid) {
          let uid = `${
            doc.jobNumber
          }-SAMPLE-${sample}-CREATED-${moment().format('x')}-${Math.round(
            Math.random() * 1000
          )}`;
          // //console.log(`UID for new sample is ${uid}`);
          let log = {
            type: 'Create',
            log: `Sample ${sample} (${writeDescription(doc.samples[sample])}) created.`,
            chainOfCustody: doc.uid,
            sample: uid,
          };
          addLog("asbestosLab", log, me);
          console.log(doc.samples[sample]);
          doc.samples[sample].uid = uid;
          doc.samples[sample].deleted = false;
          doc.samples[sample].createdDate = new Date();
          doc.samples[sample].createdBy = {uid: me.uid, name: me.name};
          if (!doc.samples[sample].sampleDate && doc.defaultSampleDate !== null) doc.samples[sample].sampleDate = doc.defaultSampleDate;
            else doc.samples[sample].sampleDate = null;
          doc.samples[sample].sampleDate = dateOf(doc.samples[sample].sampleDate);
          if (!doc.samples[sample].sampledBy && doc.defaultSampledBy.length > 0) doc.samples[sample].sampledBy = doc.defaultSampledBy.map(e => ({uid: e.value, name: e.label}));
            else doc.samples[sample].sampledBy = null;
          console.log(doc.samples[sample]);
          sampleList.push(uid);
        } else {
          if (doc.samples[sample].verified && doc.samples[sample] !== originalSamples[doc.samples[sample].sampleNumber]) {
            let log = {
              type: 'Edit',
              log: `Sample ${sample} (${writeDescription(doc.samples[sample])}) modified.`,
              chainOfCustody: doc.uid,
              sample: doc.samples[sample].uid,
            };
            addLog("asbestosLab", log, me);
            doc.samples[sample].verified = false;
          }
          sampleList.push(doc.samples[sample].uid);
        }
        // //console.log(`Submitting sample ${sample} to ${docid}`);
        let sample2 = doc.samples[sample];
        if (sample2.description)
          sample2.description =
            sample2.description.charAt(0).toUpperCase() +
            sample2.description.slice(1);
        sample2.jobNumber = doc.jobNumber;
        if (sample2.cocUid === undefined) sample2.cocUid = doc.uid;
        sample2.sampleNumber = parseInt(sample, 10);
        sample2.sampleDate = dateOf(sample2.sampleDate);
        if ("disabled" in sample2) delete sample2.disabled;
        asbestosSamplesRef.doc(doc.samples[sample].uid).set(sample2);
      }
    });
  }
  let doc2 = doc;
  if ("samples" in doc2) delete doc2.samples;
  doc2.uid = doc.uid;
  doc2.sampleList = sampleList;
  cocsRef.doc(doc.uid).set(doc2);
  dispatch({ type: RESET_MODAL });
};

export const togglePriority = (job, me) => {
  let log = {
    type: "Admin",
    log: job.priority === 1 ? `Chain of Custody changed to normal priority.` : `Chain of Custody marked as high priority.`,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  cocsRef.doc(job.uid).update({ priority: job.priority === 0 ? 1 : 0 });
};

export const toggleWAAnalysis = (job, me) => {
  let log = {
    type: "Admin",
    log: job.waAnalysis ? `WA analysis request removed.` : `Chain of Custody flagged for WA analysis.`,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  cocsRef.doc(job.uid).update({ waAnalysis: job.waAnalysis ? false : true });
};


//
// SAMPLE EDIT
//


export const handleSampleChange = (number, changes) => dispatch => {
  dispatch({
    type: EDIT_MODAL_SAMPLE,
    payload: {
      number: number + 1,
      changes: changes,
    }
  });
};

export const logSample = (coc, sample, cocStats, version) => {
  // let dateString = moment(new Date()).format('YYYY-MM-DD');
  let transitTime = sample.createdDate && sample.receivedDate ? moment.duration(moment(sample.receivedDate.toDate()).diff(sample.createdDate.toDate())).asMilliseconds() : null;
  let labTime = sample.receivedDate && sample.analysisDate ? moment.duration(moment(sample.analysisDate.toDate()).diff(sample.receivedDate.toDate())).asMilliseconds() : null;
  let analysisTime = sample.receivedDate && sample.analysisStartDate ? moment.duration(moment(sample.analysisDate.toDate()).diff(sample.analysisStartDate.toDate())).asMilliseconds() : null;
  let turnaroundTime = sample.receivedDate ? moment.duration(moment().diff(sample.receivedDate.toDate())).asMilliseconds() : null;

  let log = {
    client: coc.client ? coc.client : null,
    address: coc.address ? coc.address: null,
    jobNumber: coc.jobNumber ? coc.jobNumber : null,
    cocUid: coc.uid ? coc.uid : null,
    cocType: coc.type ? coc.type : null,
    priority: coc.priority ? coc.priority: 0,

    totalSamples: cocStats.totalSamples ? cocStats.totalSamples : 0,
    maxTurnaroundTime: cocStats.maxTurnaroundTime ? cocStats.maxTurnaroundTime : 0,
    averageTurnaroundTime: cocStats.averageTurnaroundTime ? cocStats.averageTurnaroundTime : 0,

    sampleNumber: sample.sampleNumber ? sample.sampleNumber : null,
    sampleUid: sample.uid ? sample.uid : null,

    genericLocation: sample.genericLocation ? sample.genericLocation : null,
    specificLocation: sample.specificLocation ? sample.specificLocation : null,
    description: sample.description ? sample.description : null,
    material: sample.material ? sample.material : null,
    category: sample.category ? sample.category : 'Other',

    sampledBy: sample.sampledBy ? sample.sampledBy: null,
    sampleDate: sample.sampleDate ? sample.sampleDate : null,
    receivedBy: sample.receivedBy ? sample.receivedBy : null,
    receivedDate: sample.receivedDate ? sample.receivedDate : null,
    analysisStartedBy: sample.analysisStartedBy ? sample.analysisStartedBy : null,
    analysisStartDate : sample.analysisStartDate ? sample.analysisStartDate : null,
    analysisBy: sample.analyst ? sample.analyst : null,
    analysisRecordedBy: sample.analysisRecordedBy ? sample.analysisRecordedBy : null,
    analysisDate: sample.analysisDate ? sample.analysisDate : null,
    sessionID: sample.sessionID ? sample.sessionID : null,
    result: sample.result ? sample.result : {},
    verifiedBy: sample.verifiedBy ? sample.verifiedBy : null,
    verifyDate: sample.verifyDate ? sample.verifyDate : null,
    issuedBy: sample.issuedBy ? sample.issuedBy : null,
    issueDate: new Date(),

    turnaroundTime: turnaroundTime,
    analysisTime: analysisTime,
    transitTime: transitTime,
    labTime: labTime,
    analysisTime: analysisTime,
    analysisType: sample.analysisType ? sample.analysisType : 'normal',
  };
  console.log(log);
  asbestosSampleLogRef.add(log);
}


//
// SAMPLE PROGRESS CHANGES
//

export const holdSample = (sample, job, me) => {
  //console.log('Sample on hold');
  let log = {
    type: "Analysis",
    log: sample.onHold
      ? `Sample ${sample.sampleNumber} (${writeDescription(sample)}) analysis taken off hold.`
      : `Sample ${sample.sampleNumber} (${writeDescription(sample)}) analysis put on hold.`,
    sample: sample.uid,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  cocsRef
    .doc(sample.cocUid)
    .update({ versionUpToDate: false, mostRecentIssueSent: false,});
  asbestosSamplesRef.doc(sample.uid).update({ onHold: sample.onHold ? false : true, });
}

export const receiveAll = (samples, job, sessionID, me) => {
  //console.log(samples);
  if (samples && Object.values(samples).length > 0) {
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === job.uid) {
        if (!sample.receivedByLab) receiveSample(sample, job, samples, sessionID, me);
      }
    });
  }
};

export const receiveSample = (sample, job, samples, sessionID, me, startDate) => {
  //console.log('Receiving sample');
  //console.log(sample);
  if (sample.receivedByLab && sample.verified) {
    removeResult(sample, sessionID, me);
    if (sample.analysisStarted) startAnalysis(sample, job, samples, sessionID, me);
    verifySample(sample, job, samples, sessionID, me);
  } else if (sample.receivedByLab && sample.result) {
    removeResult(sample, sessionID, me);
    if (sample.analysisStarted) startAnalysis(sample, job, samples, sessionID, me);
  } else if (sample.receivedByLab && sample.analysisStarted) {
    startAnalysis(sample, job, samples, sessionID, me);
  }
  let log = {
    type: "Received",
    log: !sample.receivedByLab
      ? `Sample ${sample.sampleNumber} (${writeDescription(sample)}) received by lab.`
      : `Sample ${sample.sampleNumber} (${writeDescription(sample)}) unchecked as being received.`,
    sample: sample.uid,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  cocsRef
    .doc(sample.cocUid)
    .update({ versionUpToDate: false, mostRecentIssueSent: false, });
  if (!sample.receivedByLab) {
    asbestosSamplesRef.doc(sample.uid).update(
    {
      receivedByLab: true,
      receivedBy: {uid: me.uid, name: me.name},
      receivedDate: startDate ? startDate : new Date(),
    });
  } else {
    asbestosSamplesRef.doc(sample.uid).update({
      receivedByLab: false,
      receivedBy: firebase.firestore.FieldValue.delete(),
      receivedDate: firebase.firestore.FieldValue.delete(),
    });
  }
};

export const receiveSamples = (samples) => {
  let issues = [];
  let uid = '';
  // Check for issues
  samples.forEach(sample => {
    if (!sample.now) {
      uid = sample.uid + 'NotReceived';
      if (sample.receivedByLab && sample.verified) {
        issues[uid] = {
          type: 'confirm',
          description: `The result has already been verified. Removing from the lab will remove the analysis result and verification.`,
          yes: 'Confirm Removal from Lab',
          no: 'Do Not Remove',
          sample,
          uid,
        };
      } else if (sample.receivedByLab && sample.result) {
        issues[uid] = {
          type: 'confirm',
          description: `The result has already been logged. Removing from the lab will remove the analysis result.`,
          yes: 'Confirm Removal from Lab',
          no: 'Do Not Remove',
          sample,
          uid,
        };
      } else if (sample.original === sample.now) {
        issues[uid] = {
          type: 'check',
          description: `Sample has not been checked as received. Double check this is correct and leave a comment on why it has been missed.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        };
      } else {
        issues[uid] = {
          type: 'check',
          description: `Sample has been unchecked as received. Double check this is correct and leave a comment on why it has been removed.`,
          yes: 'Confirm Removal from Lab',
          no: 'Do Not Remove',
          sample,
          uid,
        };
      }
    }
  });
  return issues;
};

export const startAnalysisAll = (samples, job, sessionID, me) => {
  if (samples && Object.values(samples).length > 0) {
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === job.uid) {
        if (!sample.analysisStarted) {
          if (!sample.receivedByLab) receiveSample(sample, job, samples, sessionID, me);
          startAnalysis(sample, job, samples, sessionID, me);
        }
      }
    });
  }
};

export const startAnalysis = (sample, job, samples, sessionID, me, startDate) => {
  if (!sample.receivedByLab && !sample.analysisStarted) receiveSample(sample, job, samples, sessionID, me, startDate);
  if (sample.verified) verifySample(sample, job, samples, sessionID, me);
  let log = {
    type: "Analysis",
    log: !sample.analysisStarted
      ? `Analysis begun on Sample ${sample.sampleNumber} (${writeDescription(sample)}).`
      : `Analysis stopped for Sample ${sample.sampleNumber} (${writeDescription(sample)}).`,
    sample: sample.uid,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  cocsRef
    .doc(sample.cocUid)
    .update({ versionUpToDate: false, });
  if (!sample.analysisStarted) {
    asbestosSamplesRef.doc(sample.uid).update(
    {
      analysisStarted: true,
      analysisStartedBy: {uid: me.uid, name: me.name},
      analysisStartDate: startDate ? startDate : new Date(),
    });
  } else {
    asbestosSamplesRef.doc(sample.uid).update(
    {
      analysisStarted: false,
      analysisStartedBy: firebase.firestore.FieldValue.delete(),
      analysisStartDate: firebase.firestore.FieldValue.delete(),
    });
  }
};

export const startAnalyses = (samples) => {
  let issues = [];
  // Check for issues
  let uid = '';
  samples.forEach(sample => {
    //console.log(sample.now);
    //console.log(sample.original);
    if (!sample.now) {
      uid = sample.uid + 'NoAnalysisStart';
      if (sample.analysisStarted && sample.verified) {
        issues[uid] = {
          type: 'confirm',
          description: `The result has already been verified. Are you sure you want to remove the analysis start date? This will not remove the result or verification.`,
          yes: 'Confirm Removal of Analysis Start Date',
          no: 'Do not remove',
          sample,
          uid,
        };
      } else if (sample.analysisStarted && sample.result) {
        issues[uid] = {
          type: 'confirm',
          description: `The result has already been logged. Are you sure you want to remove the analysis start date? This will not remove the result.`,
          yes: 'Confirm Removal of Analysis Start Date',
          no: 'Do not remove',
          sample,
          uid,
        };
      } else if (sample.original === sample.now) {
        issues[uid] = {
          type: 'check',
          description: `Analysis has not been checked as started. Double check this is correct and leave a comment on why it has been missed.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        };
      } else {
        issues[uid] = {
          type: 'check',
          description: `Analysis has been unchecked as started. Double check this is correct and leave a comment on why it has been removed.`,
          yes: 'Confirm Removal of Analysis Start Date',
          no: 'Do not remove',
          sample,
          uid,
        };
      }
    }
  });
  return issues;
};

export const updateResultMap = (result, map) => {
  let updatedMap = {};

  if (map === undefined) {
    updatedMap = { [result]: true };
  } else {
    let res = true;
    if (map[result] !== undefined) res = !map[result];
    updatedMap = {
      ...map,
      [result]: res,
    };
    if ((result === "ch" || result === "am" || result === "cr" || result === "umf") && map["no"] === true) updatedMap["no"] = false;
    if (result === "no") {
      ["ch","am","cr","umf"].forEach(type => {
        if (map[type] === true) updatedMap[type] = false;
      });
    }
  }

  return updatedMap;
}

export const recordAnalysis = (analyst, sample, job, samples, sessionID, me, resultChanged, weightChanged) => {
  if (sample.sessionID !== sessionID && sample.result) {
    let log = {
      type: "Analysis",
      log: `Previous analysis of sample ${sample.sampleNumber} (${
        sample.description
      } ${sample.material}) overridden.`,
      sample: sample.uid,
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me);
  }
  //console.log(sample);
  if (sample.verified) verifySample(sample, job, samples, sessionID, me, null);

  if (resultChanged) {
    let log = {
      type: "Analysis",
      log: `New analysis for sample ${sample.sampleNumber} (${writeDescription(sample)}): ${writeResult(sample.result, sample.noAsbestosResultReason).replace('@~',' ')}`,
      sample: sample.uid,
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me);
  }

  if (weightChanged) {
    let log = {
      type: "Analysis",
      log: `New received weight for sample ${sample.sampleNumber} (${
        sample.description
      } ${sample.material}): ${sample.weightReceived}g`,
      sample: sample.uid,
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me);
  }

  cocsRef
    .doc(job.uid)
    .update({ versionUpToDate: false, mostRecentIssueSent: false, });

  // Check for situation where all results are unselected
  let notBlankAnalysis = false;
  Object.values(sample.result).forEach(value => {
    if (value) notBlankAnalysis = true;
  });

  if (notBlankAnalysis) {
    if (!sample.analysisStarted) startAnalysis(sample, job, samples, sessionID, me);
    asbestosAnalysisRef.doc(`${sessionID}-${sample.uid}`).set({
      analyst: analyst,
      analystUID: me.uid,
      // mode: this.props.analysisMode,
      sessionID: sessionID,
      cocUID: job.uid,
      sampleUID: sample.uid,
      result: sample.result,
      weightReceived: sample.weightReceived ? sample.weightReceived : null,
      description: writeDescription(sample),
      samplers: job.personnel,
      analysisDate: new Date()
    });
    asbestosSamplesRef.doc(sample.uid).update({
      analysisRecordedBy: {uid: me.uid, name: me.name},
      sessionID: sessionID,
      analyst: analyst,
      result: sample.result,
      weightReceived: sample.weightReceived ? sample.weightReceived : null,
      analysisDate: new Date(),
      analysisTime: sample.receivedDate ? moment.duration(moment(new Date()).diff(sample.receivedDate.toDate())).asMilliseconds() : null,
    });
  } else {
    asbestosAnalysisRef
      .doc(`${sessionID}-${sample.uid}`)
      .delete();
    asbestosSamplesRef
      .doc(sample.uid)
      .update({
        result: firebase.firestore.FieldValue.delete(),
        analysisDate: firebase.firestore.FieldValue.delete(),
        analysisRecordedBy: firebase.firestore.FieldValue.delete(),
        sessionID: firebase.firestore.FieldValue.delete(),
        analysisTime: firebase.firestore.FieldValue.delete(),
        analyst: firebase.firestore.FieldValue.delete(),
      });
  }
};

export const removeResult = (sample, sessionID, me) => {
  let log = {
    type: "Analysis",
    log: `Sample ${sample.sampleNumber} (${writeDescription(sample)}) result removed.`,
    sample: sample.uid,
    chainOfCustody: sample.cocUid,
  };
  addLog("asbestosLab", log, me);

  cocsRef
    .doc(sample.cocUid)
    .update({ versionUpToDate: false, mostRecentIssueSent: false, });
  asbestosAnalysisRef
    .doc(`${sessionID}-${sample.uid}`)
    .delete();
  asbestosSamplesRef
    .doc(sample.uid)
    .update({
      result: firebase.firestore.FieldValue.delete(),
      analysisDate: firebase.firestore.FieldValue.delete(),
      analysisRecordedBy: firebase.firestore.FieldValue.delete(),
      sessionID: firebase.firestore.FieldValue.delete(),
    });
}

export const verifySample = (sample, job, samples, sessionID, me, startDate, properties) => {
  //console.log('Verifying');
  if (
    (me.auth &&
    (me.auth["Analysis Checker"] ||
      me.auth["Asbestos Admin"]))
  ) {
    if (!sample.analysisStarted && !sample.verified) startAnalysis(sample, job, samples, sessionID, me);
    let verifyDate = null;
    let log = {
      type: "Verified",
      log: !sample.verified
        ? `Sample ${sample.sampleNumber} (${writeDescription(sample)}) result verified.`
        : `Sample ${sample.sampleNumber} (${writeDescription(sample)}) verification removed.`,
      sample: sample.uid,
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me);

    cocsRef
      .doc(sample.cocUid)
      .update({ versionUpToDate: false, mostRecentIssueSent: false, });
    if (!sample.verified) {
      sample.verifyDate = new Date();
      asbestosSamplesRef.doc(sample.uid).update(
      {
        ...properties,
        verified: true,
        verifiedBy: {uid: me.uid, name: me.name},
        verifyDate: startDate ? startDate : new Date(),
        turnaroundTime: sample.receivedDate ? moment.duration(moment().diff(sample.receivedDate.toDate())).asMilliseconds() : null,
      });
    } else {
      asbestosSamplesRef.doc(sample.uid).update(
      {
        ...properties,
        verified: false,
        verifiedBy: firebase.firestore.FieldValue.delete(),
        verifyDate: firebase.firestore.FieldValue.delete(),
        turnaroundTime: firebase.firestore.FieldValue.delete(),
      });
    }
  } else {
    window.alert(
      "You don't have sufficient permissions to verify asbestos results."
    );
  }
};

export const verifySamples = (samples, job, meUid) => {
  let issues = {};
  let uid = '';
  // Check for issues
  samples.forEach(sample => {
    let uid = '';
    if (!sample.now) {
      if (sample.original === sample.now) {
        uid = sample.uid + 'ResultNotVerified';
        issues[uid] = {
          type: 'check',
          description: `Result has not been verified. This sample will not appear on lab reports.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        };
      } else {
        uid = sample.uid + 'ResultNotVerified';
        issues[uid] = {
          type: 'check',
          description: `Result has been unverified. Double check this is correct and leave a comment on why verification has been removed. This sample will not appear on lab reports.`,
          yes: 'Remove Verification',
          no: 'Do not remove',
          sample,
          uid,
        };
      }
    } else {
      // if (sample.analysisRecordedBy && sample.analysisRecordedBy.id === meUid) {
      //   uid = sample.uid + 'SameUser';
      //   issues[uid] = {
      //     type: 'block',
      //     description: `You cannot verify this sample as you recorded the result. You will need to get someone else to verify it.`,
      //     no: 'OK',
      //     sample,
      //     uid,
      //   };
      // }
      // Check sample if is on hold
      if (sample.onHold) {
        uid = sample.uid + 'OnHold';
        issues[uid] = {
          type: 'check',
          description: `Sample is on hold. This will not appear on lab reports until it is taken off hold.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        };
      }

      // Check result has been added
      if (getBasicResult(sample) === 'none') {
        uid = sample.uid + 'NoAsbestosResult';
        issues[uid] = {
          type: 'noresult',
          description: `No asbestos result has been recorded. Double check this is correct and select a reason for why this is.`,
          sample,
          uid,
        };
      }

      // Check received weight is there
      if (!sample.weightReceived) {
        uid = sample.uid + 'NoReceivedWeightRecorded';
        issues[uid] = {
          type: 'confirm',
          description: `No received weight has been recorded. Check with the analyst why this has not been done.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        }
      }

      // Check sampling personnel
      if (!sample.sampledBy) {
        uid = sample.uid + 'NoSampledBy';
        issues[uid] = {
          type: 'confirm',
          description: `No sampling personnel recorded for this sample. Check if this is correct.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        }
      }


      // Check sampling date

      if (!sample.sampleDate && !(sample.sampledBy && sample.sampledBy[0] && sample.sampledBy[0].value !== 'Client')) {
        uid = sample.uid + 'NoSampleDate';
        issues[uid] = {
          type: 'confirm',
          description: `No sampling date has been recorded. Check if this is correct.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sample,
          uid,
        }
      }

      // Check layer results
      if (sample.layers) {
        let layersResult = {result: collateLayeredResults(sample.layers)};
        let layersMatch = compareAsbestosResult(layersResult, sample);
        if (layersMatch !== 'yes') {
          if (layersMatch === 'no') {
            uid = sample.uid + 'LayerResultOpposing';
            issues[uid] = {
              type: 'confirm',
              priority: 'high',
              description: `Cumulative results for layer detail have opposing results to the sample result. Check with analyst why this is before clicking Proceed.`,
              sample,
              uid,
            };
          } else if (layersMatch === 'differentAsbestos') {
            uid = sample.uid + 'LayerResultDifferentAsbestos';
            issues[uid] = {
              type: 'confirm',
              priority: 'high',
              description: `Cumulative results for layer detail record different asbestos types to the sample result. Check with analyst why this is before clicking Proceed.`,
              sample,
              uid,
            };
          } else if (layersMatch === 'differentNonAsbestos') {
            uid = sample.uid + 'LayerResultDifferentNonAsbestos';
            issues[uid] = {
              type: 'confirm',
              priority: 'low',
              description: `Cumulative results for layer detail record different non-asbestos types to the sample result. Check with analyst why this is before clicking Proceed.`,
              sample,
              uid,
            };
          }
        }
      }

      // Check confirm results
      if (sample.confirm !== undefined) {
        let confirmTotal = 0;
        let confirmYes = 0;
        let confirmDifferentAsbestos = 0;
        let confirmDifferentNonAsbestos = 0;
        let confirmNo = 0;
        Object.keys(sample.confirm).forEach(key => {
          confirmTotal++;
          let confirmMatch = compareAsbestosResult(sample.confirm[key], sample);
          if (confirmMatch === 'yes') {
            confirmYes++;
          } else if (confirmMatch === 'no') {
            confirmNo++;
          } else if (confirmMatch === 'differentAsbestos') {
            confirmDifferentAsbestos++;
          } else if (confirmMatch === 'differentNonAsbestos') {
            confirmDifferentNonAsbestos++;
          }
        });
        if (confirmNo + confirmDifferentAsbestos + confirmDifferentNonAsbestos > 0) {
          if (confirmNo > 0) {
            uid = sample.uid + 'ConfirmResultOpposing';
            issues[uid] = {
              type: 'confirm',
              priority: 'high',
              description: `${confirmNo} checked ${confirmNo > 1 ? 'analyses have' : 'analysis has an'} opposing ${confirmNo > 1 ? 'results' : 'result'} to the reported result. Check with analyst and analysis ${confirmNo > 1 ? 'checkers' : 'checker'} before clicking Proceed.`,
              sample,
              uid,
            };
          } else if (confirmDifferentAsbestos > 0)  {
            uid = sample.uid + 'ConfirmResultDifferentAsbestos';
            issues[uid] = {
              type: 'confirm',
              priority: 'high',
              description: `${confirmDifferentAsbestos} checked ${confirmDifferentAsbestos > 1 ? 'analyses have' : 'analysis has a'} different asbestos result to the reported result. Check with analyst and analysis ${confirmDifferentAsbestos > 1 ? 'checkers' : 'checker'} before clicking Proceed.`,
              sample,
              uid,
            };
          } else if (confirmDifferentNonAsbestos > 0)  {
            uid = sample.uid + 'ConfirmResultDifferentNonAsbestos';
            issues[uid] = {
              type: 'confirm',
              priority: 'low',
              description: `${confirmDifferentNonAsbestos} checked ${confirmDifferentNonAsbestos > 1 ? 'analyses report' : 'analysis reports'} different non-asbestos fibres to the reported result. Check with analyst and analysis ${confirmDifferentNonAsbestos > 1 ? 'checkers' : 'checker'} before clicking Proceed.`,
              sample,
              uid,
            };
          }
        }
      }

      // Check WA Analysis if applicable
      if (job.waAnalysis) {
        if (!sample.waAnalysisComplete) {
          uid = sample.uid + 'WAAnalysisNotComplete';
          issues[uid] = {
            type: 'confirm',
            description: `WA Analysis has not been checked by analyst as complete. Check with analyst that analysis is complete before clicking Proceed.`,
            sample,
            uid,
          };
        }

        if (!sample.waSoilAnalysis) {
          uid = sample.uid + 'WAAnalysisNotRecorded';
          issues[uid] = {
            type: 'confirm',
            description: `WA Analysis has not been recorded. All results will appear blank in Soil Concentrations Report.`,
            sample,
            uid,
          };
        } else {
          let soilResult = {result: collateLayeredResults(sample.waSoilAnalysis)};
          let soilMatch = compareAsbestosResult(soilResult, sample);
          if (soilMatch !== 'yes') {
            if (soilMatch === 'no') {
              uid = sample.uid + 'SoilResultOpposing';
              issues[uid] = {
                type: 'confirm',
                priority: 'high',
                description: `Cumulative results for soil fractions have opposing results to the sample result. Check with analyst why this is before clicking Proceed.`,
                sample,
                uid
              };
            } else if (soilMatch === 'differentAsbestos') {
              uid = sample.uid + 'SoilResultDifferentAsbestos';
              issues[uid] = {
                type: 'confirm',
                priority: 'high',
                description: `Cumulative results for soil fractions record different asbestos types to the sample result. Check with analyst why this is before clicking Proceed.`,
                sample,
                uid,
              };
            } else if (soilMatch === 'differentNonAsbestos') {
              uid = sample.uid + 'SoilResultDifferentNonAsbestos';
              issues[uid] = {
                type: 'confirm',
                priority: 'low',
                description: `Cumulative results for soil fractions record different non-asbestos types to the sample result. Check with analyst why this is before clicking Proceed.`,
                sample,
                uid,
              };
            }
          }
        }
      }
    }
  });
  return issues;
};

export const checkTestCertificateIssue = (samples, job, meUid) => {
  let filteredSamples = [];
  if (samples) {
    filteredSamples = Object.values(samples).filter(sample => sample.cocUid === job.uid && !sample.deleted).map(sample => ({...sample, now: sample.verified, original: sample.verified }));
  }

  let issues = verifySamples(filteredSamples, job, meUid);
  // Check if any samples have not been checked off and ask the user to verify
  let allSamplesVerified = true;

  filteredSamples.forEach(sample => {
    if (!sample.verified && sample.cocUid === job.uid) allSamplesVerified = false;
  });

  if (!allSamplesVerified) {
    let uid = job.uid + 'NotAllSamplesVerified';
    issues[uid] = {
      type: 'confirm',
      priority: 'low',
      description: `Not all samples have been verified. These will not appear in the test certificate.`,
      sample: null,
      uid,
      yes: 'This is correct',
      no: 'This needs fixing',
    };
  }

  // If new version, prompt for version change
  if (job.currentVersion) {
    let uid = 'versionChanges';
    issues[uid] = {
      type: 'confirm',
      description: 'Please provide a description of the changes made since the last version issued. This will appear on the test certifcate.',
      sample: null,
      uid,
      yes: 'OK',
      no: 'Cancel',
    }
  }
  return issues;
}


//
// WA ANALYSIS/SAMPLE DETAILS
//

const fractionNames = ['gt7','to7','lt2'];
const layerNum = 3;

const waStyle = { display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 48, margin: 12, };
const totalStyle = { fontWeight: 500, fontSize: 16, textAlign: 'center', };
const waBoxStyle = { flexDirection: 'row', display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginTop: 14, };
const bufferStyle = { width: '40%'};
const waSubheading = { fontWeight: 500 };
const waSubheadingBoxStyle = { width: '35%', marginRight: 12, marginTop: 14, fontWeight: 500, };
const waWeightStyle = { width: '25%', marginRight: 12, };
const waWeightStyle2 = { width: '25%', };
const bottomDottedStyle = { borderBottomStyle: 'dotted', borderBottomWidth: 1};
const waConcStyle = { width: '35%', marginRight: 14, };
const waDivRed = {backgroundColor: 'red', borderRadius: 5};
const waDivWhite = {backgroundColor: 'white', borderRadius: 5};
const blackTextStyle = { color: 'black' };
const redTextStyle = { color: 'red' };
const whiteTextStyle = { color: 'white', margin: 5 };
const lightGreyTextStyle = { color: '#ddd', margin: 5 };

export const getWAAnalysisSummary = sample => {
    let weightACM = 0;
    let weightFA = 0;
    let weightAF = 0;
    let weightDry = sample.weightDry;
    let weightAshed = sample.weightAshed;
    let ch = false;
    let am = false;
    let cr = false;
    let umf = false;
    let fractionTotalWeight = 0.0;
    let fractionWeightNum = 0;
    let subFractionTotalWeight = 0.0;
    let asbestosTotalWeight = 0.0;
    let allHaveTypes = true;
    let allHaveForms = true;

    fractionNames.forEach(fraction => {
      if (sample && sample.waAnalysis && sample.waAnalysis['fraction' + fraction + 'WeightAshed'] > 0) {
        fractionWeightNum++;
        fractionTotalWeight += parseFloat(sample.waAnalysis['fraction' + fraction + 'WeightAshed']);
      }

      [...Array(sample && sample.layerNum && sample.layerNum[fraction] ? sample.layerNum[fraction] : layerNum).keys()].forEach(num => {
        if (sample && sample.waSoilAnalysis && sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] !== undefined) {
          let sub = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
          if (sub.weight) {
            subFractionTotalWeight += parseFloat(sub.weight);
          }
          if (sub.weight && sub.concentration) {
            let asbestosWeight = (parseFloat(sub.weight) * parseFloat(sub.concentration) / 100);
            asbestosTotalWeight += asbestosWeight;
            if (sub.type === undefined) allHaveForms = false;
            if (sub.type === 'fa') weightFA += parseFloat(asbestosWeight);
              else if (sub.type === 'af') weightAF += parseFloat(asbestosWeight);
              else if (sub.type === 'acm') weightACM += parseFloat(asbestosWeight);
            if (sub.result) {
              if (sub.result.ch === true) ch = true;
              if (sub.result.am === true) am = true;
              if (sub.result.cr === true) cr = true;
              if (sub.result.umf === true) umf = true;
              if (!sub.result.ch && !sub.result.am && !sub.result.cr && !sub.result.umf) allHaveTypes = false;
            } else {
              allHaveTypes = false;
            }
          }
        }
      });
    });

    let match = true;
    if (sample.result) {
      if ((ch || sample.result.ch) && ch !== sample.result.ch) match = false;
      if ((am || sample.result.am) && am !== sample.result.am) match = false;
      if ((cr || sample.result.cr) && cr !== sample.result.cr) match = false;
      if ((umf || sample.result.umf) && umf !== sample.result.umf) match = false;
    }

    let concentrationFA = 0.0;
    let concentrationAF = 0.0;
    let concentrationACM = 0.0;
    let concentrationFAAF = 0.0;
    if (weightDry) {
      concentrationFA = weightFA/weightDry*100;
      concentrationAF = weightAF/weightDry*100;
      concentrationACM = weightACM/weightDry*100;
      concentrationFAAF = (weightFA+weightAF)/weightDry*100;
    }
    console.log(concentrationFA);
    return(
      <div style={waStyle}>
        <div style={totalStyle}>Totals</div>
        <div style={waBoxStyle}>
          <div style={bufferStyle} />
          <div style={waSubheadingBoxStyle}>
            <div>Dry Weight: </div>
            <div>Ashed Weight: </div>
            <div>Ashed Fraction Total: </div>
            <div>Ashed Subfraction Total: </div>
            <div>Asbestos Total: </div>
          </div>
          <div style={waWeightStyle}>
            <div>{weightDry ? <span>{parseFloat(weightDry).toFixed(2)}g</span> : <span>N/A</span>}</div>
            <div>{weightAshed ? <span>{parseFloat(weightAshed).toFixed(2)}g</span> : <span>N/A</span>}</div>
            <div>{fractionWeightNum === 3 ? <span>{parseFloat(fractionTotalWeight).toFixed(2)}g</span> : <span>N/A</span>}</div>
            <div>{subFractionTotalWeight ? <span>{parseFloat(subFractionTotalWeight).toFixed(4)}g</span> : <span>N/A</span>}</div>
            <div>{asbestosTotalWeight > 0 ? <span>{parseFloat(asbestosTotalWeight).toFixed(4)}g</span> : <span>N/A</span>}</div>
          </div>
        </div>
        <div style={waBoxStyle}>
          <div style={waWeightStyle}>
            <div style={waSubheading}>Type</div>
            <div>ACM Bonded</div>
            <div>Friable Asbestos</div>
            <div>Asbestos Fines</div>
            <div>FA/AF Total</div>
          </div>
          <div style={waWeightStyle2}>
            <div style={waSubheading}>Asbestos Weight</div>
            <div style={bottomDottedStyle}>{weightACM.toFixed(6)}g</div>
            <div style={bottomDottedStyle}>{weightFA.toFixed(6)}g</div>
            <div style={bottomDottedStyle}>{weightAF.toFixed(6)}g</div>
            <div style={bottomDottedStyle}>{(weightFA+weightAF).toFixed(6)}g</div>
          </div>
          <div style={waConcStyle}>
            <div style={waSubheading}>Asbestos Concentration</div>
            <div style={bottomDottedStyle}>{weightDry ? <span style={concentrationACM > 0.01 ? {redTextStyle} : {blackTextStyle} }>{concentrationACM.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div style={bottomDottedStyle}>{weightDry ? <span style={concentrationFA > 0.001 ? {redTextStyle} : {blackTextStyle} }>{concentrationFA.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div style={bottomDottedStyle}>{weightDry ? <span style={concentrationAF > 0.001 ? {redTextStyle} : {blackTextStyle} }>{concentrationAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div style={bottomDottedStyle}>{weightDry ? <span style={concentrationFAAF > 0.001 ? {redTextStyle} : {blackTextStyle} }>{concentrationFAAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
          </div>
        </div>
        <div style={waBoxStyle}>
          <div style={ch ? waDivRed : waDivWhite}>
            <Button
              variant="outlined"
              style={ch ? whiteTextStyle : lightGreyTextStyle}
              onClick={null}
            >
              CH
            </Button>
          </div>
          <div style={am ? waDivRed : waDivWhite}>
            <Button
              variant="outlined"
              style={am ? whiteTextStyle : lightGreyTextStyle}
              onClick={null}
            >
              AM
            </Button>
          </div>
          <div style={cr ? waDivRed : waDivWhite}>
            <Button
              variant="outlined"
              style={cr ? whiteTextStyle : lightGreyTextStyle}
              onClick={null}
            >
              CR
            </Button>
          </div>
          <div style={umf ? waDivRed : waDivWhite}>
            <Button
              variant="outlined"
              style={umf ? whiteTextStyle : lightGreyTextStyle}
              onClick={null}
            >
              UMF
            </Button>
          </div>
        </div>
        { weightAshed && fractionWeightNum === 3 && parseFloat(fractionTotalWeight) !== parseFloat(weightAshed) && <div className={styles.warningTextLight}>
          The weight of all fractions does not match the total conditioned weight.
        </div>}
        { weightAshed && parseFloat(subFractionTotalWeight) > parseFloat(weightAshed) && <div className={styles.warningTextLight}>
          The weight of all analysed subfractions exceeds the total conditioned weight of the entire sample!
        </div>}
        { allHaveTypes === false && <div className={styles.warningTextLight}>
          Not all subfractions have been assigned an asbestos type (i.e. CH/AM/CR/UMF).
        </div>}
        { allHaveForms === false && <div className={styles.warningTextLight}>
          Not all subfractions have been assigned an asbestos form (i.e. AF/FA/ACM). This will result in an incorrect concentration.
        </div>}
        { match === false && <div className={styles.warningTextLight}>
          The cumulative result of the analysed fractions does not match with the reported asbestos result for the entire sample. Please check.
        </div>}
      </div>
    );
  }


//
// ADMIN/ISSUE
//

export const printCocBulk = (job, samples, me, staffList) => {
  let staffQualList = getStaffQuals(staffList);
  let log = {
    type: "Document",
    log: `Chain of Custody downloaded.`,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  let labToContactClient = 'No';
  if (job.labToContactClient) {
    labToContactClient = `Yes, ${job.labContactName ? job.labContactName : ''} ${job.labContactNumber ? job.labContactNumber : ''}`;
  }
  let labInstructions = job.labInstructions ? job.labInstructions : false;
  let sampleList = [];
  let analysisRequired = job.waAnalysis ? 'Western Australian Standard' : 'Bulk Analysis ID';
  let warning = '';
  if (job.priority === 1) warning = 'URGENT';
  if (job.isClearance) warning = warning + ' CLEARANCE';

  samples &&
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === job.uid) {
        let sampleMap = {};
        if (sample.disabled) return;
        sampleMap["no"] = sample.sampleNumber;
        sampleMap["description"] = writeCocDescription(sample);
        sampleMap["category"] = sample.category ? sample.category : 'Other';
        // sampleMap["material"] = sample.material ?
        //   sample.material.charAt(0).toUpperCase() + sample.material.slice(1) : '';
        sampleList.push(sampleMap);
      }
    });
  let report = {
    jobNumber: job.jobNumber,
    client: job.client,
    contactName: job.contactName,
    contactEmail: job.contactEmail,
    orderNumber: job.clientOrderNumber ? job.clientOrderNumber : '',
    address: job.address,
    type: job.type,
    analysisRequired,
    labToContactClient,
    labInstructions,
    warning: warning === '' ? false : warning,
    jobManager: job.manager,
    date: writeDates(Object.values(samples).filter(e => e.cocUid === job.uid), 'sampleDate'),
    personnel: getPersonnel(Object.values(samples).filter(s => s.cocUid === job.uid), 'sampledBy', null, false).map(p => p.name),
    samples: sampleList
  };
  //console.log(report);
  let url = job.waAnalysis ?
    "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc_wa.php?report=" +
    encodeURIComponent(JSON.stringify(report))
    :
    "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc_bulk.php?report=" +
    encodeURIComponent(JSON.stringify(report));
  window.open(url);
};

export const getStaffQuals = (staffList) => {
  let staffQualList = {};
  let aaNumbers = {};
  let ip402 = {};
  let tertiary = {};
  Object.values(staffList).forEach(staff => {
    staffQualList[staff.name] = {
      aaNumber: staff.aanumber ? staff.aanumber : false,
      ip402: staff.ip402 ? staff.ip402 : false,
      tertiary: staff.tertiary ? staff.tertiary : false,
    };
  });

  return staffQualList;
};

export const getPersonnel = (samples, field, qualList, onlyShowVerified) => {
  //console.log(samples);
  let personnel = {};
  samples &&
    Object.values(samples).forEach(sample => {
      if (sample[field] && (!onlyShowVerified || (onlyShowVerified && sample.verified))) {
        let person = sample[field];
        // console.log(person);
        if (person instanceof Array) {
          person.forEach(p => {
            if (p === Object(p)) personnel[p.name] = true;
            else personnel[p] = true;
          })
        } else {
          if (person === Object(person)) personnel[person.name] = true;
          else personnel[person] = true;
        }
      }
    });
  // console.log(personnel);
  let list = [];
  Object.keys(personnel).forEach(p => {
    let tertiary = null;
    let aaNumber = null;
    let ip402 = null;
    if (qualList && qualList[p]) {
      if (qualList[p].tertiary) tertiary = qualList[p].tertiary;
      if (qualList[p].aaNumber) aaNumber = qualList[p].aaNumber;
      if (qualList[p].ip402) ip402 = qualList[p].ip402;
    }
    let staffMap = {
      name: p,
      tertiary,
      aaNumber,
      ip402,
    };
    //console.log(staffMap);
    list.push(staffMap);
  });
  if (list.length === 0) return [{name: 'Not specified', tertiary: null, aaNumber: null, ip402: null}];
  //console.log(list);
  return list;
};

export const writePersonnelQualFull = personnel => {
  //console.log(personnel);
  return personnel.map(p => {
    if (!p.tertiary && !p.aaNumber && !p.ip402) return p.name;
    let quals = [];
    if (p.tertiary) quals.push(p.tertiary);
    if (p.ip402) quals.push('BOHS IP402');
    if (p.aaNumber) quals.push(`Asbestos Assessor No. ${p.aaNumber}`);
    return `${p.name} (${quals.join(', ')})`;
  });
};

export const writeVersionJson = (job, samples, version, staffList, me) => {
  // let aaNumbers = getAANumbers(staffList);
  let staffQualList = getStaffQuals(staffList);
  let sampleList = [];
  let cocStats = getStats(samples, job);
  console.log(cocStats);
  samples &&
    Object.values(samples).forEach(sample => {
      if (sample.verified && sample.cocUid === job.uid) {
        let sampleMap = {};
        if (sample.disabled || sample.onHold) return;
        sampleMap["no"] = sample.sampleNumber;
        sampleMap["description"] = writeReportDescription(sample);
        sampleMap["category"] = getSampleCategory(sample);
        sampleMap["weightReceived"] = sample.weightReceived ? `${sample.weightReceived}g` : 'N/A';
        sampleMap["result"] = writeResult(sample.result, sample.noAsbestosResultReason);
        sampleMap["checks"] = writeChecks(sample);
        sampleMap["footnote"] = sample.footnote ? sample.footnote : false;
        sampleMap["conditionings"] = writeConditionings(sample);
        sampleList.push(sampleMap);

        // LOG SAMPLE
        asbestosSamplesRef.doc(sample.uid).update(
        {
          issueVersion: version ? version : 1,
          issueDate: new Date(),
          issuedBy: {uid: me.uid, name: me.name},
        });
        logSample(job, sample, cocStats, version);
      }
    });
  let samplesFiltered = Object.values(samples).filter(s => s.cocUid === job.uid && !s.onHold);
  let report = {
    jobNumber: job.jobNumber,
    client: `${job.client} ${job.clientOrderNumber && Object.keys(job.clientOrderNumber).length > 0 ? job.clientOrderNumber : ''}`,
    address: job.address,
    sampleDate: writeDates(samplesFiltered, 'sampleDate'),
    // ktp: 'Stuart Keer-Keer',
    receivedDate: writeDates(samplesFiltered, 'receivedDate'),
    analysisDate: writeDates(samplesFiltered, 'analysisDate'),
    personnel: writePersonnelQualFull(getPersonnel(samplesFiltered, 'sampledBy', staffQualList, true)),
    waAnalysis: job.waAnalysis ? job.waAnalysis : false,
    // assessors: job.personnel.sort().map(staff => {
    //   return aaNumbers[staff];
    // }),
    analysts: getPersonnel(samplesFiltered, 'analyst', null, true).map(e => e.name),
    version: version ? version : 1,
    samples: sampleList
  };
  //console.log(report);
  return report;
};

export const issueTestCertificate = (job, samples, version, changes, staffList, me) => {
  console.log(staffList);
  console.log(me);
  console.log(changes);
  // first check all samples have been checked
  // if not version 1, prompt for reason for new version
  let json = writeVersionJson(job, samples, version, staffList, me);
  let versionHistory = job.versionHistory
    ? job.versionHistory
    : {};
  let log = {
    type: "Issue",
    log: `Version ${version} issued.`,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  versionHistory[version] = {
    issuedBy: {uid: me.uid, name: me.name },
    issueDate: new Date(),
    changes: changes ? changes : 'Not specified',
    data: json,
  };
  //console.log(versionHistory);
  let update = {
      currentVersion: version,
      versionHistory: versionHistory,
      versionUpToDate: true,
      lastModified: new Date(),
    };
  // //console.log(update)
  // //console.log(job);
  cocsRef.doc(job.uid).update(update);
};

export const printLabReport = (job, version, me, showModal) => {
  let report = job.versionHistory[version].data;
  let log = {
    type: "Document",
    log: `Test Certificate (version ${version}) downloaded.`,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me);
  if (report.version && report.version > 1) {
    let versionHistory = [];
    [...Array(report.version).keys()].forEach(i => {
      let formatDate = dateOf(job.versionHistory[i + 1].issueDate);
      versionHistory.push({
        version: i + 1,
        issueDate: moment(formatDate).format('D MMMM YYYY'),
        changes: job.versionHistory[i + 1].changes
      });
    });
    report = { ...report, versionHistory: versionHistory };
  }
  //console.log(report);
  showModal({
    modalType: DOWNLOAD_LAB_CERTIFICATE,
    modalProps: {
      report: report,
    }
  });
  // let url =
  //   "http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=" +
  //   JSON.stringify(report);
  // //console.log(url);
  // // this.setState({ url: url });
  // window.open(url);
  // fetch('http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(report));
};

export const deleteCoc = (job, me) => dispatch => {
  if (
    window.confirm("Are you sure you wish to delete this Chain of Custody?")
  ) {
    job.samples && Object.values(job.samples).forEach(sample => {
      if (sample.cocUid === job.uid) {
        let log = {
          type: "Delete",
          log: `Sample ${sample.sampleNumber} (${writeDescription(sample)}) deleted.`,
          sample: sample.uid,
          chainOfCustody: job.uid,
        };
        addLog("asbestosLab", log, me);
        asbestosSamplesRef.doc(sample.uid).update({ deleted: true })
      }
    });
    let log = {
      type: "Delete",
      log: "Chain of Custody deleted.",
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me);
    cocsRef
      .doc(job.uid)
      .update({ deleted: true, });

    dispatch({ type: DELETE_COC, payload: job.uid });
    // fetchCocs();
  } else return;
};

//
// HELPER FUNCTIONS
//

const highlightGreenStyle = { color: 'green', marginBottom: 12, backgroundColor: '#eee', };
const highlightRedStyle = { color: 'red', marginBottom: 12, backgroundColor: '#eee', }

export const analyticalCriteraOK = sample => {
  let color = 'black';
  let text = '';
  let compulsory = false;
  if (sample.analyticalCriteria !== undefined && sample.analyticalCriteria.dispersion === true && sample.analyticalCriteria.morphology === true) compulsory = true;
  let optionalScore = 0;
  if (sample.analyticalCriteria !== undefined) {
    if (sample.analyticalCriteria.pleochroism) optionalScore += sample.analyticalCriteria.pleochroism;
    if (sample.analyticalCriteria.orientation) optionalScore += sample.analyticalCriteria.orientation;
    if (sample.analyticalCriteria.extinction) optionalScore += sample.analyticalCriteria.extinction;
  }
  if (sample.analyticalCriteria === undefined) {
    text = 'Analytical criteria not set.'
  } else if (compulsory) {
    if (parseInt(optionalScore) < 2) {
      text = 'Fibres must display at least 2 of the following optical properties: Pleochroism, Orientation and Extinction';
      color = 'red';
    } else {
      text = 'Fibres display properties consistent with positive identification';
      color = 'green';
    }
  } else {
    text = 'Fibres must have positive dispersion staining and morphology identification';
    color = 'red';
  }
  return (<div style={color === 'red' ? highlightRedStyle : highlightGreenStyle}>{text}</div>);
};

export const sortSamples = samples => {
  let sampleMap = {};
  samples.forEach(sample => {
    if (sampleMap[sample.jobnumber]) {
      sampleMap[sample.jobnumber].push(sample);
    } else {
      sampleMap[sample.jobnumber] = [sample];
    }
  });
  return sampleMap;
};

export const writeDescription = (sample) => {
  var str = '';
  if (sample.genericLocation) str = sample.genericLocation;
  if (sample.specificLocation) {
    if (str === '') {
      str = sample.specificLocation;
    } else {
      str = str + ', ' + sample.specificLocation;
    }
  }
  if (str !== '') str = str + ': ';
  if (sample.description && sample.material) {
    str = str + sample.description + ", " + sample.material;
  } else if (sample.description) {
    str = str + sample.description;
  } else if (sample.material) {
    str = str + sample.material;
  } else {
    str = str + "No description";
  }
  if (str.length > 1) str = str.charAt(0).toUpperCase() + str.slice(1);
  return str;
};

export const writeReportDescription = (sample) => {
  let report = sample.report ? sample.report : {soilDescription: true, layers: true, dimensions: true, weight: true,};
  let lines = [];
  // Generic information
  // LOCATION (e.g.
  // Lounge
  // 1st Floor, Dining Room
  // 2nd Floor
  // )
  let genericLocation = sample.genericLocation && sample.genericLocation.length > 0 ? sample.genericLocation.charAt(0).toUpperCase() + sample.genericLocation.slice(1) : '';
  let specificLocation = sample.specificLocation && sample.specificLocation.length > 0 ? sample.specificLocation.charAt(0).toUpperCase() + sample.specificLocation.slice(1) : '';
  let location = genericLocation.length > 0 && specificLocation.length > 0 ? genericLocation + ", " + specificLocation : genericLocation + specificLocation;

  // e.g. Dark grey vinyl sheet flooring (vinyl with paper backing)
  // e.g. Soffits (cement sheet)
  // e.g. Cement sheet
  // e.g. Soffits
  let description = sample.description && sample.description.length > 0 ? sample.description.charAt(0).toUpperCase() + sample.description.slice(1) : '';
  let material = sample.material && sample.material.length > 0 ? sample.material : '';
  let fullDesc = description.length > 0 && material.length > 0 ? description + ' (' + material + ')' : (description + material).charAt(0).toUpperCase() + (description + material).slice(1);

  if ((location + fullDesc).length > 0) lines.push(location.length > 0 && fullDesc.length > 0 ? location + ': ' + fullDesc : location + fullDesc);

  // ~ at start means make italic, * means make bold
  let soilDetails = writeSoilDetails(sample.soilDetails);
  if (soilDetails !== 'No details.') lines.push("~" + soilDetails);
  if (report['layers'] === true && sample.layers !== undefined && sample.layerNum !== undefined) {
    let layArray = [];
    [...Array(sample.layerNum).keys()].forEach(num => {
      if (sample.layers[`layer${num+1}`] !== undefined) {
        let lay = sample.layers[`layer${num+1}`];
        let layStr = 'L' + (num+1).toString() + ': ' + lay.description.charAt(0).toUpperCase() + lay.description.slice(1);
        if (getBasicResult(lay) === 'positive') layStr = layStr + '†';
        if (lay.description !== undefined) layArray.push(layStr);
      }
    });
    if (layArray.length > 0) lines.push(layArray.join(' / '));
    //console.log(layArray);
  }
  let dimensions = '';
  if (report['dimensions'] === true) {
    let dim = [];
    if (sample.dimensions) {
      if (sample.dimensions.length) dim.push(sample.dimensions.length);
      if (sample.dimensions.width) dim.push(sample.dimensions.width);
      if (sample.dimensions.depth) dim.push(sample.dimensions.depth);
    }
    if (dim.length > 0) dimensions = dim.join(' x ') + ' mm';
  }
  // if (report['weight'] === true) {
  //   if (dimensions.length > 0) dimensions = dimensions + ', ';
  //   // if (sample.weightAnalysed) dimensions = dimensions + sample.weightAnalysed + "g"
  //   if (sample.weightReceived) dimensions = dimensions + sample.weightReceived + "g"
  // }
  if (dimensions.length > 0) lines.push(dimensions);
  return lines.join('@~');
}

export const getSampleCategory = sample => {
  if (sample.category) return sample.category;
  // Could add in some logic here to try find the category against a dictionary of material -> category
  return 'Other';
}

export const writeCocDescription = (sample) => {
  // let returnStr = '';
  // let genericLocation = sample.genericLocation && sample.genericLocation.length > 0 ? sample.genericLocation.charAt(0).toUpperCase() + sample.genericLocation.slice(1) : '';
  // let specificLocation = sample.specificLocation && sample.specificLocation.length > 0 ? sample.specificLocation.charAt(0).toUpperCase() + sample.specificLocation.slice(1) : '';
  // let location = genericLocation.length > 0 && specificLocation.length > 0 ? genericLocation + ", " + specificLocation : genericLocation + specificLocation;
  //
  // let description = sample.description && sample.description.length > 0 ? sample.description.charAt(0).toUpperCase() + sample.description.slice(1) : '';
  //
  // if ((location + description).length > 0) returnStr = (location.length > 0 && description.length > 0) ? location + ': ' + description : location + description;

  var str = '';
  if (sample.genericLocation) str = sample.genericLocation;
  if (sample.specificLocation) {
    if (str === '') {
      str = sample.specificLocation;
    } else {
      str = str + ', ' + sample.specificLocation;
    }
  }
  if (str !== '') str = str + ': ';
  if (sample.description && sample.material) {
    str = str + sample.description + ", " + sample.material;
  } else if (sample.description) {
    str = str + sample.description;
  } else if (sample.material) {
    str = str + sample.material;
  } else {
    str = str + "No description";
  }

  if (sample.onHold) return str + '@~*ON HOLD';
  else return str;
}

export const getResultColor = (state, type, yesColor) => {
  if(state && state[type] === true) return yesColor;
  return 'Off';
}

export const getSampleColors = (sample) => {
  if (!sample || !sample.result) {
    return {
      confirm: '',
      ch: 'Off',
      am: 'Off',
      cr: 'Off',
      umf: 'Off',
      no: 'Off',
      org: 'Off',
      smf: 'Off',
    };
  } else {
    let res = sample.result;
    let confirm = getAllConfirmResult(sample);
    let confirmColor = 'Green';
    if (confirm === 'no') {
      confirmColor = 'Red';
    } else if (confirm === 'asbestosTypesWrong') {
      confirmColor = 'Orange';
    } else if (confirm === 'none') {
      confirmColor = '';
    }
    let returnMap = {
      // cameraColor: sample.imagePathRemote ? styles.greenIcon : styles.greyIcon,
      // receivedColor: sample.receivedByLab ? styles.greenIcon : styles.greyIcon,
      // analysisColor: sample.analysisStarted ? styles.greenIcon : styles.greyIcon,
      // verifiedColor: sample.verified ? styles.greenIcon : styles.greyIcon,
      // waColor: sample.waAnalysisComplete ? styles.greenIcon : styles.greyIcon,
      confirm: confirmColor ? confirmColor : '',
      ch: getResultColor(res, 'ch', 'Bad'),
      am: getResultColor(res, 'am', 'Bad'),
      cr: getResultColor(res, 'cr', 'Bad'),
      umf: getResultColor(res, 'umf', 'Bad'),
      no: getResultColor(res, 'no', 'Ok'),
      org: getResultColor(res, 'org', 'Benign'),
      smf: getResultColor(res, 'smf', 'Benign'),
    };
    return returnMap;
  }
};

export const getConfirmColor = (sample) => {
  let res = sample.result;
  let confirm = getAllConfirmResult(sample);
  let confirmColor = 'Green';
  if (confirm === 'no') {
    confirmColor = 'Red';
  } else if (confirm === 'asbestosTypesWrong') {
    confirmColor = 'Orange';
  } else if (confirm === 'none') {
    confirmColor = '';
  }
  //console.log(confirmColor);
  return confirmColor;
};

export const getWAFractionDetails = (sample, fraction) => {
  let result = {
    totalAsbestosWeight: 0,
    types: {},
    result: {},
  };

  if (sample && sample.waLayerNum) {
    [...Array(sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : 3).keys()].forEach(num => {
      let layer = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
      if (layer) {
        if (layer.concentration && layer.weight) result.totalAsbestosWeight = result.totalAsbestosWeight + (parseFloat(layer.weight) * parseFloat(layer.concentration)/ 100)
        if (layer.type) result.types[layer.type] = true;
        if (layer.result) result.result = mergeAsbestosResult(result.result, layer.result);
      }
    });
  }
  console.log(result);

  return result;
};

export const getWATotalDetails = (sample) => {
  // Set detection limits

  let result = {
    totalAsbestosWeight: 0,
    types: {},
    result: {},
    asbestosInACMConc: 0,
    asbestosInFAAFConc: 0,
    asbestosInFAConc: 0,
    asbestosInAFConc: 0,
    asbestosInACM: 0,
    asbestosInFA: 0,
    asbestosInAF: 0,
    allHaveTypes: true,
    allHaveForms: true,
  };
  if (sample && sample.waSoilAnalysis) {
    fractionNames.forEach(fraction => {
      [...Array(sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : 3).keys()].forEach(num => {
        let layer = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
        if (layer) {
          if (layer.concentration && layer.weight) {
            let weight = (parseFloat(layer.weight) * parseFloat(layer.concentration)/ 100);
            result.totalAsbestosWeight = result.totalAsbestosWeight + weight;
            if (!layer.type) result.allHaveTypes = false;
            if (!layer.result) result.allHaveForms = false;
            if (layer.type === 'acm') result.asbestosInACM = result.asbestosInACM + weight;
              else if (layer.type === 'fa') result.asbestosInFA = result.asbestosInFA + weight;
              else if (layer.type === 'af') result.asbestosInAF = result.asbestosInAF + weight;
          }
          if (layer.type) result.types[layer.type] = true;
          if (layer.result) result.result = mergeAsbestosResult(result.result, layer.result);
        }
      });
    });
    if (sample.weightDry) {
      result.asbestosInACMConc = parseFloat(((result.asbestosInACM/sample.weightDry) * 100));
      result.asbestosInFAAFConc = parseFloat(((result.asbestosInFA + result.asbestosInAF)/sample.weightDry) * 100);
      result.asbestosInFAConc = parseFloat((result.asbestosInFA/sample.weightDry) * 100);
      result.asbestosInAFConc = parseFloat((result.asbestosInAF/sample.weightDry) * 100);
    }
  }
  console.log(result);
  return result;
}

export const getAllConfirmResult = sample => {
  if (!sample.confirm) return 'none';
  if (!sample.result) return 'none';

  let results = [];

  {[...Array(sample.confirm.totalNum ? sample.confirm.totalNum : 1).keys()].map(num => {
    if (sample.confirm[num+1] && sample.confirm[num+1].deleted !== true) {
      results.push(compareAsbestosResult(sample.confirm[num+1], sample));
    }
  })}

  let perfectMatches = 0;
  let differentNonAsbestos = 0;
  let differentAsbestos = 0;
  let falseResults = 0;
  results.forEach(result => {
    if (result === 'yes') perfectMatches += 1;
    if (result === 'differentAsbestos') differentAsbestos += 1;
    if (result === 'differentNonAsbestos') differentNonAsbestos += 1;
    if (result === 'no') falseResults += 1;
  });
  if (falseResults > 0) return 'no';
  if (differentAsbestos > 0) return 'asbestosTypesWrong';
  if (differentNonAsbestos > 0) return 'nonAsbestosTypesWrong';
  if (perfectMatches > 0) return 'yes';
  return 'none';
};

export const compareAsbestosResult = (confirm, result) => {
  let basicConfirm = getBasicResult(confirm);
  let basicResult = getBasicResult(result);
  if (basicConfirm === 'none' || basicResult === 'none') return 'none';
  if (basicConfirm !== basicResult) return 'no';
  let differentAsbestos = false;
  if (basicResult === 'positive') {
    ['ch','am','cr','umf'].forEach(type => {
      if ((result.result[type] === true && confirm.result[type] !== true) ||
      (confirm.result[type] === true && result.result[type] !== true)) differentAsbestos = true;
    });
  }
  if (differentAsbestos) return 'differentAsbestos';
  let differentNonAsbestos = false;
  ['org','smf'].forEach(type => {
    if ((result.result[type] === true && confirm.result[type] !== true) ||
    (confirm.result[type] === true && result.result[type] !== true)) differentNonAsbestos = true;
  });
  if (differentNonAsbestos) return 'differentNonAsbestos';
  return 'yes';
}

export const mergeAsbestosResult = (original, add) => {
  let merge = original;
  ['ch','am','cr','umf','org','smf','no',].forEach(type => {
    if (add[type]) merge[type] = true;
  });
  if (merge['no'] && (merge['ch'] || merge['am'] || merge['cr'] || merge['umf'])) merge['no'] = false;
  return merge;
}

export const writeChecks = (sample) => {
  let checks = [];
  if (sample.confirm) {
    Object.values(sample.confirm).forEach(confirm => {
      let match = compareAsbestosResult(confirm, sample);
      if (match === 'yes' || match === 'differentNonAsbestos') {
        checks.push(confirm.analyst);
      }
    });
  }
  return checks;
}

export const writeConditionings = (sample) => {
  let conditioningMap = {
    dcm: 'Sample prepared in acid solution',
    flame: 'Sample conditioned with flame',
    furnace: 'Sample conditioned at ~400­°C',
    lowHeat: 'Sample conditioned at ~105°C',
    mortarAndPestle: 'Sample prepared using mortar and pestle',
    sieved: 'Sample prepared using sieving',
  };
  let conditionings = [];
  if (sample.sampleConditioning) {
    Object.keys(sample.sampleConditioning).forEach(prep => {
      if (sample.sampleConditioning[prep]) {
        conditionings.push(conditioningMap[prep]);
      }
    });
  }
  return conditionings;
}

export const getBasicResult = (sample) => {
  let result = "none";
  if (
    sample.result &&
    (sample.result["ch"] ||
      sample.result["am"] ||
      sample.result["cr"] ||
      sample.result["umf"])
  )
    result = "positive";
  if (sample.result && sample.result["no"])
    result = "negative";
  return result;
}

export const getSampleStatus = (sample) => {
  let status = "inTransit";
  if (sample.verified) status = "verified";
  else if (writeShorthandResult(sample.result) !== 'NO RESULT') status = "analysisRecorded";
  else if (sample.analysisStarted) status = "analysisStarted";
  else if (sample.receivedByLab) status = "received";
  return status;
}

export const traceAnalysisRequired = sample => {
  let text = 'Trace Analysis Required';
  if (sample.classification === 'homo' && sample.asbestosEvident === true) text = 'No Trace Analysis Required';
  return (<div className={styles.highlightBoxBlack}>{text}</div>);
}

export const writeResult = (result, noAsbestosResultReason) => {
  let detected = [];
  if (result === undefined) {
    if (noAsbestosResultReason) {
      let reasonMap = {
        notAnalysed: 'Not Analysed',
        sampleSizeTooSmall: 'Sample Size Too Small',
        sampleNotReceived: 'Sample Not Received By Lab',
        other: 'Not Analysed'
      };
      return reasonMap[noAsbestosResultReason];
    }
    return "Not Analysed";
  }
  Object.keys(result).forEach(type => {
    if (result[type]) detected.push(type);
  });
  if (detected.length < 1) return "Not Analysed";
  let others = '';
  let otherArray = [];
  if (result["org"]) otherArray.push("Organic Fibres");
  if (result["smf"]) otherArray.push("Synthetic Mineral Fibres");
  if (otherArray.length > 0) others = `@~(${otherArray.join(', ')})`
  if (result["no"]) return "No Asbestos Detected" + others;
  let asbestos = [];
  if (result["ch"]) asbestos.push("Chrysotile");
  if (result["am"]) asbestos.push("Amosite");
  if (result["cr"]) asbestos.push("Crocidolite");
  if (asbestos.length > 0) {
    asbestos[asbestos.length - 1] =
      asbestos[asbestos.length - 1] + " Asbestos";
  }
  let str = "";
  if (asbestos.length === 1) {
    str = asbestos[0];
  } else if (asbestos.length > 1) {
    var last_element = asbestos.pop();
    str = asbestos.join(", ") + " and " + last_element;
  }
  detected.forEach(detect => {
    if (detect === "umf") {
      if (asbestos.length > 0) {
        str = str + " and Unidentified Mineral Fibres (UMF)";
      } else {
        str = "Unidentified Mineral Fibres (UMF)";
      }
    }
  });
  // Don't show other fibres with positives to avoid confusion
  return str.charAt(0).toUpperCase() + str.slice(1) + " Detected" + others;
};

export const writeShorthandResult = result => {
  let detected = [];
  if (result === undefined) return "NO RESULT";
  Object.keys(result).forEach(type => {
    if (result[type]) detected.push(type);
  });
  if (detected.length < 1) return "NO RESULT";
  let str = '';
  if (detected[0] === "no") str = "NO ";
  else {
    if (result["ch"]) str = "CH ";
    if (result["am"]) str += "AM ";
    if (result["cr"]) str += "CR ";
    if (result["umf"]) str += "UMF ";
  }
  let other = '';
  if (result["org"]) other = "ORG ";
  if (result["smf"]) other += "SMF ";
  str = str.slice(0, -1);
  if (other !== '') str = str + " (" + other.slice(0,-1) + ")";
  return str;
};

export const writeSoilDetails = details => {
  let dictionary = {
    subFractionType: {
      cobbles: 'cobbly ',
      gravel: 'gravelly ',
      sand: 'sandy ',
      clay: 'clayey ',
      silt: 'silty ',
      topsoil: 'organic soily ',
      'organic clay': 'organic clayey ',
      'organic silt': 'organic silty ',
      'organic sand': 'organic sandy ',
      peat: 'peaty ',
    },
    fractionQualifier: {
      fine: 'fine',
      medium: 'medium',
      coarse: 'coarse',
      finetocoarse: 'fine to coarse',
      finetomedium: 'fine to medium',
      mediumtocoarse: 'medium to coarse',
      firm: 'firm',
      spongy: 'spongy',
      plastic: 'plastic',
      fibrous: 'fibrous',
      amorphous: 'amorphous',
    },
    plasticity: {
      'low plasticity': 'slightly plastic',
      'medium plasticity': 'moderately plastic',
      'high plasticity': 'highly plastic'
    }
  }
  let finalStr = '';
  let sections = [];
  if (details && details.majorFractionType) {

    // SOIL NAME
    let str = '';
    let minorFractions = [];
    if (details.subFractionType && details.subFractionType !== '') {
      str = dictionary.subFractionType[details.subFractionType];
    }
    if ((details.majorFractionType === 'sand' || details.majorFractionType === 'gravel' || details.majorFractionType === 'organic sand' || details.majorFractionType === 'peat') && details.majorFractionQualifier) {
      str = str + dictionary.fractionQualifier[details.majorFractionQualifier] + ' ';
    }
    str = str + details.majorFractionType.toUpperCase() + ' ';
    if (details.someFractionTypes) {
      let fractionArray = [];
      Object.keys(details.someFractionTypes).forEach(key => {
        if (details.someFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) {
        if (fractionArray.length > 1) {
          minorFractions.push('some ' + fractionArray.slice(0, -1).join(', ') + ' and ' + fractionArray.slice(-1));
        } else {
          minorFractions.push('some ' + fractionArray[0]);
        }
      }
    }
    if (details.minorFractionTypes) {
      let fractionArray = [];
      Object.keys(details.minorFractionTypes).forEach(key => {
        if (details.minorFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) {
        if (fractionArray.length > 1) {
          minorFractions.push('minor ' + fractionArray.slice(0, -1).join(', ') + ' and ' + fractionArray.slice(-1));
        } else {
          minorFractions.push('minor ' + fractionArray[0]);
        }
      }
    }
    if (details.traceFractionTypes) {
      let fractionArray = [];
      Object.keys(details.traceFractionTypes).forEach(key => {
        if (details.traceFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) {
        if (fractionArray.length > 1) {
          minorFractions.push('trace of ' + fractionArray.slice(0, -1).join(', ') + ' and ' + fractionArray.slice(-1));
        } else {
          minorFractions.push('trace of ' + fractionArray[0]);
        }
      }
    }
    if (minorFractions.length > 0) {
      if (minorFractions.length === 1) str += 'with ' + minorFractions[0];
      else str += 'with ' + minorFractions.slice(0, -1).join(', ') + ' and ' + minorFractions.slice(-1);
    }
    sections.push(str);
    str = '';

    // VISUAL CHARACTERISTICS
    let section = [];
    if (details.color && details.color !== '') {
      let color = '';
      if (details.colorShade && details.colorShade !== '') color += details.colorShade + ' ';
      if (details.colorQualifier && details.colorQualifier !== '') color += details.colorQualifier + ' ';
      color += details.color;
      if (details.type !== 'coarse' && details.colorPattern && details.colorPattern !== '' && details.colorSecondary && details.colorSecondary !== '') {
        color += ', ' + details.colorPattern + ' ' + details.colorSecondary;
      }
      section.push(color);
    }
    if (details.structure && details.structure !== '') {
      section.push(details.structure);
    }
    if (section.length > 0) {
      sections.push(section.join(', '));
    }

    finalStr = sections.map(x => x.trim()).join('; ') + '. ';

    // SOIL MASS QUALIFICATIONS
    section = [];
    sections = [];
    if (details.type !== 'coarse' && details.strength && details.strength !== '') sections.push(details.strength);
    if (details.type === 'coarse' && details.density && details.density !== '') sections.push(details.density);
    if (details.moisture && details.moisture !== '') sections.push(details.moisture);
    if (details.grading && details.grading !== '') sections.push(details.grading);
    if (details.bedding && details.bedding !== '') sections.push(details.bedding);
    if (details.majorFractionType === 'clay' && details.plasticity && details.plasticity !== '') sections.push(details.plasticity);
    if (details.type === 'fine' && details.strength && details.sensitivityStrength && details.strength !== '' && details.sensitivityStrength !== '') {
       sections.push(getSoilSensitivity(details).toLowerCase());
    }

    // SOIL FRACTION QUALIFICATIONS
    // Add major fraction
    if (details.majorFractionType && details.majorFractionType !== '') {
      let temp = details.majorFractionType;
      if ((details.majorFractionType === 'sand' || details.majorFractionType === 'gravel' || details.majorFractionType === 'organic sand' || details.majorFractionType === 'peat') && details.majorFractionQualifier && details.majorFractionQualifier !== '') temp += ', ' + dictionary.fractionQualifier[details.majorFractionQualifier];
      if (details.type !== 'fine' && details.particleShape && details.particleShape !== '') temp += ', ' + details.particleShape;
      if (details.type !== 'fine' && details.particleShapeSecondary && details.particleShapeSecondary !== '') temp += ', ' + details.particleShapeSecondary;
      if (details.majorFractionType === 'clay' && details.plasticity && details.plasticity !== '') temp += ', ' + dictionary.plasticity[details.plasticity];
      sections.push(temp);
    }
    // Add subordinate fraction
    if (details.subFractionType && details.subFractionType !== '') {
      let temp = details.subFractionType;
      if ((details.subFractionType === 'sand' || details.subFractionType === 'gravel' || details.subFractionType === 'organic sand' || details.subFractionType === 'peat') && details.subFractionQualifier && details.subFractionQualifier !== '') temp += ', ' + dictionary.fractionQualifier[details.subFractionQualifier];
      if (details.subFractionType === 'clay' && details.plasticity && details.plasticity !== '') temp += ', ' + dictionary.plasticity[details.plasticity];
      sections.push(temp);
    }
    // Add minor fraction
    let fractionArray = [];
    Object.keys(details.someFractionTypes).forEach(key => {
      if (details.someFractionTypes[key] === true) fractionArray.push(key);
    });
    Object.keys(details.minorFractionTypes).forEach(key => {
      if (details.minorFractionTypes[key] === true) fractionArray.push(key);
    });
    Object.keys(details.traceFractionTypes).forEach(key => {
      if (details.traceFractionTypes[key] === true) fractionArray.push(key);
    });
    if (fractionArray.length > 1) sections.push(fractionArray.slice(0, -1).join(', ') + ' and ' + fractionArray.slice(-1));
    else if (fractionArray.length === 1) sections.push(fractionArray[0]);

    if (details.additionalStructures && details.additionalStructures !== '') sections.push(details.additionalStructures.toLowerCase());
    if (sections.length > 0) {
      let temp = sections.join('; ');
      finalStr += temp.charAt(0).toUpperCase() + temp.slice(1);
    }

    if (details.geological && details.geological !== '') finalStr += ' (' + details.geological.toUpperCase() + ')';
    finalStr += '.';

  } else {
    finalStr = 'No details.';
  }
  return finalStr;
};

export const getStatus = (samples, job) => {
  let jobID = job.uid;
  let versionUpToDate = job.versionUpToDate;
  let status = '';
  let totalSamples = 0;

  let numberReceived = 0;
  let numberAnalysisStarted = 0;
  let numberResult = 0;
  let numberVerified = 0;
  let numberWAAnalysisIncomplete = 0;

  if (samples && Object.values(samples).length > 0) {
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === jobID) {
        totalSamples = totalSamples + 1;
        if (sample.receivedByLab) numberReceived = numberReceived + 1;
        if (sample.analysisStarted) numberAnalysisStarted = numberAnalysisStarted + 1;
        if (sample.verified) numberVerified = numberVerified + 1;
        if (job.waAnalysis && !sample.waAnalysisComplete) numberWAAnalysisIncomplete = numberWAAnalysisIncomplete + 1;
        if (getBasicResult(sample) !== 'none') numberResult = numberResult + 1;
      }
    });
  }

  if (versionUpToDate) {
    if (job.mostRecentIssueSent) status = 'Issued and Sent';
    else status = 'Issued';
  } else if (totalSamples === 0) {
    status = 'No Samples';
  } else if (numberReceived === 0) {
    status = 'In Transit';
  } else if (numberAnalysisStarted === 0) {
    status = 'Received By Lab';
  } else if (numberVerified === totalSamples) {
    status = 'Ready For Issue';
  } else if (numberResult === 0) {
    status = 'Analysis Begun';
  } else if (numberResult === totalSamples && numberVerified === 0) {
    if (job.waAnalysis && numberWAAnalysisIncomplete > 0) status = 'Bulk ID Complete, WA Analysis Incomplete';
      else status = 'Analysis Complete';
  } else if (numberVerified > 0) {
    status = 'Analysis Partially Verified';
  } else if (numberResult > 0) {
    status = 'Analysis Partially Complete';
  } else if (numberAnalysisStarted > 0) {
    status = 'Analysis Begun on Some Samples';
  } else if (numberReceived > 0) {
    status = 'Partially Received By Lab';
  }

  if (totalSamples !== 0 && job.status !== status) cocsRef.doc(jobID).update({ status });
  return status;
};

export const getStats = (samples, job) => {
  let jobID = job.uid;
  let versionUpToDate = job.versionUpToDate;
  // //console.log('Getting stats');
  // //console.log(job);
  let nz = moment.tz.setDefault("Pacific/Auckland");
  moment.tz.setDefault("Pacific/Auckland");
  moment.updateLocale('en', {
    // workingWeekdays: [1,2,3,4,5],
    workinghours: {
      0: null,
      1: ['08:30:00', '17:00:00'],
      2: ['08:30:00', '17:00:00'],
      3: ['08:30:00', '17:00:00'],
      4: ['08:30:00', '17:00:00'],
      5: ['08:30:00', '17:00:00'],
      6: null,
    },
    holidays: [],
  });

  let totalSamples = 0;
  let positiveSamples = 0;
  let negativeSamples = 0;

  // let numberReceived = 0;
  // let numberAnalysisStarted = 0;
  // let numberResult = 0;
  // let numberVerified = 0;

  let maxTurnaroundTime = 0;
  let averageTurnaroundTime = 0;
  let totalTurnaroundTime = 0;
  let numTurnaroundTime = 0;

  let maxAnalysisTime = 0;
  let averageAnalysisTime = 0;
  let totalAnalysisTime = 0;
  let numAnalysisTime = 0;

  let maxReportTime = 0;
  let averageReportTime = 0;
  let totalReportTime = 0;
  let numReportTime = 0;

  let maxTurnaroundBusinessTime = 0;
  let averageTurnaroundBusinessTime = 0;
  let totalTurnaroundBusinessTime = 0;
  let numTurnaroundBusinessTime = 0;

  let maxAnalysisBusinessTime = 0;
  let averageAnalysisBusinessTime = 0;
  let totalAnalysisBusinessTime = 0;
  let numAnalysisBusinessTime = 0;

  let maxReportBusinessTime = 0;
  let averageReportBusinessTime = 0;
  let totalReportBusinessTime = 0;
  let numReportBusinessTime = 0;

  let confirmedResults = 0;
  let confirmedResultsOK = 0;
  let confirmedResultsConflict = 0;
  let confirmedResultsWrong = 0;

  if (samples && Object.values(samples).length > 0) {
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === jobID) {
        totalSamples = totalSamples + 1;
        // if (sample.receivedByLab) numberReceived = numberReceived + 1;
        // if (sample.analysisStarted) numberAnalysisStarted = numberAnalysisStarted + 1;
        if (sample.result && sample.analysisDate && sample.receivedDate) {
          // numberResult = numberResult + 1;
          if (sample.result['no']) {
            negativeSamples = negativeSamples + 1;
          } else positiveSamples = positiveSamples + 1;
          if (sample.analysisTime) {
            if (sample.analysisTime > maxAnalysisTime) maxAnalysisTime = sample.analysisTime;
            totalAnalysisTime = totalAnalysisTime + sample.analysisTime;
            numAnalysisTime = numAnalysisTime + 1;
            averageAnalysisTime = totalAnalysisTime / numAnalysisTime;
          }
          let analysisBusinessTime = moment(sample.analysisDate.toDate()).workingDiff(moment(sample.receivedDate.toDate()));
          if (analysisBusinessTime > maxAnalysisBusinessTime) maxAnalysisBusinessTime = analysisBusinessTime;
          totalAnalysisBusinessTime = totalAnalysisBusinessTime + analysisBusinessTime;
          numAnalysisBusinessTime = numAnalysisBusinessTime + 1;
          averageAnalysisBusinessTime = totalAnalysisBusinessTime / numAnalysisBusinessTime;
        }
        if (sample.verified && sample.receivedDate && sample.verifyDate && sample.analysisDate) {
          // numberVerified = numberVerified + 1;
          if (sample.turnaroundTime) {
            if (sample.turnaroundTime > maxTurnaroundTime) maxTurnaroundTime = sample.turnaroundTime;
            totalTurnaroundTime = totalTurnaroundTime + sample.turnaroundTime;
            numTurnaroundTime = numTurnaroundTime + 1;
            averageTurnaroundTime = totalTurnaroundTime / numTurnaroundTime;
            // Check for time between analysis logging and verification
            let turnaroundBusinessTime = moment(sample.verifyDate.toDate()).workingDiff(moment(sample.receivedDate.toDate()));
            if (turnaroundBusinessTime > maxTurnaroundBusinessTime) maxTurnaroundBusinessTime = turnaroundBusinessTime;
            totalTurnaroundBusinessTime = totalTurnaroundBusinessTime + turnaroundBusinessTime;
            numTurnaroundBusinessTime = numTurnaroundBusinessTime + 1;
            averageTurnaroundBusinessTime = totalTurnaroundBusinessTime / numTurnaroundBusinessTime;

            if (sample.analysisTime) {
              let verifyTime = sample.turnaroundTime - sample.analysisTime;
              if (verifyTime > maxReportTime) maxReportTime = verifyTime;
              totalReportTime = totalReportTime + verifyTime;
              numReportTime = numReportTime + 1;
              averageReportTime = totalReportTime / numReportTime;
            }

            let reportBusinessTime = moment(sample.verifyDate.toDate()).workingDiff(moment(sample.analysisDate.toDate()));
            totalReportBusinessTime = totalReportBusinessTime + reportBusinessTime;
            numReportBusinessTime = numReportBusinessTime + 1;
            averageReportBusinessTime = totalReportBusinessTime / numReportBusinessTime;
          }
        }
        let confirm = getAllConfirmResult(sample);
        if (confirm !== 'none') {
          confirmedResults += 1;
          if (confirm === 'no') confirmedResultsWrong += 1;
          if (confirm === 'asbestosTypesWrong') confirmedResultsConflict += 1;
          if (confirm === 'yes' || confirm === 'nonAsbestosTypesWrong') confirmedResultsOK += 1;
        }
      }
    });
  }

  let stats = {
    totalSamples,
    positiveSamples,
    negativeSamples,
    // numberReceived,
    // numberAnalysisStarted,
    // numberResult,
    // numberVerified,
    maxTurnaroundTime,
    averageTurnaroundTime,
    maxAnalysisTime,
    averageAnalysisTime,
    maxReportTime,
    averageReportTime,
    maxTurnaroundBusinessTime,
    averageTurnaroundBusinessTime,
    maxAnalysisBusinessTime,
    averageAnalysisBusinessTime,
    maxReportBusinessTime,
    averageReportBusinessTime,
    confirmedResults,
    confirmedResultsOK,
    confirmedResultsConflict,
    confirmedResultsWrong,
  };

  if (totalSamples !== 0 && job.stats !== stats) cocsRef.doc(jobID).update({ stats });
  return stats;
};

export const getSoilSensitivity = details => {
  // see page 16 of NZ Geotechnical Society guide
  let dictionary = {
    'very soft': 6,
    soft: 19,
    firm: 38,
    stiff: 75,
    'very stiff': 150,
    hard: 350,
  };
  let ratio = dictionary[details.strength]/dictionary[details.sensitivityStrength];
  let sensitivity = 'Insensitive, normal';
  if (ratio >= 2 && ratio < 4) sensitivity = 'Moderately sensitive';
  else if (ratio >=4 && ratio < 8) sensitivity = 'Sensitive';
  else if (ratio >=8 && ratio < 16) sensitivity = 'Extra sensitive';
  else if (ratio >=16) sensitivity = 'Quick';
  return sensitivity;
}

export const writeSampleConditioningList = conditioning => {
  let conMap = {
    furnace: 'Furnace',
    flame: 'Flame',
    lowHeat: 'Low Heat/Drying',
    dcm: 'Dichloromethane',
    mortarAndPestle: 'Mortar and Pestle',
    sieved: 'Sieved',
  };
  let cons = [];

  Object.keys(conMap).forEach(key => {
    if (conditioning[key]) cons.push(conMap[key]);
  });

  if (cons.length > 0) return cons.join(', ');
  else return 'No conditioning';
}

export const writeSampleMoisture = (sample, total) => {
  let preWeight = null;
  let postWeight = null;

  if (sample.weightSubsample) {
    if (sample.weightSubsample.includes('<')) preWeight = '0';
    else preWeight = sample.weightSubsample;
  } else if (sample.weightReceived) {
    if (sample.weightReceived.includes('<')) preWeight = '0';
    else preWeight = sample.weightReceived;
  }
  if (sample.weightDry) {
    //console.log(sample.weightDry.includes('<'));
    if (sample.weightDry.includes('<')) postWeight = '0';
    else postWeight = sample.weightDry;
  }

  //console.log(preWeight);
  //console.log(postWeight);

  if (!preWeight || !postWeight || preWeight == 0 || preWeight < postWeight) return null;
    else return Math.round(((preWeight - postWeight)/preWeight) * 100);
};

export const writeSampleDimensions = (sample, total) => {
  let dims = [];
  ['length','width','depth'].forEach(dim => {
    if (sample.dimensions !== undefined && sample.dimensions[dim] !== undefined && sample.dimensions[dim] !== '') dims.push(parseInt(sample.dimensions[dim]));
  });
  if (dims.length === 0) return null;
  let app = '';
  if (dims.length === 3) {
    let volMM = dims[0]*dims[1]*dims[2];
    let volCM = volMM / 1000;
    let volM = volMM / 1000000000;
    if (volM > 0.1) app += volM + 'm³';
    else if (volCM > 0.1) app += volCM + 'cm³';
    else app = volMM += 'mm³';
  } else if (dims.length === 2) {
    let areaMM = dims[0] * dims[1];
    let areaCM = areaMM / 100;
    let areaM = areaMM / 1000000;
    if (areaM > 1) app += areaM + 'm²';
    else if (areaCM > 1) app += areaCM + 'cm²';
    else app = areaMM += 'mm²';
  } else if (dims.length === 1) {
    let lMM = dims[0];
    let lCM = lMM / 10;
    let lM = lMM / 1000;
    if (lM > 1) app = lM + 'm';
    else if (lCM > 1) app = lCM + 'cm';
    else app = lMM + 'mm';
  }
  if (total) return app;
    else return dims.map(dim => `${dim}mm`).join(' x ') + ` (${app})`;
}

export const collateLayeredResults = layers => {
  let results = {};
  Object.keys(layers).forEach(key => {
    if (layers[key].result !== undefined && layers[key].result.deleted !== true) {
      Object.keys(layers[key].result).forEach(k => {
        if (layers[key].result[k] === true) results[k] = true;
      });
    }
  });
  if (results['no'] === true && (results['ch'] === true || results['am'] === true || results['cr'] === true || results['umf'] === true)) {
    results['no'] = false;
  }
  return results;
};

export const checkVerifyIssues = () => {
  let issues = [];
  return issues;
};

export const writeDates = (samples, field) => {
  let dates = [];
  let dateMap = {};
  let sortedMap = {};
  Object.values(samples).forEach(sample => {
    if (sample[field]) dates.push(dateOf(sample[field]));
  });
  if (dates.length === 0) return "N/A";
  dates.forEach(date => {
    let formatDate = moment(date).format('D MMMM YYYY');
    dateMap[formatDate] = true;
  });

  // return Object.keys(dateMap).join(', ');

  // TODO: Join Dates in Prettier Way

  Object.keys(dateMap).sort((b, a) => {
    return new Date(b - a);
  }).forEach(date => {
    let year = moment(date).format('YYYY');
    let month = moment(date).format('MMMM');
    let day = moment(date).format('D');
    sortedMap[year] = sortedMap[year] ? sortedMap[year] : {};
    sortedMap[year][month] = sortedMap[year][month] ? sortedMap[year][month] : {};
    sortedMap[year][month][day] = true;
  });

  //console.log(sortedMap);

  var monthNames = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
  };

  let dateList = [];
  Object.keys(sortedMap).forEach(year => {
    Object.keys(sortedMap[year]).sort((a, b) => {
      return monthNames[a] - monthNames[b];
    }).forEach(month => {
      dateList.push(`${Object.keys(sortedMap[year][month]).sort((a, b) => {
        return parseInt(a) - parseInt(b);
      }).join(', ')} ${month} ${year}`);
    });
  });

  //console.log(dateList.join(', '));
  // 17 August 2017, 6, 10, 12, 21, 31 August and 19 September 2019

  return dateList.join(', ');

  // //console.log(dateMap);
};
