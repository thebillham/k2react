import React from 'react';
import { connect } from "react-redux";

import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

import Edit from '@material-ui/icons/Edit';
import Image from '@material-ui/icons/Image';
import Delete from '@material-ui/icons/Delete';

import VehicleModal from '../modals/VehicleModal';
import { VEHICLE } from '../../constants/modal-types';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { showModal } from '../../actions/modal';
import Popup from 'reactjs-popup';
import { FormattedDate } from 'react-intl';
import { vehiclesRef, storage } from '../../config/firebase';

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
  };
};

const mapStateToProps = state => {
  // return {
  //   qualificationtypes: state.const.qualificationtypes,
  //  };
};

function deleteVehicle(uid) {
  vehiclesRef.doc(uid).delete();
}

function VehicleList(props) {
  const { classes, vehicle } = props;
  let cameracolor = 'lightgrey';
  if (vehicle.fileUrl) cameracolor = 'green';

  let wofcolor = 'black';
  let today = new Date();
  if (vehicle.wof) {
    let wofexpiry = new Date(vehicle.wof);
    if (wofexpiry <= today) wofcolor = 'red';
  }
  return (
    <ListItem
      dense
      className={classes.hoverItem}
      key={vehicle.number} >
      <Grid container
        direction="row"
        justify="flex-start"
        alignItems="center">
        <Grid item xs={2}>
          { vehicle.fileUrl ?
          <Popup
            trigger={<Image style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
            position="right bottom"
            on="hover"
            disabled={vehicle.fileUrl == null}
            >
            <img src={vehicle.fileUrl} width={200} />
          </Popup>
        :
          <Image style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
          <IconButton onClick={() => {props.showModal({ modalType: VEHICLE, modalProps: { vehicle: vehicle, title: "Edit Vehicle", } })}}>
            <Edit />
          </IconButton>
          <VehicleModal />
        </Grid>
        <Grid item xs={8} style={{ fontWeight: 100, fontSize: 14, }}>
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 500, }}>{ vehicle.number }</div>
          <div><i>{ vehicle.make + ' ' + vehicle.model + '(' + vehicle.year + ')' }</i></div>
          { vehicle.wof && <div><span style={{ fontWeight: 450, }}>WOF Expiry:</span> <span style={{ color: wofcolor }}><FormattedDate value={vehicle.wof.toDate()} month='long' day='numeric' year='numeric' /></span></div>}
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={() => { if (window.confirm('Are you sure you wish to delete this vehicle?')) deleteVehicle(vehicle.number)}}>
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(VehicleList));
