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
} from "../../actions/jobs";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

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

class JobStats extends React.Component {
  state = {
    searchJobNumber: '',
    searchClient: '',
    searchStartDate: '',
    searchEndDate: '',
    searchDateType: '',
    searchAnalyst: '',
    tabValue: 0,
  };

  UNSAFE_componentWillMount() {
    if (this.props.jobList && Object.keys(this.props.jobList).length === 0) {
      if (this.props.wfmJobs.length === 0) this.props.fetchWFMJobs();
      if (this.props.wfmLeads.length === 0) this.props.fetchWFMLeads();
      if (this.props.wfmClients.length === 0) this.props.fetchWFMClients();
      this.props.fetchCurrentJobState(false);
      if(this.props.geocodes === undefined) this.props.fetchGeocodes();
    }
  }

  componentWillUnmount() {
    this.props.jobList && Object.keys(this.props.jobList).length > 0 && this.props.saveWFMItems(Object.values(this.props.jobList).filter((lead) => (lead.wfmState != 'Completed' && lead.state != 'Completed')));
    this.props.saveCurrentJobState(this.props.jobList);
    this.props.saveGeocodes(this.props.geocodes);
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
    // if (value === 3) this.computeStats();
  };

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState, jobList, geocodes, } = this.props;
    if (
      wfmJobs.length > 0 &&
      wfmLeads.length > 0 &&
      wfmClients.length > 0 &&
      currentJobState !== undefined && Object.values(currentJobState).length > 0 &&
      jobList && Object.values(jobList).length === 0
    )
      this.props.collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes, );
    return (
      <div className={classes.marginTopStandard}>
        <div className={classes.paleLarge}>Under Development</div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(JobStats)
);
