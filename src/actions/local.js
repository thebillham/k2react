import { GET_STAFF,
        AUTH_USER,
        GET_DOCUMENTS,
        GET_USER,
        GET_QUIZZES,
        GET_WFM,
        GET_TRAININGS,
        GET_MODULES,
        SEARCH_CHANGE,
        CAT_CHANGE,
        GET_TOOLS,
        GET_NOTICES,
        GET_READINGLOG,
        GET_METHODLOG,
        GET_ME,
        DELETE_NOTICE,
        READ_NOTICE,
        FAV_NOTICE,
        SET_STEPPER,
        GET_ASBESTOS_SAMPLES,
        GET_HELP,
        APP_HAS_LOADED,
        RESET_LOCAL,
      } from "../constants/action-types";
import * as firebase from 'firebase';
import { wfmRoot, wfmApi, wfmAcc } from '../config/keys';
import { auth, database, firestore, usersRef, docsRef, modulesRef, toolsRef, noticesRef, quizzesRef,
    trainingPathsRef, methodsRef, asbestosSamplesRef, jobsRef, helpRef } from "../config/firebase";
import { xmlToJson } from "../config/XmlToJson";

export const resetLocal = () => dispatch => {
  dispatch({ type: RESET_LOCAL });
}

// Separate stream for just your information. So you don't re-read all staff for just changing your details.
export const fetchMe = () => async dispatch => {
  auth.currentUser &&
  usersRef.doc(auth.currentUser.uid)
    .onSnapshot((doc) => {
    console.log("Read a doc (fetchMe)!");
    if (doc.exists) {
      let user = doc.data();
      dispatch({ type: GET_ME, payload: user});
      // dispatch({ type: AUTH_USER, payload: doc.data().auth });
      usersRef.doc(auth.currentUser.uid).collection("attr")
        .onSnapshot((querySnapshot) => {
          user.attrs = {};
          user.tertiary = '';
          user.maskfit = false;
          user.ip402 = false;
          if (querySnapshot.size > 0) {
            querySnapshot.forEach((doc) => {
              console.log("Read a doc (my Attr)!");
              let attr = doc.data();
              attr.uid = doc.id;
              user.attrs[doc.id] = attr;
              if (attr.type == 'Tertiary') {
                user.tertiary = attr.abbrev;
              }
              if (attr.type == 'MaskFit' && new Date(attr.expiry) > new Date()) {
                user.maskfit = true;
              }
              if (attr.type == 'IP402') {
                user.ip402 = true;
              }
              if (attr.type == 'AsbestosAssessor') {
                user.aanumber = attr.number;
              }
            });
            dispatch({ type: GET_ME, payload: user });
          }
          dispatch({ type: APP_HAS_LOADED });
        });
      usersRef.doc(doc.id).collection("myjobs")
        .onSnapshot((querySnapshot) => {
          user.jobs = {};
          if (querySnapshot.size > 0) {
            querySnapshot.forEach((doc) => {
              console.log("Read a doc (my job)!");
              let job = doc.data();
              job.uid = doc.id;
              user.jobs[doc.id] = job;
            });
            dispatch({ type: GET_ME, payload: user });
          }
        });
    }
  });
};


// CHANGE USERS TO MAP

export const fetchStaff = () => async dispatch => {
  var gtsize = 0;
  var ltsize = 0;
  var users = {};
  auth.currentUser &&
  usersRef
    .where(firebase.firestore.FieldPath.documentId(), ">", auth.currentUser.uid)
    .onSnapshot((querySnapshot) => {
      gtsize = querySnapshot.size;
      console.log("GT Size: " + gtsize);
      // let gtattrsize = 0;
      querySnapshot.forEach((doc) => {
        console.log("Read a doc (Greater than User)! " + doc.data().name);
        let user = doc.data();
        user.uid = doc.id;
        usersRef.doc(doc.id).collection("attr")
          .onSnapshot((querySnapshot) => {
            user.attrs = {};
            user.tertiary = '';
            user.ip402 = false;
            if (querySnapshot.size > 0) {
              querySnapshot.forEach((doc) => {
                console.log("Read a doc (GT Attr)!");
                let attr = doc.data();
                attr.uid = doc.id;
                user.attrs[doc.id] = attr;
                if (attr.type == 'Tertiary') {
                  user.tertiary = attr.abbrev;
                }
                if (attr.type == 'MaskFit' && new Date(attr.expiry) > new Date()) {
                  user.maskfit = true;
                }
                if (attr.type == 'IP402') {
                  user.ip402 = true;
                }
                if (attr.type == 'AsbestosAssessor') {
                  user.aanumber = attr.number;
                }
              });
              dispatch({ type: GET_STAFF, payload: users });
            }
            // gtattrsize = gtattrsize + 1;
            // console.log(gtattrsize);
          });
          users[doc.id] = user;
          // if (ltsize < attrsize) dispatch({ type: GET_STAFF, payload: users });
        });
        dispatch({ type: GET_STAFF, payload: users });
      });
      usersRef
        .where(firebase.firestore.FieldPath.documentId(), "<", auth.currentUser.uid)
        .onSnapshot((querySnapshot) => {
          ltsize = querySnapshot.size;
          console.log("LT Size: " + ltsize);
          // let ltattrsize = 0;
          querySnapshot.forEach((doc) => {
            console.log("Read a doc (LT user)! " + doc.data().name);
            let user = doc.data();
            user.uid = doc.id;
            usersRef.doc(doc.id).collection("attr")
              .onSnapshot((querySnapshot) => {
                user.attrs = {};
                user.tertiary = '';
                user.ip402 = false;
                if (querySnapshot.size > 0) {
                  querySnapshot.forEach((doc) => {
                    console.log("Read a doc (LT attr)!");
                    let attr = doc.data();
                    attr.uid = doc.id;
                    user.attrs[doc.id] = attr;
                    if (attr.type == 'Tertiary') {
                      user.tertiary = attr.abbrev;
                    }
                    if (attr.type == 'MaskFit' && new Date(attr.expiry) > new Date()) {
                      user.maskfit = true;
                    }
                    if (attr.type == 'IP402') {
                      user.ip402 = true;
                    }
                    if (attr.type == 'AsbestosAssessor') {
                      user.aanumber = attr.number;
                    }
                  });
                  dispatch({ type: GET_STAFF, payload: users });
                }
                // ltattrsize = ltattrsize + 1;
                // console.log(ltattrsize);
              });
              users[doc.id] = user;
              // if (ltsize < attrsize) dispatch({ type: GET_STAFF, payload: users });
            });
            dispatch({ type: GET_STAFF, payload: users });
          });
  // If any
}

