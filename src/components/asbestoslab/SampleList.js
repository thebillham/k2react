import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import { jobsRef, cocsRef, asbestosSamplesRef } from "../../config/firebase";
import { fetchCocs } from "../../actions/local";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";

import ExpandMore from "@material-ui/icons/ExpandMore";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";
import Edit from "@material-ui/icons/Edit";
import Inbox from "@material-ui/icons/Inbox";
import CameraAlt from "@material-ui/icons/CameraAlt";
import Print from "@material-ui/icons/Print";
import Send from "@material-ui/icons/Send";
import Popup from "reactjs-popup";

const mapStateToProps = state => {
  return {
    samples: state.local.cocs,
    search: state.local.search
  };
};

class SampleList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  receiveSample = (uid, receivedbylab) => {
    let receiveddate = null;
    if (!receivedbylab) receiveddate = new Date();
    asbestosSamplesRef
      .doc(uid)
      .set(
        { receivedbylab: !receivedbylab, receiveddate: receiveddate },
        { merge: true }
      );
  };

  reportSample = (uid, reported) => {
    let reportdate = null;
    if (!reported) reportdate = new Date();
    asbestosSamplesRef
      .doc(uid)
      .set({ reported: !reported, reportdate: reportdate }, { merge: true });
  };

  toggleResult = (uid, result, map, reported) => {
    let newmap = {};
    if (reported) {
      asbestosSamplesRef
        .doc(uid)
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
    asbestosSamplesRef
      .doc(uid)
      .update({ result: newmap, resultdate: new Date() });
  };

  sortSamples = samples => {
    let samplemap = {};
    samples.map(sample => {
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

  issueLabReport = (job, version) => {
    jobsRef.doc(job).set({ reportversion: version }, { merge: true });
  };

  onEdit = (target, uid) => {
    this.setState({
      [target.id]: target.value
    });
  };

  onSubmitEdit = uid => {
    var change = {};
    if (this.state.sampleNumber)
      change["sampleNumber"] = this.state.sampleNumber;
    if (this.state.description) change["description"] = this.state.description;
    if (this.state.material) change["material"] = this.state.material;
    if (Object.keys(change).length > 0) {
      change["reported"] = false;
      change["reportdate"] = null;
      this.setState({
        material: null,
        description: null,
        sampleNumber: null
      });
      asbestosSamplesRef.doc(uid).update(change);
    }
  };

  printLabReport = job => {
    let samples = [];
    job.samples.forEach(sample => {
      if (sample.reported) {
        let samplemap = {};
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
    let report = {
      jobNumber: job.jobnumber,
      client: job.clientName,
      address: job.address,
      date: "7 November 2018",
      ktp: "Stuart Keer-Keer",
      personnel: ["Max van den Oever", "Reagan Solodi"],
      assessors: ["AA16100168", "AA18050075"],
      analysts: ["Ben Dodd"],
      samples: samples
    };
    let url =
      "http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=" +
      JSON.stringify(report);
    this.setState({ url: url });
    window.open(url);
    // fetch('http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(report));
  };

  render() {
    const { classes, samples } = this.props;

    var jobnumber = "";
    return (
      <div style={{ marginTop: 80 }}>
        {Object.keys(samples).length < 1 ? (
          <CircularProgress />
        ) : (
          <div>
            {Object.keys(samples)
              .filter(job => {
                if (this.props.search) {
                  let terms = this.props.search.split(" ");
                  let search =
                    job +
                    " " +
                    samples[job].clientName +
                    " " +
                    samples[job].address;
                  let result = true;
                  terms.forEach(term => {
                    if (!search.toLowerCase().includes(term.toLowerCase()))
                      result = false;
                  });
                  return result;
                } else {
                  return true;
                }
              })
              .map(job => {
                return (
                  <ExpansionPanel key={job}>
                    <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                      <b>{job}</b> {samples[job].clientName} (
                      {samples[job].address})
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <List>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            this.issueLabReport(
                              samples[job].uid,
                              samples[job].reportversion + 1
                            );
                          }}
                        >
                          <Send style={{ fontSize: 24, margin: 5 }} />
                          Issue Version {samples[job].reportversion + 1}
                        </Button>
                        <Button
                          style={{ marginLeft: 5 }}
                          variant="outlined"
                          onClick={() => {
                            this.printLabReport(samples[job]);
                          }}
                        >
                          <Print style={{ fontSize: 24, margin: 5 }} /> Print
                          Test Certificate
                        </Button>
                        {samples[job].samples.map(sample => {
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
                          let reportcolor = "#ddd";
                          if (sample.reported) reportcolor = "green";
                          let chcolor = "#ddd";
                          let amcolor = "#ddd";
                          let crcolor = "#ddd";
                          let umfcolor = "#ddd";
                          if (result === "positive") {
                            chcolor = "#b00";
                            amcolor = "#b00";
                            crcolor = "#b00";
                            umfcolor = "#b00";
                          }
                          if (sample.result && sample.result["ch"])
                            chcolor = "white";
                          if (sample.result && sample.result["am"])
                            amcolor = "white";
                          if (sample.result && sample.result["cr"])
                            crcolor = "white";
                          if (sample.result && sample.result["umf"])
                            umfcolor = "white";
                          let nocolor = "#ddd";
                          let nodivcolor = "#fff";
                          if (result === "negative") {
                            nocolor = "green";
                            nodivcolor = "lightgreen";
                          }
                          let asbdivcolor = "#fff";
                          if (result === "positive") asbdivcolor = "red";
                          return (
                            <ListItem
                              dense
                              className={classes.hoverItem}
                              key={
                                sample.jobnumber +
                                sample.sampleNumber +
                                sample.description
                              }
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
                                        src={sample.path_remote}
                                        width={200}
                                      />
                                    )}
                                  </Popup>

                                  <Popup
                                    trigger={
                                      <Edit
                                        style={{ fontSize: 24, margin: 10 }}
                                      />
                                    }
                                    position="right center"
                                    onClose={() =>
                                      this.onSubmitEdit(sample.uid)
                                    }
                                  >
                                    <Paper
                                      style={{
                                        height: 200,
                                        width: 480,
                                        padding: 20,
                                        display: "flex",
                                        flexDirection: "column"
                                      }}
                                    >
                                      <TextField
                                        id="sampleNumber"
                                        label="Sample number"
                                        defaultValue={sample.sampleNumber}
                                        onChange={e =>
                                          this.onEdit(e.target, sample.uid)
                                        }
                                      />
                                      <TextField
                                        id="description"
                                        label="Description"
                                        defaultValue={sample.description}
                                        onChange={e =>
                                          this.onEdit(e.target, sample.uid)
                                        }
                                      />
                                      <TextField
                                        id="material"
                                        label="Material"
                                        defaultValue={sample.material}
                                        onChange={e =>
                                          this.onEdit(e.target, sample.uid)
                                        }
                                      />
                                    </Paper>
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
                                  {sample.description + ", " + sample.material}
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
                                      this.receiveSample(
                                        sample.uid,
                                        sample.receivedbylab
                                      );
                                    }}
                                    disabled={this.state.isLoading}
                                  >
                                    <Inbox
                                      style={{
                                        fontSize: 24,
                                        margin: 10,
                                        color: receivedcolor
                                      }}
                                    />
                                  </IconButton>
                                  <div
                                    style={{
                                      backgroundColor: asbdivcolor,
                                      borderRadius: 5
                                    }}
                                  >
                                    <Button
                                      variant="outlined"
                                      style={{ margin: 5, color: chcolor }}
                                      onClick={() => {
                                        this.toggleResult(
                                          sample.uid,
                                          "ch",
                                          sample.result,
                                          sample.reported
                                        );
                                      }}
                                    >
                                      CH
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{ margin: 5, color: amcolor }}
                                      onClick={() => {
                                        this.toggleResult(
                                          sample.uid,
                                          "am",
                                          sample.result,
                                          sample.reported
                                        );
                                      }}
                                    >
                                      AM
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{ margin: 5, color: crcolor }}
                                      onClick={() => {
                                        this.toggleResult(
                                          sample.uid,
                                          "cr",
                                          sample.result,
                                          sample.reported
                                        );
                                      }}
                                    >
                                      CR
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{ margin: 5, color: umfcolor }}
                                      onClick={() => {
                                        this.toggleResult(
                                          sample.uid,
                                          "umf",
                                          sample.result,
                                          sample.reported
                                        );
                                      }}
                                    >
                                      UMF
                                    </Button>
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
                                      style={{ margin: 5, color: nocolor }}
                                      onClick={() => {
                                        this.toggleResult(
                                          sample.uid,
                                          "no",
                                          sample.result,
                                          sample.reported
                                        );
                                      }}
                                    >
                                      NO
                                    </Button>
                                  </div>
                                  <IconButton
                                    onClick={() => {
                                      this.reportSample(
                                        sample.uid,
                                        sample.reported
                                      );
                                    }}
                                    disabled={this.state.isLoading}
                                  >
                                    <CheckCircleOutline
                                      style={{
                                        fontSize: 24,
                                        margin: 10,
                                        color: reportcolor
                                      }}
                                    />
                                  </IconButton>
                                </div>
                              </div>
                            </ListItem>
                          );
                        })}
                      </List>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                );
              })}
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosLab)
);
