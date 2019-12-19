import React from "react";
import {
  EDIT_MODAL_DOC,
  SET_MODAL_ERROR,
  SAVE_WFM_STATS,
  SAVE_WFM_ITEMS,
  CLEAR_WFM_JOB,
  GET_GEOCODES,
  GET_WFM_JOBS,
  GET_WFM_JOB,
  GET_JOB,
  GET_WFM_LEADS,
  GET_WFM_CLIENTS,
  GET_JOB_LIST,
  ADD_TO_JOB_LIST,
  GET_CURRENT_JOB_STATE,
  RESET_JOBS,
  SET_LAST_TIME_SAVED,
} from "../constants/action-types";

// Lead history icons
import ActivityIcon from "@material-ui/icons/DoneOutline";
import EmailIcon from "@material-ui/icons/Email";
import LeadIcon from "@material-ui/icons/Call";
import LostIcon from "@material-ui/icons/CallEnd";
import NoteIcon from "@material-ui/icons/ListAlt";

import moment from "moment";
import {
  firestore,
  auth,
  stateRef,
  usersRef,
  jobsRef,
} from "../config/firebase";
import { xmlToJson } from "../config/XmlToJson";
import {
  sendSlackMessage,
  dateOf,
  getDaysBetweenDates,
  getDaysSinceDate,
  titleCase,
} from "./helpers";
// import assetData from "./assetData.json";

const buckets = [
  'jobs',
  'asbestos',
  'asbestosbulkid',
  'asbestosclearance',
  'asbestosbackground',
  'workplace',
  'meth',
  'bio',
  'stack',
  'noise'
];

export const resetJobs = () => dispatch => {
  dispatch({ type: RESET_JOBS });
};

export const fetchWFMJobs = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchWFMJobs`);
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
        // console.log(wfmJob);
        let job = {};
        job.jobNumber = wfmJob.ID ? wfmJob.ID : null;
        job.wfmID = wfmJob.InternalID;
        job.address = wfmJob.Name ? wfmJob.Name : null;
        let i = job.address.length;
        if (i < len) {
          len = i;
          str = job.address;
          //console.log(`${str} (${len})`);
        }

        job.description = wfmJob.Description ? wfmJob.Description : null;
        if (wfmJob.Client) {
          // console.log(wfmJob.Client);
          job.client = wfmJob.Client.Name ? wfmJob.Client.Name : null;
          job.clientID = wfmJob.Client.ID ? wfmJob.Client.ID : null;
        }
        job.clientOrderNumber = wfmJob.ClientOrderNumber ? wfmJob.ClientOrderNumber : null;
        if (wfmJob.Contact) {
          job.contact = wfmJob.Contact.Name ? wfmJob.Contact.Name : null
          job.contactID = wfmJob.Contact.ID ? wfmJob.Contact.ID : null;
        }
        if (wfmJob.Manager) {
          job.manager = wfmJob.Manager.Name ? wfmJob.Manager.Name : null;
          job.managerID = wfmJob.Manager.ID ? wfmJob.Manager.ID : null;
        }
        if (wfmJob.Assigned.Staff) {
          job.assigned = [];
          if (Array.isArray(wfmJob.Assigned.Staff)) {
            wfmJob.Assigned.Staff.forEach(wfmAssigned => {
              let staff = {};
              staff.id = wfmAssigned.ID;
              staff.name = wfmAssigned.Name;
              job.assigned.push(staff);
            });
          } else {
            job.assigned = [
              {
                id: wfmJob.Assigned.Staff.ID,
                name: wfmJob.Assigned.Staff.Name,
              }
            ];
          }
          // console.log(job.assigned);
        }
        job.dueDate = wfmJob.DueDate ? wfmJob.DueDate : null;
        job.startDate = wfmJob.StartDate ? wfmJob.StartDate : null;
        job.wfmState = wfmJob.State ? wfmJob.State : null;
        job.wfmType = wfmJob.Type ? wfmJob.Type : 'Other';
        jobs.push(job);
      });
      dispatch({
        type: GET_WFM_JOBS,
        payload: jobs
      });
    });
};

export const fetchWFMLeads = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchWFMLeads`);
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
        lead.name = wfmLead.Name ? wfmLead.Name : null;
        lead.description = wfmLead.Description ? wfmLead.Description : null;
        lead.value = wfmLead.EstimatedValue ? wfmLead.EstimatedValue : 0;
        if (wfmLead.Client) {
          lead.client = wfmLead.Client.Name ? wfmLead.Client.Name : null;
          lead.clientID = wfmLead.Client.ID ? wfmLead.Client.ID : null;
        }
        if (wfmLead.Contact) {
          lead.contact = wfmLead.Contact.Name ? wfmLead.Contact.Name : null;
          lead.contactID = wfmLead.Contact.ID ? wfmLead.Contact.ID : null;
        }
        if (wfmLead.Owner) {
          lead.owner = wfmLead.Owner.Name ? wfmLead.Owner.Name : null;
          lead.ownerID = wfmLead.Owner.ID ? wfmLead.Owner.ID : null;
        }
        let assigned = { [lead.ownerID]: true };
        lead.date = wfmLead.Date ? wfmLead.Date : null;
        lead.dateWonLost = wfmLead.DateWonLost ? wfmLead.DateWonLost : null;
        lead.category = (typeof wfmLead.Category !== "object") ? wfmLead.Category : 'Other';
        if (wfmLead.Activities.Activity) {
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
                assigned[activity.responsibleID] = true;
              } else {
                activity.responsible = null;
                activity.responsibleID = null;
              }
              lead.activities.push(activity);
            });
          } else {
            if (wfmLead.Activities.Activity.Responsible) assigned[wfmLead.Activities.Activity.Responsible.ID] = true;
            lead.activities = [
              {
                date: wfmLead.Activities.Activity.Date,
                subject: wfmLead.Activities.Activity.Subject,
                complete: wfmLead.Activities.Activity.Completed,
                responsible: wfmLead.Activities.Activity.Responsible
                  ? wfmLead.Activities.Activity.Responsible.Name
                  : null,
                responsibleID: wfmLead.Activities.Activity.Responsible
                  ? wfmLead.Activities.Activity.Responsible.ID
                  : null,
              }
            ];
          }
          if (Object.keys(assigned).length > 0) lead.assigned = Object.keys(assigned);
          // console.log(lead.assigned);
        } else {
          lead.activities = [];
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
      // //console.log(leads);
      dispatch({
        type: GET_WFM_LEADS,
        payload: leads
      });
    });
};

