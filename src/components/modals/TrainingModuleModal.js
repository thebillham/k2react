import React from 'react';
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
import ReactQuill from 'react-quill';
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

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import {
  hideModal, handleModalChange, handleModalSubmit, onUploadFile } from '../../actions/modal';
import { getUserAttrs } from '../../actions/local';
import _ from 'lodash';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    tags: state.modal.modalProps.tags,
    tagSuggestions: state.const.docTagSuggestions,
    qualificationtypes: state.const.qualificationtypes,
    delimiters: state.const.tagDelimiters,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: _.debounce(target => dispatch(handleModalChange(target)), 300),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) => dispatch(handleModalSubmit(doc, pathRef)),
    getUserAttrs: _.debounce(userPath => dispatch(getUserAttrs(userPath)), 1000),
  };
};

class TrainingModuleModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      page: 1,
    }
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
              if (doc.fileUrl) {
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
        Outline
        <ReactQuill value={doc.steps[0].rows[0].left[0].text}
          onChange={value => { doc.steps[0].rows[0].left[0].text = value }} />
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
        open={ this.props.modalType === TRAINING }
        onClose = {() => this.props.hideModal}
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
