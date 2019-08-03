import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
  asbestosSamplesRef,
} from "../../../config/firebase";
import {
  writeDescription,
  getSampleColors,
  getBasicResult,
  holdSample,
  writeShorthandResult,
  getConfirmColor,
} from "../../../actions/asbestosLab";
import { AsbButton } from '../../../widgets/FormWidgets';
import { showModal } from "../../../actions/modal";
import {
  ASBESTOS_SAMPLE_DETAILS,
  WA_ANALYSIS,
  SAMPLE_HISTORY,
  CONFIRM_RESULT,
  ASBESTOS_NONANALYST_DETAILS,
} from "../../../constants/modal-types";

import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

import EditIcon from "@material-ui/icons/Edit";
import ReceiveIcon from "@material-ui/icons/Inbox";
import CameraIcon from "@material-ui/icons/CameraAlt";
import AnalysisIcon from "@material-ui/icons/Colorize";
import WAIcon from "@material-ui/icons/GroupWork";
import SampleLogIcon from "@material-ui/icons/Ballot";
import SampleDetailsIcon from "@material-ui/icons/Description";
import HoldIcon from "@material-ui/icons/PauseCircleOutline";
import ConfirmIcon from "@material-ui/icons/ThumbUp";
import ThumbsDown from "@material-ui/icons/ThumbDown";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";

import { addLog, } from '../../../actions/local';

// const {whyDidYouUpdate} = require('why-did-you-update');
import Popup from "reactjs-popup";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    cocs: state.asbestosLab.cocs,
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
  // static whyDidYouRender = true;

  shouldComponentUpdate(nextProps) {
    // return true;
    if (this.props.samples[this.props.job][this.props.sample] !== nextProps.samples[nextProps.job][nextProps.sample]) {
      return true;
    } else {
      // console.log('Blocked re-render of SampleList');
      return false;
    }
  }

  toggleWAAnalysis = () => {
    let sample = this.props.samples[this.props.job][this.props.sample];
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
    } else if (this.props.samples[this.props.job]) {
      Object.values(this.props.samples[this.props.job]).filter(el => el.deleted === false && el.uid !== sample.uid)
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
    const { samples, staff, anchorEl, classes } = this.props;
    const sample = this.props.samples[this.props.job][this.props.sample];
    const job = this.props.cocs[this.props.job];
    if ((sample && sample.cocUid !== job.uid) || !sample) return null;
    let result = getBasicResult(sample);
    // let colors = getSampleColors(sample, classes);
    let confirmColor = '';
    if (sample.confirm) confirmColor = getConfirmColor(sample);
    let editor = this.props.me.auth && this.props.me.auth['Asbestos Bulk Analysis'];
    let noResults = true;

    return (
        <ListItem key={sample.uid} className={classes.hoverItem}>
          <Grid container className={classes.fullWidth}>
            <Grid item xs={12} xl={3}>
              <div className={classes.flexRowLeftAlignEllipsis}>
                <div className={classes.circleShaded}>
                  {sample.sampleNumber}
                </div>
                {sample.imagePathRemote && <Popup
                  trigger={<CameraIcon className={classes.iconRegularGreen} />}
                  position="right center"
                  on="hover"
                  >
                    <img
                      alt=""
                      src={sample.imagePathRemote}
                      width={200}
                    />
                    : <span />
                  }
                </Popup>}
                {writeDescription(sample)}
                {sample.onHold && <div className={classes.boldRedWarningText}>ON HOLD</div>}
              </div>
            </Grid>
            <Grid item xs={12} xl={9}>
              <div className={classes.flexRowRightAlign}>
                <Tooltip title={sample.receivedByLab ? 'Received by lab' : 'Not yet received by lab'}>
                  <ReceiveIcon className={sample.receivedByLab ? classes.iconRegularGreen : classes.iconRegular} />
                </Tooltip>
                <Tooltip title={sample.analysisStart ? 'Analysis begun' : 'Analysis not yet begun'}>
                  <AnalysisIcon className={sample.analysisStart ? classes.iconRegularGreen : classes.iconRegular} />
                </Tooltip>
                <div className={getBasicResult(sample) === 'none' ? classes.roundButtonShadedLong : getBasicResult(sample) === 'negative' ? classes.roundButtonShadedLongGreen : classes.roundButtonShadedLongRed}>
                  {writeShorthandResult(sample.result)}
                </div>
                <Tooltip title={'Weight on Receipt'}><div className={classes.roundButtonShaded}>{sample.weightReceived ? `${sample.weightReceived}g` : 'NO WEIGHT'}</div></Tooltip>
                <Tooltip title={sample.verified ? 'Result verified' : 'Result not yet verified'}>
                  <CheckCircleOutline className={sample.verified ? classes.iconRegularGreen : classes.iconRegular} />
                </Tooltip>
                {editor && <Tooltip id="det-tooltip" title={'Edit Sample Details'}>
                  <IconButton
                    onClick={event => {
                        this.props.showModal({
                          modalType: ASBESTOS_SAMPLE_DETAILS,
                          modalProps: {
                            doc: sample,
                            job: job,
                        }});
                    }}
                  >
                    <EditIcon className={classes.iconRegular}/>
                  </IconButton>
                </Tooltip>}
                {job.waAnalysis &&
                  <Tooltip id="wa-tooltip" title={editor ? 'WA Analysis' : sample.waAnalysisComplete ? 'WA Analysis Complete' : 'WA Analysis Incomplete'}>
                    <IconButton
                      onClick={event => editor ?
                        this.props.showModal({
                          modalType: WA_ANALYSIS,
                          modalProps: {
                            doc: sample,
                            job: job,
                        }}) : null
                      }
                    >
                      <WAIcon className={sample.waAnalysisComplete ? classes.iconRegularGreen : classes.iconRegular} />
                    </IconButton>
                  </Tooltip>
                }
                <Tooltip id="cr-tooltip" title={editor ? 'Result Checks' : confirmColor === 'Red' ? 'Contradictory result given by other analyst' : confirmColor === 'Green' ? 'Result confirmed by another analyst' : 'Slightly different result given by other analyst'}>
                  <IconButton
                    onClick={event => editor ?
                      this.props.showModal({
                        modalType: CONFIRM_RESULT,
                        modalProps: {
                          title: `Confirm Result for ${
                            job.jobNumber
                          }-${sample.sampleNumber.toString()}`,
                          sample: sample,
                          jobUid: job.uid,
                        }
                      }) : null
                    }
                  >
                    {confirmColor === 'Red' ? <ThumbsDown className={classes.iconRegularRed} /> :
                    <ConfirmIcon className={classes[`iconRegular${confirmColor}`]} />}
                  </IconButton>
                </Tooltip>
                <Tooltip id="h-tooltip" title={sample.onHold ? 'Take Sample off Hold' : 'Put Sample on Hold'}>
                  <IconButton
                    onClick={event => {
                      console.log('Clicked');
                      holdSample(sample, job, this.props.me);
                    }}>
                    <HoldIcon className={sample.onHold ? classes.iconRegularRed : classes.iconRegular} />
                  </IconButton>
                </Tooltip>
                <Tooltip id="det-tooltip" title={'Sample Details'}>
                  <IconButton
                    onClick={event => {
                        this.props.showModal({
                          modalType: ASBESTOS_NONANALYST_DETAILS,
                          modalProps: {
                            doc: sample,
                            job: job,
                        }});
                    }}
                  >
                    <SampleDetailsIcon className={classes.iconRegular}/>
                  </IconButton>
                </Tooltip>
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
                    <SampleLogIcon className={classes.iconRegular}/>
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
