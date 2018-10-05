import React from 'react';
import PropTypes from 'prop-types';
import PDFViewer from 'mgr-pdf-viewer-react';
import classNames from 'classnames';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import StaffCard from './widgets/StaffCard.js';

import firebase, { auth, database } from '../firebase/firebase.js';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 17,
  },
});

class StaffList extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      staffList: [],
      table: false,
      admin: false,
    }

    this.switch = this.switch.bind(this);
    this.onStaffCardClick = this.onStaffCardClick.bind(this);
  }

  componentWillMount(){
    database.collection("users").doc(auth.currentUser.uid).get().then((doc) => {
      this.setState({ admin: doc.data().auth_admin });
    });
    database.collection("users").orderBy('name')
      .onSnapshot((querySnapshot) => {
        var users = [];
        querySnapshot.forEach((doc) => {
          let attrs = [];
          let jobs = [];
          let user = doc.data();
          database.collection("users").doc(doc.id).collection("attr")
            .onSnapshot((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                attrs.push(doc.data());
              });
            });
          database.collection("users").doc(doc.id).collection("myjobs")
            .onSnapshot((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                jobs.push(doc.data());
              });
            });
          user.uid = doc.id;
          user.attrs = attrs;
          user.jobs = jobs;
          users.push(user);
        });
        this.setState({
          staffList: users,
        });
      });
  }

  onStaffCardClick = id => {
    if (this.state.admin && id) {
      this.props.handleEditStaff(id);
    }
  }

  switch(){
    this.setState({
      table: !this.state.table,
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div>
          <Button color="primary" onClick={this.switch}>
            {this.state.table? 'Switch to Card View' : 'Switch to Table View'}
          </Button>
        </div>
        {this.state.table ?
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Gmail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.staffList.map((user) => {
                return (
                  <TableRow key={user.name}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.gmail}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          :
          <GridList cols={6} cellHeight={250}>
          {this.state.staffList.map((user) => {
            return (
              <GridListTile key={user.name}>
                <StaffCard staff={user} onEditClick={(e) => this.onStaffCardClick(user.uid, e)} />
              </GridListTile>
            )
          })}
        </GridList>
      }
      </div>
    )
  }
}

StaffList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StaffList);
