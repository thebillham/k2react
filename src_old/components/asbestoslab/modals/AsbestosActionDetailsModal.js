import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import classNames from 'classnames';
import { connect } from "react-redux";
import store from "../../../store";
import { ASBESTOS_ACTION_DETAILS } from "../../../constants/modal-types";
import { firestore, cocsRef, } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import FormHelperText from "@material-ui/core/FormHelperText";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import CardActions from "@material-ui/core/CardActions";
import Dialog from "@material-ui/core/Dialog";
import InputLabel from "@material-ui/core/InputLabel";
import Select from 'react-select';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import ReceiveIcon from "@material-ui/icons/Inbox";
import StartAnalysisIcon from "@material-ui/icons/Colorize";
import CancelActionIcon from "@material-ui/icons/Block";
import ProceedActionIcon from "@material-ui/icons/Forward";
import UnresolvedActionIcon from "@material-ui/icons/Report";
import VerifyIcon from "@material-ui/icons/CheckCircleOutline";
import WAIcon from "@material-ui/icons/GroupWork";
import {
  DateTimePicker,
} from "@material-ui/pickers";
import { dateOf, writeDates, } from "../../../actions/helpers";
import { toggleDoNotRender, } from "../../../actions/display";
import { hideModalSecondary, hideModal, } from "../../../actions/modal";
import {
  writeDescription,
  receiveSample,
  receiveSamples,
  startAnalysis,
  startAnalyses,
  getWATotalDetails,
  verifySample,
  verifySamples,
  verifySubsample,
  verifySubsamples,
  writeShorthandResult,
  writeCocDescription,
  getBasicResult,
  checkTestCertificateIssue,
  issueTestCertificate,
  getPersonnel,
  getWASubsampleList,
  changeActionDetails,
} from "../../../actions/asbestosLab";
import _ from "lodash";
import moment from "moment";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    modalType: state.modal.modalTypeSecondary,
    modalProps: state.modal.modalPropsSecondary,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModalSecondary: () => dispatch(hideModalSecondary()),
    hideModal: () => dispatch(hideModal()),
  };
};

class AsbestosActionDetailsModal extends React.Component {
  state = {
    date: null,
    user: null,
  };

  render() {
    const { classes, modalProps, modalType, } = this.props;
    const names = Object.values(this.props.staff).filter(e => e.auth && e.auth['Asbestos Bulk Analysis']).sort((a, b) => a.name.localeCompare(b.name)).map(e => ({ value: e.uid, label: e.name }));

    return (
      modalType === ASBESTOS_ACTION_DETAILS ? <Dialog
        open={modalType === ASBESTOS_ACTION_DETAILS}
        onClose={() => {
          this.props.hideModalSecondary();
          this.props.hideModal();
        }}
        classes={{ paper: classes.minHeightDialog40 }}
        maxWidth="xs"
        fullWidth={true}
        disableBackdropClick={true}
        scroll="paper"
      >
        <DialogTitle>{modalProps.title ? modalProps.title : ''}</DialogTitle>
        <DialogContent>
          <DateTimePicker
            value={this.state.date ? this.state.date : new Date()}
            autoOk
            className={classes.formSelectDateTime}
            format="D MMMM YYYY, h:mma"
            clearable
            label="Action Date"
            onChange={date => this.setState({ date })}
          />
          <InputLabel className={classes.marginTopSmall}>Action By</InputLabel>
          <Select
            className={classes.selectTight}
            value={this.state.user ? {value: this.state.user.uid, label: this.state.user.name} : null}
            options={names}
            onChange={e => this.setState({ user:  {uid: e.value, name: e.label}})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.hideModalSecondary} color="secondary">
            Cancel
          </Button> :
          <Button onClick={() => {
            changeActionDetails(modalProps.job, modalProps.samples, modalProps.field, this.state, this.props.me);
            this.props.hideModalSecondary();
            this.props.hideModal();
          }} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog> : null
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosActionDetailsModal)
);
