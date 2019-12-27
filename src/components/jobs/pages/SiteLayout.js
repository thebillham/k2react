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
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Collapse from '@material-ui/core/Collapse';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import WfmTimeModal from "../modals/WfmTimeModal";
import ClosedArrow from "@material-ui/icons/ArrowDropDown";
import OpenArrow from "@material-ui/icons/ArrowDropUp";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncIcon from '@material-ui/icons/Sync';
import LinkIcon from '@material-ui/icons/Link';
import ArrowIcon from "@material-ui/icons/ArrowForwardIos";
import Select from 'react-select';
import SuggestionField from '../../../widgets/SuggestionField';

import {
  DatePicker,
} from "@material-ui/pickers";
import _ from "lodash";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import classNames from 'classnames';
import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
  personnelConvert,
  titleCase,
} from "../../../actions/helpers";

import moment from 'moment';

import {
  fetchWFMJobs,
  fetchWFMLeads,
  fetchWFMClients,
  fetchCurrentJobState,
  saveCurrentJobState,
  getDetailedWFMJob,
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
  handleSiteChange,
  getWfmUrl,
  getLeadHistoryDescription,
  handleJobChange,
} from "../../../actions/jobs";

import {
  filterMap,
  filterMapReset,
} from "../../../actions/display";

const mapStateToProps = state => {
  return {
    asbestosRemovalists: state.const.asbestosRemovalists,
    siteVisitTypeAsbestos: state.const.siteVisitTypeAsbestos,
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
    staff: state.local.staff,
    sites: state.jobs.sites,
    siteJobs: state.jobs.siteJobs,
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
    handleSiteChange: info => dispatch(handleSiteChange(info)),
    handleSiteChangeDebounced: _.debounce((info) => dispatch(handleSiteChange(info)),
      2000
    ),
    clearWfmJob: () => dispatch(clearWfmJob()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    saveGeocodes: g => dispatch(saveGeocodes(g)),
    fetchGeocodes: () => dispatch(fetchGeocodes()),
    updateGeocodes: g => dispatch(updateGeocodes(g)),
    saveWFMItems: items => dispatch(saveWFMItems(items)),
    saveStats: stats => dispatch(saveStats(stats)),
    filterMap: filter => dispatch(filterMap(filter)),
    filterMapReset: () => dispatch(filterMapReset()),
    showModal: modal => dispatch(showModal(modal)),
  };
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result["sourceList"] = sourceClone;
  result["destList"] = destClone;

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  borderRadius: 24,
  userSelect: "none",
  padding: 8 * 2,
  margin: `0 8px 0 0`,
  background: isDragging ? "#fafafa" : "white",
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  borderRadius: 24,
  background: isDraggingOver ? "#FFD5CC" : "#FFEAE5",
});

class SiteLayout extends React.Component {
  state = {
    roomGroups: '',
    rooms: '',
  };

  onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.props.sites[this.props.site].layout,
      result.source.index,
      result.destination.index
    );

    this.props.handleSiteChange({ site: this.props.sites[this.props.site], field: 'layout', val: items });
  }

  addRoomsToList = () => {
    let rooms = this.state.rooms
      .split("\n")
      .filter(Boolean)
      .map(e => ({ label: titleCase(e), materials: [] }));
    // Have a template for materials based on room name
    this.setState({ rooms: '' });
    // Layout is an array so "Default" won't work. Figure out new solution.
    if (this.props.sites[this.props.site].layout && this.props.sites[this.props.site].layout.default) rooms.push(...this.props.sites[this.props.site].layout.default);

    this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', field: 'default', val: rooms });
  }

  addRoomGroupsToList = () => {
    let rooms = this.state.roomGroups
      .split("\n")
      .filter(Boolean)
      .map(e => ({ label: titleCase(e), rooms: [] }));
    console.log(rooms);

    if (this.props.sites[this.props.site].layout) rooms.push(...this.props.sites[this.props.site].layout);
    console.log(rooms);

    this.setState({ roomGroups: '' });
    this.props.handleSiteChange({ site: this.props.sites[this.props.site], field: 'layout', val: rooms });
  }

  render() {
    const { classes, that, site, wfmClients, geocodes, } = this.props;
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
    const m = this.props.sites && this.props.sites[site] ? this.props.sites[site] : null;

    let rooms = m && m.layout ? m.layout : [{label: 'Kitchen'}, {label: 'Bathroom'}, {label: 'Bedroom 1'}, ];

    console.log(rooms);

    if (m) {
      const color = classes[getJobColor(m.primaryJobType)];
      return (
        <Grid container>
          <Grid item xs={12} md={5}>
            <div className={classNames(color, classes.expandHeading)}>Add Rooms</div>
            <TextField
              className={classes.columnMed}
              multiline
              rows={10}
              value={this.state.rooms}
              onChange={e => {
                this.setState({
                  rooms: e.target.value,
                })
              }}
              helperText={'Put each room/specific location (e.g. Kitchen, Reception, Grid A) at the site on a separate line, then click the arrow to add to the sortable list.'}
            />
            <Tooltip title="Add Rooms to List">
              <IconButton onClick={ this.addRoomsToList }>
                <ArrowIcon className={classes.iconRegular}/>
              </IconButton>
            </Tooltip>
              <div className={classNames(color, classes.expandHeading)}>Add Room Groups</div>
              <TextField
                className={classes.columnMed}
                multiline
                rows={10}
                value={this.state.roomGroups}
                onChange={e => {
                  this.setState({
                    roomGroups: e.target.value,
                  })
                }}
                helperText={'Put each room group/generic location (e.g. Block C, Residential Hall, Site A) at the site on a separate line, then click the arrow to add to the sortable list.'}
              />
              <Tooltip title="Add Room Groups to List">
                <IconButton onClick={ this.addRoomGroupsToList }>
                  <ArrowIcon className={classes.iconRegular}/>
                </IconButton>
              </Tooltip>
          </Grid>
          <Grid item xs={12} md={7}>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="droppable" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    {rooms.map((item, index) => (
                      <Draggable
                        key={item.text}
                        draggableId={item.text}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            {item.label}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Grid>
        </Grid>
      );
    } else return (<div />)
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteLayout)
);