export const fetchDocuments = () => async dispatch => {
  docsRef.orderBy('title')
    .onSnapshot((querySnapshot) => {
      var docs = [];
      querySnapshot.forEach((doc) => {
        let ref = doc.data();
        ref.uid = doc.id;
        docs.push(ref);
      });
      dispatch({
        type: GET_DOCUMENTS,
        payload: docs
      });
    });
};

export const fetchTools = () => async dispatch => {
  toolsRef.orderBy('title')
    .onSnapshot((querySnapshot) => {
      var tools = [];
      querySnapshot.forEach((doc) => {
        let tool = doc.data();
        tool.uid = doc.id;
        tools.push(tool);
      });
      dispatch({
        type: GET_TOOLS,
        payload: tools
      });
    });
};

export const fetchTrainingPaths = () => async dispatch => {
  trainingPathsRef.orderBy('title')
    .onSnapshot((querySnapshot) => {
      var trainings = [];
      querySnapshot.forEach((doc) => {
        let training = doc.data();
        training.uid = doc.id;
        trainings.push(training);
      });
      dispatch({
        type: GET_TRAININGS,
        payload: trainings
      });
    });
};

export const fetchAsbestosSamples = () => async dispatch => {
  asbestosSamplesRef.orderBy("jobnumber", "desc").orderBy("samplenumber").limit(50)
    .onSnapshot((querySnapshot) => {
      var samples = [];
      querySnapshot.forEach((doc) => {
        let sample = doc.data();
        sample.uid = doc.id;
        samples.push(sample);
      });
      let samplemap = {};
      samples.map(sample => {
        if (samplemap[sample.jobnumber]) {
          samplemap[sample.jobnumber]['samples'].push(sample);
        } else {
          samplemap[sample.jobnumber] = {samples: [sample], clientname: '', address: '', type: '',};
        }
      });
      Object.keys(samplemap).map(job => {
        jobsRef.where("jobnumber", "==", job).limit(1)
        .get().then(doc => {
          doc.forEach(jobheader => {
            samplemap[job]['uid'] = jobheader.id;
            samplemap[job]['jobnumber'] = job;
            samplemap[job]['clientname'] = jobheader.data().clientname;
            samplemap[job]['address'] = jobheader.data().address;
            samplemap[job]['type'] = jobheader.data().type;
            samplemap[job]['reportversion'] = jobheader.data().reportversion ? jobheader.data().reportversion : 0;
          });
          dispatch({
            type: GET_ASBESTOS_SAMPLES,
            payload: samplemap,
          });
        });
      });
    });
};

export const fetchModules = () => async dispatch => {
  modulesRef.orderBy('title')
    .onSnapshot((querySnapshot) => {
      var modules = [];
      querySnapshot.forEach((doc) => {
        let mod = doc.data();
        mod.uid = doc.id;
        modules.push(mod);
      });
      dispatch({
        type: GET_MODULES,
        payload: modules
      });
    });
};

export const fetchQuizzes = () => async dispatch => {
  quizzesRef.orderBy('title')
    .onSnapshot((querySnapshot) => {
      var quizzes = [];
      querySnapshot.forEach((doc) => {
        let quiz = doc.data();
        quiz.uid = doc.id;
        quizzes.push(quiz);
      });
      dispatch({
        type: GET_QUIZZES,
        payload: quizzes
      });
    });
};

