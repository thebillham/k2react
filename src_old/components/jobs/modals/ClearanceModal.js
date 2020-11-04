import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { ASBESTOS_CLEARANCE } from "../../../constants/modal-types";
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
import SuggestionField from "../../../widgets/SuggestionField";
import Select from "react-select";
import { DatePicker, DateTimePicker } from "@material-ui/pickers";

import UploadIcon from "@material-ui/icons/CloudUpload";
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  onUploadFile,
  resetModal
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
    doc: state.modal.modalProps.doc,
    staff: state.local.staff,
    userRefName: state.local.userRefName,
    siteTypes: state.const.siteTypes,
    siteJobs: state.jobs.siteJobs,
    assetClasses: state.const.assetClassesTrain
  };
};

const mapDispatchToProps = dispatch => {
  return {
    resetModal: () => dispatch(resetModal())
  };
};

class ClearanceModal extends React.Component {
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
    return (
      <Dialog
        open={this.props.modalType === ASBESTOS_CLEARANCE}
        onEnter={this.loadProps}
        onClose={this.props.resetModal}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add New Asbestos Removal"}
        </DialogTitle>
        <DialogContent className={classes.minHeightDialog60}>
          <InputLabel>Asbestos Removalist</InputLabel>
          <SuggestionField
            that={this}
            suggestions="asbestosRemovalists"
            defaultValue={doc.asbestosRemovalist || ""}
            onModify={value => {
              let asbestosRemovalistLicence =
                this.state.asbestosRemovalistLicence || null;
              if (
                this.props.asbestosRemovalists &&
                this.props.asbestosRemovalists.filter(e => e.label === value)
                  .length > 0
              )
                asbestosRemovalistLicence = this.props.asbestosRemovalists.filter(
                  e => e.label === value
                )[0].value;
              this.setState({
                asbestosRemovalist: value,
                asbestosRemovalistLicence
              });
            }}
          />
          <TextField
            label="Asbestos Removalist Licence Number"
            value={this.state.asbestosRemovalistLicence || ""}
            onChange={e =>
              this.setState({ asbestosRemovalistLicence: e.target.value })
            }
          />
          <div>
            <DatePicker
              className={classes.inputRoot}
              value={
                this.state.removalDate ? dateOf(this.state.removalDate) : null
              }
              autoOk
              disableToolbar
              variant="inline"
              format="ddd, D MMMM YYYY"
              label={"Removal Completion Date"}
              views={["year", "month", "date"]}
              openTo="year"
              onChange={date => this.setState({ removalDate: dateOf(date) })}
            />
          </div>
          <TextField
            className={classes.inputRoot}
            label="Description of Removal"
            multiline
            rows={3}
            defaultValue={this.state.description || ""}
            onChange={e => this.setState({ description: e.target.value })}
          />
          <div>
            <DatePicker
              className={classes.inputRoot}
              value={
                this.state.clearanceDate
                  ? dateOf(this.state.clearanceDate)
                  : null
              }
              autoOk
              disableToolbar
              variant="inline"
              format="ddd, D MMMM YYYY"
              label={"Clearance Inspection Date"}
              views={["year", "month", "date"]}
              openTo="year"
              onChange={date => this.setState({ clearanceDate: dateOf(date) })}
            />
          </div>
          <InputLabel className={classes.marginTopSmall}>
            Asbestos Assessor
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
                className={classes.inputRoot}
                label="Assessor Number"
                defaultValue={this.state.asbestosAssessorLicence || ""}
                onChange={e =>
                  this.setState({ asbestosAssessorLicence: e.target.value })
                }
              />
            )}
          {this.state.personnel &&
          this.state.personnel[0].uid === "3rd Party" ? (
            <TextField
              className={classes.inputRoot}
              label="Reference/Job Number"
              defaultValue={this.state.referenceNumber || null}
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
          <div>
            <DatePicker
              className={classes.inputRoot}
              value={this.state.issueDate ? dateOf(this.state.issueDate) : null}
              autoOk
              disableToolbar
              variant="inline"
              format="ddd, D MMMM YYYY"
              label={"Certificate Issue Date"}
              views={["year", "month", "date"]}
              openTo="year"
              onChange={date => this.setState({ issueDate: dateOf(date) })}
            />
          </div>
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
  )(ClearanceModal)
);
