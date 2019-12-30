import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { TEMPLATE_ACM } from "../../../constants/modal-types";
import { sitesRef, storage, templateAcmRef, } from "../../../config/firebase";
import "../../../config/tags.css";

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
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
// import Geosuggest from 'react-geosuggest';
import ImageUploader from 'react-images-upload';
import ImageTools from '../../../config/ImageTools';
import SuggestionField from '../../../widgets/SuggestionField';

import UploadIcon from "@material-ui/icons/CloudUpload";
import Go from '@material-ui/icons/ArrowForwardIos';
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  resetModal,
  onUploadFile,
  setModalError,
} from "../../../actions/modal";
import { fetchSites, getDetailedWFMJob, } from '../../../actions/jobs';
import { getUserAttrs, } from "../../../actions/local";
import { sendSlackMessage, } from '../../../actions/helpers';
import _ from "lodash";
import classNames from 'classnames';

import '../../../config/geosuggest.css';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    asbestosMaterialCategories: state.const.asbestosMaterialCategories,
    materialSuggestions: state.const.materialSuggestions,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSites: update => dispatch(fetchSites(update)),
    hideModal: () => dispatch(hideModal()),
    setModalError: e => dispatch(setModalError(e)),
    resetModal: () => dispatch(resetModal()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    onUploadFile: (file, pathRef, prefix, imageQuality) => dispatch(onUploadFile(file, pathRef, prefix, imageQuality)),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
  };
};

class TemplateAcmModal extends React.Component {
  state = {
  };

  deleteImage = () => {
    storage.ref(this.state.acmImageRef).delete();
    this.setState({acmImageUrl: null, acmImageRef: null});
  };

  loadTemplate = () => {
    if (this.props.doc) {
      this.setState({
        ...this.props.doc,
      })
    }
  }

  render() {
    const { modalProps, doc, classes } = this.props;
    return (
      <Dialog
        open={this.props.modalType === TEMPLATE_ACM}
        onClose={this.props.hideModal}
        onLoad={this.loadTemplate}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add ACM Template"}
        </DialogTitle>
        <DialogContent>
          <InputLabel>Item Description</InputLabel>
          <SuggestionField that={this} suggestions='descriptionSuggestions'
            defaultValue={this.state.description ? this.state.description : ''}
            onModify={value => this.setState({ description: value})} />
          <InputLabel className={classes.marginTop}>Material</InputLabel>
          <SuggestionField that={this} suggestions='materialSuggestions'
            defaultValue={this.state.material ? this.state.material : ''}
            onModify={(value) => {
              let category = '';
              let materialObj = Object.values(this.props.materialSuggestions).filter(e => e.label === value);
              if (materialObj.length > 0) {
                category = materialObj[0].category;
              }
              this.setState({material: value.trim(), category});
            }}
          />
          <InputLabel className={classes.marginTopSmall}>Material Category</InputLabel>
          <Select
            className={classes.selectTight}
            value={this.state.category ? {value: this.state.category, label: this.state.category} : {value: '', label: ''}}
            options={this.props.asbestosMaterialCategories.map(e => ({ value: e.label, label: e.label }))}
            onChange={e => {
              this.setState({category: e.value});
            }}
          />

          <InputLabel className={classes.marginTopSmall} className={classes.marginTop}>
            Thumbnail Image
          </InputLabel>
          {this.state.siteImageUrl && (
            <div className={classes.marginTopSmall}>
              <img
                src={this.state.acmImageUrl}
                alt=""
                width="200px"
                style={{
                  opacity: "0.5",
                  borderStyle: "solid",
                  borderWidth: "2px"
                }}
              />
              <IconButton
                style={{
                  position: "relative",
                  top: "2px",
                  left: "-120px",
                  borderStyle: "solid",
                  borderWidth: "2px",
                  fontSize: 8
                }}
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you wish to delete the image?"
                    )
                  )
                    this.deleteImage();
                }}
              >
                <Close />
              </IconButton>
            </div>
          )}
          <label>
            <UploadIcon className={classNames(classes.hoverCursor, classes.colorAccent)} />
            <input
              id="attr_upload_file"
              type="file"
              style={{ display: "none" }}
              onChange={e => {
                if (this.state.acmImageUrl) {
                  storage.ref(this.state.acmImageRef).delete();
                }
                this.props.onUploadFile({
                  file: e.currentTarget.files[0],
                  storagePath: "sites/",
                  prefix: 'siteImage',
                  imageQuality: 30,
                  imageHeight: 100,
                });
              }}
            />
            <LinearProgress
              className={classes.formInputLarge}
              variant="determinate"
              value={modalProps.uploadProgress}
            />
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.resetModal} color="secondary">Cancel</Button>
          <Button onClick={this.props.handleModalSubmit({ doc: this.state, pathRef: templateAcmRef, docid: 'random' })} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TemplateAcmModal)
);
