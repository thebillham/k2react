import {
  APP_HAS_LOADED,
  CAT_CHANGE,
  CLEAR_LOG,
  GET_ASBESTOS_ANALYSIS,
  GET_AIR_ANALYSTS,
  GET_BULK_ANALYSTS,
  GET_COCS,
  GET_ASSETS,
  GET_DOCUMENTS,
  GET_EDIT_STAFF,
  GET_GEOCODES,
  GET_HELP,
  GET_INCIDENTS,
  GET_LOGS,
  GET_ME,
  GET_SITES,
  GET_METHODLOG,
  GET_METHODS,
  GET_NOTICES,
  GET_NOTICE_READS,
  GET_QUESTIONS,
  GET_QUIZZES,
  GET_QUIZLOG,
  GET_READINGLOG,
  GET_SAMPLES,
  GET_STAFF,
  GET_TOOLS,
  GET_TRAININGS,
  GET_UPDATES,
  GET_USER,
  GET_VEHICLES,
  GET_WFM_JOBS,
  GET_WFM_JOB,
  GET_WFM_LEADS,
  GET_WFM_CLIENTS,
  GET_CURRENT_JOB_STATE,
  SAVE_WFM_ITEMS,
  SAVE_WFM_STATS,
  RESET_LOCAL,
  SEARCH_CHANGE,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  SET_MODAL_ERROR,
  SET_STEPPER,
  UPDATE_STAFF,
  EDIT_MODAL_DOC,
  GET_WFM_CONTACT,
} from "../constants/action-types";
import moment from "moment";
import {
  asbestosSamplesRef,
  asbestosAnalysisLogRef,
  assetsRef,
  auth,
  cocsRef,
  docsRef,
  helpRef,
  incidentsRef,
  logsRef,
  methodsRef,
  noticesRef,
  noticeReadsRef,
  questionsRef,
  quizzesRef,
  sitesRef,
  stateRef,
  toolsRef,
  trainingPathsRef,
  updateRef,
  usersRef,
  vehiclesRef,
  firestore,
} from "../config/firebase";
import { xmlToJson } from "../config/XmlToJson";
// import assetData from "./assetData.json";

export const resetLocal = () => dispatch => {
  dispatch({ type: RESET_LOCAL });
};

// Separate stream for just your information. So you don't re-read all staff for just changing your details.
export const fetchMe = () => async dispatch => {
  auth.currentUser &&
    usersRef.doc(auth.currentUser.uid).onSnapshot(doc => {
      // //console.log("Read a doc (fetchMe)!");
      if (doc.exists) {
        let user = doc.data();
        user.uid = doc.id;
        sendSlackMessage(`${auth.currentUser.displayName} read fetchMe (1 document)`);
        if (user.auth && user.auth["Asbestos Air Analysis"]) {
          // dispatch({ type: GET_AIR_ANALYSTS, payload: [{uid: user.uid, name: user.name}] });
          dispatch({ type: SET_ANALYST, payload: user.name });
        }
        if (user.auth && user.auth["Asbestos Bulk Analysis"]) {
          // dispatch({ type: GET_BULK_ANALYSTS, payload: [{uid: user.uid, name: user.name}] });
          dispatch({ type: SET_ANALYST, payload: user.name });
        }
        dispatch({ type: GET_ME, payload: user });
        dispatch({ type: APP_HAS_LOADED });
        // usersRef.doc(doc.id).collection("myjobs")
        //   .onSnapshot((querySnapshot) => {
        //     user.jobs = {};
        //     if (querySnapshot.size > 0) {
        //       querySnapshot.forEach((doc) => {
        //         //console.log("Read a doc (my job)!");
        //         let job = doc.data();
        //         job.uid = doc.id;
        //         user.jobs[doc.id] = job;
        //       });
        //       dispatch({ type: GET_ME, payload: user });
        //     }
        //     dispatch({ type: APP_HAS_LOADED });
        //   });
      }
    });
};

