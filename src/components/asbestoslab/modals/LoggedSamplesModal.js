import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { ASBESTOS_LOGGED_SAMPLES, ASBESTOS_SAMPLE_DETAILS } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import Add from "@material-ui/icons/Add";
import { hideModal, showModalSecondary } from "../../../actions/modal";
import { clearLog, dateOf, milliToDHM } from "../../../actions/local";
import {
  writeShorthandResult,
  writeDescription,
  fetchSamples,
  fetchSampleView,
  fetchAsbestosAnalysisLogs,
  fetchAsbestosSampleIssueLogs,
} from "../../../actions/asbestosLab";
import _ from "lodash";
import moment from "moment";
import classNames from 'classnames';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    sampleLog: state.asbestosLab.sampleLog,
    asbestosAnalysis: state.asbestosLab.asbestosAnalysis,
    cocs: state.asbestosLab.cocs,
    samples: state.asbestosLab.samples,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAsbestosSampleIssueLogs: (limit) => dispatch(fetchAsbestosSampleIssueLogs(limit)),
    fetchAsbestosAnalysisLogs: (limit) => dispatch(fetchAsbestosAnalysisLogs(limit)),
    fetchSampleView: (cocUid, sampleUid, jobNumber) => dispatch(fetchSampleView(cocUid, sampleUid, jobNumber)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
    hideModal: () => dispatch(hideModal()),
  };
};

class LoggedSamplesModal extends React.Component {
  state = {
    issueLimit: 7,
    analysisLimit: 7,
    mode: "issue",
  }

  increaseIssueLimit = () => {
    this.props.fetchAsbestosSampleIssueLogs(this.state.issueLimit + 7);
    this.setState({
      issueLimit: this.state.issueLimit + 7,
    })
  }

  increaseAnalysisLimit = () => {
    this.props.fetchAsbestosAnalysisLogs(this.state.analysisLimit + 7);
    this.setState({
      analysisLimit: this.state.analysisLimit + 7,
    })
  }

  switchMode = () => {
    if (this.state.mode === "issue") {
      this.setState({
        mode: "analysis",
      });
    } else {
      this.setState({
        mode: "issue",
      });
    }
  }

  loadLogs = () => {
    this.props.fetchAsbestosSampleIssueLogs(this.state.issueLimit);
    this.props.fetchAsbestosAnalysisLogs(this.state.analysisLimit);
  }

