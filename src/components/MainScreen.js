import React from 'react';

import { BrowserRouter as Router, Route, Link, Switch, withRouter, } from "react-router-dom";
import { auth } from '../config/firebase';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../config/styles';

// Material UI
import { CssBaseline, Collapse, Drawer, AppBar, Toolbar, List, ListItem,
  ListItemIcon, ListItemText, Typography, Divider, IconButton, Avatar,
  Button, MenuItem, Menu, InputBase, } from '@material-ui/core';

// Icons
import DashboardIcon from '@material-ui/icons/Dashboard';
import NoticeboardIcon from '@material-ui/icons/SpeakerNotes';
import JobsIcon from '@material-ui/icons/Assignment';
import LabIcon from '@material-ui/icons/Colorize';
import StaffIcon from '@material-ui/icons/People';
import MyDetailsIcon from '@material-ui/icons/Person';
import TrainingIcon from '@material-ui/icons/School';
import QuizIcon from '@material-ui/icons/ContactSupport';
import ToolsIcon from '@material-ui/icons/Build';
import LibraryIcon from '@material-ui/icons/Info';

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import BackIcon from '@material-ui/icons/ArrowBack';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

// Pages
import Dashboard from './dashboard/Dashboard';
import Noticeboard from './noticeboard/Noticeboard';
import Jobs from './jobs/Jobs';
import AsbestosLab from './asbestoslab/AsbestosLab'

import Staff from './staff/Staff';
import StaffJobs from './staff/StaffJobs';
import StaffTraining from './staff/StaffTraining';

import UserDetails from './users/UserDetails';
import UserTraining from './users/UserTraining';
import UserReadingLog from './users/UserReadingLog';
import AppPreferences from './users/AppPreferences';

import Training from './training/Training';
import TrainingPath from './training/TrainingPath';
import TrainingModules from './training/TrainingModules';
import TrainingModule from './training/TrainingModule';

import Method from './methods/Method';

import Quizzes from './quizzes/Quizzes';
import Quiz from './quizzes/Quiz';

import Tools from './tools/Tools';

import Library from './library/Library';
import DocumentViewer from './library/DocumentViewer';

import Admin from './admin/Admin';
import AdminConstants from './admin/AdminConstants';
import store from '../store';
import { onSearchChange, onCatChange } from '../actions/local';

import { fetchStaff, fetchDocuments, editUser, getUser, fetchWFM,
  fetchModules, fetchTools, fetchNotices, fetchReadingLog, fetchMethodLog,
  fetchMe, fetchQuizzes, fetchTrainingPaths, fetchAsbestosSamples,  } from '../actions/local';
import { hideModal, showModal, onUploadFile, handleModalChange, handleModalSubmit,
  handleTagAddition, handleTagDelete, } from '../actions/modal';
import { DragDropContext } from 'react-beautiful-dnd';
import UploadtoFirebase from './training/Path';
import QuestionsToFirebase from './quizzes/Questions';


// import { quizzesRef, questionsRef } from '../config/firebase';

const mapStateToProps = state => {
  return { state };
}

const mapDispatchToProps = dispatch => {
  return {
    fetchAsbestosSamples: () => dispatch(fetchAsbestosSamples()),
    fetchTrainingPaths: () => dispatch(fetchTrainingPaths()),
    fetchQuizzes: () => dispatch(fetchQuizzes()),
    fetchReadingLog: () => dispatch(fetchReadingLog()),
    fetchMethodLog: () => dispatch(fetchMethodLog()),
    fetchNotices: () => dispatch(fetchNotices()),
    fetchModules: () => dispatch(fetchModules()),
    fetchStaff: () => dispatch(fetchStaff()),
    fetchDocuments: () => dispatch(fetchDocuments()),
    fetchMe: () => dispatch(fetchMe()),
    editUser: ({userRef, target}) => dispatch(editUser(userRef, target)),
    getUser: userRef => dispatch(getUser(userRef)),
    fetchWFM: () => dispatch(fetchWFM()),
    fetchTools: () => dispatch(fetchTools()),

    hideModal: () => dispatch(hideModal()),
    showModal: document => dispatch(showModal(document)),
    onUploadFile: ({file, pathRef}) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: pathRef => dispatch(handleModalSubmit(pathRef)),

    handleTagAddition: addedTag => dispatch(handleTagAddition(addedTag)),
    handleTagDelete: removedTag => dispatch(handleTagDelete(removedTag)),
  };
};

