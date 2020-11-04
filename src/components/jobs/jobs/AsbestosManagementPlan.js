import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { REPORT_ACTIONS } from "../../../constants/modal-types";

import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import IssueVersionIcon from "@material-ui/icons/Send";
import AsbestosRegisterTable from "../components/AsbestosRegisterTable";

import Template1Icon from "@material-ui/icons/Filter1";
import Template2Icon from "@material-ui/icons/Filter2";
import Template3Icon from "@material-ui/icons/Filter3";

import classNames from "classnames";
import { addLog } from "../../../actions/local";

import { getJobColor, handleJobChange } from "../../../actions/jobs";

import {
  collateSamples,
  issueTrainAmp,
} from "../../../actions/asbestosReportHelpers";

import _ from "lodash";

import { filterMap, filterMapReset } from "../../../actions/display";

const mapStateToProps = (state) => {
  return {
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
    siteAcm: state.jobs.siteAcm,
    samples: state.asbestosLab.samples,
    staff: state.local.staff,
    classDescriptions: state.const.assetClassesTrain,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // issueDocument: issue => dispatch(issueDocument(issue)),
    issueTrainAmp: (issue) => dispatch(issueTrainAmp(issue)),
    handleJobChange: (info) => dispatch(handleJobChange(info)),
    handleJobChangeDebounced: _.debounce(
      (info) => dispatch(handleJobChange(info)),
      2000
    ),
  };
};

class AsbestosManagementPlan extends React.PureComponent {
  state = {
    templateVersion: 3,
  };

  UNSAFE_componentWillMount() {
    const { site, sites, siteJobs, siteAcm, samples } = this.props;
    const { registerMap, registerList, airMonitoringRecords } = collateSamples(
      sites[site],
      siteJobs ? siteJobs[site] || {} : {},
      siteAcm ? siteAcm[site] || {} : {},
      samples
    );
    this.setState({ registerMap, registerList, airMonitoringRecords });
  }

  render() {
    const {
      classes,
      m,
      site,
      sites,
      siteJobs,
      siteAcm,
      samples,
      staff,
      classDescriptions,
    } = this.props;
    const { registerMap, registerList, airMonitoringRecords } = this.state;
    let latestIssue = 0;

    if (m.versions && Object.keys(m.versions).length > 0) {
      latestIssue = Math.max(
        ...Object.keys(m.versions).map((key) => parseInt(key))
      );
    }
    // console.log(latestIssue);
    // console.log(m.issues[latestIssue]);

    if (m) {
      const color = classes[getJobColor(m.category)];
      const loading =
        !sites[site] || !siteJobs[site] || !siteAcm[site] || !samples;
      return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div className={classNames(classes[color], classes.heading)}>
              Prepare Document
            </div>
            <div>
              <InputLabel>Select Template Version</InputLabel>
              <div className={classes.flexRow}>
                <IconButton
                  onClick={() => this.setState({ templateVersion: 1 })}
                >
                  <Template1Icon
                    className={
                      this.state.templateVersion === 1
                        ? classes.iconRegularGreen
                        : classes.iconRegular
                    }
                  />
                </IconButton>
                <IconButton
                  onClick={() => this.setState({ templateVersion: 2 })}
                >
                  <Template2Icon
                    className={
                      this.state.templateVersion === 2
                        ? classes.iconRegularGreen
                        : classes.iconRegular
                    }
                  />
                </IconButton>
                <IconButton
                  onClick={() => this.setState({ templateVersion: 3 })}
                >
                  <Template3Icon
                    className={
                      this.state.templateVersion === 3
                        ? classes.iconRegularGreen
                        : classes.iconRegular
                    }
                  />
                </IconButton>
                <Button
                  className={classes.buttonIconText}
                  onClick={() => {
                    this.props.issueTrainAmp({
                      site: sites[site],
                      job: m,
                      registerMap,
                      registerList,
                      classDescriptions,
                      airMonitoringRecords,
                      siteAcm: siteAcm[site],
                      staff,
                    });
                    // this.props.issueDocument({
                    //   template: `AMP${this.state.templateVersion}`,
                    //   site: sites[site],
                    //   job: m,
                    //   registerMap,
                    //   registerList,
                    //   airMonitoringRecords,
                    //   staff
                    // });
                    // this.props.showModal({
                    //   modalType: REPORT_ACTIONS,
                    //   modalProps: { job: job, title: `Issue Asbestos Management Plan ${job.jobNumber} (${job.client}: ${job.address})`, }
                    // });
                  }}
                >
                  <IssueVersionIcon className={classes.iconRegular} />
                  Issue Document
                </Button>
                <div>
                  <form
                    method="post"
                    target="_blank"
                    action={`https://api.k2.co.nz/v1/doc/scripts/asbestos/amp/train.php`}
                  >
                    <input
                      type="hidden"
                      name="data"
                      value={
                        m.issues && m.issues[latestIssue]
                          ? JSON.stringify(m.issues[latestIssue])
                          : ""
                      }
                    />
                    <Button
                      className={classes.buttonIconText}
                      type="submit"
                      onClick={() => {
                        let log = {
                          type: "Document",
                          log: `Asbestos Management Plan downloaded.`,
                          job: m.uid,
                          site: site,
                        };
                        addLog("job", log, this.props.me);
                      }}
                    >
                      <PrintIcon className={classes.iconRegular} />
                      Download Document
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <AsbestosRegisterTable
              loading={loading}
              registerList={registerList}
              classes={classes}
            />
          </Grid>
          {/*<Grid item xs={12} md={5}>
            <ExecutiveSummaryAmp
              job={m}
              siteUid={site}
              siteAcm={siteAcm[site]}
              site={sites[site]}
              that={this}
              staff={staff}
              onChange={this.props.handleJobChangeDebounced}
              template={this.state.templateVersion}
              classes={classes}
            />
          </Grid>*/}
          <Grid item xs={12} md={7}>
            {/*<AirMonitoringRecords
              loading={loading}
              airMonitoringRecords={airMonitoringRecords}
              classes={classes}
            />*/}
          </Grid>
        </Grid>
      );
    } else return <div />;
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(AsbestosManagementPlan)
);
