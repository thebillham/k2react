import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../config/styles";
import { connect } from "react-redux";
import store from "../../store";
import { DOWNLOADLABCERTIFICATE } from "../../constants/modal-types";
import { docsRef } from "../../config/firebase";
import "../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import LinearProgress from "@material-ui/core/LinearProgress";
import UploadIcon from "@material-ui/icons/CloudUpload";
import { hideModal, handleModalChange } from "../../actions/modal";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
  };
};

class DownloadLabCertificateModal extends React.Component {
  state = {
    fileType: "doc",
    template: "single",
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    return (
      <Dialog
        open={modalType === DOWNLOADLABCERTIFICATE}
        onClose={() => this.props.hideModal()}
      >
        <DialogTitle>Download Lab Certificate</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Template</FormLabel>
            <RadioGroup
              aria-label="Template"
              name="template"
              className={classes.group}
              value={this.state.value}
              onChange={event => this.setState({
                template: event.target.value,
              })}
            >
              <FormControlLabel value="single" control={<Radio />} label="Single Page Appendable" />
              <FormControlLabel value="cover" control={<Radio />} label="Lab Report with Cover Letter" />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">File Type</FormLabel>
            <RadioGroup
              aria-label="File Type"
              name="filetype"
              className={classes.group}
              value={this.state.value}
              onChange={event => this.setState({
                fileType: event.target.value,
              })}
            >
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              <FormControlLabel value="doc" control={<Radio />} label="Word Document" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              let url =
                "http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/" + this.state.template + "/" + this.state.fileType +
                ".php?report=" + JSON.stringify(modalProps.report);
              url =
                "http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=" +
                JSON.stringify(modalProps.report);
              window.open(url);
              this.props.hideModal();
            }}
            color="primary"
          >
            Download
          </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DownloadLabCertificateModal)
);
