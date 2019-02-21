import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { formStyles } from '../../config/styles';
import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
import ReactTable from 'react-table';
import StaffIcon from '@material-ui/icons/People';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import JobCard from './JobCard';
import { FormattedDate } from 'react-intl';
// import GoogleMapReact from 'google-map-react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import _ from 'lodash';

import { fetchWFMJobs, fetchWFMLeads, fetchWFMClients, saveGeocodes, fetchGeocodes, updateGeocodes, saveWFMItems, saveStats, } from '../../actions/local';

const mapStyles = {
  width: '100%',
  height: '100%',
}

const mapStateToProps = state => {
  return {
    wfmJobs: state.local.wfmJobs,
    wfmLeads: state.local.wfmLeads,
    wfmClients: state.local.wfmClients,
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
    saveGeocodes: (g) => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: (g) => dispatch(updateGeocodes(g)),
    saveWFMItems: (items) => dispatch(saveWFMItems(items)),
    saveStats: (stats) => dispatch(saveStats(stats)),
  }
}

{/*
  Marker types needed

  Job Booked today - in progress & start date is today
  Lead
  New lead (last week)
  Planned
  In Progress
  Job Needs Booking
  Other stages

  Colours/icons

  Asbestos
  Meth
  Stack
  Noise
  Biological
  Workplace


*/}
{/*
  const sharing = `)]}'[[[["116014827704053718107","https://lh6.googleusercontent.com/-ACxOv5b8G5o/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQM8MeUWGyV10IYoIT3EGeCL8Cx1Zg/mo/photo.jpg",null,"Kelly Hutchinson",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIDSgA"],[null,[null,172.6840079,-43.5591395],1550179646944,14,"24/105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCAwoCg",null,["116014827704053718107","https://lh6.googleusercontent.com/-ACxOv5b8G5o/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQM8MeUWGyV10IYoIT3EGeCL8Cx1Zg/mo/photo.jpg","Kelly Hutchinson","Kelly"],0,null,null,null,null,null,[1,100],3],[["113507006967434942504","https://lh3.googleusercontent.com/a-/AAuE7mAPYmoZVX4q9mqW_y1CBS7ob5sqnra6v-9ZCLSz",null,"Maree Pierce",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIHigA"],[null,[null,172.6839364,-43.5592242],1550179335715,16,"105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCB0oCw",null,["113507006967434942504","https://lh3.googleusercontent.com/a-/AAuE7mAPYmoZVX4q9mqW_y1CBS7ob5sqnra6v-9ZCLSz","Maree Pierce","Maree"],1,null,null,null,null,null,[0,56],1],[["105912023859982624237","https://lh3.googleusercontent.com/a-/AAuE7mCaxzo5FZJ5NooypYWoPyngTvBHdSPBP3qd4Okh",null,"James Piesse",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgILygA"],[null,[null,172.6839793,-43.5592335],1550179503334,18,"105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCC4oDA",null,["105912023859982624237","https://lh3.googleusercontent.com/a-/AAuE7mCaxzo5FZJ5NooypYWoPyngTvBHdSPBP3qd4Okh","James Piesse","James"],1,null,null,null,null,null,[0,63],1],[["114788267360977829808","https://lh3.googleusercontent.com/a-/AAuE7mBsqIzdWgYzhRFWAL-Bv112GohpHqMxrfehBrnt",null,"Max Gallagher",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIQCgA"],[null,[null,172.6839407,-43.5592415],1550178003014,22,"24/105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCD8oDQ",null,["114788267360977829808","https://lh3.googleusercontent.com/a-/AAuE7mBsqIzdWgYzhRFWAL-Bv112GohpHqMxrfehBrnt","Max Gallagher","Max"],1,null,null,null,null,null,[0,39],1],[["108182579219510128981","https://lh3.googleusercontent.com/a-/AAuE7mD4E0Hu2CGN2L4f8zsECwy01jMuDz8u1-IJmMz7",null,"Reagan Solodi",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIUCgA"],null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCE8oDg",null,["108182579219510128981","https://lh3.googleusercontent.com/a-/AAuE7mD4E0Hu2CGN2L4f8zsECwy01jMuDz8u1-IJmMz7","Reagan Solodi","Reagan"],1]],null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQ8ZABCAE","Z91lXOHWEMvtvgTiyJTIDA",null,null,"GvoEAN3tZxiI+V6MU6jCZ6kvJ5tVf4TvC+GsZhuxSNyn1XBEVf3UOg8WRQnsvuViwh2fxbaASV2HVYtZQha+YBRb3NBnwMORsiaW3DZixa57whNBCtP19DKhKKe2R7LAdv728x9wgyrMfFqa0ztOp7DnBQq+dI0PbD0amQPDvgXxC3AulZIIXlsrMf0hTslq6n06EiOiC1Ga1rfhcF+AheAPF0EvMoOyC7pQpWnKVUzERjuzokCJUJwxe10La+PjY69K9x6MSzSp+CEfmGgrqwSbuhorPR8+qGfVgkTQEyKPTA84vhB09H5Fb1bGYTZM9pIiM6j6HunfQEcGv0XtlWr9wN3RrEPby18n3JLFYB+j8oj9Ds6yNin9Mq2SJU8dk50l2oVGN3F89iRPNo6oHKfeth0X1GiD7cWymB+Pj9IGuZaWQnb6d7sOJCpBbTK76kQoxAweiqfqNyotmm10n6zlrS9LXPS2MKXvyF+cfNeO+C2G9Ry337tF4xIWZyWTNwpgK+isZMQYi5RRqUAwsEaGdsqiocGSg/eU6aknmddCKC6Ijjsx6XOjaRqgUbRmUrlvFc0RrQ4pMDBO3k+/+YOcpal5SbL4yW+rPFMBZFmNDjdL9jTlPfp9erUdVCsPFh7wHLsU19m1ytzAB7pdvCOudYcv1IYtzAEeNgqaf93e4EyFBVjNila+0OqyHjK0dTrg+3ox82opRvyWZIZOZ/QgIUGY36W7w3JdNWPb5GgCCazbitcFYtkvSJGeuyHcatZWK5F0ILQbT1yXnW6P0qkB1QiybGHc91kjEROqmXFYZ7U2INxagYHgpC/Ab5QZwXUjZJ7kL8/gk+nAQ",4,1550179688202,[null,[null,[null,172.6792273,-43.5555654],1550179140628,1600,"Woolston, Christchurch, Nouvelle-Zélande",null,"NZ",46800000],"ILfzhtOroM3gbA"]]`;

const proxyURL = 'https://cors-anywhere.herokuapp.com/';
const locationSharingAddress = 'https://www.google.com/maps/preview/locationsharing/read?authuser=0&hl=en&gl=en&pb=';}*/}

