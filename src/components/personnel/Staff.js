import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";

import Grid from "@material-ui/core/Grid";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import ListItem from "@material-ui/core/ListItem";
// import Paper from '@material-ui/core/Paper';
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "react-select";
import Input from "@material-ui/core/Input";

import LocationCity from "@material-ui/icons/LocationCity";
import School from "@material-ui/icons/School";
import Face from "@material-ui/icons/Face";
import LocalHospital from "@material-ui/icons/LocalHospital";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Https from "@material-ui/icons/Https";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";

import "react-table/react-table.css";
import Popup from "reactjs-popup";
import ApiCalendar from "react-google-calendar-api";

import StaffOverviewListItem from "./components/StaffOverviewListItem.js";
import { connect } from "react-redux";
import { getUserAttrs, fetchStaff } from "../../actions/local";
import { tabStaff, filterStaff, } from "../../actions/display";
import { auth, usersRef } from "../../config/firebase";

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    search: state.local.search,
    offices: state.const.offices,
    contacts: state.const.officeContacts,
    permissions: state.const.permissions,
    qualificationtypes: state.const.qualificationtypes,
    tab: state.display.tabStaff,
    filter: state.display.filterStaff,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserAttrs: userPath => dispatch(getUserAttrs(userPath)),
    fetchStaff: () => dispatch(fetchStaff()),
    tabStaff: tab => dispatch(tabStaff(tab)),
    filterStaff: filter => dispatch(filterStaff(filter)),
  };
};

