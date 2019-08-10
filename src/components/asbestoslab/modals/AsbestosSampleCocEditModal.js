import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { ASBESTOS_SAMPLE_EDIT_COC } from "../../../constants/modal-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Input from '@material-ui/core/Input';
import Checkbox from "@material-ui/core/Checkbox";

import Select from 'react-select';

import { SuggestionField } from '../../../widgets/SuggestionField';
import { hideModalSecondary, handleModalChange, } from "../../../actions/modal";
import { handleSampleChange } from '../../../actions/asbestosLab';
import { addLog, } from '../../../actions/local';

import {
  DatePicker,
} from "@material-ui/pickers";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalTypeSecondary,
    modalProps: state.modal.modalPropsSecondary,
    modalPropsMain: state.modal.modalProps,
    genericLocationSuggestions: state.const.genericLocationSuggestions,
    specificLocationSuggestions: state.const.specificLocationSuggestions,
    descriptionSuggestions: state.const.asbestosDescriptionSuggestions,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
    me: state.local.me,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModalSecondary()),
    handleModalChange: (target) => dispatch(handleModalChange(target)),
    handleSampleChange: (number, changes) => dispatch(handleSampleChange(number, changes)),
  };
};

const actionInit = {
  modified: false,
  sampleDelete: false,
  sampleDoSwap: false,
  sampleSwap: '',
}

const stateInit = {
  sample: {},
  doc: {},
  genericLocationSuggestions: [],
  specificLocationSuggestions: [],
  descriptionSuggestions: [],
  materialSuggestions: [],
}

class AsbestosSampleCocEditModal extends React.PureComponent {
  state = {...stateInit, ...actionInit};

  loadProps = () => {
    if (this.props.modalProps.doc) {
      this.setState({
        sample: this.props.modalProps.sample,
        doc: this.props.modalProps.doc,
      });
    }
  }

  saveAndHide = () => {
    console.log('Hiding');
    this.setState(stateInit);
    this.props.modalProps.onExit(this.state.modified);
    this.props.hideModal();
  }

