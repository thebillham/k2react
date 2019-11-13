import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import classNames from 'classnames';
import { connect } from "react-redux";
import store from "../../../store";
import { ASBESTOS_ACTIONS } from "../../../constants/modal-types";
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
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import FormControl from "@material-ui/core/FormControl";
import ReceiveIcon from "@material-ui/icons/Inbox";
import StartAnalysisIcon from "@material-ui/icons/Colorize";
import CancelActionIcon from "@material-ui/icons/Block";
import ProceedActionIcon from "@material-ui/icons/Forward";
import UnresolvedActionIcon from "@material-ui/icons/Report";
import VerifyIcon from "@material-ui/icons/CheckCircleOutline";
import WAIcon from "@material-ui/icons/GroupWork";
import { dateOf, writeDates, } from "../../../actions/local";
import { toggleDoNotRender, } from "../../../actions/display";
import { hideModal, } from "../../../actions/modal";
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
} from "../../../actions/asbestosLab";
import _ from "lodash";
import moment from "moment";

const waMap = {
  gt7: '>7',
  to7: '2-7',
  lt2: '<2',
}

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    otherOptions: state.const.otherOptions,
    sessionID: state.asbestosLab.sessionID,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    samples: state.asbestosLab.samples,
    noAsbestosResultReasons: state.const.noAsbestosResultReasons,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    doNotRenderOn: () => dispatch(toggleDoNotRender(true)),
    doNotRenderOff: () => dispatch(toggleDoNotRender(false)),
    // doNotRenderOff: _.debounce(() => dispatch(toggleDoNotRender(false)), 100),
    hideModal: () => dispatch(hideModal()),
  };
};

class AsbestosActionsModal extends React.Component {
  state = {
    samples: {},
    subsamples: [],
  };

  handleEnter = () => {
    let samples = {};
    Object.values(this.props.samples[this.props.modalProps.job.uid]).filter(sample => sample.deleted === false && sample.cocUid === this.props.modalProps.job.uid).forEach(sample => {
      samples[sample.sampleNumber] = {
        ...sample,
        original: sample[this.props.modalProps.field] ? sample[this.props.modalProps.field] : null,
        originalNoAsbestosResultReason: sample.originalNoAsbestosResultReason ? sample.originalNoAsbestosResultReason : null,
        now: sample[this.props.modalProps.field] ? sample[this.props.modalProps.field] : null,
      };
    });

    let subSampleMap = {};

    if (this.props.modalProps.field === 'verifySubsample' ||
    ((this.props.modalProps.field === 'verified' || this.props.modalProps.field === 'issue') && this.props.modalProps.job.waAnalysis)) {
      subSampleMap = getWASubsampleList(samples);
    }

    let oldIssues = this.props.modalProps.job.issues ? this.props.modalProps.job.issues : {};
    this.setState({
      subsamples: subSampleMap.subsamples,
      samples,
      oldIssues,
      duplicateIDs: subSampleMap.duplicateIDs,
      issues: {},
      mode: 'actions',
    });
  };

  handleClick = sample => {
    if (this.props.modalProps.field === 'issue') return null;
    let startDate = null;
    let now = false;
    if (!sample.now) {
      startDate = new Date();
      now = true;
    }
    this.setState({
      samples: {
        ...this.state.samples,
        [sample.sampleNumber]: {
          ...this.state.samples[sample.sampleNumber],
          now,
          startDate,
        }
      }
    })
  };

  handleClickSub = sub => {
    let startDate = null;
    let now = false;
    if (!sub.now) {
      startDate = new Date();
      now = true;
    }
    sub.now = now;
    sub.startDate = startDate;
    let subsamples = [...this.state.subsamples.filter(s => s.containerID !== sub.containerID), sub];
    subsamples.sort((a, b) => a.containerID - b.containerID);
    this.setState({
      subsamples,
    });
  };

  handleClickAll = () => {
    let sampleMap = this.state.samples;
    Object.values(this.state.samples).forEach(sample => {
      if (!sample.now) {
        sampleMap[sample.sampleNumber] = {
          ...sampleMap[sample.sampleNumber],
          now: true,
          startDate: new Date(),
        };
      }
    });
    this.setState({
      samples: sampleMap,
    });
  }

