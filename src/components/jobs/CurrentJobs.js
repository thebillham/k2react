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
    collateJobsList: (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch(collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes)),
  };
};

class CurrentJobs extends React.Component {
  state = {
    jobModal: null,
  };

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState, jobList, geocodes, that } = this.props;
    const daysSinceLastJobAction = this.props.otherOptions.filter(opt => opt.option === "daysSinceLastJobAction")[0].value ? parseInt(this.props.otherOptions.filter(opt => opt.option === "daysSinceLastJobAction")[0].value) : 15;

    let jobs = jobList ? Object.values(jobList).filter(m => {
      let res = true;
      if (!m.isJob || m.wfmState === "Completed") res = false;

      if (this.props.search) {
        // console.log(this.props.search);
        let terms = this.props.search.split(" ");
        let search =
          m.jobNumber + " " + m.client + " " + m.category + " " + m.owner + " " + m.name;
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
          data={jobs}
          getTrProps={(state, rowInfo) => ({
            onClick: () => that.setState({ jobModal: rowInfo.original})
          })}
          columns={
            [{
            id: 'jobNumber',
            Header: 'Job Number',
            accessor: d => d.jobNumber,
            Cell: c => <span>
              <a
                className={classes.urlSubtle}
                target="_blank"
                rel="noopener noreferrer"
                href={getWfmUrl(c.original)}
              >
                {c.value}
              </a></span>,
            maxWidth: 100,
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
            Header: 'State',
            accessor: 'wfmState',
          },{
            id: 'daysSinceLastAction',
            Header: 'State Changed',
            accessor: d => d.lastActionDate,
            Cell: c => <span className={getDaysSinceDate(c.value) > daysSinceLastJobAction ? classes.red : classes.black}>{getDaysSinceDateAgo(c.value)}</span>,
          },{
            id: 'dueDate',
            Header: 'Due Date',
            accessor: d => d.dueDate,
            Cell: c =>
              <span className={dateOf(c.value) < new Date() ? classes.red : classes.black}>
                {c.value !== "" ? moment(dateOf(c.value)).format('D MMMM YYYY') : "Due date not set"}
              </span>
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
