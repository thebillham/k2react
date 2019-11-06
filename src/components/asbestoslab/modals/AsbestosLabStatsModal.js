import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import {
  ASBESTOS_LOGGED_SAMPLES,
  ASBESTOS_SAMPLE_DETAILS,
  ASBESTOS_LAB_STATS,
} from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import { hideModal, showModalSecondary } from "../../../actions/modal";
import { clearLog, dateOf, milliToDHM } from "../../../actions/local";
import {
  fetchSampleLog,
  writeShorthandResult,
  writeDescription,
  fetchSamples,
  fetchSampleView,
  fetchAsbestosAnalysis,
} from "../../../actions/asbestosLab";
import _ from "lodash";
import moment from "moment";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    sampleLog: state.asbestosLab.sampleLog,
    cocs: state.asbestosLab.cocs,
    samples: state.asbestosLab.samples,
    asbestosAnalysis: state.asbestosLab.asbestosAnalysis,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSampleLog: () => dispatch(fetchSampleLog(50)),
    fetchSampleView: (cocUid, sampleUid, jobNumber) => dispatch(fetchSampleView(cocUid, sampleUid, jobNumber)),
    fetchAsbestosAnalysis: () => dispatch(fetchAsbestosAnalysis(true)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
    hideModal: () => dispatch(hideModal()),
  };
};

class AsbestosLabStatsModal extends React.Component {
  render() {
    const { classes, modalProps, modalType, asbestosAnalysis } = this.props;
    return (modalType === ASBESTOS_LAB_STATS &&
      <Dialog
        open={modalType === ASBESTOS_LAB_STATS}
        onClose={this.props.hideModal}
        maxWidth="xl"
        fullWidth={true}
        onEnter={this.props.fetchAsbestosAnalysis}
      >
        <DialogTitle>
          LAB STATS
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
        </DialogTitle>
        <DialogContent>
        <Grid container direction="column">
          <Grid item>
            {asbestosAnalysis && asbestosAnalysis.analysis &&
              asbestosAnalysis.analysis.map(log => {
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
          </Grid>
        </Grid>
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
  )(AsbestosLabStatsModal)
);