class Staff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabValue: this.props.tab,
      admin: false,
      filterStaff: this.props.filter,
      events: {},
    };
  }

  componentWillMount() {
    if (!this.state.staff) this.props.fetchStaff();
  }

  filterOffice = chip => {
    let state = true;
    if (this.props.filter.officeFilters[chip]) state = false;

    let filterOn = false;

    let officeFilters = {
      ...this.props.filter.officeFilters,
      [chip]: state
    };

    Object.values(officeFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    let newFilter = {
      ...this.props.filter,
      officeFilters: officeFilters,
      officeFilterOn: filterOn,
    }

    this.props.filterStaff(newFilter);
  };

  filterAttr = chip => {
    let state = true;
    if (this.props.filter.attrFilters[chip]) state = false;

    let filterOn = state;

    let attrFilters = {
      ...this.props.filter.attrFilters,
      [chip]: state
    };

    Object.values(attrFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    let newFilters = {
      ...this.props.filter,
      attrFilters: attrFilters,
      attrFilterOn: filterOn,
    }

    this.props.filterStaff(newFilters);
  };

  filterAuth = chip => {
    let state = true;
    if (this.props.filter.authFilters[chip]) state = false;

    let filterOn = state;

    let authFilters = {
      ...this.props.filter.authFilters,
      [chip]: state
    };

    Object.values(authFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    let newFilters = {
      ...this.props.filter,
      authFilters: authFilters,
      authFilterOn: filterOn
    };

    this.props.filterStaff(newFilters);
  };

  handleTabChange = (event, value) => {
    this.props.tabStaff(value);
  };

  getEvents = (expanded, calendarid) => {
    if (expanded && calendarid) {
      if (ApiCalendar.sign && !this.state.events[calendarid]) {
        //console.log("Api calendar is signed");
        ApiCalendar.listUpcomingEvents(7, calendarid).then(
          ({ result }: any) => {
            //console.log("Results in");
            this.setState({
              events: {
                ...this.state.events,
                [calendarid]: result.items
              }
            });
            //console.log(result.items);
          }
        );
      }
    }
  };

  updateAllStaff = () => {
    //console.log("Updating all staff");
    Object.keys(this.props.staff).forEach(userPath => {
      //console.log("Updating " + userPath);
      this.props.getUserAttrs(userPath);
    });
  };

  setDocView = type => {
    let newFilter = {
      ...this.props.filter,
      docview: type,
    };
    this.props.filterStaff(newFilter);
  };

  email = who => {
    var list = [];
    Object.values(this.props.staff).forEach(user => {
      if (user.auth && user.auth["K2 Staff"] && user.email && user.uid !== auth.currentUser.uid) {
        if (who === "all") {
          list.push(user.email);
        } else if (who === "Christchurch" && user.office === "Christchurch") {
          list.push(user.email);
        } else if (who === "Auckland" && user.office !== "Christchurch") {
          list.push(user.email);
        }
      }
    });
    let href = "mailto:" + list.join(";");
    window.location.href = href;
  };

  filterUser = user => {
    let filter = false;
    if (
      this.props.filter.officeFilterOn === false ||
      this.props.filter.officeFilters[user.office]
    )
      filter = true;
    if (this.props.filter.attrFilterOn) {
      if (this.props.filter.attrFilters["IP402"] && !user.ip402) filter = false;
      if (this.props.filter.attrFilters["Asbestos Assessor"] && !user.aanumber)
        filter = false;
      if (this.props.filter.attrFilters["Tertiary Degree"] && !user.tertiary)
        filter = false;
      if (
        this.props.filter.attrFilters["Science Degree"] &&
        !(user.tertiary && user.tertiary.includes("Sc"))
      )
        filter = false;
      if (this.props.filter.attrFilters["Mask Fit Tested"] && user.maskfit !== "OK")
        filter = false;
      if (this.props.filter.attrFilters["First Aid"] && !user.firstaid) filter = false;
    }
    if (this.props.filter.authFilterOn) {
      this.props.permissions.forEach(permission => {
        if (!user.auth) filter = false;
        else if (
          this.props.filter.authFilters[permission.name] &&
          !user.auth[permission.name]
        )
          filter = false;
      });
    }
    if (this.props.search) {
      if (
        !(user.name + user.office + user.jobdescription)
          .toLowerCase()
          .includes(this.props.search.toLowerCase())
      )
        filter = false;
    }
    return filter;
  };

  getDocs = () => {
    const staff = Object.values(this.props.staff)
      .sort((a, b) => a.name.localeCompare(b.name));
    let docs = [];
    if (this.props.filter.docview !== "none") {
      staff.forEach(e => {
        if (e.docimages && e.docimages.length > 0) {
          if (
            !this.props.search ||
            (e.name + e.office + e.jobdescription)
              .toLowerCase()
              .includes(this.props.search.toLowerCase())
          ) {
            e.docimages.forEach(attr => {
              if (attr.type === this.props.filter.docview) {
                docs.push({
                  url: attr.url,
                  name: e.name
                });
              }
            });
          }
        }
      });
    }
    return docs;
  };

  render() {
    // const TreeTable = treeTableHOC(ReactTable);
    // const staff = Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name));
    const staff = Object.values(this.props.staff).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const { classes, tab } = this.props;
    const docs = this.getDocs();
    const filter = (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          Filters
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div>
            <div className={classes.flexRow}>
              {this.props.offices.map(chip => {
                return (
                  <div key={chip} className={classes.paddingAllSmall}>
                    <Chip
                      icon={<LocationCity />}
                      variant="outlined"
                      color={
                        this.props.filter.officeFilters[chip] ? "secondary" : "default"
                      }
                      onClick={() => this.filterOffice(chip)}
                      label={chip}
                    />
                  </div>
                );
              })}
            </div>
            <div className={classes.flexRow}>
              {[
                "IP402",
                "Asbestos Assessor",
                "Tertiary Degree",
                "Science Degree",
                "Mask Fit Tested",
                "First Aid"
              ].map(chip => {
                return (
                  <div key={chip} className={classes.paddingAllSmall}>
                    <Chip
                      icon={<School />}
                      variant="outlined"
                      color={
                        this.props.filter.attrFilters[chip] ? "secondary" : "default"
                      }
                      onClick={() => this.filterAttr(chip)}
                      label={chip}
                    />
                  </div>
                );
              })}
            </div>
            <div className={classes.flexRow}>
              {this.props.permissions.map(chip => {
                return (
                  <div key={chip.name} className={classes.paddingAllSmall}>
                    <Chip
                      icon={<Https />}
                      variant="outlined"
                      color={
                        this.props.filter.authFilters[chip.name]
                          ? "secondary"
                          : "default"
                      }
                      onClick={() => this.filterAuth(chip.name)}
                      label={chip.name}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );

    return (
      <div className={classes.marginTopStandard}>
        <div className={classes.marginBottomStandard}>
          <Tabs
            value={tab}
            onChange={this.handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab label="Overview" />
            <Tab label="Contact List" />
            <Tab label="Qualifications" />
            <Tab label="Documents" />
          </Tabs>
        </div>
        <div className={classes.paperFlexRow}>
          {tab === 0 && (
            <div className={classes.paperWidth}>
              {filter}
              {staff.length > 0 ? (
                <div className={classes.marginTopSmall}>
                  {staff
                    .filter(user => {
                      return this.filterUser(user);
                    })
                    .map(user => {
                      return (
                        <ExpansionPanel
                          key={user.name}
                          onChange={(event, ex) => {
                            this.getEvents(ex, user.gmail);
                          }}
                        >
                          <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                            <b>{user.name}</b>
                          </ExpansionPanelSummary>
                          <ExpansionPanelDetails>
                            <StaffOverviewListItem
                              staff={{
                                ...user,
                                events: this.state.events[user.gmail]
                              }}
                            />
                          </ExpansionPanelDetails>
                        </ExpansionPanel>
                      );
                    })}
                </div>
              ) : (
                <CircularProgress />
              )}
            </div>
          )}
          {tab === 1 && (
            <div className={classes.paperWidth}>
              <Button
                onClick={() => this.email("all")}
                color="primary"
                variant="outlined"
              >
                Email All Staff
              </Button>
              <Button
                onClick={() => this.email("Christchurch")}
                color="primary"
                variant="outlined"
                className={classes.marginSidesSmall}
              >
                Email Christchurch Staff
              </Button>
              <Button
                onClick={() => this.email("Auckland")}
                color="primary"
                variant="outlined"
              >
                Email North Island Staff
              </Button>
              {this.props.contacts.map(user => {
                return (
                  <ListItem key={user.name}>
                    <Grid container>
                      <Grid item xs={3}>
                        {user.name}
                      </Grid>
                      <Grid item xs={3}>
                        {user.workphone ? (
                          <Popup
                            trigger={
                              <a href={"tel:" + user.workphone}>
                                {user.workphone}
                              </a>
                            }
                            position="bottom center"
                            on="hover"
                          >
                            <div className={classes.popupPhoneNumber}>
                              {user.workphone}
                            </div>
                          </Popup>
                        ) : (
                          <div>Phone not listed.</div>
                        )}
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              })}
              <hr />
              {staff
                .filter(user => {
                  if (this.props.search) {
                    return user.name
                      .toLowerCase()
                      .includes(this.props.search.toLowerCase());
                  } else {
                    return true;
                  }
                })
                .map(user => {
                  return (
                    <ListItem className={classes.hoverItem} key={user.name}>
                      <Grid container>
                        <Grid item xs={3}>
                          {user.name}
                        </Grid>
                        <Grid item xs={3}>
                          {user.workphone ? (
                            <Popup
                              trigger={
                                <a href={"tel:" + user.workphone}>
                                  {user.workphone}
                                </a>
                              }
                              position="bottom center"
                              on="hover"
                            >
                              <div className={classes.popupPhoneNumber}>
                                {user.workphone}
                              </div>
                            </Popup>
                          ) : (
                            <div>Phone not listed.</div>
                          )}
                        </Grid>
                        <Grid item xs={3}>
                          {user.email ? (
                            <a className={classes.noTextDecoration} href={"mailto:" + user.email}>
                              {user.email}
                            </a>
                          ) : (
                            <div>Email not set.</div>
                          )}
                        </Grid>
                        <Grid item xs={3}>
                          {user.gmail ? (
                            <a className={classes.noTextDecoration} href={"mailto:" + user.gmail}>
                              {user.gmail}
                            </a>
                          ) : (
                            <div>Gmail not set.</div>
                          )}
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })}
            </div>
          )}
          {tab === 2 && (
            <div className={classes.paperWidth}>
              {filter}
              <ListItem>
                <Grid container className={classes.bold}>
                  <Grid item xs={2}>
                    Name
                  </Grid>
                  <Grid item xs={1}>
                    Tertiary
                  </Grid>
                  <Grid item xs={1}>
                    <div className={classes.flexRowCenter}>
                      IP402
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div className={classes.flexRowCenter}>
                      Asbestos Assessor
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div className={classes.flexRowCenter}>
                      Mask Fit
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div className={classes.flexRowCenter}>
                      First Aid
                    </div>
                  </Grid>
                  <Grid item xs={5}>
                    NZQA Unit Standards Training
                  </Grid>
                </Grid>
              </ListItem>
              {staff
                .filter(user => {
                  return this.filterUser(user);
                })
                .map(user => {
                  return (
                    <ListItem className={classes.hoverItemFat} key={user.name}>
                      <Grid container>
                        <Grid item xs={2}>
                          {user.name}
                        </Grid>
                        <Grid item xs={1}>
                          {user.tertiary}
                        </Grid>
                        <Grid item xs={1}>
                          {user.ip402 && <CheckCircleOutline className={classes.iconRegularGreen} />}
                        </Grid>
                        <Grid item xs={1}>
                          {user.aanumber}
                        </Grid>
                        <Grid item xs={1}>
                          {user.maskfit &&
                            <Face className={user.maskfit === "OK" ? classes.iconRegularGreen : classes.iconRegularRed} />
                          }
                        </Grid>
                        <Grid item xs={1}>
                          {user.firstaid &&
                            <LocalHospital className={user.firstaid === "OK" ? classes.iconRegularGreen : classes.iconRegularRed} />
                          }
                        </Grid>
                        <Grid item xs={5}>
                          {user.nzqatraining}
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })}
            </div>
          )}
          {tab === 3 && (
            <div className={classes.paperWidth}>
              <FormControl className={classes.formInputLarge}>
                <InputLabel shrink>Document Type</InputLabel>
                <Select
                  className={classes.select}
                  defaultValue={{label: this.props.filter.docview, id: this.props.filter.docview }}
                  options={Object.keys(this.props.qualificationtypes).map(e => ({ value: e, label: this.props.qualificationtypes[e].name }))}
                  onChange={e => this.setDocView(e ? e.value : e)}
                  isClearable
                />
              </FormControl>
              <Button
                className={classes.marginTopStandard}
                variant="outlined"
                color="primary"
                onClick={() => {
                  let url =
                    "https://api.k2.co.nz/v1/doc/scripts/staff/qualification_documents.php?images=" +
                    docs.map(doc => encodeURIComponent(doc.url)).join(";") +
                    "&doctype=" +
                    this.props.qualificationtypes[this.props.filter.docview].name +
                    "&format=A5";
                  window.open(url);
                }}
              >
                Printable Version
              </Button>
              {this.props.filter.docview !== "none" && (
                <GridList
                  cellHeight={
                    this.props.filter.docview
                      ? this.props.qualificationtypes[this.props.filter.docview]
                          .cellHeight
                      : 420
                  }
                  cols={
                    this.props.filter.docview
                      ? this.props.qualificationtypes[this.props.filter.docview].cols
                      : 6
                  }
                >
                  {docs.map(doc => {
                    return (
                      <GridListTile
                        key={doc.url}
                        onClick={() => window.open(doc.url)}
                      >
                        <img src={doc.url} alt={doc.name} />
                        <GridListTileBar title={doc.name} />
                      </GridListTile>
                    );
                  })}
                </GridList>
              )}
            </div>
          )}
        </div>
        {/* </Paper>*/}
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Staff)
);
