import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import classNames from 'classnames';
import { connect } from "react-redux";
import store from "../../../store";
import { COC_SAMPLE_ACTIONS } from "../../../constants/modal-types";
import { asbestosSamplesRef, } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import FormHelperText from "@material-ui/core/FormHelperText";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import ReceiveIcon from "@material-ui/icons/Inbox";
import StartAnalysisIcon from "@material-ui/icons/Colorize";
import VerifyIcon from "@material-ui/icons/CheckCircleOutline";
import { hideModal, handleModalChange } from "../../../actions/modal";
import { addLog } from "../../../actions/local";
import { writeDescription, receiveSample, receiveSamples, startAnalysis, startAnalyses, verifySample, verifySamples, writeShorthandResult, getBasicResult, } from "../../../actions/asbestosLab";
import _ from "lodash";
import moment from 'moment';

const mapStateToProps = state => {
  return {
    me: state.local.me,
    sessionID: state.asbestosLab.sessionID,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    samples: state.asbestosLab.samples,
    noAsbestosResultReasons: state.const.noAsbestosResultReasons,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
  };
};

class AsbestosSampleActionsModal extends React.Component {
  state = {
    samples: {},
  };

  handleEnter = () => {
    let sampleMap = {};
    Object.values(this.props.samples[this.props.modalProps.job.uid]).filter(sample => sample.deleted === false).forEach(sample => {
      sampleMap[sample.sampleNumber] = {
        uid: sample.uid,
        number: sample.sampleNumber,
        description: writeDescription(sample),
        original: sample[this.props.modalProps.field],
        now: sample[this.props.modalProps.field],
        result: sample.result,
        weightReceived: sample.weightReceived,
      };
    });

    this.setState({
      samples: sampleMap,
      mode: 'actions',
    });
  };

  handleClick = sample => {
    let startDate = null;
    let now = false;
    if (!sample.now) {
      startDate = new Date();
      now = true;
    }
    this.setState({
      samples: {
        ...this.state.samples,
        [sample.number]: {
          ...this.state.samples[sample.number],
          now,
          startDate,
        }
      }
    })
  };

  handleClickAll = () => {
    let sampleMap = this.state.samples;
    Object.values(this.state.samples).forEach(sample => {
      if (!sample.now) {
        sampleMap[sample.number] = {
          ...sampleMap[sample.number],
          now: true,
          startDate: new Date(),
        };
      }
    });
    this.setState({
      samples: sampleMap,
    });
  }

