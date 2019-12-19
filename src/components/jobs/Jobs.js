import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import {
  Link,
} from "react-router-dom";

//Modals
import {
  WFM_TIME,
} from "../../constants/modal-types";
import { showModal } from "../../actions/modal";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import TimerIcon from "@material-ui/icons/Timer";
import JobIcon from "@material-ui/icons/Assignment";
import WfmTimeModal from "./modals/WfmTimeModal";

import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
} from "../../actions/helpers";

import moment from 'moment';

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
  getNextActionType,
  getWfmUrl,
  getLeadHistoryDescription,
  getJob,
} from "../../actions/jobs";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

import CurrentJobs from "./CurrentJobs";
import Leads from "./Leads";
import JobMap from "./JobMap";

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
    getJob: (job) => dispatch(getJob(job)),
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

class Jobs extends React.Component {
  state = {
    searchJobNumber: '',
    searchClient: '',
    searchStartDate: '',
    searchEndDate: '',
    searchDateType: '',
    searchAnalyst: '',
    tabValue: 0,
    jobModal: null,
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
    // Save daily state
    console.log(Object.values(this.props.jobList).filter((lead) => (lead.wfmState !== 'Completed')).length);
    this.props.saveWFMItems(Object.values(this.props.jobList).filter((lead) => (lead.wfmState !== 'Completed')));

    // If job list is finished loading, then save it to current
    console.log(this.props.jobList);
    this.props.jobList && console.log(Object.values(this.props.jobList).filter(job => job.isJob).length);
    this.props.currentJobState && console.log(Object.values(this.props.currentJobState).filter(job => job.isJob).length);
    if (this.props.jobList &&
      Object.values(this.props.jobList).filter(job => job.isJob).length >= Object.values(this.props.currentJobState).filter(job => job.isJob).length) {
        console.log(Object.keys(this.props.jobList).length);
        this.props.saveCurrentJobState(this.props.jobList);
      }

    // Save new geocodes found
    this.props.saveGeocodes(this.props.geocodes);
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
    // if (value === 3) this.computeStats();
  };

