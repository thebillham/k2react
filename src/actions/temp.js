import {
  docsRef,
  logsRef,
  noticesRef,
  noticeReadsRef,
  firebase,
  asbestosSamplesRef,
  firestore,
  asbestosSampleLogRef,
  asbestosSampleIssueLogRef,
  asbestosAnalysisLogRef,
  asbestosCheckLogRef,
  usersRef,
  stateRef
} from "../config/firebase";
import { GRAB_JOB_DATA, GRAB_LAB_DATA } from "../constants/action-types";
import { dateOf } from "../actions/helpers";
import moment from "moment";

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

export const fixNoticeReads = () => {
  stateRef
    .doc("noticereads")
    .collection("users")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // console.log(doc.data().payload);
        let newArray = Object.values(doc.data().payload)
          .filter(e => e.value)
          .map(e => e.value);
        // console.log(newArray);

        stateRef
          .doc("noticereads")
          .collection("users")
          .doc(doc.id)
          .update({ payload: newArray });
      });
    });
};

export const grabJobData = () => dispatch => {
  let jobMap = {};
  stateRef
    .doc("wfmstate")
    .collection("jobStates")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        let day = doc.data();
        let date = doc.id;
        if (day) {
          Object.entries(day).forEach(([key, value]) => {
            if (!jobMap[key]) {
              jobMap[key] = {
                category: value.category || null,
                client: value.client || null,
                clientAddress: value.clientAddress || null,
                clientID: value.clientID || null,
                creationDate: value.creationDate || null,
                geocodeAddress:
                  (value.geocode && value.geocode.address) || null,
                jobNumber: value.jobNumber || null,
                name: value.name || null,
                owner: value.owner || null,
                wfmID: value.wfmID || key,
                state: value.wfmState || value.state || null,
                [value.wfmState || value.state]: date // Each state holds value of day it changed to that state
              };
            } else {
              let state = value.wfmState || value.state;
              if (state !== jobMap[key].state) {
                jobMap[key].state = state || null;
                if (jobMap[key][state]) {
                  // Ignore returns to job states for the csv output
                } else {
                  jobMap[key][state] = date;
                }
              }
            }
          });
          Object.entries(jobMap).forEach(([key, value]) => {
            if (!day[key] && jobMap[key].completionDate === undefined) {
              jobMap[key].completionDate = date
                ? moment(dateOf(date))
                    .subtract(1, "day")
                    .format("YYYY-MM-DD")
                : null;
            }
          });
        }
      });

      dispatch({
        type: GRAB_JOB_DATA,
        payload: Object.values(jobMap)
      });
    });
};

export const grabLabData = () => dispatch => {};

// export const iterateThroughBackup = (notices, staff) => {
//   let batch = firestore.batch();
//   console.log(notices);
//   console.log(staff);
//
//
// // loadEntries(blogEntries)
// //   .then((entries) => console.log(entries));
// //     fetch(`../noticereads/notices/${notice.uid}/${notice.uid}.json`)
// //       .then(res => {
// //         res.text()
// //           .then(data => {
// //             console.log(data);
// //           })
// //         });
// //   });
//   staff && Object.keys(staff).forEach(staff => {
//     console.log(staff);
//     fetch(`http://localhost:3000/noticereads/staff/${staff}/${staff}.json`)
//       .then(res => res.text())
//       .then(data => {
//         console.log(data);
//       });
//   });
// }

export const splitWFMStates = () => {
  console.log("Splitting WFM states...");
  stateRef
    .doc("wfmstate")
    .collection("states")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(day => {
        let batch = firestore.batch(),
          date = day.id,
          state = day.data().state,
          leads1 = {},
          leads2 = {},
          jobs = {},
          leadSwitch = true;
        Object.values(state).forEach(item => {
          if (item.isJob) jobs[item.wfmID] = item;
          else if (leadSwitch) leads1[item.wfmID] = item;
          else leads2[item.wfmID] = item;
          leadSwitch = !leadSwitch;
        });

        console.log(date);
        console.log(Object.keys(jobs).length);
        console.log(Object.keys(leads1).length);
        console.log(Object.keys(leads2).length);

        batch.set(
          stateRef
            .doc("wfmstate")
            .collection("jobStates")
            .doc(date),
          jobs
        );
        batch.set(
          stateRef
            .doc("wfmstate")
            .collection("leadStates1")
            .doc(date),
          leads1
        );
        batch.set(
          stateRef
            .doc("wfmstate")
            .collection("leadStates2")
            .doc(date),
          leads2
        );
        batch.commit();
      });
    });
};

