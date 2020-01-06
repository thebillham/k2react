import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { appSettingsRef, sitesRef, templateAcmRef, } from "../../../config/firebase";

//Modals
import {
  WFM_TIME,
  TEMPLATE_ACM,
} from "../../../constants/modal-types";
import { showModal } from "../../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
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
import AddIcon from "@material-ui/icons/AddCircleOutline";
import EditIcon from "@material-ui/icons/Edit";
import RemoveIcon from "@material-ui/icons/Remove";
import SyncIcon from '@material-ui/icons/Sync';
import LinkIcon from '@material-ui/icons/Link';
import TimerIcon from "@material-ui/icons/Timer";
import SelectIcon from "@material-ui/icons/Info";
import DeleteIcon from "@material-ui/icons/Close";
import Select from 'react-select';
import SuggestionField from '../../../widgets/SuggestionField';
import AcmCard from "../components/AcmCard";
import SearchIcon from "@material-ui/icons/Search";
import ResultIcon from "@material-ui/icons/Lens";
import AirResultIcon from "@material-ui/icons/AcUnit";
import RemovedIcon from "@material-ui/icons/RemoveCircle";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  DatePicker,
} from "@material-ui/pickers";
import _ from "lodash";

import classNames from 'classnames';
import Popup from "reactjs-popup";
import {
  dateOf,
  getDaysSinceDate,
  getDaysSinceDateAgo,
  andList,
  personnelConvert,
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
  loadAcmTemplate,
  getRoomInLayout,
} from "../../../actions/jobs";

import { writeDescription, writeSimpleResult } from "../../../actions/asbestosLab";

import { getFirestoreCollection } from "../../../actions/local";

import {
  filterMap,
  filterMapReset,
} from "../../../actions/display";