export const fetchStaff = update => async dispatch => {
  if (update) {
    // //console.log("Running fetch staff to update");
    var users = {};
    usersRef.get().then(querySnapshot => {
      // //console.log(querySnapshot);
      sendSlackMessage(`${auth.currentUser.displayName} read fetchStaff (${querySnapshot.size} documents)`);
      let airAnalysts = [];
      let bulkAnalysts = [];
      querySnapshot.forEach(doc => {
        // //console.log(doc.data());
        if (doc.data().key !== undefined) {
          // //console.log("Read a doc! " + doc.data().name);

          let user = doc.data();
          user.uid = doc.id;
          users[doc.id] = user;
          if (user.auth && user.auth["Asbestos Air Analysis"])
            airAnalysts.push({ uid: user.uid, name: user.name });
          if (user.auth && user.auth["Asbestos Bulk Analysis"])
            bulkAnalysts.push({ uid: user.uid, name: user.name });
        }
      });
      // //console.log(users);
      dispatch({ type: GET_STAFF, payload: users, update: true });
      dispatch({ type: GET_AIR_ANALYSTS, payload: airAnalysts, update: true });
      dispatch({ type: GET_BULK_ANALYSTS, payload: bulkAnalysts, update: true });
    });
  } else {
    // //console.log("Fetching staff from cache");
    stateRef.doc("staff").onSnapshot(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} read fetchStaff from state (1 document)`);
      if (doc.exists) {
        // //console.log(doc.data());
        // .filter((m) => m.uid !== auth.currentUser.uid)
        dispatch({ type: GET_STAFF, payload: doc.data() });
      } else {
        // //console.log("Doc doesn't exist");
      }
    });
    stateRef
      .doc("airAnalysts")
      .get()
      .then(doc => {
        sendSlackMessage(`${auth.currentUser.displayName} read fetchStaff air analysts from state (1 document)`);
        if (doc.exists) {
          dispatch({ type: GET_AIR_ANALYSTS, payload: doc.data().payload });
        }
      });
    stateRef
      .doc("bulkAnalysts")
      .get()
      .then(doc => {
        sendSlackMessage(`${auth.currentUser.displayName} read fetchStaff bulk analysts from state (1 document)`);
        if (doc.exists) {
          dispatch({ type: GET_BULK_ANALYSTS, payload: doc.data().payload });
        }
      });
  }
};

export const getUserAttrs = (userPath, editStaff) => async dispatch => {
  // //console.log("Calling update staff for " + userPath);
  let user = {};
  auth.currentUser &&
    usersRef
      .doc(userPath)
      .collection("attr")
      .get()
      .then(querySnapshot => {
        sendSlackMessage(`${auth.currentUser.displayName} read getUserAttrs for ${userPath} (${querySnapshot.size} documents)`);
        user.attrs = {};
        user.aanumber = "";
        user.tertiary = "";
        user.ip402 = false;
        user.nzqa = [];
        user.nzqatraining = "None";
        user.firstaid = null;
        user.maskfit = "";
        user.docimages = [];
        if (querySnapshot.size > 0) {
          querySnapshot.forEach(doc => {
            // //console.log("Read a doc (Attr)!");
            let attr = doc.data();
            attr.uid = doc.id;
            user.attrs[doc.id] = attr;
            if (attr.fileUrl) {
              user.docimages.push({
                type: attr.type,
                url: attr.fileUrl
              });
            }
            if (attr.type === "NZQAUnitStandard" && attr.date) {
              if (attr.expiry) {
                if (new Date(attr.expiry) > new Date())
                  user.nzqa = user.nzqa.concat(attr.unit);
              } else {
                var expiry = new Date(attr.date);
                expiry.setFullYear(expiry.getFullYear() + 3);
                if (expiry > new Date())
                  user.nzqa = user.nzqa.concat(attr.unit);
              }
            }
            if (attr.type === "Tertiary") {
              user.tertiary = attr.abbrev;
            }
            if (attr.type === "MaskFit") {
              if (new Date(attr.expiry) > new Date()) {
                user.maskfit = "OK";
              } else {
                user.maskfit = "Expired";
              }
            }
            if (attr.type === "IP402") {
              user.ip402 = true;
            }
            if (attr.type === "AsbestosAssessor") {
              user.aanumber = attr.number;
            }
            if (attr.type === "FirstAid" && attr.date) {
              user.firstaid = "Expired";
              if (attr.expiry) {
                if (new Date(attr.expiry) > new Date()) user.firstaid = "OK";
              } else {
                var firstaidexpiry = new Date(attr.date);
                firstaidexpiry.setFullYear(firstaidexpiry.getFullYear() + 2);
                if (firstaidexpiry > new Date()) user.firstaid = "OK";
              }
            }
          });
          if (user.nzqa) {
            let nzqalist = [];
            if (
              user.nzqa.includes("23229") &&
              user.nzqa.includes("17600") &&
              user.nzqa.includes("25045")
            ) {
              nzqalist.push("Height Training");
            }
            if (
              user.nzqa.includes("23960") &&
              user.nzqa.includes("23962") &&
              user.nzqa.includes("23966")
            ) {
              nzqalist.push("Mobile Elevated Work Platforms");
            }
            if (
              user.nzqa.includes("17599") &&
              user.nzqa.includes("18426") &&
              user.nzqa.includes("25510")
            ) {
              nzqalist.push("Confined Spaces");
            }
            user.nzqatraining = nzqalist.join(", ");
          }
          usersRef.doc(userPath).update({
            tertiary: user.tertiary,
            ip402: user.ip402,
            nzqa: user.nzqa,
            nzqatraining: user.nzqatraining,
            firstaid: user.firstaid,
            maskfit: user.maskfit,
            aanumber: user.aanumber,
            docimages: user.docimages
          });
          if (userPath === auth.currentUser.uid) {
            // //console.log("Updating user");
            // //console.log(user);
            dispatch({
              type: GET_ME,
              payload: user
            });
          }
          // //console.log("Updating other staff");
          // //console.log(user);
          dispatch({
            type: UPDATE_STAFF,
            userPath: userPath,
            payload: user
          });
          if (editStaff) {
            dispatch({
              type: GET_EDIT_STAFF,
              payload: user,
            })
          }
        }
      });
};

export const getEditStaff = userPath => async dispatch => {
  auth.currentUser &&
    usersRef
      .doc(userPath)
      .onSnapshot((doc) => {
        sendSlackMessage(`${auth.currentUser.displayName} read getEditStaff for ${userPath} (1 document)`);
        dispatch({
          type: GET_EDIT_STAFF,
          payload: doc.data(),
        })
      }
    );
}

export const fetchDocuments = update => async dispatch => {
  if (update) {
    docsRef.orderBy("title").get().then(querySnapshot => {
      sendSlackMessage(`${auth.currentUser.displayName} read fetchDocuments (${querySnapshot.size} documents)`);
      var docs = [];
      querySnapshot.forEach(doc => {
        let ref = doc.data();
        ref.uid = doc.id;
        docs.push(ref);
      });
      dispatch({
        type: GET_DOCUMENTS,
        payload: docs,
        update: true
      });
    });
  } else {
    stateRef.doc("documents").get().then(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} read fetchDocuments from state (1 document)`);
      if (doc.exists) {
        dispatch({ type: GET_DOCUMENTS, payload: doc.data().payload });
      } else {
        //console.log("Documents doesn't exist");
      }
    });
  }
};

