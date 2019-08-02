import React from "react";
import { connect } from "react-redux";

import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";

import Edit from "@material-ui/icons/Edit";
import Image from "@material-ui/icons/Image";
import Delete from "@material-ui/icons/Delete";

import AttrModal from "../modals/AttrModal";
import { USER_ATTR } from "../../../constants/modal-types";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { showModal } from "../../../actions/modal";
import { getUserAttrs } from "../../../actions/local";
import Popup from "reactjs-popup";
import { usersRef, storage } from "../../../config/firebase";
import moment from "moment";

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
    getUserAttrs: userPath => dispatch(getUserAttrs(userPath))
  };
};

const mapStateToProps = state => {
  return {
    qualificationtypes: state.const.qualificationtypes
  };
};

function deleteAttr(uid, user, file) {
  console.log("UID: " + uid);
  console.log("User: " + user);
  console.log("File: " + file);
  if (file) storage.ref(file).delete();
  usersRef
    .doc(user)
    .collection("attr")
    .doc(uid)
    .delete()
    .then(() => {});
}

function AttrList(props) {
  const { classes, attr } = props;
  let cameracolor = "lightgrey";
  if (attr.fileUrl) cameracolor = "green";

  let qual = props.qualificationtypes[attr.type];

  let expirycolor = "black";
  let today = new Date();
  if (attr.expiry) {
    let expiry = new Date(attr.expiry);
    if (expiry <= today) expirycolor = "red";
  }
  return (
    <ListItem dense className={classes.hoverItem} key={attr.type + attr.date}>
      <Grid container direction="row" justify="flex-start" alignItems="center">
        <Grid item xs={2}>
          {attr.fileUrl ? (
            <Popup
              trigger={
                <Image
                  style={{ fontSize: 24, color: cameracolor, margin: 10 }}
                />
              }
              position="right bottom"
              on="hover"
              disabled={attr.fileUrl == null}
            >
              <img alt="" src={attr.fileUrl} width={200} />
            </Popup>
          ) : (
            <Image style={{ fontSize: 24, color: cameracolor, margin: 10 }} />
          )}
          <IconButton
            onClick={() => {
              props.showModal({
                modalType: USER_ATTR,
                modalProps: {
                  doc: attr,
                  userPath: props.userPath,
                  title: "Edit Item",
                  staffName: props.staffName
                }
              });
            }}
          >
            <Edit />
          </IconButton>
          <AttrModal />
        </Grid>
        <Grid item xs={8}>
          <div className={classes.subHeading}>
            {qual.name}
          </div>
          {qual.id && attr.id && (
            <div>
              <span className={classes.headingInline}>ID Number:</span> {attr.id}
            </div>
          )}
          {qual.number && attr.number && (
            <div>
              <span className={classes.headingInline}>Licence Number:</span>{" "}
              {attr.number}
            </div>
          )}
          {qual.title && attr.title && (
            <div>
              <i>{attr.title}</i>
            </div>
          )}
          <div>
            {qual.full && attr.full && (
              <span>
                <i>{attr.full}</i>
              </span>
            )}
            {qual.abbrev && attr.abbrev && <span> ({attr.abbrev})</span>}
          </div>
          {qual.class && attr.class && (
            <div>
              <span className={classes.headingInline}>Class(es):</span>{" "}
              {attr.class.join(", ")}
            </div>
          )}
          {qual.unit && attr.unit && (
            <div>
              <span className={classes.headingInline}>Unit Standard(s):</span>{" "}
              {attr.unit.join(", ")}
            </div>
          )}
          {qual.course && attr.course && (
            <div>
              <span className={classes.headingInline}>Course(s):</span>{" "}
              {attr.course.join(", ")}
            </div>
          )}
          {attr.date && (
            <div>
              <span className={classes.headingInline}>Issue Date:</span>{" "}
              {moment(attr.date).format('D MMMM YYYY')}{" "}
            </div>
          )}
          {qual.expiry && attr.expiry && (
            <div>
              <span className={classes.headingInline}>Expiry Date:</span>{" "}
              <span style={{ color: expirycolor }}>
                {moment(attr.expiry).format('D MMMM YYYY')}
              </span>
            </div>
          )}
          {qual.issuer && attr.issuer && (
            <div>
              <span className={classes.headingInline}>Issued By:</span> {attr.issuer}
            </div>
          )}
          {qual.notes && attr.notes && (
            <div>
              <span className={classes.headingInline}>Notes:</span> {attr.notes}
            </div>
          )}
        </Grid>
        <Grid item xs={1}>
          <IconButton
            onClick={() => {
              if (
                window.confirm("Are you sure you wish to delete this item?")
              ) {
                deleteAttr(attr.uid, props.userPath, attr.fileRef);
                props.getUserAttrs(props.userPath);
              }
            }}
          >
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AttrList)
);
