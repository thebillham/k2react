import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { DOWNLOAD_LAB_CERTIFICATE } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import { hideModal, handleModalChange } from "../../../actions/modal";
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
    fileType: this.props.modalProps.defaultFileType ? this.props.modalProps.defaultFileType : "doc",
    certificateType: this.props.modalProps.defaultCertificateType ? this.props.modalProps.defaultCertificateType : "bulk",
    template: "single",
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    return (modalType === DOWNLOAD_LAB_CERTIFICATE &&
      <Dialog
        open={modalType === DOWNLOAD_LAB_CERTIFICATE}
        onClose={this.props.hideModal}
      >
        <DialogTitle>Download Lab Certificate</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Certificate</FormLabel>
            <RadioGroup
              aria-label="Certificate"
              name="certificate"
              className={classes.group}
              value={this.state.certificateType}
              onChange={event => {
                let template = this.state.template;
                if (event.target.value === "wa") template = "single";
                this.setState({
                  certificateType: event.target.value,
                  template,
                });
              }}
            >
              <FormControlLabel value="bulk" control={<Radio />} label="Bulk ID" />
              <FormControlLabel value="wa" control={<Radio disabled={!modalProps.report.waAnalysis} />} label="WA Analysis" />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Template</FormLabel>
            <RadioGroup
              aria-label="Template"
              name="template"
              className={classes.group}
              value={this.state.template}
              onChange={event => this.setState({
                template: event.target.value,
              })}
            >
              <FormControlLabel value="single" control={<Radio />} label="Single Page Appendable" />
              <FormControlLabel value="cover" control={<Radio disabled={this.state.certificateType !== 'bulk'} />} label="Lab Report with Cover Letter" />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">File Type</FormLabel>
            <RadioGroup
              aria-label="File Type"
              name="filetype"
              className={classes.group}
              // value={this.state.value}
              value={'doc'}
              onChange={event => this.setState({
                fileType: event.target.value,
              })}
            >
              <FormControlLabel value="pdf" control={<Radio disabled />} label="PDF" />
              <FormControlLabel value="doc" control={<Radio disabled />} label="Word Document" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <form method="post" target="_blank" action={"https://api.k2.co.nz/v1/doc/scripts/asbestos/issue/" + this.state.certificateType + "/doc.php?template=" + this.state.template + "&filetype=" + this.state.fileType}>
            <input type="hidden" name="data" value={JSON.stringify(modalProps.report)} />
            <Button type="submit">Download</Button>
          </form>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DownloadLabCertificateModal)
);
