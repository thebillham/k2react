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
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import Sync from '@material-ui/icons/Sync';
import { hideModal, handleModalChange, handleModalSubmit, onUploadFile, setModalError } from '../../actions/modal';
import { fetchStaff, syncJobWithWFM } from '../../actions/local';
import _ from 'lodash';
import { injectIntl, IntlProvider,  } from 'react-intl';

const mapStateToProps = state => {
  return {
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
    handleModalChange: _.debounce(target => dispatch(handleModalChange(target)), 100),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) => dispatch(handleModalSubmit(doc, pathRef)),
    setModalError: error => dispatch(setModalError(error)),
    syncJobWithWFM: jobNumber => dispatch(syncJobWithWFM(jobNumber)),
  };
};

function getStyles(name, that) {
  return {
    fontWeight:
      that.state.samplers.indexOf(name) === -1
        ? 200
        : 600
  };
}


class CocModal extends React.Component {
  state = {
    samplers: [],
    dates: [],
    syncError: null,
  };

  componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  handlePersonnelChange = event => {
    console.log(event.target.value);
    this.setState({
      personnel: event.target.value
    });
    this.props.handleSelectChange({ id: 'personnel', value: event.target.value, })
  }

  handleDateChange = (day, { selected }) => {
    const { dates } = this.state;
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
                  onChange={e => {this.props.handleModalChange(e.target)}}
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
                  <div style={{ color: '#666', fontWeight: 200, fontSize: 14, }}>
                    { wfmJob.client }<br />
                    { wfmJob.address }<br />
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
                    <InputLabel>Sample Date(s)</InputLabel><br /><br />
                    <DayPicker
                      selectedDays={this.state.dates}
                      onDayClick={this.handleDateChange}
                    />
                  </FormControl>
                </FormGroup>
              </form>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container direction='column'>
                <Grid item>
                  { Array.from(Array(150),(x, i) => i).map(i => {
                    return(<Grid container>
                    <Grid item xs={1}>
                      {i + 1}
                    </Grid>
                    <Grid item xs={6}>
                      Item
                    </Grid>
                    <Grid item xs={5}>
                      Material
                    </Grid>
                  </Grid>)
                  })}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { this.props.hideModal() }} color="secondary">Cancel</Button>
          {modalProps.isUploading ? <Button color="primary" disabled >Submit</Button>
          : <Button onClick={() => {
            if (!wfmJob) {
              this.props.setModalError('Sync a job with WorkflowMax before submitting.')
            } else {
              doc.jobNumber = doc.jobNumber.toUpperCase();
              doc.client = wfmJob.client;
              doc.address = wfmJob.address;
              doc.clientOrderNumber = wfmJob.clientOrderNumber;
              doc.contact = wfmJob.contact;
              doc.dueDate = wfmJob.dueDate;
              doc.manager = wfmJob.manager;
              doc.type = wfmJob.type;
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
              console.log(datestring);
              if (doc.uid) {
                this.props.handleModalSubmit({
                  doc: doc,
                  pathRef: cocsRef,
                });
              } else {
                this.props.handleModalSubmit({
                  doc: doc,
                  pathRef: cocsRef,
                  docid: `${doc.jobNumber}_${datestring}`
                });
                // SET WFM JOB TO {} HERE
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

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(CocModal));