export const fetchWFMClients = () => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchWFMClients`);
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

export const clearWfmJob = () => async dispatch => {
  dispatch({
    type: CLEAR_WFM_JOB,
  })
}

export const getJob = job => async dispatch => {
  if (job && job.jobNumber) {
    jobsRef.doc(job.jobNumber.trim()).get().then(doc => {
      if (doc.exists) {
        dispatch({
          type: GET_JOB,
          payload: {
            ...doc.data(),
            ...job,
          }
        });
        jobsRef.doc(job.jobNumber.trim()).update(job);
      } else {
        // Initialise job
        let setupMap = {};
        if (job.category && job.category.toLowerCase().includes('asbestos')) {
          setupMap = {
            isManagementPlanRequired: false,
            isReportRequired: true,
            surveyType: null,
            surveyDates: null,
            surveyors: null,
            reportAuthor: null,
            reportChecker: null,
            reportKTP: null,
            surveyGoal: null,
            surveyScope: null,
            siteDescription: null,
            buildingAge: null,
            buildingAgeReference: null,
            surveyWeather: null,
            photoMainSite: null,
            reportState: null,
            currentVersion: null,
          };
        }
        let newJob = {
          ...job,
          ...setupMap,
        };
        dispatch({
          type: GET_JOB,
          payload: newJob,
        });
        jobsRef.doc(job.jobNumber.trim()).set(job);
      }
    });
  }
};

export const getDetailedWFMJob = (jobNumber, createUid, setUpJob) => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran getDetailedWFMJob`);
  let path = `${
    process.env.REACT_APP_WFM_ROOT
  }job.api/get/${jobNumber.trim()}?apiKey=${
    process.env.REACT_APP_WFM_API
  }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
  // console.log(path);
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
        let job = {
          isJob: true,
        };
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
          if (job.clientID) {
            let path = `${process.env.REACT_APP_WFM_ROOT}client.api/get/${job.clientID}?apiKey=${
              process.env.REACT_APP_WFM_API
            }&accountKey=${process.env.REACT_APP_WFM_ACC}`;
            fetch(path)
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
                  let client = json.Response.Client;
                  let wfmClient = {};
                  job.clientDetails = {
                    wfmID: job.clientID,
                    name: client.Name === Object(client.Phone) ? null : titleCase(client.Name.toString().trim()),
                    email: client.Email === Object(client.Email) ? null : client.Email ? client.Email.toString().trim().toLowerCase() : null,
                    address: client.Address === Object(client.Address) ? null : titleCase(client.Address.toString().trim()),
                    city: client.City === Object(client.City) ? null : titleCase(client.City.toString().trim()),
                    region: client.Region === Object(client.Region) ? null : titleCase(client.Region.toString().trim()),
                    postcode: client.PostCode === Object(client.PostCode) ? null : client.PostCode.toString().trim(),
                    country: client.Country === Object(client.Country) ? null : titleCase(client.Country.toString().trim()),
                    postalAddress: client.PostalAddress === Object(client.PostalAddress) ? null : titleCase(client.PostalAddress.toString().trim()),
                    postalCity: client.PostalCity === Object(client.PostalCity) ? null : titleCase(client.PostalCity.toString().trim()),
                    postalRegion: client.PostalRegion === Object(client.PostalRegion) ? null : titleCase(client.PostalRegion.toString().trim()),
                    postalPostCode: client.PostalPostCode === Object(client.PostalPostCode) ? null : client.PostalPostCode.toString().trim(),
                    postalCountry: client.PostalCountry === Object(client.PostalCountry) ? null : titleCase(client.PostalCountry.toString().trim()),
                    phone: client.Phone === Object(client.Phone) ? null : client.Phone.toString().replace('-',' ').trim(),
                  }
                  // console.log(job.clientDetails);
                  dispatch({
                    type: GET_WFM_JOB,
                    payload: job
                  });
                  dispatch({
                    type: EDIT_MODAL_DOC,
                    payload: job
                  });
                  if (setUpJob) dispatch(getJob(job));
                }
              });
          }
        } else {
          job.client = null;
          job.clientID = null;
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
                  // console.log(contact);
                  job.contact = {
                    wfmID: contactID,
                    name: contact.Name ? contact.Name.toString().trim() : '',
                    position: contact.Position === Object(contact.Position) ? '' : contact.Position.toString().trim(),
                    mobile: contact.Mobile === Object(contact.Mobile) ? '' : contact.Mobile.toString().replace('-',' ').trim(),
                    phone: contact.Phone === Object(contact.Phone) ? '' : contact.Phone.toString().replace('-',' ').trim(),
                    email: contact.Email === Object(contact.Email) ? '' : contact.Email.toString().toLowerCase().trim(),
                  }
                  dispatch({
                    type: GET_WFM_JOB,
                    payload: job
                  });
                  dispatch({
                    type: EDIT_MODAL_DOC,
                    payload: job
                  });
                  if (setUpJob) dispatch(getJob(job));
                }
              });
          } else {
            job.contact = {
              wfmID: null,
              name: null,
              email: null,
            };
          }
        } else {
          job.contact = {
            wfmID: null,
            name: null,
            email: null,
          };
        }
        if (wfmJob.Manager) {
          job.manager = wfmJob.Manager.Name
            ? wfmJob.Manager.Name
            : null;
          job.managerID = wfmJob.Manager.ID
            ? wfmJob.Manager.ID
            : null;
        } else {
          job.manager = null;
          job.managerID = null;
        }
        job.dueDate = dateOf(wfmJob.DueDate);
        job.startDate = dateOf(wfmJob.StartDate);
        job.wfmState = wfmJob.State ? wfmJob.State : "Unknown state";
        job.wfmType = wfmJob.Type ? wfmJob.Type : "Other";
        job.wfmID = wfmJob.InternalID;
        if (wfmJob.Milestones.Milestone) {
          job.milestones = [];
          if (Array.isArray(wfmJob.Milestones.Milestone)) {
            wfmJob.Milestones.Milestone.forEach(wfmMilestone => {
              let milestone = {};
              milestone.id = wfmMilestone.ID;
              milestone.date = wfmMilestone.Date;
              milestone.description = wfmMilestone.Description;
              milestone.folder = wfmMilestone.Folder
              milestone.completed = wfmMilestone.Completed;
              job.milestones.push(milestone);
            });
          } else {
            job.milestones = [
              {
                id: wfmJob.Milestones.Milestone.ID,
                date: wfmJob.Milestones.Milestone.Date,
                description: wfmJob.Milestones.Milestone.Description,
                folder: wfmJob.Milestones.Milestone.Folder,
                complete: wfmJob.Milestones.Milestone.Completed,
              }
            ];
          }
        }
        if (wfmJob.Notes.Note) {
          job.notes = [];
          if (Array.isArray(wfmJob.Notes.Note)) {
            wfmJob.Notes.Note.forEach(wfmNote => {
              let note = {};
              note.id = wfmNote.ID;
              note.date = wfmNote.Date;
              note.createdBy = wfmNote.CreatedBy;
              note.text = wfmNote.Text;
              note.title = wfmNote.Title;
              note.comments = wfmNote.Comments;
              note.folder = wfmNote.Folder;
              job.notes.push(note);
            });
          } else {
            job.notes = [
              {
                id: wfmJob.Notes.Note.ID,
                date: wfmJob.Notes.Note.Date,
                createdBy: wfmJob.Notes.Note.CreatedBy,
                text: wfmJob.Notes.Note.Text,
                title: wfmJob.Notes.Note.Title,
                comments: wfmJob.Notes.Note.Comments,
                folder: wfmJob.Notes.Note.Folder,
              }
            ];
          }
        }
        if (wfmJob.Assigned.Staff) {
          job.assigned = [];
          if (Array.isArray(wfmJob.Assigned.Staff)) {
            wfmJob.Assigned.Staff.forEach(wfmAssigned => {
              let staff = {};
              staff.id = wfmAssigned.ID;
              staff.name = wfmAssigned.Name;
              job.assigned.push(staff);
            });
          } else {
            job.assigned = [
              {
                id: wfmJob.Assigned.Staff.ID,
                name: wfmJob.Assigned.Staff.Name,
              }
            ];
          }
        }
        if (createUid) {
          let uid = `${job.jobNumber.toUpperCase()}_${job.client.toUpperCase()}_${moment().format('x')}`;
          // //console.log('New uid' + uid);
          dispatch({
            type: EDIT_MODAL_DOC,
            payload: { 'uid': uid }
          });
        }
        // console.log(job);
        dispatch({
          type: GET_WFM_JOB,
          payload: job
        });
        dispatch({
          type: EDIT_MODAL_DOC,
          payload: job
        })
        if (setUpJob) dispatch(getJob(job));
      }
    });
};

export const resetWfmJob = () => dispatch => {
  dispatch({
    type: GET_WFM_JOB,
    payload: {}
  });
};

export const saveGeocodes = geocodes => dispatch => {
  if (geocodes) {
    Object.values(geocodes).forEach(g => {
      Object.keys(g).forEach(k => {
        if (g[k] === undefined) console.log(k)
      });
    })
    stateRef.doc("geocodes").set({ payload: geocodes });
  }
};

export const fetchGeocodes = () => dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchGeocodes`);
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
  console.log(Object.keys(items).length);
  var date = moment().format("YYYY-MM-DD");
  // //console.log(items);
  // Object.values(items).forEach(job => {
  //   Object.keys(job).forEach(val => {
  //     if (job[val] === undefined) {
  //       console.log(`Job: ${job.isJob}, Number: ${job.jobNumber}, Val: ${val}`);
  //     }
  //   })
  // })
  let leads1 = {};
  let leads2 = {};
  let jobs = {};

  let leadSwitch = true;

  Object.values(items).forEach(item => {
    if (item.isJob) jobs[item.wfmID] = item;
    else if (leadSwitch) leads1[item.wfmID] = item;
    else leads2[item.wfmID] = item;
    leadSwitch = !leadSwitch;
  });

  let batch = firestore.batch();
  batch.set(stateRef
    .doc("wfmstate")
    .collection("jobStates")
    .doc(date), jobs);
  batch.set(stateRef
    .doc("wfmstate")
    .collection("leadStates1")
    .doc(date), leads1);
  batch.set(stateRef
    .doc("wfmstate")
    .collection("leadStates2")
    .doc(date), leads2);
  batch.commit();
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
export const analyseJobHistory = () => {
  // sendSlackMessage(`${auth.currentUser.displayName} ran analyseJobHistory`);
  // vars
  console.log('Running job history');
  var jobMap = {};
  buckets.forEach((bucket) => {
    jobMap[bucket] = {};
  });
  var jobTypes = {};
  var jobCategorys = {};
  var stateChangeDates = {};

  var completionMap = {};
  var creationMap = {};

  var leadBuckets = {};
  var allBuckets = [];
  // get all wfm daily states from firebase
  stateRef
    .doc("wfmstate")
    .collection("jobStates")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // Loop through each day of the saved states
        console.log(doc.id);
        var state = doc.data() && Object.values(doc.data());
        console.log(state);
        // console.log(state.filter((stateJob) => stateJob.isJob).length);
        // Loop through current job map and check if any are missing from this state (e.g. they have been completed since the last state)
        if (state.length > 0) {
          buckets.forEach((bucket) => {
            // console.log(bucket);
            if (jobMap[bucket] !== undefined) {
              console.log(jobMap[bucket]);
              Object.values(jobMap[bucket]).forEach((job) => {
                console.log(state.filter((stateJob) => stateJob.wfmID === job.wfmID).length);
                if (job.wfmState !== 'Completed' && state.filter((stateJob) => stateJob.wfmID === job.wfmID).length === 0 && state.filter((stateJob) => stateJob.isJob).length > 0) {
                  console.log('Job ' + job.wfmID + ' Completed at ' + doc.id);
                  jobMap[bucket][job.wfmID]['wfmState'] = 'Completed';
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
                  if (jobMap[bucket][job.wfmID]['completedActivities'] !== undefined) completionDoc.stateHistory = jobMap[bucket][job.wfmID]['completedActivities'];
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
            if (job.category === 'Asbestos - Bulk ID') bucket = 'asbestosbulkid';
            if (job.category === 'Asbestos - Clearance') bucket = 'asbestosclearance';
            if (job.category === 'Asbestos - Background') bucket = 'asbestosbackground';
            if (job.category.toLowerCase().includes('meth')) bucket = 'meth';
            if (job.category === 'Workplace') bucket = 'workplace';
            if (job.category === 'Biological') bucket = 'bio';
            if (job.category === 'Stack Testing') bucket = 'stack';
            if (job.category === 'Noise') bucket = 'noise';

            var mappedJob = jobMap[bucket][job.wfmID];
            if (mappedJob !== undefined) {
            // Update current job (Check if state has been updated)
              if (job.state !== undefined) {
                job.wfmState = job.state;
                delete job.state;
              }
              if (job.wfmState !== mappedJob.wfmState) {
                // Create a list of all job states/change dates (not necessary)
                // if (jobTypes[job.wfmState] !== undefined) jobTypes[job.wfmState][bucket] = ''; else jobTypes[job.wfmState] = {[bucket]: ''};
                // if (stateChangeDates[doc.id] !== undefined) stateChangeDates[doc.id][bucket] = ''; else stateChangeDates[doc.id] = {[bucket]: ''};
                let update = true;

                if (mappedJob.wfmState === 'Completed' || mappedJob.state === 'Completed') {
                  // Mapped job was incorrectly marked as completed
                  // console.log(mappedJob);
                  mappedJob.stateHistory && Object.keys(mappedJob.stateHistory).forEach(k => {
                    if (mappedJob.stateHistory[k] === 'Completed') {
                      console.log(mappedJob.stateHistory);
                      delete mappedJob.stateHistory[k];
                      // if (completionMap[k]) {
                      //   delete completionMap[k];
                      // }
                      // console.log(mappedJob.stateHistory);
                    }
                  });
                  if (mappedJob.stateHistory && Object.keys(mappedJob.stateHistory).slice(-1)[0] !== undefined) {
                    if (mappedJob.stateHistory[Object.keys(mappedJob.stateHistory).slice(-1)[0]] === job.wfmState) {
                      console.log(mappedJob.stateHistory[Object.keys(mappedJob.stateHistory).slice(-1)[0]]);
                      console.log(job.wfmState);
                      console.log('States match, no update');
                      console.log(mappedJob);
                      console.log(mappedJob.wfmID);
                      update = false;
                    }
                  }
                }

                mappedJob.wfmState = job.wfmState;

                if (update) {
                  // Update mapped job
                  mappedJob.lastActionDate = doc.id;
                  mappedJob.stateHistory = {
                    ...mappedJob.stateHistory,
                    [doc.id]: job.wfmState,
                  };
                  if (job.wfmState === undefined) console.log(mappedJob.stateHistory);
                } else {
                  console.log(mappedJob.wfmID);
                  mappedJob.lastActionDate = Object.keys(mappedJob.stateHistory).slice(-1)[0];
                  console.log(Object.keys(mappedJob.stateHistory).slice(-1)[0]);
                }
              }
              if (job.geocode !== mappedJob.geocode) {
                if ((job.geocode && job.geocode.address === "New Zealand") || (mappedJob.geocode && mappedJob.geocode.address === "New Zealand")) {
                  if (mappedJob.geocode.address === "New Zealand" && job.geocode.address !== "New Zealand") {
                    mappedJob.geocode = job.geocode;
                  }
                }
              }
              // Add to mapped jobs
            } else {
              // Add new job to map
              console.log('Adding New Job (' + bucket + ') ' + job.wfmID);
              job.creationDate = moment(job.creationDate).format('YYYY-MM-DD');
              job.lastActionDate = doc.id;

              // Delete outdated fields and state history
              if (job.daysOld !== undefined) delete job.daysOld;
              if (job.stateHistory !== undefined) delete job.stateHistory;
              if (job.state !== undefined) {
                job.wfmState = job.state;
                delete job.state;
              }

              job.stateHistory = {
                [job.creationDate]: 'Job Created',
                [doc.id]: job.wfmState,
              };

              console.log(job);

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
            // // Leads have their state history in already (activities)
            // if (job.averageCompletedActionOverdueDays !== undefined) delete job.averageCompletedActionOverdueDays;
            // job.creationDate = moment(job.creationDate).format('YYYY-MM-DD');
            // if (job.daysOld !== undefined) delete job.daysOld;
            // if (job.daysSinceLastAction !== undefined) delete job.daysSinceLastAction;
            // if (job.urgentAction !== undefined) delete job.urgentAction;
            // if (job.completedActivities !== undefined) delete job.completedActivities;
            // var bucket = 'leads' + job.wfmID.slice(-2);
            // if (jobCategorys['leads'] !== undefined) {
            //   jobCategorys['leads'] = jobCategorys['leads'] + 1;
            // } else {
            //   jobCategorys['leads'] = 1;
            // }
            // // Talley how many jobs in each category (not necessary)
            // if (jobCategorys[bucket] !== undefined) {
            //   jobCategorys[bucket] = jobCategorys[bucket] + 1;
            //   leadBuckets[bucket] = true;
            // } else {
            //   jobCategorys[bucket] = 1;
            // }
            // if (jobMap[bucket] === undefined) jobMap[bucket] = {};
            // jobMap[bucket][job.wfmID] = job;
          }
        });
      });

      console.log(jobMap);
      console.log(completionMap);
      console.log(creationMap);

      let batch = firestore.batch();

      allBuckets = buckets.concat(Object.keys(leadBuckets));
      allBuckets.forEach((bucket) => {
        // console.log(bucket);
        // Check for any jobs that have undefined state historys
        if (jobMap[bucket]) {
          Object.values(jobMap[bucket]).forEach(job => {
            if (job.stateHistory) {
              let lastKey = '';
              Object.keys(job.stateHistory).forEach(k => {
                if (job.stateHistory[k] === undefined) {
                  job.stateHistory[k] = 'Data missing';
                  // console.log(job.stateHistory);
                }
                if (job.stateHistory[lastKey] === job.stateHistory[k]) {
                  // console.log(job.stateHistory);
                  delete job.stateHistory[k];
                  // console.log(job.stateHistory);
                }
                lastKey = k;
              });
              job.lastActionDate = lastKey;
            }
          })
        }
        batch.set(stateRef.doc("wfmstate").collection("current").doc(bucket), jobMap[bucket]);
      });
      console.log(jobMap);
      batch.set(stateRef.doc("wfmstate").collection("timeline").doc('completion'), completionMap);
      batch.set(stateRef.doc("wfmstate").collection("timeline").doc('creation'), creationMap);
      batch.commit();
    });
};

export const calculateJobStats = jobList => dispatch => {
  // Set up stat sheet for new names
  // Averages in form { number of items, sum, average }
  const statSheet = {
    // Totals
    jobNeedsBookingTotal: 0,
    leadTotal: 0,
    jobTotal: 0,
    completedActions: 0,
    overdueActions: 0,
    upcomingActions: 0,
    valueTotal: 0,

    // Averages
    averageActionOverdueDays: [0, 0, 0],
    averageCompletedActionOverdueDays: [0, 0, 0],
    averageCurrentOverdueDays: [0, 0, 0],
    averageLeadAge: [0, 0, 0],
    averageJobAge: [0, 0, 0],
    averageJobNeedsBookingAge: [0, 0, 0],

    // List of ages to be graphed
    leadAges: [],
    jobAges: [],
    jobNeedsBookingAges: [],
    actionOverdueDays: [],
    completedActionOverdueDays: []
  };
  var client = {};
  var staff = {};
  staff["K2"] = { ...this.state.statSheet };

  jobList && Object.values(jobList).forEach(m => {
    var age = this.getDaysSinceDate(m.creationDate);
    if (staff[m.owner] === undefined)
      staff[m.owner] = { ...this.state.statSheet };
    if (client[m.client] === undefined)
      client[m.client] = { ...this.state.statSheet };
    if (m.state === "Needs Booking") {
      staff["K2"]["jobNeedsBookingTotal"] += 1;
      staff["K2"]["jobNeedsBookingTotal"] =
        staff["K2"]["jobNeedsBookingTotal"] + 1;
      staff[m.owner]["jobNeedsBookingTotal"] += 1;
      client[m.client]["jobNeedsBookingTotal"] += 1;
      staff["K2"]["averageJobNeedsBookingAge"] = this.averageStaffStat(
        age,
        staff["K2"]["averageJobNeedsBookingAge"]
      );
      staff[m.owner]["averageJobNeedsBookingAge"] = this.averageStaffStat(
        age,
        staff[m.owner]["averageJobNeedsBookingAge"]
      );
      client[m.client]["averageJobNeedsBookingAge"] = this.averageStaffStat(
        age,
        client[m.client]["averageJobNeedsBookingAge"]
      );
      staff["K2"]["jobNeedsBookingAges"] = [
        ...staff["K2"]["jobNeedsBookingAges"],
        age
      ];
      staff[m.owner]["jobNeedsBookingAges"] = [
        ...staff[m.owner]["jobNeedsBookingAges"],
        age
      ];
      client[m.client]["jobNeedsBookingAges"] = [
        ...client[m.client]["jobNeedsBookingAges"],
        age
      ];
    }

    if (m.isJob) {
      staff["K2"]["jobTotal"] += 1;
      staff[m.owner]["jobTotal"] += 1;
      client[m.client]["jobTotal"] += 1;
      staff["K2"]["averageJobAge"] = this.averageStaffStat(
        age,
        staff["K2"]["averageJobAge"]
      );
      staff[m.owner]["averageJobAge"] = this.averageStaffStat(
        age,
        staff[m.owner]["averageJobAge"]
      );
      client[m.client]["averageJobAge"] = this.averageStaffStat(
        age,
        client[m.client]["averageJobAge"]
      );
      staff["K2"]["jobAges"] = [...staff["K2"]["jobAges"], age];
      staff[m.owner]["jobAges"] = [...staff[m.owner]["jobAges"], age];
      client[m.client]["jobAges"] = [...client[m.client]["jobAges"], age];
    }

    if (!m.isJob) {
      staff["K2"]["leadTotal"] += 1;
      staff[m.owner]["leadTotal"] += 1;
      client[m.client]["leadTotal"] += 1;
      staff["K2"]["averageLeadAge"] = this.averageStaffStat(
        age,
        staff["K2"]["averageLeadAge"]
      );
      staff[m.owner]["averageLeadAge"] = this.averageStaffStat(
        age,
        staff[m.owner]["averageLeadAge"]
      );
      client[m.client]["averageLeadAge"] = this.averageStaffStat(
        age,
        client[m.client]["averageLeadAge"]
      );
      staff["K2"]["leadAges"] = [...staff["K2"]["leadAges"], age];
      staff[m.owner]["leadAges"] = [...staff[m.owner]["leadAges"], age];
      client[m.client]["leadAges"] = [...client[m.client]["leadAges"], age];
    }

    m.activities &&
      m.activities.forEach(a => {
        if (staff[a.responsible] === undefined)
          staff[a.responsible] = this.state.statSheet;
        // Check if activity is completed
        if (a.completed === "Yes") {
          staff["K2"]["completedActions"] += 1;
          staff[a.responsible]["completedActions"] += 1;
          client[m.client]["completedActions"] += 1;
          staff["K2"][
            "averageCompletedActionOverdueDays"
          ] = this.averageStaffStat(
            a.completedOverdueBy,
            staff["K2"]["averageCompletedActionOverdueDays"]
          );
          staff[a.responsible][
            "averageCompletedActionOverdueDays"
          ] = this.averageStaffStat(
            a.completedOverdueBy,
            staff[a.responsible]["averageCompletedActionOverdueDays"]
          );
          client[m.client][
            "averageCompletedActionOverdueDays"
          ] = this.averageStaffStat(
            a.completedOverdueBy,
            client[m.client]["averageCompletedActionOverdueDays"]
          );
          staff["K2"]["completedActionOverdueDays"] = [
            ...staff["K2"]["completedActionOverdueDays"],
            a.completedOverdueBy
          ];
          staff[a.responsible]["completedActionOverdueDays"] = [
            ...staff[a.responsible]["completedActionOverdueDays"],
            a.completedOverdueBy
          ];
          client[m.client]["completedActionOverdueDays"] = [
            ...client[m.client]["completedActionOverdueDays"],
            a.completedOverdueBy
          ];
        } else {
          var overdueDays = this.getDaysSinceDate(a.date);
          if (overdueDays > 0) {
            // Overdue Action
            staff["K2"]["overdueActions"] += 1;
            staff[a.responsible]["overdueActions"] += 1;
            client[m.client]["overdueActions"] += 1;
            staff["K2"]["averageActionOverdueDays"] = this.averageStaffStat(
              overdueDays,
              staff["K2"]["averageActionOverdueDays"]
            );
            staff[a.responsible][
              "averageActionOverdueDays"
            ] = this.averageStaffStat(
              overdueDays,
              staff[a.responsible]["averageActionOverdueDays"]
            );
            client[m.client][
              "averageActionOverdueDays"
            ] = this.averageStaffStat(
              overdueDays,
              client[m.client]["averageActionOverdueDays"]
            );
            staff["K2"]["actionOverdueDays"] = [
              ...staff["K2"]["actionOverdueDays"],
              overdueDays
            ];
            staff[m.owner]["actionOverdueDays"] = [
              ...staff[m.owner]["actionOverdueDays"],
              overdueDays
            ];
            client[m.client]["actionOverdueDays"] = [
              ...client[m.client]["actionOverdueDays"],
              overdueDays
            ];
          } else {
            // Action on target
            staff["K2"]["upcomingActions"] += 1;
            staff[a.responsible]["upcomingActions"] += 1;
            client[m.client]["upcomingActions"] += 1;
          }
        }
      });
  });

  this.setState({
    clientStats: client,
    staffStats: staff
  });
};

export const fetchCurrentJobState = ignoreCompleted => dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran fetchCurrentJobState`);
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
    // console.log('Jobs in current state: ' + Object.values(currentJobState).filter(job => job.isJob).length);
    // //console.log('Fetched Current Job State, ignoreCompleted: ' + ignoreCompleted);
    // console.log(currentJobState);
    dispatch({
      type: GET_CURRENT_JOB_STATE,
      payload: currentJobState,
    });
  });
};

export const saveCurrentJobState = state => dispatch => {
  console.log('Running save current state');
  sendSlackMessage(`${auth.currentUser.displayName} ran saveCurrentJobState`);
  // Sort into buckets to prevent firestore rejecting objects that are too large
  var sortedState = {};
  var allBuckets = [];
  var leadBuckets = {};
  buckets.forEach((bucket) => {
    sortedState[bucket] = {};
  });

  // console.log(state);

  state && Object.values(state).forEach((job) => {
    if (job.isJob) {
      var bucket = 'jobs';
      if (job.category.toLowerCase().includes('asbestos')) bucket = 'asbestos';
      if (job.category === 'Asbestos - Bulk ID') bucket = 'asbestosbulkid';
      if (job.category === 'Asbestos - Clearance') bucket = 'asbestosclearance';
      if (job.category === 'Asbestos - Background') bucket = 'asbestosbackground';
      if (job.category.toLowerCase().includes('meth')) bucket = 'meth';
      if (job.category === 'Workplace') bucket = 'workplace';
      if (job.category === 'Biological') bucket = 'bio';
      if (job.category === 'Stack Testing') bucket = 'stack';
      if (job.category === 'Noise') bucket = 'noise';
      sortedState[bucket][job.wfmID] = job;
    } else if (false) {
      // Stop saving leads to job state for now
      var bucket = 'leads' + job.wfmID.slice(-2);
      leadBuckets[bucket] = true;
      if (sortedState[bucket] === undefined) sortedState[bucket] = {};
      sortedState[bucket][job.wfmID] = job;
    }
  });

  // console.log(sortedState);
  allBuckets = buckets.concat(Object.keys(leadBuckets));

  let batch = firestore.batch();
  allBuckets.forEach((bucket) => {
    // console.log(sortedState[bucket]);
    console.log(Object.keys(sortedState[bucket]).length);
    batch.set(stateRef.doc("wfmstate").collection("current").doc(bucket), sortedState[bucket]);
  });
  batch.commit();
};

export const getCompletionDateFromHistory = (activity, history) => {
  if (activity.completed === "No") return activity;
  // Get only actions that are of activities being completed
  var actions = history.filter(
    item => item.type === "Activity" && item.detail.includes(activity.subject)
  );

  if (actions.length > 0) {
    activity.completeDate = actions[0].date;
    activity.completedOverdueBy = getDaysBetweenDates(
      activity.completeDate,
      activity.date
    );
  }
  return activity;
};

export const getAddressFromClient = (clientID, wfmClients) => {
  var client = wfmClients.filter(
    client => client.wfmID === clientID
  );
  if (client.length > 0) {
    var address =
      client[0].city === ""
        ? client[0].address
        : client[0].address + ", " + client[0].city;
    return address;
  } else {
    return "";
  }
};

export const handleGeocode = (address, clientAddress, lead, geocodes) => dispatch => {
  // console.log('Relying on lead to state.');
  // return;
  lead.clientAddress = clientAddress;
  // Pick either name or clientAddress to use as the geolocation
  var add = checkAddress(address, geocodes);
  if (add === "NULL") {
    add = checkAddress(clientAddress, geocodes);
  }

  // if (!lead.isJob) console.log(lead);

  if (geocodes[add] != undefined) {
    // console.log("Already there");
    // console.log(lead.wfmID);
    lead.geocode = geocodes[add];
    dispatch({type: ADD_TO_JOB_LIST, payload: lead, });
  } else {
    if (add !== "NULL") {
      let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${add}&components=country:NZ&key=${
        process.env.REACT_APP_GOOGLE_MAPS_KEY
      }`;
      console.log("Getting GEOCODE for " + add);
      fetch(path)
        .then(response => response.json())
        .then(response => {
          var gc = geocodes;
          // if (response.status = "ZERO_RESULTS") {
          //   lead.geocode = { address: "New Zealand" };
          // } else {
          if (response.results[0] === undefined) {
            // console.log('undefined response');
            // console.log(response);
            lead.geocode = { address: "New Zealand" };
          } else {
            gc[add] = simplifiedGeocode(response.results[0]);
            updateGeocodes(gc);
            lead.geocode = gc[add];
          }
          // console.log(lead.wfmID);
          dispatch({type: ADD_TO_JOB_LIST, payload: lead, });
          // return lead;
        });
    }
  }
};

