import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
import ReactTable from 'react-table';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import JobCard from './JobCard';
import { FormattedDate } from 'react-intl';

import { fetchWFMJobs, fetchWFMLeads } from '../../actions/local';

const mapStateToProps = state => {
  return {
    wfmJobs: state.local.wfmJobs,
    wfmLeads: state.local.wfmLeads,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
  }
}

class Jobs extends React.Component {
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
      leadsData: [],
      statSheet: statSheet,
      staffStats: {
        'K2': statSheet,
      },
    }
  }

  componentWillMount() {
    this.props.fetchWFMJobs();
    this.props.fetchWFMLeads();
  }

  processActivityStats = (activities) => {
    activities.forEach(a => {
      // Check if activity is completed
      if (a.completed == 'Yes') {
        this.addStaffStat(a.responsible, 'completedActions');
        var overdueDays = this.getDaysBetweenDates(a.completeDate, a.date);
        this.listStaffStat(a.responsible, 'completedActionOverdueDays', overdueDays);
        this.averageStaffStat(a.responsible, 'averageCompletedActionOverdueDays', overdueDays);
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
    }
    return activity;
  }

  getCompletedActivities = (activities) => {
    var completedActivities = activities.filter(activity => activity.completed == 'Yes');
    completedActivities.sort((a, b) => {
      return new Date(a.completeDate).getTime() -
        new Date(b.completeDate).getTime()
    }).reverse();
    return completedActivities;
  }

  getLastActionDateFromActivities = (completedActivities, defaultDate) => {
    if (completedActivities.length === 0) return defaultDate;
    return completedActivities[0].completeDate;
  }

  getLastActionTypeFromActivities = (completedActivities) => {
    if (completedActivities.length === 0) return 'Lead created';
    return completedActivities[0].subject;
  }

  getAverageActionOverdueDays = (completedActivities) => {
    return 0;
  };

  getNextActionOverdueBy = (activities) => {
    return 0;
  };

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
      average[2] = average[1]/average[0];
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
        average[2] = average[1]/average[0];
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

// Collate Jobs (need booking) and Leads into a set of data that can be displayed nicely
  collateLeadsData = () => {
    // Filter only jobs that need booking
    var jobsNeedBooking = this.props.wfmJobs.filter(job => {
      return job.state == 'Needs Booking';
    });

    // Convert jobs into a 'lead' type object
    var jobs = jobsNeedBooking.map(job => {
      var lead = {};
      lead.wfmID = job.wfmID;
      lead.client = job.client;
      lead.name = job.address;
      lead.owner = job.manager;
      lead.jobNumber = job.jobNumber;
      lead.creationDate = job.startDate;
      lead.category = job.type;
      lead.currentStatus = job.currentStatus;
      lead.urgentAction = '';
      lead.lastActionDate = job.startDate;
      lead.lastActionType = 'Converted into job';
      lead.daysOld = this.getDaysSinceDate(lead.creationDate);
      lead.isJob = true;

      // Add stats
      this.addStaffStat(lead.owner, 'jobNeedsBookingTotal', 'sum');
      this.averageStaffStat(lead.owner, 'averageJobNeedsBookingAge', this.getDaysSinceDate(lead.creationDate));
      this.listStaffStat(lead.owner, 'jobNeedsBookingAges', this.getDaysSinceDate(lead.creationDate));

      return lead;
    });

    var leads = this.props.wfmLeads.map(wfmLead => {
      var lead = {};
      lead.wfmID = wfmLead.wfmID;
      lead.client = wfmLead.client;
      lead.name = wfmLead.name;
      lead.owner = wfmLead.owner;
      lead.jobNumber = '-';
      lead.creationDate = wfmLead.date;
      lead.category = wfmLead.category;
      lead.currentStatus = wfmLead.currentStatus;
      lead.urgentAction = '';

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
      lead.lastActionType = this.getLastActionTypeFromActivities(lead.completedActivities);

      lead.daysOld = this.getDaysSinceDate(lead.creationDate);
      lead.averageActionOverdueDays = this.getAverageActionOverdueDays(lead.completedActivities);
      lead.nextActionOverdueBy = this.getNextActionOverdueBy(lead.activities);

      lead.isJob = false;

      // Add stats
      this.addStaffStat(lead.owner, 'leadTotal');
      this.averageStaffStat(lead.owner, 'averageLeadAge', this.getDaysSinceDate(lead.creationDate));
      this.listStaffStat(lead.owner, 'leadAges', this.getDaysSinceDate(lead.creationDate));

      return lead;
    });
    console.log(jobs);
    console.log(leads);
    console.log(this.state.staffStats);
  }

  render() {
    const { wfmJobs, wfmLeads } = this.props;

    if (wfmJobs && wfmLeads && !this.leadsData) this.collateLeadsData();

    return (
      <div style = {{ marginTop: 80 }}>
        {wfmLeads &&
        <ReactTable
          data={wfmLeads}
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Category",
              accessor: "category"
            },
            {
              Header: "Client",
              accessor: "client"
            },
            {
              Header: "Owner",
              accessor: "owner"
            },
            {
              Header: "Date",
              id: "date",
              accessor: d => <FormattedDate value={d.date instanceof Date ? d.date : new Date(d.date)} month='long' day='numeric' year='numeric' />
            },
            {
              Header: "How Old",
              id: "howold",
              accessor: d => d.date instanceof Date ? this.displayTimeDifference(d.date) : this.displayTimeDifference(new Date(d.date))
            }
          ]}
          defaultSorted={[
            {
              id: "ID",
              desc: true,
            }
          ]}
          defaultPageSize={25}
          className="-striped -highlight"
          />
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Jobs);
