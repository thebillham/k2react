import React from 'react';
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
// import store from '../../store';
import { COC } from '../../constants/modal-types';
import { usersRef, storage } from '../../config/firebase';
import '../../config/tags.css';
import { sendSlackMessage } from '../../Slack';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
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

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import Sync from '@material-ui/icons/Sync';
import {
  hideModal, handleModalChange, handleModalSubmit, onUploadFile } from '../../actions/modal';
import { fetchStaff, } from '../../actions/local';
import _ from 'lodash';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    me: state.local.me,
    userRefName: state.local.userRefName,
    tags: state.modal.modalProps.tags,
    tagSuggestions: state.const.docTagSuggestions,
    staff: state.local.staff,
    qualificationtypes: state.const.qualificationtypes,
    delimiters: state.const.tagDelimiters,
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
  };
};

class CocModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      samplers: [],
    };
  }

  componentWillMount() {
    if (Object.keys(this.props.staff).length < 1)
      this.props.fetchStaff();
  }

  handleSamplerChange = event => {
    console.log(event.target.value);
    this.setState({
      samplers: event.target.value
    });
  }
  // sendNewAttrSlack = () => {
  //   let message = {
  //     text: `${this.props.modalProps.staffName} has added a new qualification.\n${this.props.qualificationtypes[this.props.doc.type].name}`,
  //   };
  //   sendSlackMessage(message, true);
  // }

  render() {
    const { modalProps, doc, classes, staff } = this.props;
    const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).concat([this.props.me]).sort((a, b) => a.name.localeCompare(b.name)));
    console.log(names);
    return(
      <Dialog
        open={ this.props.modalType === COC }
        onClose = {() => this.props.hideModal}
        >
        <DialogTitle>{ modalProps.title ? modalProps.title : 'Add New Chain of Custody' }</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'row', }}>
            <TextField
              id="jobnumber"
              label="Job Number"
              defaultValue={doc && doc.id}
              className={classes.dialogField}
              onChange={e => {this.props.handleModalChange(e.target)}}
            />
            <IconButton>
              <Sync />
            </IconButton>
          </div>
          <form>
            <FormGroup>
              <FormControl className={classes.formControl}>
                <InputLabel>Sampled By</InputLabel>
                <Select
                 multiple
                 value={this.state.samplers}
                 onChange={this.handleSamplerChange}
                 input={<Input id="select-multiple-chip" />}
                 renderValue={selected => (
                   <div className={classes.chips}>
                     {selected.map(value => (
                       <Chip key={value.uid} label={value.name} style={{ display: 'flex', flexWrap: 'wrap', }} />
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
                   <MenuItem key={name.uid} value={{ uid: name.uid, name: name.name, }}>
                     {name.name}
                   </MenuItem>
                 ))}
                </Select>
              </FormControl>



              { this.props.qualificationtypes[doc.type].abbrev &&
              <TextField
                id="abbrev"
                label="Abbreviated Title"
                defaultValue={doc && doc.abbrev}
                className={classes.dialogField}
                helperText="e.g. BSc (Hons); This will be displayed beside your name on reports"
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].unit &&
              <TextField
                id="unit"
                label="Unit Standard Number(s)"
                defaultValue={doc && doc.unit && doc.unit.join(', ')}
                className={classes.dialogField}
                helperText="If more than one unit standard, seperate each one with a comma"
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].class &&
              <TextField
                id="class"
                label="Class(es)"
                defaultValue={doc && doc.class && doc.class.join(', ')}
                className={classes.dialogField}
                helperText="1 = Car Full, 1L = Car Learner, 1R = Car Restricted etc. If more than one class, separate each one with a comma."
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].issuer &&
              <TextField
                id="issuer"
                label="Issuer/Provider"
                defaultValue={doc && doc.issuer}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              {/*Date is always shown*/}
              <TextField
                id="date"
                label="Date Issued"
                type="date"
                defaultValue={doc && doc.date}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
                InputLabelProps = {{ shrink: true }}
              />

              { this.props.qualificationtypes[doc.type].expiry &&
              <TextField
                id="expiry"
                label="Expiry Date"
                type="date"
                defaultValue={doc && doc.expiry}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
                InputLabelProps = {{ shrink: true }}
              />}

              { this.props.qualificationtypes[doc.type].notes &&
              <TextField
                id="notes"
                label="Notes"
                multiline
                maxlines={4}
                defaultValue={doc && doc.notes}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}
            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { this.props.hideModal() }} color="secondary">Cancel</Button>
          {modalProps.isUploading ? <Button color="primary" disabled >Submit</Button>
          : <Button onClick={() => {
            this.props.handleModalSubmit({
              doc: doc,
              pathRef: usersRef.doc(modalProps.userPath).collection("attr"),
            });
            this.sendNewAttrSlack();
            this.props.getUserAttrs(modalProps.userPath);
          }
        } color="primary" >Submit</Button>}
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(CocModal));
