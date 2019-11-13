import {
  docsRef,
  logsRef,
  noticesRef,
  noticeReadsRef,
  firebase,
  asbestosSamplesRef,
  firestore,
  asbestosWASubsamplesRef,
  asbestosSampleLogRef,
  asbestosSampleIssueLogRef,
  asbestosAnalysisLogRef,
  usersRef,
} from "../config/firebase";
import {
  dateOf,
} from "../actions/local";
import moment from 'moment';

export const fixIds = () => dispatch => {
  //console.log("Running fixIds");
  docsRef.get().then(docSnap => {
    docSnap.forEach(doc => {
      if (doc.id.includes(":")) {
        docsRef.doc(doc.id).delete();
      }
    });
  });
};

export const transferNoticeboardReads = () => {
  noticesRef
    .get().then(querySnapshot => {
      var notices = [];
      querySnapshot.forEach(doc => {
        let notice = doc.data();
        if (notice.staff) {
          notice.staff.forEach(staff => {
            console.log(`Adding ${staff} to ${notice.uid}`);
            noticeReadsRef.add({
              noticeUid: notice.uid,
              staffUid: staff,
              date: new Date(),
            });
          });
        }
      });
    });
}

export const restructureAnalysisLog = () => {
  asbestosAnalysisLogRef.get().then(querySnapshot => {
    querySnapshot.forEach(logDoc => {
      if (logDoc.data().cocUID === "AS190906_PORT OTAGO_1568328045951") {
        let log = {
          analysisDate: logDoc.data().analysisDate,
          analyst: logDoc.data().analyst,
          sessionID: logDoc.data().sessionID,
          weightReceived: logDoc.data().weightReceived,
          result: logDoc.data().result,
          cocUid: logDoc.data().cocUID,
          sessionID: logDoc.data().sessionID,
        };
        let uid = `${logDoc.data().sampleUID}-${logDoc.data().sessionID}`;
        let sample = {};
        asbestosSamplesRef.doc(logDoc.data().sampleUID).get().then(sampleSnapshot => {
          sample = sampleSnapshot.data();
          log = {
            ...log,
            analysisRecordedBy: sample.analysisRecordedBy,
            analysisStartDate: sample.analysisStartDate,
            analysisStartedBy: sample.analysisStartedBy,
            analysisTime: sample.analysisTime,
            category: sample.category,
            issueVersion: sample.issueVersion ? sample.issueVersion : 1,
            jobNumber: sample.jobNumber,
            material: sample.material,
            receivedDate: sample.receivedDate,
            sampleNumber: sample.sampleNumber,
            genericLocation: sample.genericLocation,
            specificLocation: sample.specificLocation,
            description: sample.description,
            sampleUID: sample.uid,
            waAnalysisComplete: sample.waAnalysisComplete ? sample.waAnalysisComplete : null,
            waTotals: sample.waTotals ? sample.waTotals : null,
            weightAshed: sample.weightAshed ? sample.weightAshed : null,
            weightDry: sample.weightDry ? sample.weightDry : null,
            uid: uid,
          }
          asbestosAnalysisLogRef.doc(uid).set(log);
        });
      }
    });
  });
}

export const restructureSampleIssueLog = () => {
  asbestosSampleLogRef.get().then(querySnapshot => {
    let batch = firestore.batch();
    querySnapshot.forEach(logDoc => {
      // console.log(logDoc.data());
      if (logDoc.data().cocUid === "AS190906_PORT OTAGO_1568328045951") {
        let log = logDoc.data();
        let uid = `${log.sampleUid}-${moment(dateOf(log.issueDate)).format('x')}`;
        log.uid = uid;
        batch.set(asbestosSampleIssueLogRef.doc(uid), log);
      }
    });
    batch.commit();
  });
}

export const cleanLogs = () => {
  let counter = 1;
  logsRef.collection("asbestosLab").get().then(querySnapshot => {
    let batch = firestore.batch();
    querySnapshot.forEach(logDoc => {
      if (counter <= 499 && logDoc.data().chainOfCustody !== undefined && logDoc.data().chainOfCustody !== "AS190906_PORT OTAGO_1568328045951") {
        batch.delete(logsRef.collection("asbestosLab").doc(logDoc.id));
        if (counter === 499) batch.commit();
        counter++;
      }
    })
  })
}

export const copyStaff = (oldId, newId) => dispatch => {
  usersRef
    .doc(oldId)
    .get()
    .then(doc => {
      usersRef.doc(newId).set(doc.data());
    });
  usersRef
    .doc(oldId)
    .collection("attr")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        usersRef
          .doc(newId)
          .collection("attr")
          .doc(doc.id)
          .set(doc.data());
      });
    });
  usersRef
    .doc(oldId)
    .collection("readinglog")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        usersRef
          .doc(newId)
          .collection("readinglog")
          .doc(doc.id)
          .set(doc.data());
      });
    });
  usersRef
    .doc(oldId)
    .collection("quizlog")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        usersRef
          .doc(newId)
          .collection("quizlog")
          .doc(doc.id)
          .set(doc.data());
      });
    });
  usersRef
    .doc(oldId)
    .collection("myjobs")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        usersRef
          .doc(newId)
          .collection("myjobs")
          .doc(doc.id)
          .set(doc.data());
      });
    });
};

export const restructureWAAnalysisSamples = () => {
  console.log('Restructuring....');
  asbestosSamplesRef.get().then(querySnapshot => {
    let batch = firestore.batch();
    querySnapshot.forEach(sampleDoc => {
      let sample = sampleDoc.data();
      // console.log(sample);
      if (sample.waAnalysisSubsamples !== undefined && sample.waAnalysisSubsamples.length > 0) {
        sample.waAnalysisSubsamples.forEach(subsample => {
          let containerID = 'XXX';
          let fraction = '-';
          let form = 'fff';
          if (subsample.containerID !== undefined) containerID = subsample.containerID;
          if (subsample.fraction !== undefined) fraction = subsample.fraction;
          if (subsample.form !== undefined) form = subsample.form;
          subsample.sampleUid = sample.uid;
          subsample.jobNumber = sample.jobNumber;
          subsample.cocUid = sample.cocUid;
          let uid = `${sample.jobNumber}-${sample.sampleNumber}-${containerID}-${fraction}-${form}-CREATED-${moment().format('x')}-${Math.round(
            Math.random() * 1000
          )}`;
          batch.set(asbestosWASubsamplesRef.doc(uid), subsample);
        });
      }
    });
    batch.commit();
  })
}