class JobMap extends React.Component {
  constructor(props) {
    super(props);

    // Set up stat sheet for new names
    // Averages in form { number of items, sum, average }
    var statSheet = {
      // Totals
      'jobNeedsBookingTotal': 0,
      'leadTotal': 0,
      'completedActions': 0,
      'overdueActions': 0,
      'upcomingActions': 0,
      'valueTotal': 0,

      // Averages
      'averageActionOverdueDays': [0, 0, 0],
      'averageCompletedActionOverdueDays': [0, 0, 0],
      'averageCurrentOverdueDays': [0, 0, 0],
      'averageLeadAge': [0, 0, 0],
      'averageJobNeedsBookingAge': [0, 0, 0],

      // List of ages to be graphed
      'leadAges': [],
      'jobNeedsBookingAges': [],
      'actionOverdueDays': [],
      'completedActionOverdueDays': [],
    };

    this.state = {
      leads: [],
      noLocationJobs: [],
      noLocationLeads: [],
      statSheet: statSheet,
      staffStats: {
        'K2': statSheet,
      },
      stage: 'Show All',
      category: 'Show All',
      clientStats: {},
      activeMarker: {},
      showingInfoWindow: false,
      m: {},
    }
  }

  componentWillMount() {
    if (this.props.wfmItems.length === 0) {
      this.props.fetchWFMJobs();
      this.props.fetchWFMLeads();
      this.props.fetchWFMClients();
      this.props.fetchGeocodes();
    } else {
      this.state.leads = this.props.wfmItems;
    }
  }

  componentWillUnmount() {
    this.props.saveWFMItems(this.state.leads);
    this.props.saveStats({ 'staff': this.state.staffStats, 'clients': this.state.clientStats });
    if (this.props.geocodes) this.props.saveGeocodes(this.props.geocodes);
  }

