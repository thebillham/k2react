import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

//Modals
import {
  WFM_TIME,
} from "../../../constants/modal-types";
import { showModal } from "../../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import TimerIcon from "@material-ui/icons/Timer";
import WfmTimeModal from "../modals/WfmTimeModal";
import {SketchField, Tools} from 'react-sketch';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import MoveIcon from '@material-ui/icons/OpenWith';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import { fabric } from 'fabric';

import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
} from "../../../actions/helpers";

import moment from 'moment';

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  clearWfmJob,
  saveWFMItems,
  saveGeocodes,
  fetchGeocodes,
  updateGeocodes,
  saveStats,
  collateJobsList,
  getJobColor,
  getStateString,
  getNextActionType,
  getNextActionOverdueBy,
  getWfmUrl,
  getLeadHistoryDescription,
} from "../../../actions/jobs";

import {
  filterMap,
  filterMapReset,
} from "../../../actions/display";

const mapStateToProps = state => {
  return {
    wfmJobs: state.jobs.wfmJobs,
    wfmJob: state.jobs.wfmJob,
    wfmLeads: state.jobs.wfmLeads,
    wfmClients: state.jobs.wfmClients,
    currentJobState: state.jobs.currentJobState,
    geocodes: state.jobs.geocodes,
    wfmItems: state.jobs.wfmItems,
    wfmStats: state.jobs.wfmStats,
    jobList: state.jobs.jobList,
    search: state.local.search,
    jobs: state.jobs.jobs,
    me: state.local.me,
    filter: state.display.filterMap,
    otherOptions: state.const.otherOptions,
    modalType: state.modal.modalType,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    fetchCurrentJobState: ignoreCompleted => dispatch(fetchCurrentJobState(ignoreCompleted)),
    clearWfmJob: () => dispatch(clearWfmJob()),
    saveCurrentJobState: state => dispatch(saveCurrentJobState(state)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: modal => dispatch(showModal(modal)),
    collateJobsList: (wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes) => dispatch(collateJobsList(wfmJobs, wfmLeads, currentJobState, wfmClients, geocodes)),
  };
};

class SiteMapsAndDiagrams extends React.Component {
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
    const { classes, that, jobNumber } = this.props;
    let { controlledValue } = this.state;

    return (
      <div>
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
      </div>
    )
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteMapsAndDiagrams)
);
