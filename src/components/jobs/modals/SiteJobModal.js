import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { SITE_JOB } from "../../../constants/modal-types";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import SuggestionField from "../../../widgets/SuggestionField";
import { hideModal, resetModal, setModalError } from "../../../actions/modal";
import {
  fetchSites,
  getDetailedWFMJob,
  resetWfmJob,
} from "../../../actions/jobs";

import "../../../config/geosuggest.css";
//
// const siteTypes = [
//   {
//     value: "residential",
//     label: "Residential",
//   },
//   {
//     value: "industrial",
//     label: "Industrial",
//   },
//   {
//     value: "commercial",
//     label: "Commercial",
//   },
//   {
//     value: "public",
//     label: "Public Building",
//   },
//   {
//     value: "other",
//     label: "Other Building",
//   },
//   {
//     value: "land",
//     label: "Land/Soil",
//   },
//   {
//     value: "substation",
//     label: "Substation",
//   },
//   {
//     value: "train",
//     label: "Train",
//   },
//   {
//     value: "ship",
//     label: "Ship",
//   },
//   {
//     value: "vehicle",
//     label: "Other Vehicle",
//   },
// ];
//
// const jobTypes = [
//   "Stack",
//   "Workplace",
//   "Noise",
//   "Asbestos",
//   "Methamphetamine",
//   "Biological",
//   "Other",
// ];

const mapStateToProps = (state) => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    wfmAccessToken: state.local.wfmAccessToken,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSites: (update) => dispatch(fetchSites(update)),
    hideModal: () => dispatch(hideModal()),
    setModalError: (error) => dispatch(setModalError(error)),
    getDetailedWFMJob: (info) => dispatch(getDetailedWFMJob(info)),
    resetWfmJob: () => dispatch(resetWfmJob()),
    resetModal: () => dispatch(resetModal()),
  };
};

class SiteJobModal extends React.Component {
  state = {
    jobNumber: "",
  };

  wfmSync = () => {
    let jobNumber = this.state.jobNumber;
    let jobDescription = this.state.jobDescription;
    if (!jobDescription) {
      this.props.setModalError("Enter a job description");
    } else if (!jobNumber) {
      this.props.setModalError("Enter the job number to sync with WorkflowMax");
    } else if (jobNumber.substring(0, 2).toUpperCase() !== "AS") {
      this.props.setModalError('Asbestos job numbers must begin with "AS"');
    } else {
      this.props.resetModal();
      this.props.getDetailedWFMJob({
        jobNumber,
        createUid: true,
        setUpJob: true,
        site: this.props.doc.site,
        jobDescription,
        accessToken: this.props.wfmAccessToken,
        refreshToken: this.props.me.refreshToken,
      });
    }
  };

  render() {
    const { modalProps, classes } = this.props;
    return (
      <Dialog
        open={this.props.modalType === SITE_JOB}
        onClose={this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add Job to Site"}
        </DialogTitle>
        <DialogContent>
          <InputLabel>Job Description</InputLabel>
          <SuggestionField
            that={this}
            suggestions="siteJobDescriptions"
            defaultValue={
              this.state.jobDescription ? this.state.jobDescription : ""
            }
            onModify={(value) => this.setState({ jobDescription: value })}
          />
          <FormControl>
            <InputLabel shrink>Job Number</InputLabel>
            <Input
              id="jobNumber"
              className={classes.bigInput}
              value={this.state.jobNumber}
              onChange={(e) => {
                this.setState({
                  jobNumber: e.target.value.replace(/\s/g, "").toUpperCase(),
                });
              }}
            />
          </FormControl>
          {modalProps.error && (
            <div className={classes.informationBox}>{modalProps.error}</div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.resetModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.wfmSync} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(SiteJobModal)
);