export const fetchMethods = update => async dispatch => {
  if (update) {
    methodsRef.orderBy("title").get().then(querySnapshot => {
      var methods = [];
      querySnapshot.forEach(doc => {
        let method = doc.data();
        method.uid = doc.id;
        methods.push(method);
      });
      dispatch({
        type: GET_METHODS,
        payload: methods,
        update: true
      });
    });
  } else {
    stateRef.doc("methods").get().then(doc => {
      if (doc.exists) {
        dispatch({ type: GET_METHODS, payload: doc.data().payload });
      } else {
        //console.log("Methods doesn't exist");
      }
    });
  }
};

export const fetchNotices = update => async dispatch => {
  if (update) {
    noticesRef
      .orderBy("date", "desc")
      // .limit(200)
      .get().then(querySnapshot => {
        console.log(querySnapshot);
        sendSlackMessage(`${auth.currentUser.displayName} read fetchNotices (${querySnapshot.size} documents)`);
        var notices = [];
        querySnapshot.forEach(doc => {
          let notice = doc.data();
          notice.uid = doc.id;
          notices.push(notice);
        });
        dispatch({
          type: GET_NOTICES,
          payload: notices,
          update: true
        });
      });
  } else {
    stateRef.doc("notices").onSnapshot(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} read fetchNotices from state (1 document)`);
      if (doc.exists) {
        dispatch({ type: GET_NOTICES, payload: doc.data().payload });
      } else {
        //console.log("Notices doesn't exist");
      }
    });
  }
};

export const removeNoticeReads = async (notice, reads) => {
  let noticeArray = [];
  // let batch = firestore.batch();

  stateRef.doc("noticereads").collection("notices").doc(notice.uid).get().then(doc => {
  sendSlackMessage(`${auth.currentUser.displayName} ran removeNoticeReads (notices) (1 document)`);
    if (doc.exists) {
      doc.data().payload.forEach(user => {
        let userArray = [];
        // console.log(user);
        stateRef.doc("noticereads").collection("users").doc(user).get().then(doc => {
          sendSlackMessage(`${auth.currentUser.displayName} ran removeNoticeReads (users) (1 document)`);
          if (doc.exists && doc.data() && doc.data().payload)
            userArray = doc.data().payload.filter(uid => uid !== notice.uid);
          // console.log(userArray);
          stateRef.doc("noticereads").collection("users").doc(user).set({ payload: userArray });
          // batch.set(stateRef.doc("noticereads").collection("users").doc(user), { payload: userArray });
        });
      });
    }
    // console.log('commiting');
    stateRef.doc("noticereads").collection("notices").doc(notice.uid).delete();
    // batch.commit();
  });
}

export const readNotice = (notice, me, reads) => {
  let userArray = [];
  let batch = firestore.batch();
  let noticeArray = [];

  // console.log(reads);

  if (reads) userArray = [...reads];
  // console.log(userArray);

  stateRef.doc("noticereads").collection("notices").doc(notice.uid).get().then(doc => {
    sendSlackMessage(`${auth.currentUser.displayName} ran readNotice (1 document)`);
    if (doc.exists) noticeArray = [...doc.data().payload];
    if (userArray.includes(notice.uid)) {
      // Remove read notice
      userArray = userArray.filter(uid => uid !== notice.uid);
      noticeArray = noticeArray.filter(uid => uid !== me.uid);
    } else {
      // Add to read notices
      userArray.push(notice.uid);
      noticeArray.push(me.uid);
    }
    batch.set(stateRef.doc("noticereads").collection("users").doc(me.uid), { payload: userArray });
    batch.set(stateRef.doc("noticereads").collection("notices").doc(notice.uid), { payload: noticeArray });
    // stateRef.doc("noticereads").collection("users").doc(me.uid).set({ payload: userArray });
    // stateRef.doc("noticereads").collection("notices").doc(notice.uid).set({ payload: noticeArray });
    // console.log('commiting');
    batch.commit();
  });
}

export const fetchNoticeReads = (update) => async dispatch => {
  if (update) {
    noticeReadsRef
      .get().then(querySnapshot => {
        var notices = [];
        querySnapshot.forEach(doc => {
          let notice = doc.data();
          notices.push(notice);
        });
        dispatch({
          type: GET_NOTICE_READS,
          payload: notices,
          update: true
        });
      });
  } else {
    // let noticeReads = {
    //   "users": {},
    //   "notices": {},
    // };
    // console.log('Fetching notice reads');
    stateRef.doc("noticereads").collection("users").doc(auth.currentUser.uid).onSnapshot(doc => {
      sendSlackMessage(`${auth.currentUser.displayName} ran fetchNoticeReads (1 document)`);
      // console.log(doc.data());
      dispatch({ type: GET_NOTICE_READS, payload: doc.data().payload });
    });
    // stateRef.doc("noticereads").collection("users").onSnapshot(querySnapshot => {
    //   querySnapshot.forEach(doc => {
    //     noticeReads["users"][doc.id] = doc.data();
    //   });
    // });
    // stateRef.doc("noticereads").collection("notices").onSnapshot(querySnapshot => {
    //   querySnapshot.forEach(doc => {
    //     noticeReads["notices"][doc.id] = doc.data();
    //   });
    // });
    // dispatch({ type: GET_NOTICE_READS, payload: noticeReads });
  }
};

export const fetchIncidents = update => async dispatch => {
  if (update) {
    incidentsRef
      // .orderBy("date", "desc")
      // .limit(100)
      .get().then(querySnapshot => {
        var incidents = [];
        querySnapshot.forEach(doc => {
          let incident = doc.data();
          incident.uid = doc.id;
          incidents.push(incident);
        });
        dispatch({
          type: GET_INCIDENTS,
          payload: incidents,
          update: true
        });
      });
  } else {
    stateRef.doc("incidents").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_INCIDENTS, payload: doc.data().payload });
      } else {
        //console.log("Incidents doesn't exist");
      }
    });
  }
};

export const fetchQuestions = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchQuestions`);
  if (update) {
    questionsRef.orderBy("question").get().then(querySnapshot => {
      var questions = [];
      querySnapshot.forEach(doc => {
        let question = doc.data();
        question.uid = doc.id;
        questions.push(question);
      });
      dispatch({
        type: GET_QUESTIONS,
        payload: questions,
        update: true
      });
    });
  } else {
    stateRef.doc("questions").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_QUESTIONS, payload: doc.data().payload });
      } else {
        //console.log("Questions doesn't exist");
      }
    });
  }
};

