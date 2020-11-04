import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { NOTICES } from "../../../constants/modal-types";
import { noticesRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "react-select";

import { DatePicker } from "@material-ui/pickers";

// import {SketchField, Tools} from ``'react-sketch';

import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  onUploadFile,
  handleTagDelete,
  handleTagAddition,
} from "../../../actions/modal";
import { getUserAttrs, fetchNotices } from "../../../actions/local";
import { dateOf, sendSlackMessage } from "../../../actions/helpers";
import _ from "lodash";

const mapStateToProps = (state) => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    me: state.local.me,
    doc: state.modal.modalProps.doc,
    categories: state.const.noticeCategories,
    questions: state.local.questions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => dispatch(hideModal()),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: _.debounce(
      (target) => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: (target) => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
    handleTagDelete: (tag) => dispatch(handleTagDelete(tag)),
    handleTagAddition: (tag) => dispatch(handleTagAddition(tag)),
    getUserAttrs: _.debounce(
      (userPath) => dispatch(getUserAttrs(userPath)),
      1000
    ),
    fetchNotices: (update) => dispatch(fetchNotices(update)),
  };
};

class NoticeModal extends React.Component {
  render() {
    const { modalProps, doc, classes, categories, questions } = this.props;
    return (
      <Dialog
        open={this.props.modalType === NOTICES}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Notice"}
        </DialogTitle>
        <DialogContent>
          <form>
            <FormGroup>
              <FormControl className={classes.dialogField}>
                <InputLabel shrink>Notice Category</InputLabel>
                <Select
                  className={classes.select}
                  value={
                    doc.category
                      ? { label: doc.categorydesc, id: doc.category }
                      : { label: "", id: "" }
                  }
                  options={
                    categories &&
                    categories.map((category) => ({
                      value: category.key,
                      label: category.desc,
                    }))
                  }
                  onChange={(e) => {
                    this.props.handleSelectChange({
                      id: "category",
                      value: e.value,
                    });
                    this.props.handleSelectChange({
                      id: "categorydesc",
                      value: e.label,
                    });
                  }}
                />
              </FormControl>
              <DatePicker
                value={doc.date}
                autoOk
                label={doc.category === "has" ? "Incident Date" : "Date"}
                openTo="year"
                format="D MMMM YYYY"
                views={["year", "month", "date"]}
                clearable
                onChange={(date) =>
                  this.props.handleModalChange({
                    value: dateOf(date),
                    id: "date",
                  })
                }
              />
              <div className={classes.marginBottomSmall} />
              <TextField
                id="job"
                label={
                  doc.category === "client"
                    ? "Client Name"
                    : doc.category === "geneq"
                    ? "Title"
                    : "Job Number, Site Address or Subject"
                }
                defaultValue={doc && doc.job ? doc.job : ""}
                className={classes.dialogField}
                onChange={(e) => {
                  this.props.handleModalChange(e.target);
                }}
              />
              {doc.category === "has" && (
                <div>
                  <TextField
                    id="incidentno"
                    label="Incident No."
                    defaultValue={doc && doc.incidentno ? doc.incidentno : ""}
                    className={classes.dialogField}
                    onChange={(e) => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="incidentstaff"
                    label="Staff Involved"
                    defaultValue={
                      doc && doc.incidentstaff ? doc.incidentstaff : ""
                    }
                    className={classes.dialogField}
                    onChange={(e) => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="incidentdesc"
                    label="Incident Description"
                    defaultValue={
                      doc && doc.incidentdesc ? doc.incidentdesc : ""
                    }
                    className={classes.dialogField}
                    multiline
                    rows={3}
                    onChange={(e) => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                </div>
              )}
              <TextField
                id="text"
                label={
                  "genleadseqclient".includes(doc.category)
                    ? "Message"
                    : "Learnings"
                }
                defaultValue={doc && doc.text ? doc.text : ""}
                className={classes.dialogField}
                multiline
                rows={10}
                rowsMax={30}
                onChange={(e) => {
                  this.props.handleModalChange(e.target);
                }}
              />
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
          {modalProps.isUploading ? (
            <Button color="primary" disabled>
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (doc.category) {
                  doc.type = doc.category + "-" + doc.date + "-";
                  doc.author.replace(/\s+/g, "_");
                  this.props.handleModalSubmit({
                    doc: doc,
                    pathRef: noticesRef,
                  });
                  let message = {
                    text: `${this.props.me.name} has ${
                      doc.uid ? "edited a" : "added a new"
                    } ${doc.categorydesc} notice.
                    ${doc.text && `\n${doc.text}`}`,
                  };
                  sendSlackMessage(message, true);
                  this.props.fetchNotices(true);
                } else {
                  window.alert("Add a category before submitting.");
                }
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
  connect(mapStateToProps, mapDispatchToProps)(NoticeModal)
);