  deleteSample = onComplete => {
    const { me } = this.props;
    const { doc, sample } = this.state;
    let log = {
      type: 'Delete',
      log: `Sample ${sample.jobNumber}-${sample.sampleNumber} (${sample.description} ${sample.material}) deleted.`,
      chainOfCustody: sample.cocUid,
      sample: sample.uid,
    };
    addLog("asbestosLab", log, me);

    // this.props.handleSampleChange(parseInt(sample.sampleNumber) - 1, {deleted: true});
    // Set sample DELETED flag to true
    let newSamples = {...doc.samples,
      [sample.sampleNumber]: {
        ...sample,
        deleted: true,
      }
    };
    // delete newSamples[this.state.sampleEditModal.sampleNumber];
    this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });
    this.setState({ modified: true });
    onComplete();
  }

  moveSample = onComplete => {
    const { me } = this.props;
    const { doc, sample } = this.state;
    let log = {
      type: 'ID Change',
      log: `Sample ${sample.jobNumber}-${sample.sampleNumber} (${sample.description} ${sample.material}) moved to sample number ${sample.jobNumber}-${this.state.sampleSwap}.`,
      chainOfCustody: sample.cocUid,
      sample: sample.uid,
    };
    addLog("asbestosLab", log, me);

    let newSamples = {...doc.samples,
      [this.state.sampleSwap]: {
        ...sample,
        sampleNumber: this.state.sampleSwap,
        reported: false,
      }
    };

    delete newSamples[sample.sampleNumber];
    this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });
    this.setState({ modified: true });
    onComplete();
  }

  swapSample = onComplete => {
    const { me } = this.props;
    const { doc, sample } = this.state;
    let log = {
      type: 'ID Change',
      log: `Samples ${sample.jobNumber}-${sample.sampleNumber} (${sample.description} ${sample.material}) and ${sample.jobNumber}-${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap].description} ${doc.samples[this.state.sampleSwap].material}) swapped numbers.`,
      chainOfCustody: sample.cocUid,
      sample: sample.uid,
    };
    addLog("asbestosLab", log, me);
    log = {
      type: 'ID Change',
      log: `Samples ${sample.jobNumber}-${sample.sampleNumber} (${sample.description} ${sample.material}) and ${sample.jobNumber}-${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap].description} ${doc.samples[this.state.sampleSwap].material}) swapped numbers.`,
      chainOfCustody: sample.cocUid,
      sample: doc.samples[this.state.sampleSwap].uid,
    };
    addLog("asbestosLab", log, me);

    let newSamples = {...doc.samples,
      [this.state.sampleSwap]: {
        ...sample,
        sampleNumber: this.state.sampleSwap,
        reported: false,
      },
      [sample.sampleNumber]: {
        ...doc.samples[this.state.sampleSwap],
        sampleNumber: sample.sampleNumber,
        reported: false,
      },
    };

    this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });
    this.setState({ modified: true });
    onComplete();
  }

  saveSample = onComplete => {
    const { doc, sample } = this.state;
    let log = {};
    if (this.state.sampleDelete && window.confirm("Are you sure you wish to delete this sample?")) {
      // Delete sample
      this.deleteSample(onComplete);
      // console.log(doc.samples);
    } else if (this.state.sampleDoSwap) {
      if (this.state.sampleSwap === '') {
        window.alert('You have not selected a sample number to move to.');
      } else if (this.state.sampleSwap < 1) {
        window.alert('Sample numbers must be a positive integer.')
      } else if (doc.samples[this.state.sampleSwap] === undefined && window.confirm(`Are you sure you wish to move this sample to number ${this.state.sampleSwap}`)) {
        // Move to sample number
        this.moveSample(onComplete);
      } else if (doc.samples[this.state.sampleSwap] !== undefined && window.confirm(`There is already a sample using that sample number. Do you wish to swap sample ${this.state.sample.sampleNumber} with sample ${this.state.sampleSwap} (${doc.samples[this.state.sampleSwap]['description']} ${doc.samples[this.state.sampleSwap]['material']})?`)) {
        // Swap sample number
        this.swapSample(onComplete);
        // console.log(doc.samples);
    } else if (doc.samples[this.state.sampleSwap] !== undefined && doc.samples[this.state.sampleSwap]['cocUid'] !== doc.uid) {
      window.alert("You cannot move this sample to that sample number as it is being used by a sample in a different Chain of Custody.");
    }
  } else {
      if (sample.uid) {
        log = {
          type: 'Edit',
          log: `Details of sample ${this.state.sample.jobNumber}-${this.state.sample.sampleNumber} (${this.state.sample.description} ${this.state.sample.material}) modified.`,
          sample: sample.uid,
          chainOfCustody: sample.cocUid,
        };
        addLog("asbestosLab", log, this.props.me);
      }

      let i = parseInt(sample.sampleNumber) - 1;
      if (sample.description || sample.material) {
        this.props.handleSampleChange(i,
          {
            reported: false,
            genericLocation: sample.genericLocation ? sample.genericLocation : null,
            specificLocation: sample.specificLocation ? sample.specificLocation : null,
            description: sample.description ? sample.description : null,
            material: sample.material ? sample.material : null,
            sampleDate: sample.sampleDate ? sample.sampleDate : null,
            sampledBy: sample.sampledBy ? sample.sampledBy : null,
          }
        );
      }
      onComplete();
    }
  }

  previousSample = () => {
    let newSampleNumber = parseInt(this.state.sample.sampleNumber) - 1;
    if (this.state.doc.samples[newSampleNumber]) {
      this.setState({ sample: this.state.doc.samples[newSampleNumber], ...actionInit});
    } else {
      this.setState({
        sample: {
          sampleNumber: newSampleNumber,
          jobNumber: this.state.doc.jobNumber,
        },
        ...actionInit,
      });
    }
  }

  nextSample = () => {
    let newSampleNumber = parseInt(this.state.sample.sampleNumber) + 1;
    if (this.state.doc.samples[newSampleNumber]) {
      this.setState({ sample: this.state.doc.samples[newSampleNumber], ...actionInit});
    } else {
      this.setState({
        sample: {
          sampleNumber: newSampleNumber,
          jobNumber: this.state.doc.jobNumber,
        },
        ...actionInit,
      });
    }
  }

  render() {
    const { classes, modalProps, modalType, me } = this.props;
    const { sample, doc } = this.state;
    const i = sample ? sample.sampleNumber - 1 : 0;
    if (modalType === ASBESTOS_SAMPLE_EDIT_COC) {
      return (
      <Dialog
        maxWidth="sm"
        style={{minHeight: 600}}
        scroll="body"
        fullWidth={true}
        open={modalType === ASBESTOS_SAMPLE_EDIT_COC}
        onEnter={this.loadProps}
      >
        <DialogTitle>
          {sample && sample.jobNumber ? `Edit Sample ${sample.jobNumber}-${sample.sampleNumber}` : `Edit Sample`}
        </DialogTitle>
        <DialogContent>
        {this.state.sample && (
          <div>
            {SuggestionField(this, false, 'Generic Location', 'genericLocationSuggestions', this.state.sample.genericLocation,
              (value) => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      genericLocation: value,
                    },
                    modified: true,
                  });
                }
            )}
            {SuggestionField(this, false, 'Specific Location', 'specificLocationSuggestions', this.state.sample.specificLocation,
              (value) => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      specificLocation: value,
                    },
                    modified: true,
                  });
                }
            )}
            {SuggestionField(this, false, 'Description/Item', 'descriptionSuggestions', this.state.sample.description,
              (value) => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      description: value,
                    },
                    modified: true,
                  });
                }
            )}
            {SuggestionField(this, false, 'Material', 'materialSuggestions', this.state.sample.material,
              (value) => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      material: value,
                    },
                    modified: true,
                  });
                }
            )}
            <Select
              isMulti
              className={classes.select}
              value={sample.sampledBy ? sample.sampledBy.map(e => ({value: e, label: e})) : []}
              options={modalProps.names.map(e => ({ value: e.name, label: e.name }))}
              onChange={e => {
                this.setState({
                  sample: {
                    ...this.state.sample,
                    sampledBy: e.map(staff => staff.value),
                  },
                  modified: true,
                });
              }}
            />
            <DatePicker
              value={sample.sampleDate ? sample.sampleDate.toDate() : null}
              autoOk
              format="ddd, D MMMM YYYY"
              clearable
              label="Sample Date"
              onChange={date => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      sampleDate: date,
                    },
                    modified: true,
                  });
              }}
            />
            {false && sample.uid && <div>
              <div>
                <Checkbox
                  checked={this.state.sampleDoSwap}
                  onChange={(event) => { this.setState({
                    sampleDoSwap: event.target.checked,
                    sampleDelete: false,
                  })}}
                  value='sampleSwap'
                  color='secondary'
                />
                Move this sample to number
                <Input
                  className={classes.formInputNumber}
                  type='number'
                  value={this.state.sampleSwap}
                  onChange={(event) => this.setState({
                    sampleSwap: event.target.value
                  })}
                  inputProps={{
                    min: 1,
                  }}
                />
              </div>
              <div>
                <Checkbox
                  checked={this.state.sampleDelete}
                  onChange={(event) => { this.setState({
                    sampleDelete: event.target.checked,
                    sampleDoSwap: false,
                  })}}
                  value='sampleDelete'
                  color='secondary'
                />
                Delete this sample
              </div>
            </div>}
          </div>
        )}
        </DialogContent>
          <DialogActions>
            <Button onClick={this.props.hideModal} color="secondary">Cancel</Button>
            <Button onClick={() => this.saveSample(this.previousSample)} color="inherit" disabled={parseInt(sample.sampleNumber) === 1}>Previous</Button>
            <Button onClick={() => this.saveSample(this.nextSample)} color="secondary">Next</Button>
            <Button onClick={() => this.saveSample(this.saveAndHide)} color="primary" >Submit</Button>
          </DialogActions>
      </Dialog>
    );
    } else return null;
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleCocEditModal)
);