const mapStateToProps = state => {
  return {
    acmTemplates: state.local.acmTemplates,
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
    siteAcm: state.jobs.siteAcm,
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
    fetchAcmTemplates: () => dispatch(getFirestoreCollection({ pathRef: appSettingsRef.doc("templates").collection("acm"), statePath: 'acmTemplates', update: true, subscribe: true, })),

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
  result[droppableSource.droppableId] = source.droppableId === 'templates' ? Array.from(source) : sourceClone;
  result[droppableDestination.droppableId] = destination.droppableId === 'templates' ? Array.from(destination) : destClone;

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

const getListStyle = (isDraggingOver, mode) => ({
  borderRadius: 4,
  background: mode === 'blank' ? isDraggingOver ? "#ddd" : "#fff" : isDraggingOver ? "#bbb" : "#ddd",
  margin: 4,
  padding: 8,
});

class SiteAsbestosRegister extends React.Component {
  state = {
    generic: [],
    templateSearch: '',
  }

  UNSAFE_componentWillMount() {
    if (this.props.acmTemplates && this.props.acmTemplates.length === 0) {
      this.props.fetchAcmTemplates();
    }
    this.props.sites[this.props.site] && this.props.sites[this.props.site].layout && Object.values(this.props.sites[this.props.site].layout).forEach(roomGroup => {
      roomGroup && roomGroup.rooms && roomGroup.rooms.forEach(room => {
        // console.log(room);
        this.props.siteAcm[this.props.site] && console.log(Object.values(this.props.siteAcm[this.props.site]).filter(a => a.room && a.room.uid === room.uid));
        if (room.acm) {
          console.log(room.acm);
          this.setState({ [room.uid]: room.acm });
        } else this.setState({ [room.uid]: this.props.siteAcm[this.props.site] ? Object.values(this.props.siteAcm[this.props.site]).filter(a => a.room && a.room.uid === room.uid).map(e => e.uid) : [] });
      })
      this.setState({ generic: this.props.siteAcm[this.props.site] ? Object.values(this.props.siteAcm[this.props.site]).filter(a => a.room && a.room.uid === 'generic').map(e => e.uid) : [] });
    })

    // console.log(this.state);
  }

  componentWillUnmount() {
    let layout = this.props.sites[this.props.site].layout,
      change = false;
    if (layout) Object.keys(layout).forEach(k => {
      if (layout[k].rooms) {
        layout[k].rooms.forEach((r, index) => {
          if (this.state[r.uid] && this.state[r.uid].length > 0) {
            layout[k].rooms[index].acm = this.state[r.uid];
            change = true;
          }
        });
      }
    });
    console.log(layout);
    if (change) sitesRef.doc(this.props.site).update({ layout });
  }

  onDragEnd = result => {
    const { source, destination } = result;
    // dropped outside the list
    if (!result.destination && source.droppableId === 'templates') {
      return;
    } else if (!result.destination) {
      // Delete ACM
      let acmKey = this.state[source.droppableId][source.index];
      let sourceClone = Array.from(this.state[source.droppableId]);
      sourceClone.splice(source.index, 1);
      console.log(sourceClone);
      this.setState({
        [source.droppableId]: sourceClone,
      });
      sitesRef.doc(this.props.site).collection("acm").doc(acmKey).delete();
    } else {
      if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'templates') return;
        const items = reorder(
          this.state[source.droppableId],
          source.index,
          destination.index
        );

        this.setState({ [source.droppableId]: items });
      } else {
        if (source.droppableId === 'templates') {
          // Create ACM item
          let acm = this.getAcmTemplates()[source.index];
          let room = getRoomInLayout({ site: this.props.sites[this.props.site], searchRoom: destination.droppableId });
          let uid = `${acm.description}_${acm.material}_${moment().format('x')}_${parseInt(Math.floor(Math.random() * Math.floor(10000)))}`;
          acm.uid = uid;
          acm.idKey = 'p'; // Presume by default
          acm.room = { label: room.label, uid: room.uid };
          console.log(acm);
          sitesRef.doc(this.props.site).collection("acm").doc(uid).set(acm);
          this.setState({
            [destination.droppableId]: [
              ...this.state[destination.droppableId],
              uid,
            ]
          });
        } else if (destination.droppableId === 'templates') {
          // Delete ACM
          let acmKey = this.state[source.droppableId][source.index];
          let sourceClone = Array.from(this.state[source.droppableId]);
          sourceClone.splice(source.index, 1);
          console.log(sourceClone);
          this.setState({
            [source.droppableId]: sourceClone,
          });
          sitesRef.doc(this.props.site).collection("acm").doc(acmKey).delete();
        } else {
          const result = move(
            source.droppableId === this.state[source.droppableId] ? this.state[source.droppableId] : [],
            destination.droppableId === this.state[destination.droppableId] ? this.state[destination.droppableId] : [],
            source,
            destination
          );

          let acmKey = this.state[source.droppableId][source.index];
          let room = getRoomInLayout({ site: this.props.sites[this.props.site], searchRoom: destination.droppableId });
          console.log(room);
          sitesRef.doc(this.props.site).collection("acm").doc(acmKey).update({ room: { label: room.label, uid: room.uid } });

          this.setState({
            ...result,
          })
        }
      }
    }
  }

  getAcmTemplates = () => {
    return this.props.acmTemplates ? this.props.acmTemplates
      .filter(e => {
        let res = true;
        if (this.state.templateSearch && !`${e.templateName}${e.description}${e.material}`.toLowerCase().includes(this.state.templateSearch.toLowerCase())) res = false;
        return res;
      }).concat({
        uid: 'air',
        templateName: 'Air Sample',
        sampleType: 'air',
        description: 'Air Sample',
      }) : [{
        uid: 'air',
        templateName: 'Air Sample',
        sampleType: 'air',
        description: 'Air Sample',
      }];
  }

  render() {
    const { classes, that, site, wfmClients, geocodes, } = this.props;
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
    const m = this.props.sites && this.props.sites[site] ? this.props.sites[site] : null;
    const acmTemplates = this.getAcmTemplates();
    console.log(this.state);
    console.log(this.props.siteAcm[this.props.site]);
    if (m) {
      const color = classes[getJobColor(m.primaryJobType)];
      return (
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <div className={classes.flexRowSpread}>
                <div className={classNames(color, classes.expandHeading)}>ACM Templates</div>
                  <Tooltip title={'Add ACM Template'}>
                    <IconButton
                      onClick={e => {
                        this.props.showModal({ modalType: TEMPLATE_ACM, modalProps: { doc: null, }})
                      }}>
                      <AddIcon className={classes.iconRegular} />
                    </IconButton>
                  </Tooltip>
              </div>
              <div className={classes.flexRow}>
                <SearchIcon />
                <div className={classes.spacerSmall} />
                <TextField
                  value={this.state.templateSearch}
                  style={{ width: '100%'}}
                  onChange={e => this.setState({ templateSearch: e.target.value })}
                />
              </div>
              <Droppable key={'templates'} droppableId={'templates'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver, 'blank')}
                    {...provided.droppableProps}
                  >
                  { acmTemplates.map((item, index) => {
                    return (<Draggable
                      key={`${item.uid}template`}
                      draggableId={`${item.uid}template`}
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
                          {this.getAcmTemplateCard(item)}
                        </div>
                      )}
                  </Draggable>)
                })}
                </div>)}
              </Droppable>
            </Grid>
            <Grid item xs={12} md={5}>
              <div className={classNames(color, classes.expandHeading)}>Asbestos Register</div>
              {m.layout && Object.keys(m.layout).map(k =>
                (m.layout[k].rooms && m.layout[k].rooms.length > 0) ?
                  k === 'default' ?
                    m.layout[k].rooms.map(r => this.getDroppableRoom(r))
                  : this.getFoldableRoomGroup({roomGroup: m.layout[k], key: k})
                : null
              )}
              <Droppable key={'generic'} droppableId={'generic'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver, 'green')}
                    {...provided.droppableProps}
                  >
                  <div className={classes.boldWhite}>Generic Items/Materials</div>
                  { this.state.generic.map((key, index) => {
                    let item = this.props.siteAcm[this.props.site][key];
                    return (<Draggable
                      key={`${key}`}
                      draggableId={`${key}`}
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
                          {item && this.getAcmCard(item)}
                        </div>
                      )}
                  </Draggable>)
                })}
                </div>)}
              </Droppable>
            </Grid>
            <Grid item xs={12} md={4}>
              {this.state.selectedAcm && <AcmCard item={this.state.selectedAcm} site={this.props.site} />}
            </Grid>
          </Grid>
        </DragDropContext>
      );
    } else return (<div />)
  }

  getAcmTemplateCard = (item) => {
    const { classes } = this.props;
    return (
      <div className={classes.flexRowSpread}>
        {item.templateName ? item.templateName : `${item.description} ${item.material}`}
        <div className={classes.flexRow}>
          <Tooltip title={'Edit Template. This will not affect items already created from this template.'}>
            <IconButton
              onClick={e => {
                this.props.showModal({ modalType: TEMPLATE_ACM, modalProps: { doc: item, }})
              }}>
              <EditIcon className={classes.iconSmall} />
            </IconButton>
          </Tooltip>

          <Tooltip title={'Delete Template. This will not affect items already created from this template.'}>
            <IconButton
              onClick={e => {
                if (window.confirm(`Are you sure you wish to delete this template (${item.description} ${item.material})?`))
                  templateAcmRef.doc(item.uid).delete();
              }}>
              <DeleteIcon className={classes.iconSmall} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  }

  getAcmCard = item => {
    const { classes } = this.props;
    let idKey = item.idKey || null;
    if (idKey === 'i' && item.sample) {
      let simpleResult = writeSimpleResult(item.sample.result);
      if (simpleResult === 'Not Analysed') idKey = 'i';
      else if (simpleResult === 'NO') idKey = 'negative';
      else idKey = 'positive';
    }
    if (item.acmRemoved) idKey = 'removed';
    console.log(item.sample);
    return (
      <div className={classes.flexRowSpread}>
        <div className={classNames(classes.columnMed, classes.bold)}>
          {item.sampleType === 'air' ? 'Air Sample' : `${writeDescription(item)}`}
        </div>
        <div className={classes.columnLarge}>
          { item.sample && `${item.sample.jobNumber}-${item.sample.sampleNumber}`}
        </div>
        <div className={classes.flexRow}>
          <IconButton>
            {item.sampleType === 'air' ?
              <AirResultIcon className={(item.sample && item.sample.reportConcentration && item.sample.reportConcentration.includes("<")) ? classes.colorsOk : classes.colorsBad} />
            : idKey === 'removed' ?
            <RemovedIcon /> :
            <ResultIcon className={
              idKey === 'p' ? classes.colorsWarning :
              idKey === 's' ? classes.colorsStrongWarning :
              idKey === 'i' ? classes.colorsUnclear :
              idKey === 'negative' ? classes.colorsOk :
              classes.colorsBad} />}
          </IconButton>
          <IconButton onClick={() => this.setState({ selectedAcm: item })}>
            <SelectIcon />
          </IconButton>
        </div>
      </div>
    );
  }

  getDroppableRoom = room => {
    const { classes } = this.props;
    return (
      <Droppable key={room.uid} droppableId={room.uid}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
          <div className={classes.boldWhite}>{room.label}</div>
          { this.state[room.uid] && this.state[room.uid]
            .map((key, index) => {
            let item = this.props.siteAcm[this.props.site][key];
            return (<Draggable
              key={key}
              draggableId={key}
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
                  {item && this.getAcmCard(item)}
                </div>
              )}
          </Draggable>)
        })}
        </div>)}
      </Droppable>
    );
  }

  getFoldableRoomGroup = ({ roomGroup, key }) => {
    return (
      <div className={this.props.classes.informationBoxWhiteRounded}>
        <h6>{roomGroup.label}</h6>
        {roomGroup.rooms.map(r => {
          this.getDroppableRoom(r);
        })}
      </div>
    )
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteAsbestosRegister)
);
