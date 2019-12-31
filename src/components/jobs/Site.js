import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";

//Modals
import {
  WFM_TIME,
  SITE_JOB,
  TEMPLATE_ACM,
  TEMPLATE_BUILDING_MATERIAL,
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
import SiteJobModal from "./modals/SiteJobModal";

import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
} from "../../actions/helpers";

import moment from 'moment';

import {
  fetchSites,
  clearWfmJob,
  getDetailedWFMJob,
  getJobColor,
  fetchSiteJobs,
} from "../../actions/jobs";

import {
  filterMap,
  filterMapReset,
} from "../../actions/display";

import JobsTable from "./JobsTable";
import Leads from "./Leads";
import JobMap from "./JobMap";
import JobStats from "./JobStats";
import SiteGeneralInformation from "./pages/SiteGeneralInformation";
import SiteVisitHistory from "./pages/SiteVisitHistory";
import SiteJob from "./pages/SiteJob";
import SiteLayout from "./pages/SiteLayout";
import SiteMapsAndDiagrams from "./pages/SiteMapsAndDiagrams";
import SiteAsbestosRegister from "./pages/SiteAsbestosRegister";
import TemplateBmModal from "./modals/TemplateBmModal";
import TemplateAcmModal from "./modals/TemplateAcmModal";

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
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
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
    fetchSites: () => dispatch(fetchSites()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    fetchSiteJobs: site => dispatch(fetchSiteJobs(site)),
  };
};

class Site extends React.Component {
  state = {
    searchJobNumber: '',
    searchClient: '',
    searchStartDate: '',
    searchEndDate: '',
    searchDateType: '',
    searchAnalyst: '',
    tabValue: 'general',
    jobModal: null,
  };

  UNSAFE_componentWillMount = () => {
    if (!this.props.sites || Object.keys(this.props.sites).length === 0) {
      this.props.fetchSites();
      this.props.fetchSiteJobs(this.props.match.params.site.trim())
    }
    // console.log(this.props.sites[this.props.match.params.site.trim()]);
    if (this.props.siteJobs && (!this.props.siteJobs[this.props.match.params.site.trim()] ||
    Object.keys(this.props.siteJobs[this.props.match.params.site.trim()]).length === 0)) {
      console.log(this.props.siteJobs[this.props.match.params.site.trim()])
      this.props.fetchSiteJobs(this.props.match.params.site.trim());
    }
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  render() {
    const { classes, geocodes, sites, siteJobs, } = this.props;
    const site = sites && sites[this.props.match.params.site.trim()];
    const jobs = siteJobs && siteJobs[this.props.match.params.site.trim()];
    const color = site ? classes[getJobColor(site.primaryJobType)] : classes[getJobColor('other')];
    // console.log(site);
    // console.log(siteJobs);

    if (site) return (
      <div className={classes.marginTopSmall}>
        <div className={classes.flexRowSpread}>
          <div className={color}>
            <h6>{`${site.client ? `${site.client}: ` : ''}${site.siteName}`}</h6>
            <div className={classes.subtitle}>{site.address}</div>
          </div>
          <div className={classes.flexRow}>
            {/*<Tooltip title={'Re-sync with WorkflowMax'}>
              <IconButton
                onClick={e => this.props.getDetailedWFMJob(site.jobNumber)}>
                <SyncIcon className={classes.iconRegular} />
              </IconButton>
            </Tooltip>
            <Tooltip title={'View Job on WorkflowMax'}>
              <IconButton onClick={() => window.open(`https://my.workflowmax.com/job/jobview.aspx?id=${site.wfmID}`) }>
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
            </Tooltip>*/}
          </div>
        </div>
        <Tabs
          value={this.state.tabValue}
          onChange={this.handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General Information" value='general' />
          {/*<Tab label="Site Visit History" value='visithistory' />*/}
          <Tab label="Site Layout" value='layout' />
          <Tab label="Asbestos Register" value='register' />
          <Tab label="Maps and Diagrams" value='maps' />
          {jobs && Object.keys(jobs).length > 0 && Object.values(jobs).map(j => {
            // console.log(j);
            return (<Tab label={j.jobDescription} value={j.uid} key={j.uid} />);
          })}
        </Tabs>
        {this.props.modalType === WFM_TIME && <WfmTimeModal />}
        {this.props.modalType === SITE_JOB && <SiteJobModal />}
        {this.props.modalType === TEMPLATE_ACM && <TemplateAcmModal />}
        {this.props.modalType === TEMPLATE_BUILDING_MATERIAL && <TemplateBmModal />}
        {this.state.tabValue === 'general' && <SiteGeneralInformation that={this} site={this.props.match.params.site.trim()} />}
        {this.state.tabValue === 'visithistory' && <SiteVisitHistory that={this} site={this.props.match.params.site.trim()} />}
        {this.state.tabValue === 'layout' && <SiteLayout that={this} site={this.props.match.params.site.trim()} />}
        {this.state.tabValue === 'register' && <SiteAsbestosRegister that={this} site={this.props.match.params.site.trim()} />}
        {this.state.tabValue === 'maps' && <SiteMapsAndDiagrams that={this} site={this.props.match.params.site.trim()} />}
        {jobs && Object.keys(jobs).length > 0 && Object.values(jobs).map(j => {
          if (this.state.tabValue === j.uid) return (<SiteJob that={this} m={j} site={this.props.match.params.site.trim()} key={j.uid} />);
        })}
      </div>
    );
    else return (<div />)
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Site)
);
