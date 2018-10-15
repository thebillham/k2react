import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { Drawer, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';
import { auth, database } from '../../config/firebase.js';

const mapStateToProps = state => {
  return { staff: state.local.staff };
};

class Staff extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      // staffList: [],
      table: true,
      admin: false,
    }
    this.switch = this.switch.bind(this);
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
                  <TableCell></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Gmail</TableCell>
                  <TableCell>Tertiary</TableCell>
                  <TableCell>IP402</TableCell>
                  <TableCell>Asbestos Assessors Number</TableCell>
                  <TableCell>Job Description</TableCell>
                  <TableCell>Office</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.staff.map((user) => {
                  const path = "/staff/details/" + user.uid;
                  return (
                    <TableRow key={user.name}>
                      <TableCell><Link to={path}><EditIcon style={{color: 'black', fontSize: 14,}} /></Link></TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.gmail}</TableCell>
                      <TableCell>BSc</TableCell>
                      <TableCell>{user.ip402 && 'Yes'}</TableCell>
                      <TableCell>{user.aanumber}</TableCell>
                      <TableCell>{user.jobdescription}</TableCell>
                      <TableCell>{user.office}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            :
            <GridList cols={6} cellHeight={250} spacing={16}>
            {this.props.staff.map((user) => {
              return (
                <GridListTile key={user.name} elevation={1}>
                  <StaffCard staff={user} />
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
