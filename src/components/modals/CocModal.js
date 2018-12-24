import React from 'react';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
// import store from '../../store';
import { COC } from '../../constants/modal-types';
import { cocsRef, storage, auth } from '../../config/firebase';
import '../../config/tags.css';
import { sendSlackMessage } from '../../Slack';
import ReactAutocomplete from 'react-autocomplete';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Slider from '@material-ui/lab/Slider';
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import UploadIcon from '@material-ui/icons/CloudUpload';
import Add from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';
import Sync from '@material-ui/icons/Sync';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError, handleSampleChange, handleCocSubmit } from '../../actions/modal';
import { fetchStaff, syncJobWithWFM, resetWfmJob, fetchSamples } from '../../actions/local';
import _ from 'lodash';
import deburr from 'lodash/deburr';
import { injectIntl, IntlProvider,  } from 'react-intl';

const mapStateToProps = state => {
  return {
    suggestions: state.const.asbestosmaterials,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    wfmJob: state.local.wfmJob,
    samples: state.local.samples,
    me: state.local.me,
    userRefName: state.local.userRefName,
    staff: state.local.staff,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    fetchStaff: () => dispatch(fetchStaff()),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: _.debounce(target => dispatch(handleModalChange(target)), 50),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) => dispatch(handleModalSubmit(doc, pathRef)),
    handleCocSubmit: (doc, docid) => dispatch(handleCocSubmit(doc, docid)),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
    setModalError: error => dispatch(setModalError(error)),
    syncJobWithWFM: jobNumber => dispatch(syncJobWithWFM(jobNumber)),
    resetWfmJob: () => dispatch(resetWfmJob()),
    fetchSamples: (cocUid, jobNumber) => dispatch(fetchSamples(cocUid, jobNumber)),
  };
};

function getStyles(name, that) {
  return {
    fontWeight:
      that.state.personnel.indexOf(name) === -1
        ? 200
        : 600
  };
}


class CocModal extends React.Component {
  state = {
    personnel: [],
    suggestions: [],
    syncError: null,
    modified: false,
  };

  componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  handlePersonnelChange = event => {
    this.setState({
      personnel: event.target.value,
      modified: true,
    });
    this.props.handleSelectChange({ id: 'personnel', value: event.target.value, })
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this),
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleDateChange = (day, { selected }) => {
    const { dates } = this.props.doc;
    if (selected) {
      const selectedIndex = dates.findIndex(selectedDay =>
        DateUtils.isSameDay(selectedDay, day)
      );
      dates.splice(selectedIndex, 1);
    } else {
      dates.push(day);
    }
    this.setState({ modified: true, });
    this.props.handleSelectChange({ id: 'dates', value: dates, })
  }

  wfmSync = () => {
    let jobNumber = this.props.doc.jobNumber;
    if (!jobNumber) {
      this.props.setModalError('Enter the job number to sync with WorkflowMax');
    } else if (jobNumber.substring(0,2).toUpperCase() !== 'AS') {
      this.props.setModalError('Asbestos job numbers must begin with "AS"');
    } else {
      this.props.setModalError(null);
      jobNumber = jobNumber;
      this.props.syncJobWithWFM(jobNumber);
      let uid = this.props.doc.uid;
      if (!uid) {
        let datestring = new Intl.DateTimeFormat('en-GB', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()).replace(/[.:/,\s]/g, '_');
        uid = `${jobNumber.toUpperCase()}_${datestring}`;
        this.props.handleModalChange({id: 'uid', value: uid});
      }
      this.props.fetchSamples(uid, jobNumber);
    }
  }

  sendNewAttrSlack = () => {
    // let message = {
    //   text: `${this.props.modalProps.staffName} has added a new Chain of Custody.\n${this.props.qualificationtypes[this.props.doc.type].name}`,
    // };
    // sendSlackMessage(message, true);
  }

