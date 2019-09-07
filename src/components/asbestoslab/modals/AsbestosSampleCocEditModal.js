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
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import Select from 'react-select';

import SuggestionField from '../../../widgets/SuggestionField';
import { hideModalSecondary, handleModalChange, } from "../../../actions/modal";
import { handleSampleChange, writeDescription } from '../../../actions/asbestosLab';
import { addLog, personnelConvert } from '../../../actions/local';
import { SampleRadioSelector } from '../../../widgets/FormWidgets';
import NumberSpinner from '../../../widgets/NumberSpinner';

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
    asbestosMaterialCategories: state.const.asbestosMaterialCategories,
    me: state.local.me,
    samples: state.asbestosLab.samples,
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
        sampleSwap: this.props.modalProps.sample.sampleNumber,
        doc: this.props.modalProps.doc,
      });
    }
  }

  saveAndHide = () => {
    //console.log('Hiding');
    this.setState(stateInit);
    // console.log('on exit ' + this.state.modified);
    this.props.modalProps.onExit(true);
    // this.props.modalProps.onExit(this.state.modified);
    this.props.hideModal();
  }

  deleteSample = onComplete => {
    const { me } = this.props;
    const { doc, sample } = this.state;
    let log = {
      type: 'Delete',
      log: `Sample ${sample.jobNumber}-${sample.sampleNumber} (${writeDescription(sample)}) deleted.`,
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
      log: `Sample ${sample.jobNumber}-${sample.sampleNumber} (${writeDescription(sample)}) moved to sample number ${sample.jobNumber}-${this.state.sampleSwap}.`,
      chainOfCustody: sample.cocUid,
      sample: sample.uid,
    };
    addLog("asbestosLab", log, me);

    let newSamples = {...doc.samples,
      [this.state.sampleSwap]: {
        ...sample,
        sampleNumber: this.state.sampleSwap,
        verified: false,
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
      log: `Samples ${sample.jobNumber}-${sample.sampleNumber} (${writeDescription(sample)}) and ${sample.jobNumber}-${this.state.sampleSwap} (${writeDescription(doc.samples[this.state.sampleSwap])}) swapped numbers.`,
      chainOfCustody: sample.cocUid,
      sample: sample.uid,
    };
    addLog("asbestosLab", log, me);
    log = {
      type: 'ID Change',
      log: `Samples ${sample.jobNumber}-${sample.sampleNumber} (${writeDescription(sample)}) and ${sample.jobNumber}-${this.state.sampleSwap} (${writeDescription(doc.samples[this.state.sampleSwap])}) swapped numbers.`,
      chainOfCustody: sample.cocUid,
      sample: doc.samples[this.state.sampleSwap].uid,
    };
    addLog("asbestosLab", log, me);

    let newSamples = {...doc.samples,
      [this.state.sampleSwap]: {
        ...sample,
        sampleNumber: this.state.sampleSwap,
        verified: false,
      },
      [sample.sampleNumber]: {
        ...doc.samples[this.state.sampleSwap],
        sampleNumber: sample.sampleNumber,
        verified: false,
      },
    };

    this.props.handleModalChange({id: 'samples', value: newSamples, cocUid: doc.uid, });
    this.setState({ modified: true });
    onComplete();
  }

  saveSample = (onComplete) => {
    console.log('saving sample');
    const { doc, sample } = this.state;
    console.log(sample);
    let log = {};
    if (this.state.sampleDelete && window.confirm("Are you sure you wish to delete this sample?")) {
      // Delete sample
      this.deleteSample(onComplete);
      // //console.log(doc.samples);
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
        // //console.log(doc.samples);
      } else if (doc.samples[this.state.sampleSwap] !== undefined && doc.samples[this.state.sampleSwap]['cocUid'] !== doc.uid) {
        window.alert("You cannot move this sample to that sample number as it is being used by a sample in a different Chain of Custody.");
      }
    } else {
      if (sample.uid && sample !== this.props.samples[sample.cocUid][sample.sampleNumber]) {
        log = {
          type: 'Edit',
          log: `Details of sample ${this.state.sample.jobNumber}-${this.state.sample.sampleNumber} (${writeDescription(this.state.sample)}) modified.`,
          sample: sample.uid,
          chainOfCustody: sample.cocUid,
        };
        addLog("asbestosLab", log, this.props.me);
        let i = parseInt(sample.sampleNumber) - 1;
        this.props.handleSampleChange(i,
          {
            verified: false,
            genericLocation: sample.genericLocation ? sample.genericLocation : null,
            specificLocation: sample.specificLocation ? sample.specificLocation : null,
            category: sample.category ? sample.category : 'Other',
            description: sample.description ? sample.description : null,
            material: sample.material ? sample.material : null,
            sampleDate: sample.sampleDate ? sample.sampleDate : null,
            sampledBy: sample.sampledBy ? sample.sampledBy : null,
            samplingMethod: sample.samplingMethod ? sample.samplingMethod : null,
            sampleQuantity: sample.sampleQuantity ? sample.sampleQuantity : null,
          }
        );
      }
      onComplete();
    }
  }

  previousSample = () => {
    console.log('prev sample');
    let newSampleNumber = parseInt(this.state.sample.sampleNumber) - 1;
    if (this.state.doc.samples[newSampleNumber]) {
      this.setState({
        sample: this.state.doc.samples[newSampleNumber],
        sampleSwap: newSampleNumber,
        ...actionInit
      });
    } else {
      this.setState({
        sample: {
          sampleNumber: newSampleNumber,
          jobNumber: this.state.doc.jobNumber,
        },
        sampleSwap: newSampleNumber,
        ...actionInit,
      });
    }
  }

  nextSample = () => {
    console.log('next sample');
    let newSampleNumber = parseInt(this.state.sample.sampleNumber) + 1;
    if (this.state.doc.samples[newSampleNumber]) {
      this.setState({
        sample: this.state.doc.samples[newSampleNumber],
        sampleSwap: newSampleNumber,
        ...actionInit
      });
    } else {
      this.setState({
        sample: {
          sampleNumber: newSampleNumber,
          jobNumber: this.state.doc.jobNumber,
        },
        sampleSwap: newSampleNumber,
        ...actionInit,
      });
    }
  }

  render() {
    const { classes, modalProps, modalType, me, samples } = this.props;
    const { sample, doc } = this.state;
    const i = sample ? sample.sampleNumber - 1 : 0;
    const disabled = sample.cocUid != modalProps.doc.uid;
    console.log(sample);
    console.log(this.state.sampleSwap);
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
          {sample && sample.jobNumber ? `Edit Sample ${sample.jobNumber}-${sample.sampleNumber}: ${writeDescription(sample)}` : `Edit Sample`}
        </DialogTitle>
        <DialogContent>
        {sample && (
          <div>
            <SuggestionField that={this} label='Generic Location' suggestions='genericLocationSuggestions'
              value={sample.genericLocation}
              controlled
              disabled={disabled}
              onModify={(value) => {
                  this.setState({
                    sample: {
                      ...sample,
                      genericLocation: value,
                    },
                    modified: true,
                  });
                }}
            />

            <SuggestionField that={this} label='Specific Location' suggestions='specificLocationSuggestions'
              value={sample.specificLocation}
              controlled
              disabled={disabled}
              onModify={(value) => {
                  this.setState({
                    sample: {
                      ...sample,
                      specificLocation: value,
                    },
                    modified: true,
                  });
                }}
            />

            <SuggestionField that={this} label='Description/Item' suggestions='descriptionSuggestions'
              value={sample.description}
              controlled
              disabled={disabled}
              onModify={(value) => {
                  this.setState({
                    sample: {
                      ...this.state.sample,
                      description: value,
                    },
                    modified: true,
                  });
                }}
            />

            <SuggestionField that={this} label='Material' suggestions='materialSuggestions'
              value={sample.material}
              controlled
              disabled={disabled}
              onModify={(value) => {
                  let category = '';
                  if (sample.category) category = sample.category;
                  else {
                    let materialObj = Object.values(this.props.materialSuggestions).filter(e => e.label === value);
                    if (materialObj.length > 0) {
                      category = materialObj[0].category;
                    }
                  }
                  this.setState({
                    sample: {
                      ...sample,
                      material: value,
                      category,
                    },
                    modified: true,
                  });
                }}
            />

            <Select
              className={classes.select}
              value={sample.category ? {value: sample.category, label: sample.category} : {value: '', label: ''}}
              options={this.props.asbestosMaterialCategories.map(e => ({ value: e.label, label: e.label }))}
              disabled={disabled}
              onChange={e => {
                this.setState({
                  sample: {
                    ...sample,
                    category: e.value,
                  },
                  modified: true,
                })
              }}
            />

            <Select
              isMulti
              className={classes.select}
              value={sample.sampledBy ? sample.sampledBy.map(e => ({value: e.uid, label: e.name})) : []}
              options={modalProps.names.map(e => ({ value: e.uid, label: e.name }))}
              disabled={disabled}
              onChange={e => {
                this.setState({
                  sample: {
                    ...sample,
                    sampledBy: personnelConvert(e),
                  },
                  modified: true,
                });
              }}
            />
            <DatePicker
              className={classes.columnMedSmall}
              value={sample.sampleDate ? sample.sampleDate.toDate() : null}
              autoOk
              format="ddd, D MMMM YYYY"
              clearable
              disabled={disabled}
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

            <div className={classes.marginTopSmall}>
              <InputLabel>Sampling Method</InputLabel>
              {SampleRadioSelector(this, sample, 'samplingMethod', 'normal', 'Sampling Method',
                [{value: 'normal', label: 'Normal'},{value: 'tape', label: 'Tape'},{value: 'swab', label: 'Swab'}])}
            </div>
            {(sample.samplingMethod === 'tape' || sample.samplingMethod === 'swab') &&
            <div>
              <InputLabel>{`Number of ${sample.samplingMethod}s`}</InputLabel>
              <NumberSpinner
                min={1}
                value={sample.sampleQuantity}
                onChange={value => this.setState({
                  sample: {
                    ...this.state.sample,
                    sampleQuantity: value,
                  },
                  modified: true,
                })}
              />
            </div>}
            <div className={classes.flexRow}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.sampleDoSwap}
                    onChange={(event) => { this.setState({
                      sampleDoSwap: !this.state.sampleDoSwap,
                      sampleDelete: false,
                    })}}
                    value="priority"
                    color="secondary"
                  />
                }
                label="Move Sample to Number"
              />
              <NumberSpinner
                min={1}
                value={this.state.sampleSwap}
                onChange={(num) => this.setState({
                  sampleSwap: num
                })}
              />
            </div>
            <div className={classes.informationBox}>
              {samples &&
                samples[sample.cocUid] &&
                samples[sample.cocUid][this.state.sampleSwap] !== undefined ?
                writeDescription(samples[sample.cocUid][this.state.sampleSwap])
                : "<EMPTY>"
              }
            </div>
            <div className={classes.flexRow}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.sampleDelete}
                    onChange={(event) => { this.setState({
                      sampleDelete: !this.state.sampleDelete,
                      sampleDoSwap: false,
                    })}}
                    value="priority"
                    color="secondary"
                  />
                }
                label="Delete Sample"
              />
            </div>
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
