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
import AsbestosBulkCocSummary from "./AsbestosBulkCocSummary";

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
    this.props.job.dates = this.props.job.dates
      ? this.props.job.dates.map(date => {
          return date instanceof Date ? date : date.toDate();
        })
      : [];
    let uid = `${this.props.job.uid}-${this.props.me.name}-${moment().format('x')}`;
    this.props.setSessionID(uid.replace(/[.:/,\s]/g, "_"));
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.samples && this.props.samples[this.props.job.uid] &&
    // Object.keys(this.props.samples[this.props.job.uid]).length === this.props.job.sampleList.length &&
    Object.keys(nextProps.samples[nextProps.job.uid]).length === nextProps.job.sampleList.length
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
    const { job, samples, classes } = this.props;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    if (job.deleted === true) return (<div />);
    let analysts = getAnalysts(job, samples[job.uid], false);

    let dates = job.dates.map(date => {
      let formatDate = date instanceof Date ? date : date.toDate();
      return moment(formatDate).format('D MMMM YYYY');
    });
    console.log(`${job.jobNumber} rendering`);
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
            <span className={classes.boldSmallText}>{job.jobNumber}</span>
            <span>{job.client} ({job.address})</span>
            {job.waAnalysis && <WAIcon color='action' className={classes.marginLeftSmall} />}
            {job.priority === 1 && !job.versionUpToDate && <Flag color='secondary' className={classes.marginLeftSmall} />}
            {job.versionUpToDate && <CheckCircleOutline color='primary' className={classes.marginLeftSmall} />}
            {job.stats && <span className={classes.boldSmallText}>{job.stats.status}</span>}
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
                  <Edit className={classes.iconRegular} />
                </IconButton>
              </Tooltip>
              {samples[job.uid] && Object.values(samples[job.uid]).length > 0 && (
                  <span>
                    <Tooltip id="pr-tooltip" title={'Flag as Priority'}>
                      <IconButton onClick={() => togglePriority(job, this.props.me)}>
                        <Flag color={job.priority === 1 ? 'secondary' : 'inherit'} className={classes.iconRegular} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip id="waa-tooltip" title={'Request Western Australian Standard Analysis'}>
                      <IconButton onClick={() => toggleWAAnalysis(job, this.props.me)}>
                        <WAIcon color={job.waAnalysis ? 'primary' : 'inherit'} className={classes.iconRegular} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip id="reca-tooltip" title={'Receive All Samples'}>
                      <IconButton onClick={() => receiveAll(samples[job.uid], job, this.props.sessionID, this.props.me)}>
                        <Inbox className={classes.iconRegular} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip id="analysisa-tooltip" title={'Start Analysis on All Samples'}>
                      <IconButton
                      onClick={() => startAnalysisAll(samples[job.uid], job, this.props.sessionID, this.props.me)}>
                        <Colorize className={classes.iconRegular} />
                      </IconButton>
                    </Tooltip>
                  </span>)}
              <Button
                className={classes.buttonTextRegular}
                variant="outlined"
                onClick={() => {
                  printCoc(job, samples[job.uid], this.props.me, this.props.staff);
                }}
              >
                <Print className={classes.iconRegular} /> Print Chain of Custody
              </Button>
              <Button
                className={classes.buttonTextRegular}
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
                <Send className={classes.iconRegular} />
                Issue Version {version}
              </Button>
              <Button
                className={classes.buttonTextRegular}
                variant="outlined"
                disabled={!job.currentVersion || !job.versionUpToDate}
                onClick={() => {
                  printLabReport(job, job.currentVersion, this.props.me, this.props.showModal);
                }}
              >
                <Save className={classes.iconRegular} /> Download Test
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
                <MenuItem onClick={() => this.props.deleteCoc(job, this.props.me)}>
                  Delete Chain of Custody
                </MenuItem>
              </Menu>
            </div>
            {samples[job.uid] && Object.values(samples[job.uid]).length > 0 ? (
              <div>
                <AsbestosBulkCocSummary job={job} analysts={analysts} dates={dates} />
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
              <div className={classes.flexRowCentered}>
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
