import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Menu from '@material-ui/core/Menu';
import JobsIcon from '@material-ui/icons/Assignment';
import LabIcon from '@material-ui/icons/Colorize';
import StaffIcon from '@material-ui/icons/People';
import MyDetailsIcon from '@material-ui/icons/Person';
import ReferenceIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';

import Dashboard from './Dashboard.js';
import Reference from './Reference.js';
import Staff from './Staff.js';
import MyDetails from './MyDetails.js';

import firebase, { auth, database } from '../firebase/firebase.js';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    background: '#006d44',
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  accentButton: {
    color: '#FF2D00',
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    background: '#fff',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  chartContainer: {
    marginLeft: -22,
  },
  tableContainer: {
    height: 320,
  },
  button: {
    color: "#fff",
  },
  avatar: {
    margin: 10,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 10,
  },
  subitem: {
    fontSize: 8,
  }
});

class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDrawer: true,
      anchorEl: null,
      screen: 'Dashboard',
      staffUid: null,
      openRef: false,
      tab: 0,
    };

    this.handleListClick = this.handleListClick.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleEditStaff = this.handleEditStaff.bind(this);
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
    this.setState({ openDrawer: false, openRef: false });
  };

  handleListClick(link) {
    this.setState({
      screen: link,
      tab: 0,
      // openDrawer: false
    });
  };

  handleRefClick = () => {
    this.setState({
      openDrawer: true,
      openRef: !this.state.openRef
    })
  }

  handleTabChange = (event, value) => {
    this.setState({ tab: value });
  }

  handleEditStaff = id => {
    this.setState({
      staffUid: id,
      screen: 'Staff Details',
    });
  }

  renderContent() {
    let screen = this.state.screen;
    let tab = this.state.tab;
    if (screen === 'Dashboard') {
      return <Dashboard />
    } else if (screen === 'Staff') {
      return <Staff handleEditStaff={this.handleEditStaff} />
    } else if (screen === 'Staff Details') {
      if (this.state.staffUid) {
        return <MyDetails tab = {tab} userRef = {this.state.staffUid} />
      } else {
        return <MyDetails tab = {tab} userRef = {auth.currentUser.uid} />
      }
    } else if (screen === 'My Details') {
      return <MyDetails tab = {tab} userRef = {auth.currentUser.uid} />
    } else if (screen === 'Reference') {
      return <Reference />
    } else {
      return <Dashboard />
    }
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

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
          <ListItem button onClick={() => this.handleListClick('Jobs')}>
            <ListItemIcon>
              <JobsIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Jobs" />
          </ListItem>
          <ListItem button onClick={() => this.handleListClick('Lab')}>
            <ListItemIcon>
              <LabIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Asbestos Lab" />
          </ListItem>
          <ListItem button onClick={() => this.handleListClick('Staff')}>
            <ListItemIcon>
              <StaffIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Staff" />
          </ListItem>
          <ListItem button onClick={() => this.handleListClick('My Details')}>
            <ListItemIcon>
              <MyDetailsIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="My Details" />
          </ListItem>
          <ListItem button onClick={() => this.handleListClick('Reference')}>
            <ListItemIcon>
              <ReferenceIcon className={classes.accentButton} />
            </ListItemIcon>
            <ListItemText primary="Reference" />
            {/* {this.state.openRef ? <ExpandLess /> : <ExpandMore /> } */}
          </ListItem>
          {/* <Collapse in={this.state.openRef} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button onClick={() => this.handleListClick('Reference : All Documents')} className={classes.nested}>
                <ListItemText primary="All Documents" className={classes.subitem} />
              </ListItem>
              <ListItem button onClick={() => this.handleListClick('Reference : Hazard Register')} className={classes.nested}>
                <ListItemText primary="Hazard Register" className={classes.subitem} />
              </ListItem>
                <ListItem button onClick={() => this.handleListClick('Reference : Test Methods')} className={classes.nested}>
                  <ListItemText primary="Test Methods" className={classes.subitem} />
                </ListItem>
              </List>
            </Collapse> */}
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
              <Typography variant="title" color="inherit" noWrap className={classes.title}>
                {this.state.screen}
              </Typography>
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
                <MenuItem onClick={this.props.app.logOut}>Logout {auth.currentUser.displayName}</MenuItem>
              </Menu>
            </Toolbar>
            { (this.state.screen === 'My Details' || this.state.screen === 'Staff Details') ?
            <Tabs
              value={this.state.tab}
              onChange={this.handleTabChange}
              centered
              >
                <Tab label="General Information" />
                <Tab label="Qualifications" />
                <Tab label="Training Log" />
                <Tab label="Training Roadmap" />
              </Tabs>
              : <div></div>
            }
            { (this.state.screen === 'Staff') ?
            <Tabs
              value={this.state.tab}
              onChange={this.handleTabChange}
              centered
              >
                <Tab label="Overview" />
                <Tab label="Training" />
              </Tabs>
              : <div></div>
            }
          </AppBar>
          {drawer}
          <main className={classes.content}>
            {this.renderContent()}
          </main>
        </div>
      </React.Fragment>
    );
  }
}

MainScreen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainScreen);