export const fetchQuizzes = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchQuizzes`);
  if (update) {
    quizzesRef.orderBy("title").get().then(querySnapshot => {
      var quizzes = [];
      querySnapshot.forEach(doc => {
        let quiz = doc.data();
        quiz.uid = doc.id;
        quizzes.push(quiz);
      });
      dispatch({
        type: GET_QUIZZES,
        payload: quizzes,
        update: true
      });
    });
  } else {
    stateRef.doc("quizzes").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_QUIZZES, payload: doc.data().payload });
      } else {
        //console.log("Quizzes doesn't exist");
      }
    });
  }
};

export const fetchTools = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchTools`);
  if (update) {
    toolsRef.orderBy("title").get().then(querySnapshot => {
      var tools = [];
      querySnapshot.forEach(doc => {
        let tool = doc.data();
        tool.uid = doc.id;
        tools.push(tool);
      });
      dispatch({
        type: GET_TOOLS,
        payload: tools,
        update: true
      });
    });
  } else {
    stateRef.doc("tools").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_TOOLS, payload: doc.data().payload });
      } else {
        //console.log("Tools doesn't exist");
      }
    });
  }
};

export const fetchTrainingPaths = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchTrainingPaths`);
  if (update) {
    trainingPathsRef.orderBy("title").get().then(querySnapshot => {
      var trainings = [];
      querySnapshot.forEach(doc => {
        let training = doc.data();
        training.uid = doc.id;
        trainings.push(training);
      });
      dispatch({
        type: GET_TRAININGS,
        payload: trainings,
        update: true
      });
    });
  } else {
    stateRef.doc("trainings").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_TRAININGS, payload: doc.data().payload });
      } else {
        //console.log("Trainings doesn't exist");
      }
    });
  }
};

export const fetchVehicles = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchVehicles`);
  if (update) {
    vehiclesRef.get().then(querySnapshot => {
      var vehicles = [];
      querySnapshot.forEach(doc => {
        var vehicle = doc.data();
        vehicle.number = doc.id;
        vehicles.push(vehicle);
      });
      dispatch({
        type: GET_VEHICLES,
        payload: vehicles,
        update: true
      });
    });
  } else {
    stateRef.doc("vehicles").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_VEHICLES, payload: doc.data().payload });
      } else {
        //console.log("Vehicles doesn't exist");
      }
    });
  }
};