  processActivityStats = (activities) => {
    activities.forEach(a => {
      // Check if activity is completed
      if (a.completed == 'Yes') {
        this.addStaffStat(a.responsible, 'completedActions');
        this.listStaffStat(a.responsible, 'completedActionOverdueDays', a.completedOverdueBy);
        this.averageStaffStat(a.responsible, 'averageCompletedActionOverdueDays', a.completedOverdueBy);
      } else {
        var overdueDays = this.getDaysSinceDate(a.date);
        if (overdueDays > 0) {
          // Overdue Action
          this.addStaffStat(a.responsible, 'overdueActions');
          this.listStaffStat(a.responsible, 'actionOverdueDays', overdueDays);
          this.averageStaffStat(a.responsible, 'averageActionOverdueDays', overdueDays);
        } else {
          // Action on target
          this.addStaffStat(a.responsible, 'upcomingActions');
        }
      }
    });
  }

  displayTimeDifference = (date) => {
    var timeDifference = new Date() - new Date(date);
    var divideBy = {
      d: 86400000,
      m: 2629800000,
      y: 31557600000,
    };
    var years = Math.floor(timeDifference/divideBy['y']);
    timeDifference = timeDifference % divideBy['y'];
    var months = Math.floor(timeDifference/divideBy['m']);
    timeDifference = timeDifference % divideBy['m'];
    var days = Math.floor(timeDifference/divideBy['d']);
    let y = years + ' years ';
    let m = months + ' months ';
    let d = days + ' days';
    if (years === 1) y = years + ' year ';
    if (months === 1) m = months + ' month ';
    if (days === 1) d = days + ' day';
    if (years === 0) y = '';
    if (months === 0) m = '';
    return (y + m + d);
  }

  getDaysSinceDate = (date) => {
    var timeDifference = new Date() - new Date(date);
    var divideBy = 86400000;
    var days = Math.floor(timeDifference/divideBy);

    return days;
  }

  getDaysBetweenDates = (d1, d2) => {
    var timeDifference = new Date(d1) - new Date(d2);
    var divideBy = 86400000;
    var days = Math.floor(timeDifference/divideBy);

    return days;
  }

  formatDate = (date) => {
    return <FormattedDate
      value={date instanceof Date ? date : new Date(date)}
      month='long'
      day='numeric'
      year='numeric'
      children={(string) => string}
    />
  }

  getCompletionDateFromHistory = (activity, history) => {
    if (activity.completed == 'No') return activity;
    var name = activity.subject;
    var activities = [];
    // Get only actions that are of activities being completed
    var actions = history.filter(item => item.type == 'Activity' && item.detail.includes(activity.subject));

    if (actions.length > 0) {
      activity.completeDate = actions[0].date;
      activity.completedOverdueBy = this.getDaysBetweenDates(activity.completeDate, activity.date);
    }
    return activity;
  }

  getAddressFromClient = (clientID) => {
    var client = this.props.wfmClients.filter(client => client.wfmID == clientID);
    if (client.length > 0) {
      var address = client[0].city == '' ? client[0].address : client[0].address + ', ' + client[0].city;
      return address;
    } else {
      return '';
    }
  }

