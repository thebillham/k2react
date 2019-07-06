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
    me: state.local.me,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
    analyst: state.asbestosLab.analyst,
    analysisMode: state.asbestosLab.analysisMode,
    sessionID: state.asbestosLab.sessionID,
    bulkAnalysts: state.asbestosLab.bulkAnalysts,
    airAnalysts: state.asbestosLab.airAnalysts,
    cocs: state.asbestosLab.cocs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    showModal: modal => dispatch(showModal(modal)),
    fetchSamples: (cocUid, jobNumber) =>
      dispatch(fetchSamples(cocUid, jobNumber)),
    syncJobWithWFM: jobNumber => dispatch(syncJobWithWFM(jobNumber)),
    logSample: (coc, sample, cocStats) => dispatch(logSample(coc, sample, cocStats)),
    setSessionID: session => dispatch(setSessionID(session)),
    deleteCoc: (coc, cocs) => dispatch(deleteCoc(coc, cocs)),
  };
};

class AsbestosBulkCocCard extends React.Component {
  state = {
    samples: {},
    bulkAnalyst: "",
    sampleAnchorEl: {},
    cocAnchorEl: null,
    samplesExpanded: {},
    expanded: false,
  };

  componentWillMount = () => {
    this.props.job.dates = this.props.job.dates
      ? this.props.job.dates.map(date => {
          return date instanceof Date ? date : date.toDate();
        })
      : [];
    let uid = `${this.props.job.uid}-${this.props.me.name}-${moment().format('x')}`;
    this.props.setSessionID(uid.replace(/[.:/,\s]/g, "_"));
  };

  sampleAnchorMenu = (number, target) => {
    this.setState({
      sampleAnchorEl: {
        [number]: target
      }
    });
  }

  getSamples = (expanded, cocUid, jobNumber) => {
    if (expanded && cocUid) {
      this.props.fetchSamples(cocUid, jobNumber);
    }
  };

