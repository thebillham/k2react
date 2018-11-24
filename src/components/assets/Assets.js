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
import School from '@material-ui/icons/School';
import Face from '@material-ui/icons/Face';
import LocalHospital from '@material-ui/icons/LocalHospital';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Https from '@material-ui/icons/Https';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';

import 'react-table/react-table.css';
import Popup from 'reactjs-popup';
import ApiCalendar from 'react-google-calendar-api';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';
import { fetchVehicles } from '../../actions/local';
import { showModal } from '../../actions/modal';
import VehicleList from '../widgets/VehicleList';
import { VEHICLE } from '../../constants/modal-types';

const mapStateToProps = state => {
  return {
    vehicles: state.local.vehicles,
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

class Assets extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      tabValue: 0,
    }
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  componentWillMount = () => {
    this.props.fetchVehicles();
  }

  render() {
    var { tabValue } = this.state;
    const { classes, vehicles } = this.props;

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
            <Tab label="Equipment Calendar" />
            <Tab label="Vehicles" />
          </Tabs>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', }}>
          { tabValue === 0 &&
            <div style={{ position: 'relative', width: '80vw'}}>

            </div>
          }
          { tabValue === 1 &&
            <div style={{ position: 'relative', width: '60vw'}}>
              <div>
                <Button variant='outlined' onClick={() => {this.props.showModal({ modalType: VEHICLE, modalProps: { title: 'Add New Vehicle', } })}}>
                  Add New Vehicle
                </Button>
              </div>
                <div>
                  { vehicles.map(vehicle => {
                    return(
                      <VehicleList key={vehicle.number} vehicle={vehicle} />
                    );
                  })
                  }
                </div>
            </div>
          }
        </div>
        </Paper>
      </div>
    )
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Assets));
