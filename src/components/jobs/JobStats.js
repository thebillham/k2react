import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";

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

import { filterMap, filterMapReset } from "../../actions/display";

const mapStateToProps = (state) => {
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
    wfmAccessToken: state.local.wfmAccessToken,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchWFMJobs: (accessToken, refreshToken) =>
      dispatch(fetchWFMJobs(accessToken, refreshToken)),
    fetchWFMLeads: (accessToken, refreshToken) =>
      dispatch(fetchWFMLeads(accessToken, refreshToken)),
    fetchWFMClients: (accessToken, refreshToken) =>
      dispatch(fetchWFMClients(accessToken, refreshToken)),
    fetchCurrentJobState: (ignoreCompleted) =>
      dispatch(fetchCurrentJobState(ignoreCompleted)),
    saveCurrentJobState: (state) => dispatch(saveCurrentJobState(state)),
    saveGeocodes: (g) => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: (g) => dispatch(updateGeocodes(g)),
    saveWFMItems: (items) => dispatch(saveWFMItems(items)),
    saveStats: (stats) => dispatch(saveStats(stats)),
    filterMap: (filter) => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    collateJobsList: (
      wfmJobs,
      wfmLeads,
      currentJobState,
      wfmClients,
      geocodes
    ) =>
      dispatch(
        collateJobsList(
          wfmJobs,
          wfmLeads,
          currentJobState,
          wfmClients,
          geocodes
        )
      ),
  };
};

class JobStats extends React.Component {
  state = {
    searchJobNumber: "",
    searchClient: "",
    searchStartDate: "",
    searchEndDate: "",
    searchDateType: "",
    searchAnalyst: "",
    tabValue: 0,
  };

  UNSAFE_componentWillMount() {
    if (this.props.jobList && Object.keys(this.props.jobList).length === 0) {
      this.getWFMData();
      this.props.fetchCurrentJobState(false);
      if (this.props.geocodes === undefined) this.props.fetchGeocodes();
    }
  }

  getWFMData = () => {
    if (this.props.wfmAccessToken && this.props.me) {
      // console.log(this.props.clients);
      if (!this.props.wfmJobs || this.props.wfmJobs.length === 0) {
        this.props.fetchWFMJobs(
          this.props.wfmAccessToken,
          this.props.me.wfmRefreshToken
        );
      }
      if (!this.props.wfmLeads || this.props.wfmLeads.length === 0) {
        this.props.fetchWFMLeads(
          this.props.wfmAccessToken,
          this.props.me.wfmRefreshToken
        );
      }
      if (!this.props.wfmClients || this.props.wfmClients.length === 0) {
        this.props.fetchWFMClients(
          this.props.wfmAccessToken,
          this.props.me.wfmRefreshToken
        );
      }
    } else {
      console.log("token not here yet");
      setTimeout(this.getWFMData, 500);
    }
  };

  componentWillUnmount() {
    this.props.jobList &&
      Object.keys(this.props.jobList).length > 0 &&
      this.props.saveWFMItems(
        Object.values(this.props.jobList).filter(
          (lead) => lead.wfmState != "Completed" && lead.state != "Completed"
        )
      );
    this.props.saveCurrentJobState(this.props.jobList);
    this.props.saveGeocodes(this.props.geocodes);
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
    // if (value === 3) this.computeStats();
  };

  render() {
    const {
      wfmJobs,
      wfmLeads,
      wfmClients,
      classes,
      currentJobState,
      jobList,
      geocodes,
    } = this.props;
    if (
      wfmJobs.length > 0 &&
      wfmLeads.length > 0 &&
      wfmClients.length > 0 &&
      currentJobState !== undefined &&
      Object.values(currentJobState).length > 0 &&
      jobList &&
      Object.values(jobList).length === 0
    )
      this.props.collateJobsList(
        wfmJobs,
        wfmLeads,
        currentJobState,
        wfmClients,
        geocodes
      );
    return (
      <div className={classes.marginTopStandard}>
        <div className={classes.paleLarge}>Under Development</div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(JobStats)
);
