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
  getJobStatus,
} from "../../../actions/asbestosLab";
import { syncJobWithWFM, dateOf } from "../../../actions/local";
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
    doNotRender: state.display.doNotRender,
    expanded: state.display.asbestosLabExpanded,
    asbestosSampleDisplayAdvanced: state.display.asbestosSampleDisplayAdvanced
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
    setAsbestosLabExpanded: ex => dispatch(setAsbestosLabExpanded(ex)),
    toggleAsbestosSampleDisplayMode: () => dispatch(toggleAsbestosSampleDisplayMode()),
  };
};

class AsbestosBulkCocCard extends React.Component {
  // static whyDidYouRender = true;
  state = { cocAnchorEl: null, };

  componentWillMount = () => {
    let uid = `${this.props.job}-${this.props.me.name}-${moment().format('x')}`;
    this.props.setSessionID(uid.replace(/[.:/,\s]/g, "_"));
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextProps.cocs[nextProps.job]) return true; // COC has been deleted
    if (this.props.modalType === ASBESTOS_SAMPLE_EDIT) return false; // Edit modal is open
    if (this.props.modalType === ASBESTOS_COC_EDIT) return false; // COC modal is open
    // if (nextProps.doNotRender) return false;
    if (nextProps.expanded !== nextProps.job && this.props.expanded !== nextProps.job) return false; // List is not expanded (hidden)
    if (this.props.expanded === this.props.job && nextProps.expanded !== this.props.job) {
      return true; // List has been collapsed (closed)
    }
    if (nextProps.expanded === nextProps.job && this.props.expanded !== this.props.job) {
      return true; // List has been collapsed (closed)
    }
    if (nextProps.samples[nextProps.job] && nextProps.cocs[nextProps.job] && nextProps.cocs[nextProps.job].sampleList) {
      // console.log(Object.keys(nextProps.samples[nextProps.job]).length);
      // console.log(nextProps.cocs[nextProps.job].sampleList.length);
      if (Object.keys(nextProps.samples[nextProps.job]).length === nextProps.cocs[nextProps.job].sampleList.length) {
        return true;
      }
    }
    return false;
  }

  getSamples = (expanded, cocUid, jobNumber) => {
    if (expanded && cocUid) {
      this.props.fetchSamples(cocUid, jobNumber);
    }
  };

  render() {
    const { samples, classes } = this.props;
    const job = this.props.cocs[this.props.job];
    // console.log(job);
    if (job === undefined || job.deleted) return null;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    if (job.deleted === true) return (<div />);

    console.log(`${job.jobNumber} rendering`);
    let filteredSamples = {};
    if (samples && samples[job.uid]) {
      Object.values(samples[job.uid]).filter(s => !s.deleted && s.cocUid === job.uid).forEach(s => {
        filteredSamples[s.sampleNumber] = s;
      });
    }

    let coc = JSON.stringify(printCocBulk(job, filteredSamples, this.props.me, this.props.staff));
    console.log(coc);
    getJobStatus(filteredSamples, job);
    return (
      <ExpansionPanel
        expanded={this.props.expanded === job.uid}
        className={classes.fullWidth}
        onChange={(event, ex) => {
          if (!samples[this.props.job]) this.getSamples(ex, job.uid, job.jobNumber);
          this.props.setAsbestosLabExpanded(ex ? job.uid : null);
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <div>
            <span className={classes.boldSmallText}>{job.jobNumber}</span>
            <span>{job.client} ({job.address})</span>
            {job.waAnalysis && <WAIcon color='action' className={classes.marginLeftSmall} />}
            {(job.priority === 1 || job.isClearance) && !job.versionUpToDate && <UrgentIcon color='secondary' className={classes.marginLeftSmall} />}
            {job.versionUpToDate && <VerifyIcon color='primary' className={classes.marginLeftSmall} />}
            {job.status && <span className={classes.boldSmallText}>{job.status ? job.status : ''}</span>}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className={classes.fullWidth}>
            <div className={classes.flexRow}>
              <Tooltip id="h-tooltip" title={'Edit Chain of Custody'}>
                <IconButton
                  onClick={() => {
                    this.props.syncJobWithWFM(job.jobNumber);
                    this.props.showModal({
                      modalType: ASBESTOS_COC_EDIT,
                      modalProps: {
                        title: "Edit Chain of Custody",
                        doc: { ...job, samples: samples[job.uid] }
                      }
                    });
                  }}>
                  <EditIcon className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Print Chain of Custody'}>
                <span>
                  <form method="post" target="_blank" action={job.waAnalysis ? "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc_wa.php" : "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc_bulk.php"}>
                  <input type="hidden" name="data" value={coc} />
                    <IconButton type="submit">
                      <PrintCocIcon className={classes.iconRegular} />
                    </IconButton>
                  </form>
                </span>
              </Tooltip>
              <Tooltip id="reca-tooltip" title={'Receive Samples'} disabled={!filteredSamples || Object.values(filteredSamples).length === 0}>
                <span>
                  <IconButton disabled={!filteredSamples || Object.values(filteredSamples).length === 0}
                    onClick={event => {
                      this.props.showModal({
                        modalType: ASBESTOS_ACTIONS,
                        modalProps: { job: job, field: 'receivedByLab', title: `Receive Samples for ${job.jobNumber}`, }});
                    }}>
                    <ReceiveIcon className={classes.iconRegular} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip id="analysisa-tooltip" title={'Start Analysis'} disabled={!filteredSamples || Object.values(filteredSamples).length === 0}>
                <span>
                  <IconButton disabled={!filteredSamples || Object.values(filteredSamples).length === 0}
                    onClick={event => {
                      this.props.showModal({
                        modalType: ASBESTOS_ACTIONS,
                        modalProps: { job: job, field: 'analysisStarted', title: `Start Analysis on ${job.jobNumber}`,
                      }});
                    }}>
                    <StartAnalysisIcon className={classes.iconRegular} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={'Record Analysis'} disabled={!filteredSamples || Object.values(filteredSamples).length === 0}>
                <span>
                  <IconButton disabled={!filteredSamples || Object.values(filteredSamples).length === 0 || (!this.props.me.auth || (!this.props.me.auth['Asbestos Admin'] && !this.props.me.auth['Asbestos Bulk Analysis']))}
                    onClick={event => {
                      if (this.props.asbestosSampleDisplayAdvanced) this.props.toggleAsbestosSampleDisplayMode();
                      this.props.showModal({
                        modalType: ASBESTOS_SAMPLE_EDIT,
                        modalProps: {
                          activeSample: Object.keys(filteredSamples)[0],
                          activeCoc: job.uid,
                          sampleList: job.sampleList,
                      }});
                    }}>
                    <RecordAnalysisIcon className={classes.iconRegular} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={'Verify Results'} disabled={!filteredSamples || Object.values(filteredSamples).length === 0}>
                <span>
                  <IconButton disabled={!filteredSamples || Object.values(filteredSamples).length === 0}
                    onClick={event => {
                        this.props.showModal({
                          modalType: ASBESTOS_ACTIONS,
                          modalProps: { job: job, field: 'verified', title: `Verify Samples for ${job.jobNumber}`, }});
                    }}>
                    <VerifyIcon className={classes.iconRegular} />
                  </IconButton>
                </span>
              </Tooltip>
              <span className={classes.spacerSmall} />
              <Button
                className={classes.buttonIconText}
                // disabled={job.versionUpToDate}
                onClick={() => {
                  this.props.showModal({
                    modalType: ASBESTOS_ACTIONS,
                    modalProps: { job: job, field: 'issue', title: `Issue ${job.jobNumber}`, }
                  });
                }} >
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
            <AsbestosBulkCocSummary job={job.uid} expanded={this.state.expanded} />
            {filteredSamples && Object.values(filteredSamples).length > 0 ? (
              <div>
                {Object.values(filteredSamples)
                  .map(sample => {
                    return (<AsbestosSampleListItem
                      key={sample.uid}
                      job={job.uid}
                      sample={sample.sampleNumber}
                    />);
                })}
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
