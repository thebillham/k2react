import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { UPDATE_DATA } from "../../constants/modal-types";
import "../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { CSVLink } from "react-csv";

import {
  fetchDocuments,
  fetchMethods,
  fetchNotices,
  fetchQuestions,
  fetchQuizzes,
  fetchStaff,
  fetchTools,
  fetchTrainingPaths,
  fetchVehicles,
} from "../../actions/local";
import { analyseJobHistory } from "../../actions/jobs";
import { grabJobData, grabLabData } from "../../actions/temp";
import { fetchCocs } from "../../actions/asbestosLab";
import { hideModal } from "../../actions/modal";

const mapStateToProps = (state) => {
  return {
    modalType: state.modal.modalType,
    doc: state.modal.modalProps.doc,
    jobData: state.local.jobData,
    labData: state.local.labData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCocs: () => dispatch(fetchCocs(true)),
    fetchDocuments: () => dispatch(fetchDocuments(true)),
    fetchMethods: () => dispatch(fetchMethods(true)),
    fetchNotices: () => dispatch(fetchNotices(true)),
    fetchQuestions: () => dispatch(fetchQuestions(true)),
    fetchQuizzes: () => dispatch(fetchQuizzes(true)),
    fetchStaff: () => dispatch(fetchStaff(true)),
    fetchTools: () => dispatch(fetchTools(true)),
    fetchTrainingPaths: () => dispatch(fetchTrainingPaths(true)),
    fetchVehicles: () => dispatch(fetchVehicles(true)),
    hideModal: (modal) => dispatch(hideModal(modal)),
    grabJobData: () => dispatch(grabJobData()),
    grabLabData: () => dispatch(grabLabData()),
  };
};

class UpdateData extends React.Component {
  render() {
    // if (this.props.jobData.length === 0) this.props.grabJobData();
    // else console.log(this.props.jobData);
    if (this.props.labData.length === 0) this.props.grabLabData();
    else console.log(this.props.labData);
    const updateTypes = [
      {
        event: this.props.fetchCocs,
        title: "Chains of Custody",
      },
      {
        event: this.props.fetchDocuments,
        title: "Documents",
      },
      {
        event: this.props.fetchMethods,
        title: "Methods",
      },
      {
        event: this.props.fetchNotices,
        title: "Notices",
      },
      {
        event: this.props.fetchQuestions,
        title: "Questions",
      },
      {
        event: this.props.fetchQuizzes,
        title: "Quizzes",
      },
      {
        event: this.props.fetchStaff,
        title: "Staff",
      },
      {
        event: this.props.fetchTools,
        title: "Tools",
      },
      {
        event: this.props.fetchTrainingPaths,
        title: "Training Paths",
      },
      {
        event: this.props.fetchVehicles,
        title: "Vehicles",
      },
      {
        event: analyseJobHistory,
        title: "Jobs",
      },
    ];
    return (
      <Dialog
        open={this.props.modalType === UPDATE_DATA}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>Update Cached Data</DialogTitle>
        <DialogContent>
          {updateTypes.map((update) => (
            <span key={update.title}>
              <Button
                variant="outlined"
                color="default"
                className={this.props.classes.marginLeftBottomSmall}
                onClick={update.event}
              >
                {update.title}
              </Button>
            </span>
          ))}

          <CSVLink
            data={this.props.jobData || []}
            filename={`wfm_jobs_data.csv`}
          >
            Download Jobs Data as CSV
          </CSVLink>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(UpdateData)
);
