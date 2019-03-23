import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../config/styles";
import { connect } from "react-redux";
import { VEHICLE } from "../../constants/modal-types";
import { vehiclesRef, storage } from "../../config/firebase";
import "../../config/tags.css";

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

import UploadIcon from "@material-ui/icons/CloudUpload";
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  handleModalChange,
  handleModalSubmitToDoc,
  onUploadFile
} from "../../actions/modal";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    offices: state.const.offices
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmitToDoc: (doc, pathRef) =>
      dispatch(handleModalSubmitToDoc(doc, pathRef))
  };
};

class VehicleModal extends React.Component {
  deleteImage = (file, uid) => {
    this.props.handleSelectChange({ id: "fileUrl", value: null });
    this.props.handleSelectChange({ id: "fileRef", value: null });
    if (uid) {
      let change = {
        fileUrl: null,
        fileRef: null
      };
      vehiclesRef.doc(uid).update(change);
    }
    storage.ref(file).delete();
  };

  render() {
    const { modalProps, doc, classes } = this.props;
    return (
      <Dialog
        open={this.props.modalType === VEHICLE}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Vehicle"}
        </DialogTitle>
        <DialogContent>
          <form>
            <TextField
              id="number"
              label="Reg Number"
              defaultValue={doc && doc.number}
              className={classes.dialogField}
              onChange={e => {
                this.props.handleModalChange(e.target);
              }}
            />

            <FormGroup>
              <TextField
                id="makemodel"
                label="Make/Model"
                defaultValue={doc && doc.makemodel}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />

              <TextField
                id="year"
                label="Year"
                type="number"
                defaultValue={doc && doc.year}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />

              <FormControl className={classes.dialogField}>
                <InputLabel shrink>Location</InputLabel>
                <Select
                  onChange={e =>
                    this.props.handleSelectChange({
                      id: "location",
                      value: e.target.value
                    })
                  }
                  value={doc.location}
                  input={<Input name="location" id="location" />}
                >
                  <option value="" />
                  {this.props.offices &&
                    this.props.offices.map(office => {
                      return (
                        <option key={office} value={office}>
                          {office}
                        </option>
                      );
                    })}
                </Select>
              </FormControl>

              <TextField
                id="wof"
                label="WOF Expiry"
                type="date"
                defaultValue={doc && doc.wof}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="reg"
                label="Registration Expiry"
                type="date"
                defaultValue={doc && doc.reg}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="lastservice"
                label="Last Service"
                type="date"
                defaultValue={doc && doc.lastservice}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="lastcheck"
                label="Last Check"
                type="date"
                defaultValue={doc && doc.lastcheck}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="mileage"
                label="Mileage"
                type="number"
                defaultValue={doc && doc.mileage}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="roaduserkms"
                label="Road User Charge Kms"
                type="number"
                defaultValue={doc && doc.roaduserkms}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="servicekms"
                label="Kms for Next Service"
                type="number"
                defaultValue={doc && doc.servicekms}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                id="notes"
                label="Notes"
                multiline
                maxlines={4}
                defaultValue={doc && doc.notes}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />

              {doc.fileUrl && (
                <div>
                  <img
                    src={doc.fileUrl}
                    width="200px"
                    alt=""
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
                        window.confirm(
                          "Are you sure you wish to delete the image?"
                        )
                      )
                        this.deleteImage(doc.fileRef, doc.uid);
                    }}
                  >
                    <Close />
                  </IconButton>
                </div>
              )}

              {/*Always allow file upload*/}
              <InputLabel style={{ fontSize: 12, marginTop: 4 }}>
                Upload Photo
              </InputLabel>
              <label>
                <UploadIcon className={classes.accentButton} />
                <input
                  id="attr_upload_file"
                  type="file"
                  style={{ display: "none" }}
                  onChange={e => {
                    if (doc.fileUrl) {
                      storage.ref(doc.fileRef).delete();
                    }
                    this.props.onUploadFile({
                      file: e.currentTarget.files[0],
                      storagePath: "assets/vehicles/" + doc.number + "_"
                    });
                  }}
                />
                <LinearProgress
                  style={{ marginTop: 4 }}
                  variant="determinate"
                  value={modalProps.uploadProgress}
                />
              </label>
            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="secondary"
          >
            Cancel
          </Button>
          {modalProps.isUploading || !doc.number ? (
            <Button color="primary" disabled>
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => {
                this.props.handleModalSubmitToDoc({
                  doc: doc,
                  pathRef: vehiclesRef.doc(doc.number)
                });
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

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(VehicleModal)
);
