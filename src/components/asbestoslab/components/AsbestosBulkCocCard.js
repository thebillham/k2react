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
import { fetchCocs, fetchSamples, logSample, writeResult, setSessionID, deleteCoc, } from "../../../actions/asbestosLab";
import { syncJobWithWFM } from "../../../actions/local";
import { showModal } from "../../../actions/modal";
import {
  COC,
  DOWNLOADLABCERTIFICATE,
  UPDATECERTIFICATEVERSION,
  COCLOG
} from "../../../constants/modal-types";

import SampleDetailsExpansion from "./SampleDetailsExpansion";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Grid from "@material-ui/core/Grid";
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
    let now = new Intl.DateTimeFormat("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date());
    let uid = `${this.props.job.uid}-${this.props.me.name}-${now}`;
    this.props.setSessionID(uid.replace(/[.:/,\s]/g, "_"));
  };

  getStats = () => {
    // let nz = moment.tz.setDefault("Pacific/Auckland");
    if (this.state.expanded === false) return null;
    moment.tz.setDefault("Pacific/Auckland");
    moment.updateLocale('en', {
      // workingWeekdays: [1,2,3,4,5],
      workinghours: {
        0: null,
        1: ['08:30:00', '17:00:00'],
        2: ['08:30:00', '17:00:00'],
        3: ['08:30:00', '17:00:00'],
        4: ['08:30:00', '17:00:00'],
        5: ['08:30:00', '17:00:00'],
        6: null,
      },
      holidays: [],
    });

    let status = '';
    let totalSamples = 0;
    let positiveSamples = 0;
    let negativeSamples = 0;

    let numberReceived = 0;
    let numberAnalysisStarted = 0;
    let numberResult = 0;
    let numberVerified = 0;

    let maxTurnaroundTime = 0;
    let averageTurnaroundTime = 0;
    let totalTurnaroundTime = 0;
    let numTurnaroundTime = 0;

    let maxAnalysisTime = 0;
    let averageAnalysisTime = 0;
    let totalAnalysisTime = 0;
    let numAnalysisTime = 0;

    let maxReportTime = 0;
    let averageReportTime = 0;
    let totalReportTime = 0;
    let numReportTime = 0;

    let maxTurnaroundBusinessTime = 0;
    let averageTurnaroundBusinessTime = 0;
    let totalTurnaroundBusinessTime = 0;
    let numTurnaroundBusinessTime = 0;

    let maxAnalysisBusinessTime = 0;
    let averageAnalysisBusinessTime = 0;
    let totalAnalysisBusinessTime = 0;
    let numAnalysisBusinessTime = 0;

    let maxReportBusinessTime = 0;
    let averageReportBusinessTime = 0;
    let totalReportBusinessTime = 0;
    let numReportBusinessTime = 0;

    if (this.props.samples && this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).length > 0) {
      Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        if (sample.cocUid === this.props.job.uid) {
          totalSamples = totalSamples + 1;
          if (sample.receivedByLab) numberReceived = numberReceived + 1;
          if (sample.analysisStart) numberAnalysisStarted = numberAnalysisStarted + 1;
          if (sample.result) {
            numberResult = numberResult + 1;
            if (sample.result['no']) {
              negativeSamples = negativeSamples + 1;
            } else positiveSamples = positiveSamples + 1;
            if (sample.analysisTime) {
              if (sample.analysisTime > maxAnalysisTime) maxAnalysisTime = sample.analysisTime;
              totalAnalysisTime = totalAnalysisTime + sample.analysisTime;
              numAnalysisTime = numAnalysisTime + 1;
              averageAnalysisTime = totalAnalysisTime / numAnalysisTime;
            }
            let analysisBusinessTime = moment(sample.analysisDate.toDate()).workingDiff(moment(sample.receivedDate.toDate()));
            if (analysisBusinessTime > maxAnalysisBusinessTime) maxAnalysisBusinessTime = analysisBusinessTime;
            totalAnalysisBusinessTime = totalAnalysisBusinessTime + analysisBusinessTime;
            numAnalysisBusinessTime = numAnalysisBusinessTime + 1;
            averageAnalysisBusinessTime = totalAnalysisBusinessTime / numAnalysisBusinessTime;
          }
          if (sample.verified) {
            numberVerified = numberVerified + 1;
            if (sample.turnaroundTime) {
              if (sample.turnaroundTime > maxTurnaroundTime) maxTurnaroundTime = sample.turnaroundTime;
              totalTurnaroundTime = totalTurnaroundTime + sample.turnaroundTime;
              numTurnaroundTime = numTurnaroundTime + 1;
              averageTurnaroundTime = totalTurnaroundTime / numTurnaroundTime;
              // Check for time between analysis logging and verification
              let turnaroundBusinessTime = moment(sample.verifyDate.toDate()).workingDiff(moment(sample.receivedDate.toDate()));
              if (turnaroundBusinessTime > maxTurnaroundBusinessTime) maxTurnaroundBusinessTime = turnaroundBusinessTime;
              totalTurnaroundBusinessTime = totalTurnaroundBusinessTime + turnaroundBusinessTime;
              numTurnaroundBusinessTime = numTurnaroundBusinessTime + 1;
              averageTurnaroundBusinessTime = totalTurnaroundBusinessTime / numTurnaroundBusinessTime;

              if (sample.analysisTime) {
                let verifyTime = sample.turnaroundTime - sample.analysisTime;
                if (verifyTime > maxReportTime) maxReportTime = verifyTime;
                totalReportTime = totalReportTime + verifyTime;
                numReportTime = numReportTime + 1;
                averageReportTime = totalReportTime / numReportTime;
              }

              let reportBusinessTime = moment(sample.verifyDate.toDate()).workingDiff(moment(sample.analysisDate.toDate()));
              if (reportBusinessTime > maxReportBusinessTime) maxReportBusinessTime = reportBusinessTime;
              totalReportBusinessTime = totalReportBusinessTime + reportBusinessTime;
              numReportBusinessTime = numReportBusinessTime + 1;
              averageReportBusinessTime = totalReportBusinessTime / numReportBusinessTime;
            }
          }
        }
      });
    }

    if (this.props.job.versionUpToDate) {
      status = 'Issued';
    } else if (totalSamples === 0) {
      status = 'No Samples';
    } else if (numberReceived === 0) {
      status = 'In Transit';
    } else if (numberAnalysisStarted === 0) {
      status = 'Received By Lab';
    } else if (numberResult === 0) {
      status = 'Analysis Begun';
    } else if (numberResult === totalSamples && numberVerified === 0) {
      status = 'Analysis Complete';
    } else if (numberVerified === totalSamples) {
      status = 'Ready For Issue';
    } else if (numberVerified > 0) {
      status = 'Analysis Partially Verified';
    } else if (numberResult > 0) {
      status = 'Analysis Partially Complete';
    } else if (numberAnalysisStarted > 0) {
      status = 'Analysis Begun on Some Samples';
    } else if (numberReceived > 0) {
      status = 'Partially Received By Lab';
    }

    let stats = {
      status,
      totalSamples,
      positiveSamples,
      negativeSamples,
      numberReceived,
      numberAnalysisStarted,
      numberResult,
      numberVerified,
      maxTurnaroundTime,
      averageTurnaroundTime,
      maxAnalysisTime,
      averageAnalysisTime,
      maxReportTime,
      averageReportTime,
      maxTurnaroundBusinessTime,
      averageTurnaroundBusinessTime,
      maxAnalysisBusinessTime,
      averageAnalysisBusinessTime,
      maxReportBusinessTime,
      averageReportBusinessTime,
    };

    if (totalSamples !== 0 && this.props.job.stats !== stats) cocsRef.doc(this.props.job.uid).update({ stats });
    return stats;
  }

  sampleAnchorMenu = (number, target) => {
    this.setState({
      sampleAnchorEl: {
        [number]: target
      }
    });
  }

  receiveAll = () => {
    if (this.props.samples && this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).length > 0) {
      Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        if (!sample.receivedByLab) this.receiveSample(sample);
      });
    }
  }

  receiveSample = sample => {
    let receivedDate = null;
    if (!sample.receivedByLab) receivedDate = new Date();
    if (sample.receivedByLab && sample.analysisStart) this.startAnalysis(sample);
    if (sample.receivedByLab && sample.verified) {
      if (window.confirm('The sample result has already been verified. Removing from the lab will remove the analysis result and verification. Continue?')) {
        this.removeResult(sample);
        this.verifySample(sample);
      } else return;
    } else if (sample.receivedByLab && sample.result) {
      if (window.confirm('The sample result has already been logged. Removing from the lab will remove the analysis result. Continue?'))
        this.removeResult(sample);
    }
    let log = {
      type: "Received",
      log: receivedDate
        ? `Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }) received by lab.`
        : `Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }) unchecked as being received.`,
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
    if (!sample.receivedByLab) {
      asbestosSamplesRef.doc(sample.uid).update(
      {
        receivedByLab: true,
        receivedUser: {id: auth.currentUser.uid, name: this.props.me.name},
        receivedDate: receivedDate
      });
    } else {
      asbestosSamplesRef.doc(sample.uid).update({
        receivedByLab: false,
        receivedUser: firebase.firestore.FieldValue.delete(),
        receivedDate: firebase.firestore.FieldValue.delete(),
      });
    }
  };

  startAnalysisAll = () => {
    if (this.props.samples && this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).length > 0) {
      Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        if (!sample.analysisStart) {
          if (!sample.receivedByLab) this.receiveSample(sample);
          this.startAnalysis(sample);
        }
      });
    }
  }

  startAnalysis = sample => {
    let analysisStart = null;
    if (!sample.receivedByLab && !sample.analysisStart) this.receiveSample(sample);
    if (sample.verified) this.verifySample(sample);
    if (!sample.analysisStart) analysisStart = new Date();
    let log = {
      type: "Analysis",
      log: analysisStart
        ? `Analysis begun on Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }).`
        : `Analysis stopped for Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }).`,
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
    if (!sample.analysisStart) {
      asbestosSamplesRef.doc(sample.uid).update(
      {
        analysisStart: true,
        analysisStartedby: {id: auth.currentUser.uid, name: this.props.me.name},
        analysisStartDate: analysisStart
      });
    } else {
      asbestosSamplesRef.doc(sample.uid).update(
      {
        analysisStart: false,
        analysisStartedby: firebase.firestore.FieldValue.delete(),
        analysisStartDate: firebase.firestore.FieldValue.delete(),
      });
    }
  };

  togglePriority = () => {
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Admin",
      log: this.props.job.priority === 1 ? `Chain of Custody changed to normal priority.` : `Chain of Custody marked as high priority.`,
      user: auth.currentUser.uid,
      userName: this.props.me.name,
      date: new Date()
    });
    cocsRef.doc(this.props.job.uid).update({ priority: this.props.job.priority === 0 ? 1 : 0 });
  }

  toggleWAAnalysis = () => {
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Admin",
      log: this.props.job.waAnalysis ? `WA analysis request removed.` : `Chain of Custody flagged for WA analysis.`,
      user: auth.currentUser.uid,
      userName: this.props.me.name,
      date: new Date()
    });
    cocsRef.doc(this.props.job.uid).update({ waAnalysis: this.props.job.waAnalysis ? false : true });
  }

  sortSamples = samples => {
    let samplemap = {};
    samples.forEach(sample => {
      if (samplemap[sample.jobnumber]) {
        samplemap[sample.jobnumber].push(sample);
      } else {
        samplemap[sample.jobnumber] = [sample];
      }
    });
    return samplemap;
  };

  writeVersionJson = (job, version) => {
    let aanumbers = {};
    Object.values(this.props.staff).forEach(staff => {
      aanumbers[staff.name] = staff.aanumber ? staff.aanumber : "-";
    });
    aanumbers[this.props.me.name] = this.props.me.aanumber
      ? this.props.me.aanumber
      : "-";
    aanumbers["Client"] = "-";
    // console.log(aanumbers);
    let samples = [];
    this.props.samples[job.uid] &&
      Object.values(this.props.samples[job.uid]).forEach(sample => {
        if (sample.verified) {
          let samplemap = {};
          if (sample.disabled) return;
          samplemap["no"] = sample.sampleNumber;
          samplemap["description"] =
            sample.description.charAt(0).toUpperCase() +
            sample.description.slice(1);
          samplemap["material"] =
            sample.material.charAt(0).toUpperCase() + sample.material.slice(1);
          samplemap["result"] = writeResult(sample.result);
          samples.push(samplemap);
        }
      });
    let analysts = this.getAnalysts(true);
    let report = {
      jobNumber: job.jobNumber,
      client: `${job.client} ${job.clientOrderNumber && Object.keys(job.clientOrderNumber).length > 0 ? job.clientOrderNumber : ''}`,
      address: job.address,
      date: job.dates
        .sort((b, a) => {
          let aDate = a instanceof Date ? a : a.toDate();
          let bDate = b instanceof Date ? b : b.toDate();
          return new Date(bDate - aDate);
        })
        .map(date => {
          let formatDate = date instanceof Date ? date : date.toDate();
          return new Intl.DateTimeFormat("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }).format(formatDate);
        })
        .join(", "),
      // ktp: 'Stuart Keer-Keer',
      personnel: job.personnel.sort(),
      assessors: job.personnel.sort().map(staff => {
        return aanumbers[staff];
      }),
      analysts: analysts ? analysts : ["Not specified"],
      version: version ? version : 1,
      samples: samples
    };
    return report;
  };

  issueLabReport = (version, changes) => {
    console.log('issuing lab report ' + version + ' ' + changes);
    // first check all samples have been checked
    // if not version 1, prompt for reason for new version
    let json = this.writeVersionJson(this.props.job, version);
    let versionHistory = this.props.job.versionHistory
      ? this.props.job.versionHistory
      : {};
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Issue",
      log: `Version ${version} issued.`,
      user: auth.currentUser.uid,
      userName: this.props.me.name,
      date: new Date()
    });
    versionHistory[version] = {
      issueUser: auth.currentUser.uid,
      issueDate: new Date(),
      changes: changes,
      data: json
    };
    cocsRef.doc(this.props.job.uid).set(
      {
        currentVersion: version,
        versionHistory: versionHistory,
        versionUpToDate: true,
        lastModified: new Date(),
        cocLog: cocLog
      },
      { merge: true }
    );
  };

  printLabReport = version => {
    // console.log(this.props.job.versionHistory[version]);
    let report = this.props.job.versionHistory[version].data;
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Document",
      log: `Test Certificate (version ${version}) downloaded.`,
      user: auth.currentUser.uid,
      userName: this.props.me.name,
      date: new Date()
    });
    cocsRef.doc(this.props.job.uid).set({ cocLog: cocLog }, { merge: true });
    if (report.version && report.version > 1) {
      let versionHistory = [];
      [...Array(report.version).keys()].forEach(i => {
        let formatDate =
          this.props.job.versionHistory[i + 1].issueDate instanceof Date
            ? this.props.job.versionHistory[i + 1].issueDate
            : this.props.job.versionHistory[i + 1].issueDate.toDate();

        versionHistory.push({
          version: i + 1,
          issueDate: new Intl.DateTimeFormat("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }).format(formatDate),
          changes: this.props.job.versionHistory[i + 1].changes
        });
      });
      report = { ...report, versionHistory: versionHistory };
    }
    this.props.showModal({
      modalType: DOWNLOADLABCERTIFICATE,
      modalProps: {
        report: report,
      }
    });
    // let url =
    //   "http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=" +
    //   JSON.stringify(report);
    // console.log(url);
    // // this.setState({ url: url });
    // window.open(url);
    // fetch('http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(report));
  };

  printCoc = job => {
    // console.log(job);
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Document",
      log: `Chain of Custody downloaded.`,
      user: auth.currentUser.uid,
      userName: this.props.me.name,
      date: new Date()
    });
    cocsRef.doc(this.props.job.uid).set({ cocLog: cocLog }, { merge: true });

    let aanumbers = {};
    Object.values(this.props.staff).forEach(staff => {
      aanumbers[staff.name] = staff.aanumber ? staff.aanumber : "-";
    });
    aanumbers[this.props.me.name] = this.props.me.aanumber
      ? this.props.me.aanumber
      : "-";
    aanumbers["Client"] = "-";

    let samples = [];
    this.props.samples[job.uid] &&
      Object.values(this.props.samples[job.uid]).forEach(sample => {
        let samplemap = {};
        if (sample.disabled) return;
        samplemap["no"] = sample.sampleNumber;
        samplemap["description"] =
          sample.description.charAt(0).toUpperCase() +
          sample.description.slice(1);
        samplemap["material"] =
          sample.material.charAt(0).toUpperCase() + sample.material.slice(1);
        samples.push(samplemap);
      });
    let report = {
      jobNumber: job.jobNumber,
      client: job.client,
      orderNumber: job.clientOrderNumber ? job.clientOrderNumber : '',
      address: job.address,
      type: job.type,
      jobManager: job.manager,
      date: job.dates
        .sort((b, a) => {
          let aDate = a instanceof Date ? a : a.toDate();
          let bDate = b instanceof Date ? b : b.toDate();
          return new Date(bDate - aDate);
        })
        .map(date => {
          let formatDate = date instanceof Date ? date : date.toDate();
          return new Intl.DateTimeFormat("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }).format(formatDate);
        })
        .join(", "),
      // ktp: 'Stuart Keer-Keer',
      personnel: job.personnel.sort(),
      assessors: job.personnel.sort().map(staff => {
        return aanumbers[staff];
      }),
      samples: samples
    };
    let url =
      "https://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc.php?report=" +
      JSON.stringify(report);
    console.log(url);
    this.setState({ url: url });
    window.open(url);
  };

  getSamples = (expanded, cocUid, jobNumber) => {
    if (expanded && cocUid) {
      this.props.fetchSamples(cocUid, jobNumber);
    }
  };

  // Restructure result first to include analyst, analysis type, date etc.
  getAnalysts = report => {
    let analysts = {};
    this.props.samples[this.props.job.uid] &&
      Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        if (report) {
          if (sample.analyst && sample.verified) {
            analysts[sample.analyst] = true;
          }
        } else {
          if (sample.analyst) {
            analysts[sample.analyst] = true;
          }
        }
      });
    let list = [];
    Object.keys(analysts).forEach(analyst => {
      list.push(analyst);
    });
    if (list.length === 0) return false;
    return list;
  };

  deleteCoc = () => {
    if (
      window.confirm("Are you sure you wish to delete this Chain of Custody?")
    ) {
      let cocLog = this.props.job.cocLog;
      this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        if (sample.cocUid === this.props.job.uid) {
          cocLog.push({
            type: "Delete",
            log: `Sample ${sample.sampleNumber} (${sample.description} ${sample.material}) deleted.`,
            userName: this.props.me.name,
            user: auth.currentUser.uid,
            date: new Date(),
            sample: sample.uid,
          })
          asbestosSamplesRef.doc(sample.uid).update({ deleted: true })
        }
      });
      if (!cocLog) cocLog = [];
      cocLog.push({
        type: "Delete",
        log: "Chain of Custody deleted.",
        userName: this.props.me.name,
        user: auth.currentUser.uid,
        date: new Date()
      });
      cocsRef
        .doc(this.props.job.uid)
        .update({ deleted: true, cocLog: cocLog });
      this.props.deleteCoc(this.props.job.uid, this.props.cocs);
    } else return;
  };

  render() {
    const { job, samples } = this.props;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    let analysts = this.getAnalysts(false);

    let dates = job.dates.map(date => {
      let formatDate = date instanceof Date ? date : date.toDate();
      return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(formatDate);
    });
    let stats = this.getStats();

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
            <span style={{ marginRight: 12, }}>{job.client} ({job.address})</span>
            {job.waAnalysis && <WAIcon color='action' />}
            {job.priority === 1 && !job.versionUpToDate && <Flag color='secondary' />}
            {job.versionUpToDate && <CheckCircleOutline color='primary' />}
            {job.stats && <span style={{ marginLeft: 12, fontSize: 10, fontWeight: 500, }}>{job.stats.status.toUpperCase()}</span>}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div style={{ width: '100%', maxWidth: '1800px'}}>
            <div>
              <Button
                variant="outlined"
                onClick={() => {
                  this.props.syncJobWithWFM(job.jobNumber);
                  this.props.showModal({
                    modalType: COC,
                    modalProps: {
                      title: "Edit Chain of Custody",
                      doc: { ...job, samples: samples[job.uid] === undefined ? {} : {...samples[job.uid]} }
                    }
                  });
                }}
              >
                <Edit style={{ fontSize: 20, margin: 5 }} />
                Edit
              </Button>
              <Button
                style={{ marginLeft: 5 }}
                variant="outlined"
                onClick={() => {
                  this.printCoc(job);
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
                      modalType: UPDATECERTIFICATEVERSION,
                      modalProps: {
                        doc: { changes: "", version: version },
                        issueLabReport: this.issueLabReport
                      }
                    });
                  } else {
                    this.issueLabReport(1, "First issue.");
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
                  this.printLabReport(job.currentVersion);
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
                      modalType: COCLOG,
                      modalProps: {
                        jobNumber: job.jobNumber,
                        cocLog: job.cocLog
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
                          this.printLabReport(i + 1);
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
                <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', flexDirection: 'row' }}>
                  <Button
                    variant="outlined"
                    onClick={this.togglePriority}>
                    <Flag color={job.priority === 1 ? 'secondary' : 'inherit'} style={{ fontSize: 20, margin: 5 }} />
                    Mark As Urgent
                  </Button>
                  <Button
                    style={{ marginLeft: 5 }}
                    variant="outlined"
                    onClick={this.toggleWAAnalysis}>
                    <WAIcon color={job.waAnalysis ? 'primary' : 'inherit'} style={{ fontSize: 20, margin: 5}} />
                    Flag For WA Analysis
                  </Button>
                  <Button
                    style={{ marginLeft: 5 }}
                    variant="outlined"
                    onClick={this.receiveAll}
                  >
                    <Inbox style={{ fontSize: 20, margin: 5 }} />
                    Receive All
                  </Button>
                  <Button
                    style={{ marginLeft: 5 }}
                    variant="outlined"
                    onClick={this.startAnalysisAll}
                  >
                    <Colorize style={{ fontSize: 20, margin: 5 }} />
                    Start Analysis All
                  </Button>
                </div>
                <Grid container style={{ marginTop: 12, marginBottom: 12 }}>
                  <Grid item lg={3} xs={6}>
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
                  <Grid item lg={2} xs={6}>
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
                  <Grid item lg={3} xs={6}>
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
                  <Grid item lg={4} xs={6}>
                    Max/Avg Business Hours Turnaround Time:{" "}
                    { stats && stats.maxTurnaroundBusinessTime > 0 && stats.averageTurnaroundBusinessTime > 0 ?
                      <span style={{ fontWeight: 300 }}>
                        {moment.utc(stats.maxTurnaroundBusinessTime).format('HH:mm')}/{moment.utc(stats.averageTurnaroundBusinessTime).format('HH:mm')}
                      </span>
                      :
                      <span style={{ fontWeight: 300 }}>N/A</span>
                    }
                    <br />
                    Max/Avg Business Hours Analysis Time:{" "}
                    { stats && stats.maxAnalysisBusinessTime > 0 && stats.averageAnalysisBusinessTime > 0 ?
                      <span style={{ fontWeight: 300 }}>
                        {moment.utc(stats.maxAnalysisBusinessTime).format('HH:mm')}/{moment.utc(stats.averageAnalysisBusinessTime).format('HH:mm')}
                      </span>
                      :
                      <span style={{ fontWeight: 300 }}>N/A</span>
                    }
                    <br />
                    Max/Avg Business Hours Report Time:{" "}
                    { stats && stats.maxReportBusinessTime > 0 && stats.averageReportBusinessTime > 0 ?
                      <span style={{ fontWeight: 300 }}>
                        {moment.utc(stats.maxReportBusinessTime).format('HH:mm')}/{moment.utc(stats.averageReportBusinessTime).format('HH:mm')}
                      </span>
                      :
                      <span style={{ fontWeight: 300 }}>N/A</span>
                    }
                    <br />
                  </Grid>
                </Grid>
                {samples[job.uid] && Object.values(samples[job.uid]).filter(el => el.deleted === false).length > 0 &&
                  Object.values(samples[job.uid]).filter(el => el.deleted === false)
                  .map(sample => {
                    return (<SampleDetailsExpansion
                      key={sample.uid}
                      job={job}
                      sample={sample}
                      sampleAnchorMenu={this.sampleAnchorMenu}
                      receiveSample={this.receiveSample}
                      startAnalysis={this.startAnalysis}
                      anchorEl={this.state.sampleAnchorEl[sample.sampleNumber]}
                      getStats={this.getStats}
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
