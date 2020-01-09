import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

import { showModal } from "../../../actions/modal";
import {
  WFM_TIME,
  SITE_JOB,
  ASBESTOS_COC_EDIT
} from "../../../constants/modal-types";
import Button from "@material-ui/core/Button";

import ClosedArrow from "@material-ui/icons/ArrowDropDown";
import OpenArrow from "@material-ui/icons/ArrowDropUp";
import InputLabel from "@material-ui/core/InputLabel";
import Zoom from "@material-ui/core/Zoom";
import Grow from "@material-ui/core/Grow";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Collapse from "@material-ui/core/Collapse";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import RemoveIcon from "@material-ui/icons/Remove";
import Select from "react-select";
import SyncIcon from "@material-ui/icons/Sync";
import LinkIcon from "@material-ui/icons/Link";
import TimerIcon from "@material-ui/icons/Timer";
import DeleteIcon from "@material-ui/icons/Close";
import SuggestionField from "../../../widgets/SuggestionField";
import EditIcon from "@material-ui/icons/Edit";

import {
  Map,
  GoogleApiWrapper,
  Marker,
  InfoWindow,
  Listing
} from "google-maps-react";

import { DatePicker, DateTimePicker } from "@material-ui/pickers";

import {
  dateOf,
  andList,
  personnelConvert,
  numericOnly
} from "../../../actions/helpers";

import moment from "moment";
import classNames from "classnames";
import _ from "lodash";

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  deleteSiteJob,
  clearWfmJob,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  collateJobsList,
  getJobColor,
  getStateString,
  getWfmUrl,
  getJobIcon,
  getDetailedWFMJob,
  handleJobChange,
  handleSiteChange
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
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
    siteCocs: state.jobs.siteCocs,
    me: state.local.me,
    staff: state.local.staff,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType,
    siteTypes: state.const.siteTypes,
    assetClassesTrain: state.const.assetClassesTrain
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    handleSiteChange: info => dispatch(handleSiteChange(info)),
    handleSiteChangeDebounced: _.debounce(
      info => dispatch(handleSiteChange(info)),
      2000
    ),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    fetchCurrentJobState: ignoreCompleted =>
      dispatch(fetchCurrentJobState(ignoreCompleted)),
    clearWfmJob: () => dispatch(clearWfmJob()),
    saveCurrentJobState: state => dispatch(saveCurrentJobState(state)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: modal => dispatch(showModal(modal)),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    collateJobsList: (
      wfmJobs,
      wfmLeads,
      currentJobState,
      wfmClients,
      geocodes
    ) =>
      dispatch(
        collateJobsList(
          wfmJobs,
          wfmLeads,
          currentJobState,
          wfmClients,
          geocodes
        )
      )
  };
};

const mapStyles = {
  borderStyle: "solid",
  borderWidth: 1,
  padding: 12,
  margin: 12,
  borderRadius: 12,
  width: "40vw",
  height: "25vw"
};

