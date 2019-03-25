import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
// import { FormattedDate } from 'react-intl';
import ReactTable from 'react-table';
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import LineChart from "recharts/lib/chart/LineChart";
import Line from "recharts/lib/cartesian/Line";
import XAxis from "recharts/lib/cartesian/XAxis";
import YAxis from "recharts/lib/cartesian/YAxis";
import Legend from "recharts/lib/component/Legend";
import ZAxis from "recharts/lib/cartesian/ZAxis";
import Tooltip from "recharts/lib/component/Tooltip";
import Scatter from "recharts/lib/cartesian/Scatter";
import CartesianGrid from "recharts/lib/cartesian/CartesianGrid";
// import DialogActions from '@material-ui/core/DialogActions';
import ExpandMore from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
// import 'react-table/react-table.css'
// import treeTableHOC from 'react-table/lib/hoc/treeTable';
import JobCard from "./JobCard";
import { FormattedDate } from "react-intl";
// import GoogleMapReact from 'google-map-react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";
import _ from "lodash";

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
  analyseJobHistory,
} from "../../actions/local";

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
    analyseJobHistory: () => dispatch(analyseJobHistory()),
  };
};

// const proxyURL = 'https://cors-anywhere.herokuapp.com/';
// const locationSharingAddress = 'https://www.google.com/maps/preview/locationsharing/read?authuser=0&hl=en&gl=en&pb=';

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
      noLocationJobs: [],
      noLocationLeads: [],
      statSheet: statSheet,
      staffStats: {
        K2: statSheet
      },
      stage: "Show All",
      category: "Show All",
      clientStats: {},
      activeMarker: {},
      showingInfoWindow: false,
      m: {},
      geocodeCount: 0,
    };
  }

  componentWillMount() {
    if (this.state.leads.length === 0) {
      this.props.fetchWFMJobs();
      this.props.fetchWFMLeads();
      this.props.fetchWFMClients();
      this.props.fetchCurrentJobState(true);
      if(this.props.geocodes == undefined) this.props.fetchGeocodes();
      // this.props.analyseJobHistory();
    } else {
      this.state.leads = this.props.wfmItems;
    }
  }

  componentWillUnmount() {
    this.props.saveWFMItems(this.state.leads);
    this.props.saveCurrentJobState(this.state.leads);
    this.props.saveStats({
      staff: this.state.staffStats,
      clients: this.state.clientStats
    });
    // if (this.props.geocodes) this.props.saveGeocodes(this.props.geocodes);
    // this.props.jobHistoryAnalysis && this.props.saveJobHistoryAnalysis(this.props.jobHistoryAnalysis);
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
    if (value === 3) this.computeStats();
  };

  computeStats = () => {
    var template = this.state.statSheet;
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
    console.log("Computed stats");
    console.log(client);
    console.log(staff);

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

  formatDate = date => {
    return (
      <FormattedDate
        value={date instanceof Date ? date : new Date(date)}
        month="long"
        day="numeric"
        year="numeric"
        children={string => string}
      />
    );
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
      console.log("Already there");
      lead.geocode = this.props.geocodes[add];
      this.state.leads = [...this.state.leads, lead];
      if (lead.geocode && lead.geocode.address === "New Zealand" && !lead.isJob)
        this.setState({
          noLocationLeads: [...this.state.noLocationLeads, lead]
        });
      if (lead.geocode && lead.geocode.address === "New Zealand" && lead.isJob)
        this.setState({ noLocationJobs: [...this.state.noLocationJobs, lead] });
    } else if (this.state.geocodeCount < 20) {
      this.setState({
        geocodeCount: this.state.geocodeCount + 1,
      });

      let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${add}&components=country:NZ&key=${
        process.env.REACT_APP_GOOGLE_MAPS_KEY
      }`;
      console.log("Getting GEOCODE for " + add);
      fetch(path)
        .then(response => response.json())
        .then(response => {
          var gc = this.props.geocodes;
          // TODO response error
          gc[add] = this.simplifiedGeocode(response.results[0]);
          this.props.updateGeocodes(gc);
          lead.geocode = gc[add];
          this.addLeadToState(lead);
          return lead;
        });
    }
  };

  addLeadToState = lead => {
    console.log('Add lead');
    console.log(lead);
    if (
      lead.geocode &&
      lead.geocode.address === "New Zealand" &&
      !lead.isJob
    )
      this.setState({
        noLocationLeads: [...this.state.noLocationLeads, lead]
      });
    if (
      lead.geocode &&
      lead.geocode.address === "New Zealand" &&
      lead.isJob
    )
      this.setState({
        noLocationJobs: [...this.state.noLocationJobs, lead]
      });

    //Find any items with same geocode

    // console.log(lead);
    this.setState({
      leads: [...this.state.leads, lead]
    });
    console.log(this.state.leads);
  }

  checkAddress = address => {
    if (address === "") return "NULL";
    // if (address.trim().split(/\s+/).length < 2) return "NULL";

    var geo = this.props.geocodes[encodeURI(address)];

    // ignore all addresses that just return the country
    if (geo !== undefined && geo.address === "New Zealand") return "NULL";

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
    console.log(g);
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
    var uncompletedActivities = activities.filter(
      activity => activity.completed === "No"
    );
    return uncompletedActivities
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .reverse();
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

  openNoLocationLeads = () => {
    this.setState({
      modal: "leads"
    });
  };

  openNoLocationJobs = () => {
    this.setState({
      modal: "jobs"
    });
  };

  // Collate Jobs (need booking) and Leads into a set of data that can be displayed nicely
  collateLeadsData = () => {
    // console.log(this.props.currentJobState);
    console.log('Jobs length');
    console.log('Jobs: ' + this.props.wfmJobs.length);
    console.log('Leads: ' + this.props.wfmLeads.length)
    console.log(this.props.wfmJobs.length + this.props.wfmLeads.length);
    var staffStats = { K2: this.state.statSheet };
    var clientStats = {};

    console.log("COLLATING LEADS AND JOBS");
    var mappedJobs = [];
    var today = moment(job['creationDate']).format('YYYY-MM-DD');

    // Convert jobs into a 'lead' type object
    this.props.wfmJobs.forEach(job => {
      var mappedJob = this.props.currentJobState[job['wfmID']];
      if (mappedJob != undefined) {
        // Add all mapped jobs and lead to an array and then set state
        // Then go ahead with sorting the new jobs and leads
        // Update state history of job
        mappedJobs.add(mappedJob);
      } else {
        var newJob = {};
        newJob.wfmID = job.wfmID;
        newJob.client = job.client;
        newJob.clientID = job.clientID;
        newJob.name = job.address;
        newJob.owner = job.manager;
        newJob.jobNumber = job.jobNumber;
        // newJob.creationDate = job.startDate;
        newJob.category = job.type;
        // lead.currentStatus = job.currentStatus;
        newJob.state = job.state;
        newJob.dueDate = job.dueDate;
        newJob.urgentAction = "";
        newJob.lastActionType = job.state;
        newJob.lastActionDate = today;
        newJob.nextActionType = "";
        newJob.nextActionDate = moment(today).add(1, "days");
        if (job.state === "Needs Booking") {
          newJob.lastActionDate = job.startDate;
          newJob.lastActionType = "Converted into job";
          newJob.nextActionType = "Book job";
          newJob.nextActionDate = moment(job.startDate).add(1, 'M');
          newJob.nextActionOverdueBy = newJob.daysSinceLastAction - 30; // Arbitrarily added 30 days as how long between converting to job and booking
        }
        newJob.stateHistory = {
          [today]: job.state,
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
      var mappedJob = this.props.currentJobState[wfmLead['wfmID']];
      if (mappedJob != undefined) {
        // Update state history of job
        if(mappedJob.nextActionDate == undefined) {
          mappedJob.nextActionDate = this.getNextActionDate(lead.activities);
        }
        mappedJobs.add(mappedJob);
      } else {
        var lead = {};
        lead.wfmID = wfmLead.wfmID;
        lead.client = wfmLead.client;
        lead.name = wfmLead.name;
        lead.owner = wfmLead.owner;
        lead.jobNumber = "Lead";
        lead.creationDate = wfmLead.date;
        lead.category = wfmLead.category;
        // lead.currentStatus = wfmLead.currentStatus;
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

        lead.completedActivities = this.getCompletedActivities(lead.activities);

        lead.lastActionDate = this.getLastActionDateFromActivities(
          lead.completedActivities,
          lead.creationDate
        );
        lead.lastActionType = this.getLastActionTypeFromActivities(
          lead.completedActivities
        );

        lead.averageCompletedActionOverdueDays = this.getAverageCompletedActionOverdueDays(
          lead.completedActivities
        );
        lead.nextActionType = this.getNextActionType(lead.activities);
        lead.nextActionOverdueBy = this.getNextActionOverdueBy(lead.activities);

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
    this.setState({
      leads: [
        ...this.state.leads,
        ...mappedJobs,
      ],
    });
  };

  filterLabels = m => {
    if (m && m.geocode && m.geocode.address !== "New Zealand") {
      if (this.filterCategory(m) && this.filterStage(m)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  filterCategory = m => {
    if (
      m.category.includes(this.state.category) ||
      this.state.category === "Show All"
    )
      return true;
    else return false;
  };

  filterStage = m => {
    if (this.state.stage === "Show All") return true;
    if (this.state.stage === "All Jobs" && m.isJob) return true;
    if (this.state.stage === "All Job Leads" && !m.isJob) return true;
    if (this.state.stage === "New Lead" && !m.isJob && m.daysOld < 8)
      return true;
    if (
      this.state.stage === "Leads with Overdue Actions" &&
      !m.isJob &&
      m.nextActionOverdueBy > 0
    )
      return true;
    if (
      this.state.stage === "Jobs with Overdue Actions" &&
      m.isJob &&
      m.nextActionOverdueBy > 0
    )
      return true;
    if (this.state.stage === "Job Needs Booking" && m.state === "Needs Booking")
      return true;
    if (this.state.stage === "Planned" && m.state === "Planned") return true;
    if (this.state.stage === "In Progress" && m.state === "In Progress")
      return true;
    if (
      this.state.stage === "Job Start Today" &&
      m.state === "In Progress" &&
      m.daysOld === 0
    )
      return true;
    if (
      this.state.stage === "Post-Site Work Jobs" &&
      m.isJob &&
      !"NeedsBookingPlannedIn Progress".includes(m.state)
    )
      return true;
    return false;
  };

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
    console.log(path);
    return path;
  };

  gotoWFM = m => {
    console.log("GoTO");
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

  getColour = cat => {
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
    // if (n>0) console.log('n: ' + n + ', s: ' + s + ', mod: ' + mod);
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
    // const K_WIDTH = 40;
    // const K_HEIGHT = 40;
    const { wfmJobs, wfmLeads, wfmClients, geocodes, classes, currentJobState } = this.props;
    if (
      wfmJobs.length > 0 &&
      wfmLeads.length > 0 &&
      wfmClients.length > 0 &&
      currentJobState != undefined &&
      this.state.leads.length === 0
    )
      this.collateLeadsData();
    if (Object.keys(this.state.staffStats).length > 1) {
      var daysMap = {};
      console.log(this.state.staffStats["K2"]["completedActionOverdueDays"]);
      this.state.staffStats["K2"]["completedActionOverdueDays"].forEach(i => {
        if (daysMap[i] === undefined) daysMap[i] = { days: i, K2: 1, Shona: 0 };
        else daysMap[i]["K2"] = daysMap[i]["K2"] + 1;
      });
      this.state.staffStats["Shona Huffadine"][
        "completedActionOverdueDays"
      ].forEach(i => {
        if (daysMap[i] === undefined) daysMap[i] = { days: i, K2: 0, Shona: 1 };
        else daysMap[i]["Shona"] = daysMap[i]["Shona"] + 1;
      });
      var daysData = Object.values(daysMap);
      var sortedDays = [].concat(daysData).sort((a, b) => a.days > b.days);
      console.log(daysData);
    }
    const noLocationModal = (
      <Dialog
        maxWidth="sm"
        fullWidth={true}
        open={this.state.modal !== null}
        onClose={() => this.setState({ modal: null })}
      >
        <DialogTitle>
          {this.state.modal === "jobs"
            ? "Jobs with No Location Data"
            : "Leads with No Location Data"}
        </DialogTitle>
        <DialogContent>
          {this.state.modal === "jobs"
            ? this.state.leads &&
              this.state.leads
                .filter(
                  m =>
                    m.geocode && m.geocode.address === "New Zealand" && m.isJob
                )
                .map(m => {
                  return (
                    <ListItem
                      key={m.wfmID}
                      dense
                      className={classes.hoverItem}
                      style={{ color: this.getColour(m.category) }}
                      onClick={() => {
                        this.gotoWFM(m);
                      }}
                    >
                      {m.name} : {m.client}
                      <br />
                      {m.category}
                      <br />
                    </ListItem>
                  );
                })
            : this.state.leads &&
              this.state.leads
                .filter(
                  m =>
                    m.geocode && m.geocode.address === "New Zealand" && !m.isJob
                )
                .map(m => {
                  return (
                    <ListItem
                      key={m.wfmID}
                      dense
                      className={classes.hoverItem}
                      style={{ color: this.getColour(m.category) }}
                      onClick={() => {
                        this.gotoWFM(m);
                      }}
                    >
                      {m.name} : {m.client}
                    </ListItem>
                  );
                })}
        </DialogContent>
      </Dialog>
    );

    var addresses = {};

    return (
      <div style={{ marginTop: 80 }}>
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
            {this.state.modal && noLocationModal}
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                Filter View
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div>
                  <Grid container spacing={8}>
                    {[
                      "Show All",
                      "All Job Leads",
                      "New Lead",
                      "Leads with Overdue Actions",
                      "All Jobs",
                      "Jobs with Overdue Actions",
                      "Job Needs Booking",
                      "Planned",
                      "In Progress",
                      "Post-Site Work Jobs"
                    ].map(cat => {
                      return (
                        <Grid item key={cat}>
                          <Button
                            style={{ fontSize: 12 }}
                            variant="outlined"
                            color={
                              this.state.stage === cat ? "secondary" : "primary"
                            }
                            onClick={() => this.switchStage(cat)}
                          >
                            {cat}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                  <Grid container spacing={8} style={{ marginBottom: 20 }}>
                    {[
                      "Show All",
                      "Asbestos",
                      "Meth",
                      "Stack",
                      "Noise",
                      "Bio",
                      "Workplace",
                      "Other"
                    ].map(cat => {
                      var colour = this.getColour(cat);
                      return (
                        <Grid item key={cat}>
                          <Button
                            variant="outlined"
                            color={
                              this.state.category === cat
                                ? "secondary"
                                : "primary"
                            }
                            onClick={() => this.switchCategory(cat)}
                          >
                            <span style={{ fontSize: 12, color: colour }}>
                              {cat}
                            </span>
                          </Button>
                        </Grid>
                      );
                    })}
                    {this.state.noLocationJobs && (
                      <Grid item>
                        <Button onClick={this.openNoLocationJobs}>
                          <span style={{ fontSize: 12 }}>
                            View Jobs With No Location Data (
                            {this.state.leads &&
                              this.state.leads.filter(
                                m =>
                                  m.geocode &&
                                  m.geocode.address == "New Zealand" &&
                                  m.isJob
                              ).length}
                            )
                          </span>
                        </Button>
                      </Grid>
                    )}
                    {this.state.noLocationLeads && (
                      <Grid item>
                        <Button onClick={this.openNoLocationLeads}>
                          <span style={{ fontSize: 12 }}>
                            View Leads With No Location Data (
                            {this.state.leads &&
                              this.state.leads.filter(
                                m =>
                                  m.geocode &&
                                  m.geocode.address == "New Zealand" &&
                                  !m.isJob
                              ).length}
                            )
                          </span>
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
                    // console.log(m.jobNumber + ': ' + m.geocode.address + ' (' + addresses[m.geocode.address] + ')');
                  } else {
                    addresses[m.geocode.address] = 0;
                  }
                  var url = this.getIcon(m.category);
                  return (
                    <Marker
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
                }
              })}
              <InfoWindow
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}
              >
                <div
                  style={{
                    width: 300,
                    lineHeight: 2,
                    fontSize: 14,
                    padding: 20
                  }}
                >
                  <div>
                    <h5
                      style={{ color: this.getColour(this.state.m.category) }}
                    >
                      {this.state.m.jobNumber}: {this.state.m.client}
                    </h5>
                  </div>
                  <div style={{ color: this.getColour(this.state.m.category) }}>
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
                  {this.state.m.lastActionType && (
                    <div>
                      <b>Last Action:</b> {this.state.m.lastActionType} (
                      {getDaysSinceDate(this.state.m.lastActionDate)} days ago)
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
                  {this.state.m.value > 0 && (
                    <div>
                      <b>Estimated Value:</b> ${this.state.m.value}{" "}
                    </div>
                  )}
                  <div style={{ padding: 16, textAlign: "center" }}>
                    <Button variant="outlined" style={{ borderRadius: 20 }}>
                      <a
                        style={{ textDecoration: "none", color: "#FF2D00" }}
                        target="_blank"
                        rel="noopener nonreferrer"
                        href={this.getWfmUrl(this.state.m)}
                      >
                        View on WorkflowMax
                      </a>
                    </Button>
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
