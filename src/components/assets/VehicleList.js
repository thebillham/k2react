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

function deleteVehicle(uid) {
  vehiclesRef.doc(uid).delete();
}

function VehicleList(props) {
  const { classes, vehicle } = props;
  let cameracolor = 'lightgrey';
  if (vehicle.fileUrl) cameracolor = 'green';

  let wofcolor = 'black';
  let regcolor = 'black';
  let servicecolor = 'black';
  let checkcolor = 'black';
  let roadusercolor = 'black';
  let servicekmcolor = 'black';
  let wofnote = null;
  let regnote = null;
  let today = new Date();
  if (vehicle.wof) {
    let wofexpiry = new Date(vehicle.wof);
    if (wofexpiry <= today) wofcolor = 'red';
    wofexpiry = wofexpiry.setDate(wofexpiry.getDate() - 7);
    if (wofexpiry <= today && wofcolor === 'black') wofnote = ' (Expires Soon!)';
  }
  if (vehicle.reg) {
    let regexpiry = new Date(vehicle.reg);
    if (regexpiry <= today) regcolor = 'red';
    regexpiry = regexpiry.setDate(regexpiry.getDate() - 7);
    if (regexpiry <= today & regcolor === 'black') regnote = ' (Expires Soon!)';
  }
  if (vehicle.lastservice) {
    let serviceexpiry = new Date(vehicle.lastservice);
    serviceexpiry = serviceexpiry.setFullYear(serviceexpiry.getFullYear() + 1);
    if (serviceexpiry <= today) servicecolor = 'red';
  }
  if (vehicle.lastcheck) {
    let checkexpiry = new Date(vehicle.lastcheck);
    checkexpiry = checkexpiry.setMonth(checkexpiry.getMonth() + 1);
    if (checkexpiry <= today) checkcolor = 'red';
  }
  if (vehicle.roaduserkms && vehicle.mileage) {
    if (vehicle.roaduserkms <= vehicle.mileage) roadusercolor = 'red';
  }
  if (vehicle.servicekms && vehicle.mileage) {
    if (vehicle.servicekms <= vehicle.mileage) servicekmcolor = 'red';
  }
  return (
    <ListItem
      dense
      className={classes.hoverItem}
      key={vehicle.number} >
      <Grid container
        direction="row"
        justify="flex-start"
        alignItems="flex-start">
        <Grid item xs={2} style={{ marginTop: 32 }}>
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
          <IconButton onClick={() => {props.showModal({ modalType: VEHICLE, modalProps: { doc: vehicle, title: "Edit Vehicle", } })}}>
            <Edit />
          </IconButton>
        </Grid>
        <Grid item xs={4} style={{ fontWeight: 100, fontSize: 14, }}>
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 500, }}>{ vehicle.number }</div>
          <div><b>{ vehicle.location }</b></div>
          <div><i>{ vehicle.makemodel + ' (' + vehicle.year + ')' }</i></div>
          { vehicle.wof &&
            <div>
              <span style={{ fontWeight: 450, }}>
                WOF Expiry:
              </span> <span style={{ color: wofcolor }}>
                <FormattedDate value={vehicle.wof} month='long' day='numeric' year='numeric' />
              </span>
              <span style={{ color: 'orange' }}>{ wofnote }</span>
            </div>
          }
          { vehicle.reg &&
            <div>
              <span style={{ fontWeight: 450, }}>
                Reg Expiry:
              </span> <span style={{ color: regcolor }}>
                <FormattedDate value={vehicle.reg} month='long' day='numeric' year='numeric' />
              </span>
              <span style={{ color: 'orange' }}>{ regnote }</span>
            </div>
          }
        </Grid>
        <Grid item xs={3} style={{ marginTop: 16, fontWeight: 100, fontSize: 14, }}>
          { vehicle.lastservice && <div><span style={{ fontWeight: 450, }}>Last Service:</span> <span style={{ color: servicecolor }}><FormattedDate value={vehicle.lastservice} month='long' day='numeric' year='numeric' /></span></div>}
          { vehicle.lastcheck && <div><span style={{ fontWeight: 450, }}>Last Check:</span> <span style={{ color: checkcolor }}><FormattedDate value={vehicle.lastcheck} month='long' day='numeric' year='numeric' /></span></div>}
          { vehicle.mileage && <div><span style={{ fontWeight: 450, }}>Mileage:</span> <span>{vehicle.mileage + ' kms'}</span></div>}
          { vehicle.servicekms && <div><span style={{ fontWeight: 450, }}>Next Service At:</span> <span style={{ color: servicekmcolor }}>{vehicle.servicekms + ' kms'}</span></div>}
          { vehicle.roaduserkms && <div><span style={{ fontWeight: 450, }}>Road User Charges To:</span> <span style={{ color: roadusercolor }}>{vehicle.roaduserkms + ' kms'}</span></div>}
        </Grid>
        <Grid item xs={2} style={{ marginTop: 16, fontWeight: 100, fontSize: 14, }}>
          { vehicle.notes && <div>{ vehicle.notes }</div> }
        </Grid>
        <Grid item xs={1} style={{ marginTop: 32 }}>
          <IconButton onClick={() => { if (window.confirm('Are you sure you wish to delete this vehicle?')) deleteVehicle(vehicle.number)}}>
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
}

export default withStyles(styles)(connect(null, mapDispatchToProps)(VehicleList));
