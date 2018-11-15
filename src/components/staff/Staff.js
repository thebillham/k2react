import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { Grid, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress, Chip, Tab, Tabs, Paper, ExpansionPanel,
  ExpansionPanelDetails, ExpansionPanelSummary, ListItem, } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { LocationCity, School, ExpandMore } from '@material-ui/icons';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import Popup from 'reactjs-popup';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me
  };
};

class Staff extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      tabValue: 0,
      admin: false,
      officeFilters: {},
      officeFilterOn: false,
      attrFilters: {},
      attrFilterOn: false,
    }
  }

  filterOffice = chip => {
    let state = true;
    if (this.state.officeFilters[chip]) state = false;

    let filterOn = false;

    let newFilters = {
      ...this.state.officeFilters,
      [chip]: state,
    }

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      officeFilters: newFilters,
      officeFilterOn: filterOn,
    });
  }

  filterAttr = chip => {
    let state = true;
    if (this.state.attrFilters[chip]) state = false;

    let filterOn = state;

    let newFilters = {
      ...this.state.attrFilters,
      [chip]: state,
    }

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      attrFilters: newFilters,
      attrFilterOn: filterOn,
    });
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  render() {
    const TreeTable = treeTableHOC(ReactTable);
    const staff = Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name));
    var { tabValue } = this.state;


    return (
      <div style = {{ marginTop: 80 }}>
      <Paper style={{ padding: 20, }}>
        <div style={{ marginBottom: 20, }}>
          <Tabs
            value = { tabValue }
            onChange = { this.handleTabChange }
            indicatorColor = "secondary"
            textColor = "secondary"
            centered
          >
            <Tab label="Overview" />
            <Tab label="Contact List" />
            <Tab label="Documents" />
          </Tabs>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', }}>
          { tabValue === 0 &&
            <div style={{ position: 'relative', width: '80vw'}}>
              <Grid container spacing={8}>
                { ['Auckland','Christchurch','Hamilton','Nelson', 'Wellington'].map(chip => {
                  return (
                    <Grid item key={chip}>
                      <Chip icon={<LocationCity />} variant="outlined" color={this.state.officeFilters[chip] ? "secondary" : "default"} onClick={() => this.filterOffice(chip)} label={chip} />
                    </Grid>
                  );
                })}
              </Grid>
              <Grid container spacing={8}>
                { ['IP402','Asbestos Assessor','Tertiary Degree','Science Degree','Mask Fit Tested','Air Test Analyst',].map(chip => {
                  return (
                    <Grid item key={chip}>
                      <Chip icon={<School />} variant="outlined" color={this.state.attrFilters[chip] ? "secondary" : "default"} onClick={() => this.filterAttr(chip)} label={chip} />
                    </Grid>
                  );
                })}
              </Grid>
              { staff.length > 0 ?
                <div>
                  { staff
                    .filter(user => {
                      let filter = false;
                      if (this.state.officeFilterOn === false || this.state.officeFilters[user.office]) filter = true;
                      if (!this.state.attrFilterOn) {
                        if ((this.state.officeFilters['IP402'] && !user.ip402) ||
                        (this.state.officeFilters['Asbestos Assessor'] && !user.aanumber) ||
                        (this.state.officeFilters['Tertiary Degree'] && !user.tertiary) ||
                        (this.state.officeFilters['Science Degree'] && !(user.tertiary && user.tertiary.includes('Sc'))) ||
                        (this.state.officeFilters['Mask Fit Tested'] && !user.maskfit) ||
                        (this.state.officeFilters['Air Test Analyst'] && !user.auth.airanalyst)) filter = false;
                      }
                      return(filter)
                    })
                    .map(user => { return(
                    <ExpansionPanel key={user.name}>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        <b>{user.name}</b>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <div>Gmail: { user.gmail }</div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  )})}
                  {/*<TreeTable
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
                    data={Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name))}
                    showPagination={false}
                    defaultPageSize={31}
                    className="-striped -highlight"
                    columns={[
                      {
                        accessor: 'uid',
                        show: false,
                      },
                      {
                        Header: 'Name',
                        accessor: 'name',
                      },
                      {
                        Header: 'Email',
                        accessor: 'email',
                      },
                      {
                        Header: 'Gmail',
                        accessor: 'gmail',
                      },
                      {
                        Header: 'Mobile',
                        accessor: 'phone',
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
                  />*/}
                </div> : <CircularProgress />
              }
            </div>
          }
          { tabValue === 1 &&
            <div style={{ position: 'relative', width: '80vw'}}>
              { staff.map(user => {
                return(
                  <ListItem button>
                    <Grid container>
                      <Grid item xs={3}>{ user.name }</Grid>
                      <Grid item xs={2}>{ user.phone ?
                      <Popup
                        trigger={<a href={'tel:' + user.phone}>{ user.phone }</a>}
                        position="bottom center"
                        on="hover"
                        >
                        <div style={{ borderRadius: 5, backgroundColor: 'black', color: 'white', fontSize: 128, padding: 48, margin: -8, width: '60vw'}}>{user.phone}</div>
                      </Popup>
                      : <div>Work phone not listed.</div>}</Grid>
                      <Grid item xs={3}>{user.email ? <a style={{ textDecoration: 'none' }} href={'mailto:' + user.email}>{ user.email }</a> : <div>Email not set.</div>}</Grid>
                      <Grid item xs={3}>{user.gmail ? <a style={{ textDecoration: 'none' }} href={'mailto:' + user.gmail}>{ user.gmail }</a> : <div>Gmail not set.</div>}</Grid>
                    </Grid>
                  </ListItem>
                )
              })}
            </div>
          }
          { tabValue === 2 &&
            <div style={{ position: 'relative', width: '80vw'}}>
            </div>
          }
        </div>
        </Paper>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Staff);
