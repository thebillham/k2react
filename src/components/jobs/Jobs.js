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
    collateJobsList: (wfmJobs, wfmLeads, currentJobState, wfmClients) => dispatch(collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients)),
  };
};

class Jobs extends React.Component {
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
    const { sampleLog, classes } = this.props;
    return (
      <div className={classes.marginTopStandard}>
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
        </Tabs>
        {this.state.tabValue !== 2 && (<div className={classes.paleLarge}>Under Development</div>)}
        {/*
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
        )}*/}
        {this.state.tabValue === 2 && <JobMap />}
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
  )(Jobs)
);
