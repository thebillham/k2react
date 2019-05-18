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
import { fetchCocs, fetchSamples } from "../../../actions/asbestosLab";
import { syncJobWithWFM } from "../../../actions/local";
import { showModal } from "../../../actions/modal";
import {
  COC,
  ASBESTOSLABDETAILS,
  DOWNLOADLABCERTIFICATE,
  UPDATECERTIFICATEVERSION,
  WAANALYSIS,
  SAMPLEHISTORY,
  COCLOG
} from "../../../constants/modal-types";

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

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
    analyst: state.asbestosLab.analyst,
    analysisMode: state.asbestosLab.analysisMode,
    bulkAnalysts: state.asbestosLab.bulkAnalysts,
    airAnalysts: state.asbestosLab.airAnalysts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    showModal: modal => dispatch(showModal(modal)),
    fetchSamples: (cocUid, jobNumber) =>
      dispatch(fetchSamples(cocUid, jobNumber)),
    syncJobWithWFM: jobNumber => dispatch(syncJobWithWFM(jobNumber))
  };
};

class AsbestosBulkCocCard extends React.Component {
  state = {
    samples: {},
    bulkAnalyst: "",
    // sessionID creates a unique id for this refresh of the CoC. This is used as the firestore uid for any results reported
    sessionID: "",
    sampleAnchorEl: {},
    cocAnchorEl: null,
    samplesExpanded: {},
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

    this.setState({
      sessionID: uid.replace(/[.:/,\s]/g, "_")
    });
    // console.log(uid.replace(/[.:/,\s]/g, "_"));
  };

