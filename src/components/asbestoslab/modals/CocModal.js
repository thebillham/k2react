import React from 'react';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../../config/styles';
import { connect } from 'react-redux';
// import store from '../../store';
import { COC } from '../../../constants/modal-types';
import { auth } from '../../../config/firebase';
import '../../../config/tags.css';
// import { sendSlackMessage } from '../../Slack';

import AsbestosBulkSampleEditListItem from "../components/AsbestosBulkSampleEditListItem";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import Add from '@material-ui/icons/Add';
import Sync from '@material-ui/icons/Sync';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError, resetModal, } from '../../../actions/modal';
import { fetchStaff, syncJobWithWFM, resetWfmJob, } from '../../../actions/local';
import { fetchSamples, handleCocSubmit, handleSampleChange } from '../../../actions/asbestosLab';
import _ from 'lodash';
import deburr from 'lodash/deburr';
import { asbestosSamplesRef } from "../../../config/firebase";

const mapStateToProps = state => {
  return {
    suggestions: state.const.asbestosmaterials,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    wfmJob: state.local.wfmJob,
    me: state.local.me,
    userRefName: state.local.userRefName,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
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
    handleCocSubmit: (doc, docid, userName, userUid) => dispatch(handleCocSubmit(doc, docid, userName, userUid)),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
    setModalError: error => dispatch(setModalError(error)),
    syncJobWithWFM: (jobNumber, createUid) => dispatch(syncJobWithWFM(jobNumber, createUid)),
    resetWfmJob: () => dispatch(resetWfmJob()),
    fetchSamples: (cocUid, jobNumber, modal ) => dispatch(fetchSamples(cocUid, jobNumber, modal )),
    resetModal: () => dispatch(resetModal()),
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
    personnelSetup: [],
    personnelPickup: [],
    suggestions: [],
    syncError: null,
    modified: false,

    sampleEditModal: null,
    sampleEditModified: false,
    sampleDelete: false,
    sampleDoSwap: false,
    sampleSwap: '',

    airFilterModal: null,
    airFilterModified: false,
    airFilterDelete: false,
    airFilterDoSwap: false,
    airFilterSwap: '',

    numberOfSamples: 10,
  };

  componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  handlePersonnelChange = (event, type) => {
    this.setState({
      [type]: event.target.value,
      modified: true,
    });
    if (this.props.doc.cocLog) {
      let log = {
        type: 'Edit',
        log: `Sampling personnel details changed.`,
        date: new Date(),
        userName: this.props.me.name,
        user: auth.currentUser.uid,
      };
      this.props.doc.cocLog.push(log);
    }
    this.props.handleSelectChange({ id: type, value: event.target.value, })
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
    if (this.props.doc.cocLog) {
      let log = {
        type: 'Edit',
        log: 'Sampling dates changed.',
        date: new Date(),
        userName: this.props.me.name,
        user: auth.currentUser.uid,
      };
      this.props.doc.cocLog.push(log);
    }
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
      this.props.syncJobWithWFM(jobNumber, true);
      let uid = this.props.doc.uid;
      // console.log('wfmsync fetch samples');
      this.props.fetchSamples(uid, jobNumber, true);
    }
  }

  sendNewAttrSlack = () => {
    // let message = {
    //   text: `${this.props.modalProps.staffName} has added a new Chain of Custody.\n${this.props.qualificationtypes[this.props.doc.type].name}`,
    // };
    // sendSlackMessage(message, true);
  }

  render() {
    const { modalProps, doc, wfmJob, classes } = this.props;
    const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: _.debounce(this.handleSuggestionsFetchRequested, 100),
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion,
    };

    // console.log(doc.samples);
    // console.log(this.state.sampleEditModal);
    // console.log(this.props.samples);

    const sampleEditModal = (
      <Dialog
        maxWidth="sm"
        fullWidth={true}
        open={this.state.sampleEditModal !== null}
        onClose={() => this.setState({ sampleEditModal: null })}
      >
        <DialogTitle>
          {this.state.sampleEditModal && (`Edit Sample ${this.state.sampleEditModal.jobNumber}: ${this.state.sampleEditModal.sampleNumber}`)}
        </DialogTitle>
        <DialogContent>
        {this.state.sampleEditModal && (
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                label={'Generic Location'}
                style={{ width: '100%' }}
                value={this.state.sampleEditModal.genericLocation}
                onChange={e => {
                  this.setState({
                    sampleEditModal: {
                      ...this.state.sampleEditModal,
                      genericLocation: e.target.value,
                    },
                    sampleEditModified: true,
                  });
                }}
              />
            </Grid>
              <Grid item xs={12}>
                <TextField
                  label={'Detailed Location'}
                  style={{ width: '100%' }}
                  value={this.state.sampleEditModal.specificLocation}
                  onChange={e => {
                    this.setState({
                      sampleEditModal: {
                        ...this.state.sampleEditModal,
                        specificLocation: e.target.value,
                      },
                      sampleEditModified: true,
                    });
                  }}
                />
              </Grid>
            <Grid item xs={12}>
              <TextField
                label={'Description'}
                style={{ width: '100%' }}
                value={this.state.sampleEditModal.description}
                onChange={e => {
                  this.setState({
                    sampleEditModal: {
                      ...this.state.sampleEditModal,
                      description: e.target.value,
                    },
                    sampleEditModified: true,
                  });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Autosuggest
                {...autosuggestProps}
                onSuggestionSelected = {(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
                  this.setState({
                    sampleEditModal: {
                      ...this.state.sampleEditModal,
                      material: suggestionValue,
                    },
                    sampleEditModified: true,
                  });
                }}
                inputProps={{
                  label: 'Material',
                  value: this.state.sampleEditModal.material,
                  onChange: e => {
                    this.setState({
                      sampleEditModal: {
                        ...this.state.sampleEditModal,
                        material: e.target.value,
                      },
                      sampleEditModified: true,
                    });
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
            <Grid item xs={12}>
              <Checkbox
                checked={this.state.sampleDoSwap}
                onChange={(event) => { this.setState({
                  sampleDoSwap: event.target.checked,
                  sampleDelete: false,
                })}}
                value='sampleSwap'
                color='secondary'
              />
              Move this sample to number
              <Input
                style={{ width: 45, marginLeft: 12, marginRight: 12, }}
                type='number'
                value={this.state.sampleSwap}
                onChange={(event) => this.setState({
                  sampleSwap: event.target.value
                })}
                inputProps={{
                  min: 1,
                }}
              />
              <Grid item xs={12}>
                <Checkbox
                  checked={this.state.sampleDelete}
                  onChange={(event) => { this.setState({
                    sampleDelete: event.target.checked,
                    sampleDoSwap: false,
                  })}}
                  value='sampleDelete'
                  color='secondary'
                />
                Delete this sample
              </Grid>
            </Grid>
          </Grid>
        )}
        </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              this.setState({
                sampleEditModal: null,
              })
            }} color="secondary">Cancel</Button>
            <Button disabled={!this.state.sampleEditModified && !this.state.sampleDoSwap && !this.state.sampleDelete} onClick={() => {
              // Todo: Implement swapping sample numbers
                let log = {};
                if (this.state.sampleDelete && window.confirm("Are you sure you wish to delete this sample?")) {
                  // Delete sample
                  if (doc.cocLog) {
                    log = {
                      type: 'Delete',
                      log: `Sample ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) deleted.`,
                      date: new Date(),
                      userName: this.props.me.name,
                      user: auth.currentUser.uid,
                      sample: this.state.sampleEditModal.uid,
                    };
                    doc.cocLog.push(log);
                  }

                  // Set sample DELETED flag to true
                  let newSamples = {...doc.samples,
                    [this.state.sampleEditModal.sampleNumber]: {
                      ...this.state.sampleEditModal,
                      deleted: true,
                    }
                  };
                  // delete newSamples[this.state.sampleEditModal.sampleNumber];
                  this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });

                  // asbestosSamplesRef.doc(this.state.sampleEditModal.uid).update({'deleted': true});

                  // Reset Modal Vars
                  this.setState({
                    modified: true,
                    sampleEditModified: false,
                    sampleDelete: false,
                    sampleDoSwap: false,
                    sampleSwap: '',
                    sampleEditModal: null,
                  });
                  // console.log(doc.samples);
                } else if (this.state.sampleDoSwap) {
                  if (this.state.sampleSwap === '') {
                    window.alert('You have not selected a sample number to move to.');
                  } else if (this.state.sampleSwap < 1) {
                    window.alert('Sample numbers must be a positive integer.')
                  } else if (doc.samples[this.state.sampleSwap] === undefined && window.confirm(`Are you sure you wish to move this sample to number ${this.state.sampleSwap}`)) {
                    // Move to sample number
                    if (doc.cocLog) {
                      log = {
                        type: 'ID Change',
                        log: `Sample ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) moved to sample number ${this.state.sampleEditModal.jobNumber}-${this.state.sampleSwap}.`,
                        date: new Date(),
                        userName: this.props.me.name,
                        user: auth.currentUser.uid,
                        sample: this.state.sampleEditModal.uid,
                      };
                      doc.cocLog.push(log);
                    }

                    let newSamples = {...doc.samples,
                      [this.state.sampleSwap]: {
                        ...this.state.sampleEditModal,
                        sampleNumber: this.state.sampleSwap,
                        reported: false,
                      }
                    };

                    delete newSamples[this.state.sampleEditModal.sampleNumber];
                    this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });

                    // Reset modal vars
                    this.setState({
                      modified: true,
                      sampleEditModified: false,
                      sampleDelete: false,
                      sampleDoSwap: false,
                      sampleSwap: '',
                      sampleEditModal: null,
                    });
                  } else if (doc.samples[this.state.sampleSwap] !== undefined && window.confirm(`There is already a sample using that sample number. Do you wish to swap sample ${this.state.sampleEditModal.sampleNumber} with sample ${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap]['description']} ${doc.samples[this.state.sampleSwap]['material']})?`)) {
                    // Swap sample number
                    if (doc.cocLog) {
                      log = {
                        type: 'ID Change',
                        log: `Samples ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) and ${this.state.sampleEditModal.jobNumber}-${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap].description} ${doc.samples[this.state.sampleSwap].material}) swapped numbers.`,
                        date: new Date(),
                        userName: this.props.me.name,
                        user: auth.currentUser.uid,
                        sample: this.state.sampleEditModal.uid,
                      };
                      doc.cocLog.push(log);
                      log = {
                        type: 'ID Change',
                        log: `Samples ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) and ${this.state.sampleEditModal.jobNumber}-${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap].description} ${doc.samples[this.state.sampleSwap].material}) swapped numbers.`,
                        date: new Date(),
                        userName: this.props.me.name,
                        user: auth.currentUser.uid,
                        sample: doc.samples[this.state.sampleSwap].uid,
                      };
                      doc.cocLog.push(log);
                    }

                    let newSamples = {...doc.samples,
                      [this.state.sampleSwap]: {
                        ...this.state.sampleEditModal,
                        sampleNumber: this.state.sampleSwap,
                        reported: false,
                      },
                      [this.state.sampleEditModal.sampleNumber]: {
                        ...doc.samples[this.state.sampleSwap],
                        sampleNumber: this.state.sampleEditModal.sampleNumber,
                        reported: false,
                      },
                    };

                    this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });

                    // Reset modal vars
                    this.setState({
                      modified: true,
                      sampleEditModified: false,
                      sampleDelete: false,
                      sampleDoSwap: false,
                      sampleSwap: '',
                      sampleEditModal: null,
                    });
                    // console.log(doc.samples);
                } else if (doc.samples[this.state.sampleSwap] !== undefined && doc.samples[this.state.sampleSwap]['cocUid'] !== doc.uid) {
                  window.alert("You cannot move this sample to that sample number as it is being used by a sample in a different Chain of Custody.");
                }
              } else {
                  // console.log('Else');
                  if (doc.cocLog) {
                    log = {
                      type: 'Edit',
                      log: `Details of sample ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) modified.`,
                      date: new Date(),
                      userName: this.props.me.name,
                      user: auth.currentUser.uid,
                    };
                    doc.cocLog.push(log);
                  }
                  let i = parseInt(this.state.sampleEditModal.sampleNumber) - 1;
                  this.props.handleSampleChange(i, 'reported', false);
                  this.props.handleSampleChange(i, 'genericLocation', this.state.sampleEditModal.genericLocation);
                  this.props.handleSampleChange(i, 'specificLocation', this.state.sampleEditModal.specificLocation);
                  this.props.handleSampleChange(i, 'description', this.state.sampleEditModal.description);
                  this.props.handleSampleChange(i, 'material', this.state.sampleEditModal.material);

                  // Reset modal vars
                  this.setState({
                    modified: true,
                    sampleEditModified: false,
                    sampleDelete: false,
                    sampleDoSwap: false,
                    sampleSwap: '',
                    sampleEditModal: null,
                  });
                }
              }
          } color="primary" >Submit</Button>
          </DialogActions>
      </Dialog>
    );

    if (!doc.dates) doc.dates = [];
    let dates = doc.dates.map(date => {
      return (date instanceof Date) ? date : date.toDate();
    });

    let sampleNumbers = [this.state.numberOfSamples];
    if (doc && doc.samples) sampleNumbers = sampleNumbers.concat(Object.keys(doc.samples).map(key => parseInt(key)));
    let numberOfSamples = Math.max(...sampleNumbers);

    return(
      <Dialog
        open={ this.props.modalType === COC }
        onClose = {() => this.props.hideModal}
        fullScreen = { true }
        maxWidth = "lg"
        fullWidth = { true }
        onExit = {() => this.setState({ numberOfSamples: 10, })}
        >
        <DialogTitle>{ modalProps.title ? modalProps.title : 'Add New Chain of Custody' }</DialogTitle>
        <DialogContent>
          {this.state.sampleEditModal && sampleEditModal}
          <Grid container spacing={1}>
            <Grid item xs={12} lg={4}>
              {/*<FormControl component="fieldset">
                <FormLabel component="legend">Analysis Method</FormLabel>
                <RadioGroup
                  row
                  aria-label="analysisMethod"
                  name="analysisMethod"
                  defaultValue={doc && doc.analysisMethod ? doc.analysisMethod : 'ID'}
                  onChange={e => {
                    this.setState({ modified: true, });
                    this.props.handleModalChange({id: 'analysisMethod', value: e.target.value})}
                  }
                >
                  <FormControlLabel value="ID" control={<Radio />} label="Asbestos ID (Australian Standard)" />
                  <FormControlLabel value="WA" control={<Radio />} label="Soil Concentration (Western Australian Guidelines)" />
                </RadioGroup>
              </FormControl>*/}
              <div style={{ display: 'flex', flexDirection: 'row', }}>
                <FormControl style={{ width: '100%', marginRight: 8, }}>
                  <InputLabel shrink>Job Number</InputLabel>
                  <Input
                    id="jobNumber"
                    defaultValue={doc && doc.jobNumber}
                    onChange={e => {
                      this.setState({ modified: true, });
                      this.props.handleModalChange({id: 'jobNumber', value: e.target.value.replace(/\s/g,'')})}
                    }
                    // startAdornment={<InputAdornment position="start">AS</InputAdornment>}
                  />
                </FormControl>
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
                      <div>{doc.type !== 'bulk' && <div>
                        <b>{ doc.type}</b><br />
                        { doc.client }<br />
                        { doc.address }<br />
                      </div>}</div>
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
                     onChange={e => this.handlePersonnelChange(e, 'personnel')}
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

                  <TextField
                    id="labInstructions"
                    label="Lab Instructions"
                    style={{ width: '100%' }}
                    defaultValue={doc && doc.labInstructions}
                    rows={5}
                    helperText="Include any information that may be useful for the lab. E.g. for a soil sample you might include information on what contamination you are expecting."
                    multiline
                    onChange={e => {
                      this.props.handleModalChange({id: 'labInstructions', value: e.target.value})}
                    }
                  />
                </FormGroup>
              </form>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container direction='column'>
                <Grid item>
                  <Grid container style={{ fontWeight: 450, marginLeft: 12, }}>
                    <Grid item xs={1}>
                    </Grid>
                    <Grid item xs={2}>
                      Generic Location
                    </Grid>
                    <Grid item xs={2}>
                      Specific Location
                    </Grid>
                    <Grid item xs={4}>
                      Description
                    </Grid>
                    <Grid item xs={2}>
                      Material Type
                    </Grid>
                  </Grid>
                    <Grid container style={{ fontWeight: 100, fontSize: 10, marginLeft: 12, }}>
                      <Grid item xs={1}>
                      </Grid>
                      <Grid item xs={2}>
                        e.g. External or 1st Floor
                      </Grid>
                      <Grid item xs={2}>
                        e.g. South elevation or Kitchen
                      </Grid>
                      <Grid item xs={4}>
                        e.g. Cement sheet soffit or Blue patterned vinyl flooring
                      </Grid>
                      <Grid item xs={2}>
                        e.g. Cement products
                      </Grid>
                    </Grid>
                  {Array.from(Array(numberOfSamples),(x, i) => i).map(i => {
                    let disabled = doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].cocUid && doc.samples[i+1].cocUid !== doc.uid;
                    return(doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].uid && !disabled && doc.samples[i+1].deleted === false ?
                      <div style={{ marginLeft: 12, marginRight: 12, }} key={doc.samples[i+1].uid}>
                        <Grid container key={i}>
                          <Grid item xs={12}>
                            <AsbestosBulkSampleEditListItem sample={doc.samples[i+1]} onClick={() => {this.setState({ sampleEditModal: doc.samples[i+1] })}} />
                          </Grid>
                        </Grid>
                      </div>
                        :
                        <Grid container key={i}>
                          <Grid item xs={1}>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 3,}}>
                              {i+1}
                            </div>
                          </Grid>
                          <Grid item xs={1} style={{ paddingLeft: 12, paddingRight: 12, }}>
                            <TextField
                              id={`roomgroup${i+1}`}
                              disabled={disabled}
                              style={{ width: '100%' }}
                              value={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].genericLocation ? doc.samples[i+1].genericLocation : ''}
                              onChange={e => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'genericLocation', e.target.value);
                              }}
                            />
                          </Grid>
                          <Grid item xs={3} style={{ paddingLeft: 12, paddingRight: 12, }}>
                            <TextField
                              id={`room${i+1}`}
                              disabled={disabled}
                              style={{ width: '100%' }}
                              value={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].specificLocation ? doc.samples[i+1].specificLocation : ''}
                              onChange={e => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'specificLocation', e.target.value);
                              }}
                            />
                          </Grid>
                          <Grid item xs={4} style={{ paddingLeft: 12, paddingRight: 12, }}>
                            <TextField
                              id={`description${i+1}`}
                              disabled={disabled}
                              style={{ width: '100%' }}
                              value={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].description ? doc.samples[i+1].description : ''}
                              onChange={e => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'description', e.target.value);
                              }}
                            />
                          </Grid>
                          <Grid item xs={2} style={{ paddingLeft: 12, }}>
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
                    </Grid>
                        )
                  })
                }
            <Grid container>
              <Grid item xs={12}>
                <Button
                  style={{ marginTop: 24, marginLeft: 128, }}
                  onClick={ () => { this.setState({ numberOfSamples: numberOfSamples + 10}) }}>
                  <Add style={{ marginRight: 12, }}/> Add More Samples
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
          </Grid>
        </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            this.props.resetWfmJob();
            this.props.resetModal()
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
              this.props.resetWfmJob();
              console.log(`Doc UID exists it is ${doc.uid}`);
              if (!doc.cocLog) {
                doc.cocLog = [{
                  type: 'Create',
                  log: `Chain of Custody created.`,
                  date: new Date(),
                  userName: this.props.me.name,
                  user: auth.currentUser.uid,
                }];
              }
              doc.deleted = false;
              this.props.handleCocSubmit({
                doc: doc,
                docid: doc.uid,
                userName: this.props.me.name,
                userUid: auth.currentUser.uid,
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