  handleGeocode = (address, clientAddress, lead) => {
    lead.clientAddress = clientAddress;
    // Pick either name or clientAddress to use as the geolocation
    var address = this.checkAddress(address);
    if (address == 'NULL') {
      address = this.checkAddress(clientAddress);
    }

    if (this.props.geocodes[address] != null) {
      console.log('Already there');
      lead.geocode = this.props.geocodes[address];
      this.state.leads = [...this.state.leads, lead,];
      if (lead.geocode.address == "New Zealand" && !lead.isJob) this.setState({ noLocationLeads: [...this.state.noLocationLeads, lead,] });
      if (lead.geocode.address == "New Zealand" && lead.isJob) this.setState({ noLocationJobs: [...this.state.noLocationJobs, lead,] });
    } else {
      let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&components=country:NZ&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`;
      console.log('Getting GEOCODE for ' + address);
      fetch(path).then(response => response.json()).then(response => {
        var gc = this.props.geocodes;
        // TODO response error
        gc[address] = this.simplifiedGeocode(response.results[0]);
        this.props.updateGeocodes(gc);
        lead.geocode = gc[address];
        if (lead.geocode.address == "New Zealand" && !lead.isJob) this.setState({ noLocationLeads: [...this.state.noLocationLeads, lead,] });
        if (lead.geocode.address == "New Zealand" && lead.isJob) this.setState({ noLocationJobs: [...this.state.noLocationJobs, lead,] });

        //Find any items with same geocode

        // console.log(lead);
        this.setState({
          leads: [
            ...this.state.leads,
            lead,
          ],
        });
        return lead;
      });
    }
  }

  checkAddress = (address) => {
    if (address == '') return "NULL";
    // if (address.trim().split(/\s+/).length < 2) return "NULL";

    var geo = this.props.geocodes[encodeURI(address)];

    // ignore all addresses that just return the country
    if (geo != null && geo.address == 'New Zealand') return "NULL";

    // ignore all addresses with blackListed words
    var blacklist = [
      'acoustic',
      'air quality',
      'testing',
      'asbestos',
      'samples',
      'website',
      'query',
      'analysis',
      'pricing',
      'biological',
      'assessment',
      'dust',
      'monitoring',
      'lead',
      'asbetsos',
      'survey',
      'silica',
      'consulting',
      'biologial',
      'emission',
      'mould',
      'noise',
      'stack',
      'welding',
    ];

    var blackListed = false;

    blacklist.forEach(w => {
      if (address.toLowerCase().includes(w)) blackListed = true;
    });

    if (blackListed) return "NULL";

    return encodeURI(address);
  }

  simplifiedGeocode = g => {
    console.log(g);
    return {
      address: g.formatted_address,
      location: [g.geometry.location.lat, g.geometry.location.lng],
      locationType: g.geometry.location_type,
      place: g.place_id,
    }
  }

  getCompletedActivities = (activities) => {
    var completedActivities = activities.filter(activity => activity.completed == 'Yes');
    return completedActivities.sort((a, b) => {
      return new Date(a.completeDate).getTime() -
        new Date(b.completeDate).getTime()
    }).reverse();
  }

  getUncompletedActivities = (activities) => {
    var uncompletedActivities = activities.filter(activity => activity.completed == 'No');
    return uncompletedActivities.sort((a, b) => {
      return new Date(a.date).getTime() -
        new Date(b.date).getTime()
    }).reverse();
  }

  getLastActionDateFromActivities = (completedActivities, defaultDate) => {
    if (completedActivities.length === 0) return defaultDate;
    return completedActivities[0].completeDate;
  }

  getLastActionTypeFromActivities = (completedActivities) => {
    if (completedActivities.length === 0) return 'Lead created';
    return completedActivities[0].subject;
  }

  getAverageCompletedActionOverdueDays = (completedActivities) => {
    if (completedActivities.length === 0) return 0;
    var sum = 0;
    var total = 0;
    completedActivities.forEach((a) => {
      total = total + 1;
      sum = sum + a.completedOverdueBy;
    });
    return Math.floor(sum/total);
  }

  getNextActionType = (activities) => {
    var todo = this.getUncompletedActivities(activities);
    if (todo.length > 0) {
      return todo[0].subject;
    } else {
      return 'Convert to job or add new action';
    }
  }

  getNextActionOverdueBy = (activities) => {
    var todo = this.getUncompletedActivities(activities);
    if (todo.length > 0) {
      return this.getDaysSinceDate(todo[0].date);
    } else {
      return 0;
    }
  }

  addClientStat = (name, stat) => {
    // Add to client stats
    if (this.state.clientStats[name]) {
      this.state.clientStats[name] = {
        ...this.state.clientStats[name],
        [stat]: this.state.clientStats[name][stat] + 1,
      };
    } else {
      this.state.clientStats = {
        ...this.state.clientStats,
        [name]: this.state.clientStatSheet,
      };
      this.state.clientStats[name][stat] = 1;
    }
  }

  addStaffStat = (name, stat) => {
    // Add to total stats
    this.state.staffStats['K2'] = {
      ...this.state.staffStats['K2'],
      [stat]: this.state.staffStats['K2'][stat] + 1,
    };

    // Add to staff stats
    if (this.state.staffStats[name]) {
      this.state.staffStats[name] = {
        ...this.state.staffStats[name],
        [stat]: this.state.staffStats[name][stat] + 1,
      };
    } else {
      this.state.staffStats = {
        ...this.state.staffStats,
        [name]: this.state.statSheet,
      };
      this.state.staffStats[name][stat] = 1;
    }
  }

  averageStaffStat = (name, stat, value) => {
    // Averages in form { number of items, sum, average }

    // Add to total stats
    var average = this.state.staffStats['K2'][stat];

    if (average[0] > 0) {
      average[0] = average[0] + 1;
      average[1] = average[1] + value;
      average[2] = Math.floor(average[1]/average[0]);
    } else {
      average = [1, value, value];
    }

    this.state.staffStats['K2'] = {
      ...this.state.staffStats['K2'],
      [stat]: average,
    };

    // Add to staff stats
    if (this.state.staffStats[name]) {
      var average = this.state.staffStats[name][stat];

      if (average[0] > 0) {
        average[0] = average[0] + 1;
        average[1] = average[1] + value;
        average[2] = Math.floor(average[1]/average[0]);
      } else {
        average = [1, value, value];
      }

      this.state.staffStats[name] = {
        ...this.state.staffStats[name],
        [stat]: average,
      };
    } else {
      this.state.staffStats = {
        ...this.state.staffStats,
        [name]: this.state.statSheet,
      };
      this.state.staffStats[name][stat] = [1, value, value];
    }
  }

  listStaffStat = (name, stat, value) => {
    // Add to total stats
    this.state.staffStats['K2'] = {
      ...this.state.staffStats['K2'],
      [stat]: [...this.state.staffStats[name][stat], value],
    };

    // Add to staff stats
    if (this.state.staffStats[name]) {
      this.state.staffStats[name] = {
        ...this.state.staffStats[name],
        [stat]: [...this.state.staffStats[name][stat], value],
      };
    } else {
      this.state.staffStats = {
        ...this.state.staffStats,
        [name]: this.state.statSheet,
      };
      this.state.staffStats[name][stat] = [value];
    }
  }

  openNoLocationLeads = () => {
    this.setState({
      modal: 'leads',
    })
  }

  openNoLocationJobs = () => {
    this.setState({
      modal: 'jobs',
    })
  }

// Collate Jobs (need booking) and Leads into a set of data that can be displayed nicely
  collateLeadsData = () => {
    console.log('COLLATING LEADS AND JOBS');
    // this.geocodeAddress('aljflasdfj;l','199 Centaurus Road, Christchurch');

    // Filter only jobs that need booking
    var jobsNeedBooking = this.props.wfmJobs.filter(job => {
      return job.state == 'Needs Booking';
    });

    // Convert jobs into a 'lead' type object
    jobsNeedBooking.forEach(job => {
      var lead = {};
      lead.wfmID = job.wfmID;
      lead.client = job.client;
      lead.clientID = job.clientID;
      lead.name = job.address;
      lead.owner = job.manager;
      lead.jobNumber = job.jobNumber;
      lead.creationDate = job.startDate;
      lead.category = job.type;
      // lead.currentStatus = job.currentStatus;
      lead.state = job.state;
      lead.urgentAction = '';
      lead.lastActionDate = job.startDate;
      lead.lastActionType = 'Converted into job';
      lead.daysSinceLastAction = this.getDaysSinceDate(job.startDate);
      lead.nextActionType = 'Book job';
      lead.nextActionOverdueBy = lead.daysSinceLastAction - 30; // Arbitrarily added 30 days as how long between converting to job and booking
      lead.daysOld = this.getDaysSinceDate(lead.creationDate);
      lead.isJob = true;

      // Get extra client information
      // lead.clientAddress = this.getAddressFromClient(lead);
      // lead.geoCode = this.handleGeocode(job.address);

      // Add stats
      this.addStaffStat(lead.owner, 'jobNeedsBookingTotal', 'sum');
      this.averageStaffStat(lead.owner, 'averageJobNeedsBookingAge', this.getDaysSinceDate(lead.creationDate));
      this.listStaffStat(lead.owner, 'jobNeedsBookingAges', this.getDaysSinceDate(lead.creationDate));

      this.handleGeocode(job.address, this.getAddressFromClient(job.clientID), lead);
    });

    var otherJobs = this.props.wfmJobs.filter(job => {
      return job.state != 'Needs Booking';
    });

    // Convert other jobs
    otherJobs.forEach(job => {
      var lead = {};
      lead.wfmID = job.wfmID;
      lead.client = job.client;
      lead.clientID = job.clientID;
      lead.name = job.address;
      lead.owner = job.manager;
      lead.jobNumber = job.jobNumber;
      lead.creationDate = job.startDate;
      lead.category = job.type;
      // lead.currentStatus = job.currentStatus;
      lead.state = job.state;
      lead.urgentAction = '';
      lead.daysOld = this.getDaysSinceDate(lead.creationDate);
      // lead.lastActionDate = job.startDate;
      // lead.lastActionType = 'Converted into job';
      // lead.nextActionType = 'Book job';
      lead.isJob = true;

      this.handleGeocode(job.address, this.getAddressFromClient(job.clientID), lead);
    });

    this.props.wfmLeads.forEach(wfmLead => {
      var lead = {};
      lead.wfmID = wfmLead.wfmID;
      lead.client = wfmLead.client;
      lead.name = wfmLead.name;
      lead.owner = wfmLead.owner;
      lead.jobNumber = 'Lead';
      lead.creationDate = wfmLead.date;
      lead.category = wfmLead.category;
      // lead.currentStatus = wfmLead.currentStatus;
      lead.urgentAction = '';
      lead.value = wfmLead.value;

      // Map actions to history to get completion date of each action
      if (wfmLead.activities[0] == 'NO PLAN!') {
        lead.urgentAction = 'Add Milestones to Lead';
        lead.activities = [];
      } else if (wfmLead.history[0] == 'No History') {
        lead.activities = [];
      } else {
        lead.activities = wfmLead.activities.map(activity => this.getCompletionDateFromHistory(activity, wfmLead.history));
      }

      this.processActivityStats(lead.activities);

      lead.completedActivities = this.getCompletedActivities(lead.activities);

      lead.lastActionDate = this.getLastActionDateFromActivities(lead.completedActivities, lead.creationDate);
      lead.daysSinceLastAction = this.getDaysSinceDate(lead.lastActionDate);
      lead.lastActionType = this.getLastActionTypeFromActivities(lead.completedActivities);

      lead.daysOld = this.getDaysSinceDate(lead.creationDate);
      lead.averageCompletedActionOverdueDays = this.getAverageCompletedActionOverdueDays(lead.completedActivities);
      lead.nextActionType = this.getNextActionType(lead.activities);
      lead.nextActionOverdueBy = this.getNextActionOverdueBy(lead.activities);

      lead.isJob = false;

      // Get extra client information
      // lead.clientAddress = this.getAddressFromClient(wfmLead.clientID);
      // lead.geoCode = this.handleGeocode(wfmLead.name);

      // Add stats
      this.addStaffStat(lead.owner, 'leadTotal');
      this.averageStaffStat(lead.owner, 'averageLeadAge', this.getDaysSinceDate(lead.creationDate));
      this.listStaffStat(lead.owner, 'leadAges', this.getDaysSinceDate(lead.creationDate));

      this.handleGeocode(wfmLead.name, this.getAddressFromClient(wfmLead.clientID), lead);
    });
  }

  filterLabels = (m) => {
    if (m && m.geocode.address != 'New Zealand') {
      if (this.filterCategory(m) && this.filterStage(m)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  filterCategory = (m) => {
    if (m.category.includes(this.state.category) || this.state.category == 'Show All') return true;
      else return false;
  }

  filterStage = (m) => {
    if (this.state.stage == 'Show All') return true;
    if (this.state.stage == 'All Jobs' && m.isJob) return true;
    if (this.state.stage == 'All Job Leads' && !m.isJob) return true;
    if (this.state.stage == 'New Lead' && !m.isJob && m.daysOld < 8) return true;
    if (this.state.stage == 'Leads with Overdue Actions' && !m.isJob && m.nextActionOverdueBy > 0) return true;
    if (this.state.stage == 'Jobs with Overdue Actions' && m.isJob && m.nextActionOverdueBy > 0) return true;
    if (this.state.stage == 'Job Needs Booking' && m.state == 'Needs Booking') return true;
    if (this.state.stage == 'Planned' && m.state == 'Planned') return true;
    if (this.state.stage == 'In Progress' && m.state == 'In Progress') return true;
    if (this.state.stage == 'Job Start Today' && m.state == 'In Progress' && m.daysOld == 0) return true;
    if (this.state.stage == 'Post-Site Work Jobs' && m.isJob && !'NeedsBookingPlannedIn Progress'.includes(m.state)) return true;
    return false;
  }

  switchCategory = cat => {
    this.setState({
      category: cat,
    });
  }

  switchStage = cat => {
    this.setState({
      stage: cat,
    });
  }

  getWfmUrl = (m) => {
    var path;
    if (m.isJob) {
      path = `https://my.workflowmax.com/job/jobview.aspx?id=${m.wfmID}`;
    } else {
      path = `https://my.workflowmax.com/lead/view.aspx?id=${m.wfmID}`;
    }
    console.log(path);
    return path;
  }

