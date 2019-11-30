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
    let leads = jobList ? Object.values(jobList).filter(job => !job.isJob).sort((a, b) => {
      return a.client.localeCompare(b.client);
    }) : [];

    return (
      <div className={classes.marginBottomSmall}>
        <ReactTable
          data={leads}
          columns={[{
            Header: 'WFM ID',
            accessor: 'wfmID',
          },{
            Header: 'Client',
            accessor: 'client',
          },{
            Header: 'Category',
            accessor: 'category',
          },{
            id: 'geocodeAddress',
            Header: 'Geocode',
            accessor: d => d.geocode.address,
          }
          ]}
          getTrProps={(state, rowInfo) => ({
            onClick: () => that.setState({ jobModal: rowInfo.original})
          })}
          columns={
            [{
            id: 'jobNumber',
            Header: 'WFM Link',
            accessor: d => <span>
              <a
                className={classes.url}
                target="_blank"
                rel="noopener noreferrer"
                href={getWfmUrl(d)}
              >
                WFM
              </a></span>,
            maxWidth: 100,
          },{
            id: 'client',
            Header: 'Client',
            accessor: d => <span>
              <a
                className={classes.url}
                target="_blank"
                rel="noopener noreferrer"
                href={getWfmClientUrl(d)}
              >
                {d.client}
              </a>
            </span>,
          },{
            Header: 'Name',
            accessor: 'name',
          },{
            id: 'nextAction',
            Header: 'Next Goal',
            accessor: d => getNextActionType(d.activities),
          },{
            id: 'daysSinceLastGoal',
            Header: 'Last Goal Completed',
            accessor: d => getDaysSinceDateAgo(d.lastActionDate),
          },{
            id: 'daysSinceLastAction',
            Header: 'Last Action',
            accessor: d => d.history && d.history.length > 0 ? getDaysSinceDateAgo(moment(dateOf(d.history[0].date)).format('DD MMMM YYYY')) : 'No actions',
          },{
            Header: 'Category',
            accessor: 'category',
          },{
            id: 'geocodeAddress',
            Header: 'Google Maps',
            accessor: d => <span>
              <a
                className={classes.url}
                target="_blank"
                rel="noopener noreferrer"
                href={getGoogleMapsUrl(d)}
              >
                {d.geocode.address}
              </a>
            </span>
          }
          ]}
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
