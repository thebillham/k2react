import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
  asbestosAnalysisRef,
  firebase,
  auth,
  asbestosSamplesRef,
} from "../../../config/firebase";
import moment from "moment";
import momentbusinessdays from "moment-business-days";
import momenttimezone from "moment-timezone";
import momentbusinesstime from "moment-business-time";
import {
  fetchCocs,
  fetchSamples,
  logSample,
  writeResult,
  getStats,
  writeDescription,
  getSampleColours,
  getBasicResult,
  receiveSample,
  startAnalysis,
  toggleResult,
  holdSample,
  verifySample,
} from "../../../actions/asbestosLab";
import { syncJobWithWFM } from "../../../actions/local";
import { AsbestosClickyBasic, } from '../../../widgets/ButtonWidgets';
import { showModal } from "../../../actions/modal";
import {
  COC,
  ASBESTOS_SAMPLE_DETAILS,
  DOWNLOAD_LAB_CERTIFICATE,
  UPDATE_CERTIFICATE_VERSION,
  WA_ANALYSIS,
  SAMPLE_HISTORY,
  COC_LOG,
  CONFIRM_RESULT,
  ASBESTOS_NONANALYST_DETAILS,
} from "../../../constants/modal-types";

import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";

import ExpandMore from "@material-ui/icons/ExpandMore";
import Edit from "@material-ui/icons/Edit";
import Inbox from "@material-ui/icons/Inbox";
import Save from "@material-ui/icons/SaveAlt";
import CameraAlt from "@material-ui/icons/CameraAlt";
import Print from "@material-ui/icons/Print";
import Send from "@material-ui/icons/Send";
import Flag from "@material-ui/icons/Flag";
import More from "@material-ui/icons/MoreVert";
import AnalysisIcon from "@material-ui/icons/Colorize";
import WAIcon from "@material-ui/icons/GroupWork";
import SampleLogIcon from "@material-ui/icons/Ballot";
import SampleDetailsIcon from "@material-ui/icons/Description";
import HoldIcon from "@material-ui/icons/PauseCircleOutline";
import ConfirmIcon from "@material-ui/icons/ThumbUp";
import ThumbsDown from "@material-ui/icons/ThumbDown";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";

import { addLog, } from '../../../actions/local';

import Popup from "reactjs-popup";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
    analyst: state.asbestosLab.analyst,
    sessionID: state.asbestosLab.sessionID,
    analysisMode: state.asbestosLab.analysisMode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
  };
};

class SampleListItem extends React.Component {
  toggleWAAnalysis = () => {
    let sample = this.props.sample;
    let log = {
      type: "Admin",
      log: sample.waAnalysis ? `Western Australia guidelines removed from Sample ${sample.sampleNumber}` : `Western Australia guidelines added to Sample ${sample.sampleNumber}`,
      sample: sample.uid,
      chainOfCustody: sample.cocUid,
    };
    addLog("asbestosLab", log, this.props.me);

    let waAnalysis = false;
    if (!sample.waAnalysis) {
      waAnalysis = true;
    } else if (this.props.samples[this.props.job.uid]) {
      Object.values(this.props.samples[this.props.job.uid]).filter(el => el.deleted === false && el.uid !== sample.uid)
      .forEach(el => {
        if (el.waAnalysis) waAnalysis = true;
      });
    }

    cocsRef
      .doc(this.props.job.uid)
      .update({ versionUpToDate: false, mostRecentIssueSent: false, waAnalysis: waAnalysis, });
    asbestosSamplesRef
      .doc(sample.uid)
      .update({ waAnalysis: !sample.waAnalysis});
  }

