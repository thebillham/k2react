import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

//Modals
import {
  WFM_TIME,
} from "../../../constants/modal-types";
import { showModal } from "../../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Collapse from '@material-ui/core/Collapse';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import WfmTimeModal from "../modals/WfmTimeModal";
import ClosedArrow from "@material-ui/icons/ArrowDropDown";
import OpenArrow from "@material-ui/icons/ArrowDropUp";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncIcon from '@material-ui/icons/Sync';
import LinkIcon from '@material-ui/icons/Link';
import TimerIcon from "@material-ui/icons/Timer";
import Select from 'react-select';
import SuggestionField from '../../../widgets/SuggestionField';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import AsbestosRegisterTable from "../components/AsbestosRegisterTable";
import AsbestosSurveyTable from "../components/AsbestosSurveyTable";
import NonAsbestosTable from "../components/NonAsbestosTable";
import AirMonitoringRecords from "../components/AirMonitoringRecords";

import {
  DatePicker,
} from "@material-ui/pickers";

import classNames from 'classnames';
import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
  personnelConvert,
} from "../../../actions/helpers";

import moment from 'moment';
import _ from "lodash";

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  getDetailedWFMJob,
  clearWfmJob,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  collateJobsList,
  getJobColor,
  getStateString,
  getNextActionType,
  getNextActionOverdueBy,
  getWfmUrl,
  getLeadHistoryDescription,
  handleJobChange,
} from "../../../actions/jobs";

