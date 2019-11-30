import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { CONFIRM_RESULT } from "../../../constants/modal-types";
import { asbestosSamplesRef, asbestosCheckLogRef, } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Select from "react-select";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/RemoveCircle";
import SetIcon from "@material-ui/icons/Publish";
import { hideModal, handleModalChange } from "../../../actions/modal";
import { addLog, } from "../../../actions/local";
import { dateOf, } from '../../../actions/helpers';
import { updateResultMap, getSampleColors, setAnalyst, getBasicResult, getAllConfirmResult, compareAsbestosResult, setCheckAnalysis } from "../../../actions/asbestosLab";
import { AsbButton, } from '../../../widgets/FormWidgets';
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

class ConfirmResultModal extends React.Component {
  initConfirm = {
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
    analyst: this.props.me.name,
  }

  state = {
    totalNum: 1,
    1: this.initConfirm,
  };

  handleEnter = () => {
    if (this.props.modalProps.sample && this.props.modalProps.sample.confirm !== undefined) {
      let confirm = this.props.modalProps.sample.confirm;
      let totalNum = 1;
      if (confirm.totalNum !== undefined) totalNum += 1;
      [...Array(totalNum).keys()].forEach(num => {
        if (confirm[num+1] === undefined) {
          confirm[num+1] = this.initConfirm;
        }
      });
      //console.log(confirm);
      this.setState({
        ...confirm
      });
    } else {
      this.setState({
        totalNum: 1,
        1: {
          ...this.initConfirm,
        },
      });
    }
  };

  resetModal = () => {
    this.setState({
      totalNum: 1,
      1: this.initConfirm,
    })
    this.props.hideModal();
  }

