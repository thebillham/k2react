import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { USER_ATTR } from "../../../constants/modal-types";
import { usersRef, storage } from "../../../config/firebase";
import "../../../config/tags.css";
import { sendSlackMessage } from "../../../Slack";

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
  handleModalSubmit,
  onUploadFile
} from "../../../actions/modal";
import { getUserAttrs } from "../../../actions/local";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    tags: state.modal.modalProps.tags,
    tagSuggestions: state.const.docTagSuggestions,
    qualificationtypes: state.const.qualificationtypes,
    delimiters: state.const.tagDelimiters
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
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
    getUserAttrs: _.debounce(userPath => dispatch(getUserAttrs(userPath)), 1000)
  };
};

class AttrModal extends React.Component {
  sendNewAttrSlack = () => {
    let message = {
      text: `${
        this.props.modalProps.staffName
      } has added a new qualification.\n${
        this.props.qualificationtypes[this.props.doc.type].name
      }`
    };
    sendSlackMessage(message, true);
  };

  deleteImage = (file, uid) => {
    this.props.handleSelectChange({ id: "fileUrl", value: null });
    this.props.handleSelectChange({ id: "fileRef", value: null });
    if (uid) {
      let change = {
        fileUrl: null,
        fileRef: null
      };
      usersRef
        .doc(this.props.modalProps.userPath)
        .collection("attr")
        .doc(uid)
        .update(change);
    }
    storage.ref(file).delete();
  };

  render() {
    const { modalProps, doc, classes } = this.props;
    return (
      <Dialog
        open={this.props.modalType === USER_ATTR}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Item"}
        </DialogTitle>
        <DialogContent>
          {doc.type && (
            <form>
              <FormGroup>
                <FormControl className={classes.dialogField}>
                  <InputLabel shrink>Qualification Type</InputLabel>
                  <Select
                    onChange={e =>
                      this.props.handleSelectChange({
                        id: "type",
                        value: e.target.value
                      })
                    }
                    value={doc.type}
                    input={
                      <Input
                        name="qualificationtypes"
                        id="qualificationtypes"
                      />
                    }
                  >
                    <option value="" />
                    {this.props.qualificationtypes &&
                      Object.keys(this.props.qualificationtypes).map(key => {
                        return (
                          <option key={key} value={key}>
                            {this.props.qualificationtypes[key].name}
                          </option>
                        );
                      })}
                  </Select>
                </FormControl>
                {this.props.qualificationtypes[doc.type].id && (
                  <TextField
                    id="id"
                    label="ID Number"
                    defaultValue={doc && doc.id}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].number && (
                  <TextField
                    id="number"
                    label="Licence Number"
                    defaultValue={doc && doc.number}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].full && (
                  <TextField
                    id="full"
                    label="Full Qualification Title"
                    defaultValue={doc && doc.full}
                    className={classes.dialogField}
                    helperText="e.g. Bachelor of Science in Physics and Geography"
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].title && (
                  <TextField
                    id="title"
                    label="Qualification Title"
                    defaultValue={doc && doc.title}
                    className={classes.dialogField}
                    helperText="The title of the qualification or unit standard."
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].course && (
                  <TextField
                    id="course"
                    label="Course Name(s)"
                    defaultValue={doc && doc.course && doc.course.join(", ")}
                    className={classes.dialogField}
                    helperText="The name of the course as written on your card. If more than one course, separate each one with a comma."
                    onChange={e => {
                      this.props.handleModalChange({
                        id: e.target.id,
                        value: e.target.value.split(",")
                      });
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].abbrev && (
                  <TextField
                    id="abbrev"
                    label="Abbreviated Title"
                    defaultValue={doc && doc.abbrev}
                    className={classes.dialogField}
                    helperText="e.g. BSc (Hons); This will be displayed beside your name on reports"
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].unit && (
                  <TextField
                    id="unit"
                    label="Unit Standard Number(s)"
                    defaultValue={doc && doc.unit && doc.unit.join(", ")}
                    className={classes.dialogField}
                    helperText="If more than one unit standard, seperate each one with a comma"
                    onChange={e => {
                      this.props.handleModalChange({
                        id: e.target.id,
                        value: e.target.value.split(",")
                      });
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].class && (
                  <TextField
                    id="class"
                    label="Class(es)"
                    defaultValue={doc && doc.class && doc.class.join(", ")}
                    className={classes.dialogField}
                    helperText="1 = Car Full, 1L = Car Learner, 1R = Car Restricted etc. If more than one class, separate each one with a comma."
                    onChange={e => {
                      this.props.handleModalChange({
                        id: e.target.id,
                        value: e.target.value.split(",")
                      });
                    }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].issuer && (
                  <TextField
                    id="issuer"
                    label="Issuer/Provider"
                    defaultValue={doc && doc.issuer}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                )}

                {/*Date is always shown*/}
                <TextField
                  id="date"
                  label="Date Issued"
                  type="date"
                  defaultValue={doc && doc.date}
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange(e.target);
                  }}
                  InputLabelProps={{ shrink: true }}
                />

                {this.props.qualificationtypes[doc.type].expiry && (
                  <TextField
                    id="expiry"
                    label="Expiry Date"
                    type="date"
                    defaultValue={doc && doc.expiry}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}

                {this.props.qualificationtypes[doc.type].notes && (
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
                )}

                {doc.fileUrl && (
                  <div>
                    <img
                      src={doc.fileUrl}
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
                  Upload Scanned Image (Image files are preferred over PDF)
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
                        storagePath:
                          "attr/" +
                          modalProps.staffName.replace(/\s+/g, "") +
                          "/" +
                          doc.type +
                          "_"
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
          )}
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
          {modalProps.isUploading ? (
            <Button color="primary" disabled>
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => {
                this.props.handleModalSubmit({
                  doc: doc,
                  pathRef: usersRef.doc(modalProps.userPath).collection("attr")
                });
                this.sendNewAttrSlack();
                this.props.getUserAttrs(modalProps.userPath);
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
  )(AttrModal)
);
