import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../../config/styles";
import { connect } from "react-redux";
import store from "../../../../store";
import { ADDTOQUIZ } from "../../../../constants/modal-types";
import { docsRef, quizzesRef } from "../../../../config/firebase";
import "../../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
// import LinearProgress from "@material-ui/core/LinearProgress";
// import UploadIcon from "@material-ui/icons/CloudUpload";
import { hideModal, handleModalChange } from "../../../../actions/modal";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    quizzes: state.local.quizzes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    )
  };
};

class UpdateCertificateVersion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quiz: "",
      required: false
    };
  }

  addToQuiz = () => {
    let quiz = this.props.quizzes.filter(
      quiz => quiz.uid === this.state.quiz
    )[0];
    let optional = quiz.optional;
    let required = quiz.required;
    let optionalexists = optional.filter(
      question => this.props.modalProps.doc.uid === question
    );
    let requiredexists = required.filter(
      question => this.props.modalProps.doc.uid === question
    );
    if (optionalexists)
      optional = optional.filter(
        question => this.props.modalProps.doc.uid !== question
      );
    if (requiredexists)
      required = required.filter(
        question => this.props.modalProps.doc.uid !== question
      );
    if (this.state.required) {
      required.push(this.props.modalProps.doc.uid);
    } else {
      optional.push(this.props.modalProps.doc.uid);
    }
    quizzesRef
      .doc(this.state.quiz)
      .update({ optional: optional, required: required });
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    return (
      <Dialog
        open={modalType === ADDTOQUIZ}
        onClose={this.props.hideModal}
      >
        <DialogTitle>Add Question to Quiz</DialogTitle>
        <DialogContent>
          Select the quiz to add the question '{modalProps.doc.question}'.
          <form style={{ marginTop: 24 }}>
            <FormGroup>
              <FormControl className={classes.dialogField}>
                <InputLabel shrink>Quiz</InputLabel>
                <Select
                  onChange={e => this.setState({ quiz: e.target.value })}
                  value={this.state.quiz}
                  input={<Input name="quiz" id="quiz" />}
                >
                  <option value="" />
                  {this.props.quizzes &&
                    this.props.quizzes.map(quiz => {
                      return (
                        <option key={quiz.uid} value={quiz.uid}>
                          {quiz.title}
                        </option>
                      );
                    })}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.required}
                    onChange={() => {
                      this.setState({ required: !this.state.required });
                    }}
                    value="required"
                  />
                }
                label="Question required (Will always be displayed on this quiz)"
              />
            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (this.state.quiz) {
                this.addToQuiz();
                this.props.hideModal();
              } else {
                window.alert("You must select a quiz from the list.");
              }
            }}
            color="primary"
          >
            Add
          </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(UpdateCertificateVersion)
);
