import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Drawer, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress } from '@material-ui/core';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';
import { auth, database } from '../../config/firebase.js';

const mapStateToProps = state => {
  return { staff: state.staff };
};

const mapDispatchToProps = dispatch => {
  // return {
  //   addDocument: document => dispatch(showModal({modalType: DOCUMENT, modalProps: { docId: null }}))
  // };
};

class Staff extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      // staffList: [],
      table: false,
      admin: false,
    }

    this.switch = this.switch.bind(this);
    this.onStaffCardClick = this.onStaffCardClick.bind(this);
  }

  // componentWillMount(){
  //   database.collection("users").doc(auth.currentUser.uid).get().then((doc) => {
  //     this.setState({ admin: doc.data().auth_admin });
  //   });
  //   database.collection("users").orderBy('name')
  //     .onSnapshot((querySnapshot) => {
  //       var users = [];
  //       querySnapshot.forEach((doc) => {
  //         let attrs = [];
  //         let jobs = [];
  //         let user = doc.data();
  //         database.collection("users").doc(doc.id).collection("attr")
  //           .onSnapshot((querySnapshot) => {
  //             querySnapshot.forEach((doc) => {
  //               attrs.push(doc.data());
  //             });
  //           });
  //         database.collection("users").doc(doc.id).collection("myjobs")
  //           .onSnapshot((querySnapshot) => {
  //             querySnapshot.forEach((doc) => {
  //               jobs.push(doc.data());
  //             });
  //           });
  //         user.uid = doc.id;
  //         user.attrs = attrs;
  //         user.jobs = jobs;
  //         users.push(user);
  //       });
  //       this.setState({
  //         staffList: users,
  //       });
  //     });
  // }

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
    return (
      <div style = {{ marginTop: 80 }}>
      { (this.props.staff.length > 0) ?
        <div>
          <div>
            <Button color="primary" onClick={this.switch}>
              {this.state.table ? 'Switch to Card View' : 'Switch to Table View'}
            </Button>
          </div>
          { this.state.table ?
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
                {this.props.staff.map((user) => {
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
            {this.props.staff.map((user) => {
              return (
                <GridListTile key={user.name}>
                  <StaffCard staff={user} onEditClick={(e) => this.onStaffCardClick(user.uid, e)} />
                </GridListTile>
              )
            })}
          </GridList>
        }
      </div> : <CircularProgress />
    }
      </div>
    )
  }
}

export default connect(mapStateToProps)(Staff);
