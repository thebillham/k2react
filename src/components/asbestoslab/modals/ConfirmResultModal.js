import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { CONFIRM_RESULT } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { hideModal, handleModalChange } from "../../../actions/modal";
import { updateResultMap, getSampleColours, setAnalyst, } from "../../../actions/asbestosLab";
import { AsbestosClickyBasic, } from '../../../widgets/ButtonWidgets';
import _ from "lodash";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    analyst: state.asbestosLab.analyst,
    bulkAnalysts: state.asbestosLab.bulkAnalysts,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    setAnalyst: analyst => dispatch(setAnalyst(analyst)),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    )
  };
};

class ConfirmResultModal extends React.Component {
  state = {
    result: {
      ch: false,
      am: false,
      cr: false,
      no: false,
      umf: false,
      org: false,
      smf: false,
    },
    notes: '',
  };

  toggleResult = result => {
    this.setState({
      result: updateResultMap(result, this.state.result),
    });
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    let colours = getSampleColours(this.state);
    // console.log(modalProps);
    return (
      <Dialog
        open={modalType === CONFIRM_RESULT}
        onClose={this.props.hideModal}
      >
        <DialogTitle>{modalProps.title ? modalProps.title : 'Confirm Result'}</DialogTitle>
        <DialogContent>
          <FormControl style={{ width: 200, marginBottom: 19, }}>
            <InputLabel shrink>Analyst</InputLabel>
            <Select
              value={this.props.analyst}
              onChange={e => this.props.setAnalyst(e.target.value)}
              input={<Input name="analyst" id="analyst" />}
            >
              {this.props.bulkAnalysts.map(analyst => {
                return (
                  <option key={analyst.uid} value={analyst.name}>
                    {analyst.name}
                  </option>
                );
              })}
            </Select>
          </FormControl>
          <div style={{ flexDirection: 'row', display: 'flex', width: '100%'}}>
            {AsbestosClickyBasic(colours.chColor, colours.chDivColor, 'Chrysotile (white) asbestos detected', 'CH',
            () => this.toggleResult('ch'))}
            {AsbestosClickyBasic(colours.amColor, colours.amDivColor, 'Amosite (brown) asbestos detected', 'AM',
            () => this.toggleResult("am"))}
            {AsbestosClickyBasic(colours.crColor, colours.crDivColor, 'Crocidolite (blue) asbestos detected', 'CR',
            () => this.toggleResult("cr"))}
            {AsbestosClickyBasic(colours.umfColor, colours.umfDivColor, 'Unidentified mineral fibres detected', 'UMF',
            () => this.toggleResult("umf"))}
            <div style={{ width: 30 }} />
            {AsbestosClickyBasic(colours.noColor, colours.noDivColor, 'No asbestos detected', 'NO',
            () => this.toggleResult("no"))}
            <div style={{ width: 30 }} />
            {AsbestosClickyBasic(colours.orgColor, colours.orgDivColor, 'Organic fibres detected', 'ORG',
            () => this.toggleResult("org"))}
            {AsbestosClickyBasic(colours.smfColor, colours.smfDivColor, 'Synthetic mineral fibres detected', 'SMF',
            () => this.toggleResult("smf"))}
          </div>
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
              // issueLabReport(modalProps.job, modalProps.samples, modalProps.version, modalProps.doc.changes, this.props.staff, this.props.me);
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
  )(ConfirmResultModal)
);
