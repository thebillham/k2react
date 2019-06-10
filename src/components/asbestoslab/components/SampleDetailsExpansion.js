import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
  asbestosAnalysisRef,
  firebase,
  auth,
  asbestosSamplesRef
} from "../../../config/firebase";
import moment from "moment";
import momentbusinessdays from "moment-business-days";
import momenttimezone from "moment-timezone";
import momentbusinesstime from "moment-business-time";
import { fetchCocs, fetchSamples, logSample, writeResult } from "../../../actions/asbestosLab";
import { syncJobWithWFM } from "../../../actions/local";
import { showModal } from "../../../actions/modal";
import {
  COC,
  ASBESTOSSAMPLEDETAILS,
  DOWNLOADLABCERTIFICATE,
  UPDATECERTIFICATEVERSION,
  WAANALYSIS,
  SAMPLEHISTORY,
  COCLOG
} from "../../../constants/modal-types";

import SampleDetailsExpansionWA from "./SampleDetailsExpansionWA";
import SampleDetailsExpansionSummary from "./SampleDetailsExpansionSummary";
import SampleDetailsExpansionDetails from "./SampleDetailsExpansionDetails";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
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
import SampleDetailsIcon from "@material-ui/icons/Edit";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";

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
    logSample: (coc, sample, cocStats) => dispatch(logSample(coc, sample, cocStats)),
  };
};