  getJobDetails = (m, noButton) => {
    const classes = this.props.classes;
    const color = classes[getJobColor(m.category)];
    let maxLength = this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength").length > 0 ? parseInt(this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength")[0].value) : 600;
    console.log(m);
    return (
      <div className={classes.popupMap}>
        <div className={color}>
          {m.isJob ?
            <div className={classes.flexRowSpread}>
              <h6>{m.category}</h6>
              {!noButton && <span>
                <Link to={`/job/${m.jobNumber}`} onClick={e => this.props.getJob(m)}>
                  <IconButton><JobIcon /></IconButton>
                </Link>
                <IconButton
                  onClick={e => {
                    this.props.showModal({ modalType: WFM_TIME, modalProps: { job: m, }})
                }}>
                <TimerIcon className={classes.iconRegular} />
                </IconButton>
              </span>}
            </div>
            :
            <h6>{m.category}</h6>}
        </div>
        <div className={classes.subHeading}>
          {m.isJob && <span>{`${m.jobNumber}`}<br />{m.client}</span>}
          {!m.isJob && <span>{m.name}</span>}
        </div>
        {m.geocode && (
          <div>
            <i>{m.geocode.address}</i>
          </div>
        )}
        {m.wfmState && (
          <div>
            <b>State:</b> {m.wfmState}
          </div>
        )}
        <div>
          <b>Owner:</b> {m.owner ? m.owner : 'Not Assigned'}
        </div>
        {m.isJob ? (
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
            {m.stateHistory && (
              <div><br /><h6 className={color}>State History</h6>
                { Object.keys(m.stateHistory).map((key) => {
                  return (
                    <span key={key}>
                      <b>{key}:</b> {m.stateHistory[key]}<br/>
                    </span>
                  )
                })}
              </div>
            )}
            {m.milestones && m.milestones.length > 0 && (
            <div><br /><h6 className={color}>Milestones</h6>
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
          )}

            {m.notes && m.notes.length > 0 && (
            <div><br /><h6 className={color}>Notes</h6>
            {
              m.notes.map((item) =>
              <div key={moment(dateOf(item.date)).format('x')}>
                <div><b>{moment(dateOf(item.date)).format('YYYY-MM-DD')}</b> {item.title} - {item.createdBy}</div>
                {item.text && <div className={classes.code}>
                  {item.text.length > maxLength ? `${item.text.substring(0, maxLength)}...` : item.text}
                </div>}
              </div>)
            }
          </div>
          )}
          </div>
          ) : (
          <div>
            {/*{m.description && <div className={classes.informationBoxWhiteRounded}><i>{m.description}</i></div>}*/}
            {m.value > 0 && (
              <div>
                <b>Estimated Value:</b> ${m.value}{" "}
              </div>
            )}
            {m.lastActionDate && (
              <div>
                {m.lastActionType && (<span><b>Last Goal Completed:</b> {getStateString(m)}</span>)}
              </div>
            )}
            {m.history && m.history.length > 0 && (
              <div>
                <b>Last Modified:</b> {moment(dateOf(m.history[0].date)).format('DD MMMM YYYY')}
              </div>
            )}

            {m.nextActionType && (
              <div>
                <b>Next Goal To Do:</b> {getNextActionType(m.activities)}{" "}
                {m.nextActionDate === 0 ? <span /> : getDaysSinceDate(m.nextActionDate) > 0 ? (
                  <span className={classes.underlineRed}>
                    (Due {getDaysSinceDateAgo(m.nextActionDate)})
                  </span>
                ) : (
                  <span>
                    (Due {getDaysSinceDate(m.nextActionDate) < -1 && 'in '}{getDaysSinceDateAgo(m.nextActionDate)})
                  </span>
                )}
              </div>
            )}
            {m.activities && m.activities.length > 0 && (
              <div><br /><h6 className={classes[getJobColor(m.category)]}>Goals</h6>
              { m.activities.map((activity) => {
                if(activity.completed === 'Yes') {
                  return (
                    <span key={activity.date} className={classes.linethrough}>
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
            {m.history && m.history.length > 0 && (
            <div><br /><h6 className={color}>Lead History</h6>
            {
              m.history.map((item) => {
                let leadHistory = getLeadHistoryDescription(item, parseInt(this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength")[0].value));
                return (
                  <div key={moment(dateOf(item.date)).format('x')}>
                    <div><span className={classes.marginRightSmall}>{leadHistory.icon}</span>
                    <b>{moment(dateOf(item.date)).format('YYYY-MM-DD')}</b> {leadHistory.title}</div>
                    {leadHistory.body && <div className={classes.code}>
                      {leadHistory.body}
                    </div>}
                  </div>
                )
              })
            }
          </div>
          )}
          </div>)
        }

        <div className={classes.paddingCenterText}>
          <Button variant="outlined" className={classes.buttonIconText}>
            <a
              className={classes.url}
              target="_blank"
              rel="noopener noreferrer"
              href={getWfmUrl(m)}
            >
              View on WorkflowMax
            </a>
          </Button>
        </div>
      </div>
    )
  };

  openJobModal = m => {
    this.setState({
      jobModal: m
    });
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

    const jobModal = (
      <Dialog
        open={this.state.jobModal !== null}
        onClose={() => {
          if (this.props.wfmJob) this.props.clearWfmJob();
          this.setState({ jobModal: null })
        }}
      >
        <DialogTitle>
          {this.state.jobModal ? (
            <div className={classes[getJobColor(this.state.jobModal.category)]}>
              {this.state.jobModal.jobNumber}: {this.state.jobModal.client}
            </div>) : "Job Details"}
        </DialogTitle>
        <DialogContent>
          {this.state.jobModal && this.getJobDetails(this.state.jobModal.isJob && this.props.wfmJob ? {...this.props.wfmJob, ...this.state.jobModal} : this.state.jobModal)}
        </DialogContent>
      </Dialog>
    );

    return (
      <div className={classes.marginTopStandard}>
        {this.props.modalType === WFM_TIME && <WfmTimeModal />}
        {jobModal}
        <div className={classes.flexRowRightAlign}>
          <Tooltip title="Log Time in WorkflowMax">
            <IconButton
              onClick={e => {
                this.props.showModal({ modalType: WFM_TIME, })
              }}>
              <TimerIcon className={classes.iconRegular} />
            </IconButton>
          </Tooltip>
        </div>
        <Tabs
          value={this.state.tabValue}
          onChange={this.handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          centered
        >
          <Tab label="Leads" />
          <Tab label="Current Jobs" />
          <Tab label="Map" />
          {/*<Tab label="Stats" />*/}
        </Tabs>
        {this.state.tabValue === 0 && <Leads that={this} />}
        {this.state.tabValue === 1 && <CurrentJobs that={this} />}
        {this.state.tabValue === 2 && <JobMap that={this} />}
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
