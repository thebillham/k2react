import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { appSettingsRef } from "../../../config/firebase";

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
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
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
import SelectIcon from "@material-ui/icons/Info";
import Select from 'react-select';
import DeleteIcon from "@material-ui/icons/Close";
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

import { getFirestoreCollection } from "../../../actions/local";
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
    fetchBmTemplates: () => dispatch(getFirestoreCollection({ pathRef: appSettingsRef.doc("templates").collection("buildingMaterials"), statePath: 'bmTemplates', update: true, })),
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
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  borderRadius: 4,
  userSelect: "none",
  padding: 8,
  margin: 2,
  boxShadow: isDragging ? `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)` : `0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)`,
  background: isDragging ? "#fafafa" : "white",
  ...draggableStyle
});

const getListStyle = (isDraggingOver, isDefault) => ({
  borderRadius: 4,
  background: isDefault ? isDraggingOver ? "#006D44" : "#338a69" : isDraggingOver ? "#FF2D00" : "#ff5733",
  margin: 4,
  padding: 8,
});

class SiteLayout extends React.Component {
  state = {
    roomGroups: '',
    rooms: '',
    selectedRoom: null,
  };

  onDragEnd = result => {
    const { source, destination } = result;
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.props.sites[this.props.site].layout[source.droppableId].rooms,
        source.index,
        destination.index
      );

      this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', o2: source.droppableId, field: 'rooms', val: items });
    } else {
      const result = move(
        this.props.sites[this.props.site].layout[source.droppableId].rooms ? this.props.sites[this.props.site].layout[source.droppableId].rooms : [],
        this.props.sites[this.props.site].layout[destination.droppableId].rooms ? this.props.sites[this.props.site].layout[destination.droppableId].rooms : [],
        source,
        destination
      );

      Object.keys(result).forEach(key => {
        this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', o2: key, field: 'rooms', val: result[key] });
      });
    }
  }

  addRoomsToList = () => {
    let rooms = this.state.rooms
      .split("\n")
      .filter(Boolean)
      .map((e, index) => ({ label: titleCase(e), uid: `${e.replace(/[.:/,\s]/g, "_")}${moment().format('x')}${index}`, materials: [] }));
    // Have a template for materials based on room name
    this.setState({ rooms: '' });

    if (this.props.sites[this.props.site].layout && this.props.sites[this.props.site].layout.default) {
      rooms.push(...this.props.sites[this.props.site].layout.default.rooms);
      this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', o2: 'default', field: 'rooms', val: rooms });
    } else {
      this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', field: 'default', val: { rooms } });
    }
  }

  addRoomGroupsToList = () => {
    let rooms = this.state.roomGroups
      .split("\n")
      .filter(Boolean)
      .map((e, index) => ({ uid: `${e}${index}`, label: titleCase(e), index: index, rooms: [] }));

    rooms.forEach(room => {
      this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', field: room.uid, val: room });
    });

    this.setState({ roomGroups: '' });
  }

  deleteRoom = (r, key) => {
    let rooms = this.props.sites[this.props.site].layout[key].rooms.filter(e => e.uid !== r.uid);
    this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', o2: key, field: 'rooms', val: rooms });
  }

  deleteRoomGroup = key => {
    if (this.props.sites[this.props.site].layout[key] && this.props.sites[this.props.site].layout[key].rooms) {
      let rooms = this.props.sites[this.props.site].layout[key].rooms;

      if (this.props.sites[this.props.site].layout && this.props.sites[this.props.site].layout.default) {
        rooms.push(...this.props.sites[this.props.site].layout.default.rooms);
        this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', o2: 'default', field: 'rooms', val: rooms });
      } else {
        this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', field: 'default', val: { rooms } });
      }
    }
    this.props.handleSiteChange({ site: this.props.sites[this.props.site], o1: 'layout', field: key, val: 'delete' });
  }

  render() {
    const { classes, that, site, wfmClients, geocodes, } = this.props;
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
    const m = this.props.sites && this.props.sites[site] ? this.props.sites[site] : null;

    if (m) {
      const color = classes[getJobColor(m.primaryJobType)];
      return (
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <div className={classNames(color, classes.expandHeading)}>Add Rooms</div>
            <TextField
              className={classes.columnMed}
              multiline
              rows={20}
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
                <ArrowIcon className={classes.iconSmall}/>
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
                  <ArrowIcon className={classes.iconSmall}/>
                </IconButton>
              </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <DragDropContext onDragEnd={this.onDragEnd}>
              {m.layout && Object.keys(m.layout).filter(e => e !== 'default').map((key, index) => (
                <Droppable key={key} droppableId={key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      <div className={classes.flexRowSpread}>
                        <div className={classes.boldWhite}>{m.layout[key].label}</div>
                        <Tooltip title={'Delete Room Group. This will move all rooms inside to the unsorted room bucket.'}>
                          <IconButton
                            onClick={e => {
                              if (window.confirm('Are you sure you wish to delete this room group?'))
                                this.deleteRoomGroup(key);
                            }}>
                            <DeleteIcon className={classes.iconSmallWhite} />
                          </IconButton>
                        </Tooltip>
                      </div>
                      {m.layout[key].rooms && m.layout[key].rooms.length > 0 && m.layout[key].rooms.map((item, index) => (
                        <Draggable
                          key={item.uid}
                          draggableId={item.uid}
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
                              {this.getRoomCard(item, key)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
              {m.layout && m.layout.default && m.layout.default.rooms && m.layout.default.rooms.length > 0 &&
                <Droppable droppableId="default">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver, true)}
                    {...provided.droppableProps}
                  >
                    {m.layout.default.rooms.map((item, index) => (
                      <Draggable
                        key={`draggable${item.label}${index}`}
                        draggableId={item.uid}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style,
                              true
                            )}
                          >
                            {this.getRoomCard(item, 'default')}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
                </Droppable>
              }
            </DragDropContext>
          </Grid>
          <Grid item xs={12} md={5}>
            {this.state.selectedRoom && this.getRoomInfo()}
          </Grid>
        </Grid>
      );
    } else return (<div />)
  }

  getRoomInfo = () => {
    let room = this.state.selectedRoom;
    return (
      <Card>
        <CardContent>
          <h6>{room.label}</h6>
        </CardContent>
      </Card>
    );
  }

  getRoomCard = (r, key) => {
    const classes = this.props.classes;
    return (
      <div className={classes.flexRowSpread}>
        {r.label}
        <div className={classes.flexRow}>
          <IconButton onClick={() => this.setState({ selectedRoom: r })}>
            <SelectIcon className={classes.iconSmall} />
          </IconButton>
          <Tooltip title={'Delete Room. All ACMs assigned to this room will become orphaned.'}>
            <IconButton
              onClick={e => {
                if (window.confirm(`Are you sure you wish to delete this room (${r.label})?`))
                  this.deleteRoom(r, key);
              }}>
              <DeleteIcon className={classes.iconSmall} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteLayout)
);
