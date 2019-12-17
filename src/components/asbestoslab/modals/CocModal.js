import React from 'react';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import { connect } from 'react-redux';
import classNames from 'classnames';
// import store from '../../store';
import { ASBESTOS_COC_EDIT, ASBESTOS_SAMPLE_EDIT_COC, } from '../../../constants/modal-types';
import moment from "moment";

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from "@material-ui/core/Switch";
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Chip from '@material-ui/core/Chip';
import EditIcon from '@material-ui/icons/Edit';
import Select from 'react-select';
import SuggestionField from '../../../widgets/SuggestionField';
import Hint from 'react-hints';
// import { CSSTransition } from 'react-transition-group';
// import '../../../config/styles.css';

import {
  DatePicker,
  KeyboardDatePicker,
  DateTimePicker,
  KeyboardDateTimePicker
} from "@material-ui/pickers";

import Add from '@material-ui/icons/Add';
import Sync from '@material-ui/icons/Sync';
import Link from '@material-ui/icons/Link';
import Close from '@material-ui/icons/Close';
// import AirIcon from '@material-ui/icons/AcUnit';
import AirIcon from '@material-ui/icons/Toys';
import BulkIcon from '@material-ui/icons/Colorize';
import Go from '@material-ui/icons/ArrowForwardIos';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError, resetModal, showModalSecondary, } from '../../../actions/modal';
import { fetchStaff, addLog, } from '../../../actions/local';
import { getDetailedWFMJob, resetWfmJob, getDefaultLetterAddress, } from '../../../actions/jobs';
import {
  fetchSamples,
  handleCocSubmit,
  handleSampleChange,
  getAirConcentration,
  writeDescription,
  getSampleRunTime,
  getAverageFlowRate,
  getAirSampleData,
} from '../../../actions/asbestosLab';
import { titleCase, sentenceCase, dateOf, writeDates, personnelConvert, numericOnly, writeMeasurement } from '../../../actions/helpers';
import _ from 'lodash';


