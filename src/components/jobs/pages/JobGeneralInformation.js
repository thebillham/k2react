import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

import { showModal } from "../../../actions/modal";
import Button from "@material-ui/core/Button";

import ClosedArrow from "@material-ui/icons/ArrowDropDown";
import OpenArrow from "@material-ui/icons/ArrowDropUp";
import Zoom from '@material-ui/core/Zoom';
import Grow from '@material-ui/core/Grow';
import Grid from "@material-ui/core/Grid";
import Collapse from '@material-ui/core/Collapse';

import { Map, GoogleApiWrapper, Marker, InfoWindow, Listing } from "google-maps-react";

import {
  dateOf,
  andList,
} from "../../../actions/helpers";

import moment from 'moment';
import classNames from 'classnames';

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  clearWfmJob,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  collateJobsList,
  getJobColor,
  getStateString,
  getWfmUrl,
  getJobIcon,
} from "../../../actions/jobs";

import {
  filterMap,
  filterMapReset,
} from "../../../actions/display";

const mapStateToProps = state => {
  return {
    wfmJobs: state.jobs.wfmJobs,
    wfmJob: state.jobs.wfmJob,
    wfmLeads: state.jobs.wfmLeads,
    wfmClients: state.jobs.wfmClients,
    currentJobState: state.jobs.currentJobState,
    geocodes: state.jobs.geocodes,
    wfmItems: state.jobs.wfmItems,
    wfmStats: state.jobs.wfmStats,
    jobList: state.jobs.jobList,
    search: state.local.search,
    jobs: state.jobs.jobs,
    me: state.local.me,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    fetchCurrentJobState: ignoreCompleted => dispatch(fetchCurrentJobState(ignoreCompleted)),
    clearWfmJob: () => dispatch(clearWfmJob()),
    saveCurrentJobState: state => dispatch(saveCurrentJobState(state)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: modal => dispatch(showModal(modal)),
    collateJobsList: (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch(collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes)),
  };
};

const mapStyles = {
  marginTop: 40,
  borderStyle: 'solid',
  borderWidth: 1,
  padding: 12,
  margin: 12,
  borderRadius: 12,
  width: '40vw',
  height: '25vw',
};

class JobGeneralInformation extends React.Component {
  state = {
    openMap: true,
    openInfo: true,
    openHistory: true,
    openNotes: false,
    openMilestones: true,
  };

  toggleCollapse = name => {
    this.setState({
      [`open${name}`]: !this.state[`open${name}`]
    });
  }

  render() {
    const { classes, jobNumber, google } = this.props;

    let m = this.props.jobs && this.props.jobs[jobNumber];

    if (m) {
      const color = classes[getJobColor(m.category)];
      let maxLength = this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength").length > 0 ? parseInt(this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength")[0].value) : 600;
      return (
        <Grid container>
          <Grid item xs={12} md={6}>
            <div className={classNames(color, classes.expandHeading)} onClick={() => this.toggleCollapse('Info')}>General Information {this.state.openInfo ? (<OpenArrow />) : (<ClosedArrow />)}</div>
            <Grow in={this.state.openInfo}
              style={{ transformOrigin: '0 0 0' }}
              {...(this.state.openInfo ? { timeout: 1000 } : {})}>
              <div className={classes.informationBoxWhiteRounded}>
                {m.wfmState && (
                  <div>
                    <b>State:</b> {m.wfmState}
                  </div>
                )}
                <div>
                  <b>Owner:</b> {m.owner ? m.owner : 'Not Assigned'}
                </div>
                <div>
                  {m.assigned &&
                    <div>
                      <b> Assigned: </b> {andList(m.assigned.map(e => e.name))}
                    </div>
                  }
                  {m.lastActionDate && m.wfmState !== "Completed" && (
                    <div>
                      {m.wfmState && (<span><b>Last Action:</b> {getStateString(m)} </span>)}
                    </div>
                  )}
                </div>
                {m.stateHistory && (
                  <div>
                    <div className={classNames(color, classes.expandHeading)} onClick={() => this.toggleCollapse('History')}>State History {this.state.openHistory ? (<OpenArrow />) : (<ClosedArrow />)}</div>
                    <Collapse in={this.state.openHistory}>
                      <div className={classes.expandBody}>
                        { Object.keys(m.stateHistory).map((key) => {
                          return (
                            <span key={key}>
                              <b>{key}:</b> {m.stateHistory[key]}<br/>
                            </span>
                          )
                        })}
                      </div>
                    </Collapse>
                  </div>
                )}
                {m.milestones && m.milestones.length > 0 && (
                  <div>
                    <div className={classNames(color, classes.expandHeading)} onClick={() => this.toggleCollapse('Milestones')}>Milestones {this.state.openMilestones ? (<OpenArrow />) : (<ClosedArrow />)}</div>
                    <Collapse in={this.state.openMilestones}>
                      <div className={classes.expandBody}>
                        {
                          m.milestones.map((item) => {
                            if(item.completed === 'true') {
                              return (
                                <span key={item.date} className={classes.linethrough}>
                                  <b>{moment(item.date).format('YYYY-MM-DD')}:</b> {item.description}
                                  <br/>
                                </span>
                              )
                            } else {
                              return (
                                <span key={item.date}>
                                  <b>{moment(item.date).format('YYYY-MM-DD')}:</b> {item.description}
                                  <br/>
                                </span>
                              )
                            }
                          })
                        }
                      </div>
                    </Collapse>
                  </div>
                )}

                {m.notes && m.notes.length > 0 && (
                <div>
                  <div className={classNames(color, classes.expandHeading)} onClick={() => this.toggleCollapse('Notes')}>Notes {this.state.openNotes ? (<OpenArrow />) : (<ClosedArrow />)}</div>
                  <Collapse in={this.state.openNotes}>
                    <div className={classes.expandBody}>
                      {
                        m.notes.map((item) =>
                        <div key={moment(dateOf(item.date)).format('x')}>
                          <div className={color}><b>{moment(dateOf(item.date)).format('YYYY-MM-DD')}</b> {item.title} - {item.createdBy}</div>
                          {item.text && <div className={classes.code}>
                            {item.text}
                          </div>}
                        </div>)
                      }
                    </div>
                  </Collapse>
                </div>
              )}
              </div>
            </Grow>
          </Grid>
          <Grid item xs={12} md={6}>
            {m.geocode && m.geocode.address !== "New Zealand" && (
              <Map
                google={google}
                zoom={8}
                style={mapStyles}
                initialCenter={{
                  lat: m.geocode.location[0],
                  lng: m.geocode.location[1],
                }}
              >
                <Marker
                  animation={this.props.google.maps.Animation.DROP}
                  key={m.wfmID}
                  // onClick={(props, marker, e) => {
                  //   that.onMarkerClick(marker, m);
                  // }}
                  position={{
                    lat: m.geocode.location[0],
                    lng: m.geocode.location[1]
                  }}
                  title={`${m.jobNumber}: ${m.client}`}
                  icon={{
                    url: getJobIcon(m.category),
                    scaledSize: new google.maps.Size(32, 32)
                  }}
                />
              </Map>
            )}
          </Grid>
        </Grid>
      );
    } else return (<div />)
  }
}

export default GoogleApiWrapper({ apiKey: (process.env.REACT_APP_GOOGLE_MAPS_KEY) })(withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(JobGeneralInformation))
);