export const collateJobsList = (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch => {
  console.log("COLLATING LEADS AND JOBS");
  // Add option to look up detailed information for each job
  var mappedJobs = {};
  let currentJobStateCopy = {...currentJobState};
  console.log(currentJobStateCopy);
  Object.values(currentJobState).filter((job) => job.wfmState === 'Completed').forEach(job => {
    mappedJobs[job.wfmID] = job;
  });
  // console.log(geocodes);
  // console.log(wfmJobs);
  // console.log(wfmLeads);
  // console.log(currentJobState);
  // console.log(currentState);

  // Convert jobs into a 'lead' type object
  wfmJobs.forEach(job => {
    // console.log(job);
    var today = moment().format('YYYY-MM-DD');
    var mappedJob = currentJobState[job.wfmID];
    delete currentJobStateCopy[job.wfmID];
    if (mappedJob !== undefined) {
      mappedJob.ownerID = job.managerID ? job.managerID : null;
      mappedJob.assigned = job.assigned ? job.assigned : null;
      if (mappedJob.nextActionType !== undefined) delete mappedJob.nextActionType;
      if (mappedJob.nextActionDate !== undefined) delete mappedJob.nextActionDate;
      if (mappedJob.nextActionOverdueBy !== undefined) delete mappedJob.nextActionOverdueBy;
      //
      // if (mappedJob.stateHistory && Object.keys(mappedJob.stateHistory)[0] < mappedJob.creationDate) {
      //   mappedJob.creationDate = Object.keys(mappedJob.stateHistory)[0];
      //   mappedJob.stateHistory[mappedJob.creationDate] = 'Job Started';
      // }

      let update = true;

      if (mappedJob.wfmState === 'Completed') {
        // Mapped job was incorrectly marked as completed
        // console.log(mappedJob);
        mappedJob.stateHistory && Object.keys(mappedJob.stateHistory).forEach(k => {
          if (mappedJob.stateHistory[k] === 'Completed') {
            // console.log(mappedJob.stateHistory);
            delete mappedJob.stateHistory[k];
            // console.log(mappedJob.stateHistory);
          }
        });
        // if (mappedJob.stateHistory && Object.keys(mappedJob.stateHistory).slice(-1)[0] && mappedJob.stateHistory[Object.keys(mappedJob.stateHistory).slice(-1)[0]] === job.wfmState) update = false;
      }

      // console.log(mappedJob.stateHistory);
      // console.log(Object.keys(mappedJob.stateHistory).slice(-1)[0]);

      if (mappedJob.stateHistory && Object.keys(mappedJob.stateHistory).slice(-1)[0] !== undefined &&
        mappedJob.stateHistory[Object.keys(mappedJob.stateHistory).slice(-1)[0]] === job.wfmState) update = false;

      mappedJob.wfmState = job.wfmState;

      if (update) {
        // Update mapped job
        // console.log('Update mapped job');
        // console.log(mappedJob);
        mappedJob.lastActionDate = today;
        mappedJob.stateHistory = {
          ...mappedJob.stateHistory,
          [today]: job.wfmState,
        };
      } else {
        mappedJob.lastActionDate = Object.keys(mappedJob.stateHistory).slice(-1)[0];
        // console.log(Object.keys(mappedJob.stateHistory).slice(-1)[0]);
      }

      // // Check state has changed
      // if (job.wfmState !== mappedJob.state) {
      //   // console.log(job.address & ': ' & job.wfmState & '(was ' & mappedJob.state & ')');
      //   mappedJob.lastActionDate = today;
      //   mappedJob.state = job.wfmState;
      //   mappedJob.stateHistory[today] = job.wfmState;
      // }

      // Check if address has changed
      // if (mappedJob.name !== job.address || mappedJob.geocode.address === "New Zealand") {
      if (mappedJob.name !== job.address) {
        console.log(mappedJob.name + '->' + job.address + ' is new, get new geocode');
        mappedJob.name = job.address;
        dispatch(handleGeocode(
          job.address,
          getAddressFromClient(job.clientID, wfmClients),
          mappedJob,
          geocodes,
        ));
      } else {
        mappedJobs = {
          ...mappedJobs,
          [job.wfmID]: mappedJob,
        };
      }
    } else {
      console.log('Making new job: ' + job['wfmID']);
      var newJob = {};
      newJob.wfmID = job.wfmID;
      newJob.client = job.client;
      newJob.clientID = job.clientID;
      newJob.name = job.address;
      newJob.owner = job.manager ? job.manager : null;
      newJob.ownerID = job.managerID ? job.managerID : null;
      newJob.jobNumber = job.jobNumber;
      newJob.assigned = job.assigned ? job.assigned : null;
      newJob.creationDate = today;
      newJob.category = job.wfmType;
      // lead.currentStatus = job.currentStatus;
      newJob.wfmState = job.wfmState;
      newJob.dueDate = job.dueDate;
      newJob.lastActionType = job.wfmState;
      newJob.lastActionDate = today;
      newJob.stateHistory = {
        [today]: job.wfmState,
      };
      newJob.isJob = true;
      console.log(newJob);
      dispatch(handleGeocode(
        job.address,
        getAddressFromClient(job.clientID, wfmClients),
        newJob,
        geocodes,
      ));
    }
  });

  wfmLeads.forEach(wfmLead => {
    var lead = currentJobState[wfmLead.wfmID];
    delete currentJobStateCopy[wfmLead.wfmID];
    // if (lead !== undefined) {
    //   // Map actions to history to get completion date of each action
    //   if (wfmLead.activities[0] === "NO PLAN!") {
    //     lead.urgentAction = "Add Milestones to Lead";
    //     lead.activities = [];
    //   } else if (wfmLead.history[0] === "No History") {
    //     lead.activities = [];
    //   } else {
    //     lead.activities = wfmLead.activities.map(activity =>
    //       getCompletionDateFromHistory(activity, wfmLead.history)
    //     );
    //   }
    //   var completedActivities = getCompletedActivities(lead.activities);
    //   lead.lastActionDate = getLastActionDateFromActivities(
    //     completedActivities,
    //     lead.creationDate
    //   );
    //   lead.lastActionType = getLastActionTypeFromActivities(
    //     completedActivities
    //   );
    //
    //   lead.nextActionType = getNextActionType(lead.activities);
    //   lead.nextActionDate = getNextActionDate(lead.activities);
    //
    //   // Check if address has changed
    //   if (lead.name !== wfmLead.name) {
    //     // //console.log(wfmLead.name + ' is new, get new geocode');
    //     lead.name = wfmLead.name;
    //     dispatch(handleGeocode(
    //       wfmLead.name,
    //       getAddressFromClient(wfmLead.clientID, wfmClients),
    //       lead,
    //       geocodes,
    //     ));
    //   } else {
    //     mappedJobs = {
    //       ...mappedJobs,
    //       [wfmLead.wfmID]: lead,
    //     };
    //   }
    // } else {
      // //console.log('Making new job: ' + wfmLead['wfmID']);
      lead = {};
      lead.wfmID = wfmLead.wfmID;
      lead.assigned = wfmLead.assigned ? wfmLead.assigned : null;
      lead.client = wfmLead.client;
      lead.clientID = wfmLead.clientID;
      lead.name = wfmLead.name;
      lead.description = wfmLead.description;
      lead.owner = wfmLead.owner ? wfmLead.owner : null;
      lead.jobNumber = "Lead";
      lead.creationDate = wfmLead.date;
      lead.category = wfmLead.category;
      lead.urgentAction = "";
      lead.value = wfmLead.value;
      if (wfmLead.history) {
        let historyArray = [];
        wfmLead.history.forEach(item => {
          historyArray.push({
            date: item.date ? dateOf(item.date) : null,
            detail: item.detail ? item.detail : null,
            staff: item.staff ? item.staff : null,
            type: item.type ? item.type : null,
          });
        });
        lead.history = historyArray;
      }

      // Map actions to history to get completion date of each action
      if (wfmLead.activities[0] === "NO PLAN!") {
        lead.urgentAction = "Add Milestones to Lead";
        lead.activities = [];
      } else if (wfmLead.history[0] === "No History") {
        lead.activities = [];
      } else {
        lead.activities = wfmLead.activities.map(activity =>
          getCompletionDateFromHistory(activity, wfmLead.history)
        );
      }
      let completedActivities = getCompletedActivities(lead.activities);

      lead.lastActionDate = getLastActionDateFromActivities(
        completedActivities,
        null
        // lead.creationDate
      );
      lead.lastActionType = getLastActionTypeFromActivities(
        completedActivities
      );

      // lead.averageCompletedActionOverdueDays = this.getAverageCompletedActionOverdueDays(
      //   lead.completedActivities
      // );
      lead.nextActionType = getNextActionType(lead.activities);
      lead.nextActionDate = getNextActionDate(lead.activities);
      // lead.nextActionOverdueBy = this.getNextActionOverdueBy(lead.activities);

      lead.isJob = false;

      // Get extra client information
      // lead.clientAddress = this.getAddressFromClient(wfmLead.clientID);
      // lead.geoCode = this.handleGeocode(wfmLead.name);

      dispatch(handleGeocode(
        wfmLead.name,
        getAddressFromClient(wfmLead.clientID, wfmClients),
        lead,
        geocodes,
      ));
    // }
  });

  // Catch jobs that are not in the current WFM jobs list but have not been marked as completed.
  // All current jobs and leads will have been deleted from the currentJobStateCopy so we only need to filter out the ones already marked as completed.
  var today = moment().format('YYYY-MM-DD');
  Object.values(currentJobStateCopy).filter((job) => job.isJob && job.wfmState !== "Completed").forEach((job) => {
    // console.log(job.wfmState);
    // console.log(job);
    job.lastActionDate = today;
    job.wfmState = 'Completed';
    if (job.stateHistory !== undefined) {
      job.stateHistory[today] = 'Completed';
    } else {
      job.stateHistory = {[today]: 'Completed'};
    }
    mappedJobs[job.wfmID] = job;
  });

  // console.log(mappedJobs);

  dispatch({
    type: GET_JOB_LIST,
    payload: mappedJobs,
  });
};

export const getWfmUrl = m => {
  var path;
  if (m.isJob) {
    path = `https://my.workflowmax.com/job/jobview.aspx?id=${m.wfmID}`;
  } else {
    path = `https://my.workflowmax.com/lead/view.aspx?id=${m.wfmID}`;
  }
  return path;
};

export const getWfmClientUrl = m => {
  return `https://practicemanager.xero.com/Client/${m.clientID}/Detail`;
}

export const getGoogleMapsUrl = m => {
  if (m.geocode)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURI(m.geocode.address)}&query_place_id=${m.geocode.place}`;
  else return `https://www.google.com/maps/search/?api=1&query=${encodeURI(m.name)}`;
}

