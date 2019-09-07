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

import { TickyBox, } from '../../../widgets/FormWidgets';
import Grid from "@material-ui/core/Grid";
import { getPersonnel, writeDates } from '../../../actions/asbestosLab';

const mapStateToProps = state => {
  return {
    samples: state.asbestosLab.samples,
    cocs: state.asbestosLab.cocs,
    expanded: state.display.asbestosLabExpanded,
    modalType: state.modal.modalType,
  };
};

class AsbestosBulkCocSummary extends React.Component {
  // static whyDidYouRender = true;

  shouldComponentUpdate(nextProps) {
    // return true;
    // return false;
    if (!nextProps.cocs[nextProps.job]) return true; // COC has been deleted
    if (nextProps.expanded !== nextProps.job) return false; // List is not expanded (hidden)
    if (this.props.modalType === ASBESTOS_SAMPLE_EDIT) return false; // Edit modal is open
    if (this.props.modalType === ASBESTOS_COC_EDIT) return false; // COC modal is open
    // return true; // Until i can get it working
    return true;
    // if (this.props.cocs[this.props.job].sampleList && this.props.samples[this.props.job] &&
    //   this.props.cocs[this.props.job].sampleList.length !== Object.keys(this.props.samples[this.props.job]).length)
    //   return false;
    //
    // if (nextProps.expanded === nextProps.job && this.props.expanded !== this.props.job) {
    //   return true; // List has been collapsed (closed)
    // }
    //
    // if (this.props.cocs[this.props.job] && nextProps.cocs[nextProps.job]
    //   && (this.props.cocs[this.props.job].labHasContactedClient !== nextProps.cocs[nextProps.job].labHasContactedClient
    //   || this.props.cocs[this.props.job].mostRecentIssueSent !== nextProps.cocs[nextProps.job].mostRecentIssueSent
    // )) return true;
    //
    // if (this.props.samples[this.props.job] && nextProps.samples[nextProps.job] &&
    //   this.props.samples[this.props.job] !== nextProps.samples[nextProps.job]) {
    //   console.log('Samples has changed');
    //   let update = false;
    //   Object.keys(nextProps.samples[nextProps.job]).forEach(sampleNumber => {
    //     console.log(this.props.samples[this.props.job][sampleNumber]);
    //     console.log(nextProps.samples[nextProps.job][sampleNumber]);
    //     if (this.props.samples[this.props.job] &&
    //       (!this.props.samples[this.props.job][sampleNumber] ||
    //       this.props.samples[this.props.job][sampleNumber].sampledBy !== nextProps.samples[nextProps.job][sampleNumber].sampledBy ||
    //       this.props.samples[this.props.job][sampleNumber].sampleDate !== nextProps.samples[nextProps.job][sampleNumber].sampleDate ||
    //       this.props.samples[this.props.job][sampleNumber].analyst !== nextProps.samples[nextProps.job][sampleNumber].analyst
    //     )) {
    //       console.log('update! summary');
    //       update = true;
    //     }
    //   });
    //   return update;
    // }
    // return false;
  }

  render() {
    const { samples, classes } = this.props;
    const job = this.props.cocs[this.props.job];
    if (job === undefined || job.deleted) return null;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    console.log(`rendering summary ${job.jobNumber}`);
    // console.log(samples[job.uid]);
    let sampledBy = 'N/A';
    let sampleDate = 'N/A';
    let analysts = 'N/A';
    if (samples && samples[job.uid]) {
      sampledBy = getPersonnel(Object.values(samples[job.uid]).filter(e => e.cocUid === job.uid), 'sampledBy', null, false).map(e => e.name).join(', ');
      sampleDate = writeDates(Object.values(samples[job.uid]).filter(e => e.cocUid === job.uid), 'sampleDate');
      analysts = getPersonnel(Object.values(samples[this.props.job]).filter(s => s.cocUid === job.uid), 'analyst', null, false).map(e => e.name).join(", ");
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
  )(AsbestosBulkCocSummary)
);
