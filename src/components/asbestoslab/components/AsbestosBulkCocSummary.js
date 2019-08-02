import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
} from "../../../config/firebase";
import moment from "moment";
import { addLog, } from "../../../actions/local";

import { TickyBox, } from '../../../widgets/FormWidgets';
import Grid from "@material-ui/core/Grid";

const mapStateToProps = state => {
  return {
    samples: state.asbestosLab.samples,
    cocs: state.asbestosLab.cocs,
  };
};

class AsbestosBulkCocSummary extends React.Component {
  // static whyDidYouRender = true;

  shouldComponentUpdate(nextProps) {
    if (this.props.cocs[this.props.job] !== nextProps.cocs[nextProps.job] ||
      (this.props.samples && this.props.samples[this.props.job] &&
      Object.keys(this.props.samples[this.props.job]).length < this.props.cocs[this.props.job].sampleList.length &&
      Object.keys(nextProps.samples[nextProps.job]).length === nextProps.cocs[nextProps.job].sampleList.length)) {
        return true;
    } else {
      // console.log('Blocked re-render of Summary');
      return false;
    }
  }

  render() {
    const { samples, classes, analysts, dates } = this.props;
    const job = this.props.cocs[this.props.job];
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;

    // let stats = getStats(samples[job.uid], job);
    console.log(`${job.jobNumber} summary rendering`);
    return (
      <Grid container direction="row" className={classes.marginTopBottomSmall} alignItems="flex-start" justify="center">
        <Grid item lg={3} xs={6}>
          <span className={classes.headingInline}>Sampled by:</span>{" "}
          <span className={ classes.infoLight }>
            {job.personnel && job.personnel.length > 0
              ? job.personnel.join(", ")
              : "Not specified"}
          </span>
          <br />
          <span className={classes.headingInline}>Date(s) Sampled:</span>{" "}
          <span className={ classes.infoLight }>
            {dates && dates.length > 0
              ? dates.join(", ")
              : "Not specified"}
          </span>
          <br />
          <span className={classes.headingInline}>Analysis by:</span>{" "}
          <span className={ classes.infoLight }>
            {analysts ? analysts.join(", ") : "Not specified"}
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
