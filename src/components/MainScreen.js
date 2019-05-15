import React, { lazy, Suspense } from "react";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter
} from "react-router-dom";
import { auth, constRef } from "../config/firebase";
import { connect } from "react-redux";
import { APPSETTINGS, UPDATEDATA } from "../constants/modal-types";

import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../config/styles";
import img_Logo from "../images/logo.png";

// Material UI;

import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import Collapse from "@material-ui/core/Collapse";

// Icons
// import DashboardIcon from '@material-ui/icons/Dashboard';
import NoticeboardIcon from "@material-ui/icons/SpeakerNotes";
import JobsIcon from "@material-ui/icons/Assignment";
import MapIcon from "@material-ui/icons/Map";
import LabIcon from "@material-ui/icons/Colorize";
import StaffIcon from "@material-ui/icons/People";
import MyDetailsIcon from "@material-ui/icons/Person";
// import VehiclesIcon from "@material-ui/icons/DirectionsCar";
import DevIcon from "@material-ui/icons/HourglassEmpty";
import TrainingIcon from "@material-ui/icons/School";
import QuizIcon from "@material-ui/icons/ContactSupport";
import ToolsIcon from "@material-ui/icons/Build";
import LibraryIcon from "@material-ui/icons/LocalLibrary";
import HelpIcon from "@material-ui/icons/Help";
import UpdatesIcon from "@material-ui/icons/Update";
import SettingsIcon from "@material-ui/icons/Settings";
import UpdateIcon from "@material-ui/icons/Cached";
import IncidentIcon from '@material-ui/icons/LocalHospital';
import CocIcon from '@material-ui/icons/TableChart';
import LogIcon from '@material-ui/icons/ListAlt';
import QCIcon from '@material-ui/icons/OfflinePin'
import StatsIcon from '@material-ui/icons/InsertChart';
import TrainingPathIcon from "@material-ui/icons/DirectionsWalk";
import TrainingOverviewIcon from "@material-ui/icons/SupervisorAccount";
import ReadingLogIcon from "@material-ui/icons/Ballot";

import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import AppSettings from "./settings/AppSettings";
import UpdateData from "./settings/UpdateData";

import store from "../store";
import { onSearchChange, onCatChange } from "../actions/local";
import { sendSlackMessage } from "../Slack";

import { fetchMe, resetLocal, copyStaff, fetchGeocodes, fetchStaff, } from "../actions/local";
import { resetModal, showModal } from "../actions/modal";
import { resetDisplay } from "../actions/display";
import { initConstants } from "../actions/const";
import { fixIds } from "../actions/temp";

// Pages
const Noticeboard = lazy(() => import("./noticeboard/Noticeboard"));
const AsbestosCocs = lazy(() => import("./asbestoslab/AsbestosCocs"));
const AsbestosLog = lazy(() => import("./asbestoslab/AsbestosLog"));
const AsbestosQualityControl = lazy(() => import("./asbestoslab/AsbestosQualityControl"));
const AsbestosStats = lazy(() => import("./asbestoslab/AsbestosStats"));
const JobMap = lazy(() => import("./jobs/JobMap"));

const Staff = lazy(() => import("./personnel/Staff"));

const MyDetails = lazy(() => import("./personnel/MyDetails"));

const TrainingOverview = lazy(() => import("./training/TrainingOverview"));
const TrainingPaths = lazy(() => import("./training/TrainingPaths"));
const TrainingReadingLog = lazy(() => import("./training/TrainingReadingLog"));

const TrainingPath = lazy(() => import("./training/TrainingPath"));

const Quizzes = lazy(() => import("./training/quizzes/Quizzes"));
const Questions = lazy(() => import("./training/quizzes/Questions"));
const Quiz = lazy(() => import("./training/quizzes/Quiz"));

const Library = lazy(() => import("./library/Library"));
const DocumentViewer = lazy(() => import("./library/DocumentViewer"));

