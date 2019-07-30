import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { COC_RECEIVE } from "../../../constants/modal-types";
import { asbestosSamplesRef, } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import ReceiveIcon from "@material-ui/icons/Inbox";
import { hideModal, handleModalChange } from "../../../actions/modal";
import { addLog } from "../../../actions/local";
import { writeDescription } from "../../../actions/asbestosLab";
import _ from "lodash";
import moment from 'moment';

const mapStateToProps = state => {
  return {
    me: state.local.me,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    samples: state.asbestosLab.samples,
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

class AsbestosReceiveSamplesModal extends React.Component {
  state = {
    samples: {

    }
  };

  handleEnter = () => {
    let sampleMap = Object.values(this.props.samples[this.props.modalProps.job.uid]).filter(sample => sample.deleted === false).map(sample => ({
        uid: sample.uid,
        number: sample.sampleNumber,
        description: writeDescription(sample),
        receivedOriginally: sample.receivedDate !== undefined,
        receivedNow: sample.receivedDate !== undefined,
        receivedDate: sample.receivedDate,
        receivedBy: sample.receivedUser,
    }));
    this.setState({
      samples: sampleMap,
    });
    console.log(this.state.samples);
  };

  submit = () => {
    let logDesc = '';
    let receivedArray = [];
    let unreceivedArray = [];
    Object.values(this.state.samples).forEach(sample => {
      if (sample.receivedOriginally !== sample.receivedNow) {
        if (sample.receivedNow === false) {
          // Unreceived
          asbestosSamplesRef.doc(sample.uid).update({receivedDate: null, receivedBy: null,});
          let log = {
            type: 'Receive',
            log: `Sample ${sample.sampleNumber} removed as received by ${this.props.me.name}.`,
            sample: sample.uid,
            chainOfCustody: this.props.modalProps.job.uid,
          }
          addLog("asbestosLab", log, this.props.me);
        } else {
          asbestosSamplesRef.doc(sample.uid).update({receivedDate: sample.receivedDate, receivedBy: sample.receivedBy,});
          let log = {
            type: 'Receive',
            log: `Sample ${sample.sampleNumber} received by ${this.props.me.name}.`,
            sample: sample.uid,
            chainOfCustody: this.props.modalProps.job.uid,
          }
          addLog("asbestosLab", log, this.props.me);
        }
      }
    });
  }

  render() {
    const { classes, modalProps, modalType, } = this.props;
    console.log(this.state.samples);
    return (
      <Dialog
        open={modalType === COC_RECEIVE}
        onClose={this.props.hideModal}
        maxWidth="sm"
        fullWidth={true}
        onEnter={this.handleEnter}
      >
        <DialogTitle>{modalProps.title ? modalProps.title : 'Receive Samples'}</DialogTitle>
        <DialogContent>
          {Object.values(this.state.samples).map(sample => (
            <div key={sample.sampleNumber}>
              <div className={classes.flexRowHover}>
                <div>
                  <IconButton onClick={() => this.handleReceiveClick(sample)}>
                    <ReceiveIcon className={sample.receivedDate ? classes.iconRegularGreen : classes.iconRegular}/>
                  </IconButton>
                </div>
                <div className={classes.circleShaded}>
                  {sample.number}
                </div>
                <div>{sample.description}</div>
              </div>
            </div>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.submit();
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

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosReceiveSamplesModal)
);