  getStats = () => {
    let status = '';
    let totalSamples = 0;
    let numberReceived = 0;
    let numberAnalysisStarted = 0;
    let numberResult = 0;
    let numberReported = 0;
    let maxTurnaroundTime = 0;
    let averageTurnaroundTime = 0;
    let totalTurnaroundTime = 0;
    let numTurnaroundTime = 0;
    if (this.props.samples && this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).length > 0) {
      Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        totalSamples = totalSamples + 1;
        if (sample.receivedByLab) numberReceived = numberReceived + 1;
        if (sample.analysisStart) numberAnalysisStarted = numberAnalysisStarted + 1;
        if (sample.result) numberResult = numberResult + 1;
        if (sample.reported) {
          numberReported = numberReported + 1;
          if (sample.turnaroundTime) {
            if (sample.turnaroundTime > maxTurnaroundTime) maxTurnaroundTime = sample.turnaroundTime;
            totalTurnaroundTime = totalTurnaroundTime + sample.turnaroundTime;
            numTurnaroundTime = numTurnaroundTime + 1;
            averageTurnaroundTime = totalTurnaroundTime / numTurnaroundTime;
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
    } else if (numberResult === totalSamples && numberReported === 0) {
      status = 'Analysis Complete';
    } else if (numberReported === totalSamples) {
      status = 'Ready For Issue';
    }
    return {
      status,
      totalSamples,
      numberReceived,
      numberAnalysisStarted,
      numberResult,
      numberReported,
      maxTurnaroundTime,
      averageTurnaroundTime,
    };
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
    if (sample.receivedByLab && sample.reported) {
      if (window.confirm('The sample result has already been verified. Removing from the lab will remove the analysis result and verification. Continue?')) {
        this.removeResult(sample);
        this.reportSample(sample);
      }
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
        receivedUser: auth.currentUser.uid,
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
    if (sample.reported) this.reportSample(sample);
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
        analysisStartedby: auth.currentUser.uid,
        analysisStartdate: analysisStart
      });
    } else {
      asbestosSamplesRef.doc(sample.uid).update(
      {
        analysisStart: false,
        analysisStartedby: firebase.firestore.FieldValue.delete(),
        analysisStartdate: firebase.firestore.FieldValue.delete(),
      });
    }
  };

  reportSample = sample => {
    if (
      !sample.reported ||
      (this.props.me &&
      this.props.me.auth &&
      (this.props.me.auth["Analysis Checker"] ||
        this.props.me.auth["Asbestos Admin"]))
    ) {
      if (auth.currentUser.uid === sample.resultUser) {
        window.alert("Samples must be checked off by a different user.");
      } else {
        if (!sample.analysisStart && !sample.reported) this.startAnalysis(sample);
        let reportDate = null;
        if (!sample.reported) reportDate = new Date();
        let log = {
          type: "Reported",
          log: reportDate
            ? `Sample ${sample.sampleNumber} (${sample.description} ${
                sample.material
              }) result checked.`
            : `Sample ${sample.sampleNumber} (${sample.description} ${
                sample.material
              }) result unchecked.`,
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
        if (!sample.reported) {
          asbestosSamplesRef.doc(sample.uid).update(
          {
            reported: true,
            reportUser: auth.currentUser.uid,
            reportDate: reportDate,
            turnaroundTime: sample.receivedDate ? moment.duration(moment(reportDate).diff(sample.receivedDate.toDate())).asMilliseconds() : null
          });
        } else {
          asbestosSamplesRef.doc(sample.uid).update(
          {
            reported: false,
            reportUser: firebase.firestore.FieldValue.delete(),
            reportDate: firebase.firestore.FieldValue.delete(),
            turnaroundTime: firebase.firestore.FieldValue.delete(),
          });
        }
      }
    } else {
      window.alert(
        "You don't have sufficient permissions to verify asbestos results."
      );
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

  toggleResult = (sample, result) => {
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
      if (sample.sessionID !== this.state.sessionID && sample.result) {
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
      let map = sample.result;
      if (sample.reported) {
        asbestosSamplesRef
          .doc(sample.uid)
          .set({ reported: false, reportDate: null }, { merge: true });
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

      asbestosSamplesRef.doc(sample.uid).update({
        resultUser: auth.currentUser.uid,
        sessionID: this.state.sessionID,
        analyst: this.props.analyst,
        result: newmap,
        resultDate: new Date()
      });

      cocLog.push({
        type: "Analysis",
        log: `New analysis for sample ${sample.sampleNumber} (${
          sample.description
        } ${sample.material}): ${this.writeResult(newmap)}`,
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
        if (!sample.analysisStart) this.startAnalysis(sample);
        asbestosAnalysisRef.doc(`${this.state.sessionID}-${sample.uid}`).set({
          analyst: this.props.analyst,
          analystUID: auth.currentUser.uid,
          mode: this.props.analysisMode,
          sessionID: this.state.sessionID,
          cocUID: this.props.job.uid,
          sampleUID: sample.uid,
          result: newmap,
          description: sample.description,
          material: sample.material,
          samplers: this.props.job.personnel,
          analysisDate: new Date()
        });
      } else {
        asbestosAnalysisRef
          .doc(`${this.state.sessionID}-${sample.uid}`)
          .delete();
        asbestosSamplesRef
          .doc(sample.uid)
          .update({
            result: firebase.firestore.FieldValue.delete(),
            resultDate: firebase.firestore.FieldValue.delete(),
            resultUser: firebase.firestore.FieldValue.delete(),
            sessionID: firebase.firestore.FieldValue.delete(),
          });
      }
    } else {
      window.alert(
        "You don't have sufficient permissions to set asbestos results."
      );
    }
  };

  removeResult = sample => {
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
        resultDate: firebase.firestore.FieldValue.delete(),
        resultUser: firebase.firestore.FieldValue.delete(),
        sessionID: firebase.firestore.FieldValue.delete(),
      });
  };

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

  writeResult = result => {
    let detected = [];
    if (result === undefined) return "Not analysed";
    Object.keys(result).forEach(type => {
      if (result[type]) detected.push(type);
    });
    if (detected.length < 1) return "Not analysed";
    if (detected[0] === "no") return "No asbestos detected";
    let asbestos = [];
    if (result["ch"]) asbestos.push("chrysotile");
    if (result["am"]) asbestos.push("amosite");
    if (result["cr"]) asbestos.push("crocidolite");
    if (asbestos.length > 0) {
      asbestos[asbestos.length - 1] =
        asbestos[asbestos.length - 1] + " asbestos";
    }
    let str = "";
    if (asbestos.length === 1) {
      str = asbestos[0];
    } else if (asbestos.length > 1) {
      var last_element = asbestos.pop();
      str = asbestos.join(", ") + " and " + last_element;
    }
    detected.forEach(detect => {
      if (detect === "umf") {
        if (asbestos.length > 0) {
          str = str + " and unknown mineral fibres (UMF)";
        } else {
          str = "unknown mineral fibres (UMF)";
        }
      }
    });
    return str.charAt(0).toUpperCase() + str.slice(1) + " detected";
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
        if (sample.reported) {
          let samplemap = {};
          if (sample.disabled) return;
          samplemap["no"] = sample.sampleNumber;
          samplemap["description"] =
            sample.description.charAt(0).toUpperCase() +
            sample.description.slice(1);
          samplemap["material"] =
            sample.material.charAt(0).toUpperCase() + sample.material.slice(1);
          samplemap["result"] = this.writeResult(sample.result);
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
      console.log('get samples frm AsbestosBulkCocCard');
      this.props.fetchSamples(cocUid, jobNumber);
    }
  };

  // Restructure result first to include analyst, analysis type, date etc.
  getAnalysts = report => {
    let analysts = {};
    this.props.samples[this.props.job.uid] &&
      Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
        if (report) {
          if (sample.analyst && sample.reported) {
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
        cocLog.push({
          type: "Delete",
          log: `Sample ${sample.sampleNumber} (${sample.description} ${sample.material}) deleted.`,
          userName: this.props.me.name,
          user: auth.currentUser.uid,
          date: new Date(),
          sample: sample.uid,
        })
        asbestosSamplesRef.doc(sample.uid).update({ deleted: true })
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
    } else return;
  };

  render() {
    const { classes, job, samples } = this.props;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    let analysts = this.getAnalysts(false);
    let menu = {};

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
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <div><b>{job.jobNumber}</b> {job.client} ({job.address}) {job.priority === 1 && <Flag color='secondary' />}</div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List>
            <div>
              <Button
                variant="outlined"
                onClick={() => {
                  this.props.syncJobWithWFM(job.jobNumber);
                  this.props.showModal({
                    modalType: COC,
                    modalProps: {
                      title: "Edit Chain of Custody",
                      doc: { ...job, samples: samples[job.uid] === undefined ? {} : samples[job.uid] }
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
                  let allSamplesReported = true;
                  Object.values(samples[job.uid]).forEach(sample => {
                    if (!sample.reported && sample.cocUid === job.uid) allSamplesReported = false;
                  });
                  if (
                    !allSamplesReported &&
                    !window.confirm(
                      "Not all samples in the chain of custody have been checked off. These will not be included in this issue. Proceed with issuing?"
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
                  job.currentVersion > 1 &&
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
                    <Flag color={job.priority === 1 ? 'secondary' : 'default'} style={{ fontSize: 20, margin: 5 }} />
                    Mark As Urgent
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
                  <Grid item xs={12} style={{ fontWeight: 500, fontSize: 16, marginBottom: 12, }}>
                    STATUS: {stats && stats.status.toUpperCase()}
                  </Grid>
                  <Grid item xs={6}>
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
                  <Grid item>
                    Number of Samples:{" "}
                    <span style={{ fontWeight: 300 }}>
                      {stats && stats.totalSamples}
                    </span>
                    <br />
                    Max Turnaround Time:{" "}
                    { stats && stats.maxTurnaroundTime > 0 ?
                      <span style={{ fontWeight: 300 }}>
                        {moment.utc(stats.maxTurnaroundTime).format('HH:mm')}
                      </span>
                      :
                      <span style={{ fontWeight: 300 }}>N/A</span>
                    }
                    <br />
                    Avg Turnaround Time:{" "}
                    { stats && stats.averageTurnaroundTime > 0 ?
                      <span style={{ fontWeight: 300 }}>
                        {moment.utc(stats.averageTurnaroundTime).format('HH:mm')}
                      </span>
                      :
                      <span style={{ fontWeight: 300 }}>N/A</span>
                    }
                  </Grid>
                </Grid>
                {samples[job.uid] &&
                  Object.values(samples[job.uid]).filter(el => el.deleted === false)
                  .map(sample => {
                    if (sample.cocUid !== this.props.job.uid) return;
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
                    let reportColor = "#ddd";
                    if (sample.reported) reportColor = "green";
                    let chColor = "#ddd";
                    let amColor = "#ddd";
                    let crColor = "#ddd";
                    let umfColor = "#ddd";
                    let chDivColor = "white";
                    let amDivColor = "white";
                    let crDivColor = "white";
                    let umfDivColor = "white";
                    // if (result === 'positive') {
                    //   chColor = '#b00';
                    //   amColor = '#b00';
                    //   crColor = '#b00';
                    //   umfColor = '#b00';
                    // }
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
                    let endTime = new Date();
                    if (sample.reportDate) endTime = sample.reportDate.toDate();
                    let timeInLab = sample.receivedDate ? moment.duration(moment(endTime).diff(sample.receivedDate.toDate())) : null;
                    let status = 'In Transit';
                    if (sample.reported) status = 'Complete';
                      else if (sample.resultDate) status = 'Waiting on Analysis Verification';
                      else if (sample.analysisStart) status = 'Analysis Started';
                      else if (sample.receivedByLab) status = 'Received By Lab';

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
                                  {sample.imagePathRemote && (
                                    <img
                                      alt=""
                                      src={sample.imagePathRemote}
                                      width={200}
                                    />
                                  )}
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
                                  this.receiveSample(sample);
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
                                    this.startAnalysis(sample);
                                  }}
                                >
                                  <Colorize
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
                                      this.toggleResult(sample, "ch");
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
                                      this.toggleResult(sample, "am");
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
                                      this.toggleResult(sample, "cr");
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
                                      this.toggleResult(sample, "umf");
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
                                    this.toggleResult(sample, "no");
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
                                    !sample.reported &&
                                    !window.confirm(
                                      "No result has been recorded for this sample. This will appear as 'Not analysed' in the test certificate. Proceed?"
                                    )
                                  )
                                    return;
                                  this.reportSample(sample);
                                }}
                              >
                                <CheckCircleOutline
                                  style={{
                                    fontSize: 24,
                                    margin: 10,
                                    color: reportColor
                                  }}
                                />
                              </IconButton>
                              <IconButton
                                onClick={event => {
                                  event.stopPropagation();
                                  this.setState({
                                    sampleAnchorEl: {
                                      [sample.sampleNumber]: event.currentTarget
                                    }
                                  });
                                }}
                              >
                                <More />
                              </IconButton>
                              <Menu
                                id={`${
                                  job.jobNumber
                                }-${sample.sampleNumber.toString()}`}
                                anchorEl={
                                  this.state.sampleAnchorEl[sample.sampleNumber]
                                }
                                open={Boolean(
                                  this.state.sampleAnchorEl[sample.sampleNumber]
                                )}
                                onClose={() => {
                                  this.setState({
                                    sampleAnchorEl: {
                                      [sample.sampleNumber]: null
                                    }
                                  });
                                }}
                                style={{ padding: 0 }}
                              >
                                <MenuItem
                                  key={`${
                                    job.jobNumber
                                  }-${sample.sampleNumber.toString()}-WA`}
                                  onClick={event => {
                                    event.stopPropagation();
                                    this.props.showModal({
                                      modalType: ASBESTOSLABDETAILS,
                                      modalProps: {
                                        sample: sample,
                                        docid: job.uid
                                      }
                                    });
                                  }}
                                >
                                  Lab Details
                                </MenuItem>
                                <MenuItem
                                  key={`${
                                    job.jobNumber
                                  }-${sample.sampleNumber.toString()}-WA`}
                                  onClick={event => {
                                    event.stopPropagation();
                                    this.props.showModal({
                                      modalType: WAANALYSIS,
                                      modalProps: {
                                        title: "Add WA Analysis",
                                        sample: sample,
                                        docid: job.uid
                                      }
                                    });
                                  }}
                                >
                                  Add WA Analysis
                                </MenuItem>
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
                              </Menu>
                              </div>
                            </Grid>
                          </Grid>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <Grid container>
                            <Grid item xs={false} xl={1} />
                            <Grid item xs={12} xl={5} style={{ fontSize: 14 }}>
                              <div style={{ fontWeight: 700, height: 30}}>STATUS: {status}</div>
                              <div style={{ fontWeight: 700, height: 25}}>Details</div>
                              <div>
                                <span>Created at {moment(sample.createdDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {this.props.staff && this.props.staff[sample.createdBy] ? <span>{this.props.staff[sample.createdBy].name}</span>
                                :<span>an unknown person</span>}</span>
                              </div>
                              <div>
                                {sample.receivedByLab ?
                                  <span>Received by lab at {moment(sample.receivedDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {this.props.staff && this.props.staff[sample.receivedUser] ? <span>{this.props.staff[sample.receivedUser].name}</span>
                                  :<span>an unknown person</span>}</span>
                                  : <span>Not yet received by lab</span>
                                }
                              </div>
                              <div>
                                {sample.analysisStart ?
                                  <span>Analysis started at {moment(sample.analysisStartdate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {this.props.staff && this.props.staff[sample.analysisStartedby] ? <span>{this.props.staff[sample.analysisStartedby].name}</span>
                                  :<span>an unknown person</span>}</span>
                                  : <span>Analysis not yet started</span>
                                }
                              </div>
                              <div>
                                {sample.resultDate ?
                                  <span>Result logged at {moment(sample.resultDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {this.props.staff && this.props.staff[sample.resultUser] ? <span>{this.props.staff[sample.resultUser].name}</span>
                                  :<span>an unknown person</span>}</span>
                                  : <span>Result not yet logged</span>
                                }
                              </div>
                              <div>
                                {sample.reported ?
                                  <span>Result reported at {moment(sample.reportDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {this.props.staff && this.props.staff[sample.reportUser] ? <span>{this.props.staff[sample.reportUser].name}</span>
                                  :<span>an unknown person</span>}</span>
                                  : <span>Result not yet reported</span>
                                }
                              </div>
                              <div>
                                {sample.reported ?
                                  <span>Lab turnaround time: {timeInLab.asHours() >= 24 && <span>{timeInLab.days()} day{timeInLab.days() !== 1 &&<span>s</span>}, </span>}{timeInLab.asMinutes() >= 60 && <span>{timeInLab.hours()} hour{timeInLab.hours() !== 1 && <span>s</span>} and </span>}{timeInLab.minutes()} minute{timeInLab.minutes() !== 1 && <span>s</span>}</span>
                                  : <span>{sample.receivedDate && <span>Time in lab: {timeInLab.asHours() >= 24 && <span>{timeInLab.days()} day{timeInLab.days() !== 1 &&<span>s</span>}, </span>}{timeInLab.asMinutes() >= 60 && <span>{timeInLab.hours()} hour{timeInLab.hours() !== 1 && <span>s</span>} and </span>}{timeInLab.minutes()} minute{timeInLab.minutes() !== 1 && <span>s</span>}</span>}</span>
                                }
                              </div>
                            </Grid>
                            <Grid item xs={12} xl={6}>

                            </Grid>
                          </Grid>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    );
                  })}{" "}
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
          </List>
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
