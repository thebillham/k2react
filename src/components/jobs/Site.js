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
  ASBESTOS_COC_EDIT,
  ASBESTOS_SAMPLE_EDIT_COC,
  SITE_VISIT,
  ASBESTOS_CLEARANCE,
} from "../../constants/modal-types";
import { showModal } from "../../actions/modal";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import WfmTimeModal from "./modals/WfmTimeModal";
import SiteJobModal from "./modals/SiteJobModal";
import CocModal from "../asbestoslab/modals/CocModal";
import AsbestosSampleCocEditModal from "../asbestoslab/modals/AsbestosSampleCocEditModal";
import ClearanceModal from "./modals/ClearanceModal";
import SiteVisitModal from "./modals/SiteVisitModal";

import moment from "moment";

import {
  fetchSites,
  clearWfmJob,
  getJobColor,
  fetchSiteJobs,
  fetchSiteAcm,
  fetchSiteCocs,
} from "../../actions/jobs";

import { filterMap, filterMapReset } from "../../actions/display";

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
import SiteAddAcm from "./pages/SiteAddAcm";
import TemplateBmModal from "./modals/TemplateBmModal";
import TemplateAcmModal from "./modals/TemplateAcmModal";

const mapStateToProps = (state) => {
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
    siteAcm: state.jobs.siteAcm,
    siteCocs: state.jobs.siteCocs,
    search: state.local.search,
    me: state.local.me,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType,
    modalTypeSecondary: state.modal.modalTypeSecondary,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearWfmJob: () => dispatch(clearWfmJob()),
    showModal: (modal) => dispatch(showModal(modal)),
    fetchSites: () => dispatch(fetchSites()),
    fetchSiteJobs: (site) => dispatch(fetchSiteJobs(site)),
    fetchSiteAcm: (site) => dispatch(fetchSiteAcm(site)),
  };
};

class Site extends React.Component {
  state = {
    searchJobNumber: "",
    searchClient: "",
    searchStartDate: "",
    searchEndDate: "",
    searchDateType: "",
    searchAnalyst: "",
    tabValue: "general",
    jobModal: null,
  };

  UNSAFE_componentWillMount = () => {
    if (!this.props.sites || Object.keys(this.props.sites).length === 0) {
      this.props.fetchSites();
      this.props.fetchSiteJobs(this.props.match.params.site.trim());
    }
    // console.log(this.props.sites[this.props.match.params.site.trim()]);
    if (
      this.props.siteJobs &&
      (!this.props.siteJobs[this.props.match.params.site.trim()] ||
        Object.keys(this.props.siteJobs[this.props.match.params.site.trim()])
          .length === 0)
    ) {
      console.log(this.props.siteJobs[this.props.match.params.site.trim()]);
      this.props.fetchSiteJobs(this.props.match.params.site.trim());
    }

    if (
      this.props.siteAcm &&
      (!this.props.siteAcm[this.props.match.params.site.trim()] ||
        Object.keys(this.props.siteAcm[this.props.match.params.site.trim()])
          .length === 0)
    ) {
      console.log(this.props.siteAcm[this.props.match.params.site.trim()]);
      this.props.fetchSiteAcm(this.props.match.params.site.trim());
    }
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  render() {
    const { classes, geocodes, sites, siteJobs, siteAcm } = this.props;
    const site = sites && sites[this.props.match.params.site.trim()];
    const jobs = siteJobs && siteJobs[this.props.match.params.site.trim()];
    const color = site
      ? classes[getJobColor(site.primaryJobType)]
      : classes[getJobColor("other")];
    // console.log(site);
    // console.log(siteJobs);

    if (site)
      return (
        <div className={classes.marginTopSmall}>
          <div className={classes.flexRowSpread}>
            <div className={color}>
              <h6>{`${site.client ? `${site.client}: ` : ""}${
                site.siteName
              }`}</h6>
              <div className={classes.subtitle}>{site.address}</div>
            </div>
            <div className={classes.flexRow}></div>
          </div>
          <Tabs
            value={this.state.tabValue}
            onChange={this.handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="General Information" value="general" />
            {/*<Tab label="Site Visit History" value='visithistory' />*/}
            <Tab label="Site Layout" value="layout" />
            <Tab label="Add/Edit ACM" value="addAcm" />
            <Tab label="ACM Tables" value="register" />
            {/*<Tab label="Maps and Diagrams" value="maps" />*/}
            {jobs &&
              Object.keys(jobs).length > 0 &&
              Object.values(jobs).map((j) => {
                // console.log(j);
                return (
                  <Tab label={j.jobDescription} value={j.uid} key={j.uid} />
                );
              })}
          </Tabs>
          {this.props.modalType === WFM_TIME && <WfmTimeModal />}
          {this.props.modalType === SITE_JOB && <SiteJobModal />}
          {this.props.modalType === TEMPLATE_ACM && <TemplateAcmModal />}
          {this.props.modalType === TEMPLATE_BUILDING_MATERIAL && (
            <TemplateBmModal />
          )}
          {this.props.modalType === ASBESTOS_COC_EDIT && <CocModal />}
          {this.props.modalTypeSecondary === ASBESTOS_SAMPLE_EDIT_COC && (
            <AsbestosSampleCocEditModal />
          )}
          {this.props.modalType === SITE_VISIT && <SiteVisitModal />}
          {this.props.modalType === ASBESTOS_CLEARANCE && <ClearanceModal />}
          {this.state.tabValue === "general" && (
            <SiteGeneralInformation
              that={this}
              site={this.props.match.params.site.trim()}
            />
          )}
          {this.state.tabValue === "visithistory" && (
            <SiteVisitHistory
              that={this}
              site={this.props.match.params.site.trim()}
            />
          )}
          {this.state.tabValue === "layout" && (
            <SiteLayout
              that={this}
              site={this.props.match.params.site.trim()}
            />
          )}
          {this.state.tabValue === "addAcm" && (
            <SiteAddAcm
              that={this}
              site={this.props.match.params.site.trim()}
            />
          )}
          {this.state.tabValue === "register" && (
            <SiteAsbestosRegister
              that={this}
              site={this.props.match.params.site.trim()}
            />
          )}
          {this.state.tabValue === "maps" && (
            <SiteMapsAndDiagrams
              that={this}
              site={this.props.match.params.site.trim()}
            />
          )}
          {jobs &&
            Object.keys(jobs).length > 0 &&
            Object.values(jobs).map((j) => {
              if (this.state.tabValue === j.uid)
                return (
                  <SiteJob
                    that={this}
                    m={j}
                    site={this.props.match.params.site.trim()}
                    key={j.uid}
                  />
                );
            })}
        </div>
      );
    else return <div />;
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Site)
);
