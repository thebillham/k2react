import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
} from "../../../config/firebase";
import {
  ASBESTOS_COC_EDIT,
  ASBESTOS_SAMPLE_EDIT,
} from "../../../constants/modal-types";
import moment from "moment";
import { addLog, } from "../../../actions/local";
import { writeDates, andList, } from '../../../actions/helpers';

import { TickyBox, } from '../../../widgets/FormWidgets';
import Grid from "@material-ui/core/Grid";
import { getPersonnel } from '../../../actions/asbestosLab';

const mapStateToProps = state => {
  return {
    samples: state.asbestosLab.samples,
    cocs: state.asbestosLab.cocs,
    expanded: state.display.asbestosLabExpanded,
    modalType: state.modal.modalType,
    me: state.local.me,
  };
};

class AsbestosCocSummary extends React.Component {
  // static whyDidYouRender = true;

  shouldComponentUpdate(nextProps) {
    // return true;
    // return false;
    if (!nextProps.cocs[nextProps.job]) return true; // COC has been deleted
    if (nextProps.expanded !== nextProps.job) return false; // List is not expanded (hidden)
    if (this.props.modalType === ASBESTOS_SAMPLE_EDIT) return false; // Edit modal is open
    if (this.props.modalType === ASBESTOS_COC_EDIT) return false; // COC modal is open
    // this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
    //   if (nextProps.samples[nextProps.job.uid][sample.sampleNumber] && sample.sampledBy !== nextProps.samples[nextProps.job.uid][sample.sampleNumber].sampledBy) return true;
    //   if (nextProps.samples[nextProps.job.uid][sample.sampleNumber] && sample.sampleDate !== nextProps.samples[nextProps.job.uid][sample.sampleNumber].sampleDate) return true;
    //   if (nextProps.samples[nextProps.job.uid][sample.sampleNumber] && sample.analyst !== nextProps.samples[nextProps.job.uid][sample.sampleNumber].analyst) return true;
    // });
    return true; // Until i can get it working
    // return false;
  }

  render() {
    const { samples, classes } = this.props;
    const job = this.props.cocs[this.props.job];
    if (job === undefined || job.deleted) return null;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    // console.log(`rendering summary ${job.jobNumber}`);
    // console.log(job);
    // console.log(samples[job.uid]);
    let sampledBy = 'N/A',
      sampleDate = 'N/A',
      analysts = 'N/A',
      analystMap = {},
      validSamples = samples[job.uid] ? Object.values(samples[job.uid]).filter(e => e.cocUid === job.uid) : [];
    if (samples && samples[job.uid]) {
      if (job.sampleType === "air") {
        if (job.sampledBy) sampledBy = andList(job.sampledBy.map(e => e.name));
        console.log(job.defaultPersonnel);
        sampleDate = writeDates(validSamples, 'startTime');
        validSamples.forEach(s => {
          if (s.analysts && s.analysts.length > 0) {
            s.analysts.forEach(a => analystMap[a.name] = true);
            analysts = andList(Object.keys(analystMap));
          }
        })
      } else {
        sampledBy = andList(getPersonnel(validSamples, 'sampledBy', null, false).map(e => e.name));
        sampleDate = writeDates(validSamples, 'sampleDate');
        analysts = andList(getPersonnel(validSamples, 'analyst', null, false).map(e => e.name));
      }
    }

    return (
      <Grid container direction="row" className={classes.marginTopBottomSmall} alignItems="flex-start" justify="center">
        <Grid item lg={4} xs={6}>
          <span className={classes.headingInline}>Sampled by:</span>{" "}
          <span className={ classes.infoLight }>
            {sampledBy}
          </span>
          <br />
          <span className={classes.headingInline}>Date(s) Sampled:</span>{" "}
          <span className={ classes.infoLight }>
            {sampleDate}
          </span>
          <br />
          <span className={classes.headingInline}>Analysis by:</span>{" "}
          <span className={ classes.infoLight }>
            {analysts}
          </span>
        </Grid>
        <Grid item lg={8} xs={6}>
          { job.labToContactClient && TickyBox(this, 'Lab Contacted Client', cocsRef, job, 'labHasContactedClient',
            (checked) => {
              let log = {
                type: "Issue",
                log: checked ? 'Client Contacted by Lab.' : 'Unchecked Client Contacted by Lab.',
                chainOfCustody: job.uid,
              };
              addLog("asbestosLab", log, this.props.me);
            }
          )}
          { TickyBox(this, 'Latest Issue Sent', cocsRef, job, 'mostRecentIssueSent',
            (checked) => {
                let log = {
                  type: "Issue",
                  log: checked ? 'Latest Issue Sent to Client' : 'Unchecked Latest Issue Sent to Client.',
                  chainOfCustody: job.uid,
                };
                addLog("asbestosLab", log, this.props.me);
              }, !job.versionUpToDate)}
          <div/>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    null
  )(AsbestosCocSummary)
);
