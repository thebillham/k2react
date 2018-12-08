import React from 'react';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
// import store from '../../store';
import { COC } from '../../constants/modal-types';
import { cocsRef, storage } from '../../config/firebase';
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
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import Sync from '@material-ui/icons/Sync';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError, handleSampleChange, handleCocSubmit } from '../../actions/modal';
import { fetchStaff, syncJobWithWFM, resetWfmJob, } from '../../actions/local';
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
    handleModalChange: _.debounce(target => dispatch(handleModalChange(target)), 300),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) => dispatch(handleModalSubmit(doc, pathRef)),
    handleCocSubmit: (doc, docid) => dispatch(handleCocSubmit(doc, docid)),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
    setModalError: error => dispatch(setModalError(error)),
    syncJobWithWFM: jobNumber => dispatch(syncJobWithWFM(jobNumber)),
    resetWfmJob: () => dispatch(resetWfmJob()),
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
  };

  componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  handlePersonnelChange = event => {
    this.setState({
      personnel: event.target.value
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
    }
  }

  sendNewAttrSlack = () => {
    // let message = {
    //   text: `${this.props.modalProps.staffName} has added a new Chain of Custody.\n${this.props.qualificationtypes[this.props.doc.type].name}`,
    // };
    // sendSlackMessage(message, true);
  }

  render() {
    const { modalProps, doc, wfmJob, classes, staff } = this.props;
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
                  onChange={e => {this.props.handleModalChange({id: 'jobNumber', value: e.target.value.replace(/\s/g,'')})}}
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
                  <FormControl>
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
                      selectedDays={doc.dates}
                      onDayClick={this.handleDateChange}
                    />
                  </FormControl>
                </FormGroup>
              </form>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container direction='column'>
                <Grid item>
                  <Grid container>
                    <Grid item xs={1}>
                      Sample Number
                    </Grid>
                    <Grid item xs={6}>
                      Location/Item
                    </Grid>
                    <Grid item xs={5}>
                      Material
                    </Grid>
                  </Grid>
                  { Array.from(Array(20),(x, i) => i).map(i => {
                    return(<Grid container key={i}>
                    <Grid item xs={1}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                        {i+1}
                      </div>
                    </Grid>
                    <Grid item xs={6} style={{ paddingLeft: 12, paddingRight: 12, }}>
                      <TextField
                        id={`description${i+1}`}
                        style={{ width: '100%' }}
                        defaultValue={doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].description}
                        onChange={e => {this.props.handleSampleChange(i, 'description', e.target.value)}}
                      />
                    </Grid>
                    <Grid item xs={4} style={{ paddingLeft: 12, }}>
                      <Autosuggest
                        {...autosuggestProps}
                        onSuggestionSelected = {(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
                          this.props.handleSampleChange(i, 'material', suggestionValue); }}
                        inputProps={{
                          value: doc && doc.samples && doc.samples[i+1] && doc.samples[i+1].material ? doc.samples[i+1].material : '',
                          onChange: e => {this.props.handleSampleChange(i, 'material', e.target.value)},
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            this.props.resetWfmJob();
            this.props.hideModal()
          }} color="secondary">Cancel</Button>
          {modalProps.isUploading ? <Button color="primary" disabled >Submit</Button>
          : <Button onClick={() => {
            if (!wfmJob) {
              this.props.setModalError('Sync a job with WorkflowMax before submitting.')
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
              doc.dateSubmit = now;
              let datestring = new Intl.DateTimeFormat('en-GB', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).format(now).replace(/[.:/,\s]/g, '_');
              if (doc.uid) {
                this.props.handleCocSubmit({
                  doc: doc,
                  docid: doc.uid,
                });
              } else {
                this.props.handleCocSubmit({
                  doc: doc,
                  docid: `${doc.jobNumber}_${datestring}`
                });
                this.props.resetWfmJob();
                // this.sendNewCocSlack();
              }
            }
          }
        } color="primary" >Submit</Button>}
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
