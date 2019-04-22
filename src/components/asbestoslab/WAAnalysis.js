import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../config/styles";
import { connect } from "react-redux";
import store from "../../store";
import { WAANALYSIS } from "../../constants/modal-types";
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
import { hideModal, handleModalChange } from "../../actions/modal";
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

class WAAnalysis extends React.Component {
  state = {
    sample: {}
  };

  componentWillMount = () => {
    this.setState({
      sample: this.props.modalProps.sample
    });
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    const { sample } = this.state;
    return (
      <Dialog
        open={modalType === WAANALYSIS}
        onClose={() => this.props.hideModal()}
        maxWidth="lg"
        fullWidth={true}
      >
        <DialogTitle>{modalProps.title}</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={1}>
              Weight Received
            </Grid>
            <Grid item xs={1}>
              Weight Analysed
            </Grid>
            <Grid item xs={1}>
              Fibres Detected
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              cocsRef
                .doc(modalProps.docid)
                .collection("samples")
                .doc(sample.uid)
                .set(sample);
            }}
            color="primary"
          >
            Submit
          </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WAAnalysis)
);