export const fetchSites = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchSites`);
  if (update) {
    sitesRef.get().then(querySnapshot => {
      var sites = [];
      querySnapshot.forEach(doc => {
        sites.push(doc.data());
      });
      dispatch({
        type: GET_SITES,
        payload: sites,
        update: true
      });
    });
  } else {
    stateRef.doc("sites").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_SITES, payload: doc.data().payload });
      } else {
        //console.log("Sites don't exist");
      }
    });
  }
}

export const fetchAssets = update => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchAssets`);
  if (update) {
    assetsRef.get().then(querySnapshot => {
      var assets = [];
      querySnapshot.forEach(doc => {
        assets.push(doc.data());
      });
      dispatch({
        type: GET_ASSETS,
        payload: assets,
        update: true
      });
    });
  } else {
    stateRef.doc("assets").onSnapshot(doc => {
      if (doc.exists) {
        let assets = [];
        Object.keys(doc.data()).forEach(bucket => {
          assets.push(...doc.data()[bucket]);
        });
        dispatch({ type: GET_ASSETS, payload: assets });
      } else {
        //console.log("Assets doesn't exist");
      }
    });
  }
}

export const fetchReadingLog = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchReadingLogs`);
  usersRef
    .doc(auth.currentUser.uid)
    .collection("readinglog")
    .orderBy("date", "desc")
    .get().then(querySnapshot => {
      var logs = [];
      querySnapshot.forEach(doc => {
        let log = doc.data();
        //console.log(log);
        log.uid = doc.id;
        docsRef
          .doc(doc.id)
          .get()
          .then(doc2 => {
            log.title = doc2.data().title;
            log.updatedate = doc2.data().updatedate
              ? doc2.data().updatedate
              : doc2.data().date;
            logs.push(log);
            //console.log(log);
            dispatch({
              type: GET_READINGLOG,
              payload: logs
            });
          });
      });
    });
};

export const fetchQuizLog = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchQuizLog`);
  usersRef
    .doc(auth.currentUser.uid)
    .collection("quizlog")
    .orderBy("latestSubmit", "desc")
    .get().then(querySnapshot => {
      var logs = [];
      querySnapshot.forEach(doc => {
        let log = doc.data();
        log.uid = doc.id;
        quizzesRef
          .doc(doc.id)
          .get()
          .then(doc2 => {
            if (doc2.exists) {
              log.title = doc2.data().title;
              logs.push(log);
              dispatch({
                type: GET_QUIZLOG,
                payload: logs
              });
            } else {
              usersRef
                .doc(auth.currentUser.uid)
                .collection("quizlog")
                .doc(doc.id)
                .delete();
            }
          });
      });
    });
};

