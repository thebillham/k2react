import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  appSettingsRef,
  sitesRef,
  templateAcmRef
} from "../../../config/firebase";

//Modals
import { WFM_TIME, TEMPLATE_ACM } from "../../../constants/modal-types";
import { showModal } from "../../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import WfmTimeModal from "../modals/WfmTimeModal";
import ClosedArrow from "@material-ui/icons/ArrowDropDown";
import OpenArrow from "@material-ui/icons/ArrowDropUp";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import EditIcon from "@material-ui/icons/Edit";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncIcon from "@material-ui/icons/Sync";
import LinkIcon from "@material-ui/icons/Link";
import TimerIcon from "@material-ui/icons/Timer";
import SelectIcon from "@material-ui/icons/Info";
import DeleteIcon from "@material-ui/icons/Close";
import Select from "react-select";
import SuggestionField from "../../../widgets/SuggestionField";
import AcmCard from "../components/AcmCard";
import AsbestosRegisterTable from "../components/AsbestosRegisterTable";
import NonAsbestosTable from "../components/NonAsbestosTable";
import AirMonitoringRecords from "../components/AirMonitoringRecords";
import SearchIcon from "@material-ui/icons/Search";
import ResultIcon from "@material-ui/icons/Lens";
import AirResultIcon from "@material-ui/icons/AcUnit";
import RemovedIcon from "@material-ui/icons/RemoveCircle";
import CheckWriterIcon from "@material-ui/icons/Done";
import CheckCheckerIcon from "@material-ui/icons/DoneAll";
import CheckKTPIcon from "@material-ui/icons/VerifiedUser";
import NotCheckedIcon from "@material-ui/icons/HourglassEmpty";
import ReactTable from "react-table";
import "react-table/react-table.css";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { DatePicker } from "@material-ui/pickers";
import _ from "lodash";

import classNames from "classnames";
import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
  personnelConvert
} from "../../../actions/helpers";

import moment from "moment";

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
  handleSiteChange,
  getWfmUrl,
  getLeadHistoryDescription,
  handleJobChange,
  loadAcmTemplate,
  getRoomInLayout
} from "../../../actions/jobs";

import {
  writeDescription,
  writeSimpleResult
} from "../../../actions/asbestosLab";
import { collateSamples } from "../../../actions/asbestosReportHelpers";

import { getFirestoreCollection } from "../../../actions/local";

import { filterMap, filterMapReset } from "../../../actions/display";

const mapStateToProps = state => {
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
    modalType: state.modal.modalType
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    handleSiteChange: info => dispatch(handleSiteChange(info)),
    handleSiteChangeDebounced: _.debounce(
      info => dispatch(handleSiteChange(info)),
      2000
    ),
    clearWfmJob: () => dispatch(clearWfmJob()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: modal => dispatch(showModal(modal))
  };
};

class SiteAsbestosRegister extends React.Component {
  state = {
    templateSearch: ""
  };

  UNSAFE_componentWillMount() {}

  componentWillUnmount() {}

  render() {
    const {
      classes,
      that,
      site,
      wfmClients,
      sites,
      siteJobs,
      siteAcm,
      samples
    } = this.props;
    const m =
      this.props.sites && this.props.sites[site]
        ? this.props.sites[site]
        : null;
    const { registerMap, registerList, airMonitoringRecords } = collateSamples(
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
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteAsbestosRegister)
);