const mapStateToProps = state => {
  return { state };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchMe: () => dispatch(fetchMe()),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    resetLocal: () => dispatch(resetLocal()),
    resetModal: () => dispatch(resetModal()),
    resetDisplay: () => dispatch(resetDisplay()),
    copyStaff: (oldId, newId) => dispatch(copyStaff(oldId, newId)),
    initConstants: () => dispatch(initConstants()),
    showModal: modal => dispatch(showModal(modal)),
    fetchStaff: () => dispatch(fetchStaff()),
    // fixIds: () => dispatch(fixIds())
  };
};

class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDrawer: true,
      anchorEl: null,
      staffUid: null,
      openDev: false,
      openAsbestos: false,
      // openRef: false,
      // openStaff: false,
      // openMyDetails: false,
      openTraining: false
      // openHelp: false,
    };
  }

  componentWillMount() {
    this.props.fetchMe();
    this.props.initConstants();
    this.props.fetchGeocodes();
    if (!this.state.staff) this.props.fetchStaff();
    // this.props.fixIds();
    // constRef.set(this.props.state.const);
    // sendSlackMessage(`${auth.currentUser.displayName} has logged in.`);
    // this.props.copyStaff('2krDTwuNAmmfhLOu5hV3','atzHtINMzORORCbUzazqyxtdEh32');
  }

  handleLogOut = () => {
    // sendSlackMessage(`${this.props.state.local.me.name} has logged out.`);
    auth.signOut().then(() => {
      this.props.resetDisplay();
      this.props.resetLocal();
      this.props.resetModal();
      this.props.history.push("/");
    });
  };

  handleGoogleMenuToggle = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleGoogleMenuClose = event => {
    this.setState({ anchorEl: null });
  };

  handleDrawerOpen = () => {
    this.setState({ openDrawer: true });
  };

  handleDrawerClose = () => {
    this.setState({
      openDrawer: false,
      openRef: false,
      openStaff: false,
      openMyDetails: false
    });
  };

  handleRefClick = () => {
    // this.setState({
    //   // openDrawer: true,
    //   openRef: !this.state.openRef
    // });
  };

  handleAsbestosClick = () => {
    this.setState({
      // openDrawer: true,
      openAsbestos: !this.state.openAsbestos
    });
  };

  handleDevClick = () => {
    this.setState({
      openDrawer: true,
      openDev: !this.state.openDev
    });
  };

  handleStaffClick = () => {
    // this.setState({
    //   // openDrawer: true,
    //   openStaff: !this.state.openStaff
    // });
  };

  handleMyDetailsClick = () => {
    // this.setState({
    //   // openDrawer: true,
    //   openMyDetails: !this.state.openMyDetails
    // });
  };

  handleTrainingClick = () => {
    this.setState({
      openDrawer: true,
      openTraining: !this.state.openTraining
    });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

    let displayName;
    if (auth.currentUser) {
      displayName = auth.currentUser.displayName;
    } else {
      displayName = "";
    }

    // Edit navigation drawer here
    const drawer = (
      <Drawer
        variant="permanent"
        classes={{
          paper: classNames(
            classes.drawerPaper,
            classes.accentButton,
            !this.state.openDrawer && classes.drawerPaperClose
          )
        }}
        open={this.state.openDrawer}
      >
        <div className={classes.toolbarIcon}>
          <IconButton
            onClick={this.handleDrawerClose}
            className={classes.accentButton}
          >
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem
            button
            component={Link}
            to="/noticeboard"
          >
            <ListItemIcon>
              <NoticeboardIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Noticeboard" />
          </ListItem>

          <Divider />

          <ListItem
            button
            onClick={this.handleStaffClick}
            component={Link}
            to="/staff"
          >
            <ListItemIcon>
              <StaffIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Staff" />
          </ListItem>
          <ListItem
            button
            onClick={this.handleMyDetailsClick}
            component={Link}
            to="/mydetails"
          >
            <ListItemIcon>
              <MyDetailsIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="My Details" />
            {/*{this.state.openMyDetails ? <ExpandLess /> : <ExpandMore /> }*/}
          </ListItem>
        <Divider />
          <ListItem button component={Link} to="/jobs/map">
            <ListItemIcon>
              <MapIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Jobs Map" />
          </ListItem>

        <Divider />
          <ListItem button onClick={this.handleAsbestosClick}>
            <ListItemIcon>
              <LabIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Asbestos Lab" />
            {this.state.openAsbestos ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.openAsbestos} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                component={Link}
                to="/asbestoslab"
                className={classes.nested}
              >
                <ListItemIcon>
                  <CocIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Chains of Custody" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/asbestossamplelog"
                className={classes.nested}
              >
                <ListItemIcon>
                  <LogIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Sample Log" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/asbestosqc"
                className={classes.nested}
              >
                <ListItemIcon>
                  <QCIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Quality Control" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/asbestosstats"
                className={classes.nested}
              >
                <ListItemIcon>
                  <StatsIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Stats" />
              </ListItem>
            </List>
          </Collapse>
        <Divider />
          <ListItem
            button
            onClick={this.handleTrainingClick}
          >
            <ListItemIcon>
              <TrainingIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Training" />
            {this.state.openTraining ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.openTraining} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                component={Link}
                to="/training/overview"
                className={classes.nested}
              >
                <ListItemIcon>
                  <TrainingOverviewIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Overview" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/training/paths"
                className={classes.nested}
              >
                <ListItemIcon>
                  <TrainingPathIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Training Paths" />
              </ListItem>
            </List>
            <ListItem
              button
              component={Link}
              to="/quizzes"
              className={classes.nested}
            >
              <ListItemIcon>
                <QuizIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Quizzes" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/training/readinglog"
              className={classes.nested}
            >
              <ListItemIcon>
                <ReadingLogIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText
                primary="Reading Log"
                className={classes.subitem}
              />
            </ListItem>
          </Collapse>
        <Divider />
        <ListItem
          button
          component={Link}
          to="/library"
        >
          <ListItemIcon>
            <LibraryIcon className={classes.accentButton} />
          </ListItemIcon>
          <ListItemText primary="Library" />
        </ListItem>
        <Divider />
        {this.props.state.local.me.auth &&
          this.props.state.local.me.auth["Admin"] && (
            <div>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  this.props.showModal({
                    modalType: APPSETTINGS,
                    modalProps: { doc: this.props.state.const }
                  });
                }}
              >
                <ListItemIcon>
                  <SettingsIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="App Settings" />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  this.props.showModal({ modalType: UPDATEDATA });
                }}
              >
                <ListItemIcon>
                  <UpdateIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Update Data" />
              </ListItem>
            </div>
          )}
        {/*<Divider />
          <ListItem button onClick={this.handleDevClick}>
            <ListItemIcon>
              <DevIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="In Development" />
            {this.state.openDev ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.openDev} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                component={Link}
                to="/vehicles"
                className={classes.nested}
              >
                <ListItemIcon>
                  <VehiclesIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Vehicles" className={classes.subitem} />
              </ListItem>*/}

              {/*<ListItem
                button
                component={Link}
                to="/jobs"
                className={classes.nested}
              >
                <ListItemIcon>
                  <JobsIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Jobs" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to="/incidents"
                className={classes.nested}
              >
                <ListItemIcon>
                  <IncidentIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Incidents" />
              </ListItem>*/}

              {/*<ListItem button component={Link} to="/mydetails/training" className={classes.nested}>
                  <ListItemIcon>
                    <MyDetailsIcon className={classes.accentButton} />
                  </ListItemIcon>
                  <ListItemText primary="Training" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/mydetails/jobs" className={classes.nested}>
                  <ListItemIcon>
                    <MyDetailsIcon className={classes.accentButton} />
                  </ListItemIcon>
                  <ListItemText primary="Job History" className={classes.subitem} />
                </ListItem>

              <ListItem
                button
                component={Link}
                to="/tools"
                className={classes.nested}
              >
                <ListItemIcon>
                  <ToolsIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Tools" />
              </ListItem>

              <ListItem
                button
                component={Link}
                to="/help"
                className={classes.nested}
              >
                <ListItemIcon>
                  <HelpIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Help" />
              </ListItem>
              {/*<ListItem
                button
                component={Link}
                to="/updates"
                className={classes.nested}
              >
                <ListItemIcon>
                  <UpdatesIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Version Updates" />
              </ListItem>
            </List>
          </Collapse>*/}
        </List>
      </Drawer>
    );

    return (
      <React.Fragment>
        {this.props.state.display.initialLoading ? (
          <div className="AppScreen K2SignInScreen">
            <div className="background">
              <div
                className="appBg containerMinHeight elBackground"
                style={{ backgroundColor: "#f6f6f6", pointerEvents: "none" }}
              >
                <div style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
            <div className="screenFgContainer">
              <div className="foreground">
                <img className="elImage" src={img_Logo} alt="" />
                <CircularProgress className="elCircular" size={200} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <CssBaseline />
            {this.props.state.local.me &&
            this.props.state.local.me.key === "47Z@g*dy!EYGL%fMnOReuTJeB1$" ? (
              // && this.props.state.local.staff[auth.currentUser.uid].gmail == auth.currentUser.email)
              <div className={classes.root}>
                <AppBar
                  position="absolute"
                  className={classNames(
                    classes.appBar,
                    this.state.openDrawer && classes.appBarShift
                  )}
                >
                  <Toolbar
                    variant="dense"
                    disableGutters={!this.state.openDrawer}
                    className={classes.toolbar}
                  >
                    <IconButton
                      color="inherit"
                      aria-label="openDrawer drawer"
                      onClick={this.handleDrawerOpen}
                      className={classNames(
                        classes.menuButton,
                        this.state.openDrawer && classes.menuButtonHidden
                      )}
                    >
                      <MenuIcon />
                    </IconButton>
                    {/*<IconButton
                          color="inherit"
                          onClick={ () => this.props.history.goBack() }
                          className={classes.menuButton}
                          >
                          <BackIcon />
                        </IconButton>*/}
                    {/* Toolbar heading and breadcrumbs go here */}
                    <Typography
                      variant="h6"
                      color="inherit"
                      noWrap
                      className={classes.title}
                    >
                      <Switch>
                        <Route
                          exact
                          path="/"
                          render={() => <div>Noticeboard</div>}
                        />
                        <Route
                          path="/dashboard"
                          render={() => <div>Dashboard</div>}
                        />
                        <Route
                          path="/noticeboard"
                          render={() => <div>Noticeboard</div>}
                        />
                        <Route
                          path="/incidents"
                          render={() => <div>Incidents</div>}
                        />
                        <Route
                          exact
                          path="/jobs"
                          render={() => <div>Jobs</div>}
                        />
                        <Route
                          path="/jobs/map"
                          render={() => <div>Jobs Map</div>}
                        />
                        <Route
                          path="/asbestoslab"
                          render={() => <div>Asbestos Lab: COCs</div>}
                        />
                        <Route
                          path="/asbestossamplelog"
                          render={() => <div>Asbestos Lab: Sample Log</div>}
                        />
                        <Route
                          path="/asbestosqc"
                          render={() => <div>Asbestos Lab: Quality Control</div>}
                        />
                        <Route
                          path="/asbestosstats"
                          render={() => <div>Asbestos Lab: Stats</div>}
                        />
                        <Route
                          exact
                          path="/staff"
                          render={() => <div>Staff</div>}
                        />
                        <Route
                          exact
                          path="/vehicles"
                          render={() => <div>Vehicles</div>}
                        />
                        <Route
                          path="/staff/details"
                          render={() => <div>Staff Details</div>}
                        />
                        <Route
                          exact
                          path="/staff/jobs"
                          render={() => <div>Staff Jobs</div>}
                        />
                        <Route
                          exact
                          path="/staff/training"
                          render={() => <div>Staff Training</div>}
                        />
                        <Route
                          exact
                          path="/mydetails"
                          render={() => <div>My Details</div>}
                        />
                        <Route
                          exact
                          path="/mydetails/training"
                          render={() => <div>My Training</div>}
                        />
                        <Route
                          exact
                          path="/mydetails/jobs"
                          render={() => <div>My Job History</div>}
                        />
                        <Route
                          exact
                          path="/mydetails/readinglog"
                          render={() => <div>My Reading Log</div>}
                        />
                        <Route
                          exact
                          path="/mydetails/preferences"
                          render={() => <div>App Preferences</div>}
                        />
                        <Route
                          exact
                          path="/training"
                          render={() => <div>Training Paths</div>}
                        />
                        <Route
                          exact
                          path="/training/paths"
                          render={() => <div>Training Paths</div>}
                        />
                        <Route
                          exact
                          path="/training/overview"
                          render={() => <div>Training Overview</div>}
                        />
                        <Route
                          path="/training/path"
                          render={() => <div>Training Path</div>}
                        />
                        <Route
                          path="/training/readinglog"
                          render={() => <div>Reading Log</div>}
                        />
                        <Route
                          path="/method"
                          render={() => <div>Method</div>}
                        />
                        <Route
                          path="/quizzes"
                          render={() => <div>Quizzes</div>}
                        />
                        <Route
                          path="/questions"
                          render={() => <div>Questions</div>}
                        />
                        <Route path="/quiz/" render={() => <div>Quiz</div>} />
                        <Route path="/tools" render={() => <div>Tools</div>} />
                        <Route
                          path="/library"
                          render={() => <div>Library</div>}
                        />
                        <Route
                          path="/document"
                          render={() => <div>Document Viewer</div>}
                        />
                        <Route path="/help" render={() => <div>Help</div>} />
                        <Route
                          path="/updates"
                          render={() => <div>Version Updates</div>}
                        />
                      </Switch>
                    </Typography>
                    <Route
                      exact
                      path="/(library|training|modules|noticeboard|asbestoslab|asbestossamplelog|tools|noticeboard|help|staff|incidents|vehicles|quizzes|questions)"
                      render={() => (
                        <div className={classes.search}>
                          <div className={classes.searchIcon}>
                            <SearchIcon />
                          </div>
                          <InputBase
                            value={this.props.search}
                            onChange={e => {
                              store.dispatch(onSearchChange(e.target.value));
                              if (e.target.value !== null) {
                                store.dispatch(onCatChange(null));
                              }
                            }}
                            placeholder="Search…"
                            classes={{
                              root: classes.inputRoot,
                              input: classes.inputInput
                            }}
                          />
                        </div>
                      )}
                    />
                    <Button
                      aria-owns={anchorEl ? "google-menu" : null}
                      aria-haspopup="true"
                      onClick={this.handleGoogleMenuToggle}
                    >
                      <Avatar
                        alt={auth.currentUser.displayName}
                        src={auth.currentUser.photoURL}
                        className={classes.avatar}
                      />
                    </Button>
                    <Menu
                      id="google-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={this.handleGoogleMenuClose}
                    >
                      <MenuItem onClick={this.handleLogOut}>
                        Log Out {displayName}
                      </MenuItem>
                    </Menu>
                  </Toolbar>
                </AppBar>
                {drawer}
                <main className={classes.content}>
                  <AppSettings />
                  <UpdateData />
                  {/* All locations are matched to their components here */}
                  <Suspense
                    fallback={
                      <div
                        style={{
                          marginTop: 80,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 200
                        }}
                      >
                        <CircularProgress />
                      </div>
                    }
                  >
                    <Switch>
                      <Route
                        exact
                        path="/"
                        component={Noticeboard}
                        key="noticeboard"
                      />
                      <Route exact path="/staff" component={Staff} />
                      <Route
                        exact
                        path="/mydetails"
                        component={MyDetails}
                        key="mydetails"
                      />
                      <Route
                        exact
                        path="/staff/details/:user"
                        component={MyDetails}
                        key="staffdetails"
                      />
                      {/*<Route exact path="/vehicles" component={Vehicles} />*/}
                      {/* <Route path="/help" component={Help} />*/}
                      {/*<Route path="/updates" component={Updates} />*/}
                      {/*<Route path="/dashboard" component={Dashboard} />*/}
                      <Route path="/noticeboard" component={Noticeboard} />
                      {/*<Route path="/incidents" component={Incidents} />*/}
                      {/*<Route exact path="/jobs" component={Jobs} />*/}
                      <Route path="/jobs/map" component={JobMap} />
                      <Route path="/asbestoslab" component={AsbestosCocs} />
                      <Route path="/asbestossamplelog" component={AsbestosLog} />
                      <Route path="/asbestosqc" component={AsbestosQualityControl} />
                      <Route path="/asbestosstats" component={AsbestosStats} />
                      {/*<Route
                        exact
                        path="/staff/training/:user"
                        component={UserTraining}
                        key="stafftraining"
                      />
                      <Route
                        exact
                        path="/staff/readinglog/:user"
                        component={UserReadingLog}
                        key="staffreadinglog"
                      />
                      <Route
                        exact
                        path="/mydetails/training"
                        component={UserTraining}
                        key="mytraining"
                      />*/}
                      <Route exact path="/training" component={TrainingPaths} />
                      <Route
                        exact
                        path="/training/overview"
                        component={TrainingOverview}
                      />
                      <Route
                        exact
                        path="/training/paths"
                        component={TrainingPaths}
                      />
                      <Route path="/training/path/:uid" component={TrainingPath} />
                      {/*<Route path="/method/:uid" component={Method} />*/}
                      <Route exact path="/quizzes" component={Quizzes} />
                      <Route
                        exact
                        path="/training/readinglog"
                        component={TrainingReadingLog}
                        key="myreadinglog"
                      />
                      <Route
                        exact
                        path="/training/readinglog/:user"
                        component={TrainingReadingLog}
                        key="staffreadinglog"
                      />
                      <Route exact path="/questions" component={Questions} />
                      <Route path="/quiz/:quiz" component={Quiz} />
                      {/*<Route path="/tools" component={Tools} />*/}
                      <Route path="/library" component={Library} />
                      <Route path="/document/:uid" component={DocumentViewer} />
                    </Switch>
                  </Suspense>
                </main>
              </div>
            ) : (
              <div className="AppScreen K2SignInScreen">
                <div className="background">
                  <div
                    className="appBg containerMinHeight elBackground"
                    style={{
                      backgroundColor: "#f6f6f6",
                      pointerEvents: "none"
                    }}
                  >
                    <div style={{ width: "100%", height: "100%" }} />
                  </div>
                </div>
                <div className="screenFgContainer">
                  <div className="foreground">
                    <img className="elImage" src={img_Logo} alt="" />
                    <div className="elFirebaseLogin">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%"
                        }}
                      >
                        <Button variant="outlined" onClick={this.handleLogOut}>
                          Log Out {displayName}
                        </Button>
                        <div style={{ marginTop: 20 }}>
                          You have not been authorised to view this site. Please
                          wait for the{" "}
                          <a href="mailto:ben@k2.co.nz">site admin</a> to create
                          your account.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}

MainScreen.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRouter(
  withStyles(styles)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(MainScreen)
  )
);
