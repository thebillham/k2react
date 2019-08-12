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
  printCoc,
  printLabReport,
  issueLabReport,
  getPersonnel,
  getStatus,
} from "../../../actions/asbestosLab";
import { syncJobWithWFM, } from "../../../actions/local";
import { showModal } from "../../../actions/modal";
import {
  ASBESTOS_SAMPLE_DETAILS,
  COC,
  COC_STATS,
  COC_SAMPLE_ACTIONS,
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
    deleteCoc: (coc, me) => dispatch(deleteCoc(coc, me)),
  };
};

class AsbestosBulkCocCard extends React.Component {
  // static whyDidYouRender = true;
  state = {
    samples: {},
    bulkAnalyst: "",
    sampleAnchorEl: {},
    cocAnchorEl: null,
    samplesExpanded: {},
    expanded: false,
  };

  componentWillMount = () => {
    // this.props.job.dates = this.props.job.dates
    //   ? this.props.job.dates.map(date => {
    //       return date instanceof Date ? date : date.toDate();
    //     })
    //   : [];
    let uid = `${this.props.job}-${this.props.me.name}-${moment().format('x')}`;
    this.props.setSessionID(uid.replace(/[.:/,\s]/g, "_"));
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextProps.cocs[nextProps.job]) return true; // COC has been deleted
    if ((nextProps.samples && nextProps.samples[nextProps.job] && this.props.samples && this.props.samples[this.props.job] &&
    (Object.keys(nextProps.samples[nextProps.job]).length === nextProps.cocs[nextProps.job].sampleList.length ||
    Object.keys(nextProps.samples[nextProps.job]).length !== Object.keys(this.props.samples[this.props.job]).length)) ||
    this.props.cocs[this.props.job] !== nextProps.cocs[nextProps.job] ||
    this.state !== nextState
   ) {
      return true;
    } else {
      return false;
    }
  }

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
    const { samples, classes } = this.props;
    const job = this.props.cocs[this.props.job];
    if (job === undefined || job.deleted) return null;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    if (job.deleted === true) return (<div />);
    let analysts = samples[this.props.job] ? getPersonnel(Object.values(samples[this.props.job]).filter(s => s.cocUid === job.uid), 'analyst', null, false).map(e => e.name) : '';

    let dates = job.dates.sort().map(date => {
      let formatDate = date instanceof Date ? date : date.toDate();
      return moment(formatDate).format('D MMMM YYYY');
    });
    console.log(`${job.jobNumber} rendering`);
    getStatus(samples[job.uid], job);
    return (
      <ExpansionPanel
        className={classes.fullWidth}
        onChange={(event, ex) => {
          if (!this.props.samples[this.props.job]) this.getSamples(ex, job.uid, job.jobNumber);
          this.setState({ expanded: ex });
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <div>
            <span className={classes.boldSmallText}>{job.jobNumber}</span>
            <span>{job.client} ({job.address})</span>
            {job.waAnalysis && <WAIcon color='action' className={classes.marginLeftSmall} />}
            {(job.priority === 1 || job.clearance) && !job.versionUpToDate && <UrgentIcon color='secondary' className={classes.marginLeftSmall} />}
            {job.versionUpToDate && <VerifyIcon color='primary' className={classes.marginLeftSmall} />}
            {job.stats && <span className={classes.boldSmallText}>{job.status ? job.status : ''}</span>}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className={classes.fullWidth}>
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
                  <EditIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Print Chain of Custody'}>
                <IconButton onClick={() => {printCoc(job, samples[job.uid], this.props.me, this.props.staff)}}>
                  <PrintCocIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <Tooltip id="reca-tooltip" title={'Receive Samples'} disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}>
                <IconButton disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}
                  onClick={event => {
                      this.props.showModal({
                        modalType: COC_SAMPLE_ACTIONS,
                        modalProps: { job: job, field: 'receivedByLab', title: `Receive Samples for ${job.jobNumber}`, }});
                  }}>
                  <ReceiveIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <Tooltip id="analysisa-tooltip" title={'Start Analysis'} disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}>
                <IconButton disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}
                  onClick={event => {
                      this.props.showModal({
                        modalType: COC_SAMPLE_ACTIONS,
                        modalProps: { job: job, field: 'analysisStart', title: `Start Analysis on ${job.jobNumber}`, }});
                  }}>
                  <StartAnalysisIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Record Analysis'} disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}>
                <IconButton disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0 || (!this.props.me.auth || (!this.props.me.auth['Asbestos Admin'] && !this.props.me.auth['Asbestos Bulk Analysis']))}
                  onClick={event => {
                      this.props.showModal({
                        modalType: ASBESTOS_SAMPLE_DETAILS,
                        modalProps: {
                          activeSample: Object.keys(samples[job.uid])[0],
                          activeCoc: job.uid,
                          sampleList: job.sampleList,
                      }});
                  }}>
                  <RecordAnalysisIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Verify Results'} disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}>
                <IconButton disabled={!samples[job.uid] || Object.values(samples[job.uid]).length === 0}
                  onClick={event => {
                      this.props.showModal({
                        modalType: COC_SAMPLE_ACTIONS,
                        modalProps: { job: job, field: 'verified', title: `Verify Samples for ${job.jobNumber}`, }});
                  }}>
                  <VerifyIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <span className={classes.spacerSmall} />
              <Button
                className={classes.buttonIconText}
                // disabled={job.versionUpToDate}
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
                <IssueVersionIcon className={classes.iconRegular} />
                Issue Version {version}
              </Button>
              <span className={classes.spacerSmall} />
              <Button
                className={classes.buttonIconText}
                disabled={!job.currentVersion || !job.versionUpToDate}
                onClick={() => {
                  printLabReport(job, job.currentVersion, this.props.me, this.props.showModal);
                }}
              >
                <DownloadIcon className={classes.iconRegular} /> Download Test
                Certificate
              </Button>
              <IconButton
                onClick={event => {
                  this.setState({ cocAnchorEl: event.currentTarget });
                }}
              >
                <MoreIcon />
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
                {/*<MenuItem
                  onClick={() => {
                    this.props.showModal({
                      modalType: COC_ISSUES,
                      modalProps: {
                        ...job,
                      }
                    });
                  }}>
                  View Issues
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    this.props.showModal({
                      modalType: COC_STATS,
                      modalProps: {
                        ...job,
                      }
                    });
                  }}>
                  View Stats
                </MenuItem>*/}
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
                <MenuItem onClick={() => this.props.deleteCoc(job, this.props.me)}>
                  Delete Chain of Custody
                </MenuItem>
              </Menu>
            </div>
            <AsbestosBulkCocSummary job={job.uid} analysts={analysts} dates={dates} />
            {samples[job.uid] && Object.values(samples[job.uid]).filter(el => el.deleted === false).length > 0 ? (
              <div>
                {Object.values(samples[job.uid]).filter(el => el.deleted === false && samples[job.uid][el.sampleNumber] !== undefined)
                  .map(sample => {
                    return (<AsbestosSampleListItem
                      key={sample.uid}
                      job={job.uid}
                      sample={sample.sampleNumber}
                    />);
                  }
                )}
              </div>
            ) : (
              <div className={classes.marginTopSmall}>
                <LinearProgress color="secondary" />
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