export const fixSamples = () => {
  asbestosSamplesRef
    .where("cocUid", "==", "AS191071_CANTERBURY DEMOLITION_1573695746768")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(s => {
        let sample = s.data();
        asbestosSamplesRef.doc(s.id).update({
          analyst: "Ben Dodd",
          analysisDate: new Date("November 18, 2019 14:00:00"),
          analysisRecordedBy: {
            name: "Ben Dodd",
            uid: "OgNBX60s1GThob3pODjtqM4tkNn1"
          }
        });
      });
    });
};

export const transferNoticeboardReads = () => {
  noticesRef.get().then(querySnapshot => {
    var notices = [];
    querySnapshot.forEach(doc => {
      let notice = doc.data();
      if (notice.staff) {
        notice.staff.forEach(staff => {
          console.log(`Adding ${staff} to ${notice.uid}`);
          noticeReadsRef.add({
            noticeUid: notice.uid,
            staffUid: staff,
            date: new Date()
          });
        });
      }
    });
  });
};

export const renameAnalysisLog = () => {
  let batch = firestore.batch();
  asbestosCheckLogRef.get().then(querySnapshot => {
    querySnapshot.forEach(logDoc => {
      let log = logDoc.data();
      if (log.sampleUID) {
        batch.update(asbestosCheckLogRef.doc(logDoc.id), {
          sampleUid: log.sampleUID,
          sampleUID: firebase.firestore.FieldValue.delete()
        });
      }
    });
    batch.commit();
  });
};

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
          sessionID: logDoc.data().sessionID
        };
        let uid = `${logDoc.data().sampleUID}-${logDoc.data().sessionID}`;
        let sample = {};
        asbestosSamplesRef
          .doc(logDoc.data().sampleUID)
          .get()
          .then(sampleSnapshot => {
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
              sampleUid: sample.uid,
              waAnalysisComplete: sample.waAnalysisComplete
                ? sample.waAnalysisComplete
                : null,
              waTotals: sample.waTotals ? sample.waTotals : null,
              weightAshed: sample.weightAshed ? sample.weightAshed : null,
              weightDry: sample.weightDry ? sample.weightDry : null,
              uid: uid
            };
            asbestosAnalysisLogRef.doc(uid).set(log);
          });
      }
    });
  });
};

export const restructureSampleIssueLog = () => {
  asbestosSampleLogRef.get().then(querySnapshot => {
    let batch = firestore.batch();
    querySnapshot.forEach(logDoc => {
      // console.log(logDoc.data());
      if (logDoc.data().cocUid === "AS190906_PORT OTAGO_1568328045951") {
        let log = logDoc.data();
        let uid = `${log.sampleUid}-${moment(dateOf(log.issueDate)).format(
          "x"
        )}`;
        log.uid = uid;
        batch.set(asbestosSampleIssueLogRef.doc(uid), log);
      }
    });
    batch.commit();
  });
};

export const cleanLogs = () => {
  let counter = 1;
  logsRef
    .collection("asbestosLab")
    .get()
    .then(querySnapshot => {
      let batch = firestore.batch();
      querySnapshot.forEach(logDoc => {
        if (
          counter <= 499 &&
          logDoc.data().chainOfCustody !== undefined &&
          logDoc.data().chainOfCustody !== "AS190906_PORT OTAGO_1568328045951"
        ) {
          batch.delete(logsRef.collection("asbestosLab").doc(logDoc.id));
          if (counter === 499) batch.commit();
          counter++;
        }
      });
    });
};

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

// export const restructureWAAnalysisSamples = () => {
//   console.log('Restructuring....');
//   asbestosSamplesRef.get().then(querySnapshot => {
//     let batch = firestore.batch();
//     querySnapshot.forEach(sampleDoc => {
//       let sample = sampleDoc.data();
//       // console.log(sample);
//       if (sample.waAnalysisSubsamples !== undefined && sample.waAnalysisSubsamples.length > 0) {
//         sample.waAnalysisSubsamples.forEach(subsample => {
//           let containerID = 'XXX';
//           let fraction = '-';
//           let form = 'fff';
//           if (subsample.containerID !== undefined) containerID = subsample.containerID;
//           if (subsample.fraction !== undefined) fraction = subsample.fraction;
//           if (subsample.form !== undefined) form = subsample.form;
//           subsample.sampleUid = sample.uid;
//           subsample.jobNumber = sample.jobNumber;
//           subsample.cocUid = sample.cocUid;
//           let uid = `${sample.jobNumber}-${sample.sampleNumber}-${containerID}-${fraction}-${form}-CREATED-${moment().format('x')}-${Math.round(
//             Math.random() * 1000
//           )}`;
//           batch.set(asbestosWASubsamplesRef.doc(uid), subsample);
//         });
//       }
//     });
//     batch.commit();
//   })
// }
