import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { Grid, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress, Chip, Tab, Tabs, Paper, ExpansionPanel,
  ExpansionPanelDetails, ExpansionPanelSummary, ListItem, } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { LocationCity, School, ExpandMore, Https } from '@material-ui/icons';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import Popup from 'reactjs-popup';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    permissions: state.const.permissions,
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
      authFilters: {},
      authFilterOn: false,
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

  filterAuth = chip => {
    let state = true;
    if (this.state.authFilters[chip]) state = false;

    let filterOn = state;

    let newFilters = {
      ...this.state.authFilters,
      [chip]: state,
    }

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      authFilters: newFilters,
      authFilterOn: filterOn,
    });
  }

  returnDocs = () => {
    const staff = Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name));
    if (this.state.docview) {
        staff.forEach(e => {
          if (e.attrs) {
            Object.values(e.attrs).forEach(attr => {
              if (attr.type == this.state.docview && attr.fileUrl) {
                return (
                  <GridListTile>
                    <img src={attr.fileUrl} />
                  </GridListTile>
                );
              }
            });
          }
        });
      }
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  setDocView = type => {
    if (this.state.docview == type) {
      this.setState({ docview: undefined });
    } else {
      this.setState({ docview: type});
    }
  }

  render() {
    // const TreeTable = treeTableHOC(ReactTable);
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
                { ['IP402','Asbestos Assessor','Tertiary Degree','Science Degree','Mask Fit Tested',].map(chip => {
                  return (
                    <Grid item key={chip}>
                      <Chip icon={<School />} variant="outlined" color={this.state.attrFilters[chip] ? "secondary" : "default"} onClick={() => this.filterAttr(chip)} label={chip} />
                    </Grid>
                  );
                })}
              </Grid>
              <Grid container spacing={8}>
                { this.props.permissions.map(chip => {
                  return (
                    <Grid item key={chip.name}>
                      <Chip icon={<Https />} variant="outlined" color={this.state.authFilters[chip.name] ? "secondary" : "default"} onClick={() => this.filterAuth(chip.name)} label={chip.name} />
                    </Grid>
                  );
                })}
              </Grid>
              { staff.length > 0 ?
                <div style={{ marginTop: 5, }}>
                  { staff
                    .filter(user => {
                      let filter = false;
                      if (this.state.officeFilterOn === false || this.state.officeFilters[user.office]) filter = true;
                      if (this.state.attrFilterOn) {
                        if (this.state.attrFilters['IP402'] && !user.ip402) filter = false;
                        if (this.state.attrFilters['Asbestos Assessor'] && !user.aanumber) filter = false;
                        if (this.state.attrFilters['Tertiary Degree'] && !user.tertiary) filter = false;
                        if (this.state.attrFilters['Science Degree'] && !(user.tertiary && user.tertiary.includes('Sc'))) filter = false;
                        if (this.state.attrFilters['Mask Fit Tested'] && !user.maskfit) filter = false;
                      }
                      if (this.state.authFilterOn) {
                        this.props.permissions.map(permission => {
                          if (!user.auth) filter = false;
                            else if (this.state.authFilters[permission.name] && !user.auth[permission.name]) filter = false;
                        });
                      }
                      return(filter)
                    })
                    .map(user => { return(
                    <ExpansionPanel key={user.name}>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        <b>{user.name}</b>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <StaffCard staff={user} />
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  )})}
                </div> : <CircularProgress />
              }
            </div>
          }
          { tabValue === 1 &&
            <div style={{ position: 'relative', width: '80vw'}}>
              { staff.map(user => {
                return(
                  <ListItem button key={user.name}>
                    <Grid container>
                      <Grid item xs={3}>{ user.name }</Grid>
                      <Grid item xs={2}>{ user.phone ?
                      <Popup
                        trigger={<a href={'tel:' + user.phone}>{ user.phone }</a>}
                        position="bottom center"
                        on="hover"
                        >
                        <div style={{ borderRadius: 20, display: 'inline-flex', backgroundColor: 'darkgrey', color: 'white', whiteSpace: 'nowrap', fontSize: 96, padding: 48, margin: -8, }}>{user.phone}</div>
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
              {['Tertiary','IP402','AsbestosAssessor'].map(type => {
                return(
                  <Button onClick={() => this.setDocView(type)} variant='outlined' key={type}>{type}</Button>
                );
              })
              }
              <GridList>
                { this.returnDocs() }
              </GridList>
            </div>
          }
        </div>
        </Paper>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Staff);
