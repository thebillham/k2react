import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';

import LocationCity from '@material-ui/icons/LocationCity';
import Error from '@material-ui/icons/Error';
import ExpandMore from '@material-ui/icons/ExpandMore';

import 'react-table/react-table.css';

import { connect } from 'react-redux';
import { fetchVehicles } from '../../actions/local';
import { showModal } from '../../actions/modal';
import VehicleList from './VehicleList';
import VehicleModal from '../modals/VehicleModal';
import { VEHICLE } from '../../constants/modal-types';

const mapStateToProps = state => {
  return {
    vehicles: state.local.vehicles,
    offices: state.const.offices,
    search: state.local.search,
    permissions: state.const.permissions,
    me: state.local.me,
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
      officeFilters: { [this.props.me.office]: true, },
      officeFilterOn: true,
      dueFilters: {'Requires Attention': true, },
      dueFilterOn: true,
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
    let today = new Date();
    let filter = false;
    if (this.state.officeFilterOn === false || this.state.officeFilters[vehicle.location]) filter = true;
    if (this.props.search) {
      if (!(vehicle.number+vehicle.location+vehicle.makemodel).toLowerCase().includes(this.props.search.toLowerCase())) filter = false;
    }
    if (this.state.dueFilterOn) {
      let wof = new Date(vehicle.wof);
      let reg = new Date(vehicle.reg);
      let service = new Date(vehicle.lastservice);
      service = service.setFullYear(service.getFullYear() + 1);
      let check = new Date(vehicle.lastcheck);
      check = check.setMonth(check.getMonth() + 1);
      if (this.state.dueFilters['Requires Attention'] && wof > today && reg > today && service > today && vehicle.servicekms > vehicle.mileage) filter = false;
      if (this.state.dueFilters['Requires Attention'] && check <= today) filter = true;
      if (this.state.dueFilters['Requires Attention'] && vehicle.roaduserkms <= vehicle.mileage) filter = true;
      if (this.state.dueFilters['WOF or Rego Expired'] && wof > today && reg > today) filter = false;
      if (this.state.dueFilters['Service Due'] && service > today && vehicle.servicekms > vehicle.mileage) filter = false;
      if (this.state.dueFilters['Checks Due'] && check > today) filter = false;
      if (this.state.dueFilters['Checks Due'] && !vehicle.lastcheck) filter = false;
      if (this.state.dueFilters['Road User Charges Due'] && vehicle.roaduserkms > vehicle.mileage) filter = false;
      if (this.state.dueFilters['Road User Charges Due'] && !vehicle.roaduserkms) filter = false;
    }
    return(filter)
  }

  render() {
    console.log('Render!');
    const { vehicles } = this.props;
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
              { ['Requires Attention', 'WOF or Rego Expired','Service Due','Checks Due','Road User Charges Due']
              .map(chip => {
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
        <VehicleModal />
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
