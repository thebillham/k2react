import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

//Modals
import { showModal } from "../../../actions/modal";
import AsbestosRegisterTable from "../components/AsbestosRegisterTable";
import NonAsbestosTable from "../components/NonAsbestosTable";
import AirMonitoringRecords from "../components/AirMonitoringRecords";

import _ from "lodash";

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  clearWfmJob,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  handleSiteChange,
} from "../../../actions/jobs";

import { collateSamples } from "../../../actions/asbestosReportHelpers";

import { filterMap, filterMapReset } from "../../../actions/display";

const mapStateToProps = (state) => {
  return {
    acmTemplates: state.local.acmTemplates,
    asbestosRemovalists: state.const.asbestosRemovalists,
    siteVisitTypeAsbestos: state.const.siteVisitTypeAsbestos,
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

const mapDispatchToProps = (dispatch) => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    handleSiteChange: (info) => dispatch(handleSiteChange(info)),
    handleSiteChangeDebounced: _.debounce(
      (info) => dispatch(handleSiteChange(info)),
      2000
    ),
    clearWfmJob: () => dispatch(clearWfmJob()),
    saveGeocodes: (g) => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: (g) => dispatch(updateGeocodes(g)),
    saveWFMItems: (items) => dispatch(saveWFMItems(items)),
    saveStats: (stats) => dispatch(saveStats(stats)),
    filterMap: (filter) => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: (modal) => dispatch(showModal(modal)),
  };
};

class SiteAsbestosRegister extends React.Component {
  state = {
    templateSearch: "",
  };

  UNSAFE_componentWillMount() {}

  componentWillUnmount() {}

  render() {
    const { classes, site, sites, siteJobs, siteAcm, samples } = this.props;
    const { registerList, airMonitoringRecords } = collateSamples(
      sites[site],
      siteJobs ? siteJobs[site] || {} : {},
      siteAcm ? siteAcm[site] || {} : {},
      samples
    );
    const loading =
      !sites[site] || !siteJobs[site] || !siteAcm[site] || !samples;
    return (
      <div>
        <AsbestosRegisterTable
          loading={loading}
          registerList={registerList}
          classes={classes}
        />
        <div className={classes.flexRow}>
          <div style={{ width: "60vw" }}>
            <NonAsbestosTable
              loading={loading}
              registerList={registerList}
              classes={classes}
            />
          </div>
          <div className={classes.spacerMedium} />
          <AirMonitoringRecords
            loading={loading}
            airMonitoringRecords={airMonitoringRecords}
            classes={classes}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(SiteAsbestosRegister)
);
