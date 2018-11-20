import React from 'react';

import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';

import LocationCity from '@material-ui/icons/LocationCity';
import School from '@material-ui/icons/School';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Https from '@material-ui/icons/Https';

import 'react-table/react-table.css';
import Popup from 'reactjs-popup';
import ApiCalendar from 'react-google-calendar-api';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    offices: state.const.offices,
    contacts: state.const.officecontacts,
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
      signedFilter: undefined,
      signedFilterOn: false,
      events: {},
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

  filterSigned = chip => {
    if (this.state.signedFilter === chip) {
      this.setState({
        signedFilter: undefined,
        signedFilterOn: false,
      });
    } else {
      this.setState({
        signedFilter: chip,
        signedFilterOn: true,
      })
    }
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  getEvents = (expanded, calendarid) => {
    if (expanded && calendarid) {
      if (ApiCalendar.sign && !this.state.events[calendarid]) {
        console.log('Api calendar is signed');
        ApiCalendar.listUpcomingEvents(5, calendarid)
          .then(({result}: any) => {
            console.log('Results in');
            this.setState({ events: {
              ...this.state.events,
              [calendarid]: result.items,
            }});
            console.log(result.items);
          });
      }
    }
  }

  setDocView = type => {
    if (this.state.docview === type) {
      this.setState({ docview: undefined });
    } else {
      this.setState({ docview: type});
    }
  }

  getDocs = () => {
    const staff = Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name));
    let docs = [];
    if (this.state.docview) {
      staff.map(e => {
        if (e.attrs) {
          Object.values(e.attrs).map(attr => {
            if (attr.type === this.state.docview && attr.fileUrl) {
              docs.push(
                {
                  url: attr.fileUrl,
                  name: e.name,
                }
              )
            }
          })
        }
      });
    }
    return docs;
  }

  render() {
    // const TreeTable = treeTableHOC(ReactTable);
    const staff = Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name));
    var { tabValue } = this.state;
    const docs = this.getDocs();

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
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                  Filters
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container spacing={8} direction='row' justify='space-between' alignItems='flex-start'>
                    <Grid item xs={6} md={3}>
                      { this.props.offices.map(chip => {
                        return (
                          <div key={chip} style={{ padding: 5,}}>
                            <Chip icon={<LocationCity />} variant="outlined" color={this.state.officeFilters[chip] ? "secondary" : "default"} onClick={() => this.filterOffice(chip)} label={chip} />
                          </div>
                        );
                      })}
                    </Grid>
                    <Grid item xs={6} md={3}>
                      { ['IP402','Asbestos Assessor','Tertiary Degree','Science Degree','Mask Fit Tested',].map(chip => {
                        return (
                          <div key={chip} style={{ padding: 5,}}>
                            <Chip icon={<School />} variant="outlined" color={this.state.attrFilters[chip] ? "secondary" : "default"} onClick={() => this.filterAttr(chip)} label={chip} />
                          </div>
                        );
                      })}
                    </Grid>
                    <Grid item xs={6} md={3}>
                      { this.props.permissions.map(chip => {
                        return (
                          <div key={chip.name} style={{ padding: 5,}}>
                            <Chip icon={<Https />} variant="outlined" color={this.state.authFilters[chip.name] ? "secondary" : "default"} onClick={() => this.filterAuth(chip.name)} label={chip.name} />
                          </div>
                        );
                      })}
                    </Grid>
                    <Grid item xs={6} md={3}>
                      { ['MyK2 User','Not Signed Up'].map(chip => {
                        return (
                          <div key={chip} style={{ padding: 5,}}>
                            <Chip variant='outlined' color={this.state.signedFilter === chip ? 'secondary' : 'default'} onClick={() => this.filterSigned(chip)} label={chip} />
                          </div>
                        );
                      })}
                    </Grid>
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
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
                        if (this.state.attrFilters['Mask Fit Tested'] && user.maskfit !== 'OK') filter = false;
                      }
                      if (this.state.authFilterOn) {
                        this.props.permissions.map(permission => {
                          if (!user.auth) filter = false;
                            else if (this.state.authFilters[permission.name] && !user.auth[permission.name]) filter = false;
                        });
                      }
                      if (this.state.signedFilterOn) {
                        if (this.state.signedFilter === 'MyK2 User' && !user.key) filter = false;
                        if (this.state.signedFilter === 'Not Signed Up' && user.key) filter = false;
                      }
                      return(filter)
                    })
                    .map(user => { return(
                    <ExpansionPanel key={user.name} onChange={(event, ex) => { this.getEvents(ex, user.gmail)}}>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        <b>{user.name}</b>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <StaffCard staff={{...user, events: this.state.events[user.gmail] }} />
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  )})}
                </div> : <CircularProgress />
              }
            </div>
          }
          { tabValue === 1 &&
            <div style={{ position: 'relative', width: '80vw'}}>
              { this.props.contacts.map(user => {
                return(
                  <ListItem button key={user.name}>
                    <Grid container>
                      <Grid item xs={3}>{ user.name }</Grid>
                      <Grid item xs={3}>{ user.workphone ?
                      <Popup
                        trigger={<a href={'tel:' + user.workphone}>{ user.workphone }</a>}
                        position="bottom center"
                        on="hover"
                        >
                        <div style={{ borderRadius: 20, display: 'inline-flex', backgroundColor: 'darkgrey', color: 'white', whiteSpace: 'nowrap', fontSize: 96, padding: 48, margin: -8, }}>{user.workphone}</div>
                      </Popup>
                      : <div>Phone not listed.</div>}</Grid>
                    </Grid>
                  </ListItem>
                )
              })}
              <hr />
              { staff.map(user => {
                return(
                  <ListItem button key={user.name}>
                    <Grid container>
                      <Grid item xs={3}>{ user.name }</Grid>
                      <Grid item xs={3}>{ user.workphone ?
                      <Popup
                        trigger={<a href={'tel:' + user.workphone}>{ user.workphone }</a>}
                        position="bottom center"
                        on="hover"
                        >
                        <div style={{ borderRadius: 20, display: 'inline-flex', backgroundColor: 'darkgrey', color: 'white', whiteSpace: 'nowrap', fontSize: 96, padding: 48, margin: -8, }}>{user.workphone}</div>
                      </Popup>
                      : <div>Phone not listed.</div>}</Grid>
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
                  <Button onClick={() => this.setDocView(type)} color={this.state.docview === type ? "secondary" : "default"} variant='outlined' style={{ margin: 20, }} key={type}>{type}</Button>
                );
              })
              }
              <GridList cellHeight={420} cols={4}>
                {
                  docs.map(doc => {
                    return(
                      <GridListTile key={doc.url}>
                        <img src={doc.url} alt={doc.name} />
                        <GridListTileBar
                          title={doc.name}
                          />
                      </GridListTile>
                    )
                  })
                }
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