class SampleDetailsExpansion extends React.Component {
  toggleWAAnalysis = () => {
    let cocLog = this.props.job.cocLog;
    let sample = this.props.sample;

    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Admin",
      log: sample.waAnalysis ? `Western Australia guidelines removed from Sample ${sample.sampleNumber}` : `Western Australia guidelines added to Sample ${sample.sampleNumber}`,
      user: auth.currentUser.uid,
      userName: this.props.me.name,
      date: new Date(),
      sample: sample.uid,
    });

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
      .update({ versionUpToDate: false, cocLog: cocLog, waAnalysis: waAnalysis, });
    asbestosSamplesRef
      .doc(sample.uid)
      .update({ waAnalysis: !sample.waAnalysis});
  }

  toggleResult = result => {
    let sample = this.props.sample;
    if (
      this.props.me &&
      this.props.me.auth &&
      (this.props.me.auth["Asbestos Bulk Analysis"] ||
        this.props.me.auth["Asbestos Admin"])
    ) {
      // Check analyst has been selected
      if (this.props.analyst === "") {
        window.alert(
          "Select analyst from the dropdown at the top of the page."
        );
      }
      let cocLog = this.props.job.cocLog;
      if (!cocLog) cocLog = [];
      // Check if this sample has already been analysed
      if (sample.sessionID !== this.props.sessionID && sample.result) {
        if (
          window.confirm(
            "This sample has already been analysed. Do you wish to override the result?"
          )
        ) {
          cocLog.push({
            type: "Analysis",
            log: `Previous analysis of sample ${sample.sampleNumber} (${
              sample.description
            } ${sample.material}) overridden.`,
            user: auth.currentUser.uid,
            userName: this.props.me.name,
            sample: sample.uid,
            date: new Date()
          });
        } else {
          return;
        }
      }
      let newmap = {};
      let map = this.props.sample.result;
      if (sample.verified) {
        asbestosSamplesRef
          .doc(sample.uid)
          .update({ verified: false, verifyDate: null });
      }
      if (map === undefined) {
        newmap = { [result]: true };
      } else if (result === "no") {
        let val = map[result];
        newmap = { no: !val };
      } else if (map[result] === undefined) {
        newmap = map;
        newmap["no"] = false;
        newmap[result] = true;
      } else {
        newmap = map;
        newmap["no"] = false;
        newmap[result] = !map[result];
      }

      cocLog.push({
        type: "Analysis",
        log: `New analysis for sample ${sample.sampleNumber} (${
          sample.description
        } ${sample.material}): ${writeResult(newmap)}`,
        user: auth.currentUser.uid,
        userName: this.props.me.name,
        sample: sample.uid,
        date: new Date()
      });

      cocsRef
        .doc(this.props.job.uid)
        .update({ versionUpToDate: false, cocLog: cocLog });

      // Check for situation where all results are unselected
      let notBlankAnalysis = false;
      Object.values(newmap).forEach(value => {
        if (value) notBlankAnalysis = true;
      });

      if (notBlankAnalysis) {
        if (!sample.analysisStart) this.props.startAnalysis(sample);
        asbestosAnalysisRef.doc(`${this.props.sessionID}-${sample.uid}`).set({
          analyst: this.props.analyst,
          analystUID: auth.currentUser.uid,
          mode: this.props.analysisMode,
          sessionID: this.props.sessionID,
          cocUID: this.props.job.uid,
          sampleUID: sample.uid,
          result: newmap,
          description: sample.description,
          material: sample.material,
          samplers: this.props.job.personnel,
          analysisDate: new Date()
        });
        asbestosSamplesRef.doc(sample.uid).update({
          analysisUser: {id: auth.currentUser.uid, name: this.props.me.name},
          sessionID: this.props.sessionID,
          analyst: this.props.analyst,
          result: newmap,
          analysisDate: new Date(),
          analysisTime: sample.receivedDate ? moment.duration(moment(new Date()).diff(sample.receivedDate.toDate())).asMilliseconds() : null,
        });
      } else {
        asbestosAnalysisRef
          .doc(`${this.props.sessionID}-${sample.uid}`)
          .delete();
        asbestosSamplesRef
          .doc(sample.uid)
          .update({
            result: firebase.firestore.FieldValue.delete(),
            analysisDate: firebase.firestore.FieldValue.delete(),
            analysisUser: firebase.firestore.FieldValue.delete(),
            sessionID: firebase.firestore.FieldValue.delete(),
            analysisTime: firebase.firestore.FieldValue.delete(),
            analyst: firebase.firestore.FieldValue.delete(),
          });
      }
    } else {
      window.alert(
        "You don't have sufficient permissions to set asbestos results."
      );
    }
  };

  removeResult = () => {
    let sample = this.props.sample;
    let log = {
      type: "Analysis",
      log: `Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }) result removed.`,
      user: auth.currentUser.uid,
      sample: sample.uid,
      userName: this.props.me.name,
      date: new Date()
    };
    let cocLog = this.props.job.cocLog;
    cocLog ? cocLog.push(log) : (cocLog = [log]);
    cocsRef
      .doc(this.props.job.uid)
      .update({ versionUpToDate: false, cocLog: cocLog });
    asbestosAnalysisRef
      .doc(`${this.state.sessionID}-${sample.uid}`)
      .delete();
    asbestosSamplesRef
      .doc(sample.uid)
      .update({
        result: firebase.firestore.FieldValue.delete(),
        analysisDate: firebase.firestore.FieldValue.delete(),
        analysisUser: firebase.firestore.FieldValue.delete(),
        sessionID: firebase.firestore.FieldValue.delete(),
      });
  };

  writeDescription = (locationgeneric, locationdetailed, description, material) => {
    var str = '';
    if (locationgeneric) str = locationgeneric;
    if (locationdetailed) {
      if (str === '') {
        str = locationdetailed;
      } else {
        str = str + ' - ' + locationdetailed;
      }
    }
    if (str !== '') str = str + ': ';
    if (description && material) {
      str = str + description + ", " + material;
    } else if (description) {
      str = str + description;
    } else if (material) {
      str = str + material;
    } else {
      str = str + "No description";
    }
    return str;
  };

  verifySample = () => {
    let sample = this.props.sample;
    if (
      (this.props.me &&
      this.props.me.auth &&
      (this.props.me.auth["Analysis Checker"] ||
        this.props.me.auth["Asbestos Admin"]))
    ) {
      if (!sample.verified || window.confirm("Are you sure you wish to remove the verification of this sample result?")) {
        if (auth.currentUser.uid === sample.analysisUser.id && !sample.verified) {
          window.alert("Samples must be checked off by a different user.");
        } else {
          if (!sample.analysisStart && !sample.verified) this.startAnalysis(sample);
          let verifyDate = null;
          let log = {
            type: "Verified",
            log: !sample.verified
              ? `Sample ${sample.sampleNumber} (${sample.description} ${
                  sample.material
                }) result verified.`
              : `Sample ${sample.sampleNumber} (${sample.description} ${
                  sample.material
                }) verification removed.`,
            user: auth.currentUser.uid,
            sample: sample.uid,
            userName: this.props.me.name,
            date: new Date()
          };
          let cocLog = this.props.job.cocLog;
          cocLog ? cocLog.push(log) : (cocLog = [log]);
          cocsRef
            .doc(this.props.job.uid)
            .update({ versionUpToDate: false, cocLog: cocLog });
          if (!sample.verified) {
            sample.verifyDate = new Date();
            let cocStats = this.props.getStats(sample);
            this.props.logSample(this.props.job, sample, cocStats);
            asbestosSamplesRef.doc(sample.uid).update(
            {
              verified: true,
              verifyUser: {id: auth.currentUser.uid, name: this.props.me.name},
              verifyDate: new Date(),
              turnaroundTime: sample.receivedDate ? moment.duration(moment().diff(sample.receivedDate.toDate())).asMilliseconds() : null,
            });
          } else {
            asbestosSamplesRef.doc(sample.uid).update(
            {
              verified: false,
              verifyUser: firebase.firestore.FieldValue.delete(),
              verifyDate: firebase.firestore.FieldValue.delete(),
              turnaroundTime: firebase.firestore.FieldValue.delete(),
            });
          }
        }
      }
    } else {
      window.alert(
        "You don't have sufficient permissions to verify asbestos results."
      );
    }
  };

  render() {
    const { job, sample, staff, anchorEl, classes } = this.props;
    if (sample.cocUid !== job.uid) return null;
    let result = "none";
    if (
      sample.result &&
      (sample.result["ch"] ||
        sample.result["am"] ||
        sample.result["cr"] ||
        sample.result["umf"])
    )
      result = "positive";
    if (sample.result && sample.result["no"])
      result = "negative";
    let cameraColor = "#ddd";
    if (sample.imagePathRemote) cameraColor = "green";
    let receivedColor = "#ddd";
    if (sample.receivedByLab) receivedColor = "green";
    let analysisColor = "#ddd";
    if (sample.analysisStart) analysisColor = "green";
    let verifiedColor = "#ddd";
    if (sample.verified) verifiedColor = "green";
    let waColor = "inherit";
    if (sample.waAnalysisDone) waColor = "green";
    let chColor = "#ddd";
    let amColor = "#ddd";
    let crColor = "#ddd";
    let umfColor = "#ddd";
    let chDivColor = "white";
    let amDivColor = "white";
    let crDivColor = "white";
    let umfDivColor = "white";

    if (sample.result && sample.result["ch"]) {
      chColor = "white";
      chDivColor = "red";
    }
    if (sample.result && sample.result["am"]) {
      amColor = "white";
      amDivColor = "red";
    }
    if (sample.result && sample.result["cr"]) {
      crColor = "white";
      crDivColor = "red";
    }
    if (sample.result && sample.result["umf"]) {
      umfColor = "white";
      umfDivColor = "red";
    }

    let noColor = "#ddd";
    let noDivColor = "#fff";
    if (result === "negative") {
      noColor = "green";
      noDivColor = "lightgreen";
    }

    return (
      <ExpansionPanel
        elevation={0}
        square={true}
        key={`${
          job.jobNumber
        }-${sample.sampleNumber.toString()}_${
          sample.description
        }`}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMore />} className={classes.hoverItem}>
          <Grid container>
            <Grid item xs={12} xl={6}>
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
                    <CameraAlt
                      style={{
                        fontSize: 24,
                        color: cameraColor,
                        margin: 10
                      }}
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
                {this.writeDescription(
                  sample.genericLocation,
                  sample.specificLocation,
                  sample.description,
                  sample.material
                )}
              </div>
            </Grid>
            <Grid item xs={12} xl={6}>
            <div style={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              // width: '40vw',
              display: 'flex',
              flexDirection: 'row',
            }}>
              <IconButton
                onClick={event => {
                  event.stopPropagation();
                  this.props.receiveSample(sample);
                }}
              >
                <Inbox
                  style={{
                    fontSize: 24,
                    margin: 10,
                    color: receivedColor
                  }}
                />
              </IconButton>
                <IconButton
                  onClick={event => {
                    event.stopPropagation();
                    this.props.startAnalysis(sample);
                  }}
                >
                  <AnalysisIcon
                    style={{
                      fontSize: 24,
                      margin: 10,
                      color: analysisColor
                    }}
                  />
                </IconButton>
              <div
                style={{ display: "flex", flexDirection: "row" }}
              >
                <div
                  style={{
                    backgroundColor: chDivColor,
                    borderRadius: 5
                  }}
                >
                  <Button
                    variant="outlined"
                    style={{ margin: 5, color: chColor }}
                    onClick={event => {
                      event.stopPropagation();
                      this.toggleResult("ch");
                    }}
                  >
                    CH
                  </Button>
                </div>
                <div
                  style={{
                    backgroundColor: amDivColor,
                    borderRadius: 5
                  }}
                >
                  <Button
                    variant="outlined"
                    style={{ margin: 5, color: amColor }}
                    onClick={event => {
                      event.stopPropagation();
                      this.toggleResult("am");
                    }}
                  >
                    AM
                  </Button>
                </div>
                <div
                  style={{
                    backgroundColor: crDivColor,
                    borderRadius: 5
                  }}
                >
                  <Button
                    variant="outlined"
                    style={{ margin: 5, color: crColor }}
                    onClick={event => {
                      event.stopPropagation();
                      this.toggleResult("cr");
                    }}
                  >
                    CR
                  </Button>
                </div>
                <div
                  style={{
                    backgroundColor: umfDivColor,
                    borderRadius: 5
                  }}
                >
                  <Button
                    variant="outlined"
                    style={{ margin: 5, color: umfColor }}
                    onClick={event => {
                      event.stopPropagation();
                      this.toggleResult("umf");
                    }}
                  >
                    UMF
                  </Button>
                </div>
              </div>
              <div style={{ width: 30 }} />
              <div
                style={{
                  backgroundColor: noDivColor,
                  borderRadius: 5
                }}
              >
                <Button
                  variant="outlined"
                  style={{ margin: 5, color: noColor }}
                  onClick={event => {
                    event.stopPropagation();
                    this.toggleResult("no");
                  }}
                >
                  NO
                </Button>
              </div>
              <IconButton
                onClick={event => {
                  event.stopPropagation();
                  if (
                    !sample.result &&
                    !sample.verified &&
                    !window.confirm(
                      "No result has been recorded for this sample. This will appear as 'Not analysed' in the test certificate. Proceed?"
                    )
                  )
                    return;
                  this.verifySample(sample);
                }}
              >
                <CheckCircleOutline
                  style={{
                    fontSize: 24,
                    margin: 10,
                    color: verifiedColor
                  }}
                />
              </IconButton>
              <Tooltip id="det-tooltip" title={'Edit Sample Details' }>
                <IconButton
                  onClick={event => {
                    event.stopPropagation();
                      this.props.showModal({
                        modalType: ASBESTOSSAMPLEDETAILS,
                        modalProps: {
                          sample: sample,
                      }});
                  }}
                >
                  <SampleDetailsIcon
                    style={{
                      fontSize: 24,
                      margin: 10,
                    }}
                  />
                </IconButton>
              </Tooltip>
              {job.waAnalysis &&
                <Tooltip id="wa-tooltip" title={'Edit WA Analysis' }>
                  <IconButton
                    onClick={event => {
                      event.stopPropagation();
                      this.props.showModal({
                        modalType: WAANALYSIS,
                        modalProps: {
                          sample: sample,
                      }});
                    }}
                  >
                    <WAIcon
                      style={{
                        fontSize: 24,
                        margin: 10,
                        color: waColor
                      }}
                    />
                  </IconButton>
                </Tooltip>
              }
              <Tooltip id="sl-tooltip" title={'Sample Log' }>
                <IconButton
                  onClick={event => {
                    event.stopPropagation();
                    this.props.showModal({
                      modalType: SAMPLEHISTORY,
                      modalProps: {
                        title: `Sample History for ${
                          job.jobNumber
                        }-${sample.sampleNumber.toString()}`,
                        uid: sample.uid,
                        cocLog: job.cocLog,
                    }});
                  }}
                >
                  <SampleLogIcon
                    style={{
                      fontSize: 24,
                      margin: 10,
                    }}
                  />
                </IconButton>
              </Tooltip>
              {/*<IconButton
                onClick={event => {
                  event.stopPropagation();
                  this.props.sampleAnchorMenu(sample.sampleNumber, event.currentTarget);
                }}
              >
                <More />
              </IconButton>
              <Menu
                id={`${
                  job.jobNumber
                }-${sample.sampleNumber.toString()}`}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {this.props.sampleAnchorMenu(sample.sampleNumber, null);}}
                style={{ padding: 0 }}
              >
                <MenuItem
                  key={`${
                    job.jobNumber
                  }-${sample.sampleNumber.toString()}-SampleHistory`}
                  onClick={event => {
                    event.stopPropagation();
                    this.props.showModal({
                      modalType: SAMPLEHISTORY,
                      modalProps: {
                        title: `Sample History for ${
                          job.jobNumber
                        }-${sample.sampleNumber.toString()}`,
                        uid: sample.uid,
                        cocLog: job.cocLog,
                    }
                  })
                }}
                >
                  View Sample History
                </MenuItem>
              </Menu>*/}
              </div>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction={'column'} spacing={8}>
            <Grid item>
              <SampleDetailsExpansionSummary sample={sample} />
            </Grid>
            <Grid item>
              <SampleDetailsExpansionDetails sample={sample} />
            </Grid>
            <Grid item>
              { sample.waAnalysis && <SampleDetailsExpansionWA sample={sample} /> }
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SampleDetailsExpansion)
);
