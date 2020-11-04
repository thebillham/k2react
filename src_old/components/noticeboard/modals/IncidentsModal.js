import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { INCIDENT } from "../../constants/modal-types";
import { incidentsRef } from "../../config/firebase";
import "../../config/tags.css";
import moment from "moment";
import {SketchField, Tools} from 'react-sketch';

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
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

import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  onUploadFile,
  handleTagDelete,
  handleTagAddition
} from "../../actions/modal";
import { getUserAttrs, fetchIncidents, } from "../../actions/local";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    categories: state.const.incidentcategories,
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
    fetchIncidents: (update) => dispatch(fetchIncidents(update)),
  };
};

class IncidentModal extends React.Component {
  // getStyles = name => {
  //   let requiredlist = this.props.doc.required ? this.props.doc.required : [];
  //   let optionallist = this.props.doc.optional ? this.props.doc.optional : [];
  //   let list = requiredlist.concat(optionallist);
  //   return {
  //     fontWeight: list.indexOf(name) === -1 ? 200 : 600
  //   };
  // };
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
    let { controlledValue } = this.state;
    let categorymap = {};
    categories && categories.forEach(cat => {
      categorymap[cat.key] = cat.desc;
    });

    return (
      <Dialog
        open={this.props.modalType === INCIDENT}
        onClose={() => this.props.hideModal}
        maxWidth = "lg"
        fullWidth = { true }
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Submit Incident Report"}
        </DialogTitle>
        <DialogContent>
          <form>
            <InputLabel shrink>Diagram of incident</InputLabel>
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
            />
            <FormGroup>
              <Grid container>
                <Grid item xs={6}>
                  <FormControl className={classes.dialogField}>
                    <InputLabel shrink>Incident Category</InputLabel>
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
                    label="Time and Date of Incident"
                    defaultValue={doc && doc.date && moment(doc.date).format('YYYY-MM-DDTHH:ss')}
                    className={classes.dialogField}
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="job"
                    label="Job Number"
                    defaultValue={doc && doc.jobNumber}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="where"
                    label="Where did it happen?"
                    defaultValue={doc && doc.address_of_incident}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                </Grid>
                <Grid xs={6}>
                  <TextField
                    id="detail"
                    label="Give details about what happened"
                    defaultValue={doc && doc.details_of_incident}
                    className={classes.dialogField}
                    multiline
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="witnesses"
                    label="Names of witnesses"
                    defaultValue={doc && doc.names_of_witnesses}
                    className={classes.dialogField}
                    multiline
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="injurytype"
                    label="Type of injury (e.g. cut)"
                    defaultValue={doc && doc.type_of_injury}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <TextField
                    id="what_was_injured"
                    label="Part(s) of body injured, or nearly injured"
                    defaultValue={doc && doc.what_was_injured}
                    className={classes.dialogField}
                    onChange={e => {
                      this.props.handleModalChange(e.target);
                    }}
                  />
                  <InputLabel shrink>Did you see a doctor?</InputLabel>
                  <Checkbox
                    checked={doc && doc.doctor_visit}
                    onChange={e => {
                      this.props.handleModalChange({id: 'doctor_visit', value: e.target.checked});
                    }}
                    color='secondary'
                  />
                  { doc && doc.doctor_visit &&
                    <TextField
                      id="doctordetails"
                      label="Describe details and outcomes of the doctor visit"
                      defaultValue={doc && doc.details_of_doctor}
                      className={classes.dialogField}
                      multiline
                      onChange={e => {
                        this.props.handleModalChange(e.target);
                      }}
                    />
                  }
                </Grid>
              </Grid>
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
                // if (doc.category && doc.text) {
                  doc.type = doc.category +
                  "-" + doc.date + "-"
                  doc.author.replace(/\s+/g, "_");
                  this.props.handleModalSubmit({
                    doc: doc,
                    pathRef: incidentsRef,
                  });
                  this.props.fetchIncidents(true);
                // } else {
                //   window.alert("Add a category and message before submitting.");
                // }
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
  )(IncidentModal)
);
