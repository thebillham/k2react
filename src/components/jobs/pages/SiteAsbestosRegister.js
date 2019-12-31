import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { appSettingsRef } from "../../../config/firebase";

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
import Select from 'react-select';
import SuggestionField from '../../../widgets/SuggestionField';

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
} from "../../../actions/jobs";

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
    fetchAcmTemplates: () => dispatch(getFirestoreCollection({ pathRef: appSettingsRef.doc("templates").collection("acm"), statePath: 'acmTemplates', update: true, })),
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
  console.log(sourceClone);
  console.log(destClone);
  console.log(removed);

  destClone.splice(droppableDestination.index, 0, removed);
  console.log(destClone);

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

const getListStyle = (isDraggingOver, isDefault) => ({
  borderRadius: 4,
  background: isDefault ? isDraggingOver ? "#006D44" : "#338a69" : isDraggingOver ? "#FF2D00" : "#ff5733",
  margin: 4,
  padding: 8,
});

class SiteAsbestosRegister extends React.Component {
  state = {

  }

  UNSAFE_componentWillMount() {
    if (this.props.acmTemplates && this.props.acmTemplates.length === 0) {
      this.props.fetchAcmTemplates();
    }
  }

  onDragEnd = result => {
    const { source, destination } = result;
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'templates') return;
      const items = reorder(
        this.state[source.droppableId],
        source.index,
        destination.index
      );

      this.setState({ [source.droppableId]: items });
    } else {
      const result = move(
        source.droppableId === 'templates' ? this.props.acmTemplates : this.state[source.droppableId] ? this.state[source.droppableId] : [],
        destination.droppableId === 'templates' ? this.props.acmTemplates : this.state[destination.droppableId] ? this.state[destination.droppableId] : [],
        source,
        destination
      );

      console.log(result);

      this.setState({
        ...result,
      })
    }
  }

  render() {
    const { classes, that, site, wfmClients, geocodes, } = this.props;
    const names = [{ name: '3rd Party', uid: '3rd Party', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
    const m = this.props.sites && this.props.sites[site] ? this.props.sites[site] : null;
    console.log(this.state.acmTemplates);

    if (!this.state.acmTemplates && this.props.acmTemplates) this.setState({ acmTemplates: this.props.acmTemplates, })

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
              <Droppable key={'templates'} droppableId={'templates'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                  { this.props.acmTemplates && this.props.acmTemplates.map((item, index) => {
                    console.log(item);
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
              <Droppable key={'register'} droppableId={'register'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                  { this.state.register && this.state.register.map((item, index) => {
                    console.log(this.state.register);
                    console.log(item);
                    return (<Draggable
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
                          {this.getAcmTemplateCard(item)}
                        </div>
                      )}
                  </Draggable>)
                })}
                </div>)}
              </Droppable>
            </Grid>
            <Grid item xs={12} md={4}>
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
        {`${item.description} ${item.material}`}
        <IconButton
          onClick={e => {
            this.props.showModal({ modalType: TEMPLATE_ACM, modalProps: { doc: item, }})
          }}>
          <EditIcon className={classes.iconRegular} />
        </IconButton>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteAsbestosRegister)
);
