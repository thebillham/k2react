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
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import TimerIcon from "@material-ui/icons/Timer";
import WfmTimeModal from "../modals/WfmTimeModal";

import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
} from "../../../actions/helpers";

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
  getNextActionOverdueBy,
  getWfmUrl,
  getLeadHistoryDescription,
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

class SiteAsbestosRegister extends React.Component {
  state = {
  };

  render() {
    const { classes, that, jobNumber } = this.props;

    let m = this.props.jobs && this.props.jobs[jobNumber];

    if (m) {
      const color = classes[getJobColor(m.category)];
      let maxLength = this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength").length > 0 ? parseInt(this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength")[0].value) : 600;
      return (
        <div className={classes.marginTopStandard}>
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
      );
    } else return (<div />)
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteAsbestosRegister)
);
