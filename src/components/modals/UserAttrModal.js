import React from 'react';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
import store from '../../store';
import { USERATTR } from '../../constants/modal-types';
import { usersRef, auth } from '../../config/firebase';
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
    handleModalSubmit: pathRef => dispatch(handleModalSubmit(pathRef)),
  };
};

class UserAttrModal extends React.Component {
  render() {
    const { modalProps, doc, classes } = this.props;
    return(
      <Dialog
        open={ this.props.modalType === USERATTR }
        onClose = {() => this.props.hideModal}
        >
        <DialogTitle>Add New</DialogTitle>
        <DialogContent>
          <form>
            <FormGroup>
              <FormControl className={classes.dialogField}>
                <InputLabel>Qualification Type</InputLabel>
                <Select
                  onChange={e => this.props.handleSelectChange({id: 'type', value: e.target.value})}
                  value={doc.type}
                  input={<Input name='qualificationtypes' id='qualificationtypes' />}
                >
                  { this.props.qualificationtypes && Object.keys(this.props.qualificationtypes).map((key) => {
                    return(
                      <option key={key} value={key}>{this.props.qualificationtypes[key].name}</option>
                    );
                  })}
                </Select>
              </FormControl>
              { this.props.qualificationtypes[doc.type].id &&
              <TextField
                id="id"
                label="ID Number"
                defaultValue={doc && doc.id}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].full &&
              <TextField
                id="full"
                label="Full Qualification Title"
                defaultValue={doc && doc.full}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].abbrev &&
              <TextField
                id="abbrev"
                label="Abbreviated Title (e.g. BSc (Hons))"
                defaultValue={doc && doc.abbrev}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].unit &&
              <TextField
                id="unit"
                label="Unit Standard Number"
                defaultValue={doc && doc.unit}
                className={classes.dialogField}
                onChange={e => {this.props.handleModalChange(e.target)}}
              />}

              { this.props.qualificationtypes[doc.type].class &&
              <TextField
                id="class"
                label="Class"
                defaultValue={doc && doc.class}
                className={classes.dialogField}
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

              {/*Always allow file upload*/}
              <InputLabel style={{ fontSize: 12, }}>Upload Scanned Image</InputLabel>
              <label>
                <UploadIcon className={classes.accentButton} />
                <input id='attr_upload_file' type='file' style={{display: 'none'}} onChange={e =>
                {this.props.onUploadFile({
                  file: e.currentTarget.files[0],
                  storagePath: 'attr/' + auth.currentUser.displayName.replace(/\s+/g, '') + '/' + doc.type + '_',
                  })
                }
                } />
                <LinearProgress variant="determinate" value={modalProps.uploadProgress} />
              </label>
            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.hideModal} color="secondary">Cancel</Button>
          {modalProps.isUploading ? <Button color="primary" disabled >Submit</Button>
          : <Button onClick={() => {
            this.props.handleModalSubmit({
            doc: doc,
            pathRef: usersRef.doc(modalProps.userPath).collection("attr"),
          })
          }
        } color="primary" >Submit</Button>}
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(UserAttrModal));
