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
      showingInfoWindow: false,
      m: {},
      geocodeCount: 0,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.search !== nextProps.search) return true;
    if (this.props.wfmJobs !== nextProps.wfmJobs) return true;
    if (this.props.wfmLeads !== nextProps.wfmLeads) return true;
    if (this.props.filter !== nextProps.filter) return true;
    if (this.props.jobList !== nextProps.jobList) return true;
    if (this.state.m !== nextState.m) return true;
    if (this.state.modal !== nextState.modal) return true;
    if (this.state.jobModal !== nextState.jobModal) return true;
    if (this.state.activeMarker !== nextState.activeMarker) return true;
    if (this.state.showingInfoWindow !== nextState.showingInfoWindow) return true;
    return false;
  }

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

  openJobModal = m => {
    this.setState({
      jobModal: m
    });
  };

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
    // if (m.state === 'Completed') console.log(m);
    if (!this.props.filter.filterViewCompleted && m.state === 'Completed') return false;
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

    var state = m.state !== undefined ? m.state.toLowerCase() : 'Lead';
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
    // if (m.state === 'Completed' && this.props.filter.filterCompletedInTheLast) {
    //   console.log(m);
    //   console.log(getDaysSinceDate(m.lastActionDate));
    //   console.log(this.props.filter.completedInTheLast);
    //   console.log(m.state !== 'Completed');
    //   console.log(getDaysSinceDate(m.lastActionDate) >= this.props.filter.completedInTheLast);
    //   console.log((this.props.filter.filterCompletedInTheLast &&
    //     (m.state !== 'Completed' || getDaysSinceDate(m.lastActionDate) >= this.props.filter.completedInTheLast)));
    // }
    if (this.props.filter.filterCompletedInTheLast &&
      (m.state !== 'Completed' || getDaysSinceDate(m.lastActionDate) >= this.props.filter.completedInTheLast)) return false;

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

  getOffset = n => {
    var o = 20;
    var s = Math.floor((n - 1) / 8) + 1;
    var mod = (n % 9) + (s - 1);
    if (n === 0) mod = 0;
    // if (n>0) //console.log('n: ' + n + ', s: ' + s + ', mod: ' + mod);
    switch (mod) {
      case 0:
        return [0, 0];
      case 1:
        return [s * o, 0];
      case 2:
        return [0, -s * o];
      case 3:
        return [-s * o, 0];
      case 4:
        return [0, s * o];
      case 5:
        return [s * o, s * o];
      case 6:
        return [s * o, -s * o];
      case 7:
        return [-s * o, -s * o];
      case 8:
        return [-s * o, s * o];

      default:
        return [0, 0];
    }
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
    // if (Object.keys(this.state.staffStats).length > 1) {
    //   var daysMap = {};
    //   //console.log(this.state.staffStats["K2"]["completedActionOverdueDays"]);
    //   this.state.staffStats["K2"]["completedActionOverdueDays"].forEach(i => {
    //     if (daysMap[i] === undefined) daysMap[i] = { days: i, K2: 1, Shona: 0 };
    //     else daysMap[i]["K2"] = daysMap[i]["K2"] + 1;
    //   });
    //   this.state.staffStats["Shona Huffadine"][
    //     "completedActionOverdueDays"
    //   ].forEach(i => {
    //     if (daysMap[i] === undefined) daysMap[i] = { days: i, K2: 0, Shona: 1 };
    //     else daysMap[i]["Shona"] = daysMap[i]["Shona"] + 1;
    //   });
    //   var daysData = Object.values(daysMap);
    //   var sortedDays = [].concat(daysData).sort((a, b) => a.days > b.days);
    //   //console.log(daysData);
    // }
    //
    // console.log(wfmJobs);
    // console.log(wfmLeads);

    const jobModal = (
      <Dialog
        maxWidth="sm"
        fullWidth={true}
        open={this.state.jobModal !== null}
        onClose={() => this.setState({ jobModal: null })}
      >
        <DialogTitle>
        {this.state.jobModal && (
          <h5
            style={{ color: getJobColor(this.state.jobModal.category) }}
          >
            {this.state.jobModal.jobNumber}: {this.state.jobModal.client}
          </h5>)}
        </DialogTitle>
        <DialogContent>
        {this.state.jobModal && (
          <div
            style={{
              width: 350,
              lineHeight: 2,
              fontSize: 14,
              padding: 20
            }}
          >
            <div style={{ color: getJobColor(this.state.jobModal.category) }}>
              <h6>{this.state.jobModal.category}</h6>
            </div>
            {this.state.jobModal.geocode && (
              <div>
                <i>{this.state.jobModal.geocode.address}</i>
              </div>
            )}
            {this.state.jobModal.state && (
              <div>
                <b>State:</b> {this.state.jobModal.state}
              </div>
            )}
            <div>
              <b>Owner:</b> {this.state.jobModal.owner}
            </div>

            {this.state.jobModal.isJob && (
              <div>
              {this.state.jobModal.lastActionDate && (
                <div>
                  {this.state.jobModal.state && (<span><b>Last Action:</b> State changed to <i>{this.state.jobModal.state}</i> </span>) }
                   ({getDaysSinceDate(this.state.jobModal.lastActionDate)} {getDaysSinceDate(this.state.jobModal.lastActionDate) === 1 ? 'day' : 'days'} ago)
                </div>
              )}
              {this.state.jobModal.stateHistory && (
                <div><br /><h6 style={{ color: getJobColor(this.state.jobModal.category) }}>State History</h6>
                { Object.keys(this.state.jobModal.stateHistory).map((key) => {
                  return (
                    <span key={key}>
                      <b>{key}:</b> {this.state.jobModal.stateHistory[key]}<br/>
                    </span>
                  )
                }) }
                </div>
              )}
            </div>
            )}

            {!this.state.jobModal.isJob && (
              <div>
              {this.state.jobModal.value > 0 && (
                <div>
                  <b>Estimated Value:</b> ${this.state.jobModal.value}{" "}
                </div>
              )}
              {this.state.jobModal.lastActionDate && (
                <div>
                  {this.state.jobModal.lastActionType && (<span><b>Last Action:</b> {this.state.jobModal.lastActionType} </span>)}
                   ({getDaysSinceDate(this.state.jobModal.lastActionDate)} {getDaysSinceDate(this.state.jobModal.lastActionDate) === 1 ? 'day' : 'days'} ago)
                </div>
              )}
              {this.state.jobModal.nextActionType && (
                <div>
                  <b>Next Action:</b> {getNextActionType(this.state.jobModal.activities)}{" "}
                  {getNextActionOverdueBy(this.state.jobModal.activities) > 0 ? (
                    <span
                      style={{
                        fontColor: "#ff0000",
                        textDecoration: "underline"
                      }}
                    >
                      (Overdue by {getNextActionOverdueBy(this.state.jobModal.activities)} days)
                    </span>
                  ) : (
                    <span>
                      (Due in {getNextActionOverdueBy(this.state.jobModal.activities) * -1} days)
                    </span>
                  )}
                </div>
              )}
              {this.state.jobModal.activities && this.state.jobModal.activities.length > 0 && (
                <div><br /><h6 style={{ color: getJobColor(this.state.jobModal.category) }}>Activities</h6>
                { this.state.jobModal.activities.map((activity) => {
                  if(activity.completed === 'Yes') {
                    return (
                      <span key={activity.date} style={{ textDecoration: 'line-through'}}>
                        <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                        <br/>
                      </span>
                    )
                  } else {
                    return (
                      <span key={activity.date}>
                        <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                        <br/>
                      </span>
                    )
                  }
                }) }
                </div>
              )}
              </div>
            )}

            <div style={{ padding: 16, textAlign: "center" }}>
              <Button variant="outlined" style={{ borderRadius: 20 }}>
                <a
                  style={{ textDecoration: "none", color: "#FF2D00" }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={getWfmUrl(this.state.jobModal)}
                >
                  View on WorkflowMax
                </a>
              </Button>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    );

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
                  var stateStr = '';
                  if (m.isJob) {
                    var days = getDaysSinceDate(m.lastActionDate);
                    if (days < 1) {
                      stateStr = 'Changed state to ' + m.state + ' today';
                    } else if (days === 1) {
                      stateStr = 'Changed state to ' + m.state + ' yesterday';
                    } else if (days < 7) {
                      stateStr = 'Changed state to ' + m.state + ' ' + days + ' days ago';
                    } else {
                      stateStr = 'Has not changed state in ' + days + ' days';
                    }
                  } else {
                    days = getNextActionOverdueBy(m.activities);
                    if (days > 1) {
                      stateStr = 'Actions overdue by ' + days + ' days';
                    } else if (days === 1) {
                      stateStr = 'Actions overdue by 1 day';
                    } else if (days === 0) {
                      stateStr = 'Actions due today';
                    } else if (days === -1) {
                      stateStr = 'Actions due tomorrow';
                    } else {
                      stateStr = 'Actions due in ' + (days*-1) + ' days';
                    }
                  }

                  return (
                    <ListItem
                      key={m.wfmID}
                      dense
                      className={classes.hoverItemPoint}
                      style={{ color: getJobColor(m.category) }}
                      onClick={() => {
                        this.openJobModal(m);
                      }}
                    >
                      <Grid container>
                        <Grid item xs={8}>
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
      </Dialog>
    );

    var addresses = {};

    // console.log(jobList);

    return (
      <div style={{ marginBottom: 20 }}>
          {this.state.jobModal && jobModal}
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
                    var color = getJobColor(chip);
                    return (
                      <Grid item key={chip}>
                        <Button
                          style={{ color: color }}
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
          <Grid container spacing={1} style={{ marginTop: 12}}>
            <Grid item>
              <Button onClick={this.openLeadsModal} variant='outlined'>
                <span>
                  View As List (
                  {jobList &&
                    Object.values(jobList).filter(
                      m =>
                        this.applyFilters(m)
                    ).length}
                  )
                </span>
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={this.openNoLocation} variant='outlined'>
                <span>
                  View Jobs/Leads With No Location Data (
                  {jobList &&
                    Object.values(jobList).filter(
                      m =>
                        this.applyModalFilters(m, true)
                    ).length}
                  )
                </span>
              </Button>
            </Grid>
          </Grid>
          <Map
            google={this.props.google}
            zoom={6.27}
            style={mapStyles}
            initialCenter={{
              lat: -40.9261681,
              lng: 174.4070603
            }}
          >
            {jobList && Object.values(jobList).map(m => {
              if (this.filterLabels(m)) {
                if (addresses[m.geocode.address] >= 0) {
                  addresses[m.geocode.address] =
                    addresses[m.geocode.address] + 1;
                  // //console.log(m.jobNumber + ': ' + m.geocode.address + ' (' + addresses[m.geocode.address] + ')');
                } else {
                  addresses[m.geocode.address] = 0;
                }
                var url = getJobIcon(m.category);
                return (
                  <Marker
                    // animation={this.props.google.maps.Animation.DROP}
                    key={m.wfmID}
                    onClick={(props, marker, e) => {
                      this.onMarkerClick(marker, m);
                    }}
                    position={{
                      lat: m.geocode.location[0],
                      lng: m.geocode.location[1]
                    }}
                    title={`${m.jobNumber}: ${m.client}`}
                    icon={{
                      url: url,
                      anchor: new this.props.google.maps.Point(
                        16 + this.getOffset(addresses[m.geocode.address])[0],
                        16 + this.getOffset(addresses[m.geocode.address])[1]
                      ),
                      scaledSize: new this.props.google.maps.Size(32, 32)
                    }}
                  />
                );
              } else {
                return false;
              }
            })}
            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
            >
              <div
                style={{
                  width: 350,
                  lineHeight: 2,
                  fontSize: 14,
                  padding: 20
                }}
              >
                <div>
                  <h5
                    style={{ color: getJobColor(this.state.m.category) }}
                  >
                    {this.state.m.jobNumber}: {this.state.m.client}
                  </h5>
                </div>
                <div style={{ color: getJobColor(this.state.m.category) }}>
                  <h6>{this.state.m.category}</h6>
                </div>
                {this.state.m.geocode && (
                  <div>
                    <i>{this.state.m.geocode.address}</i>
                  </div>
                )}
                {this.state.m.state && (
                  <div>
                    <b>State:</b> {this.state.m.state}
                  </div>
                )}
                <div>
                  <b>Owner:</b> {this.state.m.owner}
                </div>

                {this.state.m.isJob && (
                  <div>
                  {this.state.m.lastActionDate && (
                    <div>
                      {this.state.m.state && (<span><b>Last Action:</b> State changed to <i>{this.state.m.state}</i> </span>) }
                       ({getDaysSinceDate(this.state.m.lastActionDate)} {getDaysSinceDate(this.state.m.lastActionDate) === 1 ? 'day' : 'days'} ago)
                    </div>
                  )}
                  {this.state.m.stateHistory && (
                    <div><br /><h6 style={{ color: getJobColor(this.state.m.category) }}>State History</h6>
                    { Object.keys(this.state.m.stateHistory).map((key) => {
                      return (
                        <span key={key}>
                          <b>{key}:</b> {this.state.m.stateHistory[key]}<br/>
                        </span>
                      )
                    }) }
                    </div>
                  )}
                </div>
                )}

                {!this.state.m.isJob && (
                  <div>
                  {this.state.m.value > 0 && (
                    <div>
                      <b>Estimated Value:</b> ${this.state.m.value}{" "}
                    </div>
                  )}
                  {this.state.m.lastActionDate && (
                    <div>
                      {this.state.m.lastActionType && (<span><b>Last Action:</b> {this.state.m.lastActionType} </span>)}
                       ({getDaysSinceDate(this.state.m.lastActionDate)} {getDaysSinceDate(this.state.m.lastActionDate) === 1 ? 'day' : 'days'} ago)
                    </div>
                  )}
                  {this.state.m.nextActionType && (
                    <div>
                      <b>Next Action:</b> {getNextActionType(this.state.m.activities)}{" "}
                      {getNextActionOverdueBy(this.state.m.activities) > 0 ? (
                        <span
                          style={{
                            fontColor: "#ff0000",
                            textDecoration: "underline"
                          }}
                        >
                          (Overdue by {getNextActionOverdueBy(this.state.m.activities)} days)
                        </span>
                      ) : (
                        <span>
                          (Due in {getNextActionOverdueBy(this.state.m.activities) * -1} days)
                        </span>
                      )}
                    </div>
                  )}
                  {this.state.m.activities && this.state.m.activities.length > 0 && (
                    <div><br /><h6 style={{ color: getJobColor(this.state.m.category) }}>Activities</h6>
                    { this.state.m.activities.map((activity) => {
                      if(activity.completed === 'Yes') {
                        return (
                          <span key={activity.date} style={{ textDecoration: 'line-through'}}>
                            <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                            <br/>
                          </span>
                        )
                      } else {
                        return (
                          <span key={activity.date}>
                            <b>{moment(activity.date).format('YYYY-MM-DD')}:</b> {activity.subject}
                            <br/>
                          </span>
                        )
                      }
                    }) }
                    </div>
                  )}
                  </div>
                )}

                <div style={{ padding: 16, textAlign: "center" }}>
                  <a
                    style={{ textDecoration: "none", color: "#FF2D00" }}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={getWfmUrl(this.state.m)}
                  >
                    View on WorkflowMax
                  </a>
                </div>
              </div>
            </InfoWindow>
          </Map>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GoogleApiWrapper({ apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY })(JobMap))
);
