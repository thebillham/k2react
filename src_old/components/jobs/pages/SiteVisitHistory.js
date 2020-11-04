import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

//Modals
import { WFM_TIME } from "../../../constants/modal-types";
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
import Select from "react-select";
import SuggestionField from "../../../widgets/SuggestionField";

import { DatePicker } from "@material-ui/pickers";
import _ from "lodash";

import classNames from "classnames";
import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
  personnelConvert
} from "../../../actions/helpers";

import moment from "moment";

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  getDetailedWFMJob,
  clearWfmJob,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  collateJobsList,
  getJobColor,
  getStateString,
  getNextActionType,
  getNextActionOverdueBy,
  handleSiteChange,
  getWfmUrl,
  getLeadHistoryDescription,
  handleJobChange
} from "../../../actions/jobs";

import { filterMap, filterMapReset } from "../../../actions/display";

const mapStateToProps = state => {
  return {
    asbestosRemovalists: state.const.asbestosRemovalists,
    siteVisitTypeAsbestos: state.const.siteVisitTypeAsbestos,
    wfmJobs: state.jobs.wfmJobs,
    wfmJob: state.jobs.wfmJob,
    wfmLeads: state.jobs.wfmLeads,
    wfmClients: state.jobs.wfmClients,
    currentJobState: state.jobs.currentJobState,
    geocodes: state.jobs.geocodes,
    wfmItems: state.jobs.wfmItems,
    wfmStats: state.jobs.wfmStats,
    jobList: state.jobs.jobList,
    search: state.local.search,
    staff: state.local.staff,
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
    me: state.local.me,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    handleSiteChange: info => dispatch(handleSiteChange(info)),
    handleSiteChangeDebounced: _.debounce(
      info => dispatch(handleSiteChange(info)),
      2000
    ),
    clearWfmJob: () => dispatch(clearWfmJob()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: modal => dispatch(showModal(modal))
  };
};

class SiteVisitHistory extends React.Component {
  state = {
    countSiteVisitsAsbestos: 1,
    countClearances: 1,

    update: {}
  };

  UNSAFE_componentWillMount() {
    let countSiteVisitsAsbestos = 1,
      countClearances = 1;
    if (this.props.sites && this.props.sites[this.props.site]) {
      let site = this.props.sites[this.props.site];
      if (site.siteVisits && Object.keys(site.siteVisits).length > 0) {
        countSiteVisitsAsbestos = Math.max(
          ...Object.keys(site.siteVisits).map(key => parseInt(key))
        );
      }
      if (
        site.asbestosRemovals &&
        Object.keys(site.asbestosRemovals).length > 0
      ) {
        countClearances = Math.max(
          ...Object.keys(site.asbestosRemovals).map(key => parseInt(key))
        );
      }
    }
    this.setState({
      countSiteVisitsAsbestos,
      countClearances
    });
  }

  addList = field => {
    this.setState({
      [`count${field}`]: this.state[`count${field}`]
        ? this.state[`count${field}`] + 1
        : 2
    });
  };

  removeList = field => {
    let obj = field ? field.slice(0, 1).toLowerCase() + field.slice(1) : null;
    let num = this.state[`count${field}`] ? this.state[`count${field}`] : 1;
    if (obj)
      this.props.handleSiteChange({
        site: this.props.sites[this.props.site],
        o1: [obj],
        field: num,
        val: "delete"
      });
    this.setState({
      [`count${field}`]: this.state[`count${field}`]
        ? this.state[`count${field}`] > 1
          ? this.state[`count${field}`] - 1
          : 1
        : 1
    });
  };

  render() {
    const { classes, that, site, wfmClients, geocodes } = this.props;
    const names = [{ name: "3rd Party", uid: "3rd Party" }].concat(
      Object.values(this.props.staff).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    const m =
      this.props.sites && this.props.sites[site]
        ? this.props.sites[site]
        : null;

    console.log(m);

    if (m) {
      const color = classes[getJobColor(m.primaryJobType)];
      return (
        <div>
          <div className={classes.informationBoxWhiteRounded}>
            <div className={classNames(color, classes.expandHeading)}>
              Site Visits
            </div>
            <div
              className={classNames(classes.subHeading, classes.flexRowCenter)}
            >
              <IconButton
                size="small"
                aria-label="add"
                className={classes.marginLeftSmall}
                onClick={() => this.addList("SiteVisitsAsbestos")}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="remove"
                className={classes.marginLeftSmall}
                onClick={() => this.removeList("SiteVisitsAsbestos")}
              >
                <RemoveIcon />
              </IconButton>
            </div>
            {[
              ...Array(
                this.state.countSiteVisitsAsbestos
                  ? this.state.countSiteVisitsAsbestos
                  : 1
              ).keys()
            ].map(i => {
              let num = i + 1,
                s = m.siteVisits && m.siteVisits[num] ? m.siteVisits[num] : {};
              console.log(s);
              return (
                <div
                  className={classes.flexRowHoverPretty}
                  key={`siteVisitsAsbestos${num}`}
                >
                  <div className={classes.circleShaded}>{num}</div>
                  <DatePicker
                    value={s.date ? dateOf(s.date) : null}
                    autoOk
                    className={classes.columnMed}
                    format="ddd, D MMMM YYYY"
                    label={"Date"}
                    disableToolbar
                    variant="inline"
                    openTo="year"
                    views={["year", "month", "date"]}
                    onChange={date => {
                      this.props.handleSiteChange({
                        site: m,
                        o1: "siteVisitsAsbestos",
                        o2: num.toString(),
                        field: "date",
                        val: dateOf(date)
                      });
                    }}
                  />
                  <div>
                    <InputLabel>Site Personnel</InputLabel>
                    <Select
                      isMulti
                      className={classNames(
                        classes.selectTight,
                        s.personnel && s.personnel[0].uid === "3rd Party"
                          ? classes.columnMed
                          : classes.columnExtraLarge
                      )}
                      value={
                        s.personnel
                          ? s.personnel.map(e => ({
                              value: e.uid,
                              label: e.name
                            }))
                          : null
                      }
                      options={names.map(e => ({
                        value: e.uid,
                        label: e.name
                      }))}
                      onChange={e => {
                        this.props.handleSiteChange({
                          site: m,
                          o1: "siteVisitsAsbestos",
                          o2: num.toString(),
                          field: "personnel",
                          val: personnelConvert(e)
                        });
                      }}
                    />
                  </div>
                  {s.personnel && s.personnel[0].uid === "3rd Party" && (
                    <TextField
                      label="3rd Party Company Name"
                      className={classes.columnMedLarge}
                      defaultValue={s.companyName ? s.companyName : null}
                      onChange={e => {
                        this.props.handleSiteChangeDebounced({
                          site: m,
                          o1: "siteVisitsAsbestos",
                          o2: num.toString(),
                          field: "companyName",
                          val: e.target.value
                        });
                      }}
                    />
                  )}
                  <div>
                    <InputLabel>Site Visit Type</InputLabel>
                    <Select
                      className={classNames(
                        classes.selectTight,
                        classes.columnLarge
                      )}
                      value={
                        s.type
                          ? {
                              value: s.type,
                              label: this.props.siteVisitTypeAsbestos.filter(
                                e => e.value === s.type
                              )[0].label
                            }
                          : null
                      }
                      options={this.props.siteVisitTypeAsbestos}
                      onChange={e => {
                        this.props.handleSiteChange({
                          site: m,
                          o1: "siteVisitsAsbestos",
                          o2: num.toString(),
                          field: "type",
                          val: e.value
                        });
                      }}
                    />
                  </div>
                  {s.personnel && s.personnel[0].uid === "3rd Party" ? (
                    <TextField
                      label="Reference/Job Number"
                      className={classes.columnMed}
                      defaultValue={
                        s.referenceNumber ? s.referenceNumber : null
                      }
                      onChange={e => {
                        this.props.handleSiteChangeDebounced({
                          site: m,
                          o1: "siteVisitsAsbestos",
                          o2: num.toString(),
                          field: "referenceNumber",
                          val: e.target.value
                        });
                      }}
                    />
                  ) : (
                    <div>
                      <InputLabel>Job Number</InputLabel>
                      <Select
                        placeholder={"Add Job Numbers from Home Screen"}
                        className={classNames(
                          classes.selectTight,
                          classes.columnMed
                        )}
                        value={
                          s.referenceNumber
                            ? {
                                value: s.referenceNumber,
                                label: s.referenceNumber
                              }
                            : null
                        }
                        options={
                          this.props.siteJobs &&
                          this.props.siteJobs[m.uid] &&
                          Object.values(this.props.siteJobs[m.uid]).map(e => ({
                            value: e.jobNumber,
                            label: `${e.jobNumber}: ${e.jobDescription}`
                          }))
                        }
                        onChange={e => {
                          this.props.handleSiteChange({
                            site: m,
                            o1: "siteVisitsAsbestos",
                            o2: num.toString(),
                            field: "referenceNumber",
                            val: e.value
                          });
                        }}
                      />
                    </div>
                  )}
                  <div className={classes.spacerSmall} />
                  <TextField
                    label="Notes"
                    className={classes.columnLarge}
                    defaultValue={s.notes ? s.notes : null}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        o1: "siteVisitsAsbestos",
                        o2: num.toString(),
                        field: "notes",
                        val: e.target.value
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className={classes.informationBoxWhiteRounded}>
            <div className={classNames(color, classes.expandHeading)}>
              Clearances
            </div>
            <div
              className={classNames(classes.subHeading, classes.flexRowCenter)}
            >
              <IconButton
                size="small"
                aria-label="add"
                className={classes.marginLeftSmall}
                onClick={() => this.addList("Clearances")}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="remove"
                className={classes.marginLeftSmall}
                onClick={() => this.removeList("Clearances")}
              >
                <RemoveIcon />
              </IconButton>
            </div>
            {[
              ...Array(
                this.state.countClearances ? this.state.countClearances : 1
              ).keys()
            ].map(i => {
              let num = i + 1,
                s = m.clearances && m.clearances[num] ? m.clearances[num] : {};
              return (
                <div className={classes.flexRowHover} key={`clearance${num}`}>
                  <div className={classes.circleShaded}>{num}</div>
                  <div className={classes.columnMedLarge}>
                    <InputLabel>Asbestos Removalist</InputLabel>
                    <SuggestionField
                      that={this}
                      suggestions="asbestosRemovalists"
                      defaultValue={
                        s.asbestosRemovalist ? s.asbestosRemovalist : ""
                      }
                      onModify={value => {
                        this.props.handleSiteChangeDebounced({
                          site: m,
                          o1: "clearances",
                          o2: num.toString(),
                          field: "asbestosRemovalist",
                          val: value
                        });
                        if (
                          this.props.asbestosRemovalists &&
                          this.props.asbestosRemovalists.filter(
                            e => e.label === value
                          ).length > 0
                        )
                          this.props.handleSiteChange({
                            site: m,
                            o1: "clearances",
                            o2: num.toString(),
                            field: "asbestosRemovalistLicence",
                            val: this.props.asbestosRemovalists.filter(
                              e => e.label === value
                            )[0].value
                          });
                      }}
                    />
                  </div>
                  <TextField
                    label="Asbestos Removalist Licence Number"
                    className={classes.columnMed}
                    value={
                      s.asbestosRemovalistLicence
                        ? s.asbestosRemovalistLicence
                        : ""
                    }
                    onChange={e => {
                      this.props.handleSiteChange({
                        site: m,
                        o1: "clearances",
                        o2: num.toString(),
                        field: "asbestosRemovalistLicence",
                        val: e.target.value
                      });
                    }}
                  />
                  <DatePicker
                    value={s.removalDate ? dateOf(s.removalDate) : null}
                    autoOk
                    className={classes.columnMed}
                    format="ddd, D MMMM YYYY"
                    variant="inline"
                    disableToolbar
                    label={"Removal Completion Date"}
                    views={["year", "month", "date"]}
                    openTo="year"
                    onChange={date => {
                      this.props.handleSiteChange({
                        site: m,
                        o1: "clearances",
                        o2: num.toString(),
                        field: "removalDate",
                        val: dateOf(date)
                      });
                    }}
                  />
                  <TextField
                    label="Description of Removal"
                    className={classes.columnMedLarge}
                    multiline
                    defaultValue={s.description ? s.description : ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        o1: "clearances",
                        o2: num.toString(),
                        field: "description",
                        val: e.target.value
                      });
                    }}
                  />
                  <div className={classes.spacerSmall} />
                  <DatePicker
                    value={s.clearanceDate ? dateOf(s.clearanceDate) : null}
                    autoOk
                    className={classes.columnMed}
                    format="ddd, D MMMM YYYY"
                    variant="inline"
                    disableToolbar
                    label={"Clearance Inspection Date"}
                    views={["year", "month", "date"]}
                    openTo="year"
                    onChange={date => {
                      this.props.handleSiteChange({
                        site: m,
                        o1: "clearances",
                        o2: num.toString(),
                        field: "clearanceDate",
                        val: dateOf(date)
                      });
                    }}
                  />
                  <div className={classes.spacerSmall} />
                  <div
                    className={
                      s.personnel && s.personnel[0].uid === "3rd Party"
                        ? classes.columnMed
                        : classes.columnLarge
                    }
                  >
                    <InputLabel>Asbestos Assessor</InputLabel>
                    <Select
                      isMulti
                      className={classes.selectTight}
                      value={
                        s.personnel
                          ? s.personnel.map(e => ({
                              value: e.uid,
                              label: e.name
                            }))
                          : null
                      }
                      options={names.map(e => ({
                        value: e.uid,
                        label: e.name
                      }))}
                      onChange={e => {
                        this.props.handleSiteChange({
                          site: m,
                          o1: "clearances",
                          o2: num.toString(),
                          field: "personnel",
                          val: personnelConvert(e)
                        });
                      }}
                    />
                  </div>
                  {s.personnel && s.personnel[0].uid === "3rd Party" && (
                    <TextField
                      label="Licence Number"
                      className={classes.columnMed}
                      defaultValue={
                        s.asbestosAssessorLicence
                          ? s.asbestosAssessorLicence
                          : ""
                      }
                      onChange={e => {
                        this.props.handleSiteChangeDebounced({
                          site: m,
                          o1: "clearances",
                          o2: num.toString(),
                          field: "asbestosAssessorLicence",
                          val: e.target.value
                        });
                      }}
                    />
                  )}
                  {s.personnel && s.personnel[0].uid === "3rd Party" ? (
                    <TextField
                      label="Reference/Job Number"
                      className={classes.columnMed}
                      defaultValue={
                        s.referenceNumber ? s.referenceNumber : null
                      }
                      onChange={e => {
                        this.props.handleSiteChangeDebounced({
                          site: m,
                          o1: "clearances",
                          o2: num.toString(),
                          field: "referenceNumber",
                          val: e.target.value
                        });
                      }}
                    />
                  ) : (
                    <div>
                      <InputLabel>Job Number</InputLabel>
                      <Select
                        placeholder={"Add Job Numbers from Home Screen"}
                        className={classNames(
                          classes.selectTight,
                          classes.columnMed
                        )}
                        value={
                          s.referenceNumber
                            ? {
                                value: s.referenceNumber,
                                label: s.referenceNumber
                              }
                            : null
                        }
                        options={
                          this.props.siteJobs &&
                          this.props.siteJobs[m.uid] &&
                          Object.values(this.props.siteJobs[m.uid]).map(e => ({
                            value: e.jobNumber,
                            label: `${e.jobNumber}: ${e.jobDescription}`
                          }))
                        }
                        onChange={e => {
                          this.props.handleSiteChange({
                            site: m,
                            o1: "clearances",
                            o2: num.toString(),
                            field: "referenceNumber",
                            val: e.value
                          });
                        }}
                      />
                    </div>
                  )}
                  <div className={classes.spacerSmall} />
                  <DatePicker
                    value={s.issueDate ? dateOf(s.issueDate) : null}
                    autoOk
                    className={classes.columnMed}
                    format="ddd, D MMMM YYYY"
                    variant="inline"
                    disableToolbar
                    label={"Certificate Issue Date"}
                    views={["year", "month", "date"]}
                    openTo="year"
                    onChange={date => {
                      this.props.handleSiteChange({
                        site: m,
                        o1: "clearances",
                        o2: num.toString(),
                        field: "issueDate",
                        val: dateOf(date)
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    } else return <div />;
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteVisitHistory)
);
