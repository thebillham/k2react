import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { NOTICES } from "../../../constants/modal-types";
import { noticesRef } from "../../../config/firebase";
import "../../../config/tags.css";
import moment from "moment";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";

import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  onUploadFile,
  handleTagDelete,
  handleTagAddition
} from "../../../actions/modal";
import { getUserAttrs, fetchNotices, } from "../../../actions/local";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    categories: state.const.noticecategories,
    questions: state.local.questions
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
    handleTagDelete: tag => dispatch(handleTagDelete(tag)),
    handleTagAddition: tag => dispatch(handleTagAddition(tag)),
    getUserAttrs: _.debounce(userPath => dispatch(getUserAttrs(userPath)), 1000),
    fetchNotices: (update) => dispatch(fetchNotices(update)),
  };
};

class NoticeModal extends React.Component {
  // getStyles = name => {
  //   let requiredlist = this.props.doc.required ? this.props.doc.required : [];
  //   let optionallist = this.props.doc.optional ? this.props.doc.optional : [];
  //   let list = requiredlist.concat(optionallist);
  //   return {
  //     fontWeight: list.indexOf(name) === -1 ? 200 : 600
  //   };
  // };

  render() {
    const { modalProps, doc, classes, categories, questions } = this.props;
    let categorymap = {};
    categories.forEach(cat => {
      categorymap[cat.key] = cat.desc;
    });
    // let max = 0;
    // if (doc.optional) max = max + doc.optional.length;
    // if (doc.required) max = max + doc.required.length;
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
                  onChange={e => {
                    this.props.handleSelectChange({
                      id: "category",
                      value: e.target.value
                    });
                    this.props.handleSelectChange({
                      id: "categorydesc",
                      value: categorymap[e.target.value]
                    });
                  }}
                  value={doc.category}
                  input={<Input name="category" id="category" />}
                >
                  <option value="" />
                  {categories &&
                    categories.map(category => {
                      return (
                        <option key={category.key} value={category.key}>
                          {category.desc}
                        </option>
                      );
                    })}
                </Select>
              </FormControl>
              <TextField
                id="date"
                label={doc.category === 'has' ? "Incident Date" : "Date"}
                defaultValue={doc && doc.date && moment(doc.date).format('YYYY-MM-DD')}
                className={classes.dialogField}
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />
              {!'geneq'.includes(doc.category) && <TextField
                id="job"
                label="Job Number/Site Address"
                defaultValue={doc && doc.job}
                className={classes.dialogField}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />}
              {doc.category === 'has' &&
                <div>
                  <TextField
                    id="incidentno"
                    label="Incident No."
                    defaultValue={doc && doc.incidentno}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="incidentstaff"
                    label="Staff Involved"
                    defaultValue={doc && doc.incidentstaff}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="incidentdesc"
                    label="Incident Description"
                    defaultValue={doc && doc.incidentdesc}
                    className={classes.dialogField}
                    multiline
                    rows={3}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                </div>
              }
              <TextField
                id="text"
                label={'genleadseq'.includes(doc.category) ? "Message" : "Learnings" }
                defaultValue={doc && doc.text}
                className={classes.dialogField}
                multiline
                rows={10}
                onChange={e => {
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
                if (doc.category && doc.text) {
                  doc.type = doc.category +
                  "-" + doc.date + "-"
                  doc.author.replace(/\s+/g, "_");
                  this.props.handleModalSubmit({
                    doc: doc,
                    pathRef: noticesRef,
                  });
                  this.props.fetchNotices(true);
                } else {
                  window.alert("Add a category and message before submitting.");
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

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(NoticeModal)
);