export const onWatchJob = (job, me) => {
  if (job !== undefined && job !== null) {
    let newArray = [];
    if (me.watchedJobs === undefined) {
      newArray = [job];
    } else {
      let watchedJobs = [...me.watchedJobs];
      if (watchedJobs.includes(job)) {
        newArray = watchedJobs.filter(item => item !== job);
      } else {
        watchedJobs.push(job);
        newArray = watchedJobs;
      }
    }

    usersRef.doc(me.uid).update({watchedJobs: newArray});
  }
}

export const onWatchLead = (lead, me) => {
  if (lead !== undefined && lead !== null) {
    let newArray = [];
    if (me.watchedLeads === undefined) {
      newArray = [lead];
    } else {
      let watchedLeads = [...me.watchedLeads];
      if (watchedLeads.includes(lead)) {
        newArray = watchedLeads.filter(item => item !== lead);
      } else {
        watchedLeads.push(lead);
        newArray = watchedLeads;
      }
    }

    usersRef.doc(me.uid).update({watchedLeads: newArray});
  }
}

export const sendTimeSheetToWFM = (taskData, taskID, that) => {
  // console.log(taskData);
  // console.log(taskID);
  let assignUrl = `${process.env.REACT_APP_WFM_ROOT}job.api/assign?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`,
    timeUrl = `${process.env.REACT_APP_WFM_ROOT}time.api/add?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`;

    // Convert to XML
    let assignXML = `<Job><ID>${taskData.job}</ID><add id="${taskData.staff}" task="${taskID}" /></Job>`,
      timeXML = `<Timesheet><Job>${taskData.job}</Job><Task>${taskID}</Task><Staff>${taskData.staff}</Staff><Date>${taskData.day}</Date><Start>${taskData.startTime}</Start><End>${taskData.endTime}</End><Note>${taskData.note}</Note></Timesheet>`;

    // console.log(assignXML);
    // console.log(timeXML);

    fetch(assignUrl, { method: "PUT", body: assignXML})
      .then(results => results.text())
      .then(data => {
        // console.log(data);
        var json = xmlToJson(new DOMParser().parseFromString(data, "text/xml"));
        // console.log(json);
        if (json.Response.Status === "OK") {
        fetch(timeUrl, { method: "POST", body: timeXML})
          .then(results => results.text())
          .then(data => {
            var json = xmlToJson(new DOMParser().parseFromString(data, "text/xml"));
            // console.log(json.Response);
            if (json.Response.Status === "OK") {
              that.setState({
                status: 'Success',
              });
              // Show snack bar
            } else {
              // Post time sheet failed
              // console.log('Post time sheet failed');
            }
            // Show snack bar
          });
        } else {
          // Assign Failed
          // console.log('Assign Failed');
        }
      });
}