class SiteGeneralInformation extends React.Component {
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
      if (
        site.siteVisitsAsbestos &&
        Object.keys(site.siteVisitsAsbestos).length > 0
      ) {
        countSiteVisitsAsbestos = Math.max(
          ...Object.keys(site.siteVisitsAsbestos).map(key => parseInt(key))
        );
      }
      if (site.clearances && Object.keys(site.clearances).length > 0) {
        countClearances = Math.max(
          ...Object.keys(site.clearances).map(key => parseInt(key))
        );
      }
    }
    this.setState({
      countSiteVisitsAsbestos,
      countClearances
    });
  }

  toggleCollapse = name => {
    this.setState({
      [`open${name}`]: !this.state[`open${name}`]
    });
  };

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
    const {
      classes,
      site,
      google,
      geocodes,
      wfmClients,
      that,
      siteJobs,
      siteTypes,
      assetClassesTrain
    } = this.props;
    const names = [{ name: "3rd Party", uid: "3rd Party" }].concat(
      Object.values(this.props.staff).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    let m = this.props.sites && this.props.sites[site];
    // console.log(m);
    console.log(this.props.siteCocs);

    if (m) {
      const color = classes[getJobColor(m.primaryJobType)];
      let maxLength =
        this.props.otherOptions &&
        this.props.otherOptions.filter(
          opt => opt.option === "jobLeadEmailLength"
        ).length > 0
          ? parseInt(
              this.props.otherOptions.filter(
                opt => opt.option === "jobLeadEmailLength"
              )[0].value
            )
          : 600;
      return (
        <Grid container>
          <Grid item xs={12} md={5}>
            {m.siteImageUrl && (
              <div className={classes.informationBoxWhiteRounded}>
                <img
                  src={m.siteImageUrl}
                  style={{ width: "100%", borderRadius: 12 }}
                />
              </div>
            )}
            <div className={classes.informationBoxWhiteRounded}>
              <TextField
                className={classes.formInputLarge}
                id="siteName"
                label="Site Name"
                defaultValue={m.siteName || ""}
                onChange={e => {
                  this.props.handleSiteChangeDebounced({
                    site: m,
                    field: "siteName",
                    val: e.target.value
                  });
                }}
              />
              <InputLabel>Site Type</InputLabel>
              <Select
                className={classes.selectTight}
                value={
                  m.type
                    ? {
                        value: m.type,
                        label: siteTypes.filter(e => e.value === m.type)[0]
                          .label
                      }
                    : { value: "", label: "" }
                }
                options={siteTypes.map(e => ({
                  value: e.value,
                  label: e.label
                }))}
                onChange={e => {
                  this.props.handleSiteChangeDebounced({
                    site: m,
                    field: "type",
                    val: e.target.value
                  });
                }}
              />
              {m.type === "train" && (
                <div>
                  <div>
                    <InputLabel>Asset Class</InputLabel>
                    <Select
                      className={classes.selectTight}
                      value={
                        m.assetClass
                          ? { value: m.assetClass, label: m.assetClass }
                          : { value: "", label: "" }
                      }
                      options={assetClassesTrain.map(e => ({
                        value: e.label,
                        label: e.label
                      }))}
                      onChange={e => {
                        this.props.handleSiteChangeDebounced({
                          site: m,
                          field: "assetClass",
                          val: e.target.value
                        });
                      }}
                    />
                  </div>
                  <TextField
                    className={classes.formInputLarge}
                    id="assetClass"
                    label="Asset Number"
                    defaultValue={m.assetNumber || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "assetNumber",
                        val: numericOnly(e.target.value)
                      });
                    }}
                  />
                  <TextField
                    className={classes.formInputLarge}
                    id="manufacturedBy"
                    label="Manufactured By"
                    defaultValue={m.manufacturedBy || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "manufacturedBy",
                        val: e.target.value
                      });
                    }}
                  />
                  <TextField
                    className={classes.formInputLarge}
                    id="countryOfOrigin"
                    label="Country of Origin"
                    defaultValue={m.countryOfOrigin || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "countryOfOrigin",
                        val: e.target.value
                      });
                    }}
                  />
                  <TextField
                    className={classes.formInputLarge}
                    id="previousClassifications"
                    label="Previous Classifications"
                    multiline
                    rows={2}
                    defaultValue={m.previousClassifications || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "previousClassifications",
                        val: e.target.value
                      });
                    }}
                  />
                  <TextField
                    className={classes.formInputLarge}
                    id="notesOnService"
                    label="Notes on Service and Use"
                    multiline
                    rows={5}
                    defaultValue={m.notesOnService || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "notesOnService",
                        val: e.target.value
                      });
                    }}
                  />
                  <TextField
                    className={classes.formInputLarge}
                    id="notesOnModification"
                    label="Notes on Modification/Overhauls"
                    multiline
                    rows={5}
                    defaultValue={m.notesOnModification || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "notesOnModification",
                        val: e.target.value
                      });
                    }}
                  />
                  <TextField
                    className={classes.formInputLarge}
                    id="manufactureYear"
                    label="Year(s) of Manufacture"
                    defaultValue={m.manufactureYear || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "manufactureYear",
                        val: e.target.value
                      });
                    }}
                  />
                </div>
              )}
            </div>

            {false && m.geocode && m.geocode.address !== "New Zealand" && (
              <Map
                google={google}
                zoom={8}
                style={mapStyles}
                initialCenter={{
                  lat: m.geocode.location[0],
                  lng: m.geocode.location[1]
                }}
              >
                <Marker
                  // animation={this.props.google.maps.Animation.DROP}
                  key={m.wfmID}
                  // onClick={(props, marker, e) => {
                  //   that.onMarkerClick(marker, m);
                  // }}
                  position={{
                    lat: m.geocode.location[0],
                    lng: m.geocode.location[1]
                  }}
                  title={`${m.jobNumber}: ${m.client}`}
                  icon={{
                    url: getJobIcon(m.category),
                    scaledSize: new google.maps.Size(32, 32)
                  }}
                />
              </Map>
            )}
          </Grid>
          <Grid item xs={12} md={7}>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classes.flexRowSpread}>
                <div className={classNames(color, classes.expandHeading)}>
                  Jobs
                </div>
                <Tooltip title={"Add Job"}>
                  <IconButton
                    onClick={e => {
                      this.props.showModal({
                        modalType: SITE_JOB,
                        modalProps: { doc: { site: site, deleted: false } }
                      });
                    }}
                  >
                    <AddIcon className={classes.iconRegular} />
                  </IconButton>
                </Tooltip>
              </div>
              {siteJobs &&
              siteJobs[m.uid] &&
              Object.keys(siteJobs[m.uid]).length > 0 ? (
                Object.values(siteJobs[m.uid]).map(j => {
                  // console.log(j);
                  let jColor = classes[getJobColor(j.category)];
                  return (
                    <div
                      className={classNames(
                        classes.flexRowSpread,
                        classes.hoverColor
                      )}
                      key={j.jobDescription + j.jobNumber}
                    >
                      <div>
                        <div
                          className={classNames(jColor, classes.expandHeading)}
                          onClick={() => that.handleTabChange(null, j.uid)}
                        >
                          {`${j.jobNumber} ${j.jobDescription}`}
                        </div>
                        <div>{`${j.client}: ${j.address}`}</div>
                      </div>
                      <div className={classes.flexRow}>
                        <Tooltip title={"Re-sync with WorkflowMax"}>
                          <IconButton
                            onClick={e =>
                              this.props.getDetailedWFMJob({
                                jobNumber: j.jobNumber,
                                setUpJob: true
                              })
                            }
                          >
                            <SyncIcon className={classes.iconRegular} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={"View Job on WorkflowMax"}>
                          <IconButton
                            onClick={() =>
                              window.open(
                                `https://my.workflowmax.com/job/jobview.aspx?id=${j.wfmID}`
                              )
                            }
                          >
                            <LinkIcon className={classes.iconRegular} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={"Log Time to WorkflowMax"}>
                          <IconButton
                            onClick={e => {
                              this.props.showModal({
                                modalType: WFM_TIME,
                                modalProps: { job: j }
                              });
                            }}
                          >
                            <TimerIcon className={classes.iconRegular} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={"Delete Job"}>
                          <IconButton
                            onClick={e => {
                              if (
                                window.confirm(
                                  "Are you sure you wish to delete this job?"
                                )
                              )
                                deleteSiteJob({ job: j, site });
                            }}
                          >
                            <DeleteIcon className={classes.iconRegular} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>No jobs assigned to site.</div>
              )}
            </div>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>
                Site Visits
              </div>
              <div
                className={classNames(
                  classes.subHeading,
                  classes.flexRowCenter
                )}
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
                  s =
                    m.siteVisitsAsbestos && m.siteVisitsAsbestos[num]
                      ? m.siteVisitsAsbestos[num]
                      : {};
                // console.log(s);
                return (
                  <div
                    className={classes.hoverNoFlex}
                    key={`siteVisitsAsbestos${num}`}
                  >
                    <div className={classes.flexRowBottom}>
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
                    </div>
                    <div className={classes.flexRowBottom}>
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
                              Object.values(this.props.siteJobs[m.uid]).map(
                                e => ({
                                  value: e.jobNumber,
                                  label: `${e.jobNumber}: ${e.jobDescription}`
                                })
                              )
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
                  </div>
                );
              })}
            </div>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>
                Chains of Custody
              </div>
              <div
                className={classNames(
                  classes.subHeading,
                  classes.flexRowCenter
                )}
              >
                <Button
                  variant="outlined"
                  className={classes.marginBottomSmall}
                  onClick={() => {
                    this.props.showModal({
                      modalType: ASBESTOS_COC_EDIT,
                      modalProps: {
                        title: "Add Historical Chain of Custody",
                        doc: {
                          samples: {},
                          deleted: false,
                          versionUpToDate: true,
                          mostRecentIssueSent: true,
                          historicalCoc: true
                        },
                        isNew: true
                      }
                    });
                  }}
                >
                  Add Historical Chain of Custody
                </Button>
              </div>
              {this.props.siteCocs && this.props.siteCocs[this.props.site] ? (
                Object.values(this.props.siteCocs[this.props.site]).map(coc =>
                  this.getCocListItem(coc)
                )
              ) : (
                <div>No Chains of Custody</div>
              )}
            </div>
            <div className={classes.informationBoxWhiteRounded}>
              <div className={classNames(color, classes.expandHeading)}>
                Clearances
              </div>
              <div
                className={classNames(
                  classes.subHeading,
                  classes.flexRowCenter
                )}
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
                  s =
                    m.clearances && m.clearances[num] ? m.clearances[num] : {};
                return (
                  <div className={classes.hoverNoFlex} key={`clearance${num}`}>
                    <div className={classes.flexRowBottom}>
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
                    </div>
                    <div className={classes.flexRowBottom}>
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
                              Object.values(this.props.siteJobs[m.uid]).map(
                                e => ({
                                  value: e.jobNumber,
                                  label: `${e.jobNumber}: ${e.jobDescription}`
                                })
                              )
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
                  </div>
                );
              })}
            </div>
          </Grid>
        </Grid>
      );
    } else return <div />;
  }

  getCocListItem = coc => {
    const { classes, samples } = this.props;
    return (
      <div className={classes.hoverNoFlex} key={coc.uid}>
        <div className={classes.flexRowSpread}>
          <div className={classNames(classes.columnMed, classes.bold)}>
            {`${coc.jobNumber} ${coc.client}`}
          </div>
          <div className={classes.columnMed}>
            {moment(dateOf(coc.issueDate)).format("ddd, D MMMM YYYY")}
          </div>
          <div className={classes.columnMedLarge}>
            {coc.sampleList
              ? `${coc.sampleList.length} ${
                  coc.sampleType === "air" ? "Air" : "Bulk"
                } Sample${coc.sampleList.length > 1 ? "s" : ""}`
              : ""}
          </div>
          <div className={classes.flexRow}>
            <Tooltip title="Edit Chain of Custody">
              <IconButton
                onClick={() => {
                  this.props.getDetailedWFMJob({ jobNumber: coc.jobNumber });
                  this.props.showModal({
                    modalType: ASBESTOS_COC_EDIT,
                    modalProps: {
                      title: "Edit Chain of Custody",
                      doc: coc
                    }
                  });
                }}
              >
                <EditIcon className={classes.iconRegular} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
})(
  withStyles(styles)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SiteGeneralInformation)
  )
);
