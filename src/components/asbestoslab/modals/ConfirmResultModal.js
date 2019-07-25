import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { CONFIRM_RESULT } from "../../../constants/modal-types";
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
import Input from "@material-ui/core/Input";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { hideModal, handleModalChange } from "../../../actions/modal";
import { addLog } from "../../../actions/local";
import { updateResultMap, getSampleColors, setAnalyst, getBasicResult, } from "../../../actions/asbestosLab";
import { AsbestosClickyBasic, } from '../../../widgets/ButtonWidgets';
import _ from "lodash";
import moment from 'moment';

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    analyst: state.asbestosLab.analyst,
    bulkAnalysts: state.asbestosLab.bulkAnalysts,
    sessionID: state.asbestosLab.sessionID,
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

const initConfirm = {
  result: {
    ch: false,
    am: false,
    cr: false,
    no: false,
    umf: false,
    org: false,
    smf: false,
  },
  comments: '',
}

class ConfirmResultModal extends React.Component {
  state = {
    totalNum: 1,
    1: initConfirm,
  };

  handleEnter = () => {
    if (this.props.modalProps.sample && this.props.modalProps.sample.confirm !== undefined) {
      let confirm = this.props.modalProps.sample.confirm;
      let totalNum = 1;
      if (confirm.totalNum !== undefined) totalNum += 1;
      [...Array(totalNum).keys()].forEach(num => {
        if (confirm[num+1] === undefined) {
          confirm[num+1] = initConfirm;
        }
      });
      console.log(confirm);
      this.setState({
        ...confirm
      });
    } else {
      this.setState({
        totalNum: 1,
        1: {
          ...initConfirm,
        },
      });
    }
  };

  toggleResult = (result, num) => {
    let sample = this.props.modalProps.sample;
    if (this.state[num].sessionID !== undefined && this.state[num].sessionID !== this.props.sessionID) {
      if (window.confirm("This sample has already been analysed. Do you wish to override the result?")) {
        let log = {
          type: "Confirm",
          log: `Previous confirmation analysis of sample ${sample.sampleNumber} (${
            sample.description
          } ${sample.material}) overridden.`,
          sample: sample.uid,
          chainOfCustody: this.props.modalProps.jobUid,
        };
        addLog("asbestosLab", log, this.props.me);
      } else return;
    }
    this.setState({
      [num]: {
        ...this.state[num],
        result: updateResultMap(result, this.state[num].result),
        sessionID: this.props.sessionID,
        date: new Date(),
        modified: true,
      }
    });
  };

  setAnalyst = (analyst, num) => {
    this.setState({
      [num]: {
        ...this.state[num],
        analyst,
        modified: true,
      }
    });
  }

  setComment = (comment, num) => {
    this.setState({
      [num]: {
        ...this.state[num],
        comment,
        modified: true,
      }
    });
  }

  deleteAnalysis = (num) => {
    if (window.confirm('Are you sure you wish to delete this analysis? This cannot be undone.'))
      this.setState({
        [num]: {
          ...this.state[num],
          deleted: true,
        }
      });
  }

  addAnalysis = () => {
    let num = this.state.totalNum ? this.state.totalNum : 1;
    num += 1;
    let layer = this.state[num];
    if (layer === undefined) layer = initConfirm;
    this.setState({
      totalNum: num,
      [num]: layer,
    });
  };

  submitConfirmation = () => {
    let sample = this.props.modalProps.sample;
    [...Array(this.state.totalNum ? this.state.totalNum : 1).keys()].map(num => {
      if (!this.state[num+1].deleted) {
        if (this.state[num+1].analyst === undefined) {
          window.alert('Check all analyses have an analyst set.');
          return;
        }
        if (getBasicResult(this.state[num+1]) === 'none') {
          window.alert('Check all analyses have an asbestos result reported.');
          return;
        }
        if (this.state[num+1].modified === true) {
          let log = {
            type: 'Confirm',
            log: `Confirmation analysis by ${this.state[num+1].analyst} of sample ${sample.sampleNumber} added or modified.`,
            sample: this.props.modalProps.sample.uid,
            chainOfCustody: this.props.modalProps.jobUid,
          }
          addLog("asbestosLab", log, this.props.me);
        }
      }
    });
    asbestosSamplesRef.doc(this.props.modalProps.sample.uid).update({confirm: this.state});
  }

