import {
  EDIT_MODAL_DOC,
  EDIT_MODAL_SAMPLE,
  DELETE_COC,
  GET_ASBESTOS_SAMPLE_ISSUE_LOGS,
  GET_ASBESTOS_ANALYSIS_LOGS,
  GET_ASBESTOS_CHECK_LOGS,
  GET_COCS,
  GET_SAMPLES,
  RESET_ASBESTOS_LAB,
  RESET_MODAL,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  SET_ANALYSIS_SESSION_ID,
  SET_VIEW_SAMPLE_DETAIL,
} from "../constants/action-types";
import { DOWNLOAD_LAB_CERTIFICATE } from "../constants/modal-types";
import { styles } from "../config/styles";
import { addLog } from "./local";
import { resetModal } from "./modal";
import moment from "moment";
import momentbusinessdays from "moment-business-days";
import momenttimezone from "moment-timezone";
import momentbusinesstime from "moment-business-time";
import { toggleDoNotRender } from "./display";
import { sendSlackMessage, writeDates, andList, dateOf, milliToDHM, } from "./helpers";
import { getDefaultLetterAddress, } from "./jobs";
import {
  asbestosSamplesRef,
  asbestosAnalysisLogRef,
  asbestosSampleLogRef,
  asbestosSampleIssueLogRef,
  asbestosCheckLogRef,
  cocsRef,
  stateRef,
  firebase,
  firestore,
  auth,
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
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchCocs (${querySnapshot.size} documents)`);
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
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchCocs (${querySnapshot.size} documents)`);
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
      sendSlackMessage(`${auth.currentUser.displayName} ran fetchCocs from state (1 document)`);
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
    .get().then(querySnapshot => {
      sendSlackMessage(`${auth.currentUser.displayName} ran fetchCocsByJobNumber (${querySnapshot.size} documents)`);
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
      .get().then(querySnapshot => {
        var cocs = {};
          sendSlackMessage(`${auth.currentUser.displayName} ran fetchCocsBySearch with Client (${querySnapshot.size} documents)`);
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
      .get().then(querySnapshot => {
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchCocsBySearch (${querySnapshot.size} documents)`);
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

export const fetchSamples = (cocUid, jobNumber, modal) => async dispatch => {
  //console.log('fetching samples');
  asbestosSamplesRef
    .where("jobNumber", "==", jobNumber)
    .where("deleted","==",false)
    .onSnapshot(sampleSnapshot => {
      sendSlackMessage(`${auth.currentUser.displayName} ran fetchSamples (${sampleSnapshot.size} documents)`);
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

export const resetSampleView = () => async dispatch => {
  dispatch({
    type: SET_VIEW_SAMPLE_DETAIL,
    payload: null,
  });
}

export const fetchSampleView = (cocUid, sampleUid, jobNumber) => async dispatch => {
  asbestosSamplesRef.doc(sampleUid).get().then(sample => {
    if (sample.exists) {
      cocsRef.doc(cocUid).get().then(coc => {
        if (coc.exists) {
          dispatch({
            type: SET_VIEW_SAMPLE_DETAIL,
            payload: {
              coc: coc.data(),
              sample: sample.data(),
            },
          });
        }
      });
    }
  });
}

export const fetchAsbestosSampleIssueLogs = (limit) => async dispatch => {
  let lim = limit;
  if (!lim) lim = 7;
  if (true) {
    let startDate = moment().subtract(limit, 'days').toDate();
    asbestosSampleIssueLogRef
      .where("issueDate", ">", startDate)
      .orderBy("issueDate", "desc")
      .get().then(logSnapshot => {
        let logs = {};
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchAsbestosSampleIssueLogs (${logSnapshot.size} documents)`);
        logSnapshot.forEach(logDoc => {
          let log = logDoc.data();
          log.uid = logDoc.id;
          logs[log.uid] = log;
        });
        dispatch({
          type: GET_ASBESTOS_SAMPLE_ISSUE_LOGS,
          payload: logs,
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosSampleIssueLogs").onSnapshot(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} ran fetchAsbestosSampleIssueLogs (1 document)`);
      if (doc.exists) {
        dispatch({ type: GET_ASBESTOS_SAMPLE_ISSUE_LOGS, payload: doc.data() });
      } else {
        //console.log("Sample log doesn't exist");
      }
    });

  }
};

export const fetchAsbestosAnalysisLogs = (limit) => async dispatch => {
  let lim = limit;
  if (!lim) lim = 7;
  if (true) {
    let startDate = moment().subtract(limit, 'days').toDate();
    asbestosAnalysisLogRef
      .where("analysisDate", ">", startDate)
      .orderBy("analysisDate", "desc")
      .get().then(logSnapshot => {
        let logs = {};
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchAsbestosAnalysisLogs (${logSnapshot.size} documents)`);
        logSnapshot.forEach(logDoc => {
          let log = logDoc.data();
          log.uid = logDoc.id;
          logs[log.uid] = log;
        });
        dispatch({
          type: GET_ASBESTOS_ANALYSIS_LOGS,
          payload: logs,
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosAnalysisLogs").onSnapshot(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} ran fetchAsbestosAnalysisLogs (1 document)`);
      if (doc.exists) {
        dispatch({ type: GET_ASBESTOS_ANALYSIS_LOGS, payload: doc.data() });
      } else {
        //console.log("Sample log doesn't exist");
      }
    });

  }
};

export const fetchAsbestosCheckLogs = (limit) => async dispatch => {
  let lim = limit;
  if (!lim) lim = 7;
  if (true) {
    let startDate = moment().subtract(limit, 'days').toDate();
    asbestosCheckLogRef
      .where("checkDate", ">", startDate)
      .orderBy("checkDate", "desc")
      .get().then(logSnapshot => {
        let logs = {};
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchAsbestosCheckLogs (${logSnapshot.size} documents)`);
        logSnapshot.forEach(logDoc => {
          let log = logDoc.data();
          log.uid = logDoc.id;
          logs[log.uid] = log;
        });
        dispatch({
          type: GET_ASBESTOS_CHECK_LOGS,
          payload: logs,
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosCheckLogs").onSnapshot(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} ran asbestosCheckLogs (1 document)`);
      if (doc.exists) {
        dispatch({ type: GET_ASBESTOS_CHECK_LOGS, payload: doc.data() });
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

export const handleCocSubmit = async ({ doc, me, originalSamples }) => {
  // toggleDoNotRender(true);
  //console.log(doc);
  // //console.log(doc.samples);
  let sampleList = [];
  let batch = firestore.batch();
  if (doc.samples) {
    // //console.log(doc.samples);
    await Object.keys(doc.samples).forEach(sample => {
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
          addLog("asbestosLab", log, me, batch);
          doc.samples[sample].uid = uid;
          doc.samples[sample].deleted = false;
          doc.samples[sample].createdDate = new Date();
          doc.samples[sample].createdBy = {uid: me.uid, name: me.name};
          if (doc.samples[sample].sampleDate === undefined && doc.defaultSampleDate !== null) doc.samples[sample].sampleDate = doc.defaultSampleDate;
          doc.samples[sample].sampleDate = dateOf(doc.samples[sample].sampleDate);
          if (!doc.samples[sample].sampledBy && doc.defaultSampledBy.length > 0) doc.samples[sample].sampledBy = doc.defaultSampledBy.map(e => ({uid: e.value, name: e.label}));
          sampleList.push(uid);
        } else {
          if (doc.samples[sample].verified && doc.samples[sample] !== originalSamples[doc.samples[sample].sampleNumber]) {
            let log = {
              type: 'Edit',
              log: `Sample ${sample} (${writeDescription(doc.samples[sample])}) modified.`,
              chainOfCustody: doc.uid,
              sample: doc.samples[sample].uid,
            };
            addLog("asbestosLab", log, me, batch);
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
        batch.set(asbestosSamplesRef.doc(doc.samples[sample].uid), sample2);
      }
    });
  }
  let doc2 = doc;
  if ("samples" in doc2) delete doc2.samples;
  doc2.uid = doc.uid;
  doc2.sampleList = sampleList;
  batch.set(cocsRef.doc(doc.uid), doc2);
  batch.commit();
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
  console.log(changes);
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
  let transitTime = sample.createdDate && sample.receivedDate ? moment.duration(moment(dateOf(sample.receivedDate)).diff(dateOf(sample.createdDate))).asMilliseconds() : null;
  let labTime = sample.receivedDate && sample.analysisDate ? moment.duration(moment(dateOf(sample.analysisDate)).diff(dateOf(sample.receivedDate))).asMilliseconds() : null;
  let analysisTime = sample.receivedDate && sample.analysisStartDate ? moment.duration(moment(dateOf(sample.analysisDate)).diff(dateOf(sample.analysisStartDate))).asMilliseconds() : null;
  let turnaroundTime = sample.receivedDate ? moment.duration(moment().diff(dateOf(sample.receivedDate))).asMilliseconds() : null;

  let log = {
    client: coc.client ? coc.client : null,
    address: coc.address ? coc.address: null,
    jobNumber: coc.jobNumber ? coc.jobNumber : null,
    cocUid: coc.uid ? coc.uid : null,
    cocType: coc.type ? coc.type : null,
    priority: coc.priority ? coc.priority: 0,
    version: version,

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

    weightReceived: sample.weightReceived ? sample.weightReceived : null,
    weightSubsample: sample.weightSubsample ? sample.weightSubsample : null,
    weightDry: sample.weightDry ? sample.weightDry : null,
    weightAshed: sample.weightAshed ? sample.weightAshed : null,

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

  if (sample.waTotals) {
    log = {
      ...log,
      waTotals: sample.waTotals,
    }
  }

  let uid = `${log.sampleUid}-${moment(dateOf(log.issueDate)).format('x')}`;
  asbestosSampleIssueLogRef.doc(uid).set(log);
}

export const setCheckAnalysis = (analysis, sample, overrideBy) => {
  overrideResult(sample, overrideBy);
  console.log(analysis);
  console.log(sample);
}

export const overrideResult = (sample, overrideBy) => {
  let update = {};
  if (sample.previousResults) update = sample.previousResults;
  update = {
    ...update,
    [moment().format('x')]: {
      analyst: sample.analyst ? sample.analyst : null,
      analysisRecordedBy: sample.analysisRecordedBy ? sample.analysisRecordedBy : null,
      analysisDate: sample.analysisDate ? sample.analysisDate : null,
      analysisTime: sample.analysisTime ? sample.analysisTime : null,
      result: sample.result ? sample.result : null,
      overrideDate: new Date(),
      overrideBy: overrideBy,
    }
  };
  asbestosSamplesRef.doc(sample.uid).update({ previousResults: update });
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

export const receiveSample = (batch, sample, job, samples, sessionID, me, startDate, noLog) => {
  //console.log('Receiving sample');
  //console.log(sample);
  if (sample.receivedByLab && sample.verified) {
    removeResult(batch, sample, sessionID, me);
    if (sample.analysisStarted) startAnalysis(batch, sample, job, samples, sessionID, me, startDate, true);
    verifySample(batch, sample, job, samples, sessionID, me, true);
  } else if (sample.receivedByLab && sample.result) {
    removeResult(batch, sample, sessionID, me);
    if (sample.analysisStarted) startAnalysis(batch, sample, job, samples, sessionID, me, startDate, true);
  } else if (sample.receivedByLab && sample.analysisStarted) {
    startAnalysis(batch, sample, job, samples, sessionID, me, startDate, true);
  }
  if (!noLog) {
    let log = {
      type: "Received",
      log: !sample.receivedByLab
        ? `Sample ${sample.sampleNumber} (${writeDescription(sample)}) received by lab.`
        : `Sample ${sample.sampleNumber} (${writeDescription(sample)}) unchecked as being received.`,
      sample: sample.uid,
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me, batch);
  }
  if (!sample.receivedByLab) {
    batch.update(asbestosSamplesRef.doc(sample.uid),
    {
      receivedByLab: true,
      receivedBy: {uid: me.uid, name: me.name},
      receivedDate: startDate ? startDate : new Date(),
    });
  } else {
    batch.update(asbestosSamplesRef.doc(sample.uid),
    {
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

export const startAnalysis = (batch, sample, job, samples, sessionID, me, startDate, noLog) => {
  if (!sample.receivedByLab && !sample.analysisStarted) receiveSample(batch, sample, job, samples, sessionID, me, startDate, true);
  if (sample.verified) verifySample(batch, sample, job, samples, sessionID, me, true);
  if (!noLog) {
    let log = {
      type: "Analysis",
      log: !sample.analysisStarted
        ? `Analysis begun on Sample ${sample.sampleNumber} (${writeDescription(sample)}).`
        : `Analysis stopped for Sample ${sample.sampleNumber} (${writeDescription(sample)}).`,
      sample: sample.uid,
      chainOfCustody: job.uid,
    };
    addLog("asbestosLab", log, me, batch);
  }
  batch.update(cocsRef.doc(sample.cocUid), { versionUpToDate: false, });
  if (!sample.analysisStarted) {
    batch.update(asbestosSamplesRef.doc(sample.uid),
    {
      analysisStarted: true,
      analysisStartedBy: {uid: me.uid, name: me.name},
      analysisStartDate: startDate ? startDate : new Date(),
    });
  } else {
    batch.update(asbestosSamplesRef.doc(sample.uid),
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
        // issues[uid] = {
        //   type: 'check',
        //   description: `Analysis has not been checked as started. Double check this is correct and leave a comment on why it has been missed.`,
        //   yes: 'This is correct',
        //   no: 'This needs fixing',
        //   sample,
        //   uid,
        // };
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

export const recordAnalysis = (batch, analyst, sample, job, samples, sessionID, me, resultChanged, weightChanged, resultOverridden, weightOverridden) => {
  console.log('Record Analysis');
  console.log(resultChanged);
  console.log(weightChanged);
  if (resultChanged) {
    let log = {};
    if (resultOverridden) {
      if (writeShorthandResult(sample) === "NO RESULT") {
        log = {
          type: "Analysis",
          log: `Result removed for sample ${sample.sampleNumber} (${writeDescription(sample)})`,
          sample: sample.uid,
          chainOfCustody: job.uid,
        };
      } else {
        log = {
          type: "Analysis",
          log: `Previous analysis of sample ${sample.sampleNumber} (${writeDescription(sample)}) overridden.`,
          sample: sample.uid,
          chainOfCustody: job.uid,
        };
      }
    } else {
      log = {
        type: "Analysis",
        log: `New analysis for sample ${sample.sampleNumber} (${writeDescription(sample)}): ${writeResult(sample.result, sample.noAsbestosResultReason).replace('@~',' ')}`,
        sample: sample.uid,
        chainOfCustody: job.uid,
      };
    }
    console.log(log);
    addLog("asbestosLab", log, me, batch);
  }
  if (weightChanged) {
    let log = {};
    if (sample.weightReceived === "") {
      log = {
        type: "Analysis",
        log: `Received weight removed for sample ${sample.sampleNumber} (${writeDescription(sample)})`,
        sample: sample.uid,
        chainOfCustody: job.uid,
      };
    } else if (weightOverridden) {
      log = {
        type: "Analysis",
        log: `Previous received weight for sample ${sample.sampleNumber} (${writeDescription(sample)}) overridden`,
        sample: sample.uid,
        chainOfCustody: job.uid,
      };
    } else {
      log = {
        type: "Analysis",
        log: `New received weight for sample ${sample.sampleNumber} (${writeDescription(sample)}): ${sample.weightReceived}g`,
        sample: sample.uid,
        chainOfCustody: job.uid,
      };
    }
    addLog("asbestosLab", log, me, batch);
  }

  batch.update(cocsRef.doc(job.uid), { versionUpToDate: false, mostRecentIssueSent: false, });

  // Check for situation where all results are unselected
  let notBlankAnalysis = false;
  sample.result && Object.values(sample.result).forEach(value => {
    if (value) notBlankAnalysis = true;
  });
  if (sample.weightReceived) notBlankAnalysis = true;
  if (notBlankAnalysis) {
    if (!sample.analysisStarted) startAnalysis(batch, sample, job, samples, sessionID, me, new Date(), true);
    if (resultChanged) {
      console.log('Result changed');
      batch.set(asbestosAnalysisLogRef.doc(`${sessionID}-${sample.uid}`),
      {
        analysisDate: new Date(),
        analyst: analyst,
        sessionID: sessionID,
        cocUid: job.uid,
        weightReceived: sample.weightReceived ? sample.weightReceived : null,
        result: sample.result,
        analysisRecordedBy: {
          name: me.name,
          uid: me.uid,
        },
        analysisStartDate: sample.analysisStartDate ? sample.analysisStartDate : new Date(),
        analysisStartedBy: sample.analysisStartedBy ? sample.analysisStartedBy : {name: me.name, uid: me.uid},
        analysisTime: sample.analysisTime ? sample.analysisTime : 0,
        category: sample.category ? sample.category : 'Other',
        issueVersion: job.currentVersion ? job.currentVersion : 1,
        jobNumber: sample.jobNumber ? sample.jobNumber : null,
        material: sample.material ? sample.material : null,
        receivedDate: sample.receivedDate ? sample.receivedDate : new Date(),
        sampleNumber: sample.sampleNumber ? sample.sampleNumber : null,
        genericLocation: sample.genericLocation ? sample.genericLocation : null,
        specificLocation: sample.specificLocation ? sample.specificLocation : null,
        description: sample.description ? sample.description : null,
        sampleUid: sample.uid ? sample.uid : null,
        waAnalysisComplete: sample.waAnalysisComplete ? sample.waAnalysisComplete : null,
        waTotals: sample.waTotals ? sample.waTotals : null,
        weightAshed: sample.weightAshed ? sample.weightAshed : null,
        weightDry: sample.weightDry ? sample.weightDry : null,
        uid: `${sessionID}-${sample.uid}`,
      });
      console.log(`Updating result with new analyst ${analyst}`)
      batch.update(asbestosSamplesRef.doc(sample.uid),
      {
        analysisRecordedBy: {uid: me.uid, name: me.name},
        sessionID: sessionID,
        analyst: analyst ? analyst : null,
        result: sample.result ? sample.result : null,
        weightReceived: sample.weightReceived ? sample.weightReceived : null,
        analysisDate: new Date(),
        analysisTime: sample.receivedDate ? moment.duration(moment(new Date()).diff(dateOf(sample.receivedDate))).asMilliseconds() : null,
      });
    } else if (weightChanged) {
      batch.update(asbestosSamplesRef.doc(sample.uid),
      {
        weightReceived: sample.weightReceived ? sample.weightReceived : null,
      });
    }
  } else {
    batch.delete(asbestosAnalysisLogRef.doc(`${sessionID}-${sample.uid}`));
    batch.update(asbestosSamplesRef.doc(sample.uid),
      {
        result: firebase.firestore.FieldValue.delete(),
        analysisDate: firebase.firestore.FieldValue.delete(),
        analysisRecordedBy: firebase.firestore.FieldValue.delete(),
        sessionID: firebase.firestore.FieldValue.delete(),
        analysisTime: firebase.firestore.FieldValue.delete(),
        analyst: firebase.firestore.FieldValue.delete(),
        weightReceived: sample.weightReceived ? sample.weightReceived : null,
      });
  }
};

export const removeResult = (batch, sample, sessionID, me) => {
  let log = {
    type: "Analysis",
    log: `Sample ${sample.sampleNumber} (${writeDescription(sample)}) result removed.`,
    sample: sample.uid,
    chainOfCustody: sample.cocUid,
  };
  addLog("asbestosLab", log, me, batch);

  batch.update(cocsRef.doc(sample.cocUid), { versionUpToDate: false, mostRecentIssueSent: false, });
  batch.delete(asbestosAnalysisLogRef.doc(`${sessionID}-${sample.uid}`));
  batch.update(asbestosSamplesRef.doc(sample.uid),
  {
    result: firebase.firestore.FieldValue.delete(),
    analysisDate: firebase.firestore.FieldValue.delete(),
    analysisRecordedBy: firebase.firestore.FieldValue.delete(),
    sessionID: firebase.firestore.FieldValue.delete(),
  });
}

export const verifySample = (batch, sample, job, samples, sessionID, me, startDate, properties, noLog) => {
  //console.log('Verifying');
  if (
    (me.auth &&
    (me.auth["Analysis Checker"] ||
      me.auth["Asbestos Admin"]))
  ) {
    if (!sample.analysisStarted && !sample.verified) startAnalysis(batch, sample, job, samples, sessionID, me, true);
    let verifyDate = null;
    if (!noLog) {
      let log = {
        type: "Verified",
        log: !sample.verified
          ? `Sample ${sample.sampleNumber} (${writeDescription(sample)}) result verified.`
          : `Sample ${sample.sampleNumber} (${writeDescription(sample)}) verification removed.`,
        sample: sample.uid,
        chainOfCustody: job.uid,
      };
      addLog("asbestosLab", log, me, batch);
    }

    batch.update(cocsRef.doc(sample.cocUid), { versionUpToDate: false, mostRecentIssueSent: false, });
    if (!sample.verified) {
      sample.verifyDate = new Date();
      batch.update(asbestosSamplesRef.doc(sample.uid),
      {
        ...properties,
        verified: true,
        verifiedBy: {uid: me.uid, name: me.name},
        verifyDate: startDate ? startDate : new Date(),
        turnaroundTime: sample.receivedDate ? moment.duration(moment().diff(dateOf(sample.receivedDate))).asMilliseconds() : null,
      });
    } else {
      batch.update(asbestosSamplesRef.doc(sample.uid),
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

export const verifySubsample = (batch, sub, job, samples, sessionID, me, noLog) => {
  console.log('Verifying subsample');
  console.log(sub);
  // return false;
  if (
    (me.auth &&
    (me.auth["Analysis Checker"] ||
      me.auth["Asbestos Admin"]))
  ) {
    let sample = samples[sub.sampleNumber] ? samples[sub.sampleNumber] : null;
    if (sample && sample.waSoilAnalysis && sample.waSoilAnalysis[sub.uid]) {
      if (!sub.verified) {
        sub.verified = true;
        sub.verifyDate = new Date();
        sub.verifiedBy = {uid: me.uid, name: me.name};
        batch.update(asbestosSamplesRef.doc(sample.uid),
        {
          waSoilAnalysis: {
            ...sample.waSoilAnalysis,
            [sub.uid]: sub,
          },
        });
      } else {
        console.log('Removing verification...');
        sub.verified = false;
        sub.verifyDate = null;
        sub.verifiedBy = null;
        batch.update(asbestosSamplesRef.doc(sample.uid),
        {
          waSoilAnalysis: {
            ...sample.waSoilAnalysis,
            [sub.uid]: sub,
          },
        });
      }
    }
  } else {
    window.alert(
      "You don't have sufficient permissions to verify asbestos results."
    );
  }
};

export const verifySamples = (samples, job, meUid, checkIssues, allowSameUserVerification) => {
  let issues = {};
  let uid = '';
  // Check for issues
  samples.forEach(sample => {
    // console.log(sample);
    let uid = '';
    if (!sample.now && !checkIssues) {
      // if (sample.original === sample.now) {
      //   uid = sample.uid + 'ResultNotVerified';
      //   issues[uid] = {
      //     type: 'check',
      //     description: `Result has not been verified. This sample will not appear on lab reports.`,
      //     yes: 'This is correct',
      //     no: 'This needs fixing',
      //     sample,
      //     uid,
      //   };
      // }
      if (sample.original !== sample.now) {
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
    } else if (sample.now !== sample.original) {
      if (!allowSameUserVerification && sample.analysisRecordedBy && sample.analysisRecordedBy.uid === meUid && !checkIssues) {
        uid = sample.uid + 'SameUser';
        issues[uid] = {
          type: 'block',
          description: `You cannot verify this sample as you recorded the result. You will need to get someone else to verify it.`,
          no: 'OK',
          sample,
          uid,
        };
      }
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
        // Get subfractions of sample
        let subsamples = [];
        let allSubsVerified = true;
        if (sample.waLayerNum) {
          Object.keys(sample.waLayerNum).forEach(fraction => {
            [...Array(sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : 2).keys()].forEach(num => {
              if (sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] !== undefined) {
                let sub = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
                if (sub.containerID) {
                  if (!sub.verified) allSubsVerified = false;
                  subsamples.push(sub);
                }
              }
            });
          });
        }

        if (!sample.weightDry) {
          uid = sample.uid + 'WAAnalysisNoDryWeight';
          issues[uid] = {
            type: 'confirm',
            description: `No dry weight has been recorded. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (!sample.weightAshed) {
          uid = sample.uid + 'WAAnalysisNoAshedWeight';
          issues[uid] = {
            type: 'confirm',
            description: `No ashed weight has been recorded. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (!sample.waSoilAnalysis || !sample.waSoilAnalysis.formDescription && getBasicResult(sample) === 'positive') {
          uid = sample.uid + 'WAAnalysisNoFormDescription';
          issues[uid] = {
            type: 'confirm',
            description: `No asbestos form description has been recorded. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (!sample.waSoilAnalysis || !sample.waSoilAnalysis.fractiongt7WeightAshed) {
          uid = sample.uid + 'WAAnalysisNoGt7WeightAshed';
          issues[uid] = {
            type: 'confirm',
            description: `No ashed weight for the >7mm fraction has been recorded. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (!sample.waSoilAnalysis || !sample.waSoilAnalysis.fractionto7WeightAshed) {
          uid = sample.uid + 'WAAnalysisNoTo7WeightAshed';
          issues[uid] = {
            type: 'confirm',
            description: `No ashed weight for the 2-7mm fraction has been recorded. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (!sample.waSoilAnalysis || !sample.waSoilAnalysis.fractionlt2WeightAshed) {
          uid = sample.uid + 'WAAnalysisNoLt2WeightAshed';
          issues[uid] = {
            type: 'confirm',
            description: `No ashed weight for the <2mm fraction has been recorded. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (sample.waSoilAnalysis &&
          sample.waSoilAnalysis.fractiongt7WeightAshed &&
          sample.waSoilAnalysis.fractionto7WeightAshed &&
          sample.waSoilAnalysis.fractionlt2WeightAshed &&
          (parseFloat(sample.waSoilAnalysis.fractiongt7WeightAshed)
          + parseFloat(sample.waSoilAnalysis.fractionto7WeightAshed)
          + parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshed)).toFixed(1)
          !== parseFloat(sample.weightAshed).toFixed(1)
        ) {
          uid = sample.uid + 'WAAnalysisFractionWeightsNotEqual';
          issues[uid] = {
            type: 'confirm',
            description: `Cumulative ashed weight of fractions does not equal the total ashed weight of sample. Check with the analyst why this is.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (sample.weightReceived && sample.weightDry && parseFloat(sample.weightDry) > parseFloat(sample.weightReceived)) {
          uid = sample.uid + 'WAAnalysisDryWeightLarger';
          issues[uid] = {
            type: 'confirm',
            description: `Dry weight is heavier than the received weight. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (sample.weightAshed && sample.weightDry && parseFloat(sample.weightAshed) > parseFloat(sample.weightDry)) {
          uid = sample.uid + 'WAAnalysisAshedWeightLarger';
          issues[uid] = {
            type: 'confirm',
            description: `Ashed weight is heavier than the dry weight. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample &&
          parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshedSubsample) > parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshed)) {
          uid = sample.uid + 'WAAnalysisLt2SubsampleWeightLarger';
          issues[uid] = {
            type: 'confirm',
            description: `Subsample weight of the <2mm fraction is larger than the total weight of the <2mm fraction. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (sample.weightSubsample && sample.weightReceived &&
          parseFloat(sample.weightSubsample) > parseFloat(sample.weightReceived)) {
          uid = sample.uid + 'WAAnalysisSubsampleWeightLarger';
          issues[uid] = {
            type: 'confirm',
            description: `Subsample weight is larger than the total weight received. Check with the analyst why this has not been done.`,
            yes: 'This is correct',
            no: 'This needs fixing',
            sample,
            uid,
          }
        }

        if (subsamples.length === 0 && getBasicResult(sample) === 'positive') {
          uid = sample.uid + 'WAAnalysisNoSubsamples';
          issues[uid] = {
            type: 'confirm',
            description: `No subsamples recorded for sample, but sample result is positive. Check with analyst that analysis is complete before clicking Proceed.`,
            sample,
            uid,
          };
        }

        if (!allSubsVerified) {
          uid = sample.uid + 'WAAnalysisNotAllSubsVerified';
          issues[uid] = {
            type: 'block',
            description: `Not all subsample weights have been verified. Go into the subsample verification screen and check these off first.`,
            sample,
            uid,
          };
        }

        if (!sample.waAnalysisComplete) {
          uid = sample.uid + 'WAAnalysisNotComplete';
          issues[uid] = {
            type: 'confirm',
            description: `WA Analysis has not been checked by analyst as complete. Check with analyst that analysis is complete before clicking Proceed.`,
            sample,
            uid,
          };
        }

        if (subsamples.length > 0) {
          let soilResult = {result: collateArrayResults(subsamples)};
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
  if (checkIssues) {
    let issueArray = [['Sample Number','Issue']];
    Object.values(issues).forEach(issue => {
      let sample = (issue.sample ? `${issue.sample.jobNumber}-${issue.sample.sampleNumber}` : '');

      issueArray.push([sample, issue.description]);
    });
    return issueArray
  } else return issues;
};

export const verifySubsamples = (subs, job, meUid, duplicateIDs) => {
  let issues = {};
  let uid = '';
  // Check for duplicate IDs
  if (duplicateIDs) {
    uid = job.jobNumber + 'DuplicateSubsampleIDs';
    issues[uid] = {
      type: 'check',
      description: `More than one subsample is using ID ${duplicateIDs}.`,
      yes: 'This is correct',
      no: 'This needs fixing',
      uid,
    };
  }

  // Check for issues
  subs.forEach(sub => {
    let uid = '';
    if (!sub.now && sub.original) {
      // if (sub.original === sub.now) {
      //   uid = sub.containerID + 'ResultNotVerified';
      //   issues[uid] = {
      //     type: 'check',
      //     description: `Subsample has not been verified.`,
      //     yes: 'This is correct',
      //     no: 'This needs fixing',
      //     sub,
      //     uid,
      //   };
      // } else {
        uid = sub.containerID + 'ResultNotVerified';
        issues[uid] = {
          type: 'check',
          description: `Subsample has been unverified. Double check this is correct and leave a comment on why verification has been removed.`,
          yes: 'Remove Verification',
          no: 'Do not remove',
          sub,
          uid,
        };
      // }
    } else if (sub.now) {
      // Check result has been added
      if (getBasicResult(sub) === 'none') {
        uid = sub.containerID + 'NoAsbestosResult';
        issues[uid] = {
          type: 'noresult',
          description: `No asbestos result has been recorded.`,
          sub,
          uid,
        };
      }

      // Check weight is there
      if (!sub.weight) {
        console.log(sub);
        uid = sub.containerID + 'NoWeightRecorded';
        issues[uid] = {
          type: 'confirm',
          description: `No weight has been recorded. Check with the analyst why this has not been done.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sub,
          uid,
        }
      }

      // Check weight is there
      if (!sub.concentration) {
        uid = sub.containerID + 'NoConcentrationRecorded';
        issues[uid] = {
          type: 'confirm',
          description: `No concentration has been recorded. Check with the analyst why this has not been done.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sub,
          uid,
        }
      }

      // Check weight is there
      if (!sub.form) {
        uid = sub.containerID + 'NoFormRecorded';
        issues[uid] = {
          type: 'confirm',
          description: `No asbestos form has been recorded. Check with the analyst why this has not been done.`,
          yes: 'This is correct',
          no: 'This needs fixing',
          sub,
          uid,
        }
      }

    }
  });
  return issues;
};

const fractionMap = {
  gt7: '>7mm',
  to7: '2-7mm',
  lt2: '<2mm',
}

export const getSampleData = (samples, job) => {
  let dataArray = [];
  let subSampleMap = getWASubsampleList(samples);
  if (job.waAnalysis) {
    let firstArray = [
      'Job Number',
      'Sample Number',
      'Generic Location',
      'Specific Location',
      'Description',
      'Material',
      'Material Category',
      'Result',
      'Sample Date',
      'Sampled By',
      'Created Date',
      'Created By',
      'Received Date',
      'Received By',
      'Analysis Start Date',
      'Analysis Started By',
      'Analysis Date',
      'Analysis By',
      'Analysis Recorded By',
      'Verified Date',
      'Verified By',
      'Received Weight',
      'Subsample Weight',
      'Dry Weight',
      'Ashed Weight',
      'Moisture',
      '>7mm Fraction Weight',
      '2-7mm Fraction Weight',
      '<2mm Fraction Weight',
      '<2mm Subfraction Weight',
      '<2mm Fraction/Subfraction Ratio',
      'Asbestos Form Description',
      'Geotechnical Soil Description',
      'ACM Concentration',
      'FA Concentration',
      'AF Concentration',
      'FAAF Concentration',
      'Cumulative Result',
      'Concentration Over Limit',
      'Number of Subsamples',
    ];
    let midArray = [];
    if (subSampleMap.subsampleCount > 0) {
      [...Array(subSampleMap.subsampleCount).keys()].forEach(s => {
        midArray = midArray.concat([
          'Subsample ID',
          'Fraction',
          'Gross Weight',
          'Tare Weight',
          'Concentration',
          'Asbestos Form',
          'Asbestos Type',
          'Asbestos Weight',
        ]);
      })
    }
    let lastArray = [
      'WA Analysis Complete',
      'Analysis Time',
      'Session ID',
    ];
    dataArray.push(firstArray.concat(midArray.concat(lastArray)));
    if (samples) {
      Object.values(samples).forEach(sample => {
        let multiplier = 1;
        if (sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample) {
          multiplier = parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshed)/parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshedSubsample);
        }
        let midArray = [];
        let sampleSubs = subSampleMap.subsamples.filter(sub => sub.sampleNumber === sample.sampleNumber);
        let firstArray = [
          sample.jobNumber ? sample.jobNumber : '',
          sample.sampleNumber ? sample.sampleNumber : '',
          sample.genericLocation ? sample.genericLocation : '',
          sample.specificLocation ? sample.specificLocation : '',
          sample.description ? sample.description : '',
          sample.material ? sample.material : '',
          sample.category ? sample.category : '',
          sample.result ? writeShorthandResult(sample.result) : '',
          sample.sampleDate ? moment(dateOf(sample.sampleDate)).format('YYYY-MMM-DD') : '',
          sample.sampledBy ? sample.sampledBy.map(p => p.name).join(', ') : '',
          sample.createdDate ? moment(dateOf(sample.createdDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.createdBy ? sample.createdBy.name : '',
          sample.receivedDate ? moment(dateOf(sample.receivedDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.receivedBy ? sample.receivedBy.name : '',
          sample.analysisStartDate ? moment(dateOf(sample.analysisStartDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.analysisStartedBy ? sample.analysisStartedBy.name : '',
          sample.analysisDate ? moment(dateOf(sample.analysisDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.analyst ? sample.analyst : '',
          sample.analysisRecordedBy ? sample.analysisRecordedBy.name : '',
          sample.verifyDate ? moment(dateOf(sample.verifyDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.verifiedBy ? sample.verifiedBy.name : '',
          sample.weightReceived ? sample.weightReceived : '',
          sample.weightSubsample ? sample.weightSubsample : '',
          sample.weightDry ? sample.weightDry : '',
          sample.weightAshed ? sample.weightAshed : '',
          sample.weightDry && (sample.weightReceived || sample.weightSubsample) ? writeSampleMoisture(sample) : '',
          sample.waSoilAnalysis && sample.waSoilAnalysis.fractiongt7WeightAshed ? sample.waSoilAnalysis.fractiongt7WeightAshed : '',
          sample.waSoilAnalysis && sample.waSoilAnalysis.fractionto7WeightAshed ? sample.waSoilAnalysis.fractionto7WeightAshed : '',
          sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed ? sample.waSoilAnalysis.fractionlt2WeightAshed : '',
          sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample ? sample.waSoilAnalysis.fractionlt2WeightAshedSubsample : '',
          sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample ? multiplier.toFixed(2) : '',
          sample.waSoilAnalysis && sample.waSoilAnalysis.formDescription ? sample.waSoilAnalysis.formDescription : '',
          sample.soilDetails ? writeSoilDetails(sample.soilDetails) : '',
          sample.waTotals ? sample.waTotals.concentration.acm : '',
          sample.waTotals ? sample.waTotals.concentration.fa : '',
          sample.waTotals ? sample.waTotals.concentration.af : '',
          sample.waTotals ? sample.waTotals.concentration.faaf : '',
          sample.waTotals ? writeShorthandResult(sample.waTotals.result.total) : '',
          sample.waTotals && sample.waTotals.waOverLimit ? 'TRUE' : 'FALSE',
          sampleSubs.length,
        ];
        if (subSampleMap.subsampleCount > 0) {
          [...Array(subSampleMap.subsampleCount).keys()].forEach(i => {
            let sub = sampleSubs[i];
            if (sub === undefined) sub = {};
            midArray = midArray.concat([
              sub.containerID,
              sub.fraction ? fractionMap[sub.fraction] : '',
              sub.weight,
              sub.tareWeight,
              sub.concentration,
              sub.form ? sub.form.toUpperCase() : '',
              sub.result ? writeShorthandResult(sub.result) : '',
              sub.containerID ? getAsbestosWeight(sub) : '',
            ]);
          })
        }
        let lastArray = [
          sample.waAnalysisComplete ? 'TRUE' : 'FALSE',
          sample.analysisTime ? sample.analysisTime : '',
          sample.sessionID ? sample.sessionID : '',
        ];
        dataArray.push(firstArray.concat(midArray.concat(lastArray)));
      });
    }
  } else {
    dataArray.push([
      'Job Number',
      'Sample Number',
      'Generic Location',
      'Specific Location',
      'Description',
      'Material',
      'Material Category',
      'Result',
      'Sample Date',
      'Sampled By',
      'Created Date',
      'Created By',
      'Received Date',
      'Received By',
      'Analysis Start Date',
      'Analysis Started By',
      'Analysis Date',
      'Analysis By',
      'Analysis Recorded By',
      'Verified Date',
      'Verified By',
      'Received Weight',
      'Subsample Weight',
      'Dry Weight',
      'Ashed Weight',
      'Moisture',
    ]);
    if (samples) {
      Object.values(samples).forEach(sample => {
        dataArray.push([
          sample.jobNumber ? sample.jobNumber : '',
          sample.sampleNumber ? sample.sampleNumber : '',
          sample.genericLocation ? sample.genericLocation : '',
          sample.specificLocation ? sample.specificLocation : '',
          sample.description ? sample.description : '',
          sample.material ? sample.material : '',
          sample.category ? sample.category : '',
          sample.result ? writeShorthandResult(sample.result) : '',
          sample.sampleDate ? moment(dateOf(sample.sampleDate)).format('YYYY-MMM-DD') : '',
          sample.sampledBy ? sample.sampledBy.map(p => p.name).join(', ') : '',
          sample.createdDate ? moment(dateOf(sample.createdDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.createdBy ? sample.createdBy.name : '',
          sample.receivedDate ? moment(dateOf(sample.receivedDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.receivedBy ? sample.receivedBy.name : '',
          sample.analysisStartDate ? moment(dateOf(sample.analysisStartDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.analysisStartedBy ? sample.analysisStartedBy.name : '',
          sample.analysisDate ? moment(dateOf(sample.analysisDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.analyst ? sample.analyst : '',
          sample.analysisRecordedBy ? sample.analysisRecordedBy.name : '',
          sample.verifyDate ? moment(dateOf(sample.verifyDate)).format('YYYY-MMM-DD HH:mm:ss') : '',
          sample.verifiedBy ? sample.verifiedBy.name : '',
          sample.weightReceived ? sample.weightReceived : '',
          sample.weightSubsample ? sample.weightSubsample : '',
          sample.weightDry ? sample.weightDry : '',
          sample.weightAshed ? sample.weightAshed : '',
          sample.weightDry && (sample.weightReceived || sample.weightSubsample) ? writeSampleMoisture(sample) : '',
          // then layer data, dimensions etc.
        ])
      });
    }
  }
  return dataArray;
}

export const getSubsampleData = (samples, job) => {
  let dataArray = [];
  let subSampleMap = getWASubsampleList(samples);
  dataArray.push([
      'Subsample ID',
      'Sample Number',
      'Tare Weight',
      'Fraction',
      'Concentration',
      'Asbestos Form',
      'Asbestos Types',
      'Gross Weight',
      'Multiplier',
      'Asbestos Weight',
    ]);
  if (subSampleMap.subsamples.length > 0) {
    subSampleMap.subsamples.forEach(sub => {
      dataArray.push([
        sub.containerID,
        sub.sampleNumber,
        sub.tareWeight,
        sub.fraction ? fractionMap[sub.fraction] : '',
        sub.concentration,
        sub.form ? sub.form.toUpperCase() : '',
        sub.result ? writeShorthandResult(sub.result) : '',
        sub.weight,
        sub.multiplier,
        sub.containerID ? getAsbestosWeight(sub) : '',
      ]);
    });
  }
  return dataArray;
}

export const getAsbestosWeight = (sub) => {
  let weight = sub.weight ? parseFloat(sub.weight) : 0;
  if (sub.tareWeight) weight = weight - parseFloat(sub.tareWeight);
  if (weight < 0) weight = 0;
  if (sub.concentration) weight = weight * (parseFloat(sub.concentration) / 100);
  if (sub.fraction === 'lt2' && sub.multiplier) weight = weight * sub.multiplier;
  if (weight < 0.00001) return '<0.00001';
  else return weight.toFixed(5);
}

export const getWASubsampleList = (samples) => {
  let subsamples = [];
  let containerIDs = [];
  let duplicateIDs = false;
  let subsampleCount = 1;
  if (samples) Object.values(samples).forEach(sample => {
    if (sample.waSoilAnalysis && sample.waLayerNum) {
      let subCount = 0;
      Object.keys(sample.waLayerNum).forEach(fraction => {
        [...Array(sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : 2).keys()].forEach(num => {
          if (sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] !== undefined) {
            let sub = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
            if (sub.containerID) {
              let multiplier = 1;
              if (fraction === 'lt2' && sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample) {
                multiplier = parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshed)/parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshedSubsample);
              }
              subCount++;
              sub.fraction = fraction;
              sub.uid = `subfraction${fraction}-${num+1}`;
              sub.sampleNumber = sample.sampleNumber;
              sub.original = sub.verified ? sub.verified : null;
              sub.now = sub.verified ? sub.verified : null;
              sub.multiplier = multiplier;
              // if (sub.containerID === '001') console.log(sub);
              subsamples.push(sub);
              if (containerIDs.includes(sub.containerID)) duplicateIDs = sub.containerID;
              containerIDs.push(sub.containerID);
            }
          }
        });
      });
      if (subCount > subsampleCount) subsampleCount = subCount;
    }
  });
  subsamples.sort((a, b) => a.containerID - b.containerID);
  return {subsamples, duplicateIDs, subsampleCount}
}

export const checkTestCertificateIssue = (samples, job, meUid, newVersionWithIssue) => {
  let filteredSamples = [];
  if (samples) {
    filteredSamples = Object.values(samples).filter(sample => sample.cocUid === job.uid && !sample.deleted).map(sample => ({...sample, now: sample.verified, original: sample.verified }));
  }

  let issues = verifySamples(filteredSamples, job, meUid, false, false);
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
  if (job.currentVersion && newVersionWithIssue) {
    let uid = 'versionChanges' + job.currentVersion;
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

//
// ADMIN/ISSUE
//

export const printCocBulk = (job, samples, me, staffList) => {
  let staffQualList = getStaffQuals(staffList);
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
  let receivedDates = writeDates(samples, 'receivedDate');
  // console.log(receivedDates);
  if (receivedDates === "N/A") receivedDates = '';
  samples &&
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === job.uid) {
        let sampleMap = {};
        if (sample.disabled) return;
        sampleMap["no"] = sample.sampleNumber;
        if (job.waAnalysis) sampleMap["description"] = writeSimpleDescription(sample);
        else {
          sampleMap["description"] = writeCocDescription(sample);
          sampleMap["category"] = sample.category ? sample.category : 'Other';
        }
        // sampleMap["material"] = sample.material ?
        //   sample.material.charAt(0).toUpperCase() + sample.material.slice(1) : '';
        sampleList.push(sampleMap);
      }
    });
  let report = {
    jobNumber: job.jobNumber,
    client: job.client,
    contactName: job.contact && job.contact.name ? job.contact.name : '',
    contactEmail: job.contact && job.contact.email ? job.contact.email : '',
    orderNumber: job.clientOrderNumber ? job.clientOrderNumber : '',
    address: job.address,
    type: job.wfmType,
    analysisRequired,
    labToContactClient,
    labInstructions,
    receivedDates,
    warning: warning === '' ? false : warning,
    jobManager: job.manager,
    date: writeDates(Object.values(samples).filter(e => e.cocUid === job.uid), 'sampleDate'),
    personnel: getPersonnel(Object.values(samples).filter(s => s.cocUid === job.uid), 'sampledBy', null, false).map(p => p.name),
    samples: sampleList
  };
  // console.log(report);
  return report;
  // let url = job.waAnalysis ?
  //   "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc_wa.php?report=" +
  //   encodeURIComponent(JSON.stringify(report))
  //   :
  //   "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc_bulk.php?report=" +
  //   encodeURIComponent(JSON.stringify(report));
  // window.open(url);
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
  let personnel = {};
  samples &&
    Object.values(samples).forEach(sample => {
      if (sample[field] && (!onlyShowVerified || (onlyShowVerified && sample.verified))) {
        let person = sample[field];
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

export const writeVersionJson = (job, samples, version, staffList, me, batch) => {
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

        if (sample.waSoilAnalysis !== undefined) {
          sampleMap["simpleDescription"] = writeSimpleDescription(sample);
          sampleMap["simpleResult"] = writeSimpleResult(sample.result, sample.noAsbestosResultReason);
          sampleMap["formDescription"] = sample.waSoilAnalysis.formDescription ? sample.waSoilAnalysis.formDescription : 'N/A';
          sampleMap["weightSubsample"] = sample.weightSubsample ? `${sample.weightSubsample}g` : 'N/A';
          sampleMap["weightDry"] = sample.weightDry ? `${sample.weightDry}g` : 'N/A';
          sampleMap["weightAshed"] = sample.weightAshed ? `${sample.weightAshed}g` : 'N/A';
          sampleMap["moisture"] = writeSampleMoisture(sample) ? `${writeSampleMoisture(sample)}%` : 'N/A';
          sampleMap["weightAshedGt7"] = sample.waSoilAnalysis.fractiongt7WeightAshed ? `${sample.waSoilAnalysis.fractiongt7WeightAshed}g` : 'N/A';
          sampleMap["weightAshedTo7"] = sample.waSoilAnalysis.fractionto7WeightAshed ? `${sample.waSoilAnalysis.fractionto7WeightAshed}g` : 'N/A';
          sampleMap["weightAshedLt2"] = sample.waSoilAnalysis.fractionlt2WeightAshed ? `${sample.waSoilAnalysis.fractionlt2WeightAshed}g` : 'N/A';
          sampleMap["weightAshedLt2Subsample"] = sample.waSoilAnalysis.fractionlt2WeightAshedSubsample ? `${sample.waSoilAnalysis.fractionlt2WeightAshedSubsample}g` : 'N/A';

          let waTotals = getWATotalDetails(sample, job.acmInSoilLimit ? parseFloat(job.acmInSoilLimit) : 0.01);
          sampleMap["concentrationACM"] = waTotals.concentration.acm ? `${waTotals.concentration.acm}%` : 'N/A';
          sampleMap["concentrationFAAF"] = waTotals.concentration.faaf ? `${waTotals.concentration.faaf}%` : 'N/A';
          sampleMap["concentrationFA"] = waTotals.concentration.fa ? `${waTotals.concentration.fa}%` : 'N/A';
          sampleMap["concentrationAF"] = waTotals.concentration.af ? `${waTotals.concentration.af}%` : 'N/A';
          sampleMap["weightACM"] = waTotals.weight.acm ? `${waTotals.weight.acm}g` : 'N/A';
          sampleMap["weightFA"] = waTotals.weight.fa ? `${waTotals.weight.fa}g` : 'N/A';
          sampleMap["weightAF"] = waTotals.weight.af ? `${waTotals.weight.af}g` : 'N/A';
        }

        sampleList.push(sampleMap);

        // LOG SAMPLE
        batch.update(asbestosSamplesRef.doc(sample.uid),
        {
          issueVersion: version ? version : 1,
          issueDate: new Date(),
          issuedBy: {uid: me.uid, name: me.name},
        });
        logSample(job, sample, cocStats, version);
      }
    });
  let samplesFiltered = Object.values(samples).filter(s => s.cocUid === job.uid && !s.onHold && s.verified);
  let report = {
    jobNumber: job.jobNumber,
    client: `${job.client} ${job.clientOrderNumber && Object.keys(job.clientOrderNumber).length > 0 ? job.clientOrderNumber : ''}`,
    address: job.address,
    sampleDate: writeDates(samplesFiltered, 'sampleDate'),
    receivedDate: writeDates(samplesFiltered, 'receivedDate'),
    analysisDate: writeDates(samplesFiltered, 'analysisDate'),
    contactName: job.contact && job.contact.name ? job.contact.name : '',
    contactEmail: job.contact && job.contact.email ? job.contact.email : '',
    coverLetterAddress: getDefaultLetterAddress(job),
    personnel: writePersonnelQualFull(getPersonnel(samplesFiltered, 'sampledBy', staffQualList, true)),
    waAnalysis: job.waAnalysis ? job.waAnalysis : false,
    // assessors: job.personnel.sort().map(staff => {
    //   return aaNumbers[staff];
    // }),
    analysts: getPersonnel(samplesFiltered, 'analyst', null, true).map(e => e.name),
    version: version ? version : 1,
    samples: sampleList
  };
  console.log(report);
  return report;
};

export const issueTestCertificate = async (job, samples, version, changes, staffList, me, newVersion) => {
  // first check all samples have been checked
  // if not version 1, prompt for reason for new version
  let batch = firestore.batch();
  let json = await writeVersionJson(job, samples, version, staffList, me, batch);
  let versionHistory = job.versionHistory
    ? job.versionHistory
    : {};
  let log = {
    type: "Issue",
    log: newVersion ? `Version ${version} issued.` : `Version ${version} re-issued.`,
    chainOfCustody: job.uid,
  };
  addLog("asbestosLab", log, me, batch);
  if (!newVersion && versionHistory[version]) {
    let updates = versionHistory[version].updates ? versionHistory[version].updates : {};
    let updateNumber = versionHistory[version].updateNumber ? versionHistory[version].updateNumber : 0;
    updateNumber++;
    updates[updateNumber.toString()] = {
      issuedBy: versionHistory[version].issuedBy,
      issueDate: versionHistory[version].issueDate,
      data: versionHistory[version].data,
    };
    versionHistory[version] = {
      ...versionHistory[version],
      updates,
      updateNumber,
      issuedBy: {uid: me.uid, name: me.name },
      issueDate: new Date(),
      data: json,
    }
  } else {
    versionHistory[version] = {
      issuedBy: {uid: me.uid, name: me.name },
      issueDate: new Date(),
      changes: changes ? changes : 'Not specified',
      data: json,
    };
  }
  //console.log(versionHistory);
  let update = {
      currentVersion: version,
      versionHistory: versionHistory,
      versionUpToDate: true,
      lastModified: new Date(),
    };
  console.log(update)
  // //console.log(job);
  batch.update(cocsRef.doc(job.uid), update);
  batch.commit();
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
      defaultFileType: "doc",
      defaultCertificateType: job.waAnalysis ? "wa" : "bulk",
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

export const deleteCoc = (job, samples, me) => dispatch => {
  if (
    window.confirm("Are you sure you wish to delete this Chain of Custody?")
  ) {
    let log = {};
    samples && Object.values(samples).forEach(sample => {
      // console.log(sample);
      log = {
        type: "Delete",
        log: `Sample ${sample.sampleNumber} (${writeDescription(sample)}) deleted.`,
        sample: sample.uid,
        chainOfCustody: job.uid,
      };
      // console.log(log);
      addLog("asbestosLab", log, me);
      asbestosSamplesRef.doc(sample.uid).update({ deleted: true })
    });
    log = {
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
    if (sample.description.toLowerCase().includes(sample.material.toLowerCase())) str = str + sample.description;
    else str = str + sample.description + ", " + sample.material;
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

export const writeSimpleDescription = (sample) => {
  var str = '';
  if (sample.genericLocation) str = sample.genericLocation;
  if (sample.specificLocation) {
    if (str === '') {
      str = sample.specificLocation;
    } else {
      str = str + ', ' + sample.specificLocation;
    }
  }
  if (sample.description && str !== '') str = str + ': ';
  if (sample.description)
    str = str + sample.description;
  if (str.length > 1) str = str.charAt(0).toUpperCase() + str.slice(1);
  // console.log(str);
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
  if (report['layers'] === true && sample.layers !== undefined) {
    let layerNum = 3;
    if (sample.layerNum) layerNum = sample.layerNum;
    let layArray = [];
    [...Array(layerNum).keys()].forEach(num => {
      if (sample.layers[`layer${num+1}`] !== undefined) {
        let lay = sample.layers[`layer${num+1}`];
        if (lay.description !== undefined) {
          let layStr = 'L' + (num+1).toString() + ': ' + lay.description.charAt(0).toUpperCase() + lay.description.slice(1);
          if (getBasicResult(lay) === 'positive') layStr = layStr + '†';
          layArray.push(layStr);
        }
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
    if (sample.description.toLowerCase().includes(sample.material.toLowerCase())) str = str + sample.description;
    else str = str + sample.description + ", " + sample.material;
  } else if (sample.description) {
    str = str + sample.description;
  } else if (sample.material) {
    str = str + sample.material;
  } else {
    str = str + "No description";
  }

  if (sample.onHold) return str + '@~*ON HOLD';
  else return str.charAt(0).toUpperCase() + str.slice(1);
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

export const getWATotalDetails = (sample, acmLimit) => {
  // Declare vars
  let totals = {
    forms: {},
    result: {
      total: {},
      acm: {},
      fa: {},
      af: {},
      faaf: {},
    },
    weight: {
      total: 0,
      acm: 0,
      fa: 0,
      af: 0,
      faaf: 0,
    },
    fractions: {
      total: {},
      acm: {},
      fa: {},
      af: {},
      faaf: {},
    },
    concentration: {
      total: 0,
      acm: 0,
      fa: 0,
      af: 0,
      faaf: 0,
      acmFloat: 0,
    },
    allHaveTypes: true,
    allHaveForms: true,
    waOverLimit: false,
    bold: {},
  };

  if (sample && sample.waSoilAnalysis) {
    // If <2mm is subsampled, multiply asbestos weights
    let multiplier = null;
    if (sample.waSoilAnalysis.fractionlt2WeightAshedSubsample)
      multiplier = parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshed) / parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshedSubsample);

    // Loop through each fraction in the job (gt7, to7, lt2)
    fractionNames.forEach(fraction => {
      // Loop through each subsample in the fraction
      [...Array(sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : 3).keys()].forEach(num => {
        let subsample = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
        if (subsample) {
          // Check if subsample has concentration and weight set
          if (subsample.concentration && subsample.weight) {
            // Check subsample has the form and types of asbestos declared
            if (!subsample.form) totals.allHaveForms = false;
            if (!subsample.result) totals.allHaveTypes = false;

            let weight = 0;
            if (subsample.weight) weight = parseFloat(subsample.weight);
            // If subsample has a tare weight, subtract this from the weight
            if (subsample.weight && subsample.tareWeight) weight = weight - parseFloat(subsample.tareWeight);

            // If tare weight is greater than gross weight, set weight to zero
            if (weight < 0) weight = 0;

            // Multiply the weight by the estimated concentration of asbestos in subsample
            weight = weight * parseFloat(subsample.concentration)/ 100;

            // Multiply weight if using <2mm subsample. This presumes the portion of the <2mm fraction that was analysed is representative of the whole <2mm fraction.
            if (fraction === 'lt2' && multiplier) weight = weight * multiplier;

            // Add weight to totals
            totals.weight.total = totals.weight.total + weight;
            if (subsample.form === 'acm') totals.weight.acm = totals.weight.acm + weight;
            else if (subsample.form === 'fa') totals.weight.fa = totals.weight.fa + weight;
            else if (subsample.form === 'af') totals.weight.af = totals.weight.af + weight;
          }
          if (subsample.form) {
            // Add forms to the list
            totals.forms[subsample.form] = true;
            totals.fractions.total[fraction] = true;
            totals.fractions[subsample.form][fraction] = true;
            if (subsample.form === 'fa' || subsample.form === 'af') totals.fractions.faaf[fraction] = true;
          }
          if (subsample.result) {
            // Add result to the list to check against the reported result
            totals.result.total = mergeAsbestosResult(totals.result.total, subsample.result);
            if (subsample.form === 'acm') totals.result.acm = mergeAsbestosResult(totals.result.acm, subsample.result);
            else if (subsample.form === 'fa') totals.result.fa = mergeAsbestosResult(totals.result.fa, subsample.result);
            else if (subsample.form === 'af') totals.result.af = mergeAsbestosResult(totals.result.af, subsample.result);
          }
        }
      });
    });

    // Combine AF FA
    totals.result.faaf = mergeAsbestosResult(totals.result.af, totals.result.fa);
    totals.weight.faaf = totals.weight.fa + totals.weight.af;

    // Check if sample is not detected, above limit or below limit
    if (totals.result.total.no) {
      totals.soilConcentrationResult = 'Not Detected';
    } else if (parseFloat(((totals.weight.faaf/sample.weightDry) * 100)) < 0.001 && parseFloat(((totals.weight.acm/sample.weightDry) * 100)) < acmLimit) {
      totals.soilConcentrationResult = 'Below Limit';
    }

    // Calculate concentrations from weights (detection limit for concentrations is <0.001%)
    if (sample.weightDry) {
      totals.concentration.acmFloat = parseFloat(((totals.weight.acm/sample.weightDry) * 100));
      // Check if concentration is over the limit (acmLimit varies depending on the land use set for the job)
      if (
        (parseFloat((totals.weight.faaf/sample.weightDry) * 100) >= 0.001) ||
        (parseFloat((totals.weight.fa/sample.weightDry) * 100) >= 0.001) ||
        (parseFloat((totals.weight.af/sample.weightDry) * 100) >= 0.001) ||
        totals.concentration.acmFloat >= acmLimit
      ) totals.waOverLimit = true;
      totals.concentration.total = parseFloat(((totals.weight.total/sample.weightDry) * 100)) < 0.001 ? '<0.001' : parseFloat(((totals.weight.total/sample.weightDry) * 100)).toFixed(3);
      totals.concentration.acm = totals.concentration.acmFloat < 0.001 ? '<0.001' : parseFloat(((totals.weight.acm/sample.weightDry) * 100)).toFixed(3);
      totals.concentration.faaf = parseFloat(((totals.weight.faaf/sample.weightDry) * 100)) < 0.001 ? '<0.001' : parseFloat(((totals.weight.faaf)/sample.weightDry) * 100).toFixed(3);
      totals.concentration.fa = parseFloat(((totals.weight.fa/sample.weightDry) * 100)) < 0.001 ? '<0.001' : parseFloat((totals.weight.fa/sample.weightDry) * 100).toFixed(3);
      totals.concentration.af = parseFloat(((totals.weight.af/sample.weightDry) * 100)) < 0.001 ? '<0.001' : parseFloat((totals.weight.af/sample.weightDry) * 100).toFixed(3);
    }

    // Round numbers, set detection limits for weight (detection limit for weights is <0.00001g)
    totals.weight.total = totals.weight.total < 0.00001 ? '<0.00001' : totals.weight.total.toFixed(5);
    totals.weight.acm = totals.weight.acm < 0.00001 ? '<0.00001' : totals.weight.acm.toFixed(5);
    totals.weight.faaf = totals.weight.faaf < 0.00001 ? '<0.00001' : totals.weight.faaf.toFixed(5);
    totals.weight.fa = totals.weight.fa < 0.00001 ? '<0.00001' : totals.weight.fa.toFixed(5);
    totals.weight.af = totals.weight.af < 0.00001 ? '<0.00001' : totals.weight.af.toFixed(5);
  }
  return totals;
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
      if (!confirm.deleted) {
        let match = compareAsbestosResult(confirm, sample);
        if (match === 'yes' || match === 'differentNonAsbestos') {
          checks.push(confirm.analyst);
        }
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

export const getSampleStatusCode = (sample) => {
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
        notAnalysed: 'Not analysed',
        sampleSizeTooSmall: 'Sample size too small',
        sampleNotReceived: 'Sample not received by lab',
        other: 'Not analysed'
      };
      return reasonMap[noAsbestosResultReason];
    }
    return "Not analysed";
  }
  Object.keys(result).forEach(type => {
    if (result[type]) detected.push(type);
  });
  if (detected.length < 1) return "Not analysed";
  let others = '';
  let otherArray = [];
  if (result["org"]) otherArray.push("organic fibres");
  if (result["smf"]) otherArray.push("synthetic mineral fibres");
  if (otherArray.length > 0) others = `${otherArray.join(' and ')} detected`
  if (others !== '') others = `@~${others.charAt(0).toUpperCase()}${others.slice(1)}`;
  if (result["no"]) return "No asbestos detected" + others;
  let asbestos = [];
  if (result["ch"]) asbestos.push("chrysotile");
  if (result["am"]) asbestos.push("amosite");
  if (result["cr"]) asbestos.push("crocidolite");
  if (asbestos.length > 0) {
    asbestos[asbestos.length - 1] =
      asbestos[asbestos.length - 1] + " asbestos";
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
        str = str + " and unidentified mineral fibres (UMF)";
      } else {
        str = "unidentified mineral fibres (UMF)";
      }
    }
  });
  // Don't show other fibres with positives to avoid confusion
  return str.charAt(0).toUpperCase() + str.slice(1) + " detected" + others;
};

export const writeSimpleResult = (result, noAsbestosResultReason) => {
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
  if (result["no"]) return "NO";
  let asbestos = [];
  if (result["ch"]) asbestos.push("CH");
  if (result["am"]) asbestos.push("AM");
  if (result["cr"]) asbestos.push("CR");
  if (result["umf"]) asbestos.push("UMF");
  return asbestos.join(" ");
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
      if (fractionArray.length > 0) minorFractions.push('some ' + andList(fractionArray));
    }
    if (details.minorFractionTypes) {
      let fractionArray = [];
      Object.keys(details.minorFractionTypes).forEach(key => {
        if (details.minorFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) minorFractions.push('minor ' + andList(fractionArray));
    }
    if (details.traceFractionTypes) {
      let fractionArray = [];
      Object.keys(details.traceFractionTypes).forEach(key => {
        if (details.traceFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) minorFractions.push('trace of ' + andList(fractionArray));
    }
    if (minorFractions.length > 0) str += 'with ' + andList(minorFractions);
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

    if (fractionArray.length > 0) sections.push(andList(fractionArray));

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

export const getSampleStatus = sample => {
  console.log(sample);
  let status = 'In Transit';
  if (sample) {
    if (sample.verified) status = 'Complete';
      else if (sample.analysisDate && sample.weightReceived) status = 'Waiting on Verification';
      else if (sample.analysisStarted) status = `Analysis Started`;
      else if (sample.receivedByLab) status = `Received by Lab`;
    if (sample.deleted) status = status + " (DELETED)";
    if (sample.onHold) status = status + " (ON HOLD)";
  }
  return status;
};

export const getJobStatus = (samples, job) => {
  let jobID = job.uid;
  let versionUpToDate = job.versionUpToDate;
  let status = '';
  let totalSamples = 0;

  let numberReceived = 0;
  let numberAnalysisStarted = 0;
  let numberResult = 0;
  let numberWeight = 0;
  let numberVerified = 0;
  let numberWAAnalysisIncomplete = 0;
  let analysisStartedBy = 'Lab';
  let timeInLab = 0;
  let timeInAdmin = 0;
  let readyForIssue = 0;

  if (samples && Object.values(samples).length > 0) {
    Object.values(samples).forEach(sample => {
      if (sample.cocUid === jobID) {
        totalSamples++;
        if (sample.receivedByLab) {
          timeInLab = timeInLab + (new Date() - dateOf(sample.receivedDate));
          numberReceived++;
        }
        if (sample.analysisStarted){
          numberAnalysisStarted++;
          if (analysisStartedBy === 'Lab') analysisStartedBy = sample.analysisStartedBy.name;
        }
        if (sample.verified) numberVerified++;
        if (job.waAnalysis && !sample.waAnalysisComplete) numberWAAnalysisIncomplete++;
        if (getBasicResult(sample) !== 'none') {
          if (sample.weightReceived) {
            timeInAdmin = timeInAdmin + (new Date() - dateOf(sample.analysisDate));
            readyForIssue++;
          }
          numberResult++;
        }
        if (sample.weightReceived) numberWeight++;
      }
    });
  }

  if (numberReceived > 0) timeInLab = timeInLab / numberReceived;
  if (readyForIssue > 0) timeInAdmin = timeInAdmin / readyForIssue;

  if (versionUpToDate) {
    if (job.mostRecentIssueSent) status = `Issued and Sent`;
    else status = `Issued`;
  } else if (totalSamples === 0) {
    status = 'No Samples';
  } else if (numberReceived === 0) {
    status = `In Transit (${totalSamples})`;
  } else if (numberAnalysisStarted === 0) {
    status = `Received By Lab (${numberReceived} ${numberReceived == 1 ? 'sample' : 'samples'}${timeInLab > 600000 ? `; ${milliToDHM(timeInLab, true, false)} ago` : ''})`;
  } else if (numberVerified === totalSamples) {
    if (job.waAnalysis && numberWAAnalysisIncomplete > 0) status = `All Samples Verified, WA Analysis Incomplete (${totalSamples - numberWAAnalysisIncomplete}/${totalSamples})`;
    else {
      if (numberResult === totalSamples) status = 'Ready for Issue';
      else status = `All Samples Verified, Bulk ID Incomplete (${numberResult}/${totalSamples})`;
    }
  } else if (numberResult === 0) {
    status = `Analysis Started by ${analysisStartedBy} (${numberAnalysisStarted})`;
  } else if (numberResult === totalSamples && numberVerified === 0) {
    if (job.waAnalysis && numberWAAnalysisIncomplete > 0) status = `Bulk ID Complete, WA Analysis Incomplete (${totalSamples - numberWAAnalysisIncomplete}/${totalSamples})`;
      else if (numberWeight !== totalSamples) status = `Asbestos Result Complete, Weights Required (${numberWeight}/${totalSamples})`;
      else status = `Analysis Complete (${readyForIssue} ${readyForIssue == 1 ? 'sample' : 'samples'}${timeInAdmin > 600000 ? `; ${milliToDHM(timeInAdmin, true, false)} ago` : ''})`;
  } else if (numberVerified > 0) {
    status = `Analysis Partially Verified (${numberVerified}/${totalSamples})`;
  } else if (numberResult > 0 ) {
    status = `Analysis Partially Complete (${numberResult}/${totalSamples})`;
  } else if (numberAnalysisStarted > 0) {
    status = `Analysis Partially Started by ${analysisStartedBy} (${numberAnalysisStarted}/${totalSamples})`;
  } else if (numberReceived > 0) {
    status = `Partially Received by Lab (${numberReceived}/${totalSamples})`;
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
    holidays: [
      '2019-11-15',
      '2019-12-25',
      '2019-12-26',
      '2020-01-01',
      '2020-01-02',
      '2020-02-06',
      '2020-04-10',
      '2020-04-13',
      '2020-04-27',
      '2020-06-01',
      '2020-10-26',
      '2020-11-13',
      '2020-12-25',
      '2020-12-26',
    ],
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
          let analysisBusinessTime = moment(dateOf(sample.analysisDate)).workingDiff(moment(dateOf(sample.receivedDate)));
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
            let turnaroundBusinessTime = moment(dateOf(sample.verifyDate)).workingDiff(moment(dateOf(sample.receivedDate)));
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

            let reportBusinessTime = moment(dateOf(sample.verifyDate)).workingDiff(moment(dateOf(sample.analysisDate)));
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

  preWeight = parseFloat(preWeight);
  postWeight = parseFloat(postWeight);

  if (!preWeight || !postWeight || preWeight == 0 || preWeight < postWeight) return null;
    else return Math.round(((preWeight - postWeight)/preWeight) * 100);
};

export const writeSampleDimensions = (sample, total) => {
  let dims = [];
  ['length','width','depth'].forEach(dim => {
    // console.log(dim);
    if (sample.dimensions !== undefined && sample.dimensions[dim] !== undefined && sample.dimensions[dim] !== '') dims.push(parseFloat(sample.dimensions[dim]));
  });
  if (dims.length === 0) return null;
  let app = '';
  if (dims.length === 3) {
    let volMM = dims[0]*dims[1]*dims[2];
    let volCM = volMM / 1000;
    let volM = volMM / 1000000000;
    if (volM > 0.1) app = volM.toPrecision(2) + 'm³';
    else if (volCM > 0.1) app = volCM.toPrecision(2) + 'cm³';
    else app = volMM.toPrecision(2) + 'mm³';
  } else if (dims.length === 2) {
    let areaMM = dims[0] * dims[1];
    let areaCM = areaMM / 100;
    let areaM = areaMM / 1000000;
    if (areaM > 1) app = areaM.toPrecision(2) + 'm²';
    else if (areaCM > 1) app = areaCM.toPrecision(2) + 'cm²';
    else app = areaMM.toPrecision(2) + 'mm²';
  } else if (dims.length === 1) {
    let lMM = dims[0];
    let lCM = lMM / 10;
    let lM = lMM / 1000;
    if (lM > 1) app = lM.toPrecision(2) + 'm';
    else if (lCM > 1) app = lCM.toPrecision(2) + 'cm';
    else app = lMM.toPrecision(2) + 'mm';
  }
  if (total) return app;
    else return dims.map(dim => `${dim}mm`).join(' x ') + ` (${app})`;
}

export const collateArrayResults = layers => {
  let results = {};
  layers.forEach(layer => {
    if (layer.result !== undefined && layer.result.deleted !== true) {
      Object.keys(layer.result).forEach(k => {
        if (layer.result[k] === true) results[k] = true;
      });
    }
  });
  if (results['no'] === true && (results['ch'] === true || results['am'] === true || results['cr'] === true || results['umf'] === true)) {
    results['no'] = false;
  }
  return results;
};

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
  // console.log(results);
  return results;
};

export const checkVerifyIssues = () => {
  let issues = [];
  return issues;
};