  recordAnalysis = (result, num) => {
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
    let resultMap = updateResultMap(result, this.state[num].result);
    this.setState({
      [num]: {
        ...this.state[num],
        result: resultMap,
        sessionID: this.props.sessionID,
        date: new Date(),
        modified: true,
      }
    });
    let uid = `${sample.uid}-${this.props.sessionID}-${num}`;
    let check = this.state[num];
    asbestosCheckLogRef.doc(uid).set({
      uid: uid,
      result: resultMap,
      sessionID: this.props.sessionID,
      checkRecordedBy: {
        name: this.props.me.name,
        uid: this.props.me.uid,
      },
      checker: check && check.analyst ? check.analyst : null,
      comments: check && check.comments ? check.comments : null,
      checkDate: new Date(),
      cocUid: sample.cocUid,
      weightReceived: sample.weightReceived ? sample.weightReceived : null,
      category: sample.category ? sample.category : 'Other',
      jobNumber: sample.jobNumber ? sample.jobNumber : null,
      material: sample.material ? sample.material : null,
      receivedDate: sample.receivedDate ? sample.receivedDate : new Date(),
      sampleNumber: sample.sampleNumber ? sample.sampleNumber : null,
      genericLocation: sample.genericLocation ? sample.genericLocation : null,
      specificLocation: sample.specificLocation ? sample.specificLocation : null,
      description: sample.description ? sample.description : null,
      sampleUid: sample.uid ? sample.uid : null,
      originalResult: sample.result ? sample.result : null,
      originalAnalysisBy: sample.analyst ? sample.analyst : null,
      originalAnalysisRecordedBy: sample.analysisRecordedBy ? sample.analysisRecordedBy : null,
      originalAnalysisDate: sample.analysisDate ? sample.analysisDate : null,
      confirmResult: compareAsbestosResult(resultMap, sample.result),
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

  setComment = (comments, num) => {
    this.setState({
      [num]: {
        ...this.state[num],
        comments,
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

  setAnalysis = (num) => {
    if (window.confirm('Are you sure you wish to set this analysis as the official result for this sample?')) {
      setCheckAnalysis(this.state[num], this.props.modalProps.sample, {name: this.props.me.name, uid: this.props.me.uid});
      this.setState({
        [num]: {
          ...this.state[num],
          deleted: true,
        }
      });
    }
  }

  addAnalysis = () => {
    let num = this.state.totalNum ? this.state.totalNum : 1;
    num += 1;
    let layer = this.state[num];
    if (layer === undefined) layer = this.initConfirm;
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
    let editor = this.props.me.auth && this.props.me.auth['Asbestos Bulk Analysis'];
    let numChecks = [...Array(this.state.totalNum ? this.state.totalNum : 1).keys()].filter(num => this.state[num+1].deleted !== true && !(this.state[num+1].date === undefined && !editor)).length;
    console.log(numChecks);
    if (modalType === CONFIRM_RESULT) {
      return (modalType === CONFIRM_RESULT &&
        <Dialog
          open={modalType === CONFIRM_RESULT}
          onClose={this.props.hideModal}
          onEntered={this.handleEnter}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>{modalProps.title ? modalProps.title : 'Analysis Checks'}</DialogTitle>
          <DialogContent>
            {numChecks === 0 ? <div className={classes.noItems}>No analysis checks done on this sample.</div> : [...Array(this.state.totalNum ? this.state.totalNum : 1).keys()].map(num => {
              if (this.state[num+1].deleted !== true && !(this.state[num+1].date === undefined && !editor)) return this.confirmRow(num+1, editor);
            })}
            {editor && <div className={this.props.classes.subHeading} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
              <Button className={classes.buttonIconText} aria-label='add' onClick={this.addAnalysis}><AddIcon /> Add Analysis</Button>
            </div>}
          </DialogContent>
          {editor ? <DialogActions>
            <Button onClick={() => this.resetModal()} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                this.submitConfirmation();
                this.resetModal();
              }}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions> :
          <DialogActions>
            <Button onClick={() => this.resetModal()} color="primary">
              OK
            </Button>
          </DialogActions>
        }
        </Dialog>
      );
    } else return null;
  }

  confirmRow = (num, editor) => {
    const { classes } = this.props;
    let colors = getSampleColors(this.state[num]);
    //console.log(this.state[num].analyst);
    let prevAnalyst = this.props.modalProps.sample && this.props.modalProps.sample.analyst ? this.props.modalProps.sample.analyst : null;
    return(<div key={num} style={{width: '100%', }}>
      <div className={classes.flexRowCenter}>
        <InputLabel shrink>Analyst</InputLabel>
        {editor ? <Select className={classes.formInputMedium}
          value={this.state[num].analyst ? {value: this.state[num].analyst, label: this.state[num].analyst} : ''}
          options={this.props.bulkAnalysts.filter(analyst => analyst.name !== prevAnalyst).map(analyst => ({ value: analyst.name, label: analyst.name }))}
          onChange={e => this.setAnalyst(e ? e.value : "", num)}
        /> :
        <div>{this.state[num].analyst ? this.state[num].analyst : 'N/A'}</div>}
        <div>
          <b>Date:</b> {this.state[num].date ? moment(this.state[num].date ? dateOf(this.state[num].date) : 'N/A').format('D MMM YYYY, h:mma') : 'N/A'}
        </div>
        {editor && <Button className={classes.buttonIconText} aria-label='set' onClick={() => this.setAnalysis(num)}><SetIcon /> Set As Result</Button>}
        {editor && <Button className={classes.buttonIconText} aria-label='remove' onClick={() => this.deleteAnalysis(num)}><RemoveIcon /> Remove Check</Button>}
      </div>
      <div className={classes.flexRow}>
        {['ch','am','cr','umf','no','org','smf'].map(res => {
          return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`],res, editor ? () => this.recordAnalysis(res, num) : null)
        })}
        <span className={this.state[num].weightReceived ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
          <TextField
            id={`weightReceived${num}`}
            value={this.state[num].weightReceived ? this.state[num].weightReceived : ''}
            InputProps={{
              endAdornment: <div className={this.state[num].weightReceived ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>g</div>,
              className: this.state[num].weightReceived ? classes.roundButtonShadedComplete : classes.roundButtonShaded,
            }}
            onChange={editor ? e => {
              this.setState({
                [num]: {
                  ...this.state[num],
                  weightReceived: e.target.value,
                },
              });
            } : null}
          />
        </span>
      </div>
      <TextField
        id="comments"
        label="Comments"
        value={this.state[num].comments ? this.state[num].comments : ''}
        multiline
        rows={5}
        className={classes.dialogField}
        onChange={editor ? e => this.setComment(e.target.value, num) : null}
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
