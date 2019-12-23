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
import Tooltip from "@material-ui/core/Tooltip";
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import Select from 'react-select';
import Sync from '@material-ui/icons/Sync';

import { Map, GoogleApiWrapper, Marker, InfoWindow, Listing } from "google-maps-react";

import {
  DatePicker,
  DateTimePicker,
} from "@material-ui/pickers";

import {
  dateOf,
  andList,
  personnelConvert,
} from "../../../actions/helpers";

import moment from 'moment';
import classNames from 'classnames';
import _ from "lodash";

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
  getDetailedWFMJob,
  handleJobChange,
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
    staff: state.local.staff,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    handleJobChange: (job, o1, o2, field, val) => dispatch(handleJobChange(job, o1, o2, field, val)),
    handleJobChangeDebounced: _.debounce((job, o1, o2, field, val) => dispatch(handleJobChange(job, o1, o2, field, val)),
      2000
    ),
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
    getDetailedWFMJob: (jobNumber, wfmClients, geocodes) => dispatch(getDetailedWFMJob(jobNumber, false, false, true, wfmClients, geocodes)),
    collateJobsList: (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch(collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes)),
  };
};

const mapStyles = {
  borderStyle: 'solid',
  borderWidth: 1,
  padding: 12,
  margin: 12,
  borderRadius: 12,
  width: '40vw',
  height: '25vw',
};

class SiteGeneralInformation extends React.Component {
  state = {
    openInfo: true,

    openDescription: true,
    openHistory: true,
    openNotes: false,
    openMilestones: true,

    openMap: true,
    openSiteVisits: true,
    openVersions: true,

    countSiteVisits: 1,
    countClearances: 1,
    countVersions: 1,

    update: {},
  };

  UNSAFE_componentWillMount() {
    let countSiteVisits = 1,
      countVersions = 1;
    if (this.props.jobs && this.props.jobs[this.props.jobNumber]) {
      if (this.props.jobs[this.props.jobNumber].siteVisits) {
        countSiteVisits = Math.max(...Object.keys(this.props.jobs[this.props.jobNumber].siteVisits).map(key => parseInt(key)));
      }
      if (this.props.jobs[this.props.jobNumber].versions) {
        countVersions = Math.max(...Object.keys(this.props.jobs[this.props.jobNumber].versions).map(key => parseInt(key)));
      }
    }
    this.setState({
      countSiteVisits,
      countVersions,
    });
  }


  toggleCollapse = name => {
    this.setState({
      [`open${name}`]: !this.state[`open${name}`]
    });
  }

  addList = field => {
    this.setState({
      [`count${field}`]: this.state[`count${field}`] ? this.state[`count${field}`] + 1 : 2,
    })
  }

  removeList = field => {
    let obj = field ? field.slice(0,1).toLowerCase() + field.slice(1) : null;
    let num = this.state[`count${field}`] ? this.state[`count${field}`] : 1;
    if (obj) this.props.handleJobChange(this.props.jobs[this.props.jobNumber], [obj], null, num, 'delete');
    this.setState({
      [`count${field}`]: this.state[`count${field}`] ? this.state[`count${field}`] > 1 ? this.state[`count${field}`] - 1 : 1 : 1,
    })
  }

