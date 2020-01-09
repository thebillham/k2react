import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { REPORT_ACTIONS } from "../../../constants/modal-types";
import { showModal } from "../../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import WfmTimeModal from "../modals/WfmTimeModal";
import ClosedArrow from "@material-ui/icons/ArrowDropDown";
import OpenArrow from "@material-ui/icons/ArrowDropUp";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncIcon from "@material-ui/icons/Sync";
import LinkIcon from "@material-ui/icons/Link";
import TimerIcon from "@material-ui/icons/Timer";
import PrintIcon from "@material-ui/icons/Print";
import IssueVersionIcon from "@material-ui/icons/Send";
import Select from "react-select";
import SuggestionField from "../../../widgets/SuggestionField";
import AsbestosRegisterTable from "../components/AsbestosRegisterTable";
import AsbestosSurveyTable from "../components/AsbestosSurveyTable";
import NonAsbestosTable from "../components/NonAsbestosTable";
import AirMonitoringRecords from "../components/AirMonitoringRecords";
import ExecutiveSummaryAmp from "./components/ExecutiveSummaryAmp";

import Template1Icon from "@material-ui/icons/Filter1";
import Template2Icon from "@material-ui/icons/Filter2";
import Template3Icon from "@material-ui/icons/Filter3";

import { DatePicker } from "@material-ui/pickers";

import classNames from "classnames";
import Popup from "reactjs-popup";
import { addLog } from "../../../actions/local";

import { getJobColor, handleJobChange } from "../../../actions/jobs";

import {
  collateSamples,
  issueDocument
} from "../../../actions/asbestosReportHelpers";

import moment from "moment";
import _ from "lodash";

import { filterMap, filterMapReset } from "../../../actions/display";

const mapStateToProps = state => {
  return {
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
    siteAcm: state.jobs.siteAcm,
    samples: state.asbestosLab.samples,
    staff: state.local.staff
  };
};

const mapDispatchToProps = dispatch => {
  return {
    issueDocument: issue => dispatch(issueDocument(issue)),
    handleJobChange: info => dispatch(handleJobChange(info)),
    handleJobChangeDebounced: _.debounce(
      info => dispatch(handleJobChange(info)),
      2000
    )
  };
};

class AsbestosManagementPlan extends React.Component {
  state = {
    templateVersion: 3
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
      wfmClients,
      site,
      sites,
      siteJobs,
      siteAcm,
      samples,
      staff
    } = this.props;
    const { registerMap, registerList, airMonitoringRecords } = this.state;
    const names = [{ name: "3rd Party", uid: "3rd Party" }].concat(
      Object.values(this.props.staff).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    console.log(m);
    let latestIssue = 0;

    if (m.versions && Object.keys(m.versions).length > 0) {
      latestIssue = Math.max(
        ...Object.keys(m.versions).map(key => parseInt(key))
      );
    }
    console.log(latestIssue);
    console.log(m.issues[latestIssue]);

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
                    this.props.issueDocument({
                      template: `AMP${this.state.templateVersion}`,
                      site: sites[site],
                      job: m,
                      registerMap,
                      registerList,
                      airMonitoringRecords,
                      staff
                    });
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
                    action={`https://api.k2.co.nz/v1/doc/scripts/asbestos/amp/${this.state.templateVersion}.php`}
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
                          site: site
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
          <Grid item xs={12} md={5}>
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
          </Grid>
          <Grid item xs={12} md={7}>
            <AirMonitoringRecords
              loading={loading}
              airMonitoringRecords={airMonitoringRecords}
              classes={classes}
            />
          </Grid>
        </Grid>
      );
    } else return <div />;
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosManagementPlan)
);
