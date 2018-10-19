import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';

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
    const TreeTable = treeTableHOC(ReactTable);
    return (
      <div style = {{ marginTop: 80 }}>
      { (this.props.staff.length > 0) ?
        <div>
          <TreeTable
            filterable
            defaultFilterMethod={(filter, row, column) => {
              const id = filter.pivotId || filter.id;
              return row[id] !== undefined
                ?
                  String(row[id])
                  .toLowerCase()
                  .includes(filter.value.toLowerCase())
                : false;
            }}
            data={this.props.staff}
            showPagination={false}
            defaultPageSize={31}
            className="-striped -highlight"
            columns={[
              {
                accessor: 'uid',
                show: false,
              },
              {
                accessor: 'email',
                show: false,
              },
              {
                accessor: 'gmail',
                show: false,
              },
              {
                Header: 'Name',
                accessor: 'name',
              },
              {
                Header: 'Tertiary',
                accessor: 'tertiary',
              },
              {
                Header: 'IP402',
                id: 'ip402',
                accessor: d => d.ip402 && 'Yes',
                filterMethod: (filter, row) => {
                  if (filter.value === "yes") {
                    return row[filter.id] === 'Yes';
                  }
                  return true;
                },
                Filter: ({ filter, onChange }) =>
                  <select
                    onChange={event => onChange(event.target.value)}
                    style={{ width: "100%" }}
                    value={filter ? filter.value : "all"}
                  >
                    <option value="all">Show All</option>
                    <option value="yes">Show IP402 Only</option>
                  </select>,
              },
              {
                Header: 'Asbestos Assessors Number',
                accessor: 'aanumber',
                filterMethod: (filter, row) => {
                  if (filter.value === "aa") {
                    return row[filter.id] !== undefined;
                  }
                  return true;
                },
                Filter: ({ filter, onChange }) =>
                  <select
                    onChange={event => onChange(event.target.value)}
                    style={{ width: "100%" }}
                    value={filter ? filter.value : "all"}
                  >
                    <option value="all">Show All</option>
                    <option value="aa">Show Licensed Assessors</option>
                  </select>,
              },
              {
                Header: 'Job Description',
                accessor: 'jobdescription',
              },
              {
                Header: 'Office',
                accessor: 'office',
                filterMethod: (filter, row) => {
                  if (filter.value === "akl") {
                    return row[filter.id] === 'Auckland';
                  }
                  if (filter.value === "chc") {
                    return row[filter.id] === 'Christchurch';
                  }
                  if (filter.value === "htn") {
                    return row[filter.id] === 'Hamilton';
                  }
                  if (filter.value === "nsn") {
                    return row[filter.id] === 'Nelson';
                  }
                  if (filter.value === "wtn") {
                    return row[filter.id] === 'Wellington';
                  }
                  return true;
                },
                Filter: ({ filter, onChange }) =>
                  <select
                    onChange={event => onChange(event.target.value)}
                    style={{ width: "100%" }}
                    value={filter ? filter.value : "all"}
                  >
                    <option value="all">Show All</option>
                    <option value="akl">Auckland</option>
                    <option value="chc">Christchurch</option>
                    <option value="htn">Hamilton</option>
                    <option value="nsn">Nelson</option>
                    <option value="wtn">Wellington</option>
                  </select>,
              },
            ]}
            SubComponent={row => {
              // a SubComponent just for the final detail
              return (
                <StaffCard staff={row.row} />
              );
            }}
          />
          {/* <div>
            <Button color="primary" onClick={this.switch}>
              {this.state.table ? 'Switch to Card View' : 'Switch to Table View'}
            </Button>
          </div> */}
          {/* { this.state.table ?
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
        } */}
      </div> : <CircularProgress />
    }
      </div>
    )
  }
}

export default connect(mapStateToProps)(Staff);
