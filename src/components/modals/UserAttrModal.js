import React from 'react';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
import store from '../../store';
import { USERATTR } from '../../constants/modal-types';
import { docsRef } from '../../config/firebase';
import '../../config/tags.css';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, TextField,
  LinearProgress, Button, FormControl, InputLabel, Input, Select,
} from '@material-ui/core';
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
    qualificationtypes: state.const.qualificationtypes,
    delimiters: state.const.tagDelimiters,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    onUploadFile: ({file, pathRef}) => dispatch(onUploadFile(file, pathRef)),
    handleModalChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: pathRef => dispatch(handleModalSubmit(pathRef)),
  };
};

class UserAttrModal extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      type: '',
    }
  }

  onSelectType = value => {
    this.setState({
      type: value,
    });
  }

  render() {
    return(
      <Dialog
        open={ this.props.modalType === USERATTR }
        onClose = {() => this.props.hideModal}
        >
        <DialogTitle>Add New Qualification</DialogTitle>
        <DialogContent>
          <form>
            <FormGroup>
              <FormControl>
                <InputLabel>Qualification Type</InputLabel>
                <Select
                  onChange={e => this.onSelectType(e.target.value)}
                  input={<Input name='qualificationtypes' id='qualificationtypes' />}
                >
                  <option value='' />
                  { this.props.qualificationtypes && Object.keys(this.props.qualificationtypes).map((type) => {
                    return(
                      <option key={type} value={type}>{type}</option>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                id="title"
                label="Title"
                value={this.props.doc && this.props.doc.title}
                className={this.props.classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />
              <TextField
                id="desc"
                label="Description"
                value={this.props.doc && this.props.doc.desc}
                className={this.props.classes.dialogField}
                multiline
                rows={4}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />
              <TextField
                id="date_acquired"
                label="Date Acquired"
                type="date"
                value={this.props.doc && this.props.doc.date_acquired}
                className={this.props.classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
                InputLabelProps = {{ shrink: true }}
              />
              <label>
                <UploadIcon className={this.props.classes.accentButton} />
                <input id='attr_upload_file' type='file' style={{display: 'none'}} onChange={e => {this.props.onUploadFile({
                  file: e.currentTarget.files[0],
                  storagePath: 'documents/',
                })
                }} />
                <LinearProgress variant="determinate" value={this.props.modalProps.uploadProgress} />
              </label>
            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.hideModal} color="secondary">Cancel</Button>
          {this.props.modalProps.isUploading ? <Button color="primary" disabled >Submit</Button>
          : <Button onClick={() => {
            this.props.handleModalSubmit({
            doc: this.props.doc,
            pathRef: docsRef,
            })
          }
        } color="primary" >Submit</Button>}
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(UserAttrModal));