  gotoWFM = (m) => {
    console.log('GoTO');
    var path;
    if (m.isJob) {
      path = `https://my.workflowmax.com/job/jobview.aspx?id=${m.wfmID}`;
    } else {
      path = `https://my.workflowmax.com/lead/view.aspx?id=${m.wfmID}`;
    }
    var win = window.open(path, '_blank');
    win.focus();
  }

  onMarkerClick = (marker, m) => {
    this.setState({
      activeMarker: marker,
      m: m,
      showingInfoWindow: true,
    })
  }

  onMouseover = () => {
    this.setState({
      showInfoBox: true,
    })
  }

  onMouseout = () => {
    this.setState({
      showInfoBox: false,
    });
  }

  getIcon = cat => {
    var img = 'other';
    ['asbestos','meth','stack','bio','noise','workplace',].map(i => {
      if (cat.toLowerCase().includes(i)) img = i;
    });
    var url = 'http://my.k2.co.nz/icons/' + img + '.png';
    return url;
  }

  getColour = cat => {
    var col = 'other';
    if (!cat) return '#6fa1b6';
    ['show all','asbestos','meth','stack','bio','noise','workplace',].map(i => {
      if (cat.toLowerCase().includes(i)) col = i;
    });
    switch(col) {
      case 'show all':
        return '#555';
      case 'asbestos':
        return '#7d6d26';
      case 'meth':
        return '#ff0065';
      case 'stack':
        return '#e33714';
      case 'bio':
        return '#87cc14';
      case 'noise':
        return '#995446';
      case 'workplace':
        return '#a2539c';
      default:
        return '#6fa1b6';
    }
  }

