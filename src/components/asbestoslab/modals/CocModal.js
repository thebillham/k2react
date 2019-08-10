import React from 'react';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import { connect } from 'react-redux';
import classNames from 'classnames';
// import store from '../../store';
import { COC, ASBESTOS_SAMPLE_EDIT_COC, } from '../../../constants/modal-types';
import moment from "moment";
// import { sendSlackMessage } from '../../Slack';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
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
import EditIcon from '@material-ui/icons/Edit';
import Select from 'react-select';
import { SuggestionField } from '../../../widgets/SuggestionField';

import {
  DatePicker,
} from "@material-ui/pickers";

import Add from '@material-ui/icons/Add';
import Sync from '@material-ui/icons/Sync';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError, resetModal, showModalSecondary, } from '../../../actions/modal';
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
    handleSampleChange: (number, changes) => dispatch(handleSampleChange(number, changes)),
    setModalError: error => dispatch(setModalError(error)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
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

const initState = {
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

  defaultDate: null,
  defaultPersonnel: [],
  dateSelected: false,
  personnelSelected: false,
};

class CocModal extends React.Component {
  state = initState;

  componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  handlePersonnelChange = (e, type) => {
    this.setState({
      [type]: e.map(e => e.value),
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
    this.props.handleSelectChange({ id: type, value: e.map(e => e.value), })
  }

  wfmSync = () => {
    let jobNumber = this.props.doc.jobNumber;
    if (!jobNumber) {
      this.props.setModalError('Enter the job number to sync with WorkflowMax');
    } else if (jobNumber.substring(0,2).toUpperCase() !== 'AS') {
      this.props.setModalError('Asbestos job numbers must begin with "AS"');
    } else {
      this.props.setModalError(null);
      this.props.handleSelectChange({id: 'modal', value: {isNew: false}});
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
    const { modalProps, modalType, doc, wfmJob, classes, me } = this.props;
    if (modalType === COC) {
      const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));

      if (!doc.dates) doc.dates = [];
      let dates = doc.dates.map(date => {
        return (date instanceof Date) ? date : date.toDate();
      });

      let sampleNumbers = [this.state.numberOfSamples];
      if (doc && doc.samples) sampleNumbers = sampleNumbers.concat(Object.keys(doc.samples).map(key => parseInt(key)));
      let numberOfSamples = Math.max(...sampleNumbers);

      return(
        <Dialog
          open={ modalType === COC }
          onClose = {() => this.props.hideModal()}
          fullScreen = { true }
          maxWidth = "lg"
          fullWidth = { true }
        >
          <DialogTitle>{ modalProps.title ? modalProps.title : 'Add New Chain of Custody' }</DialogTitle>
          <DialogContent>
            <Grid container spacing={1}>
              <Grid item xs={12} lg={2}>
                {(modalProps.isNew || modalProps.error) &&
                  <div>
                    <div className={classes.flexRow}>
                      <FormControl style={{ width: '100%', marginRight: 8, }}>
                        <InputLabel shrink>Job Number</InputLabel>
                        <Input
                          id="jobNumber"
                          defaultValue={doc && doc.jobNumber}
                          onChange={e => {
                            this.setState({ modified: true, });
                            this.props.handleModalChange({id: 'jobNumber', value: e.target.value.replace(/\s/g,'').toUpperCase()})}
                          }
                          // startAdornment={<InputAdornment position="start">AS</InputAdornment>}
                        />
                      </FormControl>
                      <IconButton onClick={ this.wfmSync }>
                        <Sync className={classes.iconRegular}/>
                      </IconButton>
                    </div>
                  </div>
                }
                {modalProps.error &&
                  <div className={classes.informationBox}>
                    { modalProps.error }
                  </div>
                }
                {!modalProps.isNew && wfmJob &&
                  (
                    <div>
                      { wfmJob.client ?
                        <div className={classes.informationBox}>
                          <b>{doc.jobNumber}</b><br />
                          <b>{ wfmJob.type}</b><br />
                          { wfmJob.client }<br />
                          { wfmJob.address }<br />
                        </div>
                        :
                        <div>{doc.type !== 'bulk' && <div className={classes.informationBox}>
                          <b>{doc.jobNumber}</b><br />
                          <b>{ doc.type}</b><br />
                          { doc.client }<br />
                          { doc.address }<br />
                        </div>}</div>
                      }
                    </div>
                  )
                }
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
              </Grid>
              <Grid item xs={12} lg={10}>
                <div>
                  <div className={classNames(classes.flexRow, classes.headingInline)}>
                    <div className={classes.spacerSmall} />
                    <div className={classes.columnSmall} />
                    <div className={classes.columnMedSmall}>
                      Generic Location
                    </div>
                    <div className={classes.columnMedSmall}>
                      Specific Location
                    </div>
                    <div className={classes.columnMedLarge}>
                      Description
                    </div>
                    <div className={classes.columnMedLarge}>
                      Material
                    </div>
                    <div className={classes.columnMedLarge}>
                      Sampled By
                    </div>
                    <div className={classes.columnMedSmall}>
                      Sample Date
                    </div>
                  </div>
                  <div className={classNames(classes.flexRow, classes.infoLight)}>
                    <div className={classes.spacerSmall} />
                    <div className={classes.columnSmall} />
                    <div className={classes.columnMedSmall}>
                      e.g. 1st Floor or Block A
                    </div>
                    <div className={classes.columnMedSmall}>
                      e.g. South elevation or Kitchen
                    </div>
                    <div className={classes.columnMedLarge}>
                      e.g. Soffit or Blue patterned vinyl flooring
                    </div>
                    <div className={classes.columnMedLarge}>
                      e.g. fibre cement or vinyl with paper backing
                    </div>
                    <div className={classes.columnMedLarge} />
                    <div className={classes.columnMedSmall} />
                  </div>
                </div>

                {Array.from(Array(numberOfSamples),(x, i) => i).map(i => {
                  let disabled = doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].cocUid && doc.samples[i+1].cocUid !== doc.uid;
                  return(doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].uid && !disabled && doc.samples[i+1].deleted === false ?
                    <div className={classes.flexRowHoverFat} key={i}>
                      <div className={classes.spacerSmall} />
                      <div className={classes.columnSmall}>
                        <div className={classes.circleShaded}>
                          {i+1}
                        </div>
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
                        {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].genericLocation ? doc.samples[i+1].genericLocation : ''}
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
                        {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].specificLocation ? doc.samples[i+1].specificLocation : ''}
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
                        {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].description ? doc.samples[i+1].description : ''}
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
                        {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].material ? doc.samples[i+1].material : ''}
                      </div>
                      <div className={classes.columnMedLarge}>
                        {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].sampledBy ? doc.samples[i+1].sampledBy.join(', ') : ''}
                      </div>
                      <div className={classes.columnMedSmall}>
                        {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].sampleDate ? moment(doc.samples[i+1].sampleDate.toDate()).format('ddd, D MMMM YYYY') : ''}
                      </div>
                      <div className={classes.columnSmall}>
                        <IconButton onClick={() =>
                          this.props.showModalSecondary({
                            modalType: ASBESTOS_SAMPLE_EDIT_COC,
                            modalProps: {
                              doc: doc,
                              sample: doc.samples[i+1],
                              names: names,
                              onExit: (modified) => this.setState({
                                modified: modified,
                              })
                            }
                          })}>
                          <EditIcon className={classes.iconRegular}  />
                        </IconButton>
                      </div>
                    </div>
                    :
                    <div className={classes.flexRowHoverFat} key={i}>
                      <div className={classes.spacerSmall} />
                      <div className={classes.columnSmall}>
                        <div className={classes.circleShaded}>
                          {i+1}
                        </div>
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
                        {SuggestionField(this, disabled, null, 'genericLocationSuggestions',
                          doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].genericLocation ? doc.samples[i+1].genericLocation : '',
                          (value) => {
                            this.setState({ modified: true, });
                            this.props.handleSampleChange(i, {reported: false, genericLocation: value});
                          }
                        )}
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
                        {SuggestionField(this, disabled, null, 'specificLocationSuggestions',
                          doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].specificLocation ? doc.samples[i+1].specificLocation : '',
                          (value) => {
                            this.setState({ modified: true, });
                            this.props.handleSampleChange(i, {reported: false, specificLocation: value});
                          }
                        )}
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
                        {SuggestionField(this, disabled, null, 'descriptionSuggestions',
                          doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].description ? doc.samples[i+1].description : '',
                          (value) => {
                            this.setState({ modified: true, });
                            this.props.handleSampleChange(i, {reported: false, description: value});
                          }
                        )}
                      </div>
                      <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
                        {SuggestionField(this, disabled, null, 'materialSuggestions',
                          doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].material ? doc.samples[i+1].material : '',
                          (value) => {
                            this.setState({ modified: true, });
                            this.props.handleSampleChange(i, {reported: false, material: value});
                          }
                        )}
                      </div>
                      <div className={classes.columnMedLarge}>
                        <Select
                          isMulti
                          className={classes.select}
                          value={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].sampledBy ? doc.samples[i+1].sampledBy.map(e => ({value: e, label: e})) : this.state.defaultPersonnel}
                          options={names.map(e => ({ value: e.name, label: e.name }))}
                          onChange={e => {
                            let defaultPersonnel = this.state.defaultPersonnel;
                            if (!this.state.personnelSelected) defaultPersonnel = e;
                            this.setState({ modified: true, personnelSelected: true, defaultPersonnel});
                            this.props.handleSampleChange(i, {reported: false, sampledBy: e.map(staff => staff.value)});
                          }}
                        />
                      </div>
                      <div className={classes.columnMedSmall}>
                        <DatePicker
                          value={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].sampleDate ? doc.samples[i+1].sampleDate : this.state.defaultDate}
                          autoOk
                          format="ddd, D MMMM YYYY"
                          clearable
                          onChange={date => {
                            let defaultDate = this.state.defaultDate;
                            if (!this.state.dateSelected) defaultDate = date.toDate();
                            this.setState({ modified: true, dateSelected: true, defaultDate});
                            this.props.handleSampleChange(i, {reported: false, sampleDate: date.toDate()});
                          }}
                        />
                      </div>
                      <div className={classes.columnSmall}>
                        <Tooltip title={'Add Detailed Sample Information e.g. In-Situ Soil Characteristics'}>
                          <IconButton onClick={() =>
                            this.props.showModalSecondary({
                              modalType: ASBESTOS_SAMPLE_EDIT_COC,
                              modalProps: {
                                doc: doc,
                                sample: doc.samples[i+1] ? {...doc.samples[i+1], sampleNumber: i+1, jobNumber: doc.jobNumber} : {jobNumber: doc.jobNumber, sampleNumber: i+1},
                                names: names,
                                onExit: (modified) => {
                                  this.setState({
                                    modified: modified,
                                  });
                                  console.log('On Exit: ' + modified);
                              }}
                            })}>
                            <EditIcon className={classes.iconRegular}  />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
                <Button
                  style={{ marginTop: 24, marginLeft: 128, }}
                  onClick={ () => { this.setState({ numberOfSamples: numberOfSamples + 10}) }}>
                  <Add className={classes.marginRightSmall} /> Add More Samples
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              this.props.resetWfmJob();
              this.props.resetModal()
            }} color="secondary">Cancel</Button>
            <Button disabled={!this.state.modified} onClick={() => {
              if (modalProps.isNew) {
                window.alert('Sync a job with WorkflowMax before submitting.');
                return;
              } else {
                 if (wfmJob.client) {
                  doc.jobNumber = doc.jobNumber ? doc.jobNumber.toUpperCase().trim() : null;
                  doc.client = wfmJob.client ? wfmJob.client.trim() : null;
                  doc.address = wfmJob.address ? wfmJob.address.trim() : null;
                  doc.clientOrderNumber = wfmJob.clientOrderNumber.trim() ? wfmJob.clientOrderNumber : null;
                  doc.contact = wfmJob.contact ? wfmJob.contact.trim() : null;
                  doc.contactName = wfmJob.contactName ? wfmJob.contactName.trim() : null;
                  doc.contactEmail = wfmJob.contactEmail ? wfmJob.contactEmail.trim() : null;
                  doc.dueDate = wfmJob.dueDate ? wfmJob.dueDate : null;
                  doc.manager = wfmJob.manager ? wfmJob.manager.trim() : null;
                  doc.type = wfmJob.type ? wfmJob.type : null;
                 }
                let now = new Date();
                if (!doc.dateSubmit) doc.dateSubmit = now;
                doc.lastModified = now;
                doc.versionUpToDate = false;
                doc.mostRecentIssueSent = false;
                doc.stats = { status: 'In Transit'};
                doc.defaultDate = this.state.defaultDate;
                doc.defaultPersonnel = this.state.defaultPersonnel;
                if (Object.keys(doc.samples).length === 0) doc.status = 'No Samples';
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
      );
    } else return null;
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CocModal));
