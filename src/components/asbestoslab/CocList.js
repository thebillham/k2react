import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
  asbestosAnalysisRef,
  firebase,
  auth,
  asbestosSamplesRef
} from "../../config/firebase";
import { fetchCocs, fetchSamples, syncJobWithWFM } from "../../actions/local";
import { showModal } from "../../actions/modal";
import {
  COC,
  UPDATECERTIFICATEVERSION,
  WAANALYSIS,
  SAMPLEHISTORY,
  COCLOG
} from "../../constants/modal-types";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
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
import More from "@material-ui/icons/MoreVert";
import Colorize from "@material-ui/icons/Colorize";

import Popup from "reactjs-popup";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.local.samples,
    analyst: state.local.analyst,
    analysismode: state.local.analysismode,
    bulkanalysts: state.local.bulkanalysts,
    airanalysts: state.local.airanalysts
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

class CocList extends React.Component {
  state = {
    samples: {},
    bulkanalyst: "",
    // sessionID creates a unique id for this refresh of the CoC. This is used as the firestore uid for any results reported
    sessionID: "",
    sampleAnchorEl: {},
    cocAnchorEl: null
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
    console.log(uid.replace(/[.:/,\s]/g, "_"));
  };

  receiveSample = sample => {
    let receiveddate = null;
    if (!sample.receivedbylab) receiveddate = new Date();
    let log = {
      type: "Received",
      log: receiveddate
        ? `Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }) received by lab.`
        : `Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }) unchecked as being received.`,
      user: auth.currentUser.uid,
      sample: sample.uid,
      username: this.props.me.name,
      date: new Date()
    };
    let cocLog = this.props.job.cocLog;
    cocLog ? cocLog.push(log) : (cocLog = [log]);
    cocsRef
      .doc(this.props.job.uid)
      .update({ versionUpToDate: false, cocLog: cocLog });
    asbestosSamplesRef.doc(sample.uid).set(
      {
        receivedbylab: !sample.receivedbylab,
        receiveduser: auth.currentUser.uid,
        receiveddate: receiveddate
      },
      { merge: true }
    );
  };

  startAnalysis = sample => {
    let analysisstart = null;
    if (!sample.analysisstart) analysisstart = new Date();
    let log = {
      type: "Analysis",
      log: analysisstart
        ? `Analysis begun on Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }).`
        : `Analysis stopped for Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }).`,
      user: auth.currentUser.uid,
      sample: sample.uid,
      username: this.props.me.name,
      date: new Date()
    };
    let cocLog = this.props.job.cocLog;
    cocLog ? cocLog.push(log) : (cocLog = [log]);
    cocsRef
      .doc(this.props.job.uid)
      .update({ versionUpToDate: false, cocLog: cocLog });
    asbestosSamplesRef.doc(sample.uid).set(
      {
        analysisstart: !sample.analysisstart,
        analysisstartedby: auth.currentUser.uid,
        analysisstartdate: analysisstart
      },
      { merge: true }
    );
  };

