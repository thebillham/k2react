import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import moment from "moment";
import {
  fetchCocs,
  fetchSamples,
  logSample,
  setSessionID,
  deleteCoc,
  startAnalysisAll,
  receiveAll,
  printCocBulk,
  printLabReport,
  issueTestCertificate,
  getPersonnel,
  getStatus,
  getWATotalDetails,
  getSampleColors,
} from "../../../actions/asbestosLab";
import { syncJobWithWFM, } from "../../../actions/local";
import { AsbButton, } from '../../../widgets/FormWidgets';
import { setAsbestosLabExpanded, toggleAsbestosSampleDisplayMode, } from "../../../actions/display";
import { showModal } from "../../../actions/modal";
import {
  ASBESTOS_SAMPLE_EDIT,
  ASBESTOS_COC_EDIT,
  COC_STATS,
  ASBESTOS_ACTIONS,
  UPDATE_CERTIFICATE_VERSION,
  COC_LOG,
  COC_ISSUES,
} from "../../../constants/modal-types";

import AsbestosSampleListItem from "./AsbestosSampleListItem";
import AsbestosBulkCocSummary from "./AsbestosBulkCocSummary";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";

import ExpandMore from "@material-ui/icons/ExpandMore";
import EditIcon from "@material-ui/icons/Edit";
import ReceiveIcon from "@material-ui/icons/Inbox";
import DownloadIcon from "@material-ui/icons/SaveAlt";
import PrintCocIcon from "@material-ui/icons/Print";
import IssueVersionIcon from "@material-ui/icons/Send";
import RecordAnalysisIcon from "@material-ui/icons/HowToVote";
import VerifyIcon from "@material-ui/icons/CheckCircleOutline";
import UrgentIcon from "@material-ui/icons/Flag";
import MoreIcon from "@material-ui/icons/MoreVert";
import StartAnalysisIcon from "@material-ui/icons/Colorize";
import WAIcon from "@material-ui/icons/GroupWork";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
    analyst: state.asbestosLab.analyst,
    analysisMode: state.asbestosLab.analysisMode,
    sessionID: state.asbestosLab.sessionID,
    bulkAnalysts: state.asbestosLab.bulkAnalysts,
    airAnalysts: state.asbestosLab.airAnalysts,
    cocs: state.asbestosLab.cocs,
    expanded: state.display.asbestosLabExpanded,
    asbestosSampleDisplayAdvanced: state.display.asbestosSampleDisplayAdvanced
  };
};

class AsbestosSampleWASummary extends React.Component {
  render() {
    const { sample, classes } = this.props;
    let wa = getWATotalDetails(sample);
    let waColors = getSampleColors(wa);

    return(
      <div className={classes.flexRowBox}>
        <div className={classes.textField}>Totals</div>
        <div className={classes.flexRowRightAlign}>
          <div style={{ width: '40%' }} />
          <div style={{ width: '35%'}}>
            <div>Dry Weight: </div>
            <div>Ashed Weight: </div>
          </div>
          <div>
            <div>{sample.weightDry ? <span>{parseFloat(sample.weightDry).toFixed(2)}g</span> : <span>N/A</span>}</div>
            <div>{sample.weightAshed ? <span>{parseFloat(sample.weightAshed).toFixed(2)}g</span> : <span>N/A</span>}</div>
          </div>
        </div>
        <div className={classes.flexRowRightAlign}>
          <div style={{ width: '40%'}}>
            <div>Type</div>
            <div>ACM Bonded</div>
            <div>Friable Asbestos</div>
            <div>Asbestos Fines</div>
            <div>FA/AF Total</div>
          </div>
          <div style={{ width: '25%'}}>
            <div>Asbestos Weight</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInACM.toFixed(6)}g</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInFA.toFixed(6)}g</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInAF.toFixed(6)}g</div>
            <div className={classes.bottomDottedStyle}>{(wa.asbestosInFA + wa.asbestosInAF).toFixed(6)}g</div>
          </div>
          <div>
            <div>Asbestos Concentration</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInACMConc ? <span className={wa.asbestosInACMConc > 0.01 ? classes.boldRedWarningText : classes.boldBlack }>{wa.asbestosInACMConc.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInFAConc ? <span className={wa.asbestosInFAConc > 0.001 ? classes.boldRedWarningText : classes.boldBlack }>{wa.asbestosInFAConc.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInAFConc ? <span className={wa.asbestosInAFConc > 0.001 ? classes.boldRedWarningText : classes.boldBlack }>{wa.asbestosInAFConc.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div className={classes.bottomDottedStyle}>{wa.asbestosInFAAFConc ? <span className={wa.asbestosInFAAFConc > 0.001 ? classes.boldRedWarningText : classes.boldBlack }>{wa.asbestosInFAAFConc.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
          </div>
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf'].map(res => {
            return AsbButton(classes[`colorsButton${waColors[res]}`], classes[`colorsDiv${waColors[res]}`], res,
            null)
          })}
        </div>
        { wa.allHaveTypes === false && <div className={classes.warningTextLight}>
          Not all subfractions have been assigned an asbestos type (i.e. CH/AM/CR/UMF).
        </div>}
        { wa.allHaveForms === false && <div className={classes.warningTextLight}>
          Not all subfractions have been assigned an asbestos form (i.e. AF/FA/ACM). This will result in an incorrect concentration.
        </div>}
        { sample.result !== wa.result && <div className={classes.warningTextLight}>
          The cumulative result of the analysed fractions does not match with the reported asbestos result for the entire sample. Please check.
        </div>}
      </div>
    );
  }
}

export default withStyles(styles)(AsbestosSampleWASummary);
