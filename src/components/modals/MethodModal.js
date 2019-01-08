import React from 'react';
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';

import { RichEditor } from '../editor/RichEditor';
import { EditorState, ContentState, convertToRaw, } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

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
import Add from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';
import {
  hideModal, showModal, handleModalChange, handleModalChangeStep, handleModalSubmit, onUploadFile, handleGlossaryChange, } from '../../actions/modal';
import { getUserAttrs } from '../../actions/local';
import _ from 'lodash';

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
    handleGlossaryChange: (number, type, value) => dispatch(handleGlossaryChange(number, type, value)),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    hideModal: () => dispatch(hideModal()),
    showModal: modal => dispatch(showModal(modal)),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef)),
  };
};

class MethodModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      page: 1,
      editorState: {},
    }
  }

  convertToDraft = html => {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      console.log(EditorState.createWithContent(contentState))
      return EditorState.createWithContent(contentState);
    } else {
      return EditorState.createEmpty();
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
    const staff = Object.values({ ...this.props.staff, [this.props.me.uid]: this.props.me }).map(staff => staff.name).sort();

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
              { staff && staff.map(staff => {
                return(
                  <option key={staff} value={staff}>{staff}</option>
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
              { staff && staff.map(staff => {
                return(
                  <option key={staff} value={staff}>{staff}</option>
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
              { staff && staff.map(staff => {
                return(
                  <option key={staff} value={staff}>{staff}</option>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            id="referencemethod"
            label="Reference Method"
            fullWidth
            multiline
            style={{ marginBottom: 12, }}
            value={doc && doc.referencemethod || ''}
              onChange={e => {this.props.handleModalChange({id: 'referencemethod', value: e.target.value})}}
          />
          <TextField
            id="deviations"
            label="Deviations"
            fullWidth
            multiline
            style={{ marginBottom: 12, }}
            value={doc && doc.deviations || ''}
              onChange={e => {this.props.handleModalChange({id: 'deviations', value: e.target.value})}}
          />
          <InputLabel style={{ fontSize: 12, marginTop: 4 }}>Current Version</InputLabel>
          { `${doc.version}.${doc.patch}`}
        </FormGroup>
      </form>
    );

    const glossarypage = (
      <form>
        <h5>Glossary</h5>
        { Array.from(Array(doc.numberInGlossary ? doc.numberInGlossary : 10),(x, i) => i).map(i => {
        return(<Grid container key={i}>
        <Grid item xs={4}>
          <TextField
            id={`glossaryterm${i+1}`}
            style={{ width: '100%' }}
            defaultValue={doc && doc.glossary && doc.glossary[i+1] && doc.glossary[i+1].term}
            onChange={e => {this.props.handleGlossaryChange(i, 'term', e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={8} style={{ paddingLeft: 12, paddingRight: 12, }}>
          <TextField
            id={`glossarydefinition{i+1}`}
            multiline
            style={{ width: '100%' }}
            defaultValue={doc && doc.glossary && doc.glossary[i+1] && doc.glossary[i+1].definition}
            onChange={e => {this.props.handleGlossaryChange(i, 'definition', e.target.value);
            }}
          />
        </Grid>
      </Grid>
      )
    })
  }
    <Grid container>
      <Grid item xs={12} justify='center' alignItems='center'>
        <Button
          style={{ marginTop: 24, marginLeft: 128, }}
          onClick={ () => { this.props.handleModalChange({ id: 'numberInGlossary', value: doc.numberInGlossary ? doc.numberInGlossary + 10 : 20 }) }}>
          <Add style={{ marginRight: 12, }}/> Add More Terms
        </Button>
      </Grid>
    </Grid>
  </form>);

    const contentpage = (
      <form>
        <h5>Section {this.state.page-2}</h5>
        <TextField
          id="title"
          label="Title"
          fullWidth
          style={{ marginBottom: 12, }}
          value={doc.steps && doc.steps[this.state.page-3] && doc.steps[this.state.page-3].title || ''}
          onChange={e => this.props.handleModalChangeStep({step: (this.state.page-3).toString(), id: 'title', value: e.target.value})}
        />

        <RichEditor
          editorState={this.state.editorState[this.state.page-3]}
          onEditorStateChange={changedState => {
            this.setState({editorState: {
              ...this.state.editorState,
              [this.state.page-3]: changedState,
              }
            });
            let html = draftToHtml(convertToRaw(changedState.getCurrentContent()));
            this.props.handleModalChangeStep({step: (this.state.page-3).toString(), id: 'content', value: html})
          }}
        />

        <TextField
          id="html"
          label="HTML"
          multiline
          fullWidth
          style={{ marginBottom: 12, }}
          value={doc.steps && doc.steps[this.state.page-3] && doc.steps[this.state.page-3].content || ''}
          onChange={e => this.props.handleModalChangeStep({step: (this.state.page-3).toString(), id: 'content', value: e.target.value})}
        />
      </form>
    );

    switch (this.state.page) {
      case 1:
        return headerpage;
        break;
      case 2:
        return glossarypage;
      default:
        return contentpage;
    }
  }

  render() {
    const { modalProps, doc, classes } = this.props;

    return(
      <Dialog
        key='methodmodal'
        maxWidth = "md"
        fullWidth = { true }
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
          <Button onClick={() => {
            if (!this.state.editorState[this.state.page-1]) {
              if (doc.steps && doc.steps[this.state.page-1] && doc.steps[this.state.page-1].content) {
                this.setState({editorState: {
                  ...this.state.editorState,
                  [this.state.page-1]: this.convertToDraft(doc.steps[this.state.page-1].content),
                  }
                })
              } else {
                this.setState({editorState: {
                  ...this.state.editorState,
                  [this.state.page-1]: EditorState.createEmpty(),
                  }
                })
              }
            }
            this.setState({ page: this.state.page + 1}) }} color="default">Forward</Button>
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
