import React from 'react';
import { connect } from "react-redux";
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, } from '@material-ui/core';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Edit, OpenInNew, CameraAlt } from '@material-ui/icons';
import UserAttrModal from '../modals/UserAttrModal';
import { USERATTR } from '../../constants/modal-types';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { showModal } from '../../actions/modal';
import Popup from 'reactjs-popup';

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
  };
};

function AttrList(props) {
  const { classes, attr } = props;
  let cameracolor = 'lightgrey';
  if (attr.fileUrl) cameracolor = 'green';

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
          width: '70vw'}}>
        <div style={{
          width: '30vw',
          display: 'flex',
          flexDirection: 'row',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'flex-start',}}>
          <Popup
            trigger={<CameraAlt style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
            position="right center"
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
          <b>{ attr.type}</b><br />
          Full: { attr.full }<br />
          Abbrev: { attr.abbrev }<br />
          Date: { attr.date }<br />
          Expiry: { attr.expiry }<br />
          Issued By: { attr.issuer }<br />
        </div>
      </div>
    </ListItem>
  );
}

export default withStyles(styles)(connect(null, mapDispatchToProps)(AttrList));