import { collateSamples } from "../../../actions/asbestosReportHelpers";

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
    staff: state.local.staff,
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
    siteAcm: state.jobs.siteAcm,
    samples: state.asbestosLab.samples,
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
    handleJobChange: info => dispatch(handleJobChange(info)),
    handleJobChangeDebounced: _.debounce((info) => dispatch(handleJobChange(info)),
      2000
    ),
    fetchCurrentJobState: ignoreCompleted => dispatch(fetchCurrentJobState(ignoreCompleted)),
    clearWfmJob: () => dispatch(clearWfmJob()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
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

class SiteJob extends React.Component {
  state = {
    countVersions: 1,

    update: {},
  };

  UNSAFE_componentWillMount() {
    let countVersions = 1;
    if (this.props.siteJobs && this.props.siteJobs[this.props.site] && this.props.siteJobs[this.props.site][this.props.m.uid]) {
      let job = this.props.siteJobs[this.props.site][this.props.m.uid];
      if (job.versions && Object.keys(job.versions).length > 0) {
        countVersions = Math.max(...Object.keys(job.versions).map(key => parseInt(key)));
      }
    }
    this.setState({
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
    if (obj) this.props.handleJobChange({ job: this.props.siteJobs[this.props.site][this.props.m.uid], o1: [obj], field: num, val: 'delete' });
    this.setState({
      [`count${field}`]: this.state[`count${field}`] ? this.state[`count${field}`] > 1 ? this.state[`count${field}`] - 1 : 1 : 1,
    })
  }

  render() {
    const { classes, that, m, wfmClients, geocodes, site, sites, siteJobs, siteAcm, samples} = this.props;
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
    const { registerMap, registerList, airMonitoringRecords,} = collateSamples(sites[site], siteJobs ? siteJobs[site] || {} : {} , siteAcm ? siteAcm[site] || {} : {}, samples);
    const loading = !sites[site] || !siteJobs[site] || !siteAcm[site] || !samples;

    if (m) {
      const color = classes[getJobColor(m.category)];
      return (
        <Grid container>
          <Grid item xs={12} md={5}>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classes.flexRowSpread}>
                <div className={classNames(color, classes.expandHeading)}>{ m.jobNumber }</div>
                <div className={classes.flexRow}>
                  <Tooltip title={'Re-sync with WorkflowMax'}>
                    <IconButton
                      onClick={e => this.props.getDetailedWFMJob({ jobNumber: m.jobNumber, setUpJob: true, })}>
                      <SyncIcon className={classes.iconRegular} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={'View Job on WorkflowMax'}>
                    <IconButton onClick={() => window.open(`https://my.workflowmax.com/job/jobview.aspx?id=${m.wfmID}`) }>
                      <LinkIcon className={classes.iconRegular} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={'Log Time to WorkflowMax'}>
                    <IconButton
                      onClick={e => {
                        this.props.showModal({ modalType: WFM_TIME, modalProps: { job: m, }})
                      }}>
                      <TimerIcon className={classes.iconRegular} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
              <InputLabel>Job Description</InputLabel>
              <SuggestionField that={this} suggestions='siteJobDescriptions'
                defaultValue={m.jobDescription ? m.jobDescription : ''}
                onModify={value => this.props.handleJobChange({job: m, field: 'jobDescription', val: value, siteUid: site })} />
              <div className={classNames(color, classes.expandHeading)}>Job Details</div>
              <div>
                <b>Client:</b> {m.client ? m.client : 'Not Available'}
              </div>
              <div>
                <b>Job Name/Address:</b> {m.address ? m.address : 'Not Available'}
              </div>
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
          </Grid>
          <Grid item xs={12} md={7}>
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
                          this.props.handleJobChange({ job: m, o1: 'versions', o2: num.toString(), field: 'date', val: dateOf(date), siteUid: site, });
                        }}
                      />
                      <div className={classes.spacerSmall} />
                      <TextField
                        label="Changes"
                        className={classes.columnLarge}
                        defaultValue={s.changes ? s.changes : null}
                        onChange={e => {
                          this.props.handleJobChangeDebounced({ job: m, o1: 'versions', o2: num.toString(), field: 'changes', val: e.target.value, siteUid: site, });
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
                          console.log(e);
                          console.log(personnelConvert(e))
                          this.props.handleJobChange({ job: m, o1: 'versions', o2: num.toString(), field: 'writer', val: personnelConvert(e), siteUid: site, });
                        }}
                      />
                      <Select
                        isMulti
                        placeholder={'Checker'}
                        className={classNames(classes.selectTight, classes.columnMedLarge)}
                        value={s.checker ? s.checker.map(e => ({value: e.uid, label: e.name})) : null}
                        options={names.map(e => ({ value: e.uid, label: e.name }))}
                        onChange={e => {
                          this.props.handleJobChange({ job: m, o1: 'versions', o2: num.toString(), field: 'checker', val: personnelConvert(e), siteUid: site, });
                        }}
                      />
                      <Select
                        isMulti
                        placeholder={'KTP'}
                        className={classNames(classes.selectTight, classes.columnMedLarge)}
                        value={s.ktp ? s.ktp.map(e => ({value: e.uid, label: e.name})) : null}
                        options={names.map(e => ({ value: e.uid, label: e.name }))}
                        onChange={e => {
                          this.props.handleJobChange({ job: m, o1: 'versions', o2: num.toString(), field: 'ktp', val: personnelConvert(e), siteUid: site, });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Grid>
          <Grid item xs={12}>
            {m.jobDescription.includes('Asbestos') && m.jobDescription.includes('Management Plan') &&
              <AsbestosRegisterTable loading={loading} registerList={registerList} classes={classes} />}
            {m.jobDescription.includes('Asbestos') && m.jobDescription.includes('Survey') &&
              <AsbestosSurveyTable loading={loading} registerList={registerList} classes={classes} />}
            {m.jobDescription.includes('Asbestos') && m.jobDescription.includes('Survey') &&
              <NonAsbestosTable loading={loading} registerList={registerList} classes={classes} />}
            {m.jobDescription.includes('Asbestos Management Plan') &&
              <AirMonitoringRecords loading={loading} airMonitoringRecords={airMonitoringRecords} classes={classes} />}
          </Grid>
        </Grid>
    );
  } else return (<div />)
}
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteJob)
);
