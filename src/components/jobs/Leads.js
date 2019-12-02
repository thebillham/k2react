import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";

//Modals
import { showModal } from "../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';

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
  collateJobsList,
  getJobColor,
  getWfmUrl,
  getWfmClientUrl,
  getGoogleMapsUrl,
  getNextActionType,
  getLeadHistoryDescription,
} from "../../actions/jobs";

import {
  getDaysSinceDate,
  getDaysSinceDateAgo,
  dateOf,
  convertYYYYMMDD,
} from "../../actions/helpers";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

import JobMap from "./JobMap";

const mapStateToProps = state => {
  return {
    wfmJobs: state.jobs.wfmJobs,
    wfmLeads: state.jobs.wfmLeads,
    wfmClients: state.jobs.wfmClients,
    currentJobState: state.jobs.currentJobState,
    geocodes: state.jobs.geocodes,
    wfmItems: state.jobs.wfmItems,
    wfmStats: state.jobs.wfmStats,
    jobList: state.jobs.jobList,
    search: state.local.search,
    me: state.local.me,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
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

class Leads extends React.Component {
  state = {
    jobModal: null,
  };

  openJobModal = m => {
    this.setState({
      jobModal: m
    });
  };

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState, jobList, geocodes, that, } = this.props;
    const daysSinceLastLeadAction = this.props.otherOptions.filter(opt => opt.option === "daysSinceLastLeadAction")[0].value ? parseInt(this.props.otherOptions.filter(opt => opt.option === "daysSinceLastLeadAction")[0].value) : 30;

    let leads = jobList ? Object.values(jobList).filter(m => {
      let res = true;
      if (m.isJob) res = false;
      if (this.props.search) {
        // console.log(this.props.search);
        let terms = this.props.search.split(" ");
        let search =
          m.client + " " + m.category + " " + m.owner + " " + m.name;
        if (m.geocode) search = search + " " + m.geocode.address;
        terms.forEach(term => {
          if (!search.toLowerCase().includes(term.toLowerCase())) {
            res = false;
          } else {
            // console.log(term);
            // console.log(search);
          }
        });
      }
      return res;
    }) : [];

    return (
      <div className={classes.marginBottomSmall}>
        <ReactTable
          style={{
            cursor: 'alias',
          }}
          data={leads}
          getTrProps={(state, rowInfo) => ({
            onClick: () => that.setState({ jobModal: rowInfo.original})
          })}
          columns={
            [{
            id: 'jobNumber',
            Header: 'WFM Link',
            Cell: c => <span>
              <a
                className={classes.urlSubtle}
                target="_blank"
                rel="noopener noreferrer"
                href={getWfmUrl(c.original)}
              >
                WFM
              </a></span>,
            maxWidth: 80,
          },{
            id: 'client',
            Header: 'Client',
            accessor: d => d.client,
            Cell: c => <span>
              <a
                className={classes.urlSubtle}
                target="_blank"
                rel="noopener noreferrer"
                href={getWfmClientUrl(c.original)}
              >
                {c.value}
              </a>
            </span>,
          },{
            Header: 'Name',
            accessor: 'name',
          },{
            Header: 'Manager',
            accessor: 'owner',
          },{
            id: 'nextAction',
            Header: 'Next Goal',
            accessor: d => d.nextActionType,
          },{
            id: 'nextGoalDue',
            Header: 'Next Goal Due',
            accessor: d => dateOf(d.nextActionDate),
            Cell: c => c.value ? <span className={getDaysSinceDate(c.value) > 0 ? classes.red : classes.black}>{getDaysSinceDateAgo(c.value)}</span> : <span className={classes.orange}>No Goal Set</span>,
          },{
            id: 'daysSinceLastGoal',
            Header: 'Last Goal Completed',
            accessor: d => dateOf(d.lastActionDate),
            Cell: c => getDaysSinceDateAgo(c.value),
          },{
            id: 'daysSinceLastAction',
            Header: 'Last Action',
            accessor: d => d.history && d.history.length > 0 && d.history[0].date,
            Cell: c => c.value ? <span className={getDaysSinceDate(c.value) > daysSinceLastLeadAction ? classes.red : classes.black}>{getDaysSinceDateAgo(c.value)}</span> : <span className={classes.orange}>No actions</span>,
          },{
            id: 'lastActionType',
            Header: 'Last Action Type',
            accessor: d => d.history && d.history.length > 0 ? getLeadHistoryDescription(d.history[0]).title : 'No actions',
          },{
            Header: 'Category',
            accessor: 'category',
          },{
            id: 'geocodeAddress',
            Header: 'Google Maps',
            accessor: d => d.geocode.address,
            Cell: c => <span>
              <a
                className={classes.urlSubtle}
                target="_blank"
                rel="noopener noreferrer"
                href={getGoogleMapsUrl(c.original)}
              >
                {c.value}
              </a>
            </span>
          }]}
          defaultPageSize={25}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Leads)
);
