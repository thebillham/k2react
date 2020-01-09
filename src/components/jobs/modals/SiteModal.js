import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { SITE } from "../../../constants/modal-types";
import { sitesRef, storage } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
// import Geosuggest from 'react-geosuggest';
import ImageUploader from "react-images-upload";

import UploadIcon from "@material-ui/icons/CloudUpload";
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  onUploadFile
} from "../../../actions/modal";
import { fetchSites } from "../../../actions/jobs";
import { getUserAttrs } from "../../../actions/local";
import { sendSlackMessage, numericOnly } from "../../../actions/helpers";
import _ from "lodash";
import classNames from "classnames";

import "../../../config/geosuggest.css";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    siteTypes: state.const.siteTypes,
    assetClasses: state.const.assetClassesTrain
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSites: update => dispatch(fetchSites(update)),
    hideModal: () => dispatch(hideModal()),
    onUploadFile: (file, pathRef, prefix, imageQuality) =>
      dispatch(onUploadFile(file, pathRef, prefix, imageQuality)),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef))
  };
};

const jobTypes = [
  "Stack",
  "Workplace",
  "Noise",
  "Asbestos",
  "Methamphetamine",
  "Biological",
  "Other"
];

class SiteModal extends React.Component {
  deleteImage = (file, uid) => {
    this.props.handleSelectChange({
      id: "doc",
      value: { siteImageUrl: null, siteImageRef: null }
    });
    if (uid) {
      let change = {
        siteImageUrl: null,
        siteImageRef: null
      };
      sitesRef.doc(uid).update(change);
    }
    storage.ref(file).delete();
  };

  render() {
    const { modalProps, doc, classes, siteTypes, assetClasses } = this.props;
    console.log(this.props.modalType);
    console.log(doc.uid);
    return (
      <Dialog
        open={this.props.modalType === SITE}
        onClose={this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Site"}
        </DialogTitle>
        <DialogContent>
          <TextField
            className={classes.formInputLarge}
            id="siteName"
            label="Site Name"
            defaultValue={doc.siteName || ""}
            onChange={e => {
              this.props.handleModalChange({
                id: "siteName",
                value: e.target.value
              });
            }}
          />
          <InputLabel>Site Type</InputLabel>
          <Select
            className={classes.formInputLarge}
            native
            value={doc.type || ""}
            onChange={e => {
              this.props.handleModalChange({
                id: "type",
                value: e.target.value
              });
            }}
            inputProps={{
              name: "type"
            }}
          >
            <option value="" />
            {siteTypes.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          {doc.type === "train" && (
            <div>
              <div>
                <InputLabel>Asset Class</InputLabel>
                <Select
                  className={classes.formInputLarge}
                  native
                  value={doc.assetClass || ""}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: "assetClass",
                      value: e.target.value
                    });
                  }}
                  inputProps={{
                    name: "assetClass"
                  }}
                >
                  <option value="" />
                  {assetClasses.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
              <TextField
                className={classes.formInputLarge}
                id="assetClass"
                label="Asset Number"
                defaultValue={doc.assetNumber || ""}
                onChange={e => {
                  this.props.handleModalChange({
                    id: "assetNumber",
                    value: numericOnly(e.target.value)
                  });
                }}
              />
            </div>
          )}
          <InputLabel className={classes.marginTopSmall}>
            Primary Job Type
          </InputLabel>
          <Select
            className={classes.formInputLarge}
            native
            value={doc.primaryJobType || ""}
            onChange={e => {
              this.props.handleModalChange({
                id: "primaryJobType",
                value: e.target.value
              });
            }}
            inputProps={{
              name: "primaryJobType"
            }}
          >
            <option value="" />
            {jobTypes.map(s => (
              <option key={s} value={s.toLowerCase()}>
                {s}
              </option>
            ))}
          </Select>
          {/*<InputLabel className={classes.marginTopSmall}>Site Location</InputLabel>
          <Geosuggest className={classes.formInputMedium} country={'nz'} onChange={val => this.props.handleModalChange({ id: 'location', value: val })} />*/}
          {doc.siteImageUrl && (
            <div>
              <img
                src={doc.siteImageUrl}
                alt=""
                width="200px"
                style={{
                  opacity: "0.5",
                  borderStyle: "solid",
                  borderWidth: "2px"
                }}
              />
              <IconButton
                style={{
                  position: "relative",
                  top: "2px",
                  left: "-120px",
                  borderStyle: "solid",
                  borderWidth: "2px",
                  fontSize: 8
                }}
                onClick={() => {
                  if (
                    window.confirm("Are you sure you wish to delete the image?")
                  )
                    this.deleteImage(doc.siteImageRef, doc.uid);
                }}
              >
                <Close />
              </IconButton>
            </div>
          )}
          {/*Always allow file upload*/}
          <InputLabel className={classes.marginTopSmall}>
            Upload Site Image
          </InputLabel>
          <label>
            <UploadIcon
              className={classNames(classes.hoverCursor, classes.colorAccent)}
            />
            <input
              id="attr_upload_file"
              type="file"
              style={{ display: "none" }}
              onChange={e => {
                if (doc.siteImageUrl) {
                  storage.ref(doc.siteImageRef).delete();
                }
                this.props.onUploadFile({
                  file: e.currentTarget.files[0],
                  storagePath: "sites/",
                  prefix: "siteImage",
                  imageQuality: 30,
                  imageHeight: 100
                });
              }}
            />
            <LinearProgress
              className={classes.formInputLarge}
              variant="determinate"
              value={modalProps.uploadProgress}
            />
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.hideModal} color="secondary">
            Cancel
          </Button>
          {modalProps.isUploading ? (
            <Button color="primary" disabled>
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => {
                this.props.handleModalSubmit({
                  doc: doc,
                  pathRef: sitesRef,
                  docid: "random"
                });
                this.props.fetchSites(true);
              }}
              color="primary"
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteModal)
);