class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDrawer: true,
      anchorEl: null,
      staffUid: null,
      openRef: false,
      openStaff: false,
      openMyDetails: false,
      openTraining: false,
    };
  }

  componentWillMount() {
    UploadtoFirebase();
    QuestionsToFirebase();
    this.props.fetchAsbestosSamples();
    this.props.fetchTrainingPaths();
    this.props.fetchQuizzes();
    this.props.fetchMe();
    this.props.fetchNotices();
    // this.props.fetchWFM();
    this.props.fetchReadingLog();
    this.props.fetchMethodLog();
    this.props.fetchTools();
    this.props.fetchModules();
    this.props.fetchStaff();
    this.props.fetchDocuments();
  }

  handleGoogleMenuToggle = event => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleGoogleMenuClose = event => {
    this.setState({ anchorEl: null });
  };

  handleDrawerOpen = () => {
    this.setState({ openDrawer: true });
  };

  handleDrawerClose = () => {
    this.setState({ openDrawer: false, openRef: false, openStaff: false, openMyDetails: false });
  };

  handleRefClick = () => {
    this.setState({
      openDrawer: true,
      openRef: !this.state.openRef
    });
  }

  handleStaffClick = () => {
    this.setState({
      openDrawer: true,
      openStaff: !this.state.openStaff
    });
  }

  handleMyDetailsClick = () => {
    this.setState({
      openDrawer: true,
      openMyDetails: !this.state.openMyDetails
    });
  }

  handleTrainingClick = () => {
    this.setState({
      openDrawer: true,
      openTraining: !this.state.openTraining
    });
  }

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

    // Edit navigation drawer here
    const drawer = (
      <Drawer
        variant="permanent"
        classes={{
          paper: classNames(classes.drawerPaper, classes.accentButton, !this.state.openDrawer && classes.drawerPaperClose),
        }}
        open={this.state.openDrawer}
        >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={this.handleDrawerClose} className={classes.accentButton}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
          <List>
            <ListItem button component={Link} to="/dashboard" disabled>
              <ListItemIcon>
                <DashboardIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>

              <ListItem button component={Link} to="/noticeboard" disabled>
                <ListItemIcon>
                  <NoticeboardIcon className={classes.accentButton} />
                </ListItemIcon>
                <ListItemText primary="Noticeboard" />
              </ListItem>

            <ListItem button component={Link} to="/jobs" disabled>
              <ListItemIcon>
                <JobsIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Jobs" />
            </ListItem>

            <ListItem button component={Link} to="/lab">
              <ListItemIcon>
                <LabIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Asbestos Lab" />
            </ListItem>

            <ListItem button onClick={this.handleStaffClick} component={Link} to="/staff">
              <ListItemIcon>
                <StaffIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Staff" />
              {this.state.openStaff ? <ExpandLess /> : <ExpandMore /> }
            </ListItem>
            <Collapse in={this.state.openStaff} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/staff/training" className={classes.nested}>
                  <ListItemText primary="Training" className={classes.subitem} />
                </ListItem>
                  <ListItem button component={Link} to="/staff/jobs" className={classes.nested} disabled>
                  <ListItemText primary="Jobs" className={classes.subitem} />
                </ListItem>
              </List>
            </Collapse>

            <ListItem button onClick={this.handleMyDetailsClick} component={Link} to="/mydetails">
              <ListItemIcon>
                <MyDetailsIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="My Details" />
              {this.state.openMyDetails ? <ExpandLess /> : <ExpandMore /> }
            </ListItem>
            <Collapse in={this.state.openMyDetails} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/mydetails/training" className={classes.nested}>
                  <ListItemText primary="Training" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/mydetails/jobs" className={classes.nested} disabled>
                  <ListItemText primary="Job History" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/mydetails/readinglog" className={classes.nested}>
                  <ListItemText primary="Reading Log" className={classes.subitem} />
                </ListItem>
              </List>
            </Collapse>

            <ListItem button onClick={this.handleTrainingClick} component={Link} to="/training">
              <ListItemIcon>
                <TrainingIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Training" />
               {/*this.state.openTraining ? <ExpandLess /> : <ExpandMore /> }*/}
            </ListItem>
            {/*<Collapse in={this.state.openTraining} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/training/modules" className={classes.nested}>
                  <ListItemText primary="All Modules" className={classes.subitem} />
                </ListItem>
              </List>
            </Collapse>*/}

            <ListItem button component={Link} to="/quizzes">
              <ListItemIcon>
                <QuizIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Quizzes" />
            </ListItem>

            <ListItem button component={Link} to="/tools" disabled>
              <ListItemIcon>
                <ToolsIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Tools" />
            </ListItem>

            <ListItem button onClick={this.handleRefClick} component={Link} to="/library">
              <ListItemIcon>
                <LibraryIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Library" />
            </ListItem>
          </List>
        <Divider />
      </Drawer>
    )

    return (
      <React.Fragment>
        <CssBaseline />
        <div className={classes.root}>
          <AppBar
            position="absolute"
            className={classNames(classes.appBar, this.state.openDrawer && classes.appBarShift)}
            >
            <Toolbar variant="dense" disableGutters={!this.state.openDrawer} className={classes.toolbar}>
              <IconButton
                color="inherit"
                aria-label="openDrawer drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(
                  classes.menuButton,
                  this.state.openDrawer && classes.menuButtonHidden,
                )}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={ () => this.props.history.goBack() }
                className={classes.menuButton}
                >
                <BackIcon />
              </IconButton>
              {/* Toolbar heading and breadcrumbs go here */}
              <Typography variant="title" color='inherit' noWrap className={classes.title}>
                <Switch>
                  <Route exact path="/" render={() => <div>My Details</div>} />
                  <Route path="/dashboard" render={() => <div>Dashboard</div>} />
                  <Route path="/noticeboard" render={() => <div>Noticeboard</div>} />
                  <Route path="/jobs" render={() => <div>Jobs</div>} />
                  <Route path="/lab" render={() => <div>Asbestos Lab</div>} />
                  <Route exact path="/staff" render={() => <div>Staff</div>} />
                  <Route path="/staff/details" render={() => <div>Staff Details</div>} />
                  <Route exact path="/staff/jobs" render={() => <div>Staff Jobs</div>} />
                  <Route exact path="/staff/training" render={() => <div>Staff Training</div>} />
                  <Route exact path="/mydetails" render={() => <div>My Details</div>} />
                  <Route exact path="/mydetails/training" render={() => <div>My Training</div>} />
                  <Route exact path="/mydetails/jobs" render={() => <div>My Job History</div>} />
                  <Route exact path="/mydetails/readinglog" render={() => <div>My Reading Log</div>} />
                  <Route exact path="/mydetails/preferences" render={() => <div>App Preferences</div>} />
                  <Route path="/training" render={() => <div>Training</div>} />
                  <Route exact path="/training/modules" render={() => <div>Training Modules</div>} />
                  <Route path="/method" render={() => <div>Method</div>} />
                  <Route path="/quizzes" render={() => <div>Quizzes</div>} />
                  <Route path="/quiz/" render={() => <div>Quiz</div>} />
                  <Route path="/tools" render={() => <div>Tools</div>} />
                  <Route path="/library" render={() => <div>Library</div>} />
                  <Route path="/document" render={() => <div>Document Viewer</div>} />
                </Switch>
              </Typography>
              <Route path="/(library|training/modules|tools|noticeboard)" render={() =>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    value={this.props.search}
                    onChange={e => {
                      store.dispatch(onSearchChange(e.target.value));
                      if (e.target.value !== null) { store.dispatch(onCatChange(null)); }
                    }}
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                  />
                </div>
              } />
              <Button
                aria-owns={ anchorEl ? 'google-menu' : null}
                aria-haspopup="true"
                onClick={this.handleGoogleMenuToggle}
                >
                <Avatar alt={auth.currentUser.displayName} src={auth.currentUser.photoURL} className={classes.avatar} />
              </Button>
              <Menu
                id="google-menu"
                anchorEl={ anchorEl }
                open={Boolean(anchorEl)}
                onClose={this.handleGoogleMenuClose}
                >
                <MenuItem onClick={auth.signOut}>Logout {auth.currentUser.displayName}</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
          {drawer}
          <main className={classes.content}>
            {/* All locations are matched to their components here */}
            <Switch>
              <Route exact path="/" component={UserDetails} key="mydetails" />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/noticeboard" component={Noticeboard} />
              <Route path="/jobs" component={Jobs} />
              <Route path="/lab" component={AsbestosLab} />
              <Route exact path="/staff" component={Staff} />
              <Route exact path="/staff/jobs" component={StaffJobs} />
              <Route exact path="/staff/training" component={StaffTraining} />
              <Route exact path="/staff/details/:user" component={UserDetails} key="staffdetails" />
              <Route exact path="/staff/training/:user" component={UserTraining} key="stafftraining" />
              <Route exact path="/staff/readinglog/:user" component={UserReadingLog} key="staffreadinglog" />
              <Route exact path="/mydetails" component={UserDetails} key="mydetails" />
              <Route exact path="/mydetails/training" component={UserTraining} key="mytraining" />
              {/* <Route exact path="/mydetails/jobs" component={UserJobs} key="myjobs" /> */}
              <Route exact path="/mydetails/readinglog" component={UserReadingLog} key="myreadinglog" />
              <Route exact path="/mydetails/preferences" component={AppPreferences} />
              <Route exact path="/training" component={Training} />
              <Route exact path="/training/modules" component={TrainingModules} />
              <Route path="/training/:uid" component={TrainingPath} />
              <Route path="/training/:module/:stage" component={TrainingModule} />
              <Route path="/method/:uid" component={Method} />
              <Route exact path="/quizzes" component={Quizzes} />
              <Route path="/quiz/:quiz" component={Quiz} />
              <Route path="/tools" component={Tools} />
              <Route path="/library" component={Library} />
              <Route path="/document/:uid" component={DocumentViewer} />
              <Route exact path="/admin" component={Admin} />
              <Route path="/admin/constants" component={AdminConstants} />
              <Route component={Dashboard} />
              {/* <Route component={NoMatch} /> */}
            </Switch>
          </main>
        </div>
      </React.Fragment>
    );
  }
}

MainScreen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(MainScreen)));
