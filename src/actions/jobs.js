import {
  EDIT_MODAL_DOC,
  SET_MODAL_ERROR,
  SAVE_WFM_STATS,
  SAVE_WFM_ITEMS,
  GET_GEOCODES,
  ADD_TO_GEOCODES,
  GET_WFM_JOBS,
  GET_WFM_JOB,
  GET_WFM_LEADS,
  GET_WFM_CONTACT,
  GET_WFM_CLIENTS,
  GET_JOB_LIST,
  ADD_TO_JOB_LIST,
  GET_CURRENT_JOB_STATE,
  RESET_JOBS,
} from "../constants/action-types";
import moment from "moment";
import {
  firestore,
  auth,
  stateRef,
} from "../config/firebase";
import { xmlToJson } from "../config/XmlToJson";
import {
  sendSlackMessage,
  dateOf,
  getDaysBetweenDates,
  getDaysSinceDate,
} from "./helpers";
// import assetData from "./assetData.json";

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

export const syncJobWithWFM = (jobNumber, createUid) => async dispatch => {
  sendSlackMessage(`${auth.currentUser.displayName} ran syncJobWithWFM`);
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

export const saveGeocodes = geocodes => dispatch => {
  console.log(geocodes);
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
export const analyseJobHistory = () => {
  sendSlackMessage(`${auth.currentUser.displayName} ran analyseJobHistory`);
  // vars
  console.log('Running job history');
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
    .collection("states")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // console.log(doc);
        // Loop through each day of the saved states
        console.log(doc.id);
        var state = doc.data()['state'];
        // console.log(state);
        // Loop through current job map and check if any are missing from this state (e.g. they have been completed since the last state)
        if (state.length > 0) {
          buckets.forEach((bucket) => {
            if (jobMap[bucket] !== undefined) {
              Object.values(jobMap[bucket]).forEach((job) => {
                if (job.state !== 'Completed' && state.filter((stateJob) => stateJob.wfmID === job.wfmID).length === 0) {
                  // console.log(job);
                  // Job or lead has been completed
                  jobMap[bucket][job.wfmID]['state'] = 'Completed';
                  jobMap[bucket][job.wfmID]['completionDate'] = doc.id;
                  jobMap[bucket][job.wfmID]['lastActionDate'] = doc.id;
                  jobMap[bucket][job.wfmID]['stateHistory'] = {
                    ...jobMap[bucket][job.wfmID]['stateHistory'],
                    [doc.id]: 'Completed',
                  };


                  if (job.wfmID === "38030211") {
                    console.log(job.state);
                    console.log(jobMap[bucket][job.wfmID].state);
                    console.log(jobMap[bucket][job.wfmID]);
                  }

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
          // console.log(job);
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

                if (job.wfmID === "38030211") {
                  console.log(job.state);
                  console.log(mappedJob.state);
                  console.log(mappedJob);
                }
              }
              if (job.geocode !== mappedJob.geocode) {
                if ((job.geocode && job.geocode.address === "New Zealand") || (mappedJob.geocode && mappedJob.geocode.address === "New Zealand")) {
                  if (mappedJob.geocode.address === "New Zealand" && job.geocode.address !== "New Zealand") {
                    mappedJob.geocode = job.geocode;
                    // console.log(mappedJob);
                    // console.log(jobMap[bucket][job.wfmID]);
                  }
                }
              }
              // Add to mapped jobs
              // jobMap[bucket][job.wfmID] = mappedJob;
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
            var bucket = 'leads' + job.wfmID.slice(-2);
            if (jobCategorys['leads'] !== undefined) {
              jobCategorys['leads'] = jobCategorys['leads'] + 1;
            } else {
              jobCategorys['leads'] = 1;
            }
            // Talley how many jobs in each category (not necessary)
            if (jobCategorys[bucket] !== undefined) {
              jobCategorys[bucket] = jobCategorys[bucket] + 1;
              leadBuckets[bucket] = true;
            } else {
              jobCategorys[bucket] = 1;
            }
            if (jobMap[bucket] === undefined) jobMap[bucket] = {};
            jobMap[bucket][job.wfmID] = job;
          }
        });
      });
      // console.log(jobCategorys);
      allBuckets = buckets.concat(Object.keys(leadBuckets));
      // console.log(leadBuckets);
      buckets.forEach((bucket) => console.log(jobMap[bucket]));
      allBuckets.forEach((bucket) => {
        // console.log(jobMap[bucket]);
        stateRef.doc("wfmstate").collection("current").doc(bucket).set(jobMap[bucket]);
      });
      stateRef.doc("wfmstate").collection("timeline").doc('completion').set(completionMap);
      stateRef.doc("wfmstate").collection("timeline").doc('creation').set(creationMap);
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
    console.log(currentJobState);
    // //console.log('Fetched Current Job State, ignoreCompleted: ' + ignoreCompleted);
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
  const buckets = ['jobs','asbestos','asbestosbulkid','asbestosclearance','asbestosbackground','workplace','meth','bio','stack','noise'];
  var allBuckets = [];
  var leadBuckets = {};
  buckets.forEach((bucket) => {
    sortedState[bucket] = {};
  });

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
    } else {
      var bucket = 'leads' + job.wfmID.slice(-2);
      leadBuckets[bucket] = true;
      if (sortedState[bucket] === undefined) sortedState[bucket] = {};
      sortedState[bucket][job.wfmID] = job;
    }
  });

  console.log(sortedState);
  allBuckets = buckets.concat(Object.keys(leadBuckets));

  allBuckets.forEach((bucket) => {
    // console.log(sortedState[bucket]);
    // console.log(Object.keys(sortedState[bucket]).length);
    stateRef.doc("wfmstate").collection("current").doc(bucket).set(sortedState[bucket]);
  });
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
  console.log('Relying on lead to state.');
  // return;
  lead.clientAddress = clientAddress;
  // Pick either name or clientAddress to use as the geolocation
  var add = checkAddress(address, geocodes);
  if (add === "NULL") {
    add = checkAddress(clientAddress, geocodes);
  }

  if (geocodes[add] != undefined) {
    // console.log("Already there");
    lead.geocode = geocodes[add];
    dispatch({type: ADD_TO_JOB_LIST, payload: lead, });
  } else {
    if (add !== "NULL") {
      let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${add}&components=country:NZ&key=${
        process.env.REACT_APP_GOOGLE_MAPS_KEY
      }`;
      // console.log("Getting GEOCODE for " + add);
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
          dispatch({type: ADD_TO_JOB_LIST, payload: lead, });
          return lead;
        });
    }
  }
};

export const collateJobsList = (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch => {
  console.log("COLLATING LEADS AND JOBS");
  var mappedJobs = {};

  var completedJobs = Object.values(currentJobState).filter((job) => job.state === 'Completed');
  var completedJobMap = {};
  completedJobs.forEach(job => {
    completedJobMap[job.wfmID] = job;
  })
  var currentState = {...currentJobState};
  // console.log(geocodes);
  // console.log(wfmJobs);
  // console.log(wfmLeads);
  // console.log(currentJobState);

  // Convert jobs into a 'lead' type object
  wfmJobs.forEach(job => {
    // console.log(job);
    var today = moment().format('YYYY-MM-DD');
    var mappedJob = currentState[job.wfmID];
    console.log(mappedJob);
    delete currentState[job.wfmID];
    if (mappedJob !== undefined) {
      if (mappedJob.nextActionType !== undefined) delete mappedJob.nextActionType;
      if (mappedJob.nextActionDate !== undefined) delete mappedJob.nextActionDate;
      if (mappedJob.nextActionOverdueBy !== undefined) delete mappedJob.nextActionOverdueBy;

      if (mappedJob.stateHistory && Object.keys(mappedJob.stateHistory)[0] < mappedJob.creationDate) {
        mappedJob.creationDate = Object.keys(mappedJob.stateHistory)[0];
        mappedJob.stateHistory[mappedJob.creationDate] = 'Job Started';
      }

      // Check state has changed
      if (job.wfmState !== mappedJob.state) {
        console.log(job.address & ': ' & job.state & '(was ' & mappedJob.state & ')');
        mappedJob.lastActionDate = today;
        mappedJob.state = job.wfmState;
        mappedJob.stateHistory[today] = job.wfmState;
      }

      // Check if address has changed
      // if (mappedJob.name !== job.address || mappedJob.geocode.address === "New Zealand") {
      if (mappedJob.name !== job.address) {
        console.log(mappedJob.name + '->' + job.address + ' is new, get new geocode');
        mappedJob.name = job.address;
        handleGeocode(
          job.address,
          getAddressFromClient(job.clientID, wfmClients),
          mappedJob,
          geocodes,
        );
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
      newJob.owner = job.manager;
      newJob.jobNumber = job.jobNumber;
      newJob.creationDate = today;
      newJob.category = job.wfmType;
      // lead.currentStatus = job.currentStatus;
      newJob.state = job.wfmState;
      newJob.dueDate = job.dueDate;
      newJob.lastActionType = job.wfmState;
      newJob.lastActionDate = today;
      newJob.stateHistory = {
        [today]: 'Job created',
        [today]: job.wfmState,
      };
      newJob.isJob = true;

      handleGeocode(
        job.address,
        getAddressFromClient(job.clientID, wfmClients),
        newJob,
        geocodes,
      );
    }
  });

  wfmLeads.forEach(wfmLead => {
    var lead = currentState[wfmLead.wfmID];
    delete currentState[wfmLead.wfmID];
    if (lead !== undefined) {
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
      var completedActivities = getCompletedActivities(lead.activities);
      lead.lastActionDate = getLastActionDateFromActivities(
        completedActivities,
        lead.creationDate
      );
      lead.lastActionType = getLastActionTypeFromActivities(
        completedActivities
      );

      lead.nextActionType = getNextActionType(lead.activities);
      lead.nextActionDate = getNextActionDate(lead.activities);

      // Check if address has changed
      if (lead.name !== wfmLead.name) {
        // //console.log(wfmLead.name + ' is new, get new geocode');
        lead.name = wfmLead.name;
        handleGeocode(
          wfmLead.name,
          getAddressFromClient(wfmLead.clientID, wfmClients),
          lead,
          geocodes,
        );
      } else {
        mappedJobs = {
          ...mappedJobs,
          [wfmLead.wfmID]: lead,
        };
      }
    } else {
      // //console.log('Making new job: ' + wfmLead['wfmID']);
      lead = {};
      lead.wfmID = wfmLead.wfmID;
      lead.client = wfmLead.client;
      lead.name = wfmLead.name;
      lead.owner = wfmLead.owner;
      lead.jobNumber = "Lead";
      lead.creationDate = wfmLead.date;
      lead.category = wfmLead.category;
      lead.urgentAction = "";
      lead.value = wfmLead.value;

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
      completedActivities = getCompletedActivities(lead.activities);

      lead.lastActionDate = getLastActionDateFromActivities(
        completedActivities,
        lead.creationDate
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

      handleGeocode(
        wfmLead.name,
        getAddressFromClient(wfmLead.clientID, wfmClients),
        lead,
        geocodes,
      );
    }
  });

  var recentlyCompleted = Object.values(currentState).filter((job) => job.state !== 'Completed');
  var recentlyCompletedMap = {};
  var today = moment().format('YYYY-MM-DD');
  recentlyCompleted.forEach((job) => {
    job.lastActionDate = today;
    job.state = 'Completed';
    if (job.stateHistory !== undefined) {
      job.stateHistory[today] = 'Completed';
    } else {
      job.stateHistory = {[today]: 'Completed'};
    }
    recentlyCompletedMap[job.wfmID] = job;
  });

  let jobList = {
    ...mappedJobs,
    ...completedJobs,
    ...recentlyCompletedMap,
  }

  // console.log(jobList);

  dispatch({
    type: GET_JOB_LIST,
    payload: jobList,
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
  if (!cat) return "#6fa1b6";
  ["show all", "asbestos", "meth", "stack", "bio", "noise", "workplace"].map(
    i => {
      if (cat.toLowerCase().includes(i)) col = i;
    }
  );
  switch (col) {
    case "show all":
      return "#555";
    case "asbestos":
      return "#7d6d26";
    case "meth":
      return "#ff0065";
    case "stack":
      return "#e33714";
    case "bio":
      return "#87cc14";
    case "noise":
      return "#995446";
    case "workplace":
      return "#a2539c";
    default:
      return "#6fa1b6";
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
    return getDaysSinceDate(todo[0].date);
  } else {
    return 0;
  }
};

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