export const fetchNotices = () => async dispatch => {
  noticesRef.orderBy('date','desc').limit(100)
    .onSnapshot((querySnapshot) => {
      var notices = [];
      querySnapshot.forEach((doc) => {
        let notice = doc.data();
        notice.uid = doc.id;
        notices.push(notice);
      });
      dispatch({
        type: GET_NOTICES,
        payload: notices
      });
    });
};

export const fetchReadingLog = () => async dispatch => {
  usersRef.doc(auth.currentUser.uid).collection('readinglog').orderBy('date','desc')
    .onSnapshot((querySnapshot) => {
      var logs = [];
      querySnapshot.forEach((doc) => {
        let log = doc.data();
        log.uid = doc.id;
        docsRef.doc(doc.id).get().then((doc) => {
          log.title = doc.data().title;
          log.updatedate = doc.data().updatedate;
          logs.push(log);
        });
      });
      dispatch({
        type: GET_READINGLOG,
        payload: logs
      });
    });
};

export const fetchHelp = () => async dispatch => {
  helpRef.orderBy('date','desc')
    .onSnapshot(querySnapshot => {
      var helps = [];
      querySnapshot.forEach(doc => {
        helps.push(doc.data());
      });
      dispatch({
        type: GET_HELP,
        payload: helps,
      });
    });
};

export const fetchMethodLog = () => async dispatch => {
  usersRef.doc(auth.currentUser.uid).collection('methodlog').orderBy('methodCompleted','desc')
    .onSnapshot((querySnapshot) => {
      var logs = [];
      querySnapshot.forEach((doc) => {
        let log = doc.data();
        log.uid = doc.id;
        methodsRef.doc(doc.id).get().then((doc) => {
          log.title = doc.data().title;
          log.subtitle = doc.data().subtitle;
          log.sectionlength = doc.data().sections.length;
          log.updatedate = doc.data().updateDate;
          logs.push(log);
        });
      });
      dispatch({
        type: GET_METHODLOG,
        payload: logs
      });
    });
};

export const editUser = ({userRef, target}) => dispatch => {
  usersRef.doc(userRef).set({
    [target.id]: target.value
  }, { merge: true });
};

export const getUser = userRef => async dispatch => {
  usersRef.doc(userRef).onSnapshot((doc) => {
    dispatch({
      type: GET_USER,
      payload: doc.data()
    });
  });
};

export const fetchWFM = () => async dispatch => {
  // let path = apiRoot + 'wfm/job.php?apiKey=' + apiKey;
  let path = wfmRoot + 'job.api/current?apiKey=' + wfmApi + '&accountKey=' + wfmAcc;
  fetch(path).then(results => results.text()).then(data =>{
    var xmlDOM = new DOMParser().parseFromString(data, 'text/xml')
    var json = xmlToJson(xmlDOM);
    let jobs = [];
    // Map WFM jobs to a single level job object we can use
    json.Response.Jobs.Job.map(wfmJob => {
      let job = {};
      job.jobNumber = wfmJob.ID ? wfmJob.ID : 'No job number';
      job.address = wfmJob.Name ? wfmJob.Name: 'No address';
      job.description = wfmJob.Description ? wfmJob.Description : 'No description';
      if (wfmJob.Client) {
        job.client = wfmJob.Client.Name ? wfmJob.Client.Name : 'No client name';
        job.clientID = wfmJob.Client.ID ? wfmJob.Client.ID : 'No client ID';
      } else {
        job.client = 'No client name';
        job.clientID = 'No client ID';
      }
      job.clientOrderNumber = wfmJob.ClientOrderNumber ? wfmJob.ClientOrderNumber : 'No client order number';
      if (wfmJob.Contact) {
        job.contact = wfmJob.Contact.Name ? wfmJob.Contact.Name : 'No contact name';
        job.contactID = wfmJob.Contact.ID ? wfmJob.Contact.ID : 'No contact ID';
      } else {
        job.contact = 'No contact name';
        job.contactID = 'No contact ID';
      }
      if (wfmJob.Manager) {
        job.manager = wfmJob.Manager.Name ? wfmJob.Manager.Name : 'No contact name';
        job.managerID = wfmJob.Manager.ID ? wfmJob.Manager.ID : 'No contact ID';
      } else {
        job.manager = 'No contact name';
        job.managerID = 'No contact ID';
      }
      job.dueDate = wfmJob.DueDate ? wfmJob.DueDate : '';
      job.startDate = wfmJob.StartDate ? wfmJob.StartDate : '';
      job.state = wfmJob.State ? wfmJob.State : 'Unknown state';
      job.type = wfmJob.Type ? wfmJob.Type : 'Other';
      jobs.push(job);
    });
    dispatch({
      type: GET_WFM,
      payload: jobs
    });
  });
};

export const onSearchChange = value => dispatch => {
  dispatch({
    type: SEARCH_CHANGE,
    payload: value,
  });
};

export const onCatChange = value => dispatch => {
  dispatch({
    type: CAT_CHANGE,
    payload: value,
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
    payload: newArray,
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
    payload: newArray,
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
    payload: newArray,
  });
};

export const setStepper = (steppers, uid, step) => dispatch => {
  steppers[uid] = step;
  dispatch({
    type: SET_STEPPER,
    payload: steppers,
  });
}
