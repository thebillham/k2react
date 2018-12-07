import { GET_STAFF,
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
        GET_UPDATES,
        GET_COCS,
        GET_SAMPLES,
        APP_HAS_LOADED,
        RESET_LOCAL,
        UPDATE_STAFF,
        GET_VEHICLES,
        SET_MODAL_ERROR,
        GET_WFMJOB,
      } from "../constants/action-types";
import firebase from '../config/firebase';
import { auth, usersRef, docsRef, modulesRef, toolsRef, noticesRef, quizzesRef,
    trainingPathsRef, methodsRef, asbestosSamplesRef, jobsRef, helpRef,
    updateRef, cocsRef, vehiclesRef, } from "../config/firebase";
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

export const fetchStaff = () => async dispatch => {
  var users = {};
  auth.currentUser &&
    usersRef
      .where(firebase.firestore.FieldPath.documentId(), ">", auth.currentUser.uid)
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log("Read a doc (Greater than User)! " + doc.data().name);
          let user = doc.data();
          user.uid = doc.id;
          users[doc.id] = user;
        });
        dispatch({ type: GET_STAFF, payload: users });
      });
  auth.currentUser &&
    usersRef
      .where(firebase.firestore.FieldPath.documentId(), "<", auth.currentUser.uid)
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log("Read a doc (LT user)! " + doc.data().name);
          let user = doc.data();
          user.uid = doc.id;
          users[doc.id] = user;
        });
        dispatch({ type: GET_STAFF, payload: users });
      });
}

