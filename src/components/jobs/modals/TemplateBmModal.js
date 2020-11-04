import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { TEMPLATE_BUILDING_MATERIAL } from "../../../constants/modal-types";
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

import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  resetModal,
  onUploadFile,
  setModalError,
} from "../../../actions/modal";
import { fetchSites } from "../../../actions/jobs";
import _ from "lodash";

import "../../../config/geosuggest.css";

const mapStateToProps = (state) => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSites: (update) => dispatch(fetchSites(update)),
    hideModal: () => dispatch(hideModal()),
    setModalError: (e) => dispatch(setModalError(e)),
    resetModal: () => dispatch(resetModal()),
    onUploadFile: (file, pathRef, prefix, imageQuality) =>
      dispatch(onUploadFile(file, pathRef, prefix, imageQuality)),
    handleModalChange: _.debounce(
      (target) => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: (target) => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
  };
};

class TemplateBmModal extends React.Component {
  state = {
    jobNumber: "",
  };

  render() {
    const { modalProps, classes } = this.props;
    return (
      <Dialog
        open={this.props.modalType === TEMPLATE_BUILDING_MATERIAL}
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
  connect(mapStateToProps, mapDispatchToProps)(TemplateBmModal)
);