export const getTaskID = (taskData, that) => {
  // console.log(taskData);
  let assignUrl = `${process.env.REACT_APP_WFM_ROOT}job.api/assign?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`,
    timeUrl = `${process.env.REACT_APP_WFM_ROOT}time.api/add?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`,
    jobUrl = `${process.env.REACT_APP_WFM_ROOT}job.api/get/${taskData.job.trim()}?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`,
    taskUrl = `${process.env.REACT_APP_WFM_ROOT}job.api/task?apiKey=${process.env.REACT_APP_WFM_API}&accountKey=${process.env.REACT_APP_WFM_ACC}`,
    taskXML = `<Task><Job>${taskData.job}</Job><TaskID>${taskData.task}</TaskID><EstimatedMinutes>${taskData.minutes ? taskData.minutes : 0}</EstimatedMinutes></Task>`;

  // console.log(taskXML);

  // Get information about Job and read tasks list
  console.log(jobUrl);
  return fetch(jobUrl)
    .then(results => results.text())
    .then(data => {
      var json = xmlToJson(new DOMParser().parseFromString(data, "text/xml"));
      console.log(json);
      if (json.Response.Status === "OK") {
        // Check if task type is in the job. If it is, we will use that ID so the task isn't duplicated.
        let tasks = json.Response.Job.Tasks.Task;
        let taskID = null;
        // console.log(tasks);
        if (tasks !== undefined) {
          if (tasks instanceof Array) {
            // console.log('tasks instance of array');
            tasks.forEach(task => {
              // console.log(task);
              if (task.TaskID === taskData.task) {
                taskID = task.ID;
                // console.log(task);
              }
            });
          } else if (tasks instanceof Object) {
            console.log('tasks instance of object')
            if (tasks.TaskID === taskData.task) {
              taskID = tasks.ID;
              // console.log(tasks);
            }
          } else {
            tasks.forEach(task => {
              // console.log(task);
              if (task.TaskID === taskData.task) {
                taskID = task.ID;
                // console.log(task);
              }
            });
          }
        }
        if (!taskID) {
          // console.log('Task ID not found');
          // Task type was not found in job, will need to be added first
          fetch(taskUrl, { method: "POST", body: taskXML})
            .then(results => results.text())
            .then(data => {
              var json = xmlToJson(new DOMParser().parseFromString(data, "text/xml"));
              if (json.Response.Status === "OK") {
                // console.log(json.Response);
                sendTimeSheetToWFM(taskData, json.Response.ID, that);
              } else {
                // console.log('Adding task failed.');
                return {
                  status: json.Response.Status,
                  text: json.Response.ErrorDescription,
                };
              }
            });
        } else {
          sendTimeSheetToWFM(taskData, taskID, that);
        }
      } else {
        // console.log('job url failed');
        return {
          status: json.Response.Status,
          text: json.Response.ErrorDescription,
        };
      }
    });
}