const {whyDidYouUpdate} = require('why-did-you-update');
const mapStateToProps = state => {
  return {
    // genericLocationSuggestions: state.const.genericLocationSuggestions,
    // specificLocationSuggestions: state.const.specificLocationSuggestions,
    // descriptionSuggestions: state.const.asbestosDescriptionSuggestions,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
    asbestosMaterialCategories: state.const.asbestosMaterialCategories,
    acmInSoilLimits: state.const.acmInSoilLimits,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    wfmJob: state.jobs.wfmJob,
    me: state.local.me,
    userRefName: state.local.userRefName,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
    jobList: state.jobs.jobList,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    fetchStaff: () => dispatch(fetchStaff()),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: _.debounce(target => dispatch(handleModalChange(target)), 50),
    // handleModalChange: target => dispatch(handleModalChange(target)),
    // handleCocSubmit: doc => dispatch(handleCocSubmit(doc)),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) => dispatch(handleModalSubmit(doc, pathRef)),
    handleSampleChange: (number, changes) => dispatch(handleSampleChange(number, changes)),
    setModalError: error => dispatch(setModalError(error)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
    getDetailedWFMJob: (jobNumber, createUid) => dispatch(getDetailedWFMJob(jobNumber, createUid)),
    resetWfmJob: () => dispatch(resetWfmJob()),
    fetchSamples: (cocUid, jobNumber, modal, airSamples ) => dispatch(fetchSamples(cocUid, jobNumber, modal, airSamples )),
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
  jobNumber: null,
  sampleType: 'bulk',

  personnel: [],
  personnelSetup: [],
  personnelPickup: [],
  // genericLocationSuggestions: [],
  // specificLocationSuggestions: [],
  // descriptionSuggestions: [],
  // materialSuggestions: [],
  syncError: null,
  modified: false,

  sampleEditModal: null,
  sampleEditModified: false,
  sampleDelete: false,
  sampleDoSwap: false,
  sampleSwap: '',

  // airFilterModal: null,
  // airFilterModified: false,
  // airFilterDelete: false,
  // airFilterDoSwap: false,
  // airFilterSwap: '',
  numberOfSamples: 10,

  defaultSampleDate: null,
  defaultSampledBy: [],
  dateSelected: false,
  personnelSelected: false,
  recentSuggestionsGenericLocation: [],
  recentSuggestionsSpecificLocation: [],
  recentSuggestionsDescription: [],
  recentSuggestionsMaterial: [],
  showBulkChangeSamples: false,
};

class CocModal extends React.PureComponent {
  // static whyDidYouRender = true;
  state = initState;

  UNSAFE_componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (!nextProps.cocs[nextProps.job]) return true; // COC has been deleted
  //   if ((nextProps.samples && nextProps.samples[nextProps.job] && this.props.samples && this.props.samples[this.props.job] &&
  //   (Object.keys(nextProps.samples[nextProps.job]).length === nextProps.cocs[nextProps.job].sampleList.length ||
  //   Object.keys(nextProps.samples[nextProps.job]).length !== Object.keys(this.props.samples[this.props.job]).length)) ||
  //   this.props.cocs[this.props.job] !== nextProps.cocs[nextProps.job] ||
  //   this.state !== nextState
  //  ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // handlePersonnelChange = (e, type) => {
  //   this.setState({
  //     [type]: e.map(e => e.value),
  //     modified: true,
  //   });
  //   if (this.props.doc.uid !== undefined) {
  //     let log = {
  //       type: 'Edit',
  //       log: `Sampling personnel details changed.`,
  //       chainOfCustody: this.props.doc.uid,
  //     };
  //     addLog("asbestosLab", log, this.props.me);
  //   }
  //   this.props.handleSelectChange({ id: type, value: e.map(e => e.value), })
  // }

  wfmSync = () => {
    let jobNumber = this.props.doc.jobNumber;
    let initJobNumber = this.state.jobNumber;
    if (!jobNumber && this.state.jobNumber) jobNumber = this.state.jobNumber;
    if (!jobNumber) {
      this.props.setModalError('Enter the job number to sync with WorkflowMax');
    } else if (jobNumber.substring(0,2).toUpperCase() !== 'AS') {
      this.props.setModalError('Asbestos job numbers must begin with "AS"');
    } else {
      this.props.setModalError(null);
      this.props.handleSelectChange({id: 'modal', value: {isNew: false}});
      let isNewCoc = this.props.doc.uid === undefined;
      this.props.getDetailedWFMJob(jobNumber, isNewCoc);
      let uid = this.props.doc.uid;
      // //console.log('wfmsync fetch samples');
      this.props.fetchSamples(uid, jobNumber, true, this.state.sampleType === "air");
      this.setState({ modified: true });
    }
  }

  sendNewAttrSlack = () => {
    // let message = {
    //   text: `${this.props.modalProps.staffName} has added a new Chain of Custody.\n${this.props.qualificationtypes[this.props.doc.type].name}`,
    // };
    // sendSlackMessage(message, true);
  }

  render() {
    const { modalProps, modalType, doc, wfmJob, classes, me, jobList } = this.props;
    // console.log(doc);
    if (modalType === ASBESTOS_COC_EDIT) {
      const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));
      // console.log(this.state.recentSuggestionsGenericLocation);

      if (!doc.dates) doc.dates = [];
      let dates = doc.dates.map(date => dateOf(date));

      let sampleNumbers = [this.state.numberOfSamples];
      if (doc && doc.samples) sampleNumbers = sampleNumbers.concat(Object.keys(doc.samples).map(key => parseInt(key)));
      let numberOfSamples = Math.max(...sampleNumbers);
      let wfmSynced = doc.jobNumber && !modalProps.isNew;

      let blockInput = !doc.uid && (!wfmSynced || modalProps.error);
      if (blockInput !== false) blockInput = true;
      let noSamples = true;
      if (doc && doc.samples) Object.values(doc.samples).forEach(s => {
        if (this.state.sampleType === "bulk" && !s.deleted && (s.description || s.material || s.specificLocation || s.genericLocation)) noSamples = false;
        else if (this.state.sampleType === "bulk" && !s.deleted && s.initialFlowRate && s.finalFlowRate && s.startTime && (s.endTime || s.totalRunTime)) noSamples = false;
      });
      // console.log(names.map(e => ({ value: e.uid, label: e.name })));

      return(
        <Dialog
          open={ modalType === ASBESTOS_COC_EDIT }
          onClose = {() => this.props.hideModal()}
          fullScreen = { true }
          maxWidth = "lg"
          disableEscapeKeyDown = { !blockInput && (doc || wfmJob) !== false }
          fullWidth = { true }
        >
          {!blockInput && (doc || wfmJob) && <DialogTitle>
            <div>
              <div>Create New Chain of Custody</div>
              <div className={classes.subtitle}>
                {this.state.sampleType === "air" && 'Membrane Filter Method for Estimating Airborne Asbestos Fibres (NOHSC 3003:2005)'}
                {this.state.sampleType === "bulk" && 'Qualitative Identification of Asbestos in Bulk Samples (AS 4964-2004)'}
              </div>
            </div>
          </DialogTitle>}
          {!blockInput && (doc || wfmJob) ?
            <DialogContent>
              <Grid container spacing={1}>
                <Grid item xs={12} lg={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={4} lg={12}>
                      {!modalProps.isNew && wfmJob &&
                        (
                        <div>
                          { wfmJob.client ?
                            <div className={classes.informationBoxRounded}>
                              <Grid container>
                                <Grid item>
                                  <b>{doc.jobNumber}</b><br />
                                  <b>{ wfmJob.wfmType}</b><br />
                                  { wfmJob.client }<br />
                                  { wfmJob.address }<br />
                                </Grid>
                                <Grid item>
                                  <div className={classes.flexRow}>
                                    {((doc && doc.wfmID) || (wfmJob && wfmJob.wfmID)) && <Tooltip title="View Job on WorkflowMax">
                                      <IconButton onClick={() => window.open(`https://my.workflowmax.com/job/jobview.aspx?id=${wfmJob ? wfmJob.wfmID : doc.wfmID}`) }>
                                        <Link className={classes.iconRegular}/>
                                      </IconButton>
                                    </Tooltip>}
                                    <Tooltip title="Re-sync Job with WorkflowMax">
                                      <IconButton onClick={ this.wfmSync }>
                                        <Sync className={classes.iconRegular}/>
                                      </IconButton>
                                    </Tooltip>
                                  </div>
                                </Grid>
                              </Grid>
                            </div>
                            :
                            <div>{doc.type !== 'bulk' && <div className={classes.informationBox}>
                              <Grid container>
                                <Grid item>
                                  <b>{doc.jobNumber}</b><br />
                                  <b>{ doc.wfmType}</b><br />
                                  { doc.client }<br />
                                  { doc.address }<br />
                                </Grid>
                                <Grid item>
                                  <div className={classes.flexRow}>
                                    {((doc && doc.wfmID) || (wfmJob && wfmJob.wfmID)) && <Tooltip title="View Job on WorkflowMax">
                                      <IconButton onClick={() => window.open(`https://my.workflowmax.com/job/jobview.aspx?id=${wfmJob ? wfmJob.wfmID : doc.wfmID}`) }>
                                        <Link className={classes.iconRegular}/>
                                      </IconButton>
                                    </Tooltip>}
                                    <Tooltip title="Sync Job with WorkflowMax">
                                      <IconButton onClick={ this.wfmSync }>
                                        <Sync className={classes.iconRegular}/>
                                      </IconButton>
                                    </Tooltip>
                                  </div>
                                </Grid>
                              </Grid>
                            </div>}</div>
                          }
                        </div>
                        )
                      }
                      <div className={classes.informationBoxWhiteRounded}>
                        {this.state.sampleType === "air" &&
                          <div>
                            <InputLabel>Test Description</InputLabel>
                            <SuggestionField that={this} suggestions='airTestDescriptions'
                              defaultValue={doc.airTestDescription ? doc.airTestDescription : ''}
                              onModify={value => {
                                this.setState({
                                  modified: true,
                                });
                                this.props.handleModalChange({id: 'airTestDescription', value: value });
                              }} />
                            <InputLabel className={classes.marginTopSmall}>Sampling By</InputLabel>
                            <Select
                              isMulti
                              className={classes.selectTight}
                              value={this.state.defaultSampledBy ? this.state.defaultSampledBy : null}
                              options={names.map(e => ({ value: e.uid, label: e.name }))}
                              onChange={e => {
                                this.setState({
                                  modified: true,
                                  defaultSampledBy: personnelConvert(e).map(e => ({ value: e.uid, label: e.name })),
                                });
                              }}
                            />
                          </div>
                        }
                        <TextField
                          id="labInstructions"
                          label="Lab Instructions"
                          style={{ width: '100%' }}
                          defaultValue={doc && doc.labInstructions}
                          rows={5}
                          helperText='Include any information that may be useful for the lab. E.g. for a soil sample you might include information on what contamination you are expecting.'
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
                              checked={doc.isClearance === true ? true : false}
                              onClick={e => {
                                this.setState({ modified: true, });
                                this.props.handleModalChange({id: 'isClearance', value: e.target.checked});
                              }}
                              value="isClearance"
                              color="secondary"
                            />
                          }
                          label="Clearance"
                        />
                      </div>
                    </Grid>
                    <Grid item xs={8} lg={12}>
                      {this.state.sampleType === 'bulk' && <div className={classes.informationBoxWhiteRounded}>
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
                        {doc.waAnalysis && <div>
                          <Select
                            value={doc.acmInSoilLimit ? {value: doc.acmInSoilLimit, label: this.props.acmInSoilLimits.filter(e => e.value === doc.acmInSoilLimit)[0].label} : {value: '0.01', label: this.props.acmInSoilLimits.filter(e => e.value === '0.01')[0].label}}
                            options={this.props.acmInSoilLimits.map(e => ({ value: e.value, label: e.label }))}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleModalChange({id: 'acmInSoilLimit', value: e.value});
                            }}
                          />
                          <div className={classes.informationBoxRounded}>
                            <div className={classes.bold}>{doc.acmInSoilLimit ? this.props.acmInSoilLimits.filter(e => e.value === doc.acmInSoilLimit)[0].heading : this.props.acmInSoilLimits.filter(e => e.value === '0.01')[0].heading}</div>
                            <div>{doc.acmInSoilLimit ? this.props.acmInSoilLimits.filter(e => e.value === doc.acmInSoilLimit)[0].description : this.props.acmInSoilLimits.filter(e => e.value === '0.01')[0].description}</div>
                          </div>
                        </div>}
                      </div>}
                      <div className={classes.informationBoxWhiteRounded}>
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
                        {doc.labToContactClient && <div>
                          <TextField
                            id="labContactName"
                            label="Contact Name"
                            value={doc && doc.labContactName ? doc.labContactName : doc.contact && doc.contact.name ? doc.contact.name : ''}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleModalChange({id: 'labContactName', value: e.target.value});
                            }}
                          />
                          <TextField
                            id="labContactNumber"
                            label="Contact Number"
                            value={doc && doc.labContactNumber ? doc.labContactNumber : doc.contact && doc.contact.mobile ? doc.contact.mobile : doc.contact && doc.contact.phone ? doc.contact.phone : ''}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleModalChange({id: 'labContactNumber', value: e.target.value});
                            }}
                          />
                          <TextField
                            id="labContactEmail"
                            label="Contact Email"
                            value={doc && doc.labContactEmail ? doc.labContactEmail : doc.contact && doc.contact.email ? doc.contact.email : ''}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleModalChange({id: 'labContactEmail', value: e.target.value});
                            }}
                          />
                        </div>}
                      </div>
                      <div className={classes.informationBoxWhiteRounded}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={doc.sendCoverLetterWithCertificate === true ? true : false}
                              onClick={e => {
                                this.setState({ modified: true, });
                                this.props.handleModalChange({id: 'sendCoverLetterWithCertificate', value: e.target.checked});
                              }}
                              value="sendCoverLetterWithCertificate"
                              color="primary"
                            />
                          }
                          label="Send Cover Letter with Certificate"
                        />
                        {doc.sendCoverLetterWithCertificate && <div>
                          <TextField
                            id="letterAddress"
                            label="Cover Letter Address"
                            style={{ width: '100%' }}
                            defaultValue={getDefaultLetterAddress(doc)}
                            rowsMax={10}
                            helperText='The address to be put on the front page of the certificate cover letter.'
                            multiline
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleModalChange({id: 'coverLetterAddress', value: e.target.value});
                            }}
                          />
                        </div>}
                      </div>
                      {false && doc.uid && <div className={classes.informationBoxWhiteRounded}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={this.state.showBulkChangeSamples === true ? true : false}
                              onClick={e => {
                                this.setState({ showBulkChangeSamples: true, });
                              }}
                              value="showBulkChangeSamples"
                              color="primary"
                            />
                          }
                          label="Bulk Change Sample Details"
                        />
                        {this.state.showBulkChangeSamples && <div>
                          <TextField
                            id="letterAddress"
                            label="Cover Letter Address"
                            style={{ width: '100%' }}
                            defaultValue={getDefaultLetterAddress(doc)}
                            rows={5}
                            helperText='The address to be put on the front page of the certificate cover letter.'
                            multiline
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleModalChange({id: 'coverLetterAddress', value: e.target.value});
                            }}
                          />
                        </div>}
                      </div>}
                    </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} lg={10}>
                  {this.state.sampleType === "bulk" ?
                    <div>
                      <div className={classNames(classes.flexRow, classes.headingInline)}>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall} />
                        <div className={classes.columnMedSmall}>
                          Building or General Area
                        </div>
                        <div className={classes.columnMedSmall}>
                          Room or Specific Area
                        </div>
                        <div className={classes.columnMedLarge}>
                          Description
                        </div>
                        <div className={classes.columnMedLarge}>
                          Material
                        </div>
                        <div className={classes.columnMedSmall}>
                          Sample Category
                        </div>
                        <div className={classes.columnMedLarge}>
                          Sampled By
                        </div>
                        <div className={classes.columnMedSmall}>
                          Sample Date
                        </div>
                        <div className={classes.columnSmall} />
                      </div>
                      <div className={classNames(classes.flexRow, classes.infoLight)}>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall} />
                        <div className={classes.columnMedSmall}>
                          <span className={classes.note}>e.g. 1st Floor or Block A</span>
                        </div>
                        <div className={classes.columnMedSmall}>
                          <span className={classes.note}>e.g. South elevation or Kitchen</span>
                        </div>
                        <div className={classes.columnMedLarge}>
                          <span className={classes.note}>e.g. Soffit or Blue patterned vinyl flooring</span>
                        </div>
                        <div className={classes.columnMedLarge}>
                          <span className={classes.note}>e.g. fibre cement or vinyl with paper backing</span>
                        </div>
                        <div className={classes.columnMedSmall} />
                        <div className={classes.columnMedLarge} />
                        <div className={classes.columnMedSmall} />
                        <div className={classes.columnSmall} />
                      </div>
                    </div>
                  :
                    <div>
                      <div className={classNames(classes.flexRow, classes.headingInline)}>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall} />
                        <div className={classes.columnMed}>
                          Location
                        </div>
                        <div className={classes.columnSmall} />
                        <div className={classes.columnDoubleSmall}>
                          Flow Rates (mL/min)
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnMedSmall}>
                          Average Rate
                        </div>
                        <div className={classes.columnDoubleMedSmall}>
                          Times
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall}>Run Time</div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnMed}>
                          Sample Volume
                        </div>
                        <div className={classes.columnMedLarge}>Sampling Errors</div>
                      </div>
                      <div className={classNames(classes.flexRow, classes.infoLight)}>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall} />
                        <div className={classes.columnMed} />
                        <div className={classes.columnSmall} />
                        <div className={classes.columnSmall}>
                          Initial
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall}>
                          Final
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnMedSmall} />
                        <div className={classes.columnMedSmall}>Start</div>
                        <div className={classes.columnMedSmall}>Finish</div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall} />
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnMed} />
                        <div className={classes.columnMedLarge} />
                      </div>
                    </div>
                  }

                  {this.state.sampleType === "bulk" ?
                    Array.from(Array(numberOfSamples),(x, i) => i).map(i => {
                      let disabled = blockInput || doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].cocUid && doc.samples[i+1].cocUid !== doc.uid;
                      if (!disabled) disabled = false;
                      return(doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].uid && doc.samples[i+1].deleted === false ?
                        <div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
                          <div className={classes.spacerSmall} />
                          <div className={classes.columnSmall}>
                            <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
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
                          <div className={classes.columnMedSmall}>
                            {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].category ? doc.samples[i+1].category : ''}
                          </div>
                          <div className={classes.columnMedLarge}>
                            {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].sampledBy ? doc.samples[i+1].sampledBy.map(e => e.name).join(', ') : ''}
                          </div>
                          <div className={classes.columnMedSmall}>
                            {doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].sampleDate ?
                              moment(dateOf(doc.samples[i+1].sampleDate)).format('ddd, D MMMM YYYY') : ''}
                          </div>
                          <div className={classes.columnSmall}>
                            {!disabled && <IconButton onClick={() =>
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
                            </IconButton>}
                          </div>
                        </div>
                        :
                        <div className={classes.flexRowHover} key={i}>
                          <div className={classes.spacerSmall} />
                          <div className={classes.columnSmall}>
                            <div className={classes.circleShaded}>
                              {i+1}
                            </div>
                          </div>
                          <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
                            <SuggestionField that={this} suggestions='genericLocationSuggestions'
                              value={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].genericLocation ? doc.samples[i+1].genericLocation : ''}
                              disabled={disabled}
                              addedSuggestions={this.state.recentSuggestionsGenericLocation}
                              onModify={(value) => {
                                this.setState({
                                  modified: true,
                                  recentSuggestionsGenericLocation: this.state.recentSuggestionsGenericLocation.concat(value),
                                });
                                this.props.handleSampleChange(i, {genericLocation: titleCase(value.trim())});
                              }} />
                          </div>
                          <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
                            <SuggestionField that={this} suggestions='specificLocationSuggestions'
                              defaultValue={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].specificLocation ? doc.samples[i+1].specificLocation : ''}
                              disabled={disabled}
                              onModify={(value) => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, {specificLocation: titleCase(value.trim())});
                              }} />
                          </div>
                          <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
                            <SuggestionField that={this} suggestions='descriptionSuggestions'
                              defaultValue={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].description ? doc.samples[i+1].description : ''}
                              disabled={disabled}
                              onModify={(value) => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, {description: sentenceCase(value.trim())});
                              }} />
                          </div>
                          <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
                            <SuggestionField that={this} suggestions='materialSuggestions'
                              defaultValue={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].material ? doc.samples[i+1].material : ''}
                              disabled={disabled}
                              onModify={(value) => {
                                let category = '';
                                  let materialObj = Object.values(this.props.materialSuggestions).filter(e => e.label === value);
                                  if (materialObj.length > 0) {
                                    category = materialObj[0].category;
                                  }
                                // }
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, {material: value.trim(), category});
                              }} />
                          </div>
                          <div className={classes.columnMedSmall}>
                            <Select
                              className={classes.selectTight}
                              value={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].category ? {value: doc.samples[i+1].category, label: doc.samples[i+1].category} : {value: '', label: ''}}
                              options={this.props.asbestosMaterialCategories.map(e => ({ value: e.label, label: e.label }))}
                              isDisabled={disabled}
                              onChange={e => {
                                this.setState({ modified: true, });
                                this.props.handleSampleChange(i, {category: e.value});
                              }}
                            />
                          </div>
                          <div className={classes.columnMedLarge}>
                            <Select
                              isMulti
                              className={classes.selectTight}
                              value={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].sampledBy ? doc.samples[i+1].sampledBy.map(e => ({value: e.uid, label: e.name})) : this.state.defaultSampledBy}
                              options={names.map(e => ({ value: e.uid, label: e.name }))}
                              isDisabled={disabled}
                              onChange={e => {
                                let defaultSampledBy = this.state.defaultSampledBy;
                                let personnelSelected = this.state.personnelSelected;
                                let sampledBy = personnelConvert(e);

                                if (personnelSelected === false) {
                                  personnelSelected = i;
                                  defaultSampledBy = sampledBy.map(e => ({value: e.uid, label: e.name}));
                                }
                                // } else if (personnelSelected === i) {
                                //   defaultSampledBy = sampledBy.map(e => ({value: e.uid, label: e.name}));
                                // }

                                // if (e.length === 0) {
                                //   personnelSelected = false;
                                //   defaultSampledBy = e;
                                // }

                                this.setState({ modified: true, personnelSelected, defaultSampledBy});
                                this.props.handleSampleChange(i, {sampledBy});
                              }}
                            />
                          </div>
                          <div className={classes.columnMedSmall}>
                            <DatePicker
                              value={doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1].sampleDate !== undefined ? doc.samples[i+1].sampleDate :
                                this.state.defaultSampleDate}
                              autoOk
                              format="ddd, D MMMM YYYY"
                              disabled={disabled}
                              clearable
                              onChange={date => {
                                let defaultSampleDate = this.state.defaultSampleDate;
                                let dateSelected = this.state.dateSelected;

                                if (dateSelected === false) {
                                  dateSelected = i;
                                  defaultSampleDate = dateOf(date);
                                }
                                // } else if (dateSelected === i) {
                                //   defaultSampleDate = dateOf(date);
                                // }
                                this.setState({ modified: true, dateSelected, defaultSampleDate});
                                this.props.handleSampleChange(i, {sampleDate: dateOf(date)});
                              }}
                            />
                          </div>
                          <div className={classes.columnSmall}>
                            {/*<Tooltip title={'Add Detailed Sample Information e.g. In-Situ Soil Characteristics'}>
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
                                      //console.log('On Exit: ' + modified);
                                  }}
                                })}>
                                <EditIcon className={classes.iconRegular}  />
                              </IconButton>
                            </Tooltip>*/}
                          </div>
                        </div>
                      );
                    })
                    :
                    Array.from(Array(numberOfSamples),(x, i) => i).map(i => {
                    let disabled = blockInput || doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].cocUid && doc.samples[i+1].cocUid !== doc.uid;
                    let sample = doc && doc.samples && doc.samples[i+1] && !doc.samples[i+1].deleted && doc.samples[i+1] ? doc.samples[i+1] : {};
                    let calcs = {};
                    if ((sample.initialFlowRate && sample.finalFlowRate) || (sample.startTime && sample.endTime)) calcs = getAirSampleData(sample, doc.labInstructions ? parseFloat(doc.labInstructions) : 9);
                    if (!disabled) disabled = false;
                    return(doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].uid && doc.samples[i+1].deleted === false ?
                      doc.samples[i+1].sampleType === "air" ? this.getSampleListAir(i, disabled, names) : this.getSampleListBulk(i, disabled, names)
                      :
                      <div className={classNames(classes.paddingTopBottomSmall, classes.flexRowHover)} key={i}>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall}>
                          <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
                            {i+1}
                          </div>
                        </div>
                        <div className={classNames(classes.paddingSidesSmall, classes.columnMed)}>
                          <SuggestionField that={this} suggestions='airLocationSuggestions'
                            defaultValue={sample.specificLocation ? sample.specificLocation : ''}
                            disabled={disabled}
                            onModify={(value) => {
                              this.setState({ modified: true, });
                              this.props.handleSampleChange(i, {specificLocation: titleCase(value.trim())});
                            }} />
                        </div>
                        <div className={classes.columnSmall} />
                        <div className={classes.columnSmall}>
                          <TextField
                            id="initialFlowRate"
                            value={sample.initialFlowRate ? sample.initialFlowRate : ''}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleSampleChange(i, {initialFlowRate: numericOnly(e.target.value.trim())});
                            }}
                          />
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall}>
                          <TextField
                            id="finalFlowRate"
                            value={sample.finalFlowRate ? sample.finalFlowRate : ''}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleSampleChange(i, {finalFlowRate: numericOnly(e.target.value.trim())});
                            }}
                          />
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnMedSmall}>
                          {sample.initialFlowRate && sample.finalFlowRate ? <span className={calcs.differenceTooHigh ? classes.informationBoxError : (calcs.sampleRateLow || calcs.sampleRateHigh) ? classes.informationBoxWarning : classes.informationBoxOk}>
                            {calcs.averageFlowRate ? `${parseFloat(calcs.averageFlowRate).toFixed(1)} mL/min` : ''}
                          </span> : <span />}
                        </div>
                        <div className={classes.columnMedSmall}>
                          <DateTimePicker
                            value={sample.startTime ? sample.startTime : null}
                            autoOk
                            format="D/MM/YY, hh:mma"
                            disabled={disabled}
                            clearable
                            views={['hours','minutes']}
                            onChange={date => {
                              this.setState({ modified: true, });
                              this.props.handleSampleChange(i, {startTime: dateOf(date)});
                            }}
                          />
                        </div>
                        <div className={classes.columnMedSmall}>
                          <DateTimePicker
                            value={sample.endTime ? sample.endTime : null}
                            autoOk
                            format="D/MM/YY, hh:mma"
                            disabled={disabled}
                            clearable
                            views={['hours','minutes']}
                            onChange={date => {
                              this.setState({ modified: true, });
                              this.props.handleSampleChange(i, {endTime: dateOf(date), totalRunTime: null, });
                            }}
                          />
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnSmall}>
                          <TextField
                            id="totalRunTime"
                            value={sample.totalRunTime ? sample.totalRunTime : calcs.runTime}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                            }}
                            onChange={e => {
                              this.setState({ modified: true, });
                              this.props.handleSampleChange(i, {totalRunTime: numericOnly(e.target.value.trim())});
                            }}
                          />
                        </div>
                        <div className={classes.spacerSmall} />
                        <div className={classes.columnMed}>
                          {calcs.sampleVolume ? <span className={calcs.sampleVolumeMuchTooLow ? classes.informationBoxError : calcs.sampleVolumeTooLow ? classes.informationBoxWarning : classes.informationBoxOk}>
                            {`${parseFloat(calcs.sampleVolume).toFixed(1)}L`}
                          </span> : ''}
                        </div>
                        <div className={classes.columnMedLarge}>
                          {(calcs.differenceTooHigh || calcs.sampleVolumeMuchTooLow) ?
                            <div className={classes.boldRed}>
                              {calcs.differenceTooHigh && (<Tooltip title='The difference between flow rates is greater than 10 per cent. The sample must be rejected.'><div>Difference between flow rates is too high.</div></Tooltip>)}
                              {calcs.sampleVolumeMuchTooLow && (<Tooltip title='Sample volumes of less than 100L are not recommended because of the increased loss of precision in the results obtained. They may also lead to higher reporting limits than may be desired.'><div>Sample volume too low to be accurate.</div></Tooltip>)}
                            </div>
                            :
                            (calcs.sampleRateLow || calcs.sampleRateHigh || calcs.sampleVolumeTooLow) ?
                            <div className={classes.boldOrange}>
                              {calcs.sampleRateLow && (<Tooltip title='Flow rates of less than 400 mL/min may preclude countable fibres from being collected from the airborne dust cloud.'><div>Flow rate lower than recommended.</div></Tooltip>)}
                              {calcs.sampleRateHigh && (<Tooltip title='Flow rates greater than 8000 mL/min may result in interference from excessively large particles and may also cause leakage problems for most available filter holders.'><div>Flow rate higher than recommended.</div></Tooltip>)}
                              {calcs.sampleVolumeTooLow && (<Tooltip title='Asbestos clearance air tests must have a sample volume of 360L or greater.'><div>Sample volume too low for clearances.</div></Tooltip>)}
                            </div>
                            :
                            (calcs.runTime && calcs.averageFlowRate) ? <div className={classes.boldGreen}>No Sampling Errors or Warnings</div> : ''
                          }
                        </div>
                      </div>
                    );
                  })
                  }
                  <Button
                    className={classes.buttonViewMore}
                    onClick={ () => { this.setState({ numberOfSamples: numberOfSamples + 10}) }}>
                    <Add className={classes.marginRightSmall} /> Add More Samples
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            :
            <DialogContent className={classes.boxDark}>
              <div className={classes.informationBoxWhiteRounded}>
                <div style={{ fontSize: 24, }}>
                  Create New Chain of Custody
                </div>
                <div>
                  <Tooltip title="Step 1: Select your sample type">
                    <FormControl>
                      <RadioGroup row aria-label="sampleType" name="sampleType" value={this.state.sampleType} onChange={e => this.setState({ sampleType: e.target.value })}>
                        <FormControlLabel value="bulk" control={<Radio />} label="Bulk" />
                        <FormControlLabel value="air" control={<Radio />} label="Air Filter" />
                      </RadioGroup>
                    </FormControl>
                  </Tooltip>
                </div>
                <Tooltip title="Step 2: Enter the job number to get details from WorkflowMax">
                  <FormControl>
                    <InputLabel shrink>Job Number</InputLabel>
                    <Input
                      id="jobNumber"
                      className={classes.bigInput}
                      value={this.state.jobNumber}
                      onChange={e => {
                        // this.setState({ modified: true, });
                        this.setState({
                          jobNumber: e.target.value.replace(/\s/g,'').toUpperCase(),
                        })
                      }}
                      // startAdornment={<InputAdornment position="start">AS</InputAdornment>}
                    />
                  </FormControl>
                </Tooltip>
                <Tooltip title="Step 3: Click the button to begin adding samples">
                  <IconButton onClick={ this.wfmSync }>
                    <Go style={{ fontSize: 48, }} />
                  </IconButton>
                </Tooltip>
                {modalProps.error &&
                  <div className={classes.informationBox}>
                    { modalProps.error }
                  </div>
                }
              </div>
            </DialogContent>
          }
          {(wfmSynced || modalProps.error) && (doc || wfmJob) ?
            <DialogActions>
              <Button onClick={() => {
                this.props.resetWfmJob();
                this.props.resetModal()
              }} color="secondary">Cancel</Button>
              <Button disabled={!this.state.modified || !wfmSynced || noSamples} onClick={() => {
                if (wfmJob.client) {
                  doc.jobNumber = doc.jobNumber ? doc.jobNumber.toUpperCase().trim() : null;
                  doc.client = wfmJob.client ? wfmJob.client.trim() : null;
                  doc.address = wfmJob.address ? wfmJob.address.trim() : null;
                  doc.clientOrderNumber = wfmJob.clientOrderNumber.trim() ? wfmJob.clientOrderNumber : null;
                  doc.contact = wfmJob.contact ? wfmJob.contact : null;
                  doc.dueDate = wfmJob.dueDate ? wfmJob.dueDate : null;
                  doc.manager = wfmJob.manager ? wfmJob.manager.trim() : null;
                  doc.managerID = wfmJob.managerID ? wfmJob.managerID.trim() : null;
                  doc.wfmType = wfmJob.wfmType ? wfmJob.wfmType : null;
                  doc.wfmID = wfmJob.wfmID ? wfmJob.wfmID : null;
                  doc.wfmState = wfmJob.wfmState ? wfmJob.wfmState : null;
                }
                let now = new Date();
                let originalSamples = {};
                if (!doc.createdDate) {
                  let log = {
                      type: 'Create',
                      log: `Chain of Custody created.`,
                      chainOfCustody: doc.uid,
                    };
                  addLog("asbestosLab", log, me);
                  doc.deleted = false;
                  doc.createdDate = now;
                  doc.createdBy = {id: me.uid, name: me.name};
                  if (Object.keys(doc.samples).length === 0) doc.status = 'No Samples';
                    else doc.status = 'In Transit';
                } else originalSamples = this.props.samples[doc.uid];

                doc.lastModified = now;
                doc.versionUpToDate = false;
                doc.mostRecentIssueSent = false;
                doc.defaultSampleDate = this.state.defaultSampleDate;
                doc.defaultSampledBy = this.state.defaultSampledBy;
                handleCocSubmit({
                  doc: doc,
                  me: me,
                  originalSamples,
                  sampleType: this.state.sampleType,
                });
                this.props.resetModal();
                this.props.resetWfmJob();
              }
            } color="primary" >Submit</Button>
            </DialogActions>
            :
            <DialogActions>
              <Button onClick={() => {
                this.props.resetWfmJob();
                this.props.resetModal()
              }} color="secondary">Cancel</Button>
            </DialogActions>
          }
        </Dialog>
      );
    } else return null;
  }

  getSampleListBulk = (i, disabled, names) => {
    let classes = this.props.classes,
      doc = this.props.doc,
      sample = doc && doc.samples && doc.samples[i+1] ? doc.samples[i+1] : {};
    return this.state.sampleType === "air" ?
      (<div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall}>
          <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
            {i+1}
          </div>
        </div>
        <div className={classNames(classes.paddingSidesSmall)}>
          {writeDescription(sample)} (Bulk Sample)
        </div>
      </div>)
      :
      (<div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall}>
          <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
            {i+1}
          </div>
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
          {sample.genericLocation ? sample.genericLocation : ''}
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
          {sample.specificLocation ? sample.specificLocation : ''}
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
          {sample.description ? sample.description : ''}
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
          {sample.material ? sample.material : ''}
        </div>
        <div className={classes.columnMedSmall}>
          {sample.category ? sample.category : ''}
        </div>
        <div className={classes.columnMedLarge}>
          {sample.sampledBy ? sample.sampledBy.map(e => e.name).join(', ') : ''}
        </div>
        <div className={classes.columnMedSmall}>
          {sample.sampleDate ? moment(dateOf(sample.sampleDate)).format('ddd, D MMMM YYYY') : ''}
        </div>
        <div className={classes.columnSmall}>
          {!disabled && <IconButton onClick={() =>
            this.props.showModalSecondary({
              modalType: ASBESTOS_SAMPLE_EDIT_COC,
              modalProps: {
                doc,
                sample,
                names,
                onExit: (modified) => this.setState({
                  modified: modified,
                })
              }
            })}>
            <EditIcon className={classes.iconRegular}  />
          </IconButton>}
        </div>
      </div>);
  }

  getSampleListAir = (i, disabled, names) => {
    let classes = this.props.classes,
      doc = this.props.doc,
      sample = doc && doc.samples && doc.samples[i+1] ? doc.samples[i+1] : {};
    return this.state.sampleType === "air" ?
      (<div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall} />
        <div className={classes.columnMed} />
        <div className={classes.columnSmall} />
        <div className={classes.columnSmall}>
          Initial
        </div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall}>
          Final
        </div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall} />
        <div className={classes.columnMedSmall}>Start</div>
        <div className={classes.columnMedSmall}>Finish</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall} />
        <div className={classes.spacerSmall} />
        <div className={classes.columnMed} />
        <div className={classes.columnMedLarge} />

        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall}>
          <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
            {i+1}
          </div>
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMed)}>
          {sample.specificLocation ? sample.specificLocation : ''}
        </div>
        <div className={classes.columnSmall} />
        <div className={classNames(classes.paddingSidesSmall, classes.columnSmall)}>
          {sample.initialFlowRate ? sample.initialFlowRate : ''}
        </div>
        <div className={classes.spacerSmall} />
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
          {sample.finalFlowRate ? sample.finalFlowRate : ''}
        </div>
        <div className={classes.columnMedSmall}>
          {sample.initialFlowRate && sample.finalFlowRate ? (parseFloat(sample.initialFlowRate)+parseFloat(sample.finalFlowRate))/2 : ''}
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
          {sample.startTime ? moment(dateOf(sample.startTime)).format('hh:mma D MMMM YYYY') : ''}
        </div>
        <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
          {sample.endTime ? moment(dateOf(sample.endTime)).format('hh:mma D MMMM YYYY') : ''}
        </div>
        <div className={classes.spacerSmall} />
        <div className={classNames(classes.paddingSidesSmall, classes.columnSmall)}>
          {sample.totalRunTime ? sample.totalRunTime : sample.startTime && sample.endTime ? getSampleRunTime(sample) : ''}
        </div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedLarge}>
          {!disabled && <IconButton onClick={() =>
            this.props.showModalSecondary({
              modalType: ASBESTOS_SAMPLE_EDIT_COC,
              modalProps: {
                doc,
                sample,
                names,
                onExit: (modified) => this.setState({
                  modified: modified,
                })
              }
            })}>
            <EditIcon className={classes.iconRegular}  />
          </IconButton>}
        </div>
      </div>) :
      (<div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall}>
          <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
            {i+1}
          </div>
          <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
            {sample.specificLocation ? sample.specificLocation : 'Untitled'} (Air Sample)
          </div>
        </div>
      </div>)
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CocModal));
