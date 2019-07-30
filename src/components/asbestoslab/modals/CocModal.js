import React from 'react';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import { connect } from 'react-redux';
// import store from '../../store';
import { COC } from '../../../constants/modal-types';
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
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from "@material-ui/core/Switch";
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import { SuggestionField } from '../../../widgets/SuggestionField';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import Add from '@material-ui/icons/Add';
import Sync from '@material-ui/icons/Sync';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError, resetModal, } from '../../../actions/modal';
import { fetchStaff, syncJobWithWFM, resetWfmJob, addLog, } from '../../../actions/local';
import { fetchSamples, handleCocSubmit, handleSampleChange } from '../../../actions/asbestosLab';
import _ from 'lodash';

const mapStateToProps = state => {
  return {
    genericLocationSuggestions: state.const.genericLocationSuggestions,
    specificLocationSuggestions: state.const.specificLocationSuggestions,
    descriptionSuggestions: state.const.asbestosDescriptionSuggestions,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
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
    genericLocationSuggestions: [],
    specificLocationSuggestions: [],
    descriptionSuggestions: [],
    materialSuggestions: [],
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
    if (this.props.doc.uid !== undefined) {
      let log = {
        type: 'Edit',
        log: `Sampling personnel details changed.`,
        chainOfCustody: this.props.doc.uid,
      };
      addLog("asbestosLab", log, this.props.me);
    }
    this.props.handleSelectChange({ id: type, value: event.target.value, })
  }

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
    if (this.props.doc.uid !== undefined) {
      let log = {
        type: 'Edit',
        log: 'Sampling dates changed.',
        chainOfCustody: this.props.doc.uid,
      };
      addLog("asbestosLab", log, this.props.me);
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
      let isNewCoc = this.props.doc.uid === undefined;
      this.props.syncJobWithWFM(jobNumber, isNewCoc);
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
    const { modalProps, doc, wfmJob, classes, me } = this.props;
    const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));

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
              {SuggestionField(this, false, 'Generic Location', 'genericLocationSuggestions', this.state.sampleEditModal.genericLocation,
                (value) => {
                    this.setState({
                      sampleEditModal: {
                        ...this.state.sampleEditModal,
                        genericLocation: value,
                      },
                      sampleEditModified: true,
                    });
                  }
              )}
            </Grid>
            <Grid item xs={12}>
              {SuggestionField(this, false, 'Specific Location', 'specificLocationSuggestions', this.state.sampleEditModal.specificLocation,
                (value) => {
                    this.setState({
                      sampleEditModal: {
                        ...this.state.sampleEditModal,
                        specificLocation: value,
                      },
                      sampleEditModified: true,
                    });
                  }
              )}
            </Grid>
            <Grid item xs={12}>
              {SuggestionField(this, false, 'Description/Item', 'descriptionSuggestions', this.state.sampleEditModal.description,
                (value) => {
                    this.setState({
                      sampleEditModal: {
                        ...this.state.sampleEditModal,
                        description: value,
                      },
                      sampleEditModified: true,
                    });
                  }
              )}
            </Grid>
            <Grid item xs={12}>
              {SuggestionField(this, false, 'Material', 'materialSuggestions', this.state.sampleEditModal.material,
                (value) => {
                    this.setState({
                      sampleEditModal: {
                        ...this.state.sampleEditModal,
                        material: value,
                      },
                      sampleEditModified: true,
                    });
                  }
              )}
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
                className={classes.formInputNumber}
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
                  log = {
                    type: 'Delete',
                    log: `Sample ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) deleted.`,
                    chainOfCustody: this.state.sampleEditModal.cocUid,
                    sample: this.state.sampleEditModal.uid,
                  };
                  addLog("asbestosLab", log, me);

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
                    log = {
                      type: 'ID Change',
                      log: `Sample ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) moved to sample number ${this.state.sampleEditModal.jobNumber}-${this.state.sampleSwap}.`,
                      chainOfCustody: this.state.sampleEditModal.cocUid,
                      sample: this.state.sampleEditModal.uid,
                    };
                    addLog("asbestosLab", log, me);

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
                    log = {
                      type: 'ID Change',
                      log: `Samples ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) and ${this.state.sampleEditModal.jobNumber}-${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap].description} ${doc.samples[this.state.sampleSwap].material}) swapped numbers.`,
                      chainOfCustody: this.state.sampleEditModal.cocUid,
                      sample: this.state.sampleEditModal.uid,
                    };
                    addLog("asbestosLab", log, me);
                    log = {
                      type: 'ID Change',
                      log: `Samples ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) and ${this.state.sampleEditModal.jobNumber}-${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap].description} ${doc.samples[this.state.sampleSwap].material}) swapped numbers.`,
                      chainOfCustody: this.state.sampleEditModal.cocUid,
                      sample: doc.samples[this.state.sampleSwap].uid,
                    };
                    addLog("asbestosLab", log, me);

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
                  log = {
                    type: 'Edit',
                    log: `Details of sample ${this.state.sampleEditModal.jobNumber}-${this.state.sampleEditModal.sampleNumber} (${this.state.sampleEditModal.description} ${this.state.sampleEditModal.material}) modified.`,
                    sample: this.state.sampleEditModal.uid,
                    chainOfCustody: this.state.sampleEditModal.cocUid,
                  };
                  addLog("asbestosLab", log, me);
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
                           maxHeight: '90vh',
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
                      this.setState({ modified: true, });
                      this.props.handleModalChange({id: 'labInstructions', value: e.target.value});
                    }}
                  />
                  <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', flexDirection: 'row' }}>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={doc.priority === 1 ? true : false}
                          onClick={e => {
                            this.setState({ modified: true, });
                            this.props.handleModalChange({id: 'priority', value: doc.priority === 1 ? 0 : 1});
                          }}
                          value="priority"
                          color="secondary"
                        />
                      }
                      label="Urgent"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={doc.clearance === true ? true : false}
                          onClick={e => {
                            this.setState({ modified: true, });
                            this.props.handleModalChange({id: 'clearance', value: e.target.checked});
                          }}
                          value="clearance"
                          color="secondary"
                        />
                      }
                      label="Clearance"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={doc.waAnalysis === true ? true : false}
                          onClick={e => {
                            this.setState({ modified: true, });
                            this.props.handleModalChange({id: 'waAnalysis', value: e.target.checked});
                          }}
                          value="priority"
                          color="primary"
                        />
                      }
                      label="Western Australian Standard Analysis"
                    />
                  </div>
                  <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={doc.labToContactClient === true ? true : false}
                          onClick={e => {
                            this.setState({ modified: true, });
                            this.props.handleModalChange({id: 'labToContactClient', value: e.target.checked});
                          }}
                          value="labToContactClient"
                          color="primary"
                        />
                      }
                      label="Lab to Contact Client"
                    />
                    <TextField
                      id="labContactName"
                      label="Contact Name"
                      defaultValue={doc && doc.labContactName ? doc.labContactName : doc.contactName}
                      onChange={e => {
                        this.setState({ modified: true, });
                        this.props.handleModalChange({id: 'labContactName', value: e.target.value});
                      }}
                    />
                    <TextField
                      id="labContactNumber"
                      label="Contact Number/Email"
                      defaultValue={doc && doc.labContactNumber ? doc.labContactNumber : doc.contactEmail}
                      onChange={e => {
                        this.setState({ modified: true, });
                        this.props.handleModalChange({id: 'labContactNumber', value: e.target.value});
                      }}
                    />
                  </div>
                </FormGroup>
              </form>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container direction='column'>
                <Grid item>
                  <Grid container style={{ fontWeight: 450, marginLeft: 12, }}>
                    <Grid item xs={1}>
                    </Grid>
                    <Grid item xs={1}>
                      Generic Location
                    </Grid>
                    <Grid item xs={3}>
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
                      <Grid item xs={1}>
                        e.g. 1st Floor
                      </Grid>
                      <Grid item xs={3}>
                        e.g. South elevation or Kitchen
                      </Grid>
                      <Grid item xs={4}>
                        e.g. Soffit or Blue patterned vinyl flooring
                      </Grid>
                      <Grid item xs={2}>
                        e.g. fibre cement, vinyl with paper backing
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
                            {SuggestionField(this, disabled, null, 'genericLocationSuggestions',
                              doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].genericLocation ? doc.samples[i+1].genericLocation : '',
                              (value) => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'genericLocation', value);
                              }
                            )}
                          </Grid>
                          <Grid item xs={3} style={{ paddingLeft: 12, paddingRight: 12, }}>
                            {SuggestionField(this, disabled, null, 'specificLocationSuggestions',
                              doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].specificLocation ? doc.samples[i+1].specificLocation : '',
                              (value) => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'specificLocation', value);
                              }
                            )}
                          </Grid>
                          <Grid item xs={4} style={{ paddingLeft: 12, paddingRight: 12, }}>
                            {SuggestionField(this, disabled, null, 'descriptionSuggestions',
                              doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].description ? doc.samples[i+1].description : '',
                              (value) => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'description', value);
                              }
                            )}
                          </Grid>
                          <Grid item xs={2} style={{ paddingLeft: 12, }}>
                            {SuggestionField(this, disabled, null, 'materialSuggestions',
                              doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].material ? doc.samples[i+1].material : '',
                              (value) => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, 'reported', false);
                                this.props.handleSampleChange(i, 'material', value);
                              }
                            )}
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
                doc.contactName = wfmJob.contactName ? wfmJob.contactName : null;
                doc.contactEmail = wfmJob.contactEmail ? wfmJob.contactEmail : null;
                doc.dueDate = wfmJob.dueDate ? wfmJob.dueDate : null;
                doc.manager = wfmJob.manager ? wfmJob.manager : null;
                doc.type = wfmJob.type ? wfmJob.type : null;
               }
              let now = new Date();
              if (!doc.dateSubmit) doc.dateSubmit = now;
              doc.lastModified = now;
              doc.versionUpToDate = false;
              doc.mostRecentIssueSent = false;
              doc.stats = { status: 'In Transit'};
              if (Object.keys(doc.samples).length === 0) doc.stats.status = 'No Samples';
              this.props.resetWfmJob();
              console.log(`Doc UID exists it is ${doc.uid}`);
              let log = {
                  type: 'Create',
                  log: `Chain of Custody created.`,
                  chainOfCustody: doc.uid,
                };
              addLog("asbestosLab", log, me);
              doc.deleted = false;
              this.props.handleCocSubmit({
                doc: doc,
                me: me,
              });
            }
          }
        } color="primary" >Submit</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CocModal));
