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
import moment from "moment";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";

import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import MoveIcon from '@material-ui/icons/OpenWith';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';

import {SketchField, Tools} from 'react-sketch';

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
    categories: state.const.noticeCategories,
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
  state = {
    lineColor: 'black',
    tool: 'pencil',
    drawings: [],
    text: '',
    canUndo: false,
    canRedo: false,
  };

  _toolSwitch = tool => {
    this.setState({
      tool: tool,
    })
  }

  _save = () => {
    let drawings = this.state.drawings;
    drawings.push(this._sketch.toDataURL());
    this.setState({ drawings: drawings });
  }

  // _download = () => {
  //   console.save(this._sketch.toDataURL(), '')
  // }

  _undo = () => {
    this._sketch.undo();
    this.setState({
      canUndo: this._sketch.canUndo(),
      canRedo: this._sketch.canRedo(),
    })
  }

  _redo = () => {
    this._sketch.redo();
    this.setState({
      canUndo: this._sketch.canUndo(),
      canRedo: this._sketch.canRedo(),
    });
  }

  _clear = () => {
    if (
      window.confirm("Are you sure you wish to clear the image?")
    ) {
      this._sketch.clear();
      this.setState({
        controlledValue: null,
        canUndo: this._sketch.canUndo(),
        canRedo: this._sketch.canRedo(),
      });
    }
  }

  _onSketchChange = () => {
    let prev = this.state.canUndo;
    let now = this._sketch.canUndo();
    if (prev !== now) {
      this.setState({ canUndo: now });
    }
  }

  _addText = () => {
    this.setState({ tool: 'select' })
    this._sketch.addText(this.state.text);
  }

  render() {
    const { modalProps, doc, classes, categories, questions } = this.props;
    const { controlledValue } = this.state;
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
                label={doc.category === 'client' ? "Client Name" : "Job Number/Site Address"}
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
                label={'genleadseqclient'.includes(doc.category) ? "Message" : "Learnings" }
                defaultValue={doc && doc.text}
                className={classes.dialogField}
                multiline
                rows={10}
                onChange={e => {
                  this.props.handleModalChange(e.target);
                }}
              />
              {/*<InputLabel shrink>Diagram of incident</InputLabel>
              <Grid container spacing={8}>
                <Grid item>
                  <IconButton
                    aira-label="Undo"
                    onClick={this._undo}
                  >
                    <UndoIcon disabled={!this.state.canUndo} color={this.state.canUndo ? "secondary" : "action"} />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aira-label="Redo"
                    onClick={this._redo}
                  >
                    <RedoIcon disabled={!this.state.canRedo} color={this.state.canRedo ? "secondary" : "action"} />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aira-label="Move"
                    onClick={() => this._toolSwitch('select')}
                  >
                    <MoveIcon color={this.state.tool === 'select' ? "secondary" : "action"} />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aira-label="Clear"
                    onClick={this._clear}
                  >
                    <ClearIcon color={"secondary"} />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color={
                      this.state.tool === 'pencil' ? "secondary" : "primary"
                    }
                    onClick={() => this._toolSwitch('pencil')}
                  >
                    Pencil
                  </Button>
                </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color={
                        this.state.tool === 'line' ? "secondary" : "primary"
                      }
                      onClick={() => this._toolSwitch('line')}
                    >
                      Line
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color={
                        this.state.tool === 'circle' ? "secondary" : "primary"
                      }
                      onClick={() => this._toolSwitch('circle')}
                    >
                      Circle
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color={
                        this.state.tool === 'rectangle' ? "secondary" : "primary"
                      }
                      onClick={() => this._toolSwitch('rectangle')}
                    >
                      Rectangle
                    </Button>
                  </Grid>
                  <Grid item>
                  <TextField
                    label={'Add Text'}
                    onChange={(e) => this.setState({ text: e.target.value })}
                    value={this.state.text}/>
                  </Grid>
                  <Grid item>
                    <IconButton
                      color="primary"
                      onClick={this._addText}>
                      <AddIcon/>
                    </IconButton>
                  </Grid>
              </Grid>
              <SketchField
                name='sketch'
                ref={c => (this._sketch = c)}
                width='1024px'
                height='540px'
                tool={this.state.tool}
                lineColor={this.state.lineColor}
                lineWidth={3}
                defaultValue={{'background': ''}}
                value={controlledValue}
                forceValue
                onChange={this._onSketchChange}
              />*/}
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
                  doc.type = doc.category +
                  "-" + doc.date + "-"
                  doc.author.replace(/\s+/g, "_");
                  this.props.handleModalSubmit({
                    doc: doc,
                    pathRef: noticesRef,
                  });
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
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(NoticeModal)
);
