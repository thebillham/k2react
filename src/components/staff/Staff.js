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
import Select from "@material-ui/core/Select";
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

import StaffCard from "./StaffCard.js";
import { connect } from "react-redux";
import { getUserAttrs, fetchStaff } from "../../actions/local";

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    search: state.local.search,
    offices: state.const.offices,
    contacts: state.const.officecontacts,
    permissions: state.const.permissions,
    qualificationtypes: state.const.qualificationtypes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserAttrs: userPath => dispatch(getUserAttrs(userPath)),
    fetchStaff: () => dispatch(fetchStaff())
  };
};

class Staff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabValue: 0,
      admin: false,
      officeFilters: {},
      officeFilterOn: false,
      attrFilters: {},
      attrFilterOn: false,
      authFilters: {},
      authFilterOn: false,
      signedFilter: undefined,
      signedFilterOn: false,
      events: {},
      docview: "none"
    };
  }

  componentWillMount() {
    if (!this.state.staff) this.props.fetchStaff();
  }

  filterOffice = chip => {
    let state = true;
    if (this.state.officeFilters[chip]) state = false;

    let filterOn = false;

    let newFilters = {
      ...this.state.officeFilters,
      [chip]: state
    };

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      officeFilters: newFilters,
      officeFilterOn: filterOn
    });
  };

  filterAttr = chip => {
    let state = true;
    if (this.state.attrFilters[chip]) state = false;

    let filterOn = state;

    let newFilters = {
      ...this.state.attrFilters,
      [chip]: state
    };

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      attrFilters: newFilters,
      attrFilterOn: filterOn
    });
  };

  filterAuth = chip => {
    let state = true;
    if (this.state.authFilters[chip]) state = false;

    let filterOn = state;

    let newFilters = {
      ...this.state.authFilters,
      [chip]: state
    };

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      authFilters: newFilters,
      authFilterOn: filterOn
    });
  };

  filterSigned = chip => {
    if (this.state.signedFilter === chip) {
      this.setState({
        signedFilter: undefined,
        signedFilterOn: false
      });
    } else {
      this.setState({
        signedFilter: chip,
        signedFilterOn: true
      });
    }
  };

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  getEvents = (expanded, calendarid) => {
    if (expanded && calendarid) {
      if (ApiCalendar.sign && !this.state.events[calendarid]) {
        console.log("Api calendar is signed");
        ApiCalendar.listUpcomingEvents(7, calendarid).then(
          ({ result }: any) => {
            console.log("Results in");
            this.setState({
              events: {
                ...this.state.events,
                [calendarid]: result.items
              }
            });
            console.log(result.items);
          }
        );
      }
    }
  };

  updateAllStaff = () => {
    console.log("Updating all staff");
    Object.keys(this.props.staff).forEach(userPath => {
      console.log("Updating " + userPath);
      this.props.getUserAttrs(userPath);
    });
  };

  setDocView = type => {
    this.setState({ docview: type });
  };

  email = who => {
    var list = [];
    Object.values(this.props.staff).forEach(user => {
      if (user.auth && user.auth["K2 Staff"] && user.email) {
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
      this.state.officeFilterOn === false ||
      this.state.officeFilters[user.office]
    )
      filter = true;
    if (this.state.attrFilterOn) {
      if (this.state.attrFilters["IP402"] && !user.ip402) filter = false;
      if (this.state.attrFilters["Asbestos Assessor"] && !user.aanumber)
        filter = false;
      if (this.state.attrFilters["Tertiary Degree"] && !user.tertiary)
        filter = false;
      if (
        this.state.attrFilters["Science Degree"] &&
        !(user.tertiary && user.tertiary.includes("Sc"))
      )
        filter = false;
      if (this.state.attrFilters["Mask Fit Tested"] && user.maskfit !== "OK")
        filter = false;
      if (this.state.attrFilters["First Aid"] && !user.firstaid) filter = false;
    }
    if (this.state.authFilterOn) {
      this.props.permissions.forEach(permission => {
        if (!user.auth) filter = false;
        else if (
          this.state.authFilters[permission.name] &&
          !user.auth[permission.name]
        )
          filter = false;
      });
    }
    if (this.state.signedFilterOn) {
      if (this.state.signedFilter === "MyK2 User" && !user.key) filter = false;
      if (this.state.signedFilter === "Not Signed Up" && user.key)
        filter = false;
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
      .concat([this.props.me])
      .sort((a, b) => a.name.localeCompare(b.name));
    let docs = [];
    if (this.state.docview !== "none") {
      staff.forEach(e => {
        if (e.docimages && e.docimages.length > 0) {
          if (
            !this.props.search ||
            (e.name + e.office + e.jobdescription)
              .toLowerCase()
              .includes(this.props.search.toLowerCase())
          ) {
            e.docimages.forEach(attr => {
              if (attr.type === this.state.docview) {
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
    var { tabValue } = this.state;
    const { classes } = this.props;
    const docs = this.getDocs();
    const filter = (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          Filters
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid
            container
            spacing={8}
            direction="row"
            justify="space-between"
            alignItems="flex-start"
          >
            <Grid item xs={6} md={3}>
              {this.props.offices.map(chip => {
                return (
                  <div key={chip} style={{ padding: 5 }}>
                    <Chip
                      icon={<LocationCity />}
                      variant="outlined"
                      color={
                        this.state.officeFilters[chip] ? "secondary" : "default"
                      }
                      onClick={() => this.filterOffice(chip)}
                      label={chip}
                    />
                  </div>
                );
              })}
            </Grid>
            <Grid item xs={6} md={3}>
              {[
                "IP402",
                "Asbestos Assessor",
                "Tertiary Degree",
                "Science Degree",
                "Mask Fit Tested",
                "First Aid"
              ].map(chip => {
                return (
                  <div key={chip} style={{ padding: 5 }}>
                    <Chip
                      icon={<School />}
                      variant="outlined"
                      color={
                        this.state.attrFilters[chip] ? "secondary" : "default"
                      }
                      onClick={() => this.filterAttr(chip)}
                      label={chip}
                    />
                  </div>
                );
              })}
            </Grid>
            <Grid item xs={6} md={3}>
              {this.props.permissions.map(chip => {
                return (
                  <div key={chip.name} style={{ padding: 5 }}>
                    <Chip
                      icon={<Https />}
                      variant="outlined"
                      color={
                        this.state.authFilters[chip.name]
                          ? "secondary"
                          : "default"
                      }
                      onClick={() => this.filterAuth(chip.name)}
                      label={chip.name}
                    />
                  </div>
                );
              })}
            </Grid>
            <Grid item xs={6} md={3}>
              {["MyK2 User", "Not Signed Up"].map(chip => {
                return (
                  <div key={chip} style={{ padding: 5 }}>
                    <Chip
                      variant="outlined"
                      color={
                        this.state.signedFilter === chip
                          ? "secondary"
                          : "default"
                      }
                      onClick={() => this.filterSigned(chip)}
                      label={chip}
                    />
                  </div>
                );
              })}
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );

    return (
      <div style={{ marginTop: 80 }}>
        {/* <Paper style={{ padding: 20, }}>*/}
        <div style={{ marginBottom: 20 }}>
          <Tabs
            value={tabValue}
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
        <div style={{ display: "flex", justifyContent: "center" }}>
          {tabValue === 0 && (
            <div style={{ position: "relative", width: "80vw" }}>
              {filter}
              {staff.length > 0 ? (
                <div style={{ marginTop: 5 }}>
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
                            <StaffCard
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
          {tabValue === 1 && (
            <div style={{ position: "relative", width: "80vw" }}>
              <Button
                onClick={() => this.email("all")}
                color={"primary"}
                variant="outlined"
                style={{ margin: 20 }}
              >
                Email All Staff
              </Button>
              <Button
                onClick={() => this.email("Christchurch")}
                color={"primary"}
                variant="outlined"
                style={{ margin: 20 }}
              >
                Email Christchurch Staff
              </Button>
              <Button
                onClick={() => this.email("Auckland")}
                color={"primary"}
                variant="outlined"
                style={{ margin: 20 }}
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
                            <div
                              style={{
                                borderRadius: 20,
                                display: "inline-flex",
                                backgroundColor: "darkgrey",
                                color: "white",
                                whiteSpace: "nowrap",
                                fontSize: 96,
                                padding: 48,
                                margin: -8
                              }}
                            >
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
                              <div
                                style={{
                                  borderRadius: 20,
                                  display: "inline-flex",
                                  backgroundColor: "darkgrey",
                                  color: "white",
                                  whiteSpace: "nowrap",
                                  fontSize: 96,
                                  padding: 48,
                                  margin: -8
                                }}
                              >
                                {user.workphone}
                              </div>
                            </Popup>
                          ) : (
                            <div>Phone not listed.</div>
                          )}
                        </Grid>
                        <Grid item xs={3}>
                          {user.email ? (
                            <a
                              style={{ textDecoration: "none" }}
                              href={"mailto:" + user.email}
                            >
                              {user.email}
                            </a>
                          ) : (
                            <div>Email not set.</div>
                          )}
                        </Grid>
                        <Grid item xs={3}>
                          {user.gmail ? (
                            <a
                              style={{ textDecoration: "none" }}
                              href={"mailto:" + user.gmail}
                            >
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
          {tabValue === 2 && (
            <div style={{ position: "relative", width: "80vw" }}>
              {this.props.me.name === "Ben Dodd" && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    this.updateAllStaff();
                  }}
                >
                  Refresh
                </Button>
              )}
              {filter}
              <ListItem>
                <Grid container style={{ fontWeight: 600 }}>
                  <Grid item xs={2}>
                    Name
                  </Grid>
                  <Grid item xs={1}>
                    Tertiary
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      IP402
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Asbestos Assessor
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      Mask Fit
                    </div>
                  </Grid>
                  <Grid item xs={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
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
                    <ListItem className={classes.hoverItem} key={user.name}>
                      <Grid container>
                        <Grid item xs={2}>
                          {user.name}
                        </Grid>
                        <Grid item xs={1}>
                          {user.tertiary}
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {user.ip402 && <CheckCircleOutline />}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {user.aanumber}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {user.maskfit &&
                              (user.maskfit === "OK" ? (
                                <Face />
                              ) : (
                                <Face style={{ color: "red" }} />
                              ))}
                          </div>
                        </Grid>
                        <Grid item xs={1}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {user.firstaid &&
                              (user.firstaid === "OK" ? (
                                <LocalHospital />
                              ) : (
                                <LocalHospital style={{ color: "red" }} />
                              ))}
                          </div>
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
          {tabValue === 3 && (
            <div style={{ position: "relative", width: "80vw" }}>
              <FormControl style={{ width: 500, marginBottom: 10 }}>
                <InputLabel shrink>Document Type</InputLabel>
                <Select
                  value={this.state.docview}
                  onChange={e => this.setDocView(e.target.value)}
                  input={<Input name="docview" id="docview" />}
                >
                  <option value="none" />
                  {Object.keys(this.props.qualificationtypes).map(doctype => {
                    return (
                      <option key={doctype} value={doctype}>
                        {this.props.qualificationtypes[doctype].name}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  let url =
                    "https://api.k2.co.nz/v1/doc/scripts/staff/qualification_documents.php?images=" +
                    docs.map(doc => encodeURIComponent(doc.url)).join(";") +
                    "&doctype=" +
                    this.props.qualificationtypes[this.state.docview].name +
                    "&format=A5";
                  window.open(url);
                }}
              >
                Printable Version
              </Button>
              {this.state.docview !== "none" && (
                <GridList
                  cellHeight={
                    this.state.docview
                      ? this.props.qualificationtypes[this.state.docview]
                          .cellHeight
                      : 420
                  }
                  cols={
                    this.state.docview
                      ? this.props.qualificationtypes[this.state.docview].cols
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
