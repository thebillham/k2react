import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { UPDATE_CERTIFICATE_VERSION } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import { issueLabReport } from "../../../actions/asbestosLab";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import { hideModal, handleModalChange } from "../../../actions/modal";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    )
  };
};

class UpdateCertificateVersionModal extends React.Component {
  render() {
    const { classes, modalProps, modalType } = this.props;
    console.log(modalProps);
    return (
      <Dialog
        open={modalType === UPDATE_CERTIFICATE_VERSION}
        onClose={this.props.hideModal}
      >
        <DialogTitle>Issue New Version</DialogTitle>
        <DialogContent>
          Please detail the changes made since the last issue.
          <form>
            <FormGroup>
              <TextField
                id="changes"
                label="Version Changes"
                value={this.props.doc && this.props.doc.changes}
                multiline
                rows={5}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />
            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              issueLabReport(modalProps.job, modalProps.samples, modalProps.version, modalProps.doc.changes, this.props.staff, this.props.me);
              this.props.hideModal();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(UpdateCertificateVersionModal)
);
