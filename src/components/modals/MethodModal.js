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

// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from 'react-froala-wysiwyg';

// import store from '../../store';
import { METHOD, UPDATEMETHODVERSION } from '../../constants/modal-types';
import { methodsRef, } from '../../config/firebase';
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
import Grid from '@material-ui/core/Grid';

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import {
  hideModal, showModal, handleModalChange, handleModalChangeStep, handleModalSubmit, onUploadFile } from '../../actions/modal';
import { getUserAttrs } from '../../actions/local';
import _ from 'lodash';

// Quill.register('modules/imageResize', ImageResize);
// Quill.register('modules/imageDrop', ImageDrop);


const mapStateToProps = state => {
  return {
    delimiters: state.const.tagDelimiters,
    doc: state.modal.modalProps.doc,
    documents: state.local.documents,
    methods: state.local.methods,
    me: state.local.me,
    quizzes: state.local.quizzes,
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
    showModal: modal => dispatch(showModal(modal)),
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

class MethodModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      page: 1,
    }
  }

  getStyles = (uid, list) => {
    return {
      fontWeight:
        list && (list.constructor === Array) && list.indexOf(uid) > -1
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

  getPage = () => {
    const { modalProps, doc, classes } = this.props;
    const staff = { ...this.props.staff, [this.props.me.uid]: this.props.me };

    const headerpage = (
      <form>
        <FormGroup>
          <TextField
            id="title"
            label="Title"
            className={classes.dialogField}
            defaultValue={doc && doc.title}
            onChange={e => {this.props.handleModalChange(e.target)}}
          />
          <TextField
            id="subtitle"
            label="Subtitle"
            className={classes.dialogField}
            defaultValue={doc && doc.subtitle}
            onChange={e => {this.props.handleModalChange(e.target)}}
          />
          <TextField
            id="tmCode"
            label="TM Code"
            className={classes.dialogField}
            defaultValue={doc && doc.tmCode}
            helperText='e.g. TM 4.21-17 Part 1'
            onChange={e => {this.props.handleModalChange(e.target)}}
          />
          <FormControl className={classes.dialogField}>
            <InputLabel shrink>Prepared By</InputLabel>
            <Select
              onChange={e => {this.props.handleModalChange({id: 'preparedBy', value: e.target.value})}}
              value={doc && doc.preparedBy}
              input={<Input name='preparedBy' id='preparedBy' />}
            >
              <option value='' />
              { staff && Object.values(staff).map((staff) => {
                return(
                  <option key={staff.uid} value={staff.name}>{staff.name}</option>
                );
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel shrink>Checked By</InputLabel>
            <Select
              onChange={e => {this.props.handleModalChange({id: 'checkedBy', value: e.target.value})}}
              value={doc && doc.checkedBy}
              input={<Input name='checkedBy' id='checkedBy' />}
            >
              <option value='' />
              { staff && Object.values(staff).map((staff) => {
                return(
                  <option key={staff.uid} value={staff.name}>{staff.name}</option>
                );
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel shrink>Document Controller</InputLabel>
            <Select
              onChange={e => {this.props.handleModalChange({id: 'documentController', value: e.target.value})}}
              value={doc && doc.documentController}
              input={<Input name='documentController' id='documentController' />}
            >
              <option value='' />
              { staff && Object.values(staff).map((staff) => {
                return(
                  <option key={staff.uid} value={staff.name}>{staff.name}</option>
                );
              })}
            </Select>
          </FormControl>
          <InputLabel style={{ fontSize: 12, marginTop: 4 }}>Current Version</InputLabel>
          { `${doc.version}.${doc.patch}`}
        </FormGroup>
      </form>
    );

    const contentpage = (
      <form>
        <h5>Section {this.state.page-1}</h5>
        <TextField
          id="title"
          label="Title"
          fullWidth
          style={{ marginBottom: 12, }}
          value={doc.steps && doc.steps[this.state.page-2] && doc.steps[this.state.page-2].title || ''}
          onChange={e => this.props.handleModalChangeStep({step: (this.state.page-2).toString(), id: 'title', value: e.target.value})}
        />
        {/*<FroalaEditor
          config={{
            placeholderText: 'Edit Your Content Here!',
            charCounterCount: false
          }}
          model={doc.steps && doc.steps[this.state.page-2] && doc.steps[this.state.page-2].content || ''}
          onModelChange={value => this.props.handleModalChangeStep({step: (this.state.page-2).toString(), id: 'content', value: value})}
        />*/}

        <ReactQuill
          value={doc.steps && doc.steps[this.state.page-2] && doc.steps[this.state.page-2].content || ''}
          modules={quillModules}
          theme='snow'
          onChange={(content, delta, source) => {if (source === 'user') this.props.handleModalChangeStep({step: (this.state.page-2).toString(), id: 'content', value: content})}}
          style={{ marginBottom: 16, }}
          />
        <TextField
          id="html"
          label="HTML"
          multiline
          fullWidth
          style={{ marginBottom: 12, }}
          value={doc.steps && doc.steps[this.state.page-2] && doc.steps[this.state.page-2].content || ''}
          onChange={e => this.props.handleModalChangeStep({step: (this.state.page-2).toString(), id: 'content', value: e.target.value})}
        />
      </form>
    );

    switch (this.state.page) {
      case 1:
        return headerpage;
        break;
      default:
        return contentpage;
    }
  }

  render() {
    const { modalProps, doc, classes } = this.props;

    return(
      <Dialog
        key='methodmodal'
        open={ this.props.modalType === METHOD }
        onEnter={() => this.setState({ page: 1, })}
        onClose = {() => this.props.hideModal}
        >
        <DialogTitle>{ modalProps.title ? modalProps.title : 'Add New K2 Method' }</DialogTitle>
        <DialogContent>
         { this.getPage() }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { this.props.hideModal() }} color="secondary">Cancel</Button>
          <Button disabled={this.state.page === 1} onClick={() => { this.setState({ page: this.state.page - 1}) }} color="default">Back</Button>
          <Button onClick={() => { this.setState({ page: this.state.page + 1}) }} color="default">Forward</Button>
          <Button onClick={() => {
            let i = 1;
            doc.steps && Object.values(doc.steps).forEach(step => {
              if (!step.title) step.title = 'Section ' + i;
              i = i + 1;
            });
            if (!doc.uid) {
              if (doc.tmCode) {
                doc.uid = doc.tmCode.replace(/\s+/g, '-').toUpperCase();
              } else if (doc.title) {
                doc.uid = doc.title.replace(/\s+/g, '-').toLowerCase();
              } else {
                doc.uid = Math.round(Math.random() * 1000000).toString();
              }
              this.props.handleModalSubmit({
                doc: doc,
                pathRef: methodsRef,
              });
            } else {
              this.props.handleModalSubmit({
                doc: doc,
                pathRef: methodsRef,
              });
              // this.props.showModal({ modalType: UPDATEMETHODVERSION, modalProps: { doc: doc, } });
            }
            // this.sendNewAttrSlack();
          }
        } color="primary" >Submit</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(MethodModal));
