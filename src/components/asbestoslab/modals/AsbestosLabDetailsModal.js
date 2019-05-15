import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../config/styles";
import { connect } from "react-redux";
import store from "../../store";
import { ASBESTOSLABDETAILS } from "../../constants/modal-types";
import { cocsRef } from "../../config/firebase";
import "../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import UploadIcon from "@material-ui/icons/CloudUpload";
import { hideModal, handleSampleChange } from "../../actions/modal";
import {
  asbestosSamplesRef
} from "../../config/firebase";
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
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
  };
};

class AsbestosLabDetailsModal extends React.Component {
  state = {
    sample: {},
  }
  render() {
    const { classes, modalProps, modalType } = this.props;
    const { sample } = this.state;
    return (
      <div>
      {modalProps.sample &&
      <Dialog
        open={modalType === ASBESTOSLABDETAILS}
        onClose={() => this.props.hideModal()}
        maxWidth="xs"
        fullWidth={true}
      >
        <DialogTitle>Sample {modalProps.sample.jobNumber}-{modalProps.sample.sampleNumber} Details</DialogTitle>
        <DialogContent>
          <Grid container>
          <Grid item xs={6}>
            Received Weight
          </Grid>
            <Grid item xs={4}>
              <TextField
                id='receivedWeight'
                style={{ width: '100%' }}
                keyboardType='decimal-pad'
                value={modalProps.sample.receivedWeight ? modalProps.sample.receivedWeight : ''}
                onChange={e => {
                  this.props.handleSampleChange(modalProps.sample.sampleNumber - 1, 'receivedWeight', e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={2}>
              grams
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6}>
              Dry Weight
            </Grid>
              <Grid item xs={4}>
                <TextField
                  id='dryWeight'
                  style={{ width: '100%' }}
                  keyboardType='decimal-pad'
                  value={modalProps.sample.dryWeight ? modalProps.sample.dryWeight : ''}
                  onChange={e => {
                    this.props.handleSampleChange(modalProps.sample.sampleNumber - 1, 'dryWeight', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                grams
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              asbestosSamplesRef
                .doc(modalProps.sample.uid)
                .update(modalProps.sample);
              this.props.hideModal();
            }}
            color="primary"
          >
            Submit
          </Button>
          }
        </DialogActions>
      </Dialog>}
      </div>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosLabDetailsModal)
);
