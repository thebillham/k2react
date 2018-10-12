import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Drawer, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress } from '@material-ui/core';

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
                  <TableCell>Name</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Job Description</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Gmail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.staff.map((user) => {
                  return (
                    <TableRow key={user.name}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.office}</TableCell>
                      <TableCell>{user.jobdescription}</TableCell>
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
