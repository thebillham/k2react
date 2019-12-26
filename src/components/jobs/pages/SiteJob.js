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
    handleJobChange: (job, o1, o2, field, val, site) => dispatch(handleJobChange(job, o1, o2, field, val, site)),
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
    const { classes, that, m, wfmClients, geocodes, site, } = this.props;
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));

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
                onModify={value => this.props.handleJobChange(m, null, null, 'jobDescription', value, site)} />
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
                        <IconButton disabled={!s.jobNumber || !s.jobNumber.toLowerCase().includes('as')} onClick={() => this.props.getDetailedWFMJob({jobNumber: s.jobNumber, wfmClients, geocodes}) }>
                          <SyncIcon className={classes.iconRegular}/>
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

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteJob)
);