  render() {
    const { classes, jobNumber, google, geocodes, wfmClients, } = this.props;
    console.log(this.state);
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));

    let m = this.props.jobs && this.props.jobs[jobNumber];

    if (m) {
      const color = classes[getJobColor(m.category)];
      let maxLength = this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength").length > 0 ? parseInt(this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength")[0].value) : 600;
      return (
        <Grid container>
          <Grid item xs={12} md={5}>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>Job Details</div>
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
              {m.description && (
                <div>
                  <div className={classNames(color, classes.expandHeading)} onClick={() => this.toggleCollapse('Description')}>Description {this.state.openDescription ? (<OpenArrow />) : (<ClosedArrow />)}</div>
                  <Collapse in={this.state.openDescription}>
                    <div className={classes.code}>
                      { m.description }
                    </div>
                  </Collapse>
                </div>
              )}
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
            {false && m.geocode && m.geocode.address !== "New Zealand" && (
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
                  // animation={this.props.google.maps.Animation.DROP}
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
          <Grid item xs={12} md={7}>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>Site Visits</div>
              <div className={classNames(classes.subHeading, classes.flexRowCenter)}>
                <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={() => this.addList('SiteVisits')}><AddIcon /></IconButton>
                <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={() => this.removeList('SiteVisits')}><RemoveIcon /></IconButton>
              </div>
              { [...Array(this.state.countSiteVisits ? this.state.countSiteVisits : 1).keys()].map(i => {
                let num = i + 1,
                  s = m.siteVisits && m.siteVisits[num] ? m.siteVisits[num] : {};
                return (
                  <div className={classes.flexRowHoverPretty} key={`siteVisits${num}`}>
                    <div className={classes.circleShaded}>
                      {num}
                    </div>
                    <DatePicker
                      value={s.date ? dateOf(s.date) : null}
                      autoOk
                      className={classes.columnMed}
                      format="ddd, D MMMM YYYY"
                      label={'Date'}
                      clearable
                      disableToolbar
                      variant="inline"
                      openTo="year"
                      views={["year","month","date"]}
                      onChange={date => {
                        this.props.handleJobChange(m, 'siteVisits', num.toString(), 'date', dateOf(date));
                      }}
                    />
                    <Select
                      isMulti
                      placeholder={'Site personnel'}
                      className={classNames(classes.selectTight, classes.columnLarge)}
                      value={s.personnel ? s.personnel.map(e => ({value: e.uid, label: e.name})) : null}
                      options={names.map(e => ({ value: e.uid, label: e.name }))}
                      onChange={e => {
                        this.props.handleJobChange(m, 'siteVisits', num.toString(), 'personnel', personnelConvert(e));
                      }}
                    />
                    <Select
                      placeholder={'Site Visit Type'}
                      className={classNames(classes.selectTight, classes.columnMed)}
                      value={s.type ? {value: s.type, label: s.type} : null}
                      options={['Initial Survey','Bulk Sampling','Survey Revisit','Clearance Testing','Other'].map(e => ({ value: e, label: e }))}
                      onChange={e => {
                        this.props.handleJobChange(m, 'siteVisits', num.toString(), 'type', e.value);
                      }}
                    />
                    <TextField
                      label="Notes"
                      className={classes.columnMedLarge}
                      defaultValue={s.notes ? s.notes : null}
                      onChange={e => {
                        this.props.handleJobChangeDebounced(m, 'siteVisits', num.toString(), 'notes', e.target.value);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>Clearances</div>
              <div className={classNames(classes.subHeading, classes.flexRowCenter)}>
                <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={() => this.addList('Clearances')}><AddIcon /></IconButton>
                <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={() => this.removeList('Clearances')}><RemoveIcon /></IconButton>
              </div>
              { [...Array(this.state.countClearances ? this.state.countClearances : 1).keys()].map(i => {
                let num = i + 1,
                  s = m.clearances && m.clearances[num] ? m.clearances[num] : {};
                return (
                  <div className={classes.hoverNoFlex} key={`clearance${num}`}>
                    <div className={classes.flexRow}>
                      <div className={classes.circleShaded}>
                        {num}
                      </div>
                      <DatePicker
                        value={s.removalDate ? dateOf(s.removalDate) : null}
                        autoOk
                        className={classes.columnMed}
                        format="ddd, D MMMM YYYY"
                        clearable
                        variant="inline"
                        disableToolbar
                        label={'Removal Completion Date'}
                        views={["year","month","date"]}
                        openTo="year"
                        onChange={date => {
                          this.props.handleJobChange(m, 'clearances', num.toString(), 'removalDate', dateOf(date));
                        }}
                      />
                      <div className={classes.spacerSmall} />
                      <DatePicker
                        value={s.clearanceDate ? dateOf(s.clearanceDate) : null}
                        autoOk
                        className={classes.columnMed}
                        format="ddd, D MMMM YYYY"
                        clearable
                        variant="inline"
                        disableToolbar
                        label={'Clearance Inspection Date'}
                        views={["year","month","date"]}
                        openTo="year"
                        onChange={date => {
                          this.props.handleJobChange(m, 'clearances', num.toString(), 'clearanceDate', dateOf(date));
                        }}
                      />
                      <div className={classes.spacerSmall} />
                      <DatePicker
                        value={s.issueDate ? dateOf(s.issueDate) : null}
                        autoOk
                        className={classes.columnMed}
                        format="ddd, D MMMM YYYY"
                        clearable
                        variant="inline"
                        disableToolbar
                        label={'Certificate Issue Date'}
                        views={["year","month","date"]}
                        openTo="year"
                        onChange={date => {
                          this.props.handleJobChange(m, 'clearances', num.toString(), 'issueDate', dateOf(date));
                        }}
                      />
                    </div>
                    <div className={classes.flexRow}>
                      <Select
                        isMulti
                        placeholder={'Asbestos Assessor'}
                        className={classNames(classes.selectTight, classes.columnLarge)}
                        value={s.personnel ? s.personnel.map(e => ({value: e.uid, label: e.name})) : null}
                        options={names.map(e => ({ value: e.uid, label: e.name }))}
                        onChange={e => {
                          this.props.handleJobChange(m, 'clearances', num.toString(), 'personnel', personnelConvert(e));
                        }}
                      />
                      <TextField
                        label="Job Number"
                        className={classes.columnMedSmall}
                        defaultValue={s.jobNumber ? s.jobNumber : null}
                        onChange={e => {
                          this.props.handleJobChangeDebounced(m, 'clearances', num.toString(), 'jobNumber', e.target.value ? e.target.value.toUpperCase() : null);
                        }}
                      />
                      <Tooltip title="Sync Job with WorkflowMax">
                        <IconButton disabled={!s.jobNumber || !s.jobNumber.toLowerCase().includes('as')} onClick={() => this.props.getDetailedWFMJob(s.jobNumber, wfmClients, geocodes) }>
                          <Sync className={classes.iconRegular}/>
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>Version History</div>
              <div className={classNames(classes.subHeading, classes.flexRowCenter)}>
                <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={() => this.addList('Versions')}><AddIcon /></IconButton>
                <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={() => this.removeList('Versions')}><RemoveIcon /></IconButton>
              </div>
              { [...Array(this.state.countVersions ? this.state.countVersions : 1).keys()].map(i => {
                let num = i + 1,
                  s = m.versions && m.versions[num] ? m.versions[num] : {};
                return (
                  <div className={classes.hoverNoFlex} key={`versions${num}`}>
                    <div className={classes.flexRow}>
                      <div className={classes.circleShaded}>
                        {num}
                      </div>
                      <DatePicker
                        value={s.date ? dateOf(s.date) : null}
                        autoOk
                        className={classes.columnMed}
                        format="ddd, D MMMM YYYY"
                        variant="inline"
                        disableToolbar
                        clearable
                        label={'Date'}
                        views={["year","month","date"]}
                        openTo="year"
                        onChange={date => {
                          this.props.handleJobChange(m, 'versions', num.toString(), 'date', dateOf(date));
                        }}
                      />
                      <div className={classes.spacerSmall} />
                      <TextField
                        label="Changes"
                        className={classes.columnLarge}
                        defaultValue={s.changes ? s.changes : null}
                        onChange={e => {
                          this.props.handleJobChangeDebounced(m, 'versions', num.toString(), 'changes', e.target.value);
                        }}
                      />
                    </div>
                    <div className={classes.flexRow}>
                      <Select
                        isMulti
                        placeholder={'Writer'}
                        className={classNames(classes.selectTight, classes.columnMedLarge)}
                        value={s.writer ? s.writer.map(e => ({value: e.uid, label: e.name})) : null}
                        options={names.map(e => ({ value: e.uid, label: e.name }))}
                        onChange={e => {
                          this.props.handleJobChange(m, 'versions', num.toString(), 'writer', personnelConvert(e));
                        }}
                      />
                      <Select
                        isMulti
                        placeholder={'Checker'}
                        className={classNames(classes.selectTight, classes.columnMedLarge)}
                        value={s.checker ? s.checker.map(e => ({value: e.uid, label: e.name})) : null}
                        options={names.map(e => ({ value: e.uid, label: e.name }))}
                        onChange={e => {
                          this.props.handleJobChange(m, 'versions', num.toString(), 'checker', personnelConvert(e));
                        }}
                      />
                      <Select
                        isMulti
                        placeholder={'KTP'}
                        className={classNames(classes.selectTight, classes.columnMedLarge)}
                        value={s.ktp ? s.ktp.map(e => ({value: e.uid, label: e.name})) : null}
                        options={names.map(e => ({ value: e.uid, label: e.name }))}
                        onChange={e => {
                          this.props.handleJobChange(m, 'versions', num.toString(), 'ktp', personnelConvert(e));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
  )(SiteGeneralInformation))
);
