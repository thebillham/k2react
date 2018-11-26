import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';

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
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';

import LocationCity from '@material-ui/icons/LocationCity';
import Error from '@material-ui/icons/Error';
import School from '@material-ui/icons/School';
import Face from '@material-ui/icons/Face';
import LocalHospital from '@material-ui/icons/LocalHospital';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Https from '@material-ui/icons/Https';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';

import 'react-table/react-table.css';
import Popup from 'reactjs-popup';
import ApiCalendar from 'react-google-calendar-api';

import { connect } from 'react-redux';
import { fetchVehicles } from '../../actions/local';
import { showModal } from '../../actions/modal';
import VehicleList from './VehicleList';
import { VEHICLE } from '../../constants/modal-types';

const mapStateToProps = state => {
  return {
    vehicles: state.local.vehicles,
    offices: state.const.offices,
    search: state.local.search,
    permissions: state.const.permissions,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchVehicles: () => dispatch(fetchVehicles()),
    showModal: modal => dispatch(showModal(modal)),
  };
};

class Vehicles extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      officeFilters: {},
      officeFilterOn: false,
      dueFilters: {},
      dueFilterOn: false,
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

  filterDue = chip => {
    let state = true;
    if (this.state.dueFilters[chip]) state = false;

    let filterOn = false;

    let newFilters = {
      ...this.state.dueFilters,
      [chip]: state,
    }

    Object.values(newFilters).forEach(filter => {
      if (filter) filterOn = true;
    });

    this.setState({
      dueFilters: newFilters,
      dueFilterOn: filterOn,
    });
  }

  componentWillMount = () => {
    this.props.fetchVehicles();
  }

  filterVehicle = vehicle => {
    let filter = false;
    if (this.state.officeFilterOn === false || this.state.officeFilters[vehicle.location]) filter = true;
    if (this.props.search) {
      if (!(vehicle.number+vehicle.location+vehicle.makemodel).toLowerCase().includes(this.props.search.toLowerCase())) filter = false;
    }
    return(filter)
  }

  render() {
    var { tabValue } = this.state;
    const { classes, vehicles } = this.props;
    const filter = (
      <ExpansionPanel style={{ marginBottom: 16, }}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          Filters
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={8} direction='row' justify='flex-start' alignItems='flex-start'>
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
              { ['WOF Expired','Rego Expired','Service Due','Checks Due','Road User Charges Due','Service Kms Over'].map(chip => {
                return (
                  <div key={chip} style={{ padding: 5,}}>
                    <Chip icon={<Error />} variant="outlined" color={this.state.dueFilters[chip] ? "secondary" : "default"} onClick={() => this.filterDue(chip)} label={chip} />
                  </div>
                );
              })}
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );

    return (
      <div style = {{ marginTop: 80 }}>
        <Paper style={{ padding: 20, }}>
          <div style={{ position: 'relative', width: '70vw'}}>
            <div>
              { filter }
              <Button variant='outlined' onClick={() => {this.props.showModal({ modalType: VEHICLE, modalProps: { title: 'Add New Vehicle', } })}}>
                Add New Vehicle
              </Button>
            </div>
            <div>
              { vehicles
                .filter(vehicle => {
                  return(this.filterVehicle(vehicle))
                })
                .map(vehicle => {
                return(
                  <VehicleList key={vehicle.number} vehicle={vehicle} />
                );
              })
              }
            </div>
          </div>
        </Paper>
      </div>
    )
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Vehicles));