export const gotoWFM = m => {
  // //console.log("GoTO");
  var path;
  if (m.isJob) {
    path = `https://my.workflowmax.com/job/jobview.aspx?id=${m.wfmID}`;
  } else {
    path = `https://my.workflowmax.com/lead/view.aspx?id=${m.wfmID}`;
  }
  var win = window.open(path, "_blank");
  win.focus();
};

export const getJobIcon = cat => {
  var img = "other";
  ["asbestos", "meth", "stack", "bio", "noise", "workplace"].map(i => {
    if (cat.toLowerCase().includes(i)) img = i;
  });
  var url = "http://my.k2.co.nz/icons/" + img + ".png";
  return url;
};

export const getJobColor = cat => {
  var col = "other";
  if (!cat) return "colorsJobOther";
  ["show all", "asbestos", "meth", "stack", "bio", "noise", "workplace"].map(
    i => {
      if (cat.toLowerCase().includes(i)) col = i;
    }
  );
  switch (col) {
    case "show all":
      return "colorsJobAll";
    case "asbestos":
      return "colorsJobAsbestos";
    case "meth":
      return "colorsJobMeth";
    case "stack":
      return "colorsJobStack";
    case "bio":
      return "colorsJobBio";
    case "noise":
      return "colorsJobNoise";
    case "workplace":
      return "colorsJobWorkplace";
    default:
      return "colorsJobOther";
  }
};

