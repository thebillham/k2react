import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { COC_SAMPLE_ACTIONS } from "../../../constants/modal-types";
import { asbestosSamplesRef, } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
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
    let res = true;
    let close = true;
    let checkMap = {};
    let checks = Object.values(this.state.samples).map(sample => ({...this.props.samples[this.props.modalProps.job.uid][sample.number], ...sample}));
    if (this.props.modalProps.field === 'receivedByLab') checkMap = receiveSamples(checks);
    if (this.props.modalProps.field === 'analysisStart') checkMap = startAnalyses(checks);
    if (this.props.modalProps.field === 'verified') checkMap = verifySamples(checks, this.props.modalProps.job);
    if (Object.keys(checkMap).length === 0) {
      // No problems with any samples, do actions
      checks.forEach(sample => {
        if (this.props.modalProps.field === 'receivedByLab') res = receiveSamples(this.props.samples[this.props.modalProps.job.uid][sample.number], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
        if (this.props.modalProps.field === 'analysisStart') res = startAnalysis(this.props.samples[this.props.modalProps.job.uid][sample.number], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
        if (this.props.modalProps.field === 'verified') res = verifySample(this.props.samples[this.props.modalProps.job.uid][sample.number], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
      });
    } else {
      // Review issues with samples
      close = false;
      this.setState({
        mode: 'issues',
        issues: checkMap,
      })

    }
    return close;
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
    return <Card key={issue.sample.number}>
      <CardActionArea>
        <CardContent>
          <div className={this.props.classes.subheading}>{`${issue.sample.jobNumber}-${issue.sample.sampleNumber} ${writeDescription(issue.sample)}`}</div>
          {issue.description}
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="secondary">
          Share
        </Button>
        <Button size="small" color="primary">
          Dismiss
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