  render() {
    const { job, samples, classes } = this.props;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    let analysts = getAnalysts(job, samples[job.uid], false);

    let dates = job.dates.map(date => {
      let formatDate = date instanceof Date ? date : date.toDate();
      return moment(formatDate).format('D MMMM YYYY');
    });
    let stats = getStats(samples[job.uid], job);

    return (
      <ExpansionPanel
        style={{ width: '100%'}}
        onChange={(event, ex) => {
          if (!job.samples) this.getSamples(ex, job.uid, job.jobNumber);
          this.setState({ expanded: ex });
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <div>
            <span style={{ fontWeight: 500, marginRight: 12, }}>{job.jobNumber}</span>
            <span>{job.client} ({job.address})</span>
            {job.waAnalysis && <WAIcon color='action' style={{ marginLeft: 6, }} />}
            {job.priority === 1 && !job.versionUpToDate && <Flag color='secondary' style={{ marginLeft: 6, }} />}
            {job.versionUpToDate && <CheckCircleOutline color='primary' style={{ marginLeft: 6, }} />}
            {job.stats && <span style={{ marginLeft: 12, fontSize: 10, fontWeight: 500, }}>{job.stats.status.toUpperCase()}</span>}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div style={{ width: '100%', maxWidth: '1800px'}}>
            <div>
              <Tooltip id="h-tooltip" title={'Edit Chain of Custody'}>
                <IconButton
                  onClick={() => {
                    this.props.syncJobWithWFM(job.jobNumber);
                    this.props.showModal({
                      modalType: COC,
                      modalProps: {
                        title: "Edit Chain of Custody",
                        doc: { ...job, samples: samples[job.uid] === undefined ? {} : {...samples[job.uid]} }
                      }
                    });
                  }}>
                  <Edit className={classes.asbestosIcon} />
                </IconButton>
              </Tooltip>
              {samples[job.uid] && Object.values(samples[job.uid]).length > 0 && (
                  <span>
                    <Tooltip id="pr-tooltip" title={'Flag as Priority'}>
                      <IconButton onClick={() => togglePriority(job, this.props.me)}>
                        <Flag color={job.priority === 1 ? 'secondary' : 'inherit'} className={classes.asbestosIcon} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip id="waa-tooltip" title={'Request Western Australian Standard Analysis'}>
                      <IconButton onClick={() => toggleWAAnalysis(job, this.props.me)}>
                        <WAIcon color={job.waAnalysis ? 'primary' : 'inherit'} className={classes.asbestosIcon} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip id="reca-tooltip" title={'Receive All Samples'}>
                      <IconButton onClick={() => receiveAll(samples[job.uid], job, this.props.sessionID, this.props.me)}>
                        <Inbox className={classes.asbestosIcon} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip id="analysisa-tooltip" title={'Start Analysis on All Samples'}>
                      <IconButton
                      onClick={() => startAnalysisAll(samples[job.uid], job, this.props.sessionID, this.props.me)}>
                        <Colorize className={classes.asbestosIcon} />
                      </IconButton>
                    </Tooltip>
                  </span>)}
              <Button
                style={{ marginLeft: 5 }}
                variant="outlined"
                onClick={() => {
                  printCoc(job, samples[job.uid], this.props.me, this.props.staff);
                }}
              >
                <Print style={{ fontSize: 20, margin: 5 }} /> Print Chain of
                Custody
              </Button>
              <Button
                style={{ marginLeft: 5 }}
                variant="outlined"
                disabled={job.versionUpToDate}
                onClick={() => {
                  // Check if any samples have not been checked off and ask the user to verify
                  let allSamplesVerified = true;
                  Object.values(samples[job.uid]).forEach(sample => {
                    if (!sample.verified && sample.cocUid === job.uid) allSamplesVerified = false;
                  });
                  if (
                    !allSamplesVerified &&
                    !window.confirm(
                      "Not all sample results in the chain of custody have been verified. These will not be included in this issue. Proceed with issuing?"
                    )
                  )
                    return;
                  if (job.currentVersion) {
                    this.props.showModal({
                      modalType: UPDATE_CERTIFICATE_VERSION,
                      modalProps: {job: job, samples: samples[job.uid], version: version, doc: { changes: ""}}
                    });
                  } else {
                    issueLabReport(job, samples[job.uid], 1, "First issue.", this.props.staff, this.props.me);
                  }
                }}
              >
                <Send style={{ fontSize: 20, margin: 5 }} />
                Issue Version {version}
              </Button>
              <Button
                style={{ marginLeft: 5 }}
                variant="outlined"
                disabled={!job.currentVersion || !job.versionUpToDate}
                onClick={() => {
                  printLabReport(job, job.currentVersion, this.props.me, this.props.showModal);
                }}
              >
                <Save style={{ fontSize: 20, margin: 5 }} /> Download Test
                Certificate
              </Button>
              <IconButton
                onClick={event => {
                  this.setState({ cocAnchorEl: event.currentTarget });
                }}
              >
                <More />
              </IconButton>
              <Menu
                id="coc-menu"
                anchorEl={this.state.cocAnchorEl}
                open={Boolean(this.state.cocAnchorEl)}
                onClose={() => {
                  this.setState({ cocAnchorEl: null });
                }}
              >
                <MenuItem
                  onClick={() => {
                    this.props.showModal({
                      modalType: COC_LOG,
                      modalProps: {
                        ...job,
                      }
                    });
                  }}
                >
                  View Change Log
                </MenuItem>
                <Divider />
                {job.currentVersion &&
                  // job.currentVersion > 1 &&
                  [...Array(job.currentVersion).keys()].map(i => {
                    return (
                      <MenuItem
                        key={i}
                        onClick={() => {
                          printLabReport(job, i + 1, this.props.me, this.props.showModal);
                        }}
                      >
                        Download Version {i + 1}
                      </MenuItem>
                    );
                  })}
                <Divider />
                <MenuItem onClick={this.deleteCoc}>
                  Delete Chain of Custody
                </MenuItem>
              </Menu>
            </div>
            {samples[job.uid] && Object.values(samples[job.uid]).length > 0 ? (
              <div>
                <Grid container style={{ marginTop: 12, marginBottom: 12 }}>
                  <Grid item lg={3} xs={6}>
                    <b>Sampled by:</b>{" "}
                    <span style={{ fontWeight: 300 }}>
                      {job.personnel && job.personnel.length > 0
                        ? job.personnel.join(", ")
                        : "Not specified"}
                    </span>
                    <br />
                    <b>Date(s) Sampled:</b>{" "}
                    <span style={{ fontWeight: 300 }}>
                      {dates && dates.length > 0
                        ? dates.join(", ")
                        : "Not specified"}
                    </span>
                    <br />
                    <b>Analysis by:</b>{" "}
                    <span style={{ fontWeight: 300 }}>
                      {analysts ? analysts.join(", ") : "Not specified"}
                    </span>
                  </Grid>
                  <Grid item lg={2} xs={6}>
                    <b>Total Samples:</b>{" "}
                    <span style={{ fontWeight: 300 }}>
                      {stats && stats.totalSamples}
                    </span>
                    <br />
                    <Tooltip title={'Red: Positive samples, Green: Negative samples, Black: Total samples with results'}>
                      <div>
                        <b>Results:</b>{" "}
                        <span style={{ fontWeight: 600, color: 'red' }}>
                          {stats && stats.positiveSamples !== undefined ? stats.positiveSamples : 0}
                        </span>-
                        <span style={{ fontWeight: 600, color: 'green'}}>
                          {stats && stats.negativeSamples !== undefined ? stats.negativeSamples : 0}</span>
                        /
                        <span style={{ fontWeight: 600 }}>
                          {stats && parseInt(stats.positiveSamples) + parseInt(stats.negativeSamples)}
                        </span>
                      </div>
                    </Tooltip>
                    <Tooltip title={'Red: Second analysis contradicts first analysis, Orange: Second analysis shows variance in asbestos types reported, Green: First and second analysis match'}>
                      <div>
                        <b>Results Confirmed:</b>{" "}
                        {stats && stats.confirmedResults !== undefined && stats.confirmedResults > 0 ?
                          <span>
                            <span style={{ fontWeight: 600, color: 'green'}}>
                              {stats && stats.confirmedResultsOK !== undefined && stats.confirmedResultsOK}
                            </span>-
                            <span style={{ fontWeight: 600, color: 'orange'}}>
                              {stats && stats.confirmedResultsConflict !== undefined && stats.confirmedResultsConflict}
                            </span>-
                            <span style={{ fontWeight: 600, color: 'red' }}>
                              {stats && stats.confirmedResultsWrong !== undefined && stats.confirmedResultsWrong}
                            </span>/
                            <span style={{ fontWeight: 600 }}>
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
                      <b>Turnaround Time:</b>{" "}
                      { stats && stats.maxTurnaroundTime > 0 && stats.averageTurnaroundTime > 0 ?
                        <span style={{ fontWeight: 300 }}>
                          {moment.utc(stats.maxTurnaroundTime).format('H:mm')}/{moment.utc(stats.averageTurnaroundTime).format('H:mm')}
                        </span>
                        :
                        <span style={{ fontWeight: 300 }}>N/A</span>
                      }{" "}
                      ({ stats && stats.maxTurnaroundBusinessTime > 0 && stats.averageTurnaroundBusinessTime > 0 ?
                          <span style={{ fontWeight: 300 }}>
                            {moment.utc(stats.maxTurnaroundBusinessTime).format('H:mm')}/{moment.utc(stats.averageTurnaroundBusinessTime).format('H:mm')}
                          </span>
                          :
                          <span style={{ fontWeight: 300 }}>N/A</span>
                      })
                      <br />
                      <b>Analysis Time:</b>{" "}
                      { stats && stats.maxAnalysisTime > 0 && stats.averageAnalysisTime > 0 ?
                        <span style={{ fontWeight: 300 }}>
                          {moment.utc(stats.maxAnalysisTime).format('H:mm')}/{moment.utc(stats.averageAnalysisTime).format('H:mm')}
                        </span>
                        :
                        <span style={{ fontWeight: 300 }}>N/A</span>
                      }{" "}
                      ({ stats && stats.maxAnalysisBusinessTime > 0 && stats.averageAnalysisBusinessTime > 0 ?
                        <span style={{ fontWeight: 300 }}>
                          {moment.utc(stats.maxAnalysisBusinessTime).format('H:mm')}/{moment.utc(stats.averageAnalysisBusinessTime).format('H:mm')}
                        </span>
                        :
                        <span style={{ fontWeight: 300 }}>N/A</span>
                      })
                      <br />
                      <b>Report Time:</b>{" "}
                      { stats && stats.maxReportTime > 0 && stats.averageReportTime > 0 ?
                        <span style={{ fontWeight: 300 }}>
                          {moment.utc(stats.maxReportTime).format('H:mm')}/{moment.utc(stats.averageReportTime).format('H:mm')}
                        </span>
                        :
                        <span style={{ fontWeight: 300 }}>N/A</span>
                      }{" "}
                      ({ stats && stats.maxReportBusinessTime > 0 && stats.averageReportBusinessTime > 0 ?
                        <span style={{ fontWeight: 300 }}>
                          {moment.utc(stats.maxReportBusinessTime).format('H:mm')}/{moment.utc(stats.averageReportBusinessTime).format('H:mm')}
                        </span>
                        :
                        <span style={{ fontWeight: 300 }}>N/A</span>
                      })
                      </div>
                    </Tooltip>
                  </Grid>
                  <Grid item lg={4} xs={6}>
                    <div>{ job.labToContactClient && TickyBox(this, 'Lab Contacted Client', cocsRef, job, 'labHasContactedClient',
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
                        }, !job.versionUpToDate)}</div>
                  </Grid>
                </Grid>
                {samples[job.uid] && Object.values(samples[job.uid]).filter(el => el.deleted === false).length > 0 &&
                  Object.values(samples[job.uid]).filter(el => el.deleted === false)
                  .map(sample => {
                    return (<SampleListItem
                      key={sample.uid}
                      job={job}
                      sample={sample}
                      sampleAnchorMenu={this.sampleAnchorMenu}
                      anchorEl={this.state.sampleAnchorEl[sample.sampleNumber]}
                    />);
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 80.0,
                }}
              >
                No samples
              </div>
            )}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosBulkCocCard)
);