  submit = async () => {
    let close = true;
    let checks = Object.values(this.state.samples).map(sample => ({...this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], ...sample}));
    let issuesIncomplete = false;
    let blockAll = false;
    let issuesMap = {};
    let allowSameUserVerification = false;
    if (this.props.otherOptions && this.props.otherOptions.filter(v => v.option === "allowSameUserVerification")[0].value === "true")
      allowSameUserVerification = true;
    if (this.state.mode === 'issues') {
      // SUBMITTED FROM THE ISSUES SCREEN
      let sampleGates = {};
      Object.values(this.state.issues).forEach(issue => {
        issuesMap[issue.uid] = {
          action: issue.action,
          sampleNumber: issue.sample ? issue.sample.sampleNumber : null,
          description: issue.description,
          type: issue.type,
          uid: issue.uid,
          yes: issue.yes ? issue.yes : null,
          no: issue.no ? issue.no : null,
          noAsbestosResultReason: issue.noAsbestosResultReason ? issue.noAsbestosResultReason : null,
          comment: issue.comment ? issue.comment : null,
        };
        if (issue.action !== 'proceed' && issue.action !== 'cancel') issuesIncomplete = true;
        if (issue.action !== 'proceed') {
          if (this.props.modalProps.field === 'issue') {
            blockAll = true;
          } else sampleGates[issue.sample.sampleNumber] = true;
        }
      });
      this.setState({
        issuesIncomplete,
        blockAll,
      });
      if (!blockAll) {
        if (!issuesIncomplete) {
          // All issues are decided, continue with
          console.log(this.state.issues);
          if (this.props.modalProps.field === 'issue') {
            issueTestCertificate(this.props.modalProps.job, this.state.samples, this.props.modalProps.job.currentVersion ? parseInt(this.props.modalProps.job.currentVersion)+1 : 1,
              this.state.issues[`versionChanges${this.props.modalProps.job.currentVersion ? parseInt(this.props.modalProps.job.currentVersion) : 1}`] &&
              this.state.issues[`versionChanges${this.props.modalProps.job.currentVersion ? parseInt(this.props.modalProps.job.currentVersion) : 1}`].comment ?
              this.state.issues[`versionChanges${this.props.modalProps.job.currentVersion ? parseInt(this.props.modalProps.job.currentVersion) : 1}`].comment : '', this.props.staff, this.props.me);
          } else {
            let batch = firestore.batch();
            batch.update(cocsRef.doc(this.props.modalProps.job.uid), { versionUpToDate: false, mostRecentIssueSent: false, });
            if (this.props.modalProps.field === 'verifySubsample') {
              await this.state.subsamples.filter(sub => sub.now !== sub.original).forEach(sub => {
                verifySubsample(batch, sub, this.props.modalProps.job, this.props.samples[this.props.modalProps.job.uid], this.props.sessionID, this.props.me);
              });
            } else await checks.filter(sample => sample.now !== sample.original && !sampleGates[sample.sampleNumber]).forEach(sample => {
              if (this.props.modalProps.field === 'receivedByLab') receiveSample(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
              else if (this.props.modalProps.field === 'analysisStarted') startAnalysis(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
              else if (this.props.modalProps.field === 'verified') {
                if (sample.noAsbestosResultReason) {
                  verifySample(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate, {noAsbestosResultReason: sample.noAsbestosResultReason});
                } else {
                  verifySample(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
                }
              }
              // if (this.props.modalProps.field === 'issue') checkTestCertificateIssue();
            });
            batch.update(cocsRef.doc(this.props.modalProps.job.uid), { issues: issuesMap, });
            batch.commit();
          }
          this.props.hideModal();
        }
      }
    } else {
      console.log(this.props.modalProps);
      let checkMap = {};
      let checks = Object.values(this.state.samples).map(sample => ({...this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], ...sample}));

      if (this.props.modalProps.field === 'receivedByLab') checkMap = receiveSamples(checks);
      else if (this.props.modalProps.field === 'analysisStarted') checkMap = startAnalyses(checks);
      else if (this.props.modalProps.field === 'verified') checkMap = verifySamples(checks, this.props.modalProps.job, this.props.me.uid, false, allowSameUserVerification);
      else if (this.props.modalProps.field === 'issue') checkMap = checkTestCertificateIssue(this.props.samples[this.props.modalProps.job.uid], this.props.modalProps.job, this.props.me.uid);
      else if (this.props.modalProps.field === 'verifySubsample') checkMap = verifySubsamples(this.state.subsamples, this.props.modalProps.job, this.props.me.uid, this.state.duplicateIDs)
      // let jobIssues = this.props.modalProps.job.issues ? this.props.modalProps.job.issues : {};
      if (Object.values(checkMap).length === 0) {
        // No problems with any samples, do actions
        console.log('no problems, do actions');
        if (this.props.modalProps.field === 'issue') issueTestCertificate(this.props.modalProps.job, this.state.samples, 1, "First issue.", this.props.staff, this.props.me);
        else {
          let batch = firestore.batch();
          batch.update(cocsRef.doc(this.props.modalProps.job.uid), { versionUpToDate: false, mostRecentIssueSent: false, });
          if (this.props.modalProps.field === 'verifySubsample') {
            console.log(this.state.subsamples);
            await this.state.subsamples.filter(sub => sub.now !== sub.original).forEach(sub => {
              verifySubsample(batch, sub, this.props.modalProps.job, this.props.samples[this.props.modalProps.job.uid], this.props.sessionID, this.props.me);
            });
          } else await checks.filter(sample => sample.now !== sample.original).forEach(sample => {
            // this.props.doNotRenderOn(); // Block rendering while looping through sample updates
            if (this.props.modalProps.field === 'receivedByLab') receiveSample(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
            else if (this.props.modalProps.field === 'analysisStarted') startAnalysis(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
            else if (this.props.modalProps.field === 'verified') verifySample(batch, this.props.samples[this.props.modalProps.job.uid][sample.sampleNumber], this.props.modalProps.job, this.props.samples, this.props.sessionID, this.props.me, sample.startDate);
            // this.props.doNotRenderOff();
          });
          batch.commit();
        }
        // this.props.doNotRenderOff(); // Turn rendering back on
        this.props.hideModal();
      } else {
        // Review issues with samples
        Object.keys(checkMap).forEach(key => {
          if (this.state.oldIssues[key] !== undefined) checkMap[key] = {
            ...this.state.oldIssues[key],
            ...checkMap[key],
          };
        });
        this.setState({
          mode: 'issues',
          issues: checkMap,
        })
      }
    }
  }

  render() {
    const { classes, modalProps, modalType, } = this.props;
    // console.log(this.state.subsamples);
    return (
      modalType === ASBESTOS_ACTIONS ? <Dialog
        open={modalType === ASBESTOS_ACTIONS}
        onClose={this.props.hideModal}
        maxWidth={(modalProps.field === 'verified' || modalProps.field === 'issue' || modalProps.field === 'verifySubsample') && this.state.mode !== 'issues' ? "md" : "sm"}
        fullWidth={true}
        onEnter={this.handleEnter}
        disableBackdropClick={true}
        scroll="paper"
      >
        <DialogTitle>{modalProps.title ? modalProps.title : ''}</DialogTitle>
        <DialogContent>
          {this.state.blockAll ? <div className={classes.warningText}>Not All Issues Have Been Resolved. The Test Certificate Will Not Be Issued.</div>
          : this.state.mode === 'actions' ? <div>
          <Button
            className={classes.buttonIconText}
            onClick={this.handleClickAll}
          >
            {modalProps.field === 'receivedByLab' && <span><ReceiveIcon className={classes.iconRegular} /> Receive All Samples</span>}
            {modalProps.field === 'analysisStarted' && <span><StartAnalysisIcon className={classes.iconRegular} /> Start Analysis On All Samples</span>}
            {modalProps.field === 'verified' && <span><VerifyIcon className={classes.iconRegular} /> Verify All Samples</span>}

          </Button>
          {modalProps.field === 'issue' &&
            <div>
              <span className={classes.headingInline}>Sampled by:</span>{" "}
              <span className={ classes.infoLight }>
                {this.state.samples ? getPersonnel(Object.values(this.state.samples), 'sampledBy', null, true).map(e => e.name).join(', ') : 'Not specified'}
              </span>
              <br />
              <span className={classes.headingInline}>Date(s) Sampled:</span>{" "}
              <span className={ classes.infoLight }>
                {this.state.samples ? writeDates(Object.values(this.state.samples), 'sampleDate') : 'Not specified'}
              </span>
              <br />
              <span className={classes.headingInline}>Analysis by:</span>{" "}
              <span className={ classes.infoLight }>
                {this.state.samples ? getPersonnel(Object.values(this.state.samples), 'analyst', null, true).map(e => e.name).join(', ') : "Not specified"}
              </span>
            </div>
          }
          {modalProps.field === 'verifySubsample' ?
            <div>
            {this.state.duplicateIDs &&
              (<div className={classes.boldRedWarningText}>
                {`Two or more subsamples have the same ID (${this.state.duplicateIDs}). Fix this before proceeding.`}
              </div>)}
            <Grid container className={classes.headingRow}>
              <Grid item xs={1}>ID</Grid>
              <Grid item xs={2}>Tare Weight</Grid>
              <Grid item xs={1}>Sample</Grid>
              <Grid item xs={1}>Fraction</Grid>
              <Grid item xs={1}>Concentration</Grid>
              <Grid item xs={1}>Form</Grid>
              <Grid item xs={1}>Type</Grid>
              <Grid item xs={2}>Gross Weight</Grid>
              <Grid item xs={2}/>
            </Grid>
            {this.state.subsamples.map(sub => (
              <div key={sub.containerID} className={parseInt(sub.containerID) % 5 === 0 ? classes.bottomBorder : null}>
                <div className={classes.flexRowHoverButton}
                  onClick={() => this.handleClickSub(sub)}
                >
                  <Grid container alignItems='center'>
                    <Grid item xs={1}>
                    <div className={sub.now ? classes.circleShadedHighlighted : classes.circleShaded}>
                      {sub.containerID}
                    </div>
                    </Grid>
                    <Grid item xs={2}>{sub.tareWeight ? `${sub.tareWeight}g` : "N/A"}</Grid>
                    <Grid item xs={1}>{sub.sampleNumber}</Grid>
                    <Grid item xs={1}>{sub.fraction && waMap[sub.fraction]}</Grid>
                    <Grid item xs={1}>{sub.concentration && `${sub.concentration}%`}</Grid>
                    <Grid item xs={1}>{sub.form && sub.form.toUpperCase()}</Grid>
                    <Grid item xs={1}>{sub.result && writeShorthandResult(sub.result)}</Grid>
                    <Grid item xs={2}>{sub.weight ? `${sub.weight}g` : "N/A"}</Grid>
                    <Grid item xs={1}>
                      {sub.tareWeight && sub.weight && parseFloat(sub.tareWeight) > parseFloat(sub.weight) &&
                        <div className={classes.boldRedWarningText}>
                          {`Tare weight is larger than gross weight by ${(parseFloat(sub.tareWeight) - parseFloat(sub.weight)).toFixed(5)}g. Check this is in an acceptable range.`}
                        </div>
                      }
                    </Grid>
                    <Grid item xs={1}>
                      <div className={classes.flexRowRightAlign}><VerifyIcon className={sub.now ? classes.iconRegularGreen : classes.iconRegular} /></div>
                    </Grid>
                  </Grid>
                </div>
              </div>
            ))}
            </div>
          : this.state.samples && Object.values(this.state.samples).map(sample => {
            return modalProps.job.waAnalysis && (modalProps.field === 'verified' || modalProps.field === 'issue') ? this.verifyWAListItem(sample)
            : this.listItem(sample);
          }
          )}</div>
          : this.state.issues &&
          <div>
            {Object.values(this.state.issues).map(issue => (
              this.issueCard(issue)
            ))}
            {this.state.issuesIncomplete && <div className={classes.boldRedWarningText}>Make A Decision on All Issues Before Continuing</div>}
          </div>
        }
        </DialogContent>
        <DialogActions>
          {this.state.blockAll ?
            <Button onClick={() => this.setState({ mode: 'issues', blockAll: false, })} color="secondary">
              Back
            </Button>
          : this.state.mode === 'actions' ?
            <Button onClick={() => this.props.hideModal()} color="secondary">
              Cancel
            </Button> :
            <Button onClick={() => this.setState({ mode: 'actions' })} color="secondary">
              Back
            </Button>
          }
          {this.state.blockAll ?
            <Button
              onClick={this.props.hideModal}
              color="primary"
            >
              OK
            </Button>
          : <Button
            onClick={() => {
              this.submit();
            }}
            color="primary"
          >
            Submit
          </Button>}
        </DialogActions>
      </Dialog> : null
    );
  }

  issueCard = issue => {
    let yes = `Issue Resolved, Proceed with Action`;
    if (issue.type === 'check') yes = `This is Correct`;
    let no = `Cancel Action on this Sample`;
    if (this.props.modalProps.field === 'verified') no = `Do not verify this sample`;
    if (issue.type === 'check') no =`This Needs Fixing`;
    if (issue.yes) yes = issue.yes;
    if (issue.no) no = issue.no;
    return <Card key={issue.uid} className={this.props.classes.marginsAllMedium}>
      <CardHeader
        avatar={
          <Avatar className={(issue.action === undefined || issue.action === null) ? this.props.classes.avatarRegularOrange :
          issue.action === 'proceed' ? this.props.classes.avatarRegularGreen :
          this.props.classes.avatarRegularRed}>
            {(issue.action === undefined || issue.action === null) ? <UnresolvedActionIcon /> :
            issue.action === 'proceed' ? <ProceedActionIcon /> :
            <CancelActionIcon />}
          </Avatar>
        }
        title={issue.sample ? `${issue.sample.jobNumber}-${issue.sample.sampleNumber} ${writeDescription(issue.sample)}` : 'Issue'}
      />
      <CardContent className={this.props.classes.marginsAllSmall}>

        {/*<div className={this.props.classes.flexRow}>
          {(issue.action === undefined || issue.action === null) ?
              <UnresolvedActionIcon className={this.props.classes.avatarRegularOrange} /> :
              issue.action === 'proceed' ? <ProceedActionIcon className={this.props.classes.avatarRegularGreen} /> :
              <CancelActionIcon className={this.props.classes.avatarRegularRed} />}
          {issue.sample ? `${issue.sample.jobNumber}-${issue.sample.sampleNumber} ${writeDescription(issue.sample)}` : 'Issue'}
        </div>*/}
        {issue.description}
        {issue.type === 'noresult' && (issue.action == undefined || issue.action == null) &&
          <FormControl component="fieldset">
            <RadioGroup
              id={'noAsbestosResultReason'}
              name={'noAsbestosResultReason'}
              value={issue.noAsbestosResultReason ? issue.noAsbestosResultReason : 'notAnalysed' }
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
                      noAsbestosResultReason: e.target.value,
                    },
                  },
                });
              }}
            >
              {this.props.noAsbestosResultReasons && this.props.noAsbestosResultReasons.map(select => {
                return (<FormControlLabel key={select.value} value={select.value} control={<Radio />} label={select.label} />);
              })}
            </RadioGroup>
            <FormHelperText style={{ width: 500, }}>Select the reason for reporting no asbestos result.</FormHelperText>
          </FormControl>
        }
        {issue.type === 'noresult' && issue.action !== undefined && issue.action !== null &&
          <div className={this.props.classes.commentBox}>
            {issue.noAsbestosResultReason ? this.props.noAsbestosResultReasons.filter(e => e.value === issue.noAsbestosResultReason)[0].label : 'Not Analysed'}
          </div>
        }
        {issue.action === undefined || issue.action === null ? <TextField
          value={issue.comment ? issue.comment : ''}
          label={'Comment'}
          className={this.props.classes.commentBoxNoBorder}
          multiline={true}
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
        /> :
        <div>
          {issue.comment !== undefined && issue.comment !== null && issue.comment !== '' && <div className={this.props.classes.commentBox}>{issue.comment}</div>}
        </div>
      }
      </CardContent>
      {issue.action === undefined || issue.action === null ?
        <CardActions>
          <Button size="small" color="secondary" onClick={() => {
            this.setState({
              issues: {
                ...this.state.issues,
                [issue.uid]: {
                  ...this.state.issues[issue.uid],
                  action: 'cancel',
                }
              }
            });
          }}>
            {no}
          </Button>
          {issue.type !== 'block' && <Button size="small" color="primary" disabled={issue.action === 'proceed'} onClick={() => {
            this.setState({
              issues: {
                ...this.state.issues,
                [issue.uid]: {
                  ...this.state.issues[issue.uid],
                  action: 'proceed',
                }
              }
            });
          }}>
            {yes}
          </Button>}
        </CardActions> :
        <CardActions>
          <Button size="small" color="inherit" onClick={() => {
            this.setState({
              issues: {
                ...this.state.issues,
                [issue.uid]: {
                  ...this.state.issues[issue.uid],
                  action: null,
                }
              }
            });
          }}>
            Change Decision
          </Button>
        </CardActions>
      }
    </Card>;
  }

  listItem = sample => {
    const { modalProps, classes } = this.props;
    return <div key={sample.sampleNumber}>
      <div className={modalProps.field !== 'issue' ? classes.flexRowHoverButton : sample.verified ? classes.flexRowHoverPretty : classes.flexRowHoverDisabled}
        onClick={() => this.handleClick(sample)}>
        <div className={classes.flexRowLeftAlignEllipsis}>
          <div className={classes.spacerSmall} />
          <div className={sample.now ? classes.circleShadedHighlighted : (modalProps.field === 'issue' && !sample.verified) ? classes.circleShadedDisabled : classes.circleShaded}>
            {sample.sampleNumber}
          </div>
          <div>{writeDescription(sample)}</div>
        </div>
        <div className={classes.flexRowRightAlign}>
          {(modalProps.field === 'verified' || modalProps.field === 'issue') &&
            <span className={classes.flexRow}>
              <span className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedLongDisabled
                : getBasicResult(sample) === 'none' ? classes.roundButtonShadedLong : getBasicResult(sample) === 'negative' ? classes.roundButtonShadedLongGreen : classes.roundButtonShadedLongRed}>
                {writeShorthandResult(sample.result)}
              </span>
              <span className={classes.spacerSmall} />
              <Tooltip title={'Weight on Receipt'}><div className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedDisabled :
              sample.weightReceived ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>{sample.weightReceived ? `${sample.weightReceived}g` : 'NO WEIGHT'}</div></Tooltip>
            </span>
          }
          {modalProps.field === 'receivedByLab' && <ReceiveIcon className={sample.now ? classes.iconRegularGreen : classes.iconRegular} />}
          {modalProps.field === 'analysisStarted' && <StartAnalysisIcon className={sample.now ? classes.iconRegularGreen : classes.iconRegular} />}
          {modalProps.field === 'verified' && <VerifyIcon className={sample.now ? classes.iconRegularGreen : classes.iconRegular} />}
        </div>
      </div>
    </div>
  }

  verifyWAListItem = sample => {
    const { modalProps, classes } = this.props;
    let waOverLimit = false;
    let waTotals = null;
    let acmLimit = this.props.modalProps.job.acmInSoilLimit ? parseFloat(this.props.modalProps.job.acmInSoilLimit) : 0.01;
    let subsamples = this.state.subsamples.filter(sub => sub.sampleNumber === sample.sampleNumber);
    if (sample.waAnalysisComplete) {
      waTotals = getWATotalDetails(sample);
      if (waTotals.concentration.acm >= acmLimit || waTotals.concentration.faaf >= 0.001) waOverLimit = true;
    }
    return <div key={sample.sampleNumber}>
      <div className={modalProps.field !== 'issue' ? classes.hoverButton : sample.verified ? classes.hoverPretty : classes.hoverDisabled}
        onClick={() => this.handleClick(sample)}>
        <div className={classes.flexRowEvenlySpaced}>
          <div className={sample.now ? classes.circleShadedHighlighted : (modalProps.field === 'issue' && !sample.verified) ? classes.circleShadedDisabled : classes.circleShaded}>
            {sample.sampleNumber}
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>{writeDescription(sample)}</div>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>Analysis Date</div>
            {sample.analysisDate ? moment(dateOf(sample.analysisDate)).format('D MMMM YYYY') : 'N/A'}
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>Form Description</div>
            {sample.waSoilAnalysis && sample.waSoilAnalysis.formDescription ? sample.waSoilAnalysis.formDescription : 'N/A'}
          </div>
          <div className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedLongDisabled
            : getBasicResult(sample) === 'none' ? classes.roundButtonShadedLong : getBasicResult(sample) === 'negative' ? classes.roundButtonShadedLongGreen : classes.roundButtonShadedLongRed}>
            {writeShorthandResult(sample.result)}
          </div>
        </div>
        <div className={classes.flexRowEvenlySpaced}>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>Received</div>
            <Tooltip title={'Weight on Receipt'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.weightReceived ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.weightReceived ? `${sample.weightReceived}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>Subsample</div>
            <Tooltip title={'Weight of Subsample'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.weightSubsample ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.weightSubsample ? `${sample.weightSubsample}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>Dry</div>
            <Tooltip title={'Weight after Drying (~105°C)'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.weightDry ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.weightDry ? `${sample.weightDry}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>Ashed</div>
            <Tooltip title={'Weight after Ashing (~400°C)'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.weightAshed ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.weightAshed ? `${sample.weightAshed}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>{`>7mm`}</div>
            <Tooltip title={'Weight of >7mm Fraction'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.waSoilAnalysis && sample.waSoilAnalysis.fractiongt7WeightAshed ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.waSoilAnalysis && sample.waSoilAnalysis.fractiongt7WeightAshed ? `${sample.waSoilAnalysis.fractiongt7WeightAshed}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>2-7mm</div>
            <Tooltip title={'Weight of 2-7mm Fraction'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.waSoilAnalysis && sample.waSoilAnalysis.fractionto7WeightAshed ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.waSoilAnalysis && sample.waSoilAnalysis.fractionto7WeightAshed ? `${sample.waSoilAnalysis.fractionto7WeightAshed}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>{`<2mm`}</div>
            <Tooltip title={'Weight of <2mm Fraction'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed ? `${sample.waSoilAnalysis.fractionlt2WeightAshed}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
          <div className={classes.verticalCenter}>
            <div className={classes.labelTopBold}>{`<2mm Sub`}</div>
            <Tooltip title={'Weight of <2mm Subfraction'}>
              <div className={modalProps.field === 'issue' && !sample.verified ? classes.roundButtonShadedDisabled : sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
                {sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample ? `${sample.waSoilAnalysis.fractionlt2WeightAshedSubsample}g` : 'N/A'}
              </div>
            </Tooltip>
          </div>
        </div>
        <div className={classes.flexRow}>
          <div className={classes.flexRowLeftAlignEllipsis}>
            <WAIcon className={(modalProps.field === 'issue' && !sample.verified) ? classes.circleShadedDisabled : sample.waAnalysisComplete ? waOverLimit ? classes.circleShadedBad : classes.circleShadedOk : classes.circleShaded} />
            {sample.waAnalysisComplete && waTotals &&
              <div className={classes.flexRow}>
                <span className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedDisabled : waTotals.concentration.acm >= acmLimit ? classes.roundButtonShadedRed : classes.roundButtonShadedGreen}>
                  {`ACM: ${waTotals.concentration.acm}%`}
                </span>
                <span className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedDisabled : waTotals.concentration.fa >= 0.001 ? classes.roundButtonShadedRed : classes.roundButtonShadedGreen}>
                  {`FA: ${waTotals.concentration.fa}%`}
                </span>
                <span className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedDisabled : waTotals.concentration.af >= 0.001 ? classes.roundButtonShadedRed : classes.roundButtonShadedGreen}>
                  {`AF: ${waTotals.concentration.af}%`}
                </span>
                <span className={(modalProps.field === 'issue' && !sample.verified) ? classes.roundButtonShadedDisabled : waTotals.concentration.faaf >= 0.001 ? classes.roundButtonShadedRed : classes.roundButtonShadedGreen}>
                  {`FA/AF: ${waTotals.concentration.faaf}%`}
                </span>
              </div>
            }
          </div>
          <div className={classes.flexRowRightAlign}>
            {subsamples.length > 0 ? subsamples.map(sub =>
              <div key={sub.containerID} className={modalProps.field === 'issue' && !sample.verified ? classes.circleShadedDisabled
                : sub.verified ? classes.circleShadedOk : classes.circleShaded}>
                {sub.containerID}
              </div>) : <div>No Subsamples</div>}
          </div>
        </div>
      </div>
    </div>;
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosActionsModal)
);
