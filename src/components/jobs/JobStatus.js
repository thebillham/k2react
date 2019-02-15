import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
import ReactTable from 'react-table';
import StaffIcon from '@material-ui/icons/People';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import JobCard from './JobCard';
import { FormattedDate } from 'react-intl';
// import GoogleMapReact from 'google-map-react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

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
    wfmStats: state.local.wfmStats,
  }
}

class JobStatus extends React.Component {
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
      statSheet: statSheet,
      staffStats: {
        'K2': statSheet,
      },
      stage: 'Show All',
      category: 'Show All',
      clientStats: {},
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
    } else {
      let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&components=country:NZ&key=${process.env.REACT_APP_GOOGLE_API_KEY}`;
      console.log('Getting GEOCODE for ' + address);
      fetch(path).then(response => response.json()).then(response => {
        var gc = this.props.geocodes;
        gc[address] = this.simplifiedGeocode(response.results[0]);
        this.props.updateGeocodes(gc);
        lead.geocode = gc[address];
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

  render() {
    const K_WIDTH = 40;
    const K_HEIGHT = 40;
    const { wfmJobs, wfmLeads, wfmClients, geocodes, } = this.props;
    if (wfmJobs.length > 0 && wfmLeads.length > 0 && wfmClients.length > 0 && geocodes && this.state.leads.length === 0) this.collateLeadsData();
    // console.log(this.state.leads);
    return (
      <div style = {{ marginTop: 80 }}>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(JobStatus);
