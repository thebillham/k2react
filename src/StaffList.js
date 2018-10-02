import React from 'react';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import PDFViewer from 'mgr-pdf-viewer-react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import StaffCard from './StaffCard.js';
import firebase, { auth } from './firebase.js';

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
  avatar: {
    margin: 10,
  }
});

class StaffList extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      staffList: [],
      count: 0,
    }
  }

  componentWillMount(){
    const usersRef = firebase.database().ref("users");
    usersRef.on('child_added', function(snapshot) {
      this.state.count = this.state.count + 1;
      const previousList = this.state.staffList;
      previousList.append({
        id: snapshot.key,
        name: snapshot.val().name,
        email: snapshot.val().email,
        gmail: snapshot.val().gmail,
        address: snapshot.val().address,
      });
      this.setState({
        staffList: previousList,
      });
    })
  }

  render() {
    const { classes } = this.props;
    const staffList = this.state.staffList.map(staffMember =>
      <ListItem>
        <StaffCard staff={staffMember} />
      </ListItem>
    );
    return (
      <div>
        <div className={classes.appBarSpacer} />
        { this.state.staffList.length }
        { this.state.count }
        <List>
          {staffList}
        </List>
      </div>
    )
  }
}

StaffList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StaffList);
