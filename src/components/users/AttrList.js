import React from 'react';
import { connect } from "react-redux";

import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

import Edit from '@material-ui/icons/Edit';
import Image from '@material-ui/icons/Image';
import Delete from '@material-ui/icons/Delete';

import UserAttrModal from '../modals/UserAttrModal';
import { USERATTR } from '../../constants/modal-types';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { showModal } from '../../actions/modal';
import { getUserAttrs } from '../../actions/local';
import Popup from 'reactjs-popup';
import { FormattedDate } from 'react-intl';
import { usersRef, storage } from '../../config/firebase';

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
    getUserAttrs: userPath => dispatch(getUserAttrs(userPath)),
  };
};

const mapStateToProps = state => {
  return {
    qualificationtypes: state.const.qualificationtypes,
   };
};

function deleteAttr(uid, user, file) {
  console.log('UID: ' + uid);
  console.log('User: ' + user);
  console.log('File: ' + file);
  if (file) storage.ref(file).delete();
  usersRef.doc(user).collection("attr").doc(uid).delete().then(() => {
  });
}

function AttrList(props) {
  const { classes, attr } = props;
  let cameracolor = 'lightgrey';
  if (attr.fileUrl) cameracolor = 'green';

  let qual = props.qualificationtypes[attr.type];

  let expirycolor = 'black';
  let today = new Date();
  if (attr.expiry) {
    let expiry = new Date(attr.expiry);
    if (expiry <= today) expirycolor = 'red';
  }
  return (
    <ListItem
      dense
      className={classes.hoverItem}
      key={attr.type + attr.date} >
      <Grid container
        direction="row"
        justify="flex-start"
        alignItems="center">
        <Grid item xs={2}>
          { attr.fileUrl ?
          <Popup
            trigger={<Image style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
            position="right bottom"
            on="hover"
            disabled={attr.fileUrl == null}
            >
            <img src={attr.fileUrl} width={200} />
          </Popup>
        :
          <Image style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
          <IconButton onClick={() => {props.showModal({ modalType: USERATTR, modalProps: { doc: attr, userPath: props.userPath, title: "Edit Item", staffName: props.staffName } })}}>
            <Edit />
          </IconButton>
          <UserAttrModal />
        </Grid>
        <Grid item xs={8} style={{ fontWeight: 100, fontSize: 14, }}>
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 500, }}>{ qual.name }</div>
          { qual.id && attr.id && <div><span style={{ fontWeight: 450, }}>ID Number:</span> { attr.id }</div>}
          { qual.number && attr.number && <div><span style={{ fontWeight: 450, }}>Licence Number:</span> { attr.number }</div>}
          { qual.title && attr.title && <div><i>{ attr.title }</i></div>}
          <div>{ qual.full && attr.full && <span><i>{ attr.full }</i></span>}
          { qual.abbrev && attr.abbrev && <span> ({ attr.abbrev })</span>}</div>
          { qual.class && attr.class && <div><span style={{ fontWeight: 450, }}>Class(es):</span> { attr.class.join(', ') }</div>}
          { qual.unit && attr.unit && <div><span style={{ fontWeight: 450, }}>Unit Standard(s):</span> { attr.unit.join(', ') }</div>}
          { qual.course && attr.course && <div><span style={{ fontWeight: 450, }}>Course(s):</span> { attr.course.join(', ') }</div>}
          { attr.date && <div><span style={{ fontWeight: 450, }}>Issue Date:</span> <FormattedDate value={attr.date} month='long' day='numeric' year='numeric' /> </div>}
          { qual.expiry && attr.expiry && <div><span style={{ fontWeight: 450, }}>Expiry Date:</span> <span style={{ color: expirycolor }}><FormattedDate value={attr.expiry} month='long' day='numeric' year='numeric' /></span></div>}
          { qual.issuer && attr.issuer && <div><span style={{ fontWeight: 450, }}>Issued By:</span> { attr.issuer }</div>}
          { qual.notes && attr.notes && <div><span style={{ fontWeight: 450, }}>Notes:</span> { attr.notes }</div>}
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={() => { if (window.confirm('Are you sure you wish to delete this item?')) {
            deleteAttr(attr.uid, props.userPath, attr.fileRef);
            props.getUserAttrs(props.userPath);
          }
        }}>
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AttrList));