  reportSample = sample => {
    if (
      this.props.me &&
      this.props.me.auth &&
      (this.props.me.auth["Analysis Checker"] ||
        this.props.me.auth["Asbestos Admin"])
    ) {
      if (auth.currentUser.uid === sample.resultuser) {
        window.alert("Samples must be checked off by a different user.");
      } else {
        let reportdate = null;
        if (!sample.reported) reportdate = new Date();
        let log = {
          type: "Reported",
          log: reportdate
            ? `Sample ${sample.sampleNumber} (${sample.description} ${
                sample.material
              }) result checked.`
            : `Sample ${sample.sampleNumber} (${sample.description} ${
                sample.material
              }) result unchecked.`,
          user: auth.currentUser.uid,
          sample: sample.uid,
          username: this.props.me.name,
          date: new Date()
        };
        let cocLog = this.props.job.cocLog;
        cocLog ? cocLog.push(log) : (cocLog = [log]);
        cocsRef
          .doc(this.props.job.uid)
          .update({ versionUpToDate: false, cocLog: cocLog });
        asbestosSamplesRef.doc(sample.uid).set(
          {
            reported: !sample.reported,
            reportuser: auth.currentUser.uid,
            reportdate: reportdate
          },
          { merge: true }
        );
      }
    } else {
      window.alert(
        "You don't have sufficient permissions to verify asbestos results."
      );
    }
  };

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
            username: this.props.me.name,
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
          .set({ reported: false, reportdate: null }, { merge: true });
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
        resultuser: auth.currentUser.uid,
        sessionID: this.state.sessionID,
        analyst: this.props.analyst,
        result: newmap,
        resultdate: new Date()
      });

      cocLog.push({
        type: "Analysis",
        log: `New analysis for sample ${sample.sampleNumber} (${
          sample.description
        } ${sample.material}): ${this.writeResult(newmap)}`,
        user: auth.currentUser.uid,
        username: this.props.me.name,
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
        asbestosAnalysisRef.doc(`${this.state.sessionID}-${sample.uid}`).set({
          analyst: this.props.analyst,
          analystUID: auth.currentUser.uid,
          mode: this.props.analysismode,
          sessionID: this.state.sessionID,
          cocUID: this.props.job.uid,
          sampleUID: sample.uid,
          result: newmap,
          description: sample.description,
          material: sample.material,
          samplers: this.props.job.personnel,
          analysisdate: new Date()
        });
      } else {
        asbestosAnalysisRef
          .doc(`${this.state.sessionID}-${sample.uid}`)
          .delete();
        cocsRef
          .doc(this.props.job.uid)
          .collection("samples")
          .doc(sample.uid)
          .update({
            result: firebase.firestore.FieldValue.delete(),
            sessionID: firebase.firestore.FieldValue.delete()
          });
      }
    } else {
      window.alert(
        "You don't have sufficient permissions to set asbestos results."
      );
    }
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

  writeVersionJson = job => {
    let aanumbers = {};
    Object.values(this.props.staff).forEach(staff => {
      aanumbers[staff.name] = staff.aanumber ? staff.aanumber : "-";
    });
    aanumbers[this.props.me.name] = this.props.me.aanumber
      ? this.props.me.aanumber
      : "-";
    aanumbers["Client"] = "-";
    console.log(aanumbers);
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
      client: `${job.client} ${job.clientOrderNumber}`,
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
      version: job.currentVersion ? job.currentVersion : 1,
      samples: samples
    };
    return report;
  };

  writeDescription = (description, material) => {
    if (description && material) {
      return description + ", " + material;
    } else if (description) {
      return description;
    } else if (material) {
      return material;
    } else {
      return "No description";
    }
  };

  issueLabReport = (version, changes) => {
    // first check all samples have been checked
    // if not version 1, prompt for reason for new version
    let json = this.writeVersionJson(this.props.job);
    let versionHistory = this.props.job.versionHistory
      ? this.props.job.versionHistory
      : {};
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Issue",
      log: `Version ${version} issued.`,
      user: auth.currentUser.uid,
      username: this.props.me.name,
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
        cocLog: cocLog
      },
      { merge: true }
    );
  };

  printLabReport = version => {
    console.log(this.props.job.versionHistory[version]);
    let report = this.props.job.versionHistory[version].data;
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Document",
      log: `Test Certificate (version ${version}) downloaded.`,
      user: auth.currentUser.uid,
      username: this.props.me.name,
      date: new Date()
    });
    cocsRef.doc(this.props.job.uid).set({ cocLog: cocLog }, { merge: true });
    if (report.version && report.version > 1) {
      let versionHistory = [];
      [...Array(report.version - 1).keys()].forEach(i => {
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
    let url =
      "http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=" +
      JSON.stringify(report);
    console.log(url);
    // this.setState({ url: url });
    window.open(url);
    // fetch('http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(report));
  };

  printCoc = job => {
    console.log(job);
    let cocLog = this.props.job.cocLog;
    if (!cocLog) cocLog = [];
    cocLog.push({
      type: "Document",
      log: `Chain of Custody downloaded.`,
      user: auth.currentUser.uid,
      username: this.props.me.name,
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
    console.log(aanumbers);
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
      orderNumber: job.clientOrderNumber,
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
      "http://api.k2.co.nz/v1/doc/scripts/asbestos/lab/coc.php?report=" +
      JSON.stringify(report);
    console.log(url);
    this.setState({ url: url });
    window.open(url);
    // fetch('http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(report));
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
      if (!cocLog) cocLog = [];
      cocLog.push({
        type: "Delete",
        log: "Chain of Custody deleted.",
        username: this.props.me.name,
        user: auth.currentUser.uid,
        date: new Date()
      });
      cocsRef
        .doc(this.props.job.uid)
        .set({ deleted: true, cocLog: cocLog }, { merge: true });
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

    return (
      <ExpansionPanel
        onChange={(event, ex) => {
          if (!job.samples) this.getSamples(ex, job.uid, job.jobNumber);
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <b>{job.jobNumber}</b> {job.client} ({job.address})
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
                    if (!sample.reported) allSamplesReported = false;
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
                        jobNumber: job.jobumber,
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
                <div style={{ marginTop: 12, marginBottom: 12 }}>
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
                  <br />
                </div>
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
                    let cameracolor = "#ddd";
                    if (sample.path_remote) cameracolor = "green";
                    let receivedcolor = "#ddd";
                    if (sample.receivedbylab) receivedcolor = "green";
                    let analysiscolor = "#ddd";
                    if (sample.analysisstart) analysiscolor = "green";
                    let reportcolor = "#ddd";
                    if (sample.reported) reportcolor = "green";
                    let chcolor = "#ddd";
                    let amcolor = "#ddd";
                    let crcolor = "#ddd";
                    let umfcolor = "#ddd";
                    let chdivcolor = "white";
                    let amdivcolor = "white";
                    let crdivcolor = "white";
                    let umfdivcolor = "white";
                    // if (result === 'positive') {
                    //   chcolor = '#b00';
                    //   amcolor = '#b00';
                    //   crcolor = '#b00';
                    //   umfcolor = '#b00';
                    // }
                    if (sample.result && sample.result["ch"]) {
                      chcolor = "white";
                      chdivcolor = "red";
                    }
                    if (sample.result && sample.result["am"]) {
                      amcolor = "white";
                      amdivcolor = "red";
                    }
                    if (sample.result && sample.result["cr"]) {
                      crcolor = "white";
                      crdivcolor = "red";
                    }
                    if (sample.result && sample.result["umf"]) {
                      umfcolor = "white";
                      umfdivcolor = "red";
                    }

                    let nocolor = "#ddd";
                    let nodivcolor = "#fff";
                    if (result === "negative") {
                      nocolor = "green";
                      nodivcolor = "lightgreen";
                    }

                    return (
                      <ListItem
                        dense
                        className={classes.hoverItem}
                        key={`${
                          job.jobNumber
                        }-${sample.sampleNumber.toString()}_${
                          sample.description
                        }`}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "70vw"
                          }}
                        >
                          <div
                            style={{
                              width: "30vw",
                              display: "flex",
                              flexDirection: "row",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              alignItems: "center",
                              justifyContent: "flex-start"
                            }}
                          >
                            <Popup
                              trigger={
                                <CameraAlt
                                  style={{
                                    fontSize: 24,
                                    color: cameracolor,
                                    margin: 10
                                  }}
                                />
                              }
                              position="right center"
                              on="hover"
                              disabled={sample.path_remote == null}
                            >
                              {sample.path_remote && (
                                <img
                                  alt=""
                                  src={sample.path_remote}
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
                              sample.description,
                              sample.material
                            )}
                          </div>
                          <div
                            style={{
                              width: "40vw",
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "center"
                            }}
                          >
                            <IconButton
                              onClick={() => {
                                this.receiveSample(sample);
                              }}
                            >
                              <Inbox
                                style={{
                                  fontSize: 24,
                                  margin: 10,
                                  color: receivedcolor
                                }}
                              />
                            </IconButton>
                              <IconButton
                                onClick={() => {
                                  this.startAnalysis(sample);
                                }}
                              >
                                <Colorize
                                  style={{
                                    fontSize: 24,
                                    margin: 10,
                                    color: analysiscolor
                                  }}
                                />
                              </IconButton>
                            <div
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <div
                                style={{
                                  backgroundColor: chdivcolor,
                                  borderRadius: 5
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  disabled={!sample.receivedbylab}
                                  style={{ margin: 5, color: chcolor }}
                                  onClick={() => {
                                    this.toggleResult(sample, "ch");
                                  }}
                                >
                                  CH
                                </Button>
                              </div>
                              <div
                                style={{
                                  backgroundColor: amdivcolor,
                                  borderRadius: 5
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  disabled={!sample.receivedbylab}
                                  style={{ margin: 5, color: amcolor }}
                                  onClick={() => {
                                    this.toggleResult(sample, "am");
                                  }}
                                >
                                  AM
                                </Button>
                              </div>
                              <div
                                style={{
                                  backgroundColor: crdivcolor,
                                  borderRadius: 5
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  disabled={!sample.receivedbylab}
                                  style={{ margin: 5, color: crcolor }}
                                  onClick={() => {
                                    this.toggleResult(sample, "cr");
                                  }}
                                >
                                  CR
                                </Button>
                              </div>
                              <div
                                style={{
                                  backgroundColor: umfdivcolor,
                                  borderRadius: 5
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  disabled={!sample.receivedbylab}
                                  style={{ margin: 5, color: umfcolor }}
                                  onClick={() => {
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
                                backgroundColor: nodivcolor,
                                borderRadius: 5
                              }}
                            >
                              <Button
                                variant="outlined"
                                disabled={!sample.receivedbylab}
                                style={{ margin: 5, color: nocolor }}
                                onClick={() => {
                                  this.toggleResult(sample, "no");
                                }}
                              >
                                NO
                              </Button>
                            </div>
                            <IconButton
                              disabled={!sample.receivedbylab}
                              onClick={() => {
                                if (
                                  !sample.result &&
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
                                  color: reportcolor
                                }}
                              />
                            </IconButton>
                            <IconButton
                              onClick={event => {
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
                                onClick={() => {
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
                                onClick={() => {
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
                        </div>
                      </ListItem>
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
  )(CocList)
);