  render() {
    const { classes, modalProps, modalType, sampleLog, asbestosAnalysis } = this.props;
    return (modalType === ASBESTOS_LOGGED_SAMPLES &&
      <Dialog
        open={modalType === ASBESTOS_LOGGED_SAMPLES}
        onClose={this.props.hideModal}
        maxWidth="xl"
        fullWidth={true}
        onEnter={this.loadLogs}
      >
        {this.state.mode === "issue" ? <DialogTitle>
          SAMPLE ISSUE LOG
          <Button className={classNames(classes.marginLeftSmall, classes.buttonIconText)} onClick={this.switchMode}>SHOW SAMPLE ANALYSIS LOG</Button>
          <Grid
            container
            style={{ fontWeight: "bold", fontSize: 12, }}
            spacing={2}
          >
            <Grid item xs={1}>Date Issued</Grid>
            <Grid item xs={1}>Date Received</Grid>
            <Grid item xs={1}>Sample Number</Grid>
            <Grid item xs={1}>Client</Grid>
            <Grid item xs={1}>Address</Grid>
            <Grid item xs={2}>Sample Description</Grid>
            <Grid item xs={1}>Material Category</Grid>
            <Grid item xs={1}>Result</Grid>
            <Grid item xs={1}>Received Weight</Grid>
            <Grid item xs={1}>Analyst</Grid>
            <Grid item xs={1}>Turnaround Time</Grid>
          </Grid>
        </DialogTitle>
        :
        <DialogTitle>
          SAMPLE ANALYSIS LOG
          <Button className={classNames(classes.marginLeftSmall, classes.buttonIconText)} onClick={this.switchMode}>SHOW SAMPLE ISSUE LOG</Button>
          <Grid
            container
            style={{ fontWeight: "bold", fontSize: 12, }}
            spacing={2}
          >
            <Grid item xs={2}>Analysis Date</Grid>
            <Grid item xs={1}>Sample Number</Grid>
            <Grid item xs={3}>Description</Grid>
            <Grid item xs={2}>Material Category</Grid>
            <Grid item xs={1}>Result</Grid>
            <Grid item xs={1}>Received Weight</Grid>
            <Grid item xs={1}>Analyst</Grid>
            <Grid item xs={1}>Turnaround Time</Grid>
          </Grid>
        </DialogTitle>}
        <DialogContent>
          {this.state.mode === "issue" ?
            <Grid container direction="column">
              <Grid item>
                {sampleLog &&
                  Object.values(sampleLog).map(log => {
                    return (
                      <Grid
                        key={log.uid}
                        container
                        className={classes.hoverItemPoint}
                        spacing={2}
                        onClick={() => {
                          if (this.props.cocs === undefined || this.props.cocs[log.cocUid] === undefined) this.props.fetchSampleView(log.cocUid, log.sampleUid, log.jobNumber);
                          this.props.showModalSecondary({
                            modalType: ASBESTOS_SAMPLE_DETAILS,
                            modalProps: {
                              doc: false,
                              job: false,
                              cocUid: log.cocUid,
                              sampleNumber: log.sampleNumber,
                              noNext: true,
                            }
                          });
                        }}
                      >
                        <Grid item xs={1}>
                          {moment(dateOf(log.issueDate)).format('D MMM YYYY, h:mma')}
                        </Grid>
                        <Grid item xs={1}>
                          {moment(dateOf(log.receivedDate)).format('D MMM YYYY, h:mma')}
                        </Grid>
                        <Grid item xs={1}>
                          {`${log.jobNumber}-${log.sampleNumber}`}{log.version !== undefined && ` (v${log.version})`}
                        </Grid>
                        <Grid item xs={1}>
                          {log.client}
                        </Grid>
                        <Grid item xs={1}>
                          {log.address}
                        </Grid>
                        <Grid item xs={2}>
                          {writeDescription(log)}
                        </Grid>
                        <Grid item xs={1}>
                          {log.category}
                        </Grid>
                        <Grid item xs={1}>
                          {writeShorthandResult(log.result)}
                        </Grid>
                        <Grid item xs={1}>
                          {log.weightReceived && `${log.weightReceived}g`}
                        </Grid>
                        <Grid item xs={1}>
                          {log.analysisBy}
                        </Grid>
                        <Grid item xs={1}>
                          {log.turnaroundTime && milliToDHM(log.turnaroundTime, false, false)}
                        </Grid>
                      </Grid>
                    );
                  })}
              </Grid>
              <Button
                className={classes.buttonViewMore}
                onClick={this.increaseIssueLimit}>
                <Add className={classes.marginRightSmall} /> View More Logs
              </Button>
            </Grid>
          :
            <Grid container direction="column">
              <Grid item>
                {asbestosAnalysis &&
                  Object.values(asbestosAnalysis).map(log => {
                    return (
                      <Grid
                        key={log.uid}
                        container
                        className={classes.hoverItemPoint}
                        spacing={2}
                        onClick={() => {
                          if (this.props.cocs === undefined || this.props.cocs[log.cocUid] === undefined) this.props.fetchSampleView(log.cocUid, log.sampleUid, log.jobNumber);
                          this.props.showModalSecondary({
                            modalType: ASBESTOS_SAMPLE_DETAILS,
                            modalProps: {
                              doc: false,
                              job: false,
                              cocUid: log.cocUid,
                              sampleNumber: log.sampleNumber,
                              noNext: true,
                            }
                          });
                        }}
                      >
                        <Grid item xs={2}>{moment(dateOf(log.analysisDate)).format('D MMM YYYY, h:mma')}</Grid>
                        <Grid item xs={1}>{log.jobNumber && log.sampleNumber && `${log.jobNumber}-${log.sampleNumber}`}</Grid>
                        <Grid item xs={3}>{writeDescription(log)}</Grid>
                        <Grid item xs={2}>{log.category ? log.category : ''}</Grid>
                        <Grid item xs={1}>{writeShorthandResult(log.result)}</Grid>
                        <Grid item xs={1}>{log.weightReceived ? `${log.weightReceived}g` : ''}</Grid>
                        <Grid item xs={1}>{log.analyst}</Grid>
                        {/*<Grid item xs={1}>{log.turnaroundTime && milliToDHM(log.turnaroundTime, false, false)}</Grid>*/}
                      </Grid>
                    );
                  })}
                  <Button
                    className={classes.buttonViewMore}
                    onClick={this.increaseAnalysisLimit}>
                    <Add className={classes.marginRightSmall} /> View More Logs
                  </Button>
              </Grid>
            </Grid>
          }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LoggedSamplesModal)
);
