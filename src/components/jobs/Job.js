import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";

//Modals
import {
  WFM_TIME,
} from "../../constants/modal-types";
import { showModal } from "../../actions/modal";
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
import SyncIcon from '@material-ui/icons/Sync';
import LinkIcon from '@material-ui/icons/Link';
import WfmTimeModal from "./modals/WfmTimeModal";

import Popup from "reactjs-popup";
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
  getNextActionOverdueBy,
  getDetailedWFMJob,
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
import JobStats from "./JobStats";
import JobGeneralInformation from "./pages/JobGeneralInformation";
import JobRooms from "./pages/JobRooms";
import JobMapsAndDiagrams from "./pages/JobMapsAndDiagrams";
import JobAsbestosRegister from "./pages/JobAsbestosRegister";

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
    jobs: state.jobs.jobs,
    search: state.local.search,
    me: state.local.me,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearWfmJob: () => dispatch(clearWfmJob()),
    showModal: modal => dispatch(showModal(modal)),
    getDetailedWFMJob: jobNumber => dispatch(getDetailedWFMJob(jobNumber, false, true)),
  };
};

class Job extends React.Component {
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

  UNSAFE_componentWillMount = () => {
    if (!this.props.jobs || (this.props.jobs && !this.props.jobs[this.props.match.params.job])) this.props.getDetailedWFMJob(this.props.match.params.job);
    // this.props.handleDrawerClose();
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
    // if (value === 3) this.computeStats();
  };

  render() {
    const { classes, geocodes, jobs } = this.props;
    const job = jobs && jobs[this.props.match.params.job.trim()];
    const color = job ? classes[getJobColor(job.category)] : classes[getJobColor('other')];
    let maxLength = this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength").length > 0 ? parseInt(this.props.otherOptions.filter(opt => opt.option === "jobLeadEmailLength")[0].value) : 600;

    if (job) return (
      <div className={classes.marginTopSmall}>
        <div className={classes.flexRowSpread}>
          <div className={color}>
            <h6>{`${job.jobNumber}: ${job.client}`}</h6>
            <div className={classes.subtitle}>{job.address}</div>
          </div>
          <div className={classes.flexRow}>
            <Tooltip title={'Re-sync with WorkflowMax'}>
              <IconButton
                onClick={e => this.props.getDetailedWFMJob(job.jobNumber)}>
                <SyncIcon className={classes.iconRegular} />
              </IconButton>
            </Tooltip>
            <Tooltip title={'View Job on WorkflowMax'}>
              <IconButton onClick={() => window.open(`https://my.workflowmax.com/job/jobview.aspx?id=${job.wfmID}`) }>
                <LinkIcon className={classes.iconRegular} />
              </IconButton>
            </Tooltip>
            <Tooltip title={'Log Time to WorkflowMax'}>
              <IconButton
                onClick={e => {
                  this.props.showModal({ modalType: WFM_TIME, modalProps: { job: jobs[job], }})
                }}>
                <TimerIcon className={classes.iconRegular} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <Tabs
          value={this.state.tabValue}
          onChange={this.handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          centered
        >
          <Tab label="General Information" />
          <Tab label="Rooms" />
          <Tab label="Asbestos Register" />
          <Tab label="Maps and Diagrams" />
        </Tabs>
        {this.props.modalType === WFM_TIME && <WfmTimeModal />}
        {this.state.tabValue === 0 && <JobGeneralInformation that={this} jobNumber={this.props.match.params.job.trim()} />}
        {this.state.tabValue === 1 && <JobRooms that={this} jobNumber={this.props.match.params.job.trim()} />}
        {this.state.tabValue === 2 && <JobAsbestosRegister that={this} jobNumber={this.props.match.params.job.trim()} />}
        {this.state.tabValue === 3 && <JobMapsAndDiagrams that={this} jobNumber={this.props.match.params.job.trim()} />}
      </div>
    );
    else return (<div />)
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Job)
);
