import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
  firebase,
  auth,
  asbestosSamplesRef
} from "../../../config/firebase";
import moment from "moment";
import {
  fetchCocs,
  fetchSamples,
  logSample,
  writeResult,
  setSessionID,
  deleteCoc,
  getStats,
  removeResult,
  verifySample,
  startAnalysisAll,
  receiveAll,
  togglePriority,
  toggleWAAnalysis,
  sortSamples,
  getAnalysts,
  printCoc,
  printLabReport,
  issueLabReport,
} from "../../../actions/asbestosLab";
import { syncJobWithWFM, addLog, } from "../../../actions/local";
import { showModal } from "../../../actions/modal";
import {
  COC,
  DOWNLOAD_LAB_CERTIFICATE,
  UPDATE_CERTIFICATE_VERSION,
  COC_LOG
} from "../../../constants/modal-types";

import { TickyBox, } from '../../../widgets/FormWidgets';
import SampleListItem from "./SampleListItem";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";

import ExpandMore from "@material-ui/icons/ExpandMore";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";
import Edit from "@material-ui/icons/Edit";
import Inbox from "@material-ui/icons/Inbox";
import Save from "@material-ui/icons/SaveAlt";
import Print from "@material-ui/icons/Print";
import Send from "@material-ui/icons/Send";
import Flag from "@material-ui/icons/Flag";
import More from "@material-ui/icons/MoreVert";
import Colorize from "@material-ui/icons/Colorize";
import WAIcon from "@material-ui/icons/GroupWork";

const mapStateToProps = state => {
  return {
    samples: state.asbestosLab.samples,
    cocs: state.asbestosLab.cocs,
  };
};

class AsbestosBulkCocSummary extends React.Component {
  // static whyDidYouRender = true;

  shouldComponentUpdate(nextProps) {
    if (this.props.job !== nextProps.job ||
      (this.props.samples && this.props.samples[this.props.job.uid] &&
      Object.keys(this.props.samples[this.props.job.uid]).length < this.props.job.sampleList.length &&
      Object.keys(nextProps.samples[nextProps.job.uid]).length === nextProps.job.sampleList.length)) {
        return true;
    } else {
      // console.log('Blocked re-render of Summary');
      return false;
    }
  }