  getOffset = (n) => {
    var o = 20;
    var s = Math.floor((n - 1)/8) + 1;
    var mod = (n % 9) + (s - 1);
    if (n == 0) mod = 0;
    // if (n>0) console.log('n: ' + n + ', s: ' + s + ', mod: ' + mod);
    switch(mod) {
      case 0:
        return [0, 0];
      case 1:
        return [s*o, 0];
      case 2:
        return [0, -s*o];
      case 3:
        return [-s*o, 0];
      case 4:
        return [0, s*o];
      case 5:
        return [s*o, s*o];
      case 6:
        return [s*o, -s*o];
      case 7:
        return [-s*o, -s*o];
      case 8:
        return [-s*o, s*o];

      default:
        return [0, 0];
    }
  }

  render() {
    const K_WIDTH = 40;
    const K_HEIGHT = 40;
    const { wfmJobs, wfmLeads, wfmClients, geocodes, classes } = this.props;
    if (wfmJobs.length > 0 && wfmLeads.length > 0 && wfmClients.length > 0 && geocodes && this.state.leads.length === 0) this.collateLeadsData();
    // console.log(this.state.leads);

    const noLocationModal = (
      <Dialog
        maxWidth = "sm"
        fullWidth = { true }
        open={ this.state.modal != null }
        onClose = {() => this.setState({ modal: null })}
      >
      <DialogTitle>{ this.state.modal == 'jobs' ? 'Jobs with No Location Data' : 'Leads with No Location Data' }</DialogTitle>
      <DialogContent>
       { this.state.modal == 'jobs' ?
        this.state.leads && this.state.leads.filter((m) => m.geocode.address == 'New Zealand' && m.isJob).map((m) => {
          return (
            <ListItem
              dense
              className={classes.hoverItem}
              style={{ color: this.getColour(m.category) }}
              onClick={() => { this.gotoWFM(m)}}>
              {m.name} : {m.client}<br />
              {m.category}<br />
            </ListItem>
          )
        })
       :
        this.state.leads && this.state.leads.filter((m) => m.geocode.address == 'New Zealand' && !m.isJob).map((m) => {
          return (
            <ListItem
              dense
              className={classes.hoverItem}
              style={{ color: this.getColour(m.category) }}
              onClick={() => { this.gotoWFM(m)}}>
              {m.name} : {m.client}
            </ListItem>
          )
        })
      }
      </DialogContent>
      </Dialog>
    );

    var addresses = {};

    return (
      <div style = {{ marginTop: 80 }}>
          { this.state.modal && noLocationModal }
          <Grid container spacing={8}>
            { ['Show All','All Job Leads','New Lead','Leads with Overdue Actions','All Jobs','Jobs with Overdue Actions','Job Needs Booking','Planned','In Progress','Job Start Today','Post-Site Work Jobs',].map(cat => {
              return (
                <Grid item key={cat}>
                  <Button style={{ fontSize: 12 }} variant="outlined" color={this.state.stage === cat ? "secondary" : "primary"} onClick={() => this.switchStage(cat)}>
                    {cat}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
          <Divider style = {{ marginTop: 20, marginBottom: 20, }} />
          <Grid container spacing={8} style={{ marginBottom: 20 }}>
            { ['Show All','Asbestos','Meth','Stack','Noise','Bio','Workplace','Other',].map(cat => {
              var colour = this.getColour(cat);
              return (
                <Grid item key={cat}>
                  <Button variant="outlined" color={this.state.category === cat ? "secondary" : "primary"} onClick={() => this.switchCategory(cat)}>
                    <span style={{ fontSize: 12, color: colour }}>{cat}</span>
                  </Button>
                </Grid>
              );
            })}
            {this.state.noLocationJobs && <Grid item>
              <Button onClick={this.openNoLocationJobs}>
                <span style={{ fontSize: 12 }}>View Jobs With No Location Data ({this.state.leads && this.state.leads.filter((m) => m.geocode.address == 'New Zealand' && m.isJob).length})</span>
              </Button>
            </Grid>}
            {this.state.noLocationLeads && <Grid item>
              <Button onClick={this.openNoLocationLeads}>
                <span style={{ fontSize: 12 }}>View Leads With No Location Data ({this.state.leads && this.state.leads.filter((m) => m.geocode.address == 'New Zealand' && !m.isJob).length})</span>
              </Button>
            </Grid>}
          </Grid>
          <Divider />
          <Map
            google={this.props.google}
            zoom={6.27}
            style={mapStyles}
            initialCenter={{
              lat: -40.9261681,
              lng: 174.4070603
            }}
          >
            {
              this.state.leads.map(m => {
                if (this.filterLabels(m)) {
                  if (addresses[m.geocode.address] >= 0) {
                    addresses[m.geocode.address] = addresses[m.geocode.address] + 1;
                    console.log(m.jobNumber + ': ' + m.geocode.address + ' (' + addresses[m.geocode.address] + ')');
                  } else {
                    addresses[m.geocode.address] = 0;
                  }
                  var url = this.getIcon(m.category);
                  return(
                    <Marker
                      key={m.wfmID}
                      onClick={(props, marker, e) => { this.onMarkerClick(marker, m) }}
                      position={{ lat: m.geocode.location[0], lng: m.geocode.location[1] }}
                      title={`${m.jobNumber}: ${m.client}`}
                      icon={{
                        url: url,
                        anchor: new this.props.google.maps.Point(16 + this.getOffset(addresses[m.geocode.address])[0], 16 + this.getOffset(addresses[m.geocode.address])[1]),
                        scaledSize: new this.props.google.maps.Size(32,32)
                      }}
                      />
                    );
                  }
              })
            }
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}>
                <div style={{ width: 300, lineHeight: 2, fontSize: 14, padding: 20, }}>
                  <div><h5 style={{ color: this.getColour(this.state.m.category) }}>{this.state.m.jobNumber}: {this.state.m.client}</h5></div>
                  <div style={{ color: this.getColour(this.state.m.category)}}><h6>{this.state.m.category}</h6></div>
                  {this.state.m.geocode && <div><i>{this.state.m.geocode.address}</i></div>}
                  {this.state.m.state && <div><b>State:</b> {this.state.m.state}</div>}
                  <div><b>Owner:</b> {this.state.m.owner}</div>
                  {this.state.m.lastActionType &&
                    <div><b>Last Action:</b> {this.state.m.lastActionType} ({this.state.m.daysSinceLastAction} days ago)</div>
                  }
                  {this.state.m.nextActionType && <div><b>Next Action:</b> {this.state.m.nextActionType} {this.state.m.nextActionOverdueBy > 0 ? <span style={{ fontColor: '#ff0000', textDecoration: 'underline', }}>(Overdue by {this.state.m.nextActionOverdueBy} days)</span> : <span>(Due in {this.state.m.nextActionOverdueBy * -1} days)</span>}</div>}
                  {this.state.m.value > 0 && <div><b>Estimated Value:</b> ${this.state.m.value} </div>}
                  <div style={{ padding: 16, textAlign: 'center', }}>
                  <Button variant="outlined" style={{ borderRadius: 20, }}>
                    <a style={{ textDecoration: 'none', color: '#FF2D00'}} target="_blank" href={this.getWfmUrl(this.state.m)}>View on WorkflowMax</a>
                  </Button>
                  </div>
                </div>
            </InfoWindow>
          </Map>
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(GoogleApiWrapper({apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY})(JobMap)));
