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
  asbestosAnalysisRef,
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
        if (doc.exists) {
          dispatch({ type: GET_AIR_ANALYSTS, payload: doc.data().payload });
        }
      });
    stateRef
      .doc("bulkAnalysts")
      .get()
      .then(doc => {
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
      .onSnapshot((doc) =>
        dispatch({
          type: GET_EDIT_STAFF,
          payload: doc.data(),
        })
    );
}

export const fetchDocuments = update => async dispatch => {
  if (update) {
    docsRef.orderBy("title").get().then(querySnapshot => {
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
    if (doc.exists) {
      doc.data().payload.forEach(user => {
        let userArray = [];
        // console.log(user);
        stateRef.doc("noticereads").collection("users").doc(user).get().then(doc => {
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

// export const fetchAssets = () => async dispatch => {
//   let assetList = {
//     1: [],
//     2: [],
//     3: [],
//     4: [],
//     5: [],
//     6: [],
//     7: [],
//     8: [],
//     9: [],
//   };
//   assetData.forEach(assetData => {
//     let asset = JSON.parse(assetData);
//     delete asset.asset_tag;
//     delete asset.response;
//     Object.keys(asset).forEach(key => {
//       if (asset[key] === null) delete asset[key];
//     });
//     if (asset.lastCheckDone !== undefined && asset.lastCheckDone !== null) asset.lastCheckDone = new Date(asset.lastCheckDone);
//     if (asset.lastServiceDone !== undefined && asset.lastServiceDone !== null) asset.lastServiceDone = new Date(asset.lastServiceDone);
//     if (asset.regExpiry !== undefined && asset.regExpiry !== null) asset.regExpiry = new Date(asset.regExpiry);
//     if (asset.wofExpiry !== undefined && asset.wofExpiry !== null) asset.wofExpiry = new Date(asset.wofExpiry);
//     // //console.log(asset);
//     if (asset.docID !== undefined && asset.docID !== null) {
//       // assetsRef.doc(asset.docID).set(asset);
//       assetList[asset.id.charAt(0)].push(asset);
//     }
//   });
//   //console.log(assetList);
//   stateRef.doc('assets').set(assetList);
//   // var assetObj = JSON.parse(asset[0]);
//   // //console.log(assetObj);
// };

export const fetchSites = update => async dispatch => {
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
  usersRef.doc(userRef).get().then(doc => {
    dispatch({
      type: GET_USER,
      payload: doc.data()
    });
  });
};

export const fetchWFMJobs = () => async dispatch => {
  // let path = apiRoot + 'wfm/job.php?apiKey=' + apiKey;
  let path = `${process.env.REACT_APP_WFM_ROOT}job.api/current?apiKey=${
    process.env.REACT_APP_WFM_API
  }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  let len = 100;
  let str = '';
  fetch(path)
    .then(results => results.text())
    .then(data => {
      var xmlDOM = new DOMParser().parseFromString(data, "text/xml");
      var json = xmlToJson(xmlDOM);
      let jobs = [];
      // Map WFM jobs to a single level job object we can use
      json.Response.Jobs.Job.forEach(wfmJob => {
        let job = {};
        job.jobNumber = wfmJob.ID ? wfmJob.ID : "No job number";
        job.wfmID = wfmJob.InternalID;
        job.address = wfmJob.Name ? wfmJob.Name : "No address";
        let i = job.address.length;
        if (i < len) {
          len = i;
          str = job.address;
          //console.log(`${str} (${len})`);
        }

        job.description = wfmJob.Description
          ? wfmJob.Description
          : "No description";
        if (wfmJob.Client) {
          job.client = wfmJob.Client.Name
            ? wfmJob.Client.Name
            : "No client name";
          job.clientID = wfmJob.Client.ID ? wfmJob.Client.ID : "No client ID";
        } else {
          job.client = "No client name";
          job.clientID = "No client ID";
        }
        job.clientOrderNumber = wfmJob.ClientOrderNumber
          ? wfmJob.ClientOrderNumber
          : "No client order number";
        if (wfmJob.Contact) {
          job.contact = wfmJob.Contact.Name
            ? wfmJob.Contact.Name
            : "No contact name";
          job.contactID = wfmJob.Contact.ID
            ? wfmJob.Contact.ID
            : "No contact ID";
        } else {
          job.contact = "No contact name";
          job.contactID = "No contact ID";
        }
        if (wfmJob.Manager) {
          job.manager = wfmJob.Manager.Name
            ? wfmJob.Manager.Name
            : "No manager name";
          job.managerID = wfmJob.Manager.ID
            ? wfmJob.Manager.ID
            : "No manager ID";
        } else {
          job.manager = "No manager name";
          job.managerID = "No manager ID";
        }
        job.dueDate = wfmJob.DueDate ? wfmJob.DueDate : "";
        job.startDate = wfmJob.StartDate ? wfmJob.StartDate : "";
        job.wfmState = wfmJob.State ? wfmJob.State : "Unknown state";
        job.wfmType = wfmJob.Type ? wfmJob.Type : "Other";
        jobs.push(job);
      });
      dispatch({
        type: GET_WFM_JOBS,
        payload: jobs
      });
    });
};

export const fetchWFMLeads = () => async dispatch => {
  // let path = apiRoot + 'wfm/job.php?apiKey=' + apiKey;
  let path = `${
    process.env.REACT_APP_WFM_ROOT
  }lead.api/current?detailed=true&apiKey=${
    process.env.REACT_APP_WFM_API
  }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  fetch(path)
    .then(results => results.text())
    .then(data => {
      // //console.log(data);
      var xmlDOM = new DOMParser().parseFromString(data, "text/xml");
      var json = xmlToJson(xmlDOM);
      let leads = [];
      // Map WFM jobs to a single level job object we can use
      json.Response.Leads.Lead.forEach(wfmLead => {
        let lead = {};
        lead.wfmID = wfmLead.ID;
        lead.name = wfmLead.Name ? wfmLead.Name : "No name";
        lead.description = wfmLead.Description
          ? wfmLead.Description
          : "No description";
        lead.value = wfmLead.EstimatedValue ? wfmLead.EstimatedValue : 0;
        if (wfmLead.Client) {
          lead.client = wfmLead.Client.Name
            ? wfmLead.Client.Name
            : "No client name";
          lead.clientID = wfmLead.Client.ID
            ? wfmLead.Client.ID
            : "No client ID";
        } else {
          lead.client = "No client name";
          lead.clientID = "No client ID";
        }
        if (wfmLead.Contact) {
          lead.contact = wfmLead.Contact.Name
            ? wfmLead.Contact.Name
            : "No contact name";
          lead.contactID = wfmLead.Contact.ID
            ? wfmLead.Contact.ID
            : "No contact ID";
        } else {
          lead.contact = "No contact name";
          lead.contactID = "No contact ID";
        }
        if (wfmLead.Owner) {
          lead.owner = wfmLead.Owner.Name
            ? wfmLead.Owner.Name
            : "No owner name";
          lead.ownerID = wfmLead.Owner.ID ? wfmLead.Owner.ID : "No owner ID";
        } else {
          lead.manager = "No owner name";
          lead.managerID = "No owner ID";
        }
        lead.date = wfmLead.Date ? wfmLead.Date : "";
        lead.dateWonLost = wfmLead.DateWonLost ? wfmLead.DateWonLost : "";
        if (typeof wfmLead.Category !== "object") {
          lead.category = wfmLead.Category;
        } else {
          lead.category = "Other";
        }
        if (wfmLead.Activities.Activity) {
          // //console.log(wfmLead.Activities);
          lead.activities = [];
          if (Array.isArray(wfmLead.Activities.Activity)) {
            wfmLead.Activities.Activity.forEach(wfmActivity => {
              let activity = {};
              activity.date = wfmActivity.Date;
              activity.subject = wfmActivity.Subject;
              activity.completed = wfmActivity.Completed;
              if (wfmActivity.Responsible) {
                activity.responsible = wfmActivity.Responsible.Name;
                activity.responsibleID = wfmActivity.Responsible.ID;
              } else {
                activity.responsible = "No one assigned to this task.";
              }
              lead.activities.push(activity);
            });
          } else {
            lead.activities = [
              {
                date: wfmLead.Activities.Activity.Date,
                subject: wfmLead.Activities.Activity.Subject,
                complete: wfmLead.Activities.Activity.Completed,
                responsible: wfmLead.Activities.Activity.Responsible
                  ? wfmLead.Activities.Activity.Responsible.Name
                  : "No one assigned",
                responsibleID: wfmLead.Activities.Activity.Responsible
                  ? wfmLead.Activities.Activity.Responsible.ID
                  : "No one assigned"
              }
            ];
          }
        } else {
          lead.activities = ["NO PLAN!"];
        }
        if (wfmLead.History.Item) {
          // //console.log(wfmLead.History);
          lead.history = [];
          if (Array.isArray(wfmLead.History.Item)) {
            wfmLead.History.Item.forEach(wfmHistory => {
              let item = [];
              item.detail = wfmHistory.Detail;
              item.date = wfmHistory.Date;
              item.staff = wfmHistory.Staff;
              item.type = wfmHistory.Type;
              lead.history.push(item);
            });
          } else {
            lead.history = [
              {
                detail: wfmLead.History.Item.Detail,
                date: wfmLead.History.Item.Date,
                staff: wfmLead.History.Item.Staff,
                type: wfmLead.History.Item.Type
              }
            ];
          }
        } else {
          lead.history = ["No History"];
        }
        leads.push(lead);
      });
      // //console.log(leads);
      dispatch({
        type: GET_WFM_LEADS,
        payload: leads
      });
    });
};

export const fetchWFMClients = () => async dispatch => {
  // let path = apiRoot + 'wfm/job.php?apiKey=' + apiKey;
  let path = `${process.env.REACT_APP_WFM_ROOT}client.api/list?apiKey=${
    process.env.REACT_APP_WFM_API
  }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  let len = 100;
  let str = '';
  fetch(path)
    .then(results => results.text())
    .then(data => {
      var xmlDOM = new DOMParser().parseFromString(data, "text/xml");
      var json = xmlToJson(xmlDOM);
      let clients = [];
      // Map WFM jobs to a single level job object we can use
      json.Response.Clients.Client.forEach(wfmClient => {
        // //console.log(wfmClient);
        let i = wfmClient.Name.length;
        if (i < len) {
          len = i;
          str = wfmClient.Name;
        }
        let client = {};
        client.wfmID = wfmClient.ID;
        client.name = wfmClient.Name;
        client.email = wfmClient.Email;
        client.address =
          wfmClient.Address instanceof Object ? "" : wfmClient.Address;
        client.city = wfmClient.City instanceof Object ? "" : wfmClient.City;
        // client.postalAddress = wfmClient.postalAddress;
        clients.push(client);
      });
      //console.log(`${str} (${len})`);
      // //console.log(clients);
      dispatch({
        type: GET_WFM_CLIENTS,
        payload: clients
      });
    });
};


export const syncJobWithWFM = (jobNumber, createUid) => async dispatch => {
  let path = `${
    process.env.REACT_APP_WFM_ROOT
  }job.api/get/${jobNumber}?apiKey=${
    process.env.REACT_APP_WFM_API
  }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  console.log(path);
  fetch(path)
    .then(results => results.text())
    .then(data => {
      var xmlDOM = new DOMParser().parseFromString(data, "text/xml");
      var json = xmlToJson(xmlDOM);
      if (json.Response.Status === "ERROR") {
        dispatch({
          type: SET_MODAL_ERROR,
          payload: json.Response.ErrorDescription
        });
      } else {
        let wfmJob = json.Response.Job;
        let job = {};
        //console.log(wfmJob);
        job.jobNumber = wfmJob.ID ? wfmJob.ID : "No job number";
        job.address = wfmJob.Name ? wfmJob.Name : "No address";
        job.description = wfmJob.Description
          ? wfmJob.Description
          : "No description";
        if (wfmJob.Client) {
          job.client = wfmJob.Client.Name
            ? wfmJob.Client.Name
            : "No client name";
          job.clientID = wfmJob.Client.ID ? wfmJob.Client.ID : "No client ID";
        } else {
          job.client = "No client name";
          job.clientID = "No client ID";
        }
        job.clientOrderNumber = wfmJob.ClientOrderNumber && typeof wfmJob.ClientOrderNumber !== 'object'
          ? wfmJob.ClientOrderNumber
          : "";
        if (wfmJob.Contact) {
          if (wfmJob.Contact.ID) {
            let contactID = wfmJob.Contact.ID;
            let path = `${process.env.REACT_APP_WFM_ROOT}client.api/contact/${contactID}?apiKey=${
              process.env.REACT_APP_WFM_API
            }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
            //console.log(path);
            fetch(path)
              .then(results => results.text())
              .then(data => {
                var xmlDOM = new DOMParser().parseFromString(data, "text/xml");
                var json = xmlToJson(xmlDOM);
                if (json.Response.Status === "ERROR") {
                  dispatch({
                    type: SET_MODAL_ERROR,
                    payload: json.Response.ErrorDescription
                  });
                } else {
                  let contact = json.Response.Contact;
                  let wfmContact = {};
                  //console.log(contact);
                  wfmContact.contactID = contactID;
                  wfmContact.contactName = contact.Name;
                  wfmContact.contactEmail = contact.Email instanceof String ? contact.Email.toLowerCase() : '';
                  dispatch({
                    type: GET_WFM_CONTACT,
                    payload: wfmContact,
                  });
                }
              });
          } else {
            job.contactName = "No contact name";
            job.contactEmail = "No contact email";
            job.contactID = "No contact ID";
          }
        } else {
          job.contactName = "No contact name";
          job.contactEmail = "No contact email";
          job.contactID = "No contact ID";
        }
        if (wfmJob.Manager) {
          job.manager = wfmJob.Manager.Name
            ? wfmJob.Manager.Name
            : "No manager name";
          job.managerID = wfmJob.Manager.ID
            ? wfmJob.Manager.ID
            : "No manager ID";
        } else {
          job.manager = "No manager name";
          job.managerID = "No manager ID";
        }
        job.dueDate = dateOf(wfmJob.DueDate);
        job.startDate = dateOf(wfmJob.StartDate);
        job.wfmState = wfmJob.State ? wfmJob.State : "Unknown state";
        job.wfmType = wfmJob.Type ? wfmJob.Type : "Other";
        job.wfmID = wfmJob.InternalID;
        if (createUid) {
          let uid = `${job.jobNumber.toUpperCase()}_${job.client.toUpperCase()}_${moment().format('x')}`;
          // //console.log('New uid' + uid);
          dispatch({
            type: EDIT_MODAL_DOC,
            payload: { 'uid': uid }
          });
        }
        console.log(job);
        dispatch({
          type: GET_WFM_JOB,
          payload: job
        });
      }
    });
};

export const resetWfmJob = () => dispatch => {
  dispatch({
    type: GET_WFM_JOB,
    payload: {}
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

export const saveGeocodes = geocodes => dispatch => {
  stateRef.doc("geocodes").set({ payload: geocodes });
};

export const fetchGeocodes = () => dispatch => {
  stateRef
    .doc("geocodes")
    .get()
    .then(doc => {
      if (doc.data()) {
        dispatch({
          type: GET_GEOCODES,
          payload: doc.data().payload
        });
      }
    });
};

export const updateGeocodes = geocodes => dispatch => {
  dispatch({
    type: GET_GEOCODES,
    payload: geocodes
  });
};

export const saveWFMItems = items => dispatch => {
  console.log(items);
  var date = moment().format("YYYY-MM-DD");
  // //console.log(items);
  Object.values(items).forEach(job => {
    Object.keys(job).forEach(val => {
      if (job[val] === undefined) {
        console.log(`Job: ${job.isJob}, Number: ${job.jobNumber}, Val: ${val}`);
      }
    })
  })
  console.log(Object.keys(items).length);
  stateRef
    .doc("wfmstate")
    .collection("states")
    .doc(date)
    .set({ state: items });
  dispatch({
    type: SAVE_WFM_ITEMS,
    payload: items
  });
};

export const saveStats = stats => dispatch => {
  var date = moment().format("YYYY-MM-DD");
  // //console.log(stats);
  // stateRef
  //   .doc("stats")
  //   .collection("clientsjobs")
  //   .doc(date)
  //   .set({ state: stats["clients"] });
  stateRef
    .doc("stats")
    .collection("staffjobs")
    .doc(date)
    .set({ state: stats["staff"] });
  dispatch({
    type: SAVE_WFM_STATS,
    payload: stats
  });
};

// This function looks through all the daily states from the states collection and creates an up-to-date picture of the job state
export const analyseJobHistory = () => dispatch => {
  // vars
  const buckets = ['leads','jobs','asbestos','workplace','meth','bio','stack','noise'];
  var jobMap = {};
  buckets.forEach((bucket) => {
    jobMap[bucket] = {};
  });
  var jobTypes = {};
  var jobCategorys = {};
  var stateChangeDates = {};

  var completionMap = {};
  var creationMap = {};

  // get all wfm daily states from firebase
  stateRef
    .doc("wfmstate")
    .collection("states")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
      // Loop through each day of the saved states
        var state = doc.data()['state'];
        // Loop through current job map and check if any are missing from this state (e.g. they have been completed since the last state)
        const buckets = ['leads','jobs','asbestos','workplace','meth','bio','stack','noise'];
        if (state.length > 0) {
          buckets.forEach((bucket) => {
            if (jobMap[bucket] !== undefined) {
              Object.values(jobMap[bucket]).forEach((job) => {
                console.log(job);
                if (job.state !== 'Completed' && state.filter((stateJob) => stateJob.wfmID === job.wfmID).length === 0) {
                  // Job or lead has been completed
                  jobMap[bucket][job.wfmID]['state'] = 'Completed';
                  jobMap[bucket][job.wfmID]['completionDate'] = doc.id;
                  jobMap[bucket][job.wfmID]['lastActionDate'] = doc.id;
                  jobMap[bucket][job.wfmID]['stateHistory'] = {
                    ...jobMap[bucket][job.wfmID]['stateHistory'],
                    [doc.id]: 'Completed',
                  };

                  // Add to calendar of when jobs were completed
                  var completionDoc = {
                    category: jobMap[bucket][job.wfmID]['category'],
                    client: jobMap[bucket][job.wfmID]['client'],
                    geocode: jobMap[bucket][job.wfmID]['geocode'],
                    isJob: jobMap[bucket][job.wfmID]['isJob'],
                    jobNumber: jobMap[bucket][job.wfmID]['jobNumber'],
                    name: jobMap[bucket][job.wfmID]['name'],
                    wfmID: jobMap[bucket][job.wfmID]['wfmID'],
                  };
                  if (jobMap[bucket][job.wfmID]['stateHistory'] !== undefined) completionDoc.stateHistory = jobMap[bucket][job.wfmID]['stateHistory'];
                  if (jobMap[bucket][job.wfmID]['completedActivities'] !== undefined)
                  if (completionMap[doc.id] !== undefined) {
                    completionMap[doc.id] = [...completionMap[doc.id], completionDoc];
                  } else {
                    completionMap[doc.id] = [completionDoc];
                  }
                }
              });
            }
          });
        }

        // Loop through each job/lead in the state
        // This will not loop through any completed jobs
        state.forEach(job => {
          if (job.isJob) {
            // Split job Maps into Workplace, Asbestos and Other to prevent firebase documents being too large
            var bucket = 'jobs';
            if (job.category.toLowerCase().includes('asbestos')) bucket = 'asbestos';
            if (job.category.toLowerCase().includes('meth')) bucket = 'meth';
            if (job.category === 'Workplace') bucket = 'workplace';
            if (job.category === 'Biological') bucket = 'bio';
            if (job.category === 'Stack Testing') bucket = 'stack';
            if (job.category === 'Noise') bucket = 'noise';

            var mappedJob = jobMap[bucket][job.wfmID];
            if (mappedJob !== undefined) {
            // Update current job (Check if state has been updated)
              if (job.state !== mappedJob.state) {
                // State has been updated

                // Create a list of all job states/change dates (not necessary)
                if (jobTypes[job.state] !== undefined) jobTypes[job.state][bucket] = ''; else jobTypes[job.state] = {[bucket]: ''};
                if (stateChangeDates[doc.id] !== undefined) stateChangeDates[doc.id][bucket] = ''; else stateChangeDates[doc.id] = {[bucket]: ''};

                // Update mapped job
                mappedJob.state = job.state;
                mappedJob.lastActionDate = doc.id;
                mappedJob.stateHistory = {
                  ...mappedJob.stateHistory,
                  [doc.id]: job.state,
                };
              }
            } else {
              // Talley how many jobs in each category (not necessary)
              if (jobCategorys[job.category] !== undefined) {
                jobCategorys[job.category] = jobCategorys[job.category] + 1;
              } else {
                jobCategorys[job.category] = 1;
              }

              // Add new job to map
              job.creationDate = moment(job.creationDate).format('YYYY-MM-DD');
              job.lastActionDate = doc.id;
              if (job.daysOld !== undefined) delete job.daysOld;
              job.stateHistory = {
                [job.creationDate]: 'Job Created',
                [doc.id]: job['state'],
              };

              // Add to mapped jobs
              jobMap[bucket][job.wfmID] = job;

              // Add to calendar of when jobs were created
              var creationDoc = {
                category: job.category,
                client: job.client,
                geocode: job.geocode,
                isJob: job.isJob,
                jobNumber: job.jobNumber,
                name: job.name,
                wfmID: job.wfmID,
              };
              if (creationMap[doc.id] !== undefined) {
                creationMap[doc.id] = [...creationMap[doc.id], creationDoc];
              } else {
                creationMap[doc.id] = [creationDoc];
              }
            }
          } else {
            // Leads have their state history in already (activities)
            if (job.averageCompletedActionOverdueDays !== undefined) delete job.averageCompletedActionOverdueDays;
            job.creationDate = moment(job.creationDate).format('YYYY-MM-DD');
            if (job.daysOld !== undefined) delete job.daysOld;
            if (job.daysSinceLastAction !== undefined) delete job.daysSinceLastAction;
            if (job.urgentAction !== undefined) delete job.urgentAction;
            if (job.completedActivities !== undefined) delete job.completedActivities;

            jobMap['leads'][job.wfmID] = job;
          }
        });
      });
      var buckets = ['leads','jobs','asbestos','workplace','meth','bio','stack','noise'];
      buckets.forEach((bucket) => {
        stateRef.doc("wfmstate").collection("current").doc(bucket).set(jobMap[bucket]);
      });
      stateRef.doc("wfmstate").collection("timeline").doc('completion').set(completionMap);
      stateRef.doc("wfmstate").collection("timeline").doc('creation').set(creationMap);
    });
};

export const fetchCurrentJobState = ignoreCompleted => dispatch => {
  var currentJobState = {};
  // Put all the buckets back together in one map
  stateRef.doc("wfmstate").collection("current").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if(ignoreCompleted) {
        Object.values(doc.data()).forEach((job) => {
          if (job['state'] !== "Completed") currentJobState[job['wfmID']] = job;
        });
      } else {
        currentJobState = {
          ...currentJobState,
          ...doc.data(),
        }
      }
    });
    // //console.log(currentJobState);
    // //console.log('Fetched Current Job State, ignoreCompleted: ' + ignoreCompleted);
    dispatch({
      type: GET_CURRENT_JOB_STATE,
      payload: currentJobState,
    });
  });
};

export const saveCurrentJobState = state => dispatch => {
  // Sort into buckets to prevent firestore rejecting objects that are too large
  var sortedState = {};
  var buckets = ['leads','jobs','asbestos','workplace','meth','bio','stack','noise'];
  buckets.forEach((bucket) => {
    sortedState[bucket] = {};
  });

  state.forEach((job) => {
    if (job.isJob) {
      var bucket = 'jobs';
      if (job.category.toLowerCase().includes('asbestos')) bucket = 'asbestos';
      if (job.category.toLowerCase().includes('meth')) bucket = 'meth';
      if (job.category === 'Workplace') bucket = 'workplace';
      if (job.category === 'Biological') bucket = 'bio';
      if (job.category === 'Stack Testing') bucket = 'stack';
      if (job.category === 'Noise') bucket = 'noise';
      sortedState[bucket][job.wfmID] = job;
    } else {
      sortedState['leads'][job.wfmID] = job;
    }
  });

  console.log(sortedState);

  buckets.forEach((bucket) => {
    // console.log(sortedState[bucket]);
    console.log(Object.keys(sortedState[bucket]).length);
    stateRef.doc("wfmstate").collection("current").doc(bucket).set(sortedState[bucket]);
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

//
// function getDaysSinceDate(date) {
//   var timeDifference = new Date() - new Date(date);
//   var divideBy = 86400000;
//   var days = Math.floor(timeDifference / divideBy);
//
//   return days;
// };
