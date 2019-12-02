import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import classNames from 'classnames';
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
import DialogActions from "@material-ui/core/DialogActions";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import moment from "moment";
import { auth, usersRef } from "../../config/firebase";
import JobsMapContainer from "./components/JobsMapContainer";

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  collateJobsList,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  getJobColor,
  getJobIcon,
  getWfmUrl,
  getNextActionType,
  getNextActionOverdueBy,
  getStateString,
} from "../../actions/jobs";

import {
  getDaysSinceDate,
} from "../../actions/helpers";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

const mapStyles = {
  marginTop: 20,
  flexGrow: 1,
  overflow: "auto",
  // width: '90%',
  height: "100%"
};

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

class JobMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      leads: [],
      clientStats: {},
      activeMarker: {},
      m: {},
      showingInfoWindow: false,
      geocodeCount: 0,
    };
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.search !== nextProps.search) return true;
  //   if (this.props.wfmJobs !== nextProps.wfmJobs) return true;
  //   if (this.props.wfmLeads !== nextProps.wfmLeads) return true;
  //   if (this.props.filter !== nextProps.filter) return true;
  //   if (this.state.m !== nextState.m) return true;
  //   if (this.state.activeMarker !== nextState.activeMarker) return true;
  //   if (this.props.jobList !== nextProps.jobList) return true;
  //   if (this.state.modal !== nextState.modal) return true;
  //   if (this.state.jobModal !== nextState.jobModal) return true;
  //   if (this.state.showingInfoWindow !== nextState.showingInfoWindow) return true;
  //   return false;
  // }

  openNoLocation = () => {
    this.setState({
      modal: "nolocation"
    });
  };

  openLeadsModal = () => {
    this.setState({
      modal: "jobleads"
    });
  }

  filterSet = (chip, type) => {
    var filterVar = 'filter' + type;
    var filterOnVar = 'filterOn' + type;
    let filter = chip;
    let filterOn = true;
    if (this.props.filter[filterVar] === chip) {
      filter = '';
      filterOn = false;
    }

    let newFilter = {
      ...this.props.filter,
      [filterVar]: filter,
      [filterOnVar]: filterOn,
    };

    this.props.filterMap(newFilter);
  }

  filterLabels = m => {
    if (m && m.geocode && m.geocode.address !== "New Zealand") {
      if (this.applyFilters(m)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  resetFilter = () => {
    this.props.filterMapReset();
  }

  applyModalFilters = (m, nolocation) => {
    if ((this.state.modal === "nolocation" || nolocation) && m && m.geocode && m.geocode.address !== "New Zealand") return false;
      else return (this.applyFilters(m));
  }

  applyFilters = m => {
    // if (m.wfmState === 'Completed') console.log(m);
    if (!this.props.filter.filterViewCompleted && m.wfmState === 'Completed') return false;
    if (!this.props.filter.filterK2Jobs && m.client === 'K2 Environmental Ltd') return false;

    // Simplify categories and states
    var category = m.category.toLowerCase();
    if (category.includes('asbestos')) category = 'Asbestos';
      else if (category.includes('meth')) category = 'Meth';
      else if (category.includes('stack')) category = 'Stack';
      else if (category.includes('noise')) category = 'Noise';
      else if (category.includes('bio')) category = 'Bio';
      else if (category.includes('workplace')) category = 'Workplace';
      else category = 'Other';

    var state = m.wfmState !== undefined ? m.wfmState.toLowerCase() : 'Lead';
    if (!m.isJob) state = 'Lead';
      else if (state === 'completed') state = 'Completed';
      else if (state === 'needs booking') state = 'Needs Booking';
      else if (state === 'planned') state = 'Planned';
      else if (state === 'in progress') state = 'Site Work';
      else if ("waiting for resultswaiting on lab unbundlewaiting on lab amendment".includes(state)) state = 'Lab';
      else if ("needs writingneeds finishingbeing writtenready to be checkedbeing checkedbeen checked, needs fixingready for ktpbeing ktp'dktped, actions needed".includes(state)) state = 'Report';
      else state = 'Admin';

    // Category
    if (
      this.props.filter.filterOnCategory &&
      this.props.filter.filterCategory !== category
    )
      return false;

    // Job state
    if (
      this.props.filter.filterOnState &&
      this.props.filter.filterState !== state
    )
      return false;

    // Job or lead
    if (
      this.props.filter.filterOnJobLead &&
      ((this.props.filter.filterJobLead === 'Jobs' && !m.isJob) ||
      (this.props.filter.filterJobLead === 'Leads' && m.isJob))
    )
      return false;

    // Creation date
    if (this.props.filter.filterCreatedInTheLast &&
      getDaysSinceDate(m.creationDate) >= this.props.filter.createdInTheLast) return false;

    // Completion date
    // if (m.wfmState === 'Completed' && this.props.filter.filterCompletedInTheLast) {
    //   console.log(m);
    //   console.log(getDaysSinceDate(m.lastActionDate));
    //   console.log(this.props.filter.completedInTheLast);
    //   console.log(m.wfmState !== 'Completed');
    //   console.log(getDaysSinceDate(m.lastActionDate) >= this.props.filter.completedInTheLast);
    //   console.log((this.props.filter.filterCompletedInTheLast &&
    //     (m.wfmState !== 'Completed' || getDaysSinceDate(m.lastActionDate) >= this.props.filter.completedInTheLast)));
    // }
    if (this.props.filter.filterCompletedInTheLast &&
      (m.wfmState !== 'Completed' || getDaysSinceDate(m.lastActionDate) >= this.props.filter.completedInTheLast)) return false;

    // Days since last update
    if (this.props.filter.filterUpdatedInTheLast &&
      getDaysSinceDate(m.lastActionDate) < this.props.filter.updatedInTheLast) return false;

    // Actions overdue by
    if (this.props.filter.filterActionsOverdueBy &&
      (m.isJob || getNextActionOverdueBy(m.activities) < this.props.filter.actionsOverdueBy)) return false;

    // Search filter
    let res = true;

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
  }

  switchCategory = cat => {
    this.setState({
      category: cat
    });
  };

  switchStage = cat => {
    this.setState({
      stage: cat
    });
  };

  onMarkerClick = (marker, m) => {
    console.log(m);
    this.setState({
      activeMarker: marker,
      m: m,
      showingInfoWindow: true
    });
  };

  onMouseover = () => {
    this.setState({
      showInfoBox: true
    });
  };

  onMouseout = () => {
    this.setState({
      showInfoBox: false
    });
  };

  render() {
    const { wfmJobs, wfmLeads, wfmClients, classes, currentJobState, jobList, geocodes, that } = this.props;

    const jobListModal = (
      <Dialog
        maxWidth="lg"
        fullWidth={true}
        open={this.state.modal !== null}
        onClose={() => this.setState({ modal: null })}
      >
        <DialogTitle>
          {this.state.modal === "nolocation"
            ? "Jobs or Leads with No Location Data"
            : "List View"}
        </DialogTitle>
        <DialogContent>
          {this.props.jobList && Object.values(this.props.jobList)
              .filter(
                m => this.applyModalFilters(m, false)
              )
              .sort((a, b) => {
                var metricA = a.isJob ? getDaysSinceDate(a.lastActionDate) : getNextActionOverdueBy(a.activities);
                var metricB = b.isJob ? getDaysSinceDate(b.lastActionDate) : getNextActionOverdueBy(b.activities);
                return metricB - metricA;
                // getDaysSinceDate(a.lastActionDate) - getDaysSinceDate(b.lastActionDate))
              })
              // .sort((a, b) => b.isJob - a.isJob)
              .map(m => {
                // console.log(m);
                var stateStr = getStateString(m);
                return (
                  <ListItem
                    key={m.wfmID}
                    dense
                    className={classes.hoverItemPoint}
                    onClick={() => {
                      that.openJobModal(m);
                    }}
                  >
                    <Grid container className={classes.fineprint}>
                      <Grid item xs={8} className={classes[getJobColor(m.category)]}>
                        {m.jobNumber} - {m.client} : {m.name}
                        <br />
                        {m.category}
                        <br />
                      </Grid>
                      <Grid item xs={1}>
                      </Grid>
                      <Grid item xs={3}>
                        <span>{stateStr}</span>
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              })
            }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ modal: null })}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );

    return (
      <div className={classes.marginBottomSmall}>
          {this.state.modal && jobListModal}

          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              FILTER VIEW
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <Grid container spacing={1}>
                  <Grid item>
                    <Button
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
                      className={classes.marginLeftSmall}
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
                      className={classes.marginLeftSmall}
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
                <Grid container spacing={1} className={classes.marginBottomSmall}>
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
                <Grid container spacing={1} className={classes.marginBottomSmall}>
                  {[
                    "Asbestos",
                    "Meth",
                    "Stack",
                    "Noise",
                    "Bio",
                    "Workplace",
                    "Other"
                  ].map(chip => {
                    return (
                      <Grid item key={chip}>
                        <Button
                          className={classes[getJobColor(chip)]}
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
                  <Grid>
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
                  <Grid>
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
                  <Grid>
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
                  <Grid>
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
          {false && <Grid container spacing={1} className={classes.marginTopSmall}>
            <Grid item>
              <Button onClick={this.openLeadsModal} variant='outlined'>
                View As List (
                {jobList &&
                  Object.values(jobList).filter(
                    m =>
                      this.applyFilters(m)
                  ).length}
                )
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={this.openNoLocation} variant='outlined'>
                View Jobs/Leads With No Location Data (
                {jobList &&
                  Object.values(jobList).filter(
                    m =>
                      this.applyModalFilters(m, true)
                  ).length}
                )
              </Button>
            </Grid>
          </Grid>}
          <JobsMapContainer jobList={jobList} that={this} />
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(JobMap)
);
