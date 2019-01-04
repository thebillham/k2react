import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
import store from '../../store';
import { DOCUMENT } from '../../constants/modal-types';
import { docsRef } from '../../config/firebase';
import '../../config/tags.css';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import UploadIcon from '@material-ui/icons/CloudUpload';
import {
  hideModal, handleModalChange, handleModalSubmit, onUploadFile, handleTagDelete,
  handleTagAddition,
} from '../../actions/modal';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    tags: state.modal.modalProps.tags,
    tagSuggestions: state.const.docTagSuggestions,
    delimiters: state.const.tagDelimiters
   };
};

function DocumentModal (props) {
  return(
    <Dialog
      open={ props.modalType === DOCUMENT }
      onClose = {() => store.dispatch(hideModal)}
      >
      <DialogTitle>Add New Document</DialogTitle>
      <DialogContent>
        <form>
          <FormGroup>
            <TextField
              id="title"
              label="Title"
              value={props.doc && props.doc.title}
              className={props.classes.dialogField}
              onChange={e => {store.dispatch(handleModalChange(e.target))}}
            />
            <TextField
              id="desc"
              label="Description"
              value={props.doc && props.doc.desc}
              className={props.classes.dialogField}
              multiline
              rows={4}
              onChange={e => {store.dispatch(handleModalChange(e.target))}}
            />
            <TextField
              id="version_date"
              label="Version Date"
              type="date"
              value={props.doc && props.doc.date_acquired}
              className={props.classes.dialogField}
              onChange={e => {store.dispatch(handleModalChange(e.target))}}
              InputLabelProps = {{ shrink: true }}
            />
            <div>
              <ReactTags tags={props.tags}
                suggestions={props.tagSuggestions}
                handleDelete={i => {store.dispatch(handleTagDelete(i))}}
                handleAddition={tag => {store.dispatch(handleTagAddition(tag))}}
                delimiters={props.delimiters}
                minQueryLength='1'
                inline='true'
                autocomplete='true'
               />
            </div>
            <label>
              <UploadIcon className={props.classes.accentButton} />
              <input id='attr_upload_file' type='file' style={{display: 'none'}} onChange={e => {store.dispatch(onUploadFile({
                file: e.currentTarget.files[0],
                storagePath: 'documents/',
              }))
              }} />
              <LinearProgress variant="determinate" value={props.modalProps.uploadProgress} />
            </label>
          </FormGroup>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => store.dispatch(hideModal)} color="secondary">Cancel</Button>
        {props.modalProps.isUploading ? <Button color="primary" disabled >Submit</Button>
        : <Button onClick={() => {
          props.doc.tags = props.tags.map(tag => tag.text);
          store.dispatch(handleModalSubmit({
          doc: props.doc,
          pathRef: docsRef,
          }))
        }
      } color="primary" >Submit</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default withStyles(modalStyles)(connect(mapStateToProps)(DocumentModal));
