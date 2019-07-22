import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";

import { DOCUMENT } from "../../../constants/modal-types";
import { docsRef, storage } from "../../../config/firebase";
import "../../../config/tags.css";
import { sendSlackMessage } from "../../../Slack";

import { RichEditor } from "../../editor/RichEditor";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import ReactRichEditor from 'react-rich-text-editor'
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

import UploadIcon from "@material-ui/icons/CloudUpload";

import {
  hideModal,
  showModal,
  handleModalChange,
  handleModalChangeStep,
  handleModalSubmit,
  onUploadFile,
  handleTagAddition,
  handleTagDelete
} from "../../../actions/modal";
import { getUserAttrs } from "../../../actions/local";
import _ from "lodash";

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
    categories: state.const.documentcategories
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserAttrs: _.debounce(
      userPath => dispatch(getUserAttrs(userPath)),
      1000
    ),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleModalChangeStep: target => dispatch(handleModalChangeStep(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    hideModal: () => dispatch(hideModal()),
    showModal: modal => dispatch(showModal(modal)),
    handleTagDelete: tag => dispatch(handleTagDelete(tag)),
    handleTagAddition: tag => dispatch(handleTagAddition(tag)),
    onUploadFile: (file, pathRef) => dispatch(onUploadFile(file, pathRef))
  };
};

class DocumentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      editorState: {}
    };
  }

  componentWillMount = () => {
    if (this.props.doc.content) {
      this.setState({
        editorState: {
          ...this.state.editorState,
          single: this.convertToDraft(this.props.doc.content)
        }
      });
    }
  };

  convertToDraft = html => {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      console.log(EditorState.createWithContent(contentState));
      return EditorState.createWithContent(contentState);
    } else {
      return EditorState.createEmpty();
    }
  };

  getStyles = (uid, list) => {
    return {
      fontWeight:
        list && list.constructor === Array && list.indexOf(uid) > -1 ? 600 : 200
    };
  };

  sendNewAttrSlack = () => {
    let message = {
      text: `${this.props.modalProps.staffName} has added a new module.\n${
        this.props.qualificationtypes[this.props.doc.type].name
      }`
    };
    sendSlackMessage(message, true);
  };

  getPage = () => {
    const { modalProps, doc, classes } = this.props;
    const { editorState, page } = this.state;
    // const staff = { ...this.props.staff, [this.props.me.uid]: this.props.me };

    const headerpage = (
      <form>
        <FormGroup>
          <FormControl className={classes.dialogField}>
            <InputLabel shrink>Document Type</InputLabel>
            <Select
              onChange={e => {
                if (e.target.value === "Multi Page" && !doc.steps)
                  doc.steps = {};
                this.props.handleModalChange({
                  id: "docType",
                  value: e.target.value
                });
              }}
              value={(doc && doc.docType) || "PDF"}
              input={<Input name="docType" id="docType" />}
            >
              {[
                "Link",
                "PDF",
                "Image",
                "File",
                "Single Page",
                "Multi Page"
              ].map(type => {
                return (
                  <option key={type} value={type}>
                    {type}
                  </option>
                );
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.dialogField}>
            <InputLabel shrink>Document Category</InputLabel>
            <Select
              onChange={e => {
                this.props.handleModalChange({
                  id: "category",
                  value: e.target.value
                });
              }}
              value={(doc && doc.category) || "gen"}
              input={<Input name="category" id="category" />}
            >
              {this.props.categories &&
                this.props.categories.map(cat => {
                  return (
                    <option key={cat.key} value={cat.key}>
                      {cat.desc}
                    </option>
                  );
                })}
            </Select>
          </FormControl>
          <InputLabel shrink>Tags</InputLabel>
          {this.props.tagSuggestions && doc.tags && (
            <ReactTags
              tags={doc.tags}
              suggestions={this.props.tagSuggestions}
              handleDelete={this.props.handleTagDelete}
              handleAddition={this.props.handleTagAddition}
              delimiters={this.props.delimiters}
              handleFilterSuggestions={(
                textInputValue,
                possibleSuggestionsArray
              ) => {
                var lowerCaseQuery = textInputValue.toLowerCase();
                return possibleSuggestionsArray.filter(suggestion => {
                  return suggestion.text.toLowerCase().includes(lowerCaseQuery);
                });
              }}
              minQueryLength={1}
              inline={true}
              allowDragDrop={false}
              allowDeleteFromEmptyInput={false}
              autofocus={false}
              autocomplete={true}
            />
          )}
          {doc.docType === "Link" && (
            <TextField
              id="link"
              label="Link"
              multiline
              className={classes.dialogField}
              defaultValue={(doc && doc.link) || ""}
              helperText="Enter the full web link."
              onChange={e => {
                this.props.handleModalChange(e.target);
              }}
            />
          )}
          <TextField
            id="title"
            label="Title"
            className={classes.dialogField}
            defaultValue={(doc && doc.title) || ""}
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="subtitle"
            label="Subtitle"
            className={classes.dialogField}
            defaultValue={(doc && doc.subtitle) || ""}
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="code"
            label="Code"
            className={classes.dialogField}
            defaultValue={(doc && doc.code) || ""}
            helperText="Code or reference number (e.g. AS/NZS 1715:2009)"
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="author"
            label="Author"
            className={classes.dialogField}
            defaultValue={(doc && doc.author) || ""}
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="publisher"
            label="Publisher"
            className={classes.dialogField}
            defaultValue={(doc && doc.publisher) || ""}
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="date"
            label="Date Published"
            type="date"
            defaultValue={doc && doc.date}
            className={classes.dialogField}
            helperText="Enter the date of first publishing."
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id="updateDate"
            label="Date of Last Update"
            type="date"
            defaultValue={doc && doc.updateDate}
            className={classes.dialogField}
            helperText="Enter the date of the last update."
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id="desc"
            label="Description"
            multiline
            className={classes.dialogField}
            defaultValue={(doc && doc.desc) || ""}
            helperText="Give a description of the purpose of the document."
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="source"
            label="Source"
            multiline
            className={classes.dialogField}
            defaultValue={doc && doc.source}
            helperText="Enter the source of the document, e.g. the website address."
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          <TextField
            id="references"
            label="References"
            multiline
            className={classes.dialogField}
            defaultValue={(doc && doc.references) || ""}
            helperText="List any links or references this document is based on."
            onChange={e => {
              this.props.handleModalChange(e.target);
            }}
          />
          {doc.docType === "Single Page" && (
            <div>
              <InputLabel shrink>Content</InputLabel>
              {/*<SlateEditor />*/}
              <RichEditor
                editorState={editorState["single"]}
                onEditorStateChange={changedState => {
                  this.setState({
                    editorState: {
                      ...editorState,
                      single: changedState
                    }
                  });
                  let html = draftToHtml(
                    convertToRaw(changedState.getCurrentContent())
                  );
                  this.props.handleModalChange({ id: "content", value: html });
                }}
              />

              {/*<TextField
               id="html"
               label="HTML"
               multiline
               fullWidth
               style={{ marginBottom: 12, }}
               value={doc.content || ''}
               onChange={e => this.props.handleModalChange({id: 'content', value: e.target.value})}
             />*/}
            </div>
          )}

          {(doc.docType === "PDF" ||
            doc.docType === "File" ||
            doc.docType === "Image") && (
            <label>
              <UploadIcon className={classes.accentButton} />
              <input
                id="attr_upload_file"
                type="file"
                style={{ display: "none" }}
                onChange={e => {
                  if (doc.fileUrl) {
                    storage.ref(doc.fileRef).delete();
                  }
                  this.props.onUploadFile({
                    file: e.currentTarget.files[0],
                    storagePath: "documents/"
                  });
                }}
              />
              <LinearProgress
                variant="determinate"
                value={modalProps.uploadProgress}
              />
            </label>
          )}
        </FormGroup>
      </form>
    );

    const contentpage = (
      <form>
        <h5>Page {page - 1}</h5>
        <TextField
          id="title"
          label="Title"
          style={{ marginBottom: 12 }}
          value={
            (doc.steps && doc.steps[page - 2] && doc.steps[page - 2].title) ||
            ""
          }
          onChange={e =>
            this.props.handleModalChangeStep({
              step: (page - 2).toString(),
              id: "title",
              value: e.target.value
            })
          }
        />
        <ReactRichEditor
          height={200}
          showAll={true}
        />
        {/*<RichEditor
          editorState={editorState[page - 2]}
          onEditorStateChange={changedState => {
            this.setState({
              editorState: {
                ...editorState,
                [page - 2]: changedState
              }
            });
            let html = draftToHtml(
              convertToRaw(changedState.getCurrentContent())
            );
            console.log(html);
            this.props.handleModalChangeStep({
              step: page - 2,
              id: "content",
              value: html
            });
          }}
        />*/}
        <textarea
          readOnly
          style={{ width: 800 }}
          value={
            editorState[page - 2] &&
            draftToHtml(convertToRaw(editorState[page - 2].getCurrentContent()))
          }
        />
      </form>
    );

    switch (this.state.page) {
      case 1:
        return headerpage;
      default:
        return contentpage;
    }
  };

  render() {
    const { modalProps, doc } = this.props;

    return (
      <Dialog
        key="documentmodal"
        maxWidth="md"
        fullWidth={true}
        open={this.props.modalType === DOCUMENT}
        onEnter={() => this.setState({ page: 1 })}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Document"}
        </DialogTitle>
        <DialogContent>{this.getPage()}</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="secondary"
          >
            Cancel
          </Button>
          {doc.docType === "Multi Page" && (
            <div>
              <Button
                disabled={this.state.page === 1}
                onClick={() => {
                  this.setState({ page: this.state.page - 1 });
                }}
                color="default"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!this.state.editorState[this.state.page - 1]) {
                    if (
                      doc.steps &&
                      doc.steps[this.state.page - 1] &&
                      doc.steps[this.state.page - 1].content
                    ) {
                      this.setState({
                        editorState: {
                          ...this.state.editorState,
                          [this.state.page - 1]: this.convertToDraft(
                            doc.steps[this.state.page - 1].content
                          )
                        }
                      });
                    } else {
                      this.setState({
                        editorState: {
                          ...this.state.editorState,
                          [this.state.page - 1]: EditorState.createEmpty()
                        }
                      });
                    }
                  }
                  this.setState({ page: this.state.page + 1 });
                }}
                color="default"
              >
                Forward
              </Button>
            </div>
          )}
          {modalProps.isUploading ? (
            <Button color="primary" disabled>
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (!doc.date) {
                  doc.date = new Date();
                }
                if (doc.steps) {
                  // fill in missing labels, remove missing pages
                  let pages = {};
                  let i = 1;
                  Object.values(doc.steps).forEach(step => {
                    if (!step.title) step.title = "Page " + i;
                    pages[i - 1] = step;
                    i = i + 1;
                  });
                  doc.steps = pages;
                }
                if (!doc.uid) {
                  if (doc.title) {
                    doc.uid = doc.title
                      .replace(/\s+|\/+|\\+\:+\;+\.+/g, "-")
                      .toLowerCase();
                  } else {
                    doc.uid =
                      doc.docType +
                      Math.round(Math.random() * 1000000).toString();
                  }
                }
                if (doc.fileUrl) doc.link = doc.fileUrl;
                this.props.handleModalSubmit({
                  doc: doc,
                  pathRef: docsRef
                });
                // this.sendNewAttrSlack();
              }}
              color="primary"
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DocumentModal)
);
