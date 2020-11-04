import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

import { showModal } from "../../../actions/modal";
import {
  WFM_TIME,
  SITE_JOB,
  ASBESTOS_COC_EDIT,
  SITE_VISIT,
  ASBESTOS_CLEARANCE
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
      500
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
    update: {}
  };

  toggleCollapse = name => {
    this.setState({
      [`open${name}`]: !this.state[`open${name}`]
    });
  };

  updateArray = (obj, arr, index) => {
    if (obj === "delete") arr.splice(index, 1);
    else arr[index] = obj;
    return arr;
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
      siteCocs,
      siteTypes,
      assetClassesTrain
    } = this.props;
    const names = [{ name: "3rd Party", uid: "3rd Party" }].concat(
      Object.values(this.props.staff).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    let m = this.props.sites && this.props.sites[site];

    if (m && siteJobs && siteJobs[site]) {
      let jobList = [];
      Object.values(siteJobs[site]).forEach(v => {
        let jobSummary = {
          jobNumber: v.jobNumber,
          jobDescription: v.jobDescription
        };
        jobList.push(jobSummary);
      });
      this.props.handleSiteChangeDebounced({
        site: m,
        field: "jobList",
        val: jobList
      });
    }

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
                        this.props.handleSiteChange({
                          site: m,
                          field: "assetClass",
                          val: e.value
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
                  <TextField
                    className={classes.formInputLarge}
                    id="previousClassifications"
                    label="Previous Classifications"
                    multiline
                    rows={5}
                    defaultValue={m.previousClassifications || ""}
                    onChange={e => {
                      this.props.handleSiteChange({
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
                    helperText="Write as full sentence. (e.g. The locomotive was in service from 1973.)"
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
                    helperText="Write as full sentence. (e.g. The locomotive was repainted in 1981 and 2007. The engine was overhauled in 2003.)"
                    defaultValue={m.notesOnModification || ""}
                    onChange={e => {
                      this.props.handleSiteChangeDebounced({
                        site: m,
                        field: "notesOnModification",
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
              <div className={classes.flexRowSpread}>
                <div className={classNames(color, classes.expandHeading)}>
                  Site Visits
                </div>
                <Tooltip title={"Add Site Visit"}>
                  <IconButton
                    onClick={e => {
                      this.props.showModal({
                        modalType: SITE_VISIT,
                        modalProps: {
                          doc: {},
                          siteUid: site,
                          callBack: state => {
                            console.log(state);
                            this.props.handleSiteChange({
                              site: m,
                              field: "siteVisits",
                              val: m.siteVisits
                                ? m.siteVisits.concat([state])
                                : [state]
                            });
                          }
                        }
                      });
                    }}
                  >
                    <AddIcon className={classes.iconRegular} />
                  </IconButton>
                </Tooltip>
              </div>
              {m.siteVisits && m.siteVisits.length > 0 ? (
                m.siteVisits
                  .sort(
                    (a, b) =>
                      moment(dateOf(a.date)).format("YYYYMMDD") -
                      moment(dateOf(b.date)).format("YYYYMMDD")
                  )
                  .map((v, index) => {
                    // console.log(v);
                    // let vColor = classes[this.getSiteVisitColor(v)];
                    return (
                      <div
                        className={classNames(
                          classes.flexRowSpread,
                          classes.hoverColor
                        )}
                        key={index}
                      >
                        <div>
                          <div className={classes.bold}>
                            {`${v.referenceNumber} ${
                              this.props.siteVisitTypeAsbestos.filter(
                                e => e.value === v.type
                              )[0].label
                            }`}
                          </div>
                          <div>
                            {`${moment(dateOf(v.date)).format(
                              "ddd, D MMMM YYYY"
                            )} `}
                            <span className={classes.italic}>
                              {andList(v.personnel.map(e => e.name))}
                            </span>
                          </div>
                        </div>
                        <div className={classes.flexRow}>
                          <Tooltip title={"Edit"}>
                            <IconButton
                              onClick={e => {
                                this.props.showModal({
                                  modalType: SITE_VISIT,
                                  modalProps: {
                                    doc: v,
                                    siteUid: site,
                                    callBack: state => {
                                      console.log(state);
                                      this.props.handleSiteChange({
                                        site: m,
                                        field: "siteVisits",
                                        val: this.updateArray(
                                          state,
                                          m.siteVisits,
                                          index
                                        )
                                      });
                                    }
                                  }
                                });
                              }}
                            >
                              <EditIcon className={classes.iconRegular} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={"Delete Site Visit"}>
                            <IconButton
                              onClick={e => {
                                if (
                                  window.confirm(
                                    "Are you sure you wish to delete this Site Visit?"
                                  )
                                )
                                  this.updateArray(
                                    "delete",
                                    m.siteVisits,
                                    index
                                  );
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
                <div>No site visits logged.</div>
              )}
            </div>

            <div className={classes.informationBoxWhiteRounded}>
              <div className={classes.flexRowSpread}>
                <div className={classNames(color, classes.expandHeading)}>
                  Chains of Custody
                </div>
                <Tooltip title={"Add Chain of Custody"}>
                  <IconButton
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
                    <AddIcon className={classes.iconRegular} />
                  </IconButton>
                </Tooltip>
              </div>
              {siteCocs &&
              siteCocs[m.uid] &&
              Object.values(siteCocs[m.uid]) &&
              Object.values(siteCocs[m.uid]).length > 0 ? (
                Object.values(siteCocs[m.uid])
                  .sort(
                    (a, b) =>
                      moment(dateOf(a.issueDate || new Date())).format(
                        "YYYYMMDD"
                      ) -
                      moment(dateOf(b.issueDate || new Date())).format(
                        "YYYYMMDD"
                      )
                  )
                  .map((coc, index) => {
                    return (
                      <div
                        className={classNames(
                          classes.flexRowSpread,
                          classes.hoverColor
                        )}
                        key={coc.uid}
                      >
                        <div>
                          <div className={classes.bold}>
                            {`${coc.jobNumber} ${coc.client}`}
                          </div>
                          <div>
                            {`${moment(dateOf(coc.issueDate)).format(
                              "ddd, D MMMM YYYY"
                            )} `}
                            <span className={classes.italic}>
                              {coc.sampleCount
                                ? `${coc.sampleCount} ${
                                    coc.sampleType === "air" ? "Air" : "Bulk"
                                  } Sample${coc.sampleCount > 1 ? "s" : ""}`
                                : coc.sampleList
                                ? `${coc.sampleList.length} ${
                                    coc.sampleType === "air" ? "Air" : "Bulk"
                                  } Sample${
                                    coc.sampleList.length > 1 ? "s" : ""
                                  }`
                                : ""}
                            </span>
                          </div>
                        </div>
                        <div className={classes.flexRow}>
                          <Tooltip title="Edit Chain of Custody">
                            <IconButton
                              onClick={() => {
                                this.props.getDetailedWFMJob({
                                  jobNumber: coc.jobNumber
                                });
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
                    );
                  })
              ) : (
                <div>No Chains of Custody.</div>
              )}
            </div>

            <div className={classes.informationBoxWhiteRounded}>
              <div className={classes.flexRowSpread}>
                <div className={classNames(color, classes.expandHeading)}>
                  Asbestos Removals
                </div>
                <Tooltip title={"Add Asbestos Removal"}>
                  <IconButton
                    onClick={e => {
                      this.props.showModal({
                        modalType: ASBESTOS_CLEARANCE,
                        modalProps: {
                          doc: {},
                          siteUid: site,
                          callBack: state => {
                            this.props.handleSiteChange({
                              site: m,
                              field: "asbestosRemovals",
                              val: m.asbestosRemovals
                                ? m.asbestosRemovals.concat([state])
                                : [state]
                            });
                          }
                        }
                      });
                    }}
                  >
                    <AddIcon className={classes.iconRegular} />
                  </IconButton>
                </Tooltip>
              </div>
              {m.asbestosRemovals && m.asbestosRemovals.length > 0 ? (
                m.asbestosRemovals
                  .sort(
                    (a, b) =>
                      moment(dateOf(a.date)).format("YYYYMMDD") -
                      moment(dateOf(b.date)).format("YYYYMMDD")
                  )
                  .map((v, index) => {
                    // console.log(v);
                    // let vColor = classes[this.getSiteVisitColor(v)];
                    return (
                      <div
                        className={classNames(
                          classes.flexRowSpread,
                          classes.hoverColor
                        )}
                        key={index}
                      >
                        <div>
                          <div className={classes.bold}>
                            {`${v.referenceNumber} ${
                              v.asbestosRemovalist ? v.asbestosRemovalist : ""
                            }${
                              v.asbestosRemovalistLicence
                                ? ` (${v.asbestosRemovalistLicence})`
                                : ""
                            }`}
                          </div>
                          <div>
                            {`${moment(dateOf(v.issueDate)).format(
                              "ddd, D MMMM YYYY"
                            )} `}
                            <span className={classes.italic}>
                              {v.description}
                            </span>
                          </div>
                        </div>
                        <div className={classes.flexRow}>
                          <Tooltip title={"Edit"}>
                            <IconButton
                              onClick={e => {
                                this.props.showModal({
                                  modalType: ASBESTOS_CLEARANCE,
                                  modalProps: {
                                    doc: v,
                                    siteUid: site,
                                    callBack: state => {
                                      this.props.handleSiteChange({
                                        site: m,
                                        field: "asbestosRemovals",
                                        val: this.updateArray(
                                          state,
                                          m.asbestosRemovals,
                                          index
                                        )
                                      });
                                    }
                                  }
                                });
                              }}
                            >
                              <EditIcon className={classes.iconRegular} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={"Delete Asbestos Removal"}>
                            <IconButton
                              onClick={e => {
                                if (
                                  window.confirm(
                                    "Are you sure you wish to delete this Asbestos Removal?"
                                  )
                                )
                                  this.updateArray(
                                    "delete",
                                    m.asbestosRemovals,
                                    index
                                  );
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
                <div>No Asbestos Removals logged.</div>
              )}
            </div>
          </Grid>
        </Grid>
      );
    } else return <div />;
  }
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
