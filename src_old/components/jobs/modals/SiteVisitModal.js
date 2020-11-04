import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { SITE_VISIT } from "../../../constants/modal-types";
import { sitesRef, storage } from "../../../config/firebase";
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
import IconButton from "@material-ui/core/IconButton";
import { DatePicker, DateTimePicker } from "@material-ui/pickers";
import Select from "react-select";

import UploadIcon from "@material-ui/icons/CloudUpload";
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  resetModal,
  handleModalChange,
  handleModalSubmit,
  onUploadFile
} from "../../../actions/modal";
import { fetchSites } from "../../../actions/jobs";
import { getUserAttrs } from "../../../actions/local";
import {
  sendSlackMessage,
  numericOnly,
  dateOf,
  personnelConvert
} from "../../../actions/helpers";
import _ from "lodash";
import classNames from "classnames";

import "../../../config/geosuggest.css";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    staff: state.local.staff,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    siteJobs: state.jobs.siteJobs,
    siteTypes: state.const.siteTypes,
    assetClasses: state.const.assetClassesTrain,
    siteVisitTypeAsbestos: state.const.siteVisitTypeAsbestos
  };
};

const mapDispatchToProps = dispatch => {
  return {
    resetModal: () => dispatch(resetModal()),
    hideModal: () => dispatch(hideModal())
  };
};

class SiteVisitModal extends React.Component {
  state = {
    date: null
  };

  loadProps = () => {
    this.setState({
      ...this.props.doc
    });
  };

  render() {
    const { modalProps, doc, classes, siteTypes, assetClasses } = this.props;
    const names = [{ name: "3rd Party", uid: "3rd Party" }].concat(
      Object.values(this.props.staff).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    console.log(this.state);
    return (
      <Dialog
        open={this.props.modalType === SITE_VISIT}
        onEnter={this.loadProps}
        onClose={this.props.resetModal}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Site Visit"}
        </DialogTitle>
        <DialogContent className={classes.minHeightDialog60}>
          <DatePicker
            className={classes.inputRoot}
            value={this.state.date ? dateOf(this.state.date) : null}
            autoOk
            format="ddd, D MMMM YYYY"
            label={"Date"}
            disableToolbar
            variant="inline"
            openTo="year"
            views={["year", "month", "date"]}
            onChange={date => this.setState({ date: dateOf(date) })}
          />
          <InputLabel className={classes.marginTopSmall}>
            Site Personnel
          </InputLabel>
          <Select
            isMulti
            className={classes.selectTight}
            value={
              this.state.personnel
                ? this.state.personnel.map(e => ({
                    value: e.uid,
                    label: e.name
                  }))
                : null
            }
            options={names.map(e => ({
              value: e.uid,
              label: e.name
            }))}
            onChange={e => this.setState({ personnel: personnelConvert(e) })}
          />
          {this.state.personnel &&
            this.state.personnel[0].uid === "3rd Party" && (
              <TextField
                label="3rd Party Company Name"
                defaultValue={
                  this.state.companyName ? this.state.companyName : null
                }
                onChange={e => this.setState({ companyName: e.target.value })}
              />
            )}
          <InputLabel>Site Visit Type</InputLabel>
          <Select
            className={classes.selectTight}
            value={
              this.state.type
                ? {
                    value: this.state.type,
                    label: this.props.siteVisitTypeAsbestos.filter(
                      e => e.value === this.state.type
                    )[0].label
                  }
                : null
            }
            options={this.props.siteVisitTypeAsbestos}
            onChange={e => this.setState({ type: e.value })}
          />
          {this.state.personnel &&
          this.state.personnel[0].uid === "3rd Party" ? (
            <TextField
              className={classes.inputRoot}
              label="Reference/Job Number"
              defaultValue={
                this.state.referenceNumber ? this.state.referenceNumber : null
              }
              onChange={e => this.setState({ referenceNumber: e.target.value })}
            />
          ) : (
            <div>
              <InputLabel>Job Number</InputLabel>
              <Select
                placeholder={"Add Job Numbers from Home Screen"}
                className={classes.selectTight}
                value={
                  this.state.referenceNumber
                    ? {
                        value: this.state.referenceNumber,
                        label: this.state.referenceNumber
                      }
                    : null
                }
                options={
                  this.props.siteJobs &&
                  this.props.siteJobs[modalProps.siteUid] &&
                  Object.values(this.props.siteJobs[modalProps.siteUid]).map(
                    e => ({
                      value: e.jobNumber,
                      label: `${e.jobNumber}: ${e.jobDescription}`
                    })
                  )
                }
                onChange={e => this.setState({ referenceNumber: e.value })}
              />
            </div>
          )}
          <TextField
            label="Notes"
            className={classes.inputRoot}
            defaultValue={this.state.notes ? this.state.notes : null}
            multiline
            rows={5}
            onChange={e => this.setState({ notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.resetModal} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              modalProps.callBack(this.state);
              this.props.resetModal();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SiteVisitModal)
);
