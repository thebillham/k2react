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
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ReactTable from 'react-table';
import 'react-table/react-table.css';

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
  getWfmUrl,
  getWfmClientUrl,
  getGoogleMapsUrl,
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

import moment from 'moment';

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
    collateJobsList: (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch(collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes)),
  };
};

class CurrentJobs extends React.Component {
  state = {
    jobModal: null,
  };

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState, jobList, geocodes, that } = this.props;
    let jobs = jobList ? Object.values(jobList).filter(job => job.isJob && job.wfmState !== "Completed").sort((a, b) => {
      return a.client.localeCompare(b.client);
    }) : [];

    return (
      <div className={classes.marginBottomSmall}>
        <ReactTable
          data={jobs}
          getTrProps={(state, rowInfo) => ({
            onClick: () => that.setState({ jobModal: rowInfo.original})
          })}
          columns={
            [{
            id: 'jobNumber',
            Header: 'Job Number',
            accessor: d => <span>
              <a
                className={classes.url}
                target="_blank"
                rel="noopener noreferrer"
                href={getWfmUrl(d)}
              >
                {d.jobNumber}
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
            Header: 'State',
            accessor: 'wfmState',
          },{
            id: 'daysSinceLastAction',
            Header: 'State Changed',
            accessor: d => getDaysSinceDateAgo(d.lastActionDate),
            sortMethod: (a, b, desc) => {
              console.log(desc);
              if (parseInt(a.replace(/ .*/, '')) > parseInt(b.replace(/ .*/, ''))) {
                if (desc) return -1;
                else return 1;
              }
              if (parseInt(b.replace(/ .*/, '')) > parseInt(a.replace(/ .*/, ''))) {
                if (desc) return 1;
                else return -1;
              }
              return 0;
            }
          },{
            id: 'dueDate',
            Header: 'Due Date',
            accessor: d => <span>{d.dueDate !== "" ? moment(dateOf(d.dueDate)).format('D MMMM YYYY') : "Due date not set"}</span>,
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
  )(CurrentJobs)
);
