import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Drawer, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress } from '@material-ui/core';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';
import { auth, database } from '../../config/firebase.js';
import { School, Update, CheckCircle, LooksOne  } from '@material-ui/icons';

const mapStateToProps = state => {
  return { staff: state.local.staff };
};

class StaffTraining extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      // staffList: [],
      category: 'stack',
      admin: false,
    }
  }

  switch = (category) => {
    this.setState({
      category,
    });
  }

  render() {
    const { category } = this.state;
    return (
      <div style = {{ marginTop: 80 }}>
      { (this.props.staff.length > 0) ?
        <div>
          <div style={{flexDirection: 'row'}}>
            <Button color="primary" onClick={() => this.switch('stack')}>
              Stack Testing
            </Button>
            <Button color="primary" onClick={() => this.switch('bio')}>
              Biological
            </Button>
            <Button color="primary" onClick={() => this.switch('occ')}>
              Other OCC Health
            </Button>
            <Button color="primary" onClick={() => this.switch('asb')}>
              Asbestos
            </Button>
            <Button color="primary" onClick={() => this.switch('meth')}>
              Methamphetamine
            </Button>
            <Button color="primary" onClick={() => this.switch('other')}>
              Other
            </Button>
            <Button color="primary" onClick={() => this.switch('eq')}>
              Equipment
            </Button>
            <Button color="primary" onClick={() => this.switch('report')}>
              Reporting
            </Button>
          </div>
          <div>
            { category === 'stack' &&
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>TFP Stack Testing</TableCell>
                  <TableCell>PM10 Stack Testing</TableCell>
                  <TableCell>Condensable Stack Testing</TableCell>
                  <TableCell>Trace Metals Stack Testing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.staff.map((user) => {
                  return (
                    <TableRow key={user.name}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell></TableCell>
                      <TableCell><School /></TableCell>
                      <TableCell><Update /></TableCell>
                      <TableCell><CheckCircle /></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>}

            { category === 'bio' &&
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>General</TableCell>
                  <TableCell>Bucky Method</TableCell>
                  <TableCell>Quicktake Method</TableCell>
                  <TableCell>Surface Sampling Method</TableCell>
                  <TableCell>Moisture Meter Method</TableCell>
                  <TableCell>Bio-Aerosols</TableCell>
                  <TableCell>Viable Sampling</TableCell>
                  <TableCell>Core Sampling</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.staff.map((user) => {
                  return (
                    <TableRow key={user.name}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell><LooksOne /></TableCell>
                      <TableCell></TableCell>
                      <TableCell><School /></TableCell>
                      <TableCell></TableCell>
                      <TableCell><Update /></TableCell>
                      <TableCell><CheckCircle /></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>}
          </div>
      </div> : <div> <CircularProgress /> </div>
    }
  </div>
  )
}
}

export default connect(mapStateToProps)(StaffTraining);