export const checkAddress = (address, geocodes) => {
  if (address === "") return "NULL";
  // if (address.trim().split(/\s+/).length < 2) return "NULL";

  var geo = geocodes[encodeURI(address)];

  // ignore all addresses that just return the country
  if (geo !== undefined && geo.address === "New Zealand") {
    // console.log(address);
    return "NULL";
  }

  // ignore all addresses with blackListed words
  var blacklist = [
    "acoustic",
    "air quality",
    "testing",
    "asbestos",
    "samples",
    "website",
    "query",
    "analysis",
    "pricing",
    "biological",
    "assessment",
    "dust",
    "monitoring",
    "lead",
    "asbetsos",
    "survey",
    "silica",
    "consulting",
    "biologial",
    "emission",
    "mould",
    "noise",
    "stack",
    "welding"
  ];

  var blackListed = false;

  blacklist.forEach(w => {
    if (address.toLowerCase().includes(w)) blackListed = true;
  });

  if (blackListed) return "NULL";

  return encodeURI(address);
};

export const simplifiedGeocode = g => {
  return {
    address: g.formatted_address,
    location: [g.geometry.location.lat, g.geometry.location.lng],
    locationType: g.geometry.location_type,
    place: g.place_id
  };
};

export const getCompletedActivities = activities => {
  var completedActivities = activities.filter(
    activity => activity.completed === "Yes"
  );
  return completedActivities
    .sort((a, b) => {
      return (
        new Date(a.completeDate).getTime() -
        new Date(b.completeDate).getTime()
      );
    })
    .reverse();
};

