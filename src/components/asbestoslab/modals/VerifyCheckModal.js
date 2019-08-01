import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { VERIFY_ISSUES_ASBESTOS } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import { hideModal, handleModalChange } from "../../../actions/modal";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
  };
};

class VerifyCheckModal extends React.Component {
  state = {
    fileType: "doc",
    template: "single",
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    return (modalType === VERIFY_ISSUES_ASBESTOS &&
      <Dialog
        open={modalType === VERIFY_ISSUES_ASBESTOS}
        onClose={this.props.hideModal}
      >
        <DialogTitle>Check Issues</DialogTitle>
        <DialogContent>
          <div>Please check the following issues before verifying this sample:</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              modalProps.verify();
              this.props.hideModal();
            }}
            color="primary"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(VerifyCheckModal)
);
