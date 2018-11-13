import React from 'react';
import { connect } from "react-redux";
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, } from '@material-ui/core';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Edit, Image, Delete } from '@material-ui/icons';
import UserAttrModal from '../modals/UserAttrModal';
import { USERATTR } from '../../constants/modal-types';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { showModal } from '../../actions/modal';
import Popup from 'reactjs-popup';
import { FormattedDate } from 'react-intl';
import { usersRef, storage } from '../../config/firebase';

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
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
  usersRef.doc(user).collection("attr").doc(uid).delete();
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
    console.log(expirycolor);
    console.log(expiry);
    console.log(today);
  }
  return (
    <ListItem
      dense
      className={classes.hoverItem}
      key={attr.type + attr.date} >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'flex-start',}}>
          <Popup
            trigger={<Image style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
            position="right bottom"
            on="hover"
            disabled={attr.fileUrl == null}
            >
            { attr.fileUrl &&
            <img src={attr.fileUrl} width={200} />}
          </Popup>
          <IconButton onClick={() => {props.showModal({ modalType: USERATTR, modalProps: { doc: attr, userPath: props.userPath, } })}}>
            <Edit />
          </IconButton>
          <UserAttrModal />
        </div>
        <div style={{
          textOverflow: 'ellipsis',
          width: '20vw',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          <b>{ qual.name }</b><br />
          { attr.id && <div>ID Number: { attr.id }</div>}
          { attr.number && <div>Number: { attr.number }</div>}
          { attr.full && <div><i>{ attr.full }</i></div>}
          { attr.abbrev && <div>({ attr.abbrev })</div>}
          { attr.class && <div><b>Class(es):</b> { attr.class.join(', ') }</div>}
          { attr.unit && <div><b>Unit Standard(s):</b> { attr.unit.join(', ') }</div>}
          { attr.course && <div><b>Course(s):</b> { attr.class.course(', ') }</div>}
          { attr.date && <div><b>Issue Date:</b> <FormattedDate value={attr.date} month='long' day='numeric' year='numeric' /> </div>}
          { attr.expiry && <div><b>Expiry Date:</b> <span style={{ color: expirycolor }}><FormattedDate value={attr.expiry} month='long' day='numeric' year='numeric' /></span></div>}
          { attr.issuer && <div><b>Issued By:</b> { attr.issuer }</div>}
          { attr.notes && <div><b>Notes:</b> { attr.notes }</div>}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',}}>
          <IconButton onClick={() => { if (window.confirm('Are you sure you wish to delete this item?')) deleteAttr(attr.uid, props.userPath, attr.fileRef)}}>
            <Delete />
          </IconButton>
        </div>
      </div>
    </ListItem>
  );
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AttrList));