export const getUncompletedActivities = activities => {
  if (activities !== undefined) {
    var uncompletedActivities = activities.filter(
      activity => activity.completed === "No"
    );
    return uncompletedActivities
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      // .reverse();
  } else {
    return [];
  }
};

export const getLastActionDateFromActivities = (completedActivities, defaultDate) => {
  if (completedActivities.length === 0) return defaultDate;
  return completedActivities[0].completeDate;
};

export const getLastActionTypeFromActivities = completedActivities => {
  if (completedActivities.length === 0) return "Lead created";
  // console.log(completedActivities[0]);
  return completedActivities[0].subject;
};

export const getAverageCompletedActionOverdueDays = completedActivities => {
  if (completedActivities.length === 0) return 0;
  var sum = 0;
  var total = 0;
  completedActivities.forEach(a => {
    total = total + 1;
    sum = sum + a.completedOverdueBy;
  });
  return Math.floor(sum / total);
};

export const getNextActionType = activities => {
  var todo = getUncompletedActivities(activities);
  if (todo.length > 0) {
    return todo[0].subject;
  } else {
    return "Convert to job or add new action";
  }
};

export const getNextActionDate = activities => {
  var todo = getUncompletedActivities(activities);
  if (todo.length > 0) {
    return todo[0].date;
  } else {
    return 0;
  }
};

export const getNextActionOverdueBy = activities => {
  var todo = getUncompletedActivities(activities);
  if (todo.length > 0) {
    // Take one day away for leads.
    return getDaysSinceDate(todo[0].date);
  } else {
    return null;
  }
};

export const setLastTimeSaved = time => dispatch => {
  dispatch({
    type: SET_LAST_TIME_SAVED,
    payload: time,
  });
}

export const getStateString = m => {
  var stateStr = '';
  if (m.isJob) {
    if (m.wfmState === "Completed") stateStr = 'Job completed';
    else {
      var days = getDaysSinceDate(m.lastActionDate);
      if (days < 1) {
        stateStr = 'Changed state to ' + m.wfmState + ' today';
      } else if (days === 1) {
        stateStr = 'Changed state to ' + m.wfmState + ' yesterday';
      } else if (days < 7) {
        stateStr = 'Changed state to ' + m.wfmState + ' ' + days + ' days ago';
      } else {
        stateStr = 'Has not changed state in ' + days + ' days';
      }
    }
  } else {
    days = getNextActionOverdueBy(m.activities);
    if (!days) stateStr = 'All scheduled actions completed'
    else {
      if (days > 1) {
        stateStr = 'Actions overdue by ' + days + ' days';
      } else if (days === 1) {
        stateStr = 'Actions overdue by 1 day';
      } else if (days === 0) {
        stateStr = 'Actions due today';
      } else if (days === -1) {
        stateStr = 'Actions due tomorrow';
      } else {
        stateStr = 'Actions due in ' + (days*-1) + ' days';
      }
    }
  }
  return stateStr;
}

export const averageStaffStat = (value, average) => {
  // Averages in form { number of items, sum, average }

  if (average[0] > 0) {
    average[0] = average[0] + 1;
    average[1] = average[1] + value;
    average[2] = Math.floor(average[1] / average[0]);
  } else {
    average = [1, value, value];
  }

  return average;
};

export const getDefaultLetterAddress = (doc) => {
  // console.log(doc);
  if (doc) {
    if (doc.coverLetterAddress) return doc.coverLetterAddress;
    if (!doc.contact && !doc.clientDetails) {
      return `${doc.client}\n${doc.address}`;
    }
    let contact = doc.contact,
      client = doc.clientDetails,
      contactName = contact && (contact.name !== null || contact.name !== '') ? contact.name : null,
      contactPosition = contact && (contact.position !== null || contact.position !== '') ? contact.position : null,
      address = null,
      city = null,
      postcode = null;

    if (client && client.postalAddress) {
      address = client.postalAddress;
      city = client.postalCity;
      if (address && city && address.toLowerCase().includes(city.toLowerCase())) city = null;
      postcode = client.postalPostCode;
      address = `${address ? address : ''}${city ? '\n' + city : ''}${postcode ? ' ' + postcode : ''}`;
    } else if (client && client.address) {
      address = client.address;
      city = client.city;
      if (address && city && address.toLowerCase().includes(city.toLowerCase())) city = null;
      postcode = client.postcode;
      address = `${address ? address : ''}${city ? '\n' + city : ''}${postcode ? ' ' + postcode : ''}`;
    } else {
      address = doc.address;
    }

    // Don't add contact name if it is the same as the client name
    if (contactName) {
      let contactWords = contactName.split(' ');
      let contactInClientName = contactWords.length;
      contactWords.forEach(word => {
        if (doc.client.includes(word)) contactInClientName--;
      });
      if (contactInClientName === 0) {
        contactName = null;
        contactPosition = null;
      }
    }

    let letterAddress = `${contactName ? contactName + '\n' : ''}${contactPosition ? contactPosition + '\n' : ''}${doc.client ? doc.client + '\n' : ''}${address ? address : ''}`;
    return letterAddress.trim();
  } else {
    return '';
  }
}

export const getLeadHistoryDescription = (h, maxLength) => {
  let icon = null,
    title = '',
    body = null;
  if (h.type === "Lead") {
    icon = <LeadIcon />;
    // Can either by "Created by XXX" or "XXX marked this lead as Current"
    if (h.detail === "Created by WorkflowMax API") title = "Created from Website Enquiry";
    else title = h.detail;
  } else if (h.type === "Lost") {
    icon = <LostIcon />;
    // Always "XXX marked this lead as Lost"
    title = h.detail;
  } else if (h.type === "Activity") {
    icon = <ActivityIcon />;
    // All in the form '<ActivityName>' completed by <First> <Last>
    title = h.detail;
  } else if (h.type === "Email") {
    icon = <EmailIcon />;
    // console.log(maxLength);
    // Full email
    // Form is:
    // Date \n From \n To \n Subject \n Body
    let from = '', to = '', subject = '', splitEmail = [];
    splitEmail = h.detail.split(/\r\n|\n|\r/);
    from = splitEmail[1].slice(splitEmail[1].indexOf(':') + 1, splitEmail[1].indexOf('['));
    to = splitEmail[2].slice(splitEmail[2].indexOf(':') + 1, splitEmail[2].indexOf('['));
    if (to.includes('dropbox')) to = 'EmailMyJob';
    if (splitEmail[3].includes('Cc:')) {
      subject = splitEmail[4].slice(splitEmail[4].indexOf(':') + 1);
      body = splitEmail.slice(5).join('\n');
    } else {
      subject = splitEmail[3].slice(splitEmail[3].indexOf(':') + 1);
      body = splitEmail.slice(5).join('\n');
    }
    title = `${from} emailed ${to}: ${subject}`;
    if (maxLength && body.length > maxLength) body = `${body.substring(0, maxLength)}...`;
  } else if (h.type === "Note") {
    icon = <NoteIcon />
    title = `Note from ${h.staff}`;
    body = h.detail;
    if (maxLength && body.length > maxLength) body = `${body.substring(0, maxLength)}...`;
  }

  return {
    title,
    body,
    icon,
  }
}
