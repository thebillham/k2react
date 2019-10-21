import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import ListItem from "@material-ui/core/ListItem";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Input from "@material-ui/core/Input";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import moment from "moment";
import { auth, usersRef } from "../../config/firebase";
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";

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
} from "../../actions/local";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

const mapStateToProps = state => {
  return {
    wfmJobs: state.local.wfmJobs,
    wfmLeads: state.local.wfmLeads,
    wfmClients: state.local.wfmClients,
    currentJobState: state.local.currentJobState,
    geocodes: state.local.geocodes,
    wfmItems: state.local.wfmItems,
    wfmStats: state.local.wfmStats,
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

class JobStats extends React.Component {
  constructor(props) {
    super(props);

    // Set up stat sheet for new names
    // Averages in form { number of items, sum, average }
    var statSheet = {
      // Totals
      jobNeedsBookingTotal: 0,
      leadTotal: 0,
      jobTotal: 0,
      completedActions: 0,
      overdueActions: 0,
      upcomingActions: 0,
      valueTotal: 0,

      // Averages
      averageActionOverdueDays: [0, 0, 0],
      averageCompletedActionOverdueDays: [0, 0, 0],
      averageCurrentOverdueDays: [0, 0, 0],
      averageLeadAge: [0, 0, 0],
      averageJobAge: [0, 0, 0],
      averageJobNeedsBookingAge: [0, 0, 0],

      // List of ages to be graphed
      leadAges: [],
      jobAges: [],
      jobNeedsBookingAges: [],
      actionOverdueDays: [],
      completedActionOverdueDays: []
    };

    this.state = {
      leads: [],
      tabValue: 0,
      statSheet: statSheet,
      staffStats: {
        K2: statSheet
      },
      clientStats: {},
      activeMarker: {},
      showingInfoWindow: false,
      m: {},
      geocodeCount: 0,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.wfmJobs !== nextProps.wfmJobs) return true;
    if (this.props.wfmLeads !== nextProps.wfmLeads) return true;
    if (this.props.filter !== nextProps.filter) return true;
    // if (this.state.leads !== nextState.leads) return true;
    if (this.state.m !== nextState.m) return true;
    if (this.state.modal !== nextState.modal) return true;
    if (this.state.jobModal !== nextState.jobModal) return true;
    if (this.state.activeMarker !== nextState.activeMarker) return true;
    if (this.state.showingInfoWindow !== nextState.showingInfoWindow) return true;
    return false;
  }

  UNSAFE_componentWillMount() {
    if (this.state.leads.length === 0) {
      if (this.props.wfmJobs.length === 0) this.props.fetchWFMJobs();
      if (this.props.wfmLeads.length === 0) this.props.fetchWFMLeads();
      if (this.props.wfmClients.length === 0) this.props.fetchWFMClients();
      this.props.fetchCurrentJobState(false);
      if(this.props.geocodes === undefined) this.props.fetchGeocodes();
    }
  }

  componentWillUnmount() {
    // Object.keys(this.state.leads).forEach(lead => {
    //   if (lead.wfmState) console.log(lead.wfmState);
    // });
    // console.log(this.state.leads);
    // console.log(this.state.leads.filter((lead) => (lead.wfmState != 'Completed' && lead.state != 'Completed')));
    this.props.saveWFMItems(this.state.leads.filter((lead) => (lead.wfmState != 'Completed' && lead.state != 'Completed')));
    this.props.saveCurrentJobState(this.state.leads);
    this.props.saveGeocodes(this.props.geocodes);
    // this.props.saveStats({
    //   staff: this.state.staffStats,
    //   clients: this.state.clientStats
    // });
  }

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState } = this.props;
    if (
      wfmJobs.length > 0 &&
      wfmLeads.length > 0 &&
      wfmClients.length > 0 &&
      this.state.leads.length === 0
    )
      this.collateLeadsData();

    var addresses = {};

    return (
      <div style={{ marginTop: 80 }}>
        <div style={{ marginBottom: 20 }}>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              Filter View
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <Grid container spacing={1}>
                  <Grid item>
                    <Button
                      style={{ fontSize: 12 }}
                      variant="outlined"
                      color="default"
                      onClick={this.resetFilter}
                    >
                      Reset Filter
                    </Button>
                  </Grid>
                  {[
                    "Leads",
                    "Jobs",
                  ].map(chip => {
                    return (
                      <Grid item key={chip}>
                        <Button
                          style={{ fontSize: 12 }}
                          variant="outlined"
                          color={
                            this.props.filter.filterJobLead === chip ? "secondary" : "default"
                          }
                          onClick={() => this.filterSet(chip,"JobLead")}
                        >
                          {chip}
                        </Button>
                      </Grid>
                    )
                  })}
                  <Grid>
                    <FormControlLabel
                      style={{ marginLeft: 1, }}
                      control={
                        <Checkbox
                          checked={this.props.filter.filterViewCompleted}
                          onChange={(event) => { this.props.filterMap({
                            ...this.props.filter,
                            filterViewCompleted: event.target.checked,
                          })}}
                          value='filterViewCompleted'
                          color='secondary'
                        />
                      }
                      label="Show Completed Jobs and Leads"
                    />
                  </Grid>
                  <Grid>
                    <FormControlLabel
                      style={{ marginLeft: 1, }}
                      control={
                        <Checkbox
                          checked={this.props.filter.filterK2Jobs}
                          onChange={(event) => { this.props.filterMap({
                            ...this.props.filter,
                            filterK2Jobs: event.target.checked,
                          })}}
                          value='filterK2Jobs'
                          color='secondary'
                        />
                      }
                      label="Show In-House Jobs"
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={1} style={{ marginBottom: 8 }}>
                  {[
                    "Lead",
                    "On Hold",
                    "Needs Booking",
                    "Planned",
                    "Site Work",
                    "Lab",
                    "Report",
                    "Admin",
                    "Completed",
                  ].map(chip => {
                    return (
                      <Grid item key={chip}>
                        <Button
                          style={{ fontSize: 12 }}
                          variant="outlined"
                          color={
                            this.props.filter.filterState === chip ? "secondary" : "default"
                          }
                          onClick={() => this.filterSet(chip,"State")}
                        >
                          {chip}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
                <Grid container spacing={1} style={{ marginBottom: 8 }}>
                  {[
                    "Asbestos",
                    "Meth",
                    "Stack",
                    "Noise",
                    "Bio",
                    "Workplace",
                    "Other"
                  ].map(chip => {
                    var color = this.getColor(chip);
                    return (
                      <Grid item key={chip}>
                        <Button
                          style={{ fontSize: 12, color: color }}
                          variant="outlined"
                          color={
                            this.props.filter.filterCategory === chip
                              ? "secondary"
                              : "default"
                          }
                          onClick={() => this.filterSet(chip,"Category")}
                        >
                          {chip}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
                <Grid container spacing={1}>
                  <Grid style={{ fontSize: 14 }}>
                    <Checkbox
                      checked={this.props.filter.filterUpdatedInTheLast}
                      onChange={(event) => { this.props.filterMap({
                        ...this.props.filter,
                        filterUpdatedInTheLast: event.target.checked,
                      })}}
                      value='filterUpdatedInTheLast'
                      color='secondary'
                    />

                    Only show jobs/leads that haven't been updated for
                    <Input
                      className={classes.formInputNumber}
                      type='number'
                      value={this.props.filter.updatedInTheLast}
                      onChange={(event) => this.props.filterMap({
                        ...this.props.filter,
                        updatedInTheLast: event.target.value,
                      })}
                    />
                    days or more
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid style={{ fontSize: 14 }}>
                    <Checkbox
                      checked={this.props.filter.filterCreatedInTheLast}
                      onChange={(event) => { this.props.filterMap({
                        ...this.props.filter,
                        filterCreatedInTheLast: event.target.checked,
                      })}}
                      value='filterCreatedInTheLast'
                      color='secondary'
                    />

                    Only show jobs/leads that were created in the last
                    <Input
                      className={classes.formInputNumber}
                      type='number'
                      value={this.props.filter.createdInTheLast}
                      onChange={(event) => { this.props.filterMap({
                        ...this.props.filter,
                        createdInTheLast: event.target.value,
                      })}}
                    />
                    days or less
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid style={{ fontSize: 14 }}>
                    <Checkbox
                      checked={this.props.filter.filterCompletedInTheLast}
                      onChange={(event) => {
                        this.props.filterMap({
                        ...this.props.filter,
                        filterViewCompleted: event.target.checked,
                        filterCompletedInTheLast: event.target.checked,
                      })}}
                      value='filterCompletedInTheLast'
                      color='secondary'
                    />

                    Only show jobs/leads that were completed in the last
                    <Input
                      className={classes.formInputNumber}
                      type='number'
                      value={this.props.filter.completedInTheLast}
                      onChange={(event) => this.props.filterMap({
                        ...this.props.filter,
                        completedInTheLast: event.target.value,
                      })}
                    />
                    days or less
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid style={{ fontSize: 14 }}>
                    <Checkbox
                      checked={this.props.filter.filterActionsOverdueBy}
                      onChange={(event) => { this.props.filterMap({
                        ...this.props.filter,
                        filterActionsOverdueBy: event.target.checked,
                      })}}
                      value='filterActionsOverdueBy'
                      color='secondary'
                    />

                    Only show leads that have actions overdue by
                    <Input
                      className={classes.formInputNumber}
                      type='number'
                      value={this.props.filter.actionsOverdueBy}
                      onChange={(event) => this.props.filterMap({
                        ...this.props.filter,
                        actionsOverdueBy: event.target.value,
                      })}
                    />
                    days or more
                  </Grid>
                </Grid>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Grid container spacing={1} style={{ marginTop: 12}}>
            <Grid item>
              <Button onClick={this.openLeadsModal} variant='outlined'>
                <span style={{ fontSize: 12 }}>
                  View As List (
                  {this.state.leads &&
                    this.state.leads.filter(
                      m =>
                        this.applyFilters(m)
                    ).length}
                  )
                </span>
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={this.openNoLocation} variant='outlined'>
                <span style={{ fontSize: 12 }}>
                  View Jobs/Leads With No Location Data (
                  {this.state.leads &&
                    this.state.leads.filter(
                      m =>
                        this.applyModalFilters(m, true)
                    ).length}
                  )
                </span>
              </Button>
            </Grid>
          </Grid>
        </div>
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
