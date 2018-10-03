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
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import StaffCard from './StaffCard.js';
import firebase, { auth, database } from './firebase.js';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
});

class StaffList extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      staffList: [],
      table: false,
    }

    this.switch = this.switch.bind(this);
  }

  componentDidMount(){
    database.collection("users").orderBy('name')
      .onSnapshot((querySnapshot) => {
        var users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        this.setState({
          staffList: users,
        });
      });
  }

  switch(){
    this.setState({
      table: !this.state.table,
    });
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
                  <TableRow key={user.id}>
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
              <GridListTile>
                <StaffCard staff={user} />
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
