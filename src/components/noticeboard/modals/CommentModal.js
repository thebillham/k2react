import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { COMMENT } from "../../../constants/modal-types";
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
        open={this.props.modalType === COMMENT}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Comment"}
        </DialogTitle>
        <DialogContent>
          <TextField
            id="text"
            label="Comment"
            defaultValue={doc && doc.comment && doc.comment.text ? doc.comment.text : null}
            className={classes.dialogField}
            multiline
            rows={5}
            onChange={e => {
              this.props.handleModalChange({id: 'comment', value: e.target.value, });
            }}
          />
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
                let comment = doc.comment;
                if (comment && !comment.uid && comment.text && comment.text !== '') {
                  comment.uid = moment().format('x');
                }
                let newDoc = {};
                let comments = doc.notice.comments;
                if ((!comment.text || comment.text === '') && comment.uid) {
                  //console.log(comments);
                  delete comments[comment.uid];
                  newDoc = {
                    ...doc.notice,
                    comments,
                  }
                } else {
                  if (!comments) {
                    comments = {[comment.uid]: comment};
                  } else {
                    comments = {
                      ...comments,
                      [comment.uid]: comment
                    }
                  }
                  // Reset all staff read if a new or edited comment
                  newDoc = {
                    ...doc.notice,
                    staff: [],
                    comments,
                  }
                }

                //console.log(newDoc);
                this.props.handleModalSubmit({
                  doc: newDoc,
                  pathRef: noticesRef,
                });
                this.props.fetchNotices(true);
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
  )(NoticeModal)
);