export const fetchMethodLog = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchMethodLog`);
  usersRef
    .doc(auth.currentUser.uid)
    .collection("methodlog")
    .orderBy("methodCompleted", "desc")
    .get().then(querySnapshot => {
      var logs = [];
      querySnapshot.forEach(doc => {
        let log = doc.data();
        log.uid = doc.id;
        methodsRef
          .doc(doc.id)
          .get()
          .then(doc2 => {
            if (doc2.exists) {
              log.title = doc2.data().title;
              log.subtitle = doc2.data().subtitle;
              log.sectionlength = doc2.data().sections.length;
              log.updatedate = doc2.data().updateDate;
              logs.push(log);
            } else {
              usersRef
                .doc(auth.currentUser.uid)
                .collection("methodlog")
                .doc(doc.id)
                .delete();
            }
          });
      });
      dispatch({
        type: GET_METHODLOG,
        payload: logs
      });
    });
};

export const fetchHelp = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchHelp`);
  helpRef.orderBy("date", "desc").get().then(querySnapshot => {
    var helps = [];
    querySnapshot.forEach(doc => {
      helps.push(doc.data());
    });
    dispatch({
      type: GET_HELP,
      payload: helps
    });
  });
};

export const fetchUpdates = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchUpdates`);
  updateRef.orderBy("date", "desc").get().then(querySnapshot => {
    var updates = [];
    querySnapshot.forEach(doc => {
      updates.push(doc.data());
    });
    dispatch({
      type: GET_UPDATES,
      payload: updates
    });
  });
};

export const getUser = userRef => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran getUser`);
  usersRef.doc(userRef).get().then(doc => {
    dispatch({
      type: GET_USER,
      payload: doc.data()
    });
  });
};

export const onSearchChange = value => dispatch => {
  dispatch({
    type: SEARCH_CHANGE,
    payload: value
  });
};

export const onCatChange = value => dispatch => {
  dispatch({
    type: CAT_CHANGE,
    payload: value
  });
};

