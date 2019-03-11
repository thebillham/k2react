import {
  APP_HAS_LOADED,
  CAT_CHANGE,
  DELETE_NOTICE,
  FAV_NOTICE,
  GET_AIRANALYSTS,
  GET_BULKANALYSTS,
  GET_COCS,
  GET_DOCUMENTS,
  GET_GEOCODES,
  GET_HELP,
  GET_ME,
  GET_METHODLOG,
  GET_METHODS,
  GET_NOTICES,
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
  SAVE_WFM_ITEMS,
  SAVE_WFM_STATS,
  READ_NOTICE,
  RESET_LOCAL,
  SEARCH_CHANGE,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  SET_MODAL_ERROR,
  SET_STEPPER,
  UPDATE_STAFF,
  EDIT_MODAL_DOC
} from "../constants/action-types";
import firebase from "../config/firebase";
import moment from "moment";
import {
  asbestosSamplesRef,
  auth,
  cocsRef,
  docsRef,
  helpRef,
  methodsRef,
  noticesRef,
  questionsRef,
  quizzesRef,
  stateRef,
  toolsRef,
  trainingPathsRef,
  updateRef,
  usersRef,
  vehiclesRef
} from "../config/firebase";
import { xmlToJson } from "../config/XmlToJson";

export const resetLocal = () => dispatch => {
  dispatch({ type: RESET_LOCAL });
};

// Separate stream for just your information. So you don't re-read all staff for just changing your details.
export const fetchMe = () => async dispatch => {
  auth.currentUser &&
    usersRef.doc(auth.currentUser.uid).onSnapshot(doc => {
      console.log("Read a doc (fetchMe)!");
      if (doc.exists) {
        let user = doc.data();
        user.uid = doc.id;
        if (user.auth && user.auth["Asbestos Air Analysis"]) {
          // dispatch({ type: GET_AIRANALYSTS, payload: [{uid: user.uid, name: user.name}] });
          dispatch({ type: SET_ANALYST, payload: user.name });
        }
        if (user.auth && user.auth["Asbestos Bulk Analysis"]) {
          // dispatch({ type: GET_BULKANALYSTS, payload: [{uid: user.uid, name: user.name}] });
          dispatch({ type: SET_ANALYST, payload: user.name });
        }
        dispatch({ type: GET_ME, payload: user });
        dispatch({ type: APP_HAS_LOADED });
        // usersRef.doc(doc.id).collection("myjobs")
        //   .onSnapshot((querySnapshot) => {
        //     user.jobs = {};
        //     if (querySnapshot.size > 0) {
        //       querySnapshot.forEach((doc) => {
        //         console.log("Read a doc (my job)!");
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
    console.log("Running fetch staff to update");
    var users = {};
    usersRef.get().then(querySnapshot => {
      let airanalysts = [];
      let bulkanalysts = [];
      querySnapshot.forEach(doc => {
        console.log("Read a doc! " + doc.data().name);

        let user = doc.data();
        user.uid = doc.id;
        users[doc.id] = user;
        if (user.auth && user.auth["Asbestos Air Analysis"])
          airanalysts.push({ uid: user.uid, name: user.name });
        if (user.auth && user.auth["Asbestos Bulk Analysis"])
          bulkanalysts.push({ uid: user.uid, name: user.name });
      });
      dispatch({ type: GET_STAFF, payload: users, update: true });
      dispatch({ type: GET_AIRANALYSTS, payload: airanalysts, update: true });
      dispatch({ type: GET_BULKANALYSTS, payload: bulkanalysts, update: true });
    });
  } else {
    console.log("Fetching staff from cache");
    stateRef.doc("staff").onSnapshot(doc => {
      if (doc.exists) {
        console.log(doc.data());
        // .filter((m) => m.uid !== auth.currentUser.uid)
        dispatch({ type: GET_STAFF, payload: doc.data() });
      } else {
        console.log("Doc doesn't exist");
      }
    });
    stateRef
      .doc("airanalysts")
      .get()
      .then(doc => {
        if (doc.exists) {
          dispatch({ type: GET_AIRANALYSTS, payload: doc.data().payload });
        }
      });
    stateRef
      .doc("bulkanalysts")
      .get()
      .then(doc => {
        if (doc.exists) {
          dispatch({ type: GET_BULKANALYSTS, payload: doc.data().payload });
        }
      });
  }
};

export const getUserAttrs = userPath => async dispatch => {
  console.log("Calling update staff for " + userPath);
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
            console.log("Read a doc (Attr)!");
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
            console.log("Updating user");
            console.log(user);
            dispatch({
              type: GET_ME,
              payload: user
            });
          }
          console.log("Updating other staff");
          console.log(user);
          dispatch({
            type: UPDATE_STAFF,
            userPath: userPath,
            payload: user
          });
        }
      });
};

export const fetchCocs = update => async dispatch => {
  // Make all calls update for now
  update = true;
  if (update) {
    cocsRef
      .where("deleted", "==", false)
      .orderBy("dueDate", "desc")
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
        console.log("Coc doesn't exist");
      }
    });
  }
};

export const fetchDocuments = update => async dispatch => {
  if (update) {
    docsRef.orderBy("title").onSnapshot(querySnapshot => {
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
    stateRef.doc("documents").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_DOCUMENTS, payload: doc.data().payload });
      } else {
        console.log("Documents doesn't exist");
      }
    });
  }
};

export const fetchMethods = update => async dispatch => {
  if (update) {
    methodsRef.orderBy("title").onSnapshot(querySnapshot => {
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
    stateRef.doc("methods").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_METHODS, payload: doc.data().payload });
      } else {
        console.log("Methods doesn't exist");
      }
    });
  }
};