  render() {
    const { modalProps, doc, wfmJob, classes, staff, } = this.props;
    const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name)));
    let today = new Date();
    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: _.debounce(this.handleSuggestionsFetchRequested, 100),
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion,
    };
    if (!doc.dates) doc.dates = [];
    let dates = doc.dates.map(date => {
      return (date instanceof Date) ? date : date.toDate();
    });
    return(
      <Dialog
        open={ this.props.modalType === COC }
        onClose = {() => this.props.hideModal}
        fullScreen = { true }
        maxWidth = "lg"
        fullWidth = { true }
        >
        <DialogTitle>{ modalProps.title ? modalProps.title : 'Add New Chain of Custody' }</DialogTitle>
        <DialogContent>
          <Grid container spacing={40}>
            <Grid item xs={12} lg={4}>
              <div style={{ display: 'flex', flexDirection: 'row', }}>
                <TextField
                  id="jobNumber"
                  label="Job Number"
                  style={{ width: '100%' }}
                  defaultValue={doc && doc.jobNumber}
                  onChange={e => {
                    this.setState({ modified: true, });
                    this.props.handleModalChange({id: 'jobNumber', value: e.target.value.replace(/\s/g,'')})}
                  }
                />
                <IconButton onClick={ this.wfmSync }>
                  <Sync style={{ width: 28, height: 28, }}/>
                </IconButton>
              </div>
              <div style={{ color: '#a0a0a0', fontWeight: 100, fontSize: 14, }}>
                { modalProps.error }
              </div>
              { wfmJob &&
                (
                  <div style={{ color: '#666', fontWeight: 200, fontSize: 16, marginTop: 12, marginBottom: 12, }}>
                    { wfmJob.client ?
                      <div>
                        <b>{ wfmJob.type}</b><br />
                        { wfmJob.client }<br />
                        { wfmJob.address }<br />
                      </div>
                      :
                      <div>
                        <b>{ doc.type}</b><br />
                        { doc.client }<br />
                        { doc.address }<br />
                      </div>
                    }
                  </div>
                )
              }
              <form>
                <FormGroup>
                  <FormControl className={classes.textField}>
                    <InputLabel>Sampled By</InputLabel>
                    <Select
                     multiple
                     value={doc.personnel}
                     onChange={this.handlePersonnelChange}
                     input={<Input id="personnel" />}
                     renderValue={selected => (
                       <div style={{ display: 'flex', flexWrap: 'wrap', }}>
                         {selected.map(value => (
                           <Chip key={value} label={value} style={{ margin: 5}} />
                         ))}
                       </div>)
                     }
                     MenuProps={{
                       PaperProps: {
                         style: {
                           maxHeight: 48 * 4.5 + 8,
                           width: 250,
                         },
                       },
                     }}
                    >
                     {names.map(name => (
                       <MenuItem key={name.name} value={name.name} style={getStyles(name.name, this)}>
                         {name.name}
                       </MenuItem>
                     ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel shrink>Sample Date(s)</InputLabel><br /><br />
                    <DayPicker
                      selectedDays={dates}
                      onDayClick={this.handleDateChange}
                    />
                  </FormControl>
                </FormGroup>
              </form>
            </Grid>
            <Grid item xs={12} md={8}>
            { doc.type === 'air' ?
              <Grid container direction='column'>
                <Grid item>
                  <Grid container style={{ fontWeight: 450, marginLeft: 12, }}>
                    <Grid item xs={1}>
                    </Grid>
                    <Grid item xs={2}>
                      Location
                    </Grid>
                    <Grid item xs={2}>
                      Pump Time (Start)
                    </Grid>
                    <Grid item xs={2}>
                      Pump Time (Finish)
                    </Grid>
                    <Grid item xs={1}>
                      Total Run Time
                    </Grid>
                    <Grid item xs={2}>
                      Flow Rate (Start)
                    </Grid>
                    <Grid item xs={2}>
                      Flow Rate (Finish)
                    </Grid>
                  </Grid>
                  { Array.from(Array(doc.numberOfSamples ? doc.numberOfSamples : 10),(x, i) => i).map(i => {
                    let disabled = doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].cocUid !== doc.uid;
                    return(<Grid container key={i}>
                    <Grid item xs={1}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 3,}}>
                        {i+1}
                      </div>
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id={`location${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].isAirSample ? doc.samples[i+1].description : 'Bulk Sample'}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'description', e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id={`pumpstarttime${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].pumpstarttime}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'pumpstarttime', e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id={`pumpfinishtime${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].pumpfinishtime}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'pumpfinishtime', e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <TextField
                        id={`pumptotaltime${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].pumptotaltime}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'pumptotaltime', e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id={`flowratestart${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].flowratestart}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'flowratestart', e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id={`flowratefinish${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].flowratefinish}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'flowratefinish', e.target.value);
                        }}
                      />
                    </Grid>
                  </Grid>)
                  })}
                  <Grid container>
                    <Grid item xs={12} justify='center' alignItems='center'>
                      <Button
                        style={{ marginTop: 24, marginLeft: 128, }}
                        onClick={ () => { this.props.handleModalChange({ id: 'numberOfSamples', value: doc.numberOfSamples ? doc.numberOfSamples + 10 : 20 }) }}>
                        <Add style={{ marginRight: 12, }}/> Add More Samples
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            :
              <Grid container direction='column'>
                <Grid item>
                  <Grid container style={{ fontWeight: 450, marginLeft: 12, }}>
                    <Grid item xs={1}>
                    </Grid>
                    <Grid item xs={6}>
                      Location/Item
                    </Grid>
                    <Grid item xs={5}>
                      Material
                    </Grid>
                  </Grid>
                  { Array.from(Array(doc.numberOfSamples ? doc.numberOfSamples : 10),(x, i) => i).map(i => {
                    let disabled = doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].cocUid && doc.samples[i+1].cocUid !== doc.uid;
                    return(<Grid container key={i}>
                    <Grid item xs={1}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 3,}}>
                        {i+1}
                      </div>
                    </Grid>
                    <Grid item xs={6} style={{ paddingLeft: 12, paddingRight: 12, }}>
                      <TextField
                        id={`description${i+1}`}
                        disabled={disabled}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].description}
                        onChange={e => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'description', e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={4} style={{ paddingLeft: 12, }}>
                      <Autosuggest
                        {...autosuggestProps}
                        onSuggestionSelected = {(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
                          this.setState({ modified: true, });
                          this.props.handleSampleChange(i, 'reported', false);
                          this.props.handleSampleChange(i, 'material', suggestionValue); }}
                        inputProps={{
                          disabled: disabled,
                          value: doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].material ? doc.samples[i+1].material : '',
                          onChange: e => {
                            this.setState({ modified: true, });
                            this.props.handleSampleChange(i, 'reported', false);
                            this.props.handleSampleChange(i, 'material', e.target.value)
                          },
                        }}
                        theme={{
                          container: { position: 'relative',},
                          suggestionsContainerOpen: {position: 'absolute', zIndex: 2, marginTop: 8, left: 0, right: 0, },
                          suggestionsList: {margin: 0, padding: 0, listStyleType: 'none', },
                          suggestion: {display: 'block', },
                        }}
                        renderSuggestionsContainer={options => (
                          <Paper {...options.containerProps} square>
                            {options.children}
                          </Paper>
                        )}
                      />
                    </Grid>
                  </Grid>)
                  })}
                  <Grid container>
                    <Grid item xs={12} justify='center' alignItems='center'>
                      <Button
                        style={{ marginTop: 24, marginLeft: 128, }}
                        onClick={ () => { this.props.handleModalChange({ id: 'numberOfSamples', value: doc.numberOfSamples ? doc.numberOfSamples + 10 : 20 }) }}>
                        <Add style={{ marginRight: 12, }}/> Add More Samples
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            }
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            this.props.resetWfmJob();
            this.props.hideModal()
          }} color="secondary">Cancel</Button>
          <Button disabled={!this.state.modified} onClick={() => {
            if (!wfmJob) {
              window.alert('Sync a job with WorkflowMax before submitting.');
              return;
            } else {
               if (wfmJob.client) {
                doc.jobNumber = doc.jobNumber ? doc.jobNumber.toUpperCase() : null;
                doc.client = wfmJob.client ? wfmJob.client : null;
                doc.address = wfmJob.address ? wfmJob.address : null;
                doc.clientOrderNumber = wfmJob.clientOrderNumber ? wfmJob.clientOrderNumber : null;
                doc.contact = wfmJob.contact ? wfmJob.contact : null;
                doc.dueDate = wfmJob.dueDate ? wfmJob.dueDate : null;
                doc.manager = wfmJob.manager ? wfmJob.manager : null;
                doc.type = wfmJob.type ? wfmJob.type : null;
               }
              let now = new Date();
              if (!doc.dateSubmit) doc.dateSubmit = now;
              doc.lastModified = now;
              doc.versionUpToDate = false;
              let datestring = new Intl.DateTimeFormat('en-GB', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).format(now).replace(/[.:/,\s]/g, '_');
              this.props.resetWfmJob();
              console.log(`Doc UID exists it is ${doc.uid}`);
              let log = {};
              if (doc.cocLog) {
                log = {
                  type: 'Edit',
                  log: 'Details modified.',
                  date: new Date(),
                  username: this.props.me.name,
                  user: auth.currentUser.uid,
                };
                doc.cocLog ? doc.cocLog.push(log) : doc.cocLog = [log];
              } else {
                doc.cocLog = [{
                  type: 'Edit',
                  log: `Chain of Custody created.`,
                  date: new Date(),
                  username: this.props.me.name,
                  user: auth.currentUser.uid,
                }];
              }
              doc.deleted = false;
              this.props.handleCocSubmit({
                doc: doc,
                docid: doc.uid,
              });
            }
          }
        } color="primary" >Submit</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          );
        })}
      </div>
    </MenuItem>
  );
}

function getSuggestions(value, that) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : that.props.suggestions.filter(suggestion => {
        const keep =
          count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

const getSuggestionValue = suggestion => suggestion.label;

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(CocModal));
