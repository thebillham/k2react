import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import ListItem from "@material-ui/core/ListItem";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Input from "@material-ui/core/Input";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import moment from "moment";
import { auth, usersRef } from "../../config/firebase";
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
} from "../../actions/local";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

const mapStyles = {
  marginTop: 20,
  flexGrow: 1,
  overflow: "auto",
  // width: '90%',
  height: "100%"
};

const mapStateToProps = state => {
  return {
    wfmJobs: state.local.wfmJobs,
    wfmLeads: state.local.wfmLeads,
    wfmClients: state.local.wfmClients,
    currentJobState: state.local.currentJobState,
    geocodes: state.local.geocodes,
    wfmItems: state.local.wfmItems,
    wfmStats: state.local.wfmStats,
    me: state.local.me,
    filter: state.display.filterMap,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    fetchCurrentJobState: ignoreCompleted => dispatch(fetchCurrentJobState(ignoreCompleted)),
    saveCurrentJobState: state => dispatch(saveCurrentJobState(state)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
  };
};

class JobMap extends React.Component {
  constructor(props) {
    super(props);

    // Set up stat sheet for new names
    // Averages in form { number of items, sum, average }
    var statSheet = {
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

    this.state = {
      leads: [],
      tabValue: 0,
      statSheet: statSheet,
      staffStats: {
        K2: statSheet
      },
      clientStats: {},
      activeMarker: {},
      showingInfoWindow: false,
      m: {},
      geocodeCount: 0,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.wfmJobs !== nextProps.wfmJobs) return true;
    if (this.props.wfmLeads !== nextProps.wfmLeads) return true;
    if (this.props.filter !== nextProps.filter) return true;
    // if (this.state.leads !== nextState.leads) return true;
    if (this.state.m !== nextState.m) return true;
    if (this.state.modal !== nextState.modal) return true;
    if (this.state.jobModal !== nextState.jobModal) return true;
    if (this.state.activeMarker !== nextState.activeMarker) return true;
    if (this.state.showingInfoWindow !== nextState.showingInfoWindow) return true;
    return false;
  }

  UNSAFE_componentWillMount() {
    if (this.state.leads.length === 0) {
      if (this.props.wfmJobs.length === 0) this.props.fetchWFMJobs();
      if (this.props.wfmLeads.length === 0) this.props.fetchWFMLeads();
      if (this.props.wfmClients.length === 0) this.props.fetchWFMClients();
      this.props.fetchCurrentJobState(false);
      if(this.props.geocodes === undefined) this.props.fetchGeocodes();
    }
  }

  componentWillUnmount() {
    // Object.keys(this.state.leads).forEach(lead => {
    //   if (lead.wfmState) console.log(lead.wfmState);
    // });
    // console.log(this.state.leads);
    // console.log(this.state.leads.filter((lead) => (lead.wfmState != 'Completed' && lead.state != 'Completed')));
    this.props.saveWFMItems(this.state.leads.filter((lead) => (lead.wfmState != 'Completed' && lead.state != 'Completed')));
    this.props.saveCurrentJobState(this.state.leads);
    this.props.saveGeocodes(this.props.geocodes);
    // this.props.saveStats({
    //   staff: this.state.staffStats,
    //   clients: this.state.clientStats
    // });
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
    if (value === 3) this.computeStats();
  };

  computeStats = () => {
    var client = {};
    var staff = {};
    staff["K2"] = { ...this.state.statSheet };

    this.state.leads.forEach(m => {
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
    // //console.log("Computed stats");
    // //console.log(client);
    // //console.log(staff);

    this.setState({
      clientStats: client,
      staffStats: staff
    });
  };

  displayTimeDifference = date => {
    var timeDifference = new Date() - new Date(date);
    var divideBy = {
      d: 86400000,
      m: 2629800000,
      y: 31557600000
    };
    var years = Math.floor(timeDifference / divideBy["y"]);
    timeDifference = timeDifference % divideBy["y"];
    var months = Math.floor(timeDifference / divideBy["m"]);
    timeDifference = timeDifference % divideBy["m"];
    var days = Math.floor(timeDifference / divideBy["d"]);
    let y = years + " years ";
    let m = months + " months ";
    let d = days + " days";
    if (years === 1) y = years + " year ";
    if (months === 1) m = months + " month ";
    if (days === 1) d = days + " day";
    if (years === 0) y = "";
    if (months === 0) m = "";
    return y + m + d;
  };

  getDaysSinceDate = date => {
    var timeDifference = new Date() - new Date(date);
    var divideBy = 86400000;
    var days = Math.floor(timeDifference / divideBy);

    return days;
  };

  getDaysBetweenDates = (d1, d2) => {
    var timeDifference = new Date(d1) - new Date(d2);
    var divideBy = 86400000;
    var days = Math.floor(timeDifference / divideBy);

    return days;
  };

  getCompletionDateFromHistory = (activity, history) => {
    if (activity.completed === "No") return activity;
    // Get only actions that are of activities being completed
    var actions = history.filter(
      item => item.type === "Activity" && item.detail.includes(activity.subject)
    );

    if (actions.length > 0) {
      activity.completeDate = actions[0].date;
      activity.completedOverdueBy = this.getDaysBetweenDates(
        activity.completeDate,
        activity.date
      );
    }
    return activity;
  };

  getAddressFromClient = clientID => {
    var client = this.props.wfmClients.filter(
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

  handleGeocode = (address, clientAddress, lead) => {
    lead.clientAddress = clientAddress;
    // Pick either name or clientAddress to use as the geolocation
    var add = this.checkAddress(address);
    if (add === "NULL") {
      add = this.checkAddress(clientAddress);
    }

    if (this.props.geocodes[add] != undefined) {
      // console.log("Already there");
      lead.geocode = this.props.geocodes[add];
      this.state.leads = [...this.state.leads, lead];
    } else {
      if (this.state.geocodeCount < 100 && add !== "NULL") {
        this.setState({
          geocodeCount: this.state.geocodeCount + 1,
        });

        let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${add}&components=country:NZ&key=${
          process.env.REACT_APP_GOOGLE_MAPS_KEY
        }`;
        // console.log("Getting GEOCODE for " + add);
        fetch(path)
          .then(response => response.json())
          .then(response => {
            var gc = this.props.geocodes;
            // if (response.status = "ZERO_RESULTS") {
            //   lead.geocode = { address: "New Zealand" };
            // } else {
            if (response.results[0] === undefined) {
              // console.log('undefined response');
              // console.log(response);
              lead.geocode = { address: "New Zealand" };
            } else {
              gc[add] = this.simplifiedGeocode(response.results[0]);
              this.props.updateGeocodes(gc);
              lead.geocode = gc[add];
            }
            this.addLeadToState(lead);
            return lead;
          });
      }
    }
  };

  addLeadToState = lead => {
    // //console.log('Add lead');
    // //console.log(lead);
    this.setState({
      leads: [...this.state.leads, lead]
    });
  }

  checkAddress = address => {
    if (address === "") return "NULL";
    // if (address.trim().split(/\s+/).length < 2) return "NULL";

    var geo = this.props.geocodes[encodeURI(address)];

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

  simplifiedGeocode = g => {
    return {
      address: g.formatted_address,
      location: [g.geometry.location.lat, g.geometry.location.lng],
      locationType: g.geometry.location_type,
      place: g.place_id
    };
  };

  getCompletedActivities = activities => {
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

  getUncompletedActivities = activities => {
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

  getLastActionDateFromActivities = (completedActivities, defaultDate) => {
    if (completedActivities.length === 0) return defaultDate;
    return completedActivities[0].completeDate;
  };

  getLastActionTypeFromActivities = completedActivities => {
    if (completedActivities.length === 0) return "Lead created";
    return completedActivities[0].subject;
  };

  getAverageCompletedActionOverdueDays = completedActivities => {
    if (completedActivities.length === 0) return 0;
    var sum = 0;
    var total = 0;
    completedActivities.forEach(a => {
      total = total + 1;
      sum = sum + a.completedOverdueBy;
    });
    return Math.floor(sum / total);
  };

  getNextActionType = activities => {
    var todo = this.getUncompletedActivities(activities);
    if (todo.length > 0) {
      return todo[0].subject;
    } else {
      return "Convert to job or add new action";
    }
  };

  getNextActionDate = activities => {
    var todo = this.getUncompletedActivities(activities);
    if (todo.length > 0) {
      return todo[0].date;
    } else {
      return 0;
    }
  };

  getNextActionOverdueBy = activities => {
    var todo = this.getUncompletedActivities(activities);
    if (todo.length > 0) {
      return this.getDaysSinceDate(todo[0].date);
    } else {
      return 0;
    }
  };

  averageStaffStat = (value, average) => {
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

  openNoLocation = () => {
    this.setState({
      modal: "nolocation"
    });
  };

  openLeadsModal = () => {
    this.setState({
      modal: "jobleads"
    });
  }

  openJobModal = m => {
    this.setState({
      jobModal: m
    });
  };

  // Collate Jobs (need booking) and Leads into a set of data that can be displayed nicely
  collateLeadsData = () => {
    // //console.log(this.props.currentJobState);
    // //console.log('Jobs length');
    // console.log('Jobs: ' + this.props.wfmJobs.length);
    // console.log('Leads: ' + this.props.wfmLeads.length)
    // //console.log(this.props.wfmJobs.length + this.props.wfmLeads.length);
    // var staffStats = { K2: this.state.statSheet };
    // var clientStats = {};

    // //console.log("COLLATING LEADS AND JOBS");
    var mappedJobs = [];

    var completedJobs = Object.values(this.props.currentJobState).filter((job) => job.state === 'Completed');
    var currentState = {...this.props.currentJobState};

    // console.log(currentState);

    // Convert jobs into a 'lead' type object
    this.props.wfmJobs.forEach(job => {
      var today = moment().format('YYYY-MM-DD');
      var mappedJob = currentState[job.wfmID];
      // console.log(job.wfmID);
      // console.log(mappedJob);
      delete currentState[job.wfmID];
      if (mappedJob !== undefined) {
        // Add all mapped jobs and lead to an array and then set state
        // Then go ahead with sorting the new jobs and leads
        // Update state history of job

        if (mappedJob.nextActionType !== undefined) delete mappedJob.nextActionType;
        if (mappedJob.nextActionDate !== undefined) delete mappedJob.nextActionDate;
        if (mappedJob.nextActionOverdueBy !== undefined) delete mappedJob.nextActionOverdueBy;

        if (mappedJob.stateHistory && Object.keys(mappedJob.stateHistory)[0] < mappedJob.creationDate) {
          mappedJob.creationDate = Object.keys(mappedJob.stateHistory)[0];
          mappedJob.stateHistory[mappedJob.creationDate] = 'Job Started';
        }

        // Check state has changed
        if (job.wfmState !== mappedJob.state) {
          // //console.log(job.address & ': ' & job.state & '(was ' & mappedJob.state & ')');
          mappedJob.lastActionDate = today;
          mappedJob.state = job.wfmState;
          mappedJob.stateHistory[today] = job.wfmState;
        }

        // Check if address has changed
        // if (mappedJob.name !== job.address || mappedJob.geocode.address === "New Zealand") {
        if (mappedJob.name !== job.address) {
          console.log(mappedJob.name + '->' + job.address + ' is new, get new geocode');
          mappedJob.name = job.address;
          this.handleGeocode(
            job.address,
            this.getAddressFromClient(job.clientID),
            mappedJob,
          );
        } else {
          mappedJobs = [...mappedJobs, mappedJob];
        }
      } else {
        // //console.log('Making new job: ' + job['wfmID']);
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

        this.handleGeocode(
          job.address,
          this.getAddressFromClient(job.clientID),
          newJob,
        );
      }
    });

    this.props.wfmLeads.forEach(wfmLead => {
      var lead = currentState[wfmLead.wfmID];
      delete currentState[wfmLead.wfmID];
      if (lead !== undefined) {
        // Update state history of job
        // if(mappedJob.nextActionDate == undefined) {
        //   mappedJob.nextActionDate = this.getNextActionDate(wfmLead.activities);
        // }

        // Map actions to history to get completion date of each action
        if (wfmLead.activities[0] === "NO PLAN!") {
          lead.urgentAction = "Add Milestones to Lead";
          lead.activities = [];
        } else if (wfmLead.history[0] === "No History") {
          lead.activities = [];
        } else {
          lead.activities = wfmLead.activities.map(activity =>
            this.getCompletionDateFromHistory(activity, wfmLead.history)
          );
        }
        var completedActivities = this.getCompletedActivities(lead.activities);
        lead.lastActionDate = this.getLastActionDateFromActivities(
          completedActivities,
          lead.creationDate
        );
        lead.lastActionType = this.getLastActionTypeFromActivities(
          completedActivities
        );

        lead.nextActionType = this.getNextActionType(lead.activities);
        lead.nextActionDate = this.getNextActionDate(lead.activities);

        // Check if address has changed
        if (lead.name !== wfmLead.name) {
          // //console.log(wfmLead.name + ' is new, get new geocode');
          lead.name = wfmLead.name;
          this.handleGeocode(
            wfmLead.name,
            this.getAddressFromClient(wfmLead.clientID),
            lead,
          );
        } else {
          mappedJobs = [...mappedJobs, lead];
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
            this.getCompletionDateFromHistory(activity, wfmLead.history)
          );
        }
        completedActivities = this.getCompletedActivities(lead.activities);

        lead.lastActionDate = this.getLastActionDateFromActivities(
          completedActivities,
          lead.creationDate
        );
        lead.lastActionType = this.getLastActionTypeFromActivities(
          completedActivities
        );

        // lead.averageCompletedActionOverdueDays = this.getAverageCompletedActionOverdueDays(
        //   lead.completedActivities
        // );
        lead.nextActionType = this.getNextActionType(lead.activities);
        lead.nextActionDate = this.getNextActionDate(lead.activities);
        // lead.nextActionOverdueBy = this.getNextActionOverdueBy(lead.activities);

        lead.isJob = false;

        // Get extra client information
        // lead.clientAddress = this.getAddressFromClient(wfmLead.clientID);
        // lead.geoCode = this.handleGeocode(wfmLead.name);

        this.handleGeocode(
          wfmLead.name,
          this.getAddressFromClient(wfmLead.clientID),
          lead
        );
      }
    });

    var recentlyCompleted = Object.values(currentState).filter((job) => job.state !== 'Completed');
    var today = moment().format('YYYY-MM-DD');
    recentlyCompleted.forEach((job) => {
      // //console.log('Recently completed');
      // //console.log(job);
      job.lastActionDate = today;
      job.state = 'Completed';
      if (job.stateHistory !== undefined) {
        job.stateHistory[today] = 'Completed';
      } else {
        job.stateHistory = {[today]: 'Completed'};
      }
    });

    this.setState({
      leads: [
        ...this.state.leads,
        ...mappedJobs,
        ...completedJobs,
        ...recentlyCompleted,
      ],
    });
  };

  filterSet = (chip, type) => {
    var filterVar = 'filter' + type;
    var filterOnVar = 'filterOn' + type;
    let filter = chip;
    let filterOn = true;
    if (this.props.filter[filterVar] === chip) {
      filter = '';
      filterOn = false;
    }

    let newFilter = {
      ...this.props.filter,
      [filterVar]: filter,
      [filterOnVar]: filterOn,
    };

    this.props.filterMap(newFilter);
  }

  filterLabels = m => {
    if (m && m.geocode && m.geocode.address !== "New Zealand") {
      if (this.applyFilters(m)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  resetFilter = () => {
    this.props.filterMapReset();
  }

  applyModalFilters = (m, nolocation) => {
    if ((this.state.modal === "nolocation" || nolocation) && m && m.geocode && m.geocode.address !== "New Zealand") return false;
      else return (this.applyFilters(m));
  }

  applyFilters = m => {
    if (!this.props.filter.filterViewCompleted && m.state === 'Completed') return false;
    if (!this.props.filter.filterK2Jobs && m.client === 'K2 Environmental Ltd') return false;

    // Simplify categories and states
    var category = m.category.toLowerCase();
    if (category.includes('asbestos')) category = 'Asbestos';
      else if (category.includes('meth')) category = 'Meth';
      else if (category.includes('stack')) category = 'Stack';
      else if (category.includes('noise')) category = 'Noise';
      else if (category.includes('bio')) category = 'Bio';
      else if (category.includes('workplace')) category = 'Workplace';
      else category = 'Other';

    var state = m.state !== undefined ? m.state.toLowerCase() : 'Lead';
    if (!m.isJob) state = 'Lead';
      else if (state === 'completed') state = 'Completed';
      else if (state === 'needs booking') state = 'Needs Booking';
      else if (state === 'planned') state = 'Planned';
      else if (state === 'in progress') state = 'Site Work';
      else if ("waiting for resultswaiting on lab unbundlewaiting on lab amendment".includes(state)) state = 'Lab';
      else if ("needs writingneeds finishingbeing writtenready to be checkedbeing checkedbeen checked, needs fixingready for ktpbeing ktp'dktped, actions needed".includes(state)) state = 'Report';
      else state = 'Admin';

    // Category
    if (
      this.props.filter.filterOnCategory &&
      this.props.filter.filterCategory !== category
    )
      return false;

    // Job state
    if (
      this.props.filter.filterOnState &&
      this.props.filter.filterState !== state
    )
      return false;

    // Job or lead
    if (
      this.props.filter.filterOnJobLead &&
      ((this.props.filter.filterJobLead === 'Jobs' && !m.isJob) ||
      (this.props.filter.filterJobLead === 'Leads' && m.isJob))
    )
      return false;

    // Creation date
    if (this.props.filter.filterCreatedInTheLast &&
      this.getDaysSinceDate(m.creationDate) >= this.props.filter.createdInTheLast) return false;

    // Completion date
    if (this.props.filter.filterCompletedInTheLast &&
      (m.state !== 'Completed' || this.getDaysSinceDate(m.completeDate) >= this.props.filter.completedInTheLast)) return false;

    // Days since last update
    if (this.props.filter.filterUpdatedInTheLast &&
      this.getDaysSinceDate(m.lastActionDate) < this.props.filter.updatedInTheLast) return false;

    // Actions overdue by
    if (this.props.filter.filterActionsOverdueBy &&
      (m.isJob || this.getNextActionOverdueBy(m.activities) < this.props.filter.actionsOverdueBy)) return false;

    return true;
  }

  switchCategory = cat => {
    this.setState({
      category: cat
    });
  };

  switchStage = cat => {
    this.setState({
      stage: cat
    });
  };

  getWfmUrl = m => {
    var path;
    if (m.isJob) {
      path = `https://my.workflowmax.com/job/jobview.aspx?id=${m.wfmID}`;
    } else {
      path = `https://my.workflowmax.com/lead/view.aspx?id=${m.wfmID}`;
    }
    return path;
  };

  gotoWFM = m => {
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

  onMarkerClick = (marker, m) => {
    this.setState({
      activeMarker: marker,
      m: m,
      showingInfoWindow: true
    });
  };

  onMouseover = () => {
    this.setState({
      showInfoBox: true
    });
  };

  onMouseout = () => {
    this.setState({
      showInfoBox: false
    });
  };

  getIcon = cat => {
    var img = "other";
    ["asbestos", "meth", "stack", "bio", "noise", "workplace"].map(i => {
      if (cat.toLowerCase().includes(i)) img = i;
    });
    var url = "http://my.k2.co.nz/icons/" + img + ".png";
    return url;
  };

  getColor = cat => {
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

  getOffset = n => {
    var o = 20;
    var s = Math.floor((n - 1) / 8) + 1;
    var mod = (n % 9) + (s - 1);
    if (n === 0) mod = 0;
    // if (n>0) //console.log('n: ' + n + ', s: ' + s + ', mod: ' + mod);
    switch (mod) {
      case 0:
        return [0, 0];
      case 1:
        return [s * o, 0];
      case 2:
        return [0, -s * o];
      case 3:
        return [-s * o, 0];
      case 4:
        return [0, s * o];
      case 5:
        return [s * o, s * o];
      case 6:
        return [s * o, -s * o];
      case 7:
        return [-s * o, -s * o];
      case 8:
        return [-s * o, s * o];

      default:
        return [0, 0];
    }
  };

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState } = this.props;
    // console.log(wfmJobs);
    // console.log(wfmLeads);
    // console.log(currentJobState);
    if (
      wfmJobs.length > 0 &&
      wfmLeads.length > 0 &&
      wfmClients.length > 0 &&
      // currentJobState !== undefined &&
      // Object.values(currentJobState).length > 0 &&
      this.state.leads.length === 0
    )
      this.collateLeadsData();
    // if (Object.keys(this.state.staffStats).length > 1) {
    //   var daysMap = {};
    //   //console.log(this.state.staffStats["K2"]["completedActionOverdueDays"]);
    //   this.state.staffStats["K2"]["completedActionOverdueDays"].forEach(i => {
    //     if (daysMap[i] === undefined) daysMap[i] = { days: i, K2: 1, Shona: 0 };
    //     else daysMap[i]["K2"] = daysMap[i]["K2"] + 1;
    //   });
    //   this.state.staffStats["Shona Huffadine"][
    //     "completedActionOverdueDays"
    //   ].forEach(i => {
    //     if (daysMap[i] === undefined) daysMap[i] = { days: i, K2: 0, Shona: 1 };
    //     else daysMap[i]["Shona"] = daysMap[i]["Shona"] + 1;
    //   });
    //   var daysData = Object.values(daysMap);
    //   var sortedDays = [].concat(daysData).sort((a, b) => a.days > b.days);
    //   //console.log(daysData);
    // }

    const jobModal = (
      <Dialog
        maxWidth="sm"
        fullWidth={true}
        open={this.state.jobModal !== null}
        onClose={() => this.setState({ jobModal: null })}
      >
        <DialogTitle>
        {this.state.jobModal && (
          <h5
            style={{ color: this.getColor(this.state.jobModal.category) }}
          >
            {this.state.jobModal.jobNumber}: {this.state.jobModal.client}
          </h5>)}
        </DialogTitle>
        <DialogContent>
        {this.state.jobModal && (
          <div
            style={{
              width: 350,
              lineHeight: 2,
              fontSize: 14,
              padding: 20
            }}
          >
            <div style={{ color: this.getColor(this.state.jobModal.category) }}>
              <h6>{this.state.jobModal.category}</h6>
            </div>
            {this.state.jobModal.geocode && (
              <div>
                <i>{this.state.jobModal.geocode.address}</i>
              </div>
            )}
            {this.state.jobModal.state && (
              <div>
                <b>State:</b> {this.state.jobModal.state}
              </div>
            )}
            <div>
              <b>Owner:</b> {this.state.jobModal.owner}
            </div>

            {this.state.jobModal.isJob && (
              <div>
              {this.state.jobModal.lastActionDate && (
                <div>
                  {this.state.jobModal.state && (<span><b>Last Action:</b> State changed to <i>{this.state.jobModal.state}</i> </span>) }
                   ({this.getDaysSinceDate(this.state.jobModal.lastActionDate)} {this.getDaysSinceDate(this.state.jobModal.lastActionDate) === 1 ? 'day' : 'days'} ago)
                </div>
              )}
              {this.state.jobModal.stateHistory && (
                <div><br /><h6 style={{ color: this.getColor(this.state.jobModal.category) }}>State History</h6>
                { Object.keys(this.state.jobModal.stateHistory).map((key) => {
                  return (
                    <span key={key}>
                      <b>{key}:</b> {this.state.jobModal.stateHistory[key]}<br/>
                    </span>
                  )
                }) }
                </div>
              )}
            </div>
            )}

            {!this.state.jobModal.isJob && (
              <div>
              {this.state.jobModal.value > 0 && (
                <div>
                  <b>Estimated Value:</b> ${this.state.jobModal.value}{" "}
                </div>
              )}
              {this.state.jobModal.lastActionDate && (
                <div>
                  {this.state.jobModal.lastActionType && (<span><b>Last Action:</b> {this.state.jobModal.lastActionType} </span>)}
                   ({this.getDaysSinceDate(this.state.jobModal.lastActionDate)} {this.getDaysSinceDate(this.state.jobModal.lastActionDate) === 1 ? 'day' : 'days'} ago)
                </div>
              )}
              {this.state.jobModal.nextActionType && (
                <div>
                  <b>Next Action:</b> {this.getNextActionType(this.state.jobModal.activities)}{" "}
                  {this.getNextActionOverdueBy(this.state.jobModal.activities) > 0 ? (
                    <span
                      style={{
                        fontColor: "#ff0000",
                        textDecoration: "underline"
                      }}
                    >
                      (Overdue by {this.getNextActionOverdueBy(this.state.jobModal.activities)} days)
                    </span>
                  ) : (
                    <span>
                      (Due in {this.getNextActionOverdueBy(this.state.jobModal.activities) * -1} days)
                    </span>
                  )}
                </div>
              )}
              {this.state.jobModal.activities && this.state.jobModal.activities.length > 0 && (
                <div><br /><h6 style={{ color: this.getColor(this.state.jobModal.category) }}>Activities</h6>
                { this.state.jobModal.activities.map((activity) => {
                  if(activity.completed === 'Yes') {
                    return (
                      <span key={activity.date} style={{ textDecoration: 'line-through'}}>
                        <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                        <br/>
                      </span>
                    )
                  } else {
                    return (
                      <span key={activity.date}>
                        <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                        <br/>
                      </span>
                    )
                  }
                }) }
                </div>
              )}
              </div>
            )}

            <div style={{ padding: 16, textAlign: "center" }}>
              <Button variant="outlined" style={{ borderRadius: 20 }}>
                <a
                  style={{ textDecoration: "none", color: "#FF2D00" }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={this.getWfmUrl(this.state.jobModal)}
                >
                  View on WorkflowMax
                </a>
              </Button>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    );

    const jobListModal = (
      <Dialog
        maxWidth="lg"
        fullWidth={true}
        open={this.state.modal !== null}
        onClose={() => this.setState({ modal: null })}
      >
        <DialogTitle>
          {this.state.modal === "nolocation"
            ? "Jobs or Leads with No Location Data"
            : "List View"}
        </DialogTitle>
        <DialogContent>
              {this.state.leads
                .filter(
                  m => this.applyModalFilters(m, false)
                )
                .sort((a, b) => {
                  var metricA = a.isJob ? this.getDaysSinceDate(a.lastActionDate) : this.getNextActionOverdueBy(a.activities);
                  var metricB = b.isJob ? this.getDaysSinceDate(b.lastActionDate) : this.getNextActionOverdueBy(b.activities);
                  return metricB - metricA;
                  // this.getDaysSinceDate(a.lastActionDate) - this.getDaysSinceDate(b.lastActionDate))
                })
                // .sort((a, b) => b.isJob - a.isJob)
                .map(m => {
                  var stateStr = '';
                  if (m.isJob) {
                    var days = this.getDaysSinceDate(m.lastActionDate);
                    if (days < 1) {
                      stateStr = 'Changed state to ' + m.state + ' today';
                    } else if (days === 1) {
                      stateStr = 'Changed state to ' + m.state + ' yesterday';
                    } else if (days < 7) {
                      stateStr = 'Changed state to ' + m.state + ' ' + days + ' days ago';
                    } else {
                      stateStr = 'Has not changed state in ' + days + ' days';
                    }
                  } else {
                    days = this.getNextActionOverdueBy(m.activities);
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

                  return (
                    <ListItem
                      key={m.wfmID}
                      dense
                      className={classes.hoverItemPoint}
                      style={{ color: this.getColor(m.category) }}
                      onClick={() => {
                        this.openJobModal(m);
                      }}
                    >
                      <Grid container>
                        <Grid item xs={8}>
                        {m.jobNumber} - {m.client} : {m.name}
                        <br />
                        {m.category}
                        <br />
                        </Grid>
                        <Grid item xs={1}>
                        </Grid>
                        <Grid item xs={3}>
                          <span>{stateStr}</span>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })
              }
        </DialogContent>
      </Dialog>
    );

    var addresses = {};

    return (
      <div className={classes.marginTopStandard}>
        <div style={{ marginBottom: 20 }}>
        {/*
          <Tabs
            value={this.state.tabValue}
            onChange={this.handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab label="Current Jobs" />
            <Tab label="Leads" />
            <Tab label="Map" />
            <Tab label="Stats" />
            <Tab label="Permissions" />
          </Tabs>
        </div>
        {this.state.tabValue === 0 && (
          <div width='100%'>
            <ReactTable
              data={this.props.jobHistoryAnalysis && this.props.jobHistoryAnalysis['jobs'] && Object.values(this.props.jobHistoryAnalysis['jobs'])}
              columns={[{
                Header: 'WFM ID',
                accessor: 'wfmID',
                width: 100,
              },{
                  Header: 'Client',
                  accessor: 'client',
                  width: 100,
                },{
                  Header: 'Address',
                  accessor: 'address',
                  width: 250,
                }]}
              defaultPageSize={10}
            />
          </div>
        )}
        {this.state.tabValue === 1 && (
          <div></div>
        )}
        {this.state.tabValue === 2 && (
          <div>*/}
            {this.state.jobModal && jobModal}
            {this.state.modal && jobListModal}

            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                Filter View
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Button
                        style={{ fontSize: 12 }}
                        variant="outlined"
                        color="default"
                        onClick={this.resetFilter}
                      >
                        Reset Filter
                      </Button>
                    </Grid>
                    {[
                      "Leads",
                      "Jobs",
                    ].map(chip => {
                      return (
                        <Grid item key={chip}>
                          <Button
                            style={{ fontSize: 12 }}
                            variant="outlined"
                            color={
                              this.props.filter.filterJobLead === chip ? "secondary" : "default"
                            }
                            onClick={() => this.filterSet(chip,"JobLead")}
                          >
                            {chip}
                          </Button>
                        </Grid>
                      )
                    })}
                    <Grid>
                      <FormControlLabel
                        style={{ marginLeft: 1, }}
                        control={
                          <Checkbox
                            checked={this.props.filter.filterViewCompleted}
                            onChange={(event) => { this.props.filterMap({
                              ...this.props.filter,
                              filterViewCompleted: event.target.checked,
                            })}}
                            value='filterViewCompleted'
                            color='secondary'
                          />
                        }
                        label="Show Completed Jobs and Leads"
                      />
                    </Grid>
                    <Grid>
                      <FormControlLabel
                        style={{ marginLeft: 1, }}
                        control={
                          <Checkbox
                            checked={this.props.filter.filterK2Jobs}
                            onChange={(event) => { this.props.filterMap({
                              ...this.props.filter,
                              filterK2Jobs: event.target.checked,
                            })}}
                            value='filterK2Jobs'
                            color='secondary'
                          />
                        }
                        label="Show In-House Jobs"
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{ marginBottom: 8 }}>
                    {[
                      "Lead",
                      "On Hold",
                      "Needs Booking",
                      "Planned",
                      "Site Work",
                      "Lab",
                      "Report",
                      "Admin",
                      "Completed",
                    ].map(chip => {
                      return (
                        <Grid item key={chip}>
                          <Button
                            style={{ fontSize: 12 }}
                            variant="outlined"
                            color={
                              this.props.filter.filterState === chip ? "secondary" : "default"
                            }
                            onClick={() => this.filterSet(chip,"State")}
                          >
                            {chip}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Grid container spacing={1} style={{ marginBottom: 8 }}>
                    {[
                      "Asbestos",
                      "Meth",
                      "Stack",
                      "Noise",
                      "Bio",
                      "Workplace",
                      "Other"
                    ].map(chip => {
                      var color = this.getColor(chip);
                      return (
                        <Grid item key={chip}>
                          <Button
                            style={{ fontSize: 12, color: color }}
                            variant="outlined"
                            color={
                              this.props.filter.filterCategory === chip
                                ? "secondary"
                                : "default"
                            }
                            onClick={() => this.filterSet(chip,"Category")}
                          >
                            {chip}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid style={{ fontSize: 14 }}>
                      <Checkbox
                        checked={this.props.filter.filterUpdatedInTheLast}
                        onChange={(event) => { this.props.filterMap({
                          ...this.props.filter,
                          filterUpdatedInTheLast: event.target.checked,
                        })}}
                        value='filterUpdatedInTheLast'
                        color='secondary'
                      />

                      Only show jobs/leads that haven't been updated for
                      <Input
                        className={classes.formInputNumber}
                        type='number'
                        value={this.props.filter.updatedInTheLast}
                        onChange={(event) => this.props.filterMap({
                          ...this.props.filter,
                          updatedInTheLast: event.target.value,
                        })}
                      />
                      days or more
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid style={{ fontSize: 14 }}>
                      <Checkbox
                        checked={this.props.filter.filterCreatedInTheLast}
                        onChange={(event) => { this.props.filterMap({
                          ...this.props.filter,
                          filterCreatedInTheLast: event.target.checked,
                        })}}
                        value='filterCreatedInTheLast'
                        color='secondary'
                      />

                      Only show jobs/leads that were created in the last
                      <Input
                        className={classes.formInputNumber}
                        type='number'
                        value={this.props.filter.createdInTheLast}
                        onChange={(event) => { this.props.filterMap({
                          ...this.props.filter,
                          createdInTheLast: event.target.value,
                        })}}
                      />
                      days or less
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid style={{ fontSize: 14 }}>
                      <Checkbox
                        checked={this.props.filter.filterCompletedInTheLast}
                        onChange={(event) => {
                          this.props.filterMap({
                          ...this.props.filter,
                          filterViewCompleted: event.target.checked,
                          filterCompletedInTheLast: event.target.checked,
                        })}}
                        value='filterCompletedInTheLast'
                        color='secondary'
                      />

                      Only show jobs/leads that were completed in the last
                      <Input
                        className={classes.formInputNumber}
                        type='number'
                        value={this.props.filter.completedInTheLast}
                        onChange={(event) => this.props.filterMap({
                          ...this.props.filter,
                          completedInTheLast: event.target.value,
                        })}
                      />
                      days or less
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid style={{ fontSize: 14 }}>
                      <Checkbox
                        checked={this.props.filter.filterActionsOverdueBy}
                        onChange={(event) => { this.props.filterMap({
                          ...this.props.filter,
                          filterActionsOverdueBy: event.target.checked,
                        })}}
                        value='filterActionsOverdueBy'
                        color='secondary'
                      />

                      Only show leads that have actions overdue by
                      <Input
                        className={classes.formInputNumber}
                        type='number'
                        value={this.props.filter.actionsOverdueBy}
                        onChange={(event) => this.props.filterMap({
                          ...this.props.filter,
                          actionsOverdueBy: event.target.value,
                        })}
                      />
                      days or more
                    </Grid>
                  </Grid>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <Grid container spacing={1} style={{ marginTop: 12}}>
              <Grid item>
                <Button onClick={this.openLeadsModal} variant='outlined'>
                  <span style={{ fontSize: 12 }}>
                    View As List (
                    {this.state.leads &&
                      this.state.leads.filter(
                        m =>
                          this.applyFilters(m)
                      ).length}
                    )
                  </span>
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={this.openNoLocation} variant='outlined'>
                  <span style={{ fontSize: 12 }}>
                    View Jobs/Leads With No Location Data (
                    {this.state.leads &&
                      this.state.leads.filter(
                        m =>
                          this.applyModalFilters(m, true)
                      ).length}
                    )
                  </span>
                </Button>
              </Grid>
            </Grid>
            <Map
              google={this.props.google}
              zoom={6.27}
              style={mapStyles}
              initialCenter={{
                lat: -40.9261681,
                lng: 174.4070603
              }}
            >
              {this.state.leads && this.state.leads.map(m => {
                if (this.filterLabels(m)) {
                  if (addresses[m.geocode.address] >= 0) {
                    addresses[m.geocode.address] =
                      addresses[m.geocode.address] + 1;
                    // //console.log(m.jobNumber + ': ' + m.geocode.address + ' (' + addresses[m.geocode.address] + ')');
                  } else {
                    addresses[m.geocode.address] = 0;
                  }
                  var url = this.getIcon(m.category);
                  return (
                    <Marker
                      // animation={this.props.google.maps.Animation.DROP}
                      key={m.wfmID}
                      onClick={(props, marker, e) => {
                        this.onMarkerClick(marker, m);
                      }}
                      position={{
                        lat: m.geocode.location[0],
                        lng: m.geocode.location[1]
                      }}
                      title={`${m.jobNumber}: ${m.client}`}
                      icon={{
                        url: url,
                        anchor: new this.props.google.maps.Point(
                          16 + this.getOffset(addresses[m.geocode.address])[0],
                          16 + this.getOffset(addresses[m.geocode.address])[1]
                        ),
                        scaledSize: new this.props.google.maps.Size(32, 32)
                      }}
                    />
                  );
                } else {
                  return false;
                }
              })}
              <InfoWindow
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}
              >
                <div
                  style={{
                    width: 350,
                    lineHeight: 2,
                    fontSize: 14,
                    padding: 20
                  }}
                >
                  <div>
                    <h5
                      style={{ color: this.getColor(this.state.m.category) }}
                    >
                      {this.state.m.jobNumber}: {this.state.m.client}
                    </h5>
                  </div>
                  <div style={{ color: this.getColor(this.state.m.category) }}>
                    <h6>{this.state.m.category}</h6>
                  </div>
                  {this.state.m.geocode && (
                    <div>
                      <i>{this.state.m.geocode.address}</i>
                    </div>
                  )}
                  {this.state.m.state && (
                    <div>
                      <b>State:</b> {this.state.m.state}
                    </div>
                  )}
                  <div>
                    <b>Owner:</b> {this.state.m.owner}
                  </div>

                  {this.state.m.isJob && (
                    <div>
                    {this.state.m.lastActionDate && (
                      <div>
                        {this.state.m.state && (<span><b>Last Action:</b> State changed to <i>{this.state.m.state}</i> </span>) }
                         ({this.getDaysSinceDate(this.state.m.lastActionDate)} {this.getDaysSinceDate(this.state.m.lastActionDate) === 1 ? 'day' : 'days'} ago)
                      </div>
                    )}
                    {this.state.m.stateHistory && (
                      <div><br /><h6 style={{ color: this.getColor(this.state.m.category) }}>State History</h6>
                      { Object.keys(this.state.m.stateHistory).map((key) => {
                        return (
                          <span key={key}>
                            <b>{key}:</b> {this.state.m.stateHistory[key]}<br/>
                          </span>
                        )
                      }) }
                      </div>
                    )}
                  </div>
                  )}

                  {!this.state.m.isJob && (
                    <div>
                    {this.state.m.value > 0 && (
                      <div>
                        <b>Estimated Value:</b> ${this.state.m.value}{" "}
                      </div>
                    )}
                    {this.state.m.lastActionDate && (
                      <div>
                        {this.state.m.lastActionType && (<span><b>Last Action:</b> {this.state.m.lastActionType} </span>)}
                         ({this.getDaysSinceDate(this.state.m.lastActionDate)} {this.getDaysSinceDate(this.state.m.lastActionDate) === 1 ? 'day' : 'days'} ago)
                      </div>
                    )}
                    {this.state.m.nextActionType && (
                      <div>
                        <b>Next Action:</b> {this.getNextActionType(this.state.m.activities)}{" "}
                        {this.getNextActionOverdueBy(this.state.m.activities) > 0 ? (
                          <span
                            style={{
                              fontColor: "#ff0000",
                              textDecoration: "underline"
                            }}
                          >
                            (Overdue by {this.getNextActionOverdueBy(this.state.m.activities)} days)
                          </span>
                        ) : (
                          <span>
                            (Due in {this.getNextActionOverdueBy(this.state.m.activities) * -1} days)
                          </span>
                        )}
                      </div>
                    )}
                    {this.state.m.activities && this.state.m.activities.length > 0 && (
                      <div><br /><h6 style={{ color: this.getColor(this.state.m.category) }}>Activities</h6>
                      { this.state.m.activities.map((activity) => {
                        if(activity.completed === 'Yes') {
                          return (
                            <span key={activity.date} style={{ textDecoration: 'line-through'}}>
                              <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                              <br/>
                            </span>
                          )
                        } else {
                          return (
                            <span key={activity.date}>
                              <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                              <br/>
                            </span>
                          )
                        }
                      }) }
                      </div>
                    )}
                    </div>
                  )}

                  <div style={{ padding: 16, textAlign: "center" }}>
                    <a
                      style={{ textDecoration: "none", color: "#FF2D00" }}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={this.getWfmUrl(this.state.m)}
                    >
                      View on WorkflowMax
                    </a>
                  </div>
                </div>
              </InfoWindow>
            </Map>
          </div>
        {/*)}
        {this.state.tabValue === 3 && (
          <div>
            <LineChart
              width={1200}
              height={350}
              data={daysData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="days" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="K2" stroke="#8884d8" />
              <Line type="monotone" dataKey="Shona" stroke="#82ca9d" />
            </LineChart>
            <div>
              <ListItem>
                <Grid container style={{ fontWeight: 600 }}>
                  <Grid item xs={2}>
                    Name
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Total Jobs
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Total Leads
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Jobs Need Booking
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Average Days Completed Actions Overdue By
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Average Days Current Actions Overdue By
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Average Lead Age
                    </div>
                  </Grid>
                </Grid>
              </ListItem>

              {this.state.staffStats &&
                Object.keys(this.state.staffStats).map(s => {
                  var stats = this.state.staffStats[s];
                  return (
                    <ListItem className={classes.hoverItem} key={s}>
                      <Grid container>
                        <Grid item xs={2}>
                          {s}
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {stats["jobTotal"]}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {stats["leadTotal"]}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {stats["jobNeedsBookingTotal"]}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {stats["averageCompletedActionOverdueDays"][2]}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {stats["averageActionOverdueDays"][2]}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {stats["averageLeadAge"][2]}
                          </div>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })}
            </div>
          </div>
        )}*/}
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GoogleApiWrapper({ apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY })(JobMap))
);
