import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import classNames from 'classnames';

import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
// import Paper from '@material-ui/core/Paper';
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "react-select";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Checkbox from "@material-ui/core/Checkbox";
// import IconButton from '@material-ui/core/IconButton';

import { auth, usersRef } from "../../config/firebase";

import Error from "@material-ui/icons/Error";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";

import AttrModal from "./modals/AttrModal";
import AttrList from "./components/MyDetailsAttrListItem";
import { USER_ATTR, EDITSTAFF } from "../../constants/modal-types";
import { showModal } from "../../actions/modal";
import { getUserAttrs, getEditStaff, fetchStaff, } from "../../actions/local";
import { tabMyDetails, } from "../../actions/display";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    editstaff: state.local.editstaff,
    me: state.local.me,
    offices: state.const.offices,
    jobDescriptions: state.const.jobDescriptions,
    permissions: state.const.permissions,
    tab: state.display.tabMyDetails,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
    getEditStaff: user => dispatch(getEditStaff(user)),
    fetchStaff: update => dispatch(fetchStaff(update)),
    getUserAttrs: userPath => dispatch(getUserAttrs(userPath)),
    tabMyDetails: (tab) => dispatch(tabMyDetails(tab)),
  };
};

class UserDetails extends React.Component {
  constructor(props) {
    super(props);
    var userPath = auth.currentUser.uid;
    if (props.match.params.user) userPath = props.match.params.user;
    this.state = {
      userPath: userPath,
      isLoading: true,
      edited: false,
    };
    this.onEditUser = _.debounce(this.onEditUser, 300);
  }

  handleTabChange = (event, value) => {
    this.props.tabMyDetails(value);
  };

  componentWillMount() {
    if (this.props.match.params.user && this.props.me.auth && this.props.me.auth["Admin"]) {
      this.props.getEditStaff(this.props.match.params.user);
    } else if (!this.props.match.params.user && !this.props.me.attrs) {
      this.props.getUserAttrs(auth.currentUser.uid);
    }
  };

  componentWillUnmount() {
    if (this.state.edited) this.props.fetchStaff(true);
  }

  onEditUser = (target, select) => {
    let change = {};
    change[target.id] = target.value;
    if (select) {
      this.setState({
        user: {
          ...this.state.user,
          ...change
        }
      });
    }
    usersRef.doc(this.state.userPath).update(change);
    if (!this.state.edited) this.setState({ edited: true });
  };

  onEditAuth = (target, auth) => {
    if (this.props.me.auth && this.props.me.auth["Admin"]) {
      let change = {};
      if (auth) change = auth;
      change[target.id] = target.value;
      this.setState({
        user: {
          ...this.state.user,
          auth: change
        }
      });
      usersRef.doc(this.state.userPath).update({ auth: change });
      if (!this.state.edited) this.setState({ edited: true });
    }
  };

  displayTimeAtK2 = () => {
    var user = {};
    if (this.props.match.params.user) {
      user = this.props.editstaff;
    } else {
      user = this.props.me;
    }
    if (user.startdate) {
      var timeAtK2 = new Date() - new Date(user.startdate);
      var divideBy = {
        d: 86400000,
        m: 2629800000,
        y: 31557600000
      };
      var years = Math.floor(timeAtK2 / divideBy["y"]);
      timeAtK2 = timeAtK2 % divideBy["y"];
      var months = Math.floor(timeAtK2 / divideBy["m"]);
      timeAtK2 = timeAtK2 % divideBy["m"];
      var days = Math.floor(timeAtK2 / divideBy["d"]);
      let y = " years ";
      let m = " months and ";
      let d = " days";
      if (years === 1) y = " year ";
      if (months === 1) m = " month and ";
      if (days === 1) d = " day";
      return years + y + months + m + days + d;
    } else {
      return "No start date set";
    }
  };