  render() {
    const { sample, job, samples, staff, anchorEl, classes } = this.props;
    if (sample.cocUid !== job.uid) return null;
    let result = getBasicResult(sample);
    let colours = getSampleColours(sample);
    let editor = this.props.me.auth && this.props.me.auth['Asbestos Bulk Analysis'];

    return (
      <ListItem key={sample.uid} className={classes.hoverItem}>
        <Grid container>
          <Grid item xs={12} xl={3}>
            <div style={{
              textOverflow: "ellipsis",
              // whiteSpace: "nowrap",
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              overflow: "hidden",
            }}>
              <Popup
                trigger={
                  <CameraAlt className={classes.asbestosIcon}
                    style={{color: colours.cameraColour,}}
                  />
                }
                position="right center"
                on="hover"
                disabled={sample.imagePathRemote == null}
              >
                {sample.imagePathRemote ?
                  <img
                    alt=""
                    src={sample.imagePathRemote}
                    width={200}
                  />
                  : <span />
                }
              </Popup>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#aaa",
                  marginRight: 10,
                  color: "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  fontWeight: "bold"
                }}
              >
                {sample.sampleNumber}
              </div>
              {writeDescription(sample)}
              {sample.onHold && <div style={{ fontWeight: 'bold', marginLeft: 12, color: 'red' }}>ON HOLD</div>}
            </div>
          </Grid>
          <Grid item xs={12} xl={9}>
            <div style={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
            }}>
              <Tooltip title='Mark as Received by Lab'>
                <IconButton
                  onClick={event => {
                    receiveSample(sample, job, samples[job.uid], this.props.sessionID, this.props.me);
                  }}
                >
                <Inbox className={classes.asbestosIcon}
                  style={{color: colours.receivedColour}}
                />
                </IconButton>
              </Tooltip>
              <Tooltip title='Start Analysis'>
                  <IconButton
                    onClick={event => {
                      startAnalysis(sample, job, this.props.sessionID, samples[job.uid], this.props.me);
                    }}
                  >
                    <AnalysisIcon className={classes.asbestosIcon}
                      style={{color: colours.analysisColour}}
                    />
                  </IconButton>
              </Tooltip>
              {AsbestosClickyBasic(colours.chColour, colours.chDivColour, 'Chrysotile (white) asbestos detected', 'CH',
              () => toggleResult("ch", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              {AsbestosClickyBasic(colours.amColour, colours.amDivColour, 'Amosite (brown) asbestos detected', 'AM',
              () => toggleResult("am", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              {AsbestosClickyBasic(colours.crColour, colours.crDivColour, 'Crocidolite (blue) asbestos detected', 'CR',
              () => toggleResult("cr", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              {AsbestosClickyBasic(colours.umfColour, colours.umfDivColour, 'Unidentified mineral fibres detected', 'UMF',
              () => toggleResult("umf", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              <div style={{ width: 30 }} />
              {AsbestosClickyBasic(colours.noColour, colours.noDivColour, 'No asbestos detected', 'NO',
              () => toggleResult("no", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              <div style={{ width: 30 }} />
              {AsbestosClickyBasic(colours.orgColour, colours.orgDivColour, 'Organic fibres detected', 'ORG',
              () => toggleResult("org", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              {AsbestosClickyBasic(colours.smfColour, colours.smfDivColour, 'Synthetic mineral fibres detected', 'SMF',
              () => toggleResult("smf", this.props.analyst, sample, job, samples[job.uid], this.props.sessionID, this.props.me))}
              <Tooltip title='Verify Result is Correct'>
                <IconButton
                  onClick={event => {
                    if (
                      (!sample.verified &&
                      getBasicResult(sample) === "none" &&
                      !window.confirm(
                        "No asbestos result has been recorded for this sample. This will appear as 'Not analysed' in the test certificate. Proceed?"
                      )) || sample.onHold
                    )
                      return;
                    verifySample(sample, job, samples[job.uid], this.props.sessionID, this.props.me,);
                  }}
                >
                  <CheckCircleOutline className={classes.asbestosIcon}
                    style={{
                      color: colours.verifiedColour
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip id="det-tooltip" title={'Sample Details'}>
                <IconButton
                  onClick={event => {
                      this.props.showModal({
                        modalType: editor ? ASBESTOS_SAMPLE_DETAILS : ASBESTOS_NONANALYST_DETAILS,
                        modalProps: {
                          doc: sample,
                          job: job,
                      }});
                  }}
                >
                  <SampleDetailsIcon className={classes.asbestosIcon}/>
                </IconButton>
              </Tooltip>
              {job.waAnalysis &&
                <Tooltip id="wa-tooltip" title={'WA Analysis'}>
                  <IconButton
                    disabled={!editor}
                    onClick={event => {
                      this.props.showModal({
                        modalType: WA_ANALYSIS,
                        modalProps: {
                          doc: sample,
                          job: job,
                      }});
                    }}
                  >
                    <WAIcon className={classes.asbestosIcon}
                      style={{color: colours.waColour}}
                    />
                  </IconButton>
                </Tooltip>
              }
              <Tooltip id="sl-tooltip" title={'Sample Log'}>
                <IconButton
                  onClick={event => {
                    this.props.showModal({
                      modalType: SAMPLE_HISTORY,
                      modalProps: {
                        title: `Sample History for ${
                          job.jobNumber
                        }-${sample.sampleNumber.toString()}`,
                        ...sample,
                    }});
                  }}
                >
                  <SampleLogIcon className={classes.asbestosIcon}/>
                </IconButton>
              </Tooltip>
              <Tooltip id="cr-tooltip" title={'Analysis Checks'}>
                <IconButton
                  disabled={!editor}
                  onClick={event => {
                    this.props.showModal({
                      modalType: CONFIRM_RESULT,
                      modalProps: {
                        title: `Confirm Result for ${
                          job.jobNumber
                        }-${sample.sampleNumber.toString()}`,
                        sample: sample,
                        jobUid: job.uid,
                      }
                    });
                  }}
                >
                  {colours.confirmColour === 'red' ? <ThumbsDown className={classes.asbestosIcon} style={{ color: 'red' }} /> :
                  <ConfirmIcon className={classes.asbestosIcon} style={{color: colours.confirmColour}} />}
                </IconButton>
              </Tooltip>
              <Tooltip id="h-tooltip" title={sample.onHold ? 'Take Sample off Hold' : 'Put Sample on Hold'}>
                <IconButton
                  onClick={event => {
                    holdSample(sample, job, this.props.me);
                  }}>
                  <HoldIcon className={classes.asbestosIcon} style={{color: sample.onHold ? 'red' : 'inherit'}} />
                </IconButton>
              </Tooltip>
            </div>
          </Grid>
        </Grid>
      </ListItem>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SampleListItem)
);
