import React from 'react';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { auth } from '../config/firebase.js';

import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../config/styles';

// Material UI
import { CssBaseline, Collapse, Drawer, AppBar, Toolbar, List, ListItem,
  ListItemIcon, ListItemText, Typography, Divider, IconButton, Avatar,
  Button, MenuItem, Menu, InputBase } from '@material-ui/core';

// Icons
import DashboardIcon from '@material-ui/icons/Dashboard';
import JobsIcon from '@material-ui/icons/Assignment';
import LabIcon from '@material-ui/icons/Colorize';
import StaffIcon from '@material-ui/icons/People';
import MyDetailsIcon from '@material-ui/icons/Person';
import TrainingIcon from '@material-ui/icons/School';
import ToolsIcon from '@material-ui/icons/Build';
import ReferenceIcon from '@material-ui/icons/Info';

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

// Pages
import Dashboard from './dashboard/Dashboard';
import Jobs from './jobs/Jobs';
import AsbestosLab from './asbestoslab/AsbestosLab'

import Staff from './staff/Staff';
import StaffJobs from './staff/StaffJobs';
import StaffTraining from './staff/StaffTraining';

import UserDetails from './users/UserDetails';
import UserQualifications from './users/UserQualifications';
import UserTraining from './users/UserTraining';
import AppPreferences from './users/AppPreferences';

import TrainingModules from './training/TrainingModules';
import TrainingModule from './training/TrainingModule';

import Tools from './tools/Tools';

import Reference from './reference/Reference';

import Admin from './admin/Admin';
import AdminConstants from './admin/AdminConstants';

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
    };
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

            <ListItem button component={Link} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>

            <ListItem button component={Link} to="/jobs">
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
                  <ListItem button component={Link} to="/staff/qualifications" className={classes.nested}>
                  <ListItemText primary="Qualifications" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/staff/training" className={classes.nested}>
                  <ListItemText primary="Training" className={classes.subitem} />
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
                  <ListItem button component={Link} to="/mydetails/qualifications" className={classes.nested}>
                  <ListItemText primary="Qualifications" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/mydetails/log" className={classes.nested}>
                  <ListItemText primary="Training Log" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/mydetails/jobs" className={classes.nested}>
                  <ListItemText primary="Job History" className={classes.subitem} />
                </ListItem>
              </List>
            </Collapse>

            <ListItem button component={Link} to="/training">
              <ListItemIcon>
                <TrainingIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Training" />
            </ListItem>

            <ListItem button component={Link} to="/tools">
              <ListItemIcon>
                <ToolsIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Tools" />
            </ListItem>

            <ListItem button onClick={this.handleRefClick} component={Link} to="/reference">
              <ListItemIcon>
                <ReferenceIcon className={classes.accentButton} />
              </ListItemIcon>
              <ListItemText primary="Reference" />
              {this.state.openRef ? <ExpandLess /> : <ExpandMore /> }
            </ListItem>
            <Collapse in={this.state.openRef} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/reference/testmethods" className={classes.nested}>
                  <ListItemText primary="Test Methods" className={classes.subitem} />
                </ListItem>
                <ListItem button component={Link} to="/reference/hazard" className={classes.nested}>
                  <ListItemText primary="Hazard Register" className={classes.subitem} />
                </ListItem>
              </List>
            </Collapse>
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
              {/* Toolbar heading and breadcrumbs go here */}
              <Typography variant="title" color='inherit' noWrap className={classes.title}>
                <Switch>
                  <Route exact path="/" render={() => <div>Dashboard</div>} />
                  <Route path="/dashboard" render={() => <div>Dashboard</div>} />
                  <Route path="/jobs" render={() => <div>Jobs</div>} />
                  <Route path="/lab" render={() => <div>Asbestos Lab</div>} />
                  <Route exact path="/staff" render={() => <div>Staff</div>} />
                  <Route exact path="/staff/jobs" render={() => <div>Staff Jobs</div>} />
                  <Route exact path="/staff/training" render={() => <div>Staff Training</div>} />
                  <Route exact path="/mydetails" render={() => <div>My Details</div>} />
                  <Route exact path="/mydetails/qualifications" render={() => <div>My Qualifications</div>} />
                  <Route exact path="/mydetails/training" render={() => <div>My Training</div>} />
                  <Route exact path="/mydetails/preferences" render={() => <div>App Preferences</div>} />
                  <Route path="/training" render={() => <div>Training Modules</div>} />
                  <Route path="/tools" render={() => <div>Tools</div>} />
                  <Route path="/reference" render={() => <div>Reference</div>} />
                </Switch>
              </Typography>
              {/* Document library searchbar */}
              <Route path="/reference" render={() =>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
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
              <Route exact path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/jobs" component={Jobs} />
              <Route path="/asbestoslab" component={AsbestosLab} />
              <Route exact path="/staff" component={Staff} />
              <Route exact path="/staff/jobs" component={StaffJobs} />
              <Route exact path="/staff/training" component={StaffTraining} />
              <Route exact path="/staff/details/:user" component={UserDetails} />
              <Route exact path="/staff/qualifications/:user" component={UserQualifications} />
              <Route exact path="/staff/training/:user" component={UserTraining} />
              <Route exact path="/mydetails" component={UserDetails} />
              <Route exact path="/mydetails/qualifications" component={UserQualifications} />
              <Route exact path="/mydetails/training" component={UserTraining} />
              <Route exact path="/mydetails/preferences" component={AppPreferences} />
              <Route exact path="/training" component={TrainingModules} />
              <Route path="/training/:module/:stage" component={TrainingModule} />
              <Route path="/tools" component={Tools} />
              <Route path="/reference" component={Reference} />
              <Route exact path="/admin" component={Admin} />
              <Route path="/admin/constants" component={AdminConstants} />
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

export default withRouter(withStyles(styles)(MainScreen));
