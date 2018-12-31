import React from 'react';
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';

import ReactQuill from 'react-quill';
// import ImageResize from 'quill-image-resize-module';
// import { ImageResize } from 'quill-image-resize-module';
// import { ImageDrop } from 'quill-image-drop-module';
import 'react-quill/dist/quill.snow.css';

// import store from '../../store';
import { TRAINING } from '../../constants/modal-types';
import { trainingPathsRef, storage } from '../../config/firebase';
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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import {
  hideModal, handleModalChange, handleModalChangeStep, handleModalSubmit, onUploadFile } from '../../actions/modal';
import { getUserAttrs } from '../../actions/local';
import _ from 'lodash';

// Quill.register('modules/imageResize', ImageResize);
// Quill.register('modules/imageDrop', ImageDrop);


const mapStateToProps = state => {
  return {
    delimiters: state.const.tagDelimiters,
    doc: state.modal.modalProps.doc,
    me: state.local.me,
    modalProps: state.modal.modalProps,
    modalType: state.modal.modalType,
    qualificationtypes: state.const.qualificationtypes,
    staff: state.local.staff,
    tags: state.modal.modalProps.tags,
    tagSuggestions: state.const.docTagSuggestions,
    userRefName: state.local.userRefName,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserAttrs: _.debounce(userPath => dispatch(getUserAttrs(userPath)), 1000),
    handleModalChange: _.debounce(target => dispatch(handleModalChange(target)), 300),
    handleModalChangeStep: target => dispatch(handleModalChangeStep(target)),
    handleModalSubmit: (doc, pathRef) => dispatch(handleModalSubmit(doc, pathRef)),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    hideModal: () => dispatch(hideModal()),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
  };
};

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    // [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    // [{ 'font': [] }],
    [{ 'align': [] }],

    ['image'],

    ['clean']                                         // remove formatting button
  ],
  // imageResize: {
  //   parchment: Quill.import('parchment'),
  // },
  // imageDrop: true,
};

class TrainingModuleModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      page: 1,
    }
  }

  getStyles = (uid, list) => {
    return {
      fontWeight:
        list && list.indexOf(uid) > -1
          ? 600
          : 200
    };
  }

  sendNewAttrSlack = () => {
    let message = {
      text: `${this.props.modalProps.staffName} has added a new module.\n${this.props.qualificationtypes[this.props.doc.type].name}`,
    };
    sendSlackMessage(message, true);
  }

  deleteImage = (file, uid) => {
    this.props.handleSelectChange({ id: 'fileUrl', value: null });
    this.props.handleSelectChange({ id: 'fileRef', value: null });
    if (uid) {
      let change = {
        fileUrl: null,
        fileRef: null,
      }
      trainingPathsRef.doc(this.props.doc.uid).update(change);
    }
    storage.ref(file).delete();
  }

  getPage = () => {
    const { modalProps, doc, classes } = this.props;
    const staff = { ...this.props.staff, [this.props.me.uid]: this.props.me };

    const page1 = (
      <form>
        <FormGroup>
          <TextField
            id="title"
            label="Title"
            defaultValue={doc && doc.title}
            className={classes.dialogField}
            onChange={e => {this.props.handleModalChange(e.target)}}
          />
          <TextField
            id="subtitle"
            label="Subtitle"
            defaultValue={doc && doc.subtitle}
            className={classes.dialogField}
            onChange={e => {this.props.handleModalChange(e.target)}}
          />

          { doc.fileUrl &&
            <div>
              <img src={doc.fileUrl} alt='' width="200px" style={{ opacity: "0.5", borderStyle: "solid", borderWidth: "2px" }} />
              <IconButton style={{ position: 'relative', top: '2px', left: "-120px", borderStyle: "solid", borderWidth: "2px", fontSize: 8, }} onClick={() => { if (window.confirm('Are you sure you wish to delete the image?')) this.deleteImage(doc.fileRef, doc.uid)}}>
                <Close />
              </IconButton>
            </div>
          }

          <InputLabel style={{ fontSize: 12, marginTop: 4 }}>Title Photo</InputLabel>
          <label>
            <UploadIcon className={classes.accentButton} />
            <input id='attr_upload_file' type='file' style={{display: 'none'}} onChange={e =>
            {
              if (doc.fileUrl && e.currentTarget.files[0]) {
                storage.ref(doc.fileRef).delete();
              }
              this.props.onUploadFile({
              file: e.currentTarget.files[0],
              storagePath: 'training/coverphotos/' + doc.title.replace(/\s+/g, ''),
              });
            }
            } />
            <LinearProgress style={{ marginTop: 4, }} variant="determinate" value={modalProps.uploadProgress} />
          </label>
        </FormGroup>
      </form>
    );

    const page2 = (
      <form>
        <h5>Outline</h5>
        <FormControlLabel
          control={
            <Checkbox
              checked={doc.steps && doc.steps.outline && doc.steps.outline.enabled || false}
              onChange={e => {this.props.handleModalChangeStep({step: 'outline', id: 'enabled', value: e.target.checked})}}
              value="enabled"
            />}
            label="Show this section"
          />
        <ReactQuill
          value={doc.steps && doc.steps.outline && doc.steps.outline.outline || ''}
          modules={quillModules}
          theme='snow'
          onChange={value => {this.props.handleModalChangeStep({step: 'outline', id: 'outline', value: value})}}
          />
        <FormGroup>
          <FormControl className={classes.dialogField}>
            <InputLabel>Trainers</InputLabel>
            <Select
             multiple
             value={doc.trainers ? doc.trainers : []}
             onChange={e => {this.props.handleSelectChange({id: 'trainers', value: e.target.value})}}
             input={<Input id="trainers" />}
             renderValue={selected => (
               <div style={{ display: 'flex', flexWrap: 'wrap', }}>
                 {selected.map(value => (
                   <Chip key={value} label={staff[value] && staff[value].name} style={{ margin: 5}} />
                 ))}
               </div>)
             }
             MenuProps={{
               PaperProps: {
                 style: {
                   maxHeight: 48 * 4.5 + 8,
                   width: 500,
                  }}
             }}
            >
             {Object.values(staff).sort((a, b) => a.name.localeCompare(b.name)).map(staff => (
               <MenuItem key={staff.uid} value={staff.uid} style={this.getStyles(staff.uid, doc.trainers)}>
                 {staff.name}
               </MenuItem>
             ))}
            </Select>
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel>KTPs</InputLabel>
            <Select
             multiple
             value={doc.ktp ? doc.ktp : []}
             onChange={e => {this.props.handleSelectChange({id: 'ktp', value: e.target.value})}}
             input={<Input id="ktp" />}
             renderValue={selected => (
               <div style={{ display: 'flex', flexWrap: 'wrap', }}>
                 {selected.map(value => (
                   <Chip key={value} label={staff[value] && staff[value].name} style={{ margin: 5}} />
                 ))}
               </div>)
             }
             MenuProps={{
               PaperProps: {
                 style: {
                   maxHeight: 48 * 4.5 + 8,
                   width: 500,
                  }}
             }}
            >
             {Object.values(staff).sort((a, b) => a.name.localeCompare(b.name)).map(staff => (
               <MenuItem key={staff.uid} value={staff.uid} style={this.getStyles(staff.uid, doc.ktp)}>
                 {staff.name}
               </MenuItem>
             ))}
            </Select>
          </FormControl>
        </FormGroup>
      </form>
    );

    const page3 = (
      <form>
        <FormGroup>
        </FormGroup>
      </form>
    );

    const page4 = (
      <form>
        <FormGroup>
        </FormGroup>
      </form>
    );

    const page5 = (
      <form>
        <FormGroup>
        </FormGroup>
      </form>
    );

    const page6 = (
      <form>
        <FormGroup>
        </FormGroup>
      </form>
    );

    switch (this.state.page) {
      case 1:
        return page1;
        break;
      case 2:
        return page2;
        break;
      case 3:
        return page3;
        break;
      case 4:
        return page4;
        break;
      case 5:
        return page5;
        break;
      case 6:
        return page6;
        break;
      default:
        return page1;
    }
  }

  render() {
    const { modalProps, doc, classes } = this.props;

    return(
      <Dialog
        key='trainingmodulemodal'
        open={ this.props.modalType === TRAINING }
        onClose = {() => this.props.hideModal}
        maxWidth='lg'
        fullWidth
        >
        <DialogTitle>{ modalProps.title ? modalProps.title : 'Add New Training Module' }</DialogTitle>
        <DialogContent>
         { this.getPage() }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { this.props.hideModal() }} color="secondary">Cancel</Button>
          <Button disabled={this.state.page === 1} onClick={() => { this.setState({ page: this.state.page - 1}) }} color="default">Back</Button>
          <Button disabled={this.state.page === 6} onClick={() => { this.setState({ page: this.state.page + 1}) }} color="default">Forward</Button>
          {modalProps.isUploading ? <Button color="primary" disabled >Save</Button>
          : <Button onClick={() => {
            if (!doc.uid) {
              if (doc.title) {
                doc.uid = doc.title.replace(/\s+/g, '-').toLowerCase();
              } else {
                doc.uid = Math.round(Math.random() * 1000000).toString();
              }
            }
            this.props.handleModalSubmit({
              doc: doc,
              pathRef: trainingPathsRef,
            });
            // this.sendNewAttrSlack();
          }
        } color="primary" >Submit</Button>}
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(TrainingModuleModal));