  submit = () => {
    let close = true;
    if (this.state.mode === 'issues') {

    } else {
      let res = true;
      let checkMap = {};
      let checks = Object.values(this.state.samples).map(sample => ({...this.props.samples[this.props.modalProps.job.uid][sample.number], ...sample}));
      if (this.props.modalProps.field === 'receivedByLab') checkMap = receiveSamples(checks);
      if (this.props.modalProps.field === 'analysisStart') checkMap = startAnalyses(checks);
      if (this.props.modalProps.field === 'verified') checkMap = verifySamples(checks, this.props.modalProps.job);
      if (Object.keys(checkMap).length === 0) {
        // No problems with any samples, do actions
        checks.forEach(sample => {
          console.log(sample.now);
          if (this.props.modalProps.field === 'receivedByLab' && sample.now && !sample.original) res = receiveSample(this.props.samples[this.props.modalProps.job.uid][sample.number], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
          if (this.props.modalProps.field === 'analysisStart' && sample.now && !sample.original) res = startAnalysis(this.props.samples[this.props.modalProps.job.uid][sample.number], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
          if (this.props.modalProps.field === 'verified' && sample.now && !sample.original) res = verifySample(this.props.samples[this.props.modalProps.job.uid][sample.number], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
        });
      } else {
        // Review issues with samples
        console.log(checkMap);
        close = false;
        this.setState({
          mode: 'issues',
          issues: checkMap,
        })
      }
      return close;
    }
  }

  render() {
    const { classes, modalProps, modalType, } = this.props;
    return (
      modalType === COC_SAMPLE_ACTIONS ? <Dialog
        open={modalType === COC_SAMPLE_ACTIONS}
        onClose={this.props.hideModal}
        maxWidth={modalProps.field === 'verified' ? "md" : "sm"}
        fullWidth={true}
        onEnter={this.handleEnter}
      >
        <DialogTitle>{modalProps.title ? modalProps.title : ''}</DialogTitle>
        <DialogContent>
          {this.state.mode === 'actions' ? <div>
          <Button
            className={classes.buttonIconText}
            onClick={this.handleClickAll}
          >
            {modalProps.field === 'receivedByLab' && <span><ReceiveIcon className={classes.iconRegular} /> Receive All Samples</span>}
            {modalProps.field === 'analysisStart' && <span><StartAnalysisIcon className={classes.iconRegular} /> Start Analysis On All Samples</span>}
            {modalProps.field === 'verified' && <span><VerifyIcon className={classes.iconRegular} /> Verify All Samples</span>}

          </Button>
          {this.state.samples && Object.values(this.state.samples).map(sample => (<div key={sample.number}>
              <div className={classes.flexRowHoverButton} onClick={() => this.handleClick(sample)}>
                <div className={classes.flexRowLeftAlignEllipsis}>
                  <div className={classes.spacerSmall} />
                  <div className={sample.now ? classes.circleShadedHighlighted : classes.circleShaded}>
                    {sample.number}
                  </div>
                  <div>{sample.description}</div>
                </div>
                <div className={classes.flexRowRightAlign}>
                  {modalProps.field === 'verified' &&
                    <span className={classes.flexRow}>
                      <span className={getBasicResult(sample) === 'none' ? classes.roundButtonShadedLong : getBasicResult(sample) === 'negative' ? classes.roundButtonShadedLongGreen : classes.roundButtonShadedLongRed}>
                        {writeShorthandResult(sample.result)}
                      </span>
                      <span className={classes.spacerSmall} />
                      <Tooltip title={'Weight on Receipt'}><div className={classes.roundButtonShaded}>{sample.weightReceived ? `${sample.weightReceived}g` : 'NO WEIGHT'}</div></Tooltip>
                    </span>
                  }
                  {modalProps.field === 'receivedByLab' && <ReceiveIcon className={sample.now ? classes.iconRegularGreen : classes.iconRegular} />}
                  {modalProps.field === 'analysisStart' && <StartAnalysisIcon className={sample.now ? classes.iconRegularGreen : classes.iconRegular} />}
                  {modalProps.field === 'verified' && <VerifyIcon className={sample.now ? classes.iconRegularGreen : classes.iconRegular} />}
                </div>
              </div>
            </div>
            )
          )}</div>
          : this.state.issues && Object.values(this.state.issues).map(issue => (
            this.issueCard(issue)
          ))
        }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              let close = this.submit();
              if (close) this.props.hideModal();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog> : null
    );
  }

  issueCard = issue => {
    console.log(issue.type);
    return <Card key={issue.uid} className={classNames(this.props.classes.paddingAllMedium, this.props.classes.marginsAllMedium)}>
      <div>
        <div className={this.props.classes.headingInline}>{`${issue.sample.jobNumber}-${issue.sample.sampleNumber} ${issue.sample.description}`}</div>
        {issue.description}
        {issue.type === 'noresult' &&
          <FormControl component="fieldset">
            <RadioGroup
              id={'noResultReason'}
              name={'noResultReason'}
              value={issue.noResultReason ? issue.noResultReason : 'notAnalysed' }
              row
              onChange={e => {
                this.setState({
                  samples: {
                    ...this.state.samples,
                    [issue.sample.sampleNumber]: {
                      ...this.state.samples[issue.sample.sampleNumber],
                      noAsbestosResultReason: e.target.value,
                    },
                  },
                  issues: {
                    ...this.state.issues,
                    [issue.uid]: {
                      ...this.state.issues[issue.uid],
                      noResultReason: e.target.value,
                    },
                  },
                });
              }}
            >
              {this.props.noAsbestosResultReasons && this.props.noAsbestosResultReasons.map(select => {
                return (<FormControlLabel value={select.value} control={<Radio />} label={select.label} />);
              })}
            </RadioGroup>
            <FormHelperText style={{ width: 500, }}>Select the reason for reporting no asbestos result.</FormHelperText>
          </FormControl>
        }
        <TextField
          value={issue.comment ? issue.comment : ''}
          label={'Comment'}
          style={{ width: '100%'}}
          multiline={true}
          rows={5}
          onChange={e => {
            this.setState({
              issues: {
                ...this.state.issues,
                [issue.uid]: {
                  ...this.state.issues[issue.uid],
                  comment: e.target.value,
                },
              },
            });
          }}
        />
      </div>
      <CardActions>
        <Button size="small" color="secondary">
          Cancel Action on this Sample
        </Button>
        <Button size="small" color="primary">
          Issue Resolved, Proceed with Action
        </Button>
      </CardActions>
    </Card>;
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleActionsModal)
);