  render() {
    const { job, samples, classes, analysts, dates } = this.props;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;

    let stats = getStats(samples[job.uid], job);
    console.log(`${job.jobNumber} summary rendering`);
    return (
      <Grid container direction="row" className={classes.marginTopBottomSmall} alignItems="flex-start" justify="center">
        <Grid item lg={3} xs={6}>
          <span className={classes.headingInline}>Sampled by:</span>{" "}
          <span className={ classes.infoLight }>
            {job.personnel && job.personnel.length > 0
              ? job.personnel.join(", ")
              : "Not specified"}
          </span>
          <br />
          <span className={classes.headingInline}>Date(s) Sampled:</span>{" "}
          <span className={ classes.infoLight }>
            {dates && dates.length > 0
              ? dates.join(", ")
              : "Not specified"}
          </span>
          <br />
          <span className={classes.headingInline}>Analysis by:</span>{" "}
          <span className={ classes.infoLight }>
            {analysts ? analysts.join(", ") : "Not specified"}
          </span>
        </Grid>
        <Grid item lg={2} xs={6}>
          <span className={classes.headingInline}>Total Samples:</span>{" "}
          <span className={ classes.infoLight }>
            {stats && stats.totalSamples}
          </span>
          <br />
          <Tooltip title={'Red: Positive samples, Green: Negative samples, Black: Total samples with results'}>
            <div className={classes.infoLight}>
              <span className={classes.headingInline}>Results:</span>{" "}
              <span className={classes.boldRed}>
                {stats && stats.positiveSamples !== undefined ? stats.positiveSamples : 0}
              </span>-
              <span className={classes.boldGreen}>
                {stats && stats.negativeSamples !== undefined ? stats.negativeSamples : 0}</span>
              /
              <span className={classes.boldBlack}>
                {stats && parseInt(stats.positiveSamples) + parseInt(stats.negativeSamples)}
              </span>
            </div>
          </Tooltip>
          <Tooltip title={'Red: Second analysis contradicts first analysis, Orange: Second analysis shows variance in asbestos types reported, Green: First and second analysis match'}>
            <div>
              <span className={classes.headingInline}>Results Confirmed:</span>{" "}
              {stats && stats.confirmedResults !== undefined && stats.confirmedResults > 0 ?
                <span className={classes.infoLight}>
                  <span className={classes.boldGreen}>
                    {stats && stats.confirmedResultsOK !== undefined && stats.confirmedResultsOK}
                  </span>-
                  <span className={classes.boldOrange}>
                    {stats && stats.confirmedResultsConflict !== undefined && stats.confirmedResultsConflict}
                  </span>-
                  <span className={classes.boldRed}>
                    {stats && stats.confirmedResultsWrong !== undefined && stats.confirmedResultsWrong}
                  </span>/
                  <span className={classes.boldBlack}>
                    {stats && stats.confirmedResults}
                  </span>
                </span>
              : <span>N/A</span>}
            </div>
          </Tooltip>
        </Grid>
        <Grid item lg={3} xs={6}>
          <Tooltip title={'Max/Average Time (Business Hours Only in Brackets)'}>
            <div>
            <span className={classes.headingInline}>Turnaround Time:</span>{" "}
            { stats && stats.maxTurnaroundTime > 0 && stats.averageTurnaroundTime > 0 ?
              <span className={ classes.infoLight }>
                {moment.utc(stats.maxTurnaroundTime).format('H:mm')}/{moment.utc(stats.averageTurnaroundTime).format('H:mm')}
              </span>
              :
              <span className={ classes.infoLight }>N/A</span>
            }{" "}
            ({ stats && stats.maxTurnaroundBusinessTime > 0 && stats.averageTurnaroundBusinessTime > 0 ?
                <span className={ classes.infoLight }>
                  {moment.utc(stats.maxTurnaroundBusinessTime).format('H:mm')}/{moment.utc(stats.averageTurnaroundBusinessTime).format('H:mm')}
                </span>
                :
                <span className={ classes.infoLight }>N/A</span>
            })
            <br />
            <span className={classes.headingInline}>Analysis Time:</span>{" "}
            { stats && stats.maxAnalysisTime > 0 && stats.averageAnalysisTime > 0 ?
              <span className={ classes.infoLight }>
                {moment.utc(stats.maxAnalysisTime).format('H:mm')}/{moment.utc(stats.averageAnalysisTime).format('H:mm')}
              </span>
              :
              <span className={ classes.infoLight }>N/A</span>
            }{" "}
            ({ stats && stats.maxAnalysisBusinessTime > 0 && stats.averageAnalysisBusinessTime > 0 ?
              <span className={ classes.infoLight }>
                {moment.utc(stats.maxAnalysisBusinessTime).format('H:mm')}/{moment.utc(stats.averageAnalysisBusinessTime).format('H:mm')}
              </span>
              :
              <span className={ classes.infoLight }>N/A</span>
            })
            <br />
            <span className={classes.headingInline}>Report Time:</span>{" "}
            { stats && stats.maxReportTime > 0 && stats.averageReportTime > 0 ?
              <span className={ classes.infoLight }>
                {moment.utc(stats.maxReportTime).format('H:mm')}/{moment.utc(stats.averageReportTime).format('H:mm')}
              </span>
              :
              <span className={ classes.infoLight }>N/A</span>
            }{" "}
            ({ stats && stats.maxReportBusinessTime > 0 && stats.averageReportBusinessTime > 0 ?
              <span className={ classes.infoLight }>
                {moment.utc(stats.maxReportBusinessTime).format('H:mm')}/{moment.utc(stats.averageReportBusinessTime).format('H:mm')}
              </span>
              :
              <span className={ classes.infoLight }>N/A</span>
            })
            </div>
          </Tooltip>
        </Grid>
        <Grid item lg={4} xs={6}>
          { job.labToContactClient && TickyBox(this, 'Lab Contacted Client', cocsRef, job, 'labHasContactedClient',
            (checked) => {
              let log = {
                type: "Issue",
                log: checked ? 'Client Contacted by Lab.' : 'Unchecked Client Contacted by Lab.',
                chainOfCustody: job.uid,
              };
              addLog("asbestosLab", log, this.props.me);
            }
          )}
          { TickyBox(this, 'Latest Issue Sent', cocsRef, job, 'mostRecentIssueSent',
            (checked) => {
                let log = {
                  type: "Issue",
                  log: checked ? 'Latest Issue Sent to Client' : 'Unchecked Latest Issue Sent to Client.',
                  chainOfCustody: job.uid,
                };
                addLog("asbestosLab", log, this.props.me);
              }, !job.versionUpToDate)}
          <div/>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    null
  )(AsbestosBulkCocSummary)
);