export const getUserAttrs = userPath => async dispatch => {
  console.log('Calling update staff for ' + userPath);
  let user = {};
  auth.currentUser &&
    usersRef.doc(userPath).collection("attr")
      .get().then((querySnapshot) => {
        user.attrs = {};
        user.aanumber = '';
        user.tertiary = '';
        user.ip402 = false;
        user.nzqa = [];
        user.nzqatraining = 'None';
        user.firstaid = null;
        user.maskfit = '';
        user.docimages = [];
        if (querySnapshot.size > 0) {
          querySnapshot.forEach((doc) => {
            console.log("Read a doc (Attr)!");
            let attr = doc.data();
            attr.uid = doc.id;
            user.attrs[doc.id] = attr;
            if (attr.fileUrl) {
              user.docimages.push({
                type: attr.type,
                url: attr.fileUrl,
              });
            }
            if (attr.type === 'NZQAUnitStandard' && attr.date) {
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
            if (attr.type === 'Tertiary') {
              user.tertiary = attr.abbrev;
            }
            if (attr.type === 'MaskFit') {
              if (new Date(attr.expiry) > new Date()) {
                user.maskfit = 'OK';
              } else {
                user.maskfit = 'Expired';
              }
            }
            if (attr.type === 'IP402') {
              user.ip402 = true;
            }
            if (attr.type === 'AsbestosAssessor') {
              user.aanumber = attr.number;
            }
            if (attr.type === 'FirstAid' && attr.date) {
              user.firstaid = 'Expired';
              if (attr.expiry) {
                if (new Date(attr.expiry) > new Date()) user.firstaid = 'OK';
              } else {
                var firstaidexpiry = new Date(attr.date);
                firstaidexpiry.setFullYear(firstaidexpiry.getFullYear() + 2);
                if (firstaidexpiry > new Date()) user.firstaid = 'OK';
              }
            }
          });
          if (user.nzqa) {
            let nzqalist = [];
            if (user.nzqa.includes('23229') && user.nzqa.includes('17600') && user.nzqa.includes('25045')) {
              nzqalist.push('Height Training');
            }
            if (user.nzqa.includes('23960') && user.nzqa.includes('23962') && user.nzqa.includes('23966')) {
              nzqalist.push('Mobile Elevated Work Platforms');
            }
            if (user.nzqa.includes('17599') && user.nzqa.includes('18426') && user.nzqa.includes('25510')) {
              nzqalist.push('Confined Spaces');
            }
            user.nzqatraining = nzqalist.join(', ');
          }
          usersRef.doc(userPath).update({
            tertiary: user.tertiary,
            ip402: user.ip402,
            nzqa: user.nzqa,
            nzqatraining: user.nzqatraining,
            firstaid: user.firstaid,
            maskfit: user.maskfit,
            aanumber: user.aanumber,
            docimages: user.docimages,
          });
          if (userPath === auth.currentUser.uid) {
            console.log('Updating user');
            console.log(user);
            dispatch({
              type: GET_ME,
              payload: user,
            });
          } else {
            console.log('Updating other staff');
            console.log(user);
            dispatch({
              type: UPDATE_STAFF,
              userPath: userPath,
              payload: user,
            });
          }
        }
      });
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

export const fetchCocs = () => async dispatch => {
  cocsRef.orderBy('dueDate', 'desc')
    .onSnapshot((querySnapshot) => {
      var cocs = {};
      querySnapshot.forEach((doc) => {
        cocs[doc.id] = doc.data();
      });
      dispatch({
        type: GET_COCS,
        payload: cocs
      });
    });
};

export const fetchVehicles = () => async dispatch => {
  vehiclesRef
    .get().then((querySnapshot) => {
      var vehicles = [];
      querySnapshot.forEach((doc) => {
        var vehicle = doc.data();
        vehicle.number = doc.id;
        vehicles.push(vehicle);
      });
      dispatch({
        type: GET_VEHICLES,
        payload: vehicles,
      });
    })
}

export const fetchSamples = cocUid => async dispatch => {
  cocsRef.doc(cocUid).collection('samples').orderBy('samplenumber')
    .onSnapshot((querySnapshot) => {
      var samples = {};
      querySnapshot.forEach((doc) => {
        let sample = doc.data();
        sample.uid = doc.id;
        samples[doc.id] = sample;
      });
      dispatch({
        type: GET_SAMPLES,
        cocUid: cocUid,
        payload: samples
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
      samples.forEach(sample => {
        if (samplemap[sample.jobnumber]) {
          samplemap[sample.jobnumber]['samples'].push(sample);
        } else {
          samplemap[sample.jobnumber] = {samples: [sample], clientname: '', address: '', type: '',};
        }
      });
      Object.keys(samplemap).forEach(job => {
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
          dispatch({
            type: GET_READINGLOG,
            payload: logs
          });
        });
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

export const fetchUpdates = () => async dispatch => {
  updateRef.orderBy('date','desc')
    .onSnapshot(querySnapshot => {
      var updates = [];
      querySnapshot.forEach(doc => {
        updates.push(doc.data());
      });
      dispatch({
        type: GET_UPDATES,
        payload: updates,
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
  let path = `${process.env.REACT_APP_WFM_ROOT}job.api/current?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  fetch(path).then(results => results.text()).then(data =>{
    var xmlDOM = new DOMParser().parseFromString(data, 'text/xml')
    var json = xmlToJson(xmlDOM);
    let jobs = [];
    // Map WFM jobs to a single level job object we can use
    json.Response.Jobs.Job.forEach(wfmJob => {
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

export const syncJobWithWFM = jobNumber => async dispatch => {
  let path = `${process.env.REACT_APP_WFM_ROOT}job.api/get/${jobNumber}?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  console.log(path);
  fetch(path).then(results => results.text()).then(data =>{
    var xmlDOM = new DOMParser().parseFromString(data, 'text/xml')
    var json = xmlToJson(xmlDOM);
    console.log(json);
    if (json.Response.Status === 'ERROR') {
      dispatch({
        type: SET_MODAL_ERROR,
        payload: json.Response.ErrorDescription,
      });
    } else {
      let wfmJob = json.Response.Job;
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
      dispatch({
        type: GET_WFMJOB,
        payload: job,
      });
    }
  });
};

export const resetWfmJob = () => dispatch => {
  dispatch({
    type: GET_WFMJOB,
    payload: {},
  })
}

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