  render() {
    const { classes, modalProps, modalType } = this.props;
    // console.log(modalProps);
    // console.log(this.state);
    return (
      <Dialog
        open={modalType === CONFIRM_RESULT}
        onClose={this.props.hideModal}
        onEntered={this.handleEnter}
      >
        <DialogTitle>{modalProps.title ? modalProps.title : 'Confirm Result'}</DialogTitle>
        <DialogContent>
          {[...Array(this.state.totalNum ? this.state.totalNum : 1).keys()].map(num => {
            if (this.state[num+1].deleted !== true) return this.confirmRow(num+1);
          })}
          <div className={this.props.classes.subHeading} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
            <Button variant='outlined' aria-label='add' onClick={this.addAnalysis}><AddIcon /> Add Analysis</Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.submitConfirmation();
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

  confirmRow = (num) => {
    console.log(this.state);
    console.log(num);
    let colors = getSampleColors(this.state[num]);
    let resultDate = 'N/A';
    let prevAnalyst = this.props.modalProps.sample && this.props.modalProps.sample.analyst ? this.props.modalProps.sample.analyst : null;
    if (this.state[num].date !== undefined) {
      if (this.state[num].date instanceof Date) resultDate = this.state[num].date;
      else resultDate = this.state[num].date.toDate();
    }
    return(<div key={num}>
      <div style={{ flexDirection: 'row', display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
        <FormControl style={{ width: 200, marginBottom: 19, }}>
          <InputLabel shrink>Analyst</InputLabel>
          <Select
            value={this.state[num].analyst ? this.state[num].analyst : ''}
            onChange={e => this.setAnalyst(e.target.value, num)}
            input={<Input name="analyst" id="analyst" />}
          >
            {this.props.bulkAnalysts.filter(analyst => analyst.name !== prevAnalyst).map(analyst => {
              return (
                <option key={analyst.uid} value={analyst.name}>
                  {analyst.name}
                </option>
              );
            })}
          </Select>
        </FormControl>
        <div>
          <b>Date:</b> {this.state[num].date ? moment(resultDate).format('D MMM YYYY, h:mma') : 'N/A'}
        </div>
        <Button variant='outlined' aria-label='remove' onClick={() => this.deleteAnalysis(num)}><RemoveIcon /> Remove Analysis</Button>
      </div>
      <div style={{ flexDirection: 'row', display: 'flex', width: '100%'}}>
        {AsbestosClickyBasic(colors.chColor, colors.chDivColor, 'Chrysotile (white) asbestos detected', 'CH',
        () => this.toggleResult('ch', num))}
        {AsbestosClickyBasic(colors.amColor, colors.amDivColor, 'Amosite (brown) asbestos detected', 'AM',
        () => this.toggleResult("am", num))}
        {AsbestosClickyBasic(colors.crColor, colors.crDivColor, 'Crocidolite (blue) asbestos detected', 'CR',
        () => this.toggleResult("cr", num))}
        {AsbestosClickyBasic(colors.umfColor, colors.umfDivColor, 'Unidentified mineral fibres detected', 'UMF',
        () => this.toggleResult("umf", num))}
        <div style={{ width: 30 }} />
        {AsbestosClickyBasic(colors.noColor, colors.noDivColor, 'No asbestos detected', 'NO',
        () => this.toggleResult("no", num))}
        <div style={{ width: 30 }} />
        {AsbestosClickyBasic(colors.orgColor, colors.orgDivColor, 'Organic fibres detected', 'ORG',
        () => this.toggleResult("org", num))}
        {AsbestosClickyBasic(colors.smfColor, colors.smfDivColor, 'Synthetic mineral fibres detected', 'SMF',
        () => this.toggleResult("smf", num))}
      </div>
      <TextField
        id="comments"
        label="Comments"
        value={this.state[num].comment ? this.state[num].comment : ''}
        multiline
        rows={5}
        className={this.props.classes.dialogField}
        onChange={e => {
          this.setComment(e.target.value, num);
        }}
      />
    </div>);
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ConfirmResultModal)
);