  render() {
    const { classes, tab } = this.props;

    if (this.state.isLoading && ((this.props.match.params.user && this.props.editstaff != undefined) || (!this.props.match.params.user && this.props.me != undefined))) this.setState({ isLoading: false, });

    // User variable is assigned at this stage so that attributes are immediately updated when changed.
    var user = {};
    if (this.props.match.params.user) {
      user = this.props.editstaff;
    } else {
      user = this.props.me;
    }

    if (!user.maskfitsize) user.maskfitsize = "";

    let sixmonths = new Date();
    sixmonths = sixmonths.setMonth(sixmonths.getMonth() - 6);

    let admin = false;
    if (this.props.me.auth && this.props.me.auth["Admin"]) admin = true;
    return (
      <div style={{ marginTop: 80 }}>
        <AttrModal />
        {/* <Paper style={{ padding: 20, }}>*/}
        <div style={{ marginBottom: 20 }}>
          <Tabs
            value={tab}
            onChange={this.handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab label="General Detals" />
            <Tab label="Certificates" />
            <Tab label="Personal Gear" />
            <Tab label="Emergency Contacts" />
            <Tab label="Permissions" />
          </Tabs>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {tab === 0 && (
            <div>
              {this.state.isLoading ? (
                <div>
                  <CircularProgress />
                </div>
              ) : (
                <Grid container justify="center" direction="row">
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <TextField
                        label="Preferred Name"
                        id="name"
                        helperText="This is the name that will be displayed on reports and test certificates."
                        className={classes.textField}
                        defaultValue={user.name}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <Typography className={classes.note}>
                        <b>Workflow Max ID:</b> {user.wfm_id}
                      </Typography>
                    </ListItem>
                    <div className={classes.textLabel}>Job Description</div>
                    <ListItem>
                      <Select
                        className={classNames(classes.select, classes.textField)}
                        defaultValue={{label: user.jobdescription, id: user.jobdescription }}
                        options={this.props.jobDescriptions.map(e => ({ value: e, label: e }))}
                        onChange={e =>
                          this.onEditUser({ id: "jobdescription", value: e ? e.value : e }, true )
                        }
                      />
                    </ListItem>
                    <div className={classes.textLabel}>Office</div>
                    <ListItem>
                      <Select
                        className={classNames(classes.select, classes.textField)}
                        defaultValue={{label: user.office, id: user.office }}
                        options={this.props.offices.map(e => ({ value: e, label: e }))}
                        onChange={e =>
                          this.onEditUser({ id: "office", value: e ? e.value : e }, true )
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Start Date At K2"
                        id="startdate"
                        type="date"
                        className={classes.textField}
                        defaultValue={user.startdate}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        disabled
                        label="Time At K2"
                        className={classes.textField}
                        value={this.displayTimeAtK2()}
                      />
                    </ListItem>
                    <ListItem>
                      <Typography className={classes.subHeading}>
                        Contact Information
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Work Phone"
                        id="workphone"
                        className={classes.textField}
                        type="tel"
                        defaultValue={user.workphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="K2 Email"
                        id="email"
                        type="email"
                        helperText="Enter your '@k2.co.nz' email address."
                        className={classes.textField}
                        defaultValue={user.email}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Gmail"
                        id="gmail"
                        type="email"
                        helperText="Enter your '@gmail.com' email address."
                        className={classes.textField}
                        defaultValue={user.gmail}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <Typography className={classes.subHeading}>
                        Personal Contact Information
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Personal Phone"
                        id="personalphone"
                        type="tel"
                        className={classes.textField}
                        defaultValue={user.personalphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Address"
                        id="address"
                        multiline
                        rowsMax="4"
                        className={classes.textField}
                        defaultValue={user.address}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              )}
            </div>
          )}
          {tab === 1 && (
            <div>
              {this.state.isLoading || !user ? (
                <div>
                  <CircularProgress />
                </div>
              ) : (
                <div style={{ position: "relative", width: "60vw" }}>
                  <div>
                    <Button
                      className={classes.IconButton}
                      onClick={() => {
                        if (!this.state.edited) this.setState({ edited: true });
                        this.props.showModal({
                          modalType: USER_ATTR,
                          modalProps: {
                            userPath: this.state.userPath,
                            title: "Add New Item",
                            staffName: user.name,
                            doc: { type: "Tertiary" }
                          }
                        });
                      }}
                    >
                      Add New Item
                    </Button>
                  </div>
                  {user.attrs && Object.keys(user.attrs).length > 0 ? (
                    <div>
                      {Object.keys(user.attrs).map(key => {
                        return (
                          <AttrList
                            key={key}
                            attr={user.attrs[key]}
                            userPath={this.state.userPath}
                            staffName={user.name}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <ListItem>
                      Click the button to add your qualifications, training and
                      health & safety records.
                    </ListItem>
                  )}
                </div>
              )}
            </div>
          )}
          {tab === 2 && (
            <div>
              {this.state.isLoading ? (
                <div>
                  <CircularProgress />
                </div>
              ) : (
                <Grid container justify="center" direction="row">
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <Typography className={classes.subHeading}>Mask</Typography>
                    </ListItem>
                    <ListItem>
                      {user.maskfit === "OK" ? (
                        <div style={{ color: "green", fontWeight: 500 }}>
                          Mask Fit Tested <CheckCircleOutline />
                        </div>
                      ) : (
                        <div style={{ color: "red", fontWeight: 500 }}>
                          {user.maskfit === "Expired"
                            ? "Mask Fit Test Expired!"
                            : "Mask Fit Not Tested"}
                          <Error />
                        </div>
                      )}
                    </ListItem>
                    <ListItem>
                      <div>
                        Enter your mask fit certificate into your{" "}
                        <i>Certificates</i> list.
                      </div>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Model"
                        id="maskfitmodel"
                        className={classes.textField}
                        defaultValue={user.maskfitmodel}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <FormControl className={classes.textField}>
                        <InputLabel shrink>Mask Size</InputLabel>
                        <Select
                          className={classes.select}
                          defaultValue={{label: user.maskfitsize, id: user.maskfitsize }}
                          options={["S","M","L"].map(e => ({ value: e, label: e }))}
                          onChange={e =>
                            this.onEditUser({ id: "maskfitsize", value: e ? e.value : e }, true)
                          }
                          isClearable
                        />
                      </FormControl>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Fit Factor"
                        id="maskfitfactor"
                        className={classes.textField}
                        defaultValue={user.maskfitfactor}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Particulate Filters Replaced On"
                        id="maskparticulatefilters"
                        className={classes.textField}
                        type="date"
                        defaultValue={user.maskparticulatefilters}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Organic Filters Replaced On"
                        id="maskorganicfilters"
                        className={classes.textField}
                        type="date"
                        defaultValue={user.maskorganicfilters}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    {user.maskorganicfilters &&
                      new Date(user.maskorganicfilters) <= sixmonths && (
                        <ListItem>
                          <div style={{ color: "red", fontWeight: 500 }}>
                            Replace organic filters! <Error />
                          </div>
                        </ListItem>
                      )}
                  </Grid>
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <Typography className={classes.subHeading}>
                        Other PPE
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        style={{ marginLeft: 1 }}
                        control={
                          <Checkbox
                            checked={user.ppeHighVis}
                            onChange={e =>
                              this.onEditUser(
                                { id: "ppeHighVis", value: e.target.checked },
                                true
                              )
                            }
                            value="ppeHighVis"
                          />
                        }
                        label="High-Vis"
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        style={{ marginLeft: 1 }}
                        control={
                          <Checkbox
                            checked={user.ppeHardHat}
                            onChange={e =>
                              this.onEditUser(
                                { id: "ppeHardHat", value: e.target.checked },
                                true
                              )
                            }
                            value="ppeHardHat"
                          />
                        }
                        label="Hard Hat"
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        style={{ marginLeft: 1 }}
                        control={
                          <Checkbox
                            checked={user.ppeBoots}
                            onChange={e =>
                              this.onEditUser(
                                { id: "ppeBoots", value: e.target.checked },
                                true
                              )
                            }
                            value="ppeBoots"
                          />
                        }
                        label="Steel-Cap Boots"
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        style={{ marginLeft: 1 }}
                        control={
                          <Checkbox
                            checked={user.ppeGlasses}
                            onChange={e =>
                              this.onEditUser(
                                { id: "ppeGlasses", value: e.target.checked },
                                true
                              )
                            }
                            value="ppeGlasses"
                          />
                        }
                        label="Safety Glasses"
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              )}
            </div>
          )}
          {tab === 3 && (
            <div>
              {this.state.isLoading || !user ? (
                <div>
                  <CircularProgress />
                </div>
              ) : (
                <Grid container justify="center" direction="row">
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <Typography className={classes.subHeading}>
                        Primary Emergency Contact
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Name"
                        id="emergencyprimaryname"
                        className={classes.textField}
                        defaultValue={user.emergencyprimaryname}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Relation"
                        id="emergencyprimaryrelation"
                        className={classes.textField}
                        defaultValue={user.emergencyprimaryrelation}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Phone"
                        id="emergencyprimaryhomephone"
                        className={classes.textField}
                        defaultValue={user.emergencyprimaryhomephone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Work Phone"
                        id="emergencyprimaryworkphone"
                        className={classes.textField}
                        defaultValue={user.emergencyprimaryworkphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Mobile"
                        id="emergencyprimarymobile"
                        className={classes.textField}
                        defaultValue={user.emergencyprimarymobile}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Email"
                        id="emergencyprimaryemail"
                        className={classes.textField}
                        defaultValue={user.emergencyprimaryemail}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Address"
                        id="emergencyprimaryhomeaddress"
                        className={classes.textField}
                        defaultValue={user.emergencyprimaryhomeaddress}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <Typography className={classes.subHeading}>
                        Secondary Emergency Contact
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Name"
                        id="emergencysecondaryname"
                        className={classes.textField}
                        defaultValue={user.emergencysecondaryname}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Relation"
                        id="emergencysecondaryrelation"
                        className={classes.textField}
                        defaultValue={user.emergencysecondaryrelation}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Phone"
                        id="emergencysecondaryhomephone"
                        className={classes.textField}
                        defaultValue={user.emergencysecondaryhomephone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Work Phone"
                        id="emergencysecondaryworkphone"
                        className={classes.textField}
                        defaultValue={user.emergencysecondaryworkphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Mobile"
                        id="emergencysecondarymobile"
                        className={classes.textField}
                        defaultValue={user.emergencysecondarymobile}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Email"
                        id="emergencysecondaryemail"
                        className={classes.textField}
                        defaultValue={user.emergencysecondaryemail}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Address"
                        id="emergencysecondaryhomeaddress"
                        className={classes.textField}
                        defaultValue={user.emergencysecondaryhomeaddress}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              )}
            </div>
          )}
          {tab === 4 && (
            <div>
              {this.state.isLoading ? (
                <div>
                  <CircularProgress />
                </div>
              ) : (
                <Grid
                  container
                  justify="flex-start"
                  direction="row"
                  style={{ width: 800 }}
                >
                  <Grid item>
                    {this.props.permissions.map(permission => {
                      return (
                        <div key={permission.name}>
                          <div style={{ marginBottom: 0, }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  disabled={!admin}
                                  checked={
                                    user.auth
                                      ? user.auth[permission.name]
                                      : false
                                  }
                                  onChange={e =>
                                    this.onEditAuth(
                                      {
                                        id: permission.name,
                                        value: e.target.checked
                                      },
                                      user.auth
                                    )
                                  }
                                  value={permission.name}
                                />
                              }
                              label={permission.name}
                            />
                          </div>
                          <div style={{ marginBottom: 12,}}>
                            <FormHelperText>{permission.desc}</FormHelperText>
                          </div>
                        </div>
                      );
                    })}
                  </Grid>
                </Grid>
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
  )(UserDetails)
);