export const setStepper = (steppers, uid, step) => dispatch => {
  steppers[uid] = step;
  dispatch({
    type: SET_STEPPER,
    payload: steppers
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

export const addLog = (collection, log, user, batch) => {
  let uid = moment().format('YYYY-MMM-DD-HH-mm-ss') + parseInt(Math.floor(Math.random() * Math.floor(1000)));
  if (user === undefined) user = {uid: '', name: 'Mystery Person'};
  log = {
    ...log,
    date: new Date(),
    user: user.uid,
    userName: user.name,
  };

  // //console.log('Adding Log');
  // //console.log(log);
  if (batch) batch.set(logsRef.collection(collection).doc(uid), log);
  else logsRef.collection(collection).doc(uid).set(log);
};

export const fetchLogs = (collection, filter, filterValue, limit) => async dispatch => {
    logsRef.collection(collection)
      .where(filter, "==", filterValue)
      .orderBy('date','desc')
      .limit(limit)
      .get().then(querySnapshot => {
        sendSlackMessage(`${auth.currentUser.displayName} ran fetchLogs (${querySnapshot.size} documents)`);
        var logs = [];
        querySnapshot.forEach(doc => {
          let log = doc.data();
          log.uid = doc.id;
          logs.push(log);
        });
        dispatch({
          type: GET_LOGS,
          payload: logs,
        });
      });
};

export const clearLog = () => dispatch => {
  dispatch({
    type: CLEAR_LOG,
  });
};

export const personnelConvert = e => {
  if (e.filter(staff => staff.value === 'Client').length > 0) {
    if (e[e.length - 1].value === 'Client') return [{uid: 'Client', name: 'Client'}];
      else return e.filter(staff => staff.value !== 'Client').map(staff => ({uid: staff.value, name: staff.label}));
  } else return e.map(staff => ({uid: staff.value, name: staff.label}));
}

export const dateOf = d => {
  if (!d) {
    return null;
  } else if (d instanceof Date) {
    return d;
  } else {
    try {
      return d.toDate();
    } catch (e) {
      return new Date(d);
    }
  }
}

export const milliToDHM = (t, verbose, businessTime) => {
  var cd = businessTime ? 9 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.round( (t - d * cd - h * ch) / 60000),
      pad = function(n){ return n < 10 ? '0' + n : n; };
  if( m === 60 ){
    h++;
    m = 0;
  }
  if( h === 24 ){
    d++;
    h = 0;
  }
  if (verbose) {
    var dateArray = [];
    if (d > 0) d === 1 ? dateArray.push('1 day') : dateArray.push(`${d} days`);
    if (h > 0) h === 1 ? dateArray.push('1 hour') : dateArray.push(`${h} hours`);
    if (m > 0) m === 1 ? dateArray.push('1 minute') : dateArray.push(`${m} minutes`);
    return andList(dateArray);
  } else return [d, pad(h), pad(m)].join(':');
}

export const writeDates = (objects, field) => {
  let dates = [];
  let dateMap = {};
  let sortedMap = {};
  Object.values(objects).forEach(obj => {
    if (obj[field]) dates.push(dateOf(obj[field]));
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
    let monthsList = [];
    Object.keys(sortedMap[year]).sort((a, b) => {
      return monthNames[a] - monthNames[b];
    }).forEach(month => {
      let lastDay = null;
      let firstDay = null;
      let daysList = [];
      Object.keys(sortedMap[year][month]).sort((a, b) => {
        return parseInt(a) - parseInt(b);
      }).forEach(day => {
        // console.log(day);
        if (!firstDay) firstDay = day;
        if (lastDay === null || parseInt(day) - parseInt(lastDay) === 1) {
          // console.log(`Add ${day} to range`);
          // day is either the first or only one after the one before
          lastDay = day;
        } else {
          // day is further than one away, add the previous range to the list
          if (parseInt(firstDay) === parseInt(lastDay)) {
            daysList.push(firstDay);
            // console.log(`Just add ${firstDay}`);
          } else {
            daysList.push(`${firstDay}-${lastDay}`);
            // console.log(`Add range ${firstDay}-${lastDay}`);
          }
          firstDay = day;
          lastDay = day;
        }
      })
      if (lastDay === null || parseInt(firstDay) === parseInt(lastDay)) {
        daysList.push(firstDay);
        // console.log(`Just add ${firstDay} at end`);
      } else {

        daysList.push(`${firstDay}-${lastDay}`);
        // console.log(`Add range ${firstDay}-${lastDay} at end`);
      }
      monthsList.push(`${andList(daysList)} ${month}`);
    });
    dateList.push(`${andList(monthsList)} ${year}`);
  });

  //console.log(dateList.join(', '));
  // 17 August 2017, 6, 10, 12, 21, 31 August and 19 September 2019

  return andList(dateList);

  // //console.log(dateMap);
};

export const andList = (list) => {
  if (list.length === 0) return ''
  else if (list.length === 1) return list[0]
  else return list.slice(0, -1).join(', ') + ' and ' + list.slice(-1);
}

export const sendSlackMessage = (message, json) => {
  let text;
  if (json) text = message;
  else text = { text: message };
  fetch(process.env.REACT_APP_SLACK_WEBHOOK, {
    method: "POST",
    body: JSON.stringify(text)
  });
};

export const getEmailSignature = user => {
  let officePhone = '+64 3 384 8966';
  if (user.office === 'Auckland' || user.office === 'Hamilton') officePhone = '+64 9 275 1261';
  let logo = `<img style='text-align: "left";' height='38px' width='128px' src="https://www.k2.co.nz/wp-content/uploads/2019/01/email_logos.png" alt="IANZ/OHSAS">`;
  if (user.office !== 'Christchurch') logo =  `<img style='text-align: "left";' height='38px' width='128px' src="https://www.k2.co.nz/wp-content/uploads/2019/11/email_logos_non_chch.png" alt="IANZ">`;
  let addresses = {
    Auckland: `Unit 23, 203 Kirkbride Road,<br />Airport Oaks, <b>Auckland</b> 2022`,
    Wellington: `5/408 Hutt Road, Alicetown,<br /><b>Lower Hutt</b> 5010`,
    Hamilton: `37 Lake Road, Frankton<br /><b>Hamilton</b> 3204`,
    ChristchurchPostal: `PO Box 28147,<br /> Beckenham,<br /><b>Christchurch</b> 8242`,
    ChristchurchPhysical: `Unit 24,<br />105 Bamford Street,<br />Woolston, <b>Christchurch</b>`,
  }
  let address = '';
  if (user.office === 'Christchurch') address = `<tr>
    <td colspan=3 style='vertical-align: top; white-space: nowrap'>
      <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
          ${addresses.ChristchurchPostal}
      </span>
    </td>
    <td colspan=2 style='vertical-align: top; white-space: nowrap'>
      <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
          ${addresses.ChristchurchPhysical}<br/>${logo}
      </span>
    </td>
  </tr>`;
  else address = `<tr>
    <td colspan=3 style='vertical-align: top; white-space: nowrap'>
      <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
          ${addresses[user.office]}
      </span>
    </td>
    <td colspan=2 style='vertical-align: top; white-space: nowrap'>
      <span>${logo}</span>
    </td>
  </tr>`;
  let addressChristchurch = `<tr>
    <td colspan=3 style='vertical-align: top; white-space: nowrap'>
      <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
          PO Box 28147,<br /> Beckenham,<br /><b>Christchurch</b> 8242
      </span>
    </td>
    <td colspan=2 style='vertical-align: top; white-space: nowrap'>
      <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
          Unit 24,<br />105 Bamford Street,<br />Woolston, <b>Christchurch</b><br/>${logo}
      </span>
    </td>
  </tr>`;

  return (
      `<table border=0 cellspacing=0 cellpadding=0 style='border-collapse:collapse' width=300 bgcolor="#FFF">
        <tr>
          <td width=15% style='vertical-align: center'>
            <img width='50px' height='50px' src="https://www.k2.co.nz/wp-content/uploads/2017/12/Logo-flat-icon.png" alt="K2">
          </td>
          <td colspan=4 style='vertical-align: top; white-space: nowrap'>
            <span style='color: #006D44; font-family: Calibri, Arial, Sans Serif; font-size: medium; font-weight: bold'>${user.name}</span><br />
            <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'><i>${user.jobdescription}</i><br />
            <b>K2 Environmental Ltd</b></span>
          </td>
        </tr>
        <tr>
          <td colspan=5 style='vertical-align: top'>
            <hr noshade size=2 />
          </td>
        </tr>
        <tr>
          <td colspan=3 style='vertical-align: bottom; white-space: nowrap'>
            <span style='color: #FF2D00; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>T</span>
            <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>${officePhone}</span><br />
            <span style='color: #FF2D00; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>E</span>
            <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
              <a href="mailto:${user.email}" onMouseOver="this.style.color='#FF2D00'" onMouseOut="this.style.color='#D32500'" style="color:#FFA28E; ">${user.email}</a>
            </span><br />
          </td>
          <td colspan=2 style='vertical-align: bottom; white-space: nowrap'>
            ${user.workphone && `<span style='color: #FF2D00; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>M</span>
            <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>${user.workphone}</span><br />`}
            <span style='color: #FF2D00; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>W</span>
            <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: small'>
              <a href="https://www.k2.co.nz" onMouseOver="this.style.color='#FF2D00'" onMouseOut="this.style.color='#D32500'" style="color:#FFA28E; ">www.k2.co.nz</a>
            </span><br />
          </td>
        </tr>
        ${address}
        <tr>
          <td colspan=5 style='vertical-align: top'>
            <hr noshade size=2 />
          </td>
        </tr>
        <tr>
          <td colspan=2 width=25% style='vertical-align: top; white-space: nowrap; padding-right: 20px '>
            <span style='color: #006D44; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>Christchurch</span><br />
              <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: x-small'>03 384 8966</span>
          </td>
          <td width=25% style='vertical-align: top; white-space: nowrap; padding-right: 20px'>
            <span style='color: #006D44; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>Auckland</span><br />
              <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: x-small'>09 275 1261</span>
          </td>
          <td width=25% style='vertical-align: top; white-space: nowrap; padding-right: 20px'>
            <span style='color: #006D44; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>Wellington</span><br />
              <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: x-small'>027 533 7872</span>
          </td>
          <td width=25% style='vertical-align: top; white-space: nowrap; padding-right: 20px'>
            <span style='color: #006D44; font-family: Calibri, Arial, Sans Serif; font-weight: bold; font-size: small'>Hamilton</span><br />
              <span style='color: #000; font-family: Calibri, Arial, Sans Serif; font-size: x-small'>027 233 7874</span>
          </td>
        </tr>
      </table>`
  );
}