export const fetchNotices = update => async dispatch => {
  if (update) {
    noticesRef
      .orderBy("date", "desc")
      .limit(100)
      .onSnapshot(querySnapshot => {
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
        console.log("Notices doesn't exist");
      }
    });
  }
};

export const fetchQuestions = update => async dispatch => {
  if (update) {
    questionsRef.orderBy("question").onSnapshot(querySnapshot => {
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
        console.log("Questions doesn't exist");
      }
    });
  }
};

export const fetchQuizzes = update => async dispatch => {
  if (update) {
    quizzesRef.orderBy("title").onSnapshot(querySnapshot => {
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
        console.log("Quizzes doesn't exist");
      }
    });
  }
};

export const fetchTools = update => async dispatch => {
  if (update) {
    toolsRef.orderBy("title").onSnapshot(querySnapshot => {
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
        console.log("Tools doesn't exist");
      }
    });
  }
};

export const fetchTrainingPaths = update => async dispatch => {
  if (update) {
    trainingPathsRef.orderBy("title").onSnapshot(querySnapshot => {
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
        console.log("Trainings doesn't exist");
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
        console.log("Vehicles doesn't exist");
      }
    });
  }
};

export const fetchSamples = (cocUid, jobNumber, modalDoc) => async dispatch => {
  let samples = {};
  asbestosSamplesRef
    .where("jobNumber", "==", jobNumber)
    .onSnapshot(sampleSnapshot => {
      sampleSnapshot.forEach(sampleDoc => {
        let sample = sampleDoc.data();
        sample.uid = sampleDoc.id;
        samples[sample.samplenumber] = sample;
        // console.log(`Ran fetch Samples`);
        // console.log(samples);
        if (modalDoc) {
          dispatch({
            type: EDIT_MODAL_DOC,
            payload: { samples }
          });
        }
        dispatch({
          type: GET_SAMPLES,
          cocUid: cocUid,
          payload: samples
        });
      });
    });
};

export const fetchReadingLog = () => async dispatch => {
  usersRef
    .doc(auth.currentUser.uid)
    .collection("readinglog")
    .orderBy("date", "desc")
    .onSnapshot(querySnapshot => {
      var logs = [];
      querySnapshot.forEach(doc => {
        let log = doc.data();
        console.log(log);
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
    .onSnapshot(querySnapshot => {
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
    .onSnapshot(querySnapshot => {
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
  helpRef.orderBy("date", "desc").onSnapshot(querySnapshot => {
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
  updateRef.orderBy("date", "desc").onSnapshot(querySnapshot => {
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

export const editUser = ({ userRef, target }) => dispatch => {
  usersRef.doc(userRef).set(
    {
      [target.id]: target.value
    },
    { merge: true }
  );
};

export const getUser = userRef => async dispatch => {
  usersRef.doc(userRef).onSnapshot(doc => {
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
        job.state = wfmJob.State ? wfmJob.State : "Unknown state";
        job.type = wfmJob.Type ? wfmJob.Type : "Other";
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
      // console.log(data);
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
          // console.log(wfmLead.Activities);
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
          // console.log(wfmLead.History);
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
      // console.log(leads);
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
  fetch(path)
    .then(results => results.text())
    .then(data => {
      var xmlDOM = new DOMParser().parseFromString(data, "text/xml");
      var json = xmlToJson(xmlDOM);
      let clients = [];
      // Map WFM jobs to a single level job object we can use
      json.Response.Clients.Client.forEach(wfmClient => {
        // console.log(wfmClient);
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
      // console.log(clients);
      dispatch({
        type: GET_WFM_CLIENTS,
        payload: clients
      });
    });
};

export const syncJobWithWFM = jobNumber => async dispatch => {
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
      console.log(json);
      if (json.Response.Status === "ERROR") {
        dispatch({
          type: SET_MODAL_ERROR,
          payload: json.Response.ErrorDescription
        });
      } else {
        let wfmJob = json.Response.Job;
        let job = {};
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
            : "No contact name";
          job.managerID = wfmJob.Manager.ID
            ? wfmJob.Manager.ID
            : "No contact ID";
        } else {
          job.manager = "No contact name";
          job.managerID = "No contact ID";
        }
        job.dueDate = wfmJob.DueDate ? wfmJob.DueDate : "";
        job.startDate = wfmJob.StartDate ? wfmJob.StartDate : "";
        job.state = wfmJob.State ? wfmJob.State : "Unknown state";
        job.type = wfmJob.Type ? wfmJob.Type : "Other";
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

export const onFavNotice = (favnotices, uid) => dispatch => {
  let newArray = [];
  if (favnotices.includes(uid)) {
    newArray = favnotices.filter(item => item !== uid);
  } else {
    favnotices.push(uid);
    newArray = favnotices;
  }
  dispatch({
    type: FAV_NOTICE,
    payload: newArray
  });
};

export const onDeleteNotice = (deletednotices, uid) => dispatch => {
  let newArray = [];
  if (deletednotices.includes(uid)) {
    newArray = deletednotices.filter(item => item !== uid);
  } else {
    deletednotices.push(uid);
    newArray = deletednotices;
  }
  dispatch({
    type: DELETE_NOTICE,
    payload: newArray
  });
};

export const onReadNotice = (readnotices, uid) => dispatch => {
  let newArray = [];
  if (readnotices.includes(uid)) {
    newArray = readnotices.filter(item => item !== uid);
  } else {
    readnotices.push(uid);
    newArray = readnotices;
  }
  dispatch({
    type: READ_NOTICE,
    payload: newArray
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
  let user = {};
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
};

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
  var date = moment().format("YYYY-MM-DD");
  console.log(items);
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
  console.log(stats);
  stateRef
    .doc("stats")
    .collection("clientsjobs")
    .doc(date)
    .set({ state: stats["clients"] });
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
