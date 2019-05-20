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
import { fetchCocs, fetchSamples, logSample, writeResult, writeShorthandResult, } from "../../../actions/asbestosLab";

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

import ExpandMore from "@material-ui/icons/ExpandMore";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";
import Edit from "@material-ui/icons/Edit";
import Inbox from "@material-ui/icons/Inbox";
import Save from "@material-ui/icons/SaveAlt";
import CameraAlt from "@material-ui/icons/CameraAlt";
import Print from "@material-ui/icons/Print";
import Send from "@material-ui/icons/Send";
import Flag from "@material-ui/icons/Flag";
import More from "@material-ui/icons/MoreVert";
import Colorize from "@material-ui/icons/Colorize";

import Popup from "reactjs-popup";

class AsbestosLogCard extends React.Component {
  render() {
    const { classes, log } = this.props;
    return (
      <ExpansionPanel style={{ width: '100%'}}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <Grid container>
            <Grid item xs={6}>
              <div><b>{log.jobNumber}-{log.sampleNumber}</b> {log.client} ({log.address}) {log.priority === 1 && <Flag color='secondary' />}</div>
            </Grid>
            <Grid item xs={6}>
              {writeShorthandResult(log.result)}
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {/*<Grid container style={{ marginTop: 12, marginBottom: 12 }}>
            <Grid item xs={12} style={{ fontWeight: 500, fontSize: 16, marginBottom: 12, }}>
            </Grid>
            <Grid item xs={3}>
              Sampled by:{" "}
              <span style={{ fontWeight: 300 }}>
                {job.personnel && job.personnel.length > 0
                  ? job.personnel.join(", ")
                  : "Not specified"}
              </span>
              <br />
              Date(s) Sampled:{" "}
              <span style={{ fontWeight: 300 }}>
                {dates && dates.length > 0
                  ? dates.join(", ")
                  : "Not specified"}
              </span>
              <br />
              Analysis by:{" "}
              <span style={{ fontWeight: 300 }}>
                {analysts ? analysts.join(", ") : "Not specified"}
              </span>
            </Grid>
            <Grid item xs={3}>
              Number of Samples:{" "}
              <span style={{ fontWeight: 300 }}>
                {stats && stats.totalSamples}
              </span>
              <br />
              Positive Results:{" "}
              <span style={{ fontWeight: 300 }}>
                {stats && stats.numberResult > 0 ? stats.positiveSamples : 'N/A'}
              </span>
              <br />
              Negative Results:{" "}
              <span style={{ fontWeight: 300 }}>
                {stats && stats.numberResult > 0 ? stats.negativeSamples : 'N/A'}
              </span>
              <br />
            </Grid>
            <Grid item xs={3}>
              Max/Avg Turnaround Time:{" "}
              { stats && stats.maxTurnaroundTime > 0 && stats.averageTurnaroundTime > 0 ?
                <span style={{ fontWeight: 300 }}>
                  {moment.utc(stats.maxTurnaroundTime).format('HH:mm')}/{moment.utc(stats.averageTurnaroundTime).format('HH:mm')}
                </span>
                :
                <span style={{ fontWeight: 300 }}>N/A</span>
              }
              <br />
              Max/Avg Analysis Time:{" "}
              { stats && stats.maxAnalysisTime > 0 && stats.averageAnalysisTime > 0 ?
                <span style={{ fontWeight: 300 }}>
                  {moment.utc(stats.maxAnalysisTime).format('HH:mm')}/{moment.utc(stats.averageAnalysisTime).format('HH:mm')}
                </span>
                :
                <span style={{ fontWeight: 300 }}>N/A</span>
              }
              <br />
              Max/Avg Report Time:{" "}
              { stats && stats.maxReportTime > 0 && stats.averageReportTime > 0 ?
                <span style={{ fontWeight: 300 }}>
                  {moment.utc(stats.maxReportTime).format('HH:mm')}/{moment.utc(stats.averageReportTime).format('HH:mm')}
                </span>
                :
                <span style={{ fontWeight: 300 }}>N/A</span>
              }
              <br />
            </Grid>
          </Grid>*/}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(AsbestosLogCard);
