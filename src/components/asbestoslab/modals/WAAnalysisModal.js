import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { WAANALYSIS } from "../../../constants/modal-types";
import { asbestosSamplesRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
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
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    )
  };
};

class WAAnalysisModal extends React.Component {
  state = {
    sample: {}
  };

  componentWillMount = () => {
    this.setState({
      sample: {}
    });
  };

  render() {
    const { classes, modalProps, modalType, doc } = this.props;
    const { sample } = this.state;

    let strataWeightTotal = 0;
    if (sample !== undefined && modalProps && modalProps.sample) {
      if (sample.waGt7mmStrataWeight) strataWeightTotal += parseFloat(sample.waGt7mmStrataWeight);
        else strataWeightTotal += parseFloat(modalProps.sample.waGt7mmStrataWeight);
      if (sample.wa27mmStrataWeight) strataWeightTotal += parseFloat(sample.wa27mmStrataWeight);
        else strataWeightTotal += parseFloat(modalProps.sample.wa27mmStrataWeight);
      if (sample.waLt2mmStrataWeight) strataWeightTotal += parseFloat(sample.waLt2mmStrataWeight);
        else strataWeightTotal += parseFloat(modalProps.sample.waLt2mmStrataWeight);
    }

    let suspectMaterialTotal = 0;
    if (sample !== undefined && modalProps && modalProps.sample) {
      if (sample.waGt7mmSuspectMaterial) suspectMaterialTotal += parseFloat(sample.waGt7mmSuspectMaterial);
        else suspectMaterialTotal += parseFloat(modalProps.sample.waGt7mmSuspectMaterial);
      if (sample.wa27mmSuspectMaterial) suspectMaterialTotal += parseFloat(sample.wa27mmSuspectMaterial);
        else suspectMaterialTotal += parseFloat(modalProps.sample.wa27mmSuspectMaterial);
      if (sample.waLt2mmSuspectMaterial) suspectMaterialTotal += parseFloat(sample.waLt2mmSuspectMaterial);
        else suspectMaterialTotal += parseFloat(modalProps.sample.waLt2mmSuspectMaterial);
    }

    let totalWeight = 0;
    if (sample !== undefined && modalProps && modalProps.sample) {
      if (sample.weightAnalysed) totalWeight = parseFloat(sample.weightAnalysed);
        else totalWeight = parseFloat(modalProps.sample.weightAnalysed);
    }

    return (
      <Dialog
        open={modalType === WAANALYSIS}
        onClose={() => this.props.hideModal()}
        maxWidth="xl"
        fullWidth={true}
      >
        <DialogTitle>Edit WA Analysis</DialogTitle>
        <DialogContent>
          <Grid container spacing={8}>
            <Grid item xs={4}>
              <TextField
                id="weightReceived"
                label="Weight Received"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.weightReceived}
                helperText="Record the weight as received (e.g. before any conditioning)."
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      weightReceived: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="weightAnalysed"
                label="Weight Analysed"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.weightAnalysed}
                helperText="Record the weight analysed (e.g. after conditioning such as furnacing)."
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      weightAnalysed: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="waFibresDetected"
                label="Fibres Detected"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.waFibresDetected}
                helperText=""
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      waFibresDetected: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={4} style={{ fontWeight: 'bold'}}>
              <div>{'>7mm'}</div>
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="waGt7mmStrataWeight"
                label="Strata Weight"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.waGt7mmStrataWeight}
                helperText=""
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      waGt7mmStrataWeight: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="waGt7mmSuspectMaterial"
                label="Suspect Material"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.waGt7mmSuspectMaterial}
                helperText=""
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      waGt7mmSuspectMaterial: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={4} style={{ fontWeight: 'bold'}}>
              <div>2-7mm</div>
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="wa27mmStrataWeight"
                label="Strata Weight"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.wa27mmStrataWeight}
                helperText=""
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      wa27mmStrataWeight: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="wa27mmSuspectMaterial"
                label="Suspect Material"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.wa27mmSuspectMaterial}
                helperText=""
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      wa27mmSuspectMaterial: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={4} style={{ fontWeight: 'bold'}}>
              {'<2mm'}
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="waLt2mmStrataWeight"
                label="Strata Weight"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.waLt2mmStrataWeight}
                helperText=""
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      waLt2mmStrataWeight: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="waLt2mmSuspectMaterial"
                label="Suspect Material"
                style={{ width: '100%' }}
                defaultValue={modalProps && modalProps.sample && modalProps.sample.waLt2mmSuspectMaterial}
                helperText=""
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      waLt2mmSuspectMaterial: e.target.value,
                    }
                  });
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={4} style={{ fontWeight: 'bold'}}>
              <div>Total</div>
            </Grid>
            <Grid item xs={4} style={{ fontWeight: 100}}>
              {strataWeightTotal.toPrecision(5)}
            </Grid>
            <Grid item xs={4} style={{ fontWeight: 100}}>
              {suspectMaterialTotal.toPrecision(5)}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (strataWeightTotal === totalWeight || window.confirm('The total weight does not match the total of all strata weights. Continue?')) {
                asbestosSamplesRef
                  .doc(modalProps.sample.uid)
                  .update(sample);
                this.props.hideModal();
              }
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
  )(WAAnalysisModal)
);
