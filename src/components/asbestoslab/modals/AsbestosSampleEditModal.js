import React from "react";
import { withStyles, } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import classNames from 'classnames';
import { ASBESTOS_SAMPLE_EDIT, SOIL_DETAILS, } from "../../../constants/modal-types";
import "../../../config/tags.css";

import { SamplesTickyBox, SamplesRadioSelector, SampleTextyLine, SamplesTickyBoxGroup, AsbButton, } from '../../../widgets/FormWidgets';
import TextyBox from "../../../widgets/TextyBox";
import { AsbestosClassification } from '../../../config/strings';

import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import Divider from "@material-ui/core/Divider";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ConfirmIcon from "@material-ui/icons/ThumbUp";
import ThumbsDown from "@material-ui/icons/ThumbDown";
import Select from 'react-select';
import AsbestosSampleEditBasicResultRow from "../components/AsbestosSampleEditBasicResultRow";
import AsbestosSampleEditLayerRow from "../components/AsbestosSampleEditLayerRow";
import AsbestosSampleEditConfirmRow from "../components/AsbestosSampleEditConfirmRow";
import AsbestosSampleWAFraction from "../components/AsbestosSampleWAFraction"
import AsbestosSampleWASummary from "../components/AsbestosSampleWASummary";
import {
  DatePicker,
  DateTimePicker,
} from "@material-ui/pickers";
import SuggestionField from '../../../widgets/SuggestionField';
import NumberSpinner from '../../../widgets/NumberSpinner';
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { toggleAsbestosSampleDisplayMode } from "../../../actions/display";
import { addLog, } from "../../../actions/local";
import { mapsAreEqual, numericAndLessThanOnly, dateOf, personnelConvert, } from "../../../actions/helpers";
import {
  handleSampleChange,
  writeSoilDetails,
  getSampleColors,
  analyticalCriteraOK,
  traceAnalysisRequired,
  recordAnalysis,
  recordAnalysisOverride,
  verifySample,
  updateResultMap,
  writeDescription,
  writeSampleDimensions,
  writeSampleMoisture,
  getConfirmColor,
  compareAsbestosResult,
  getWATotalDetails,
  overrideResult,
} from "../../../actions/asbestosLab";
import moment from "moment";
import {
  asbestosSamplesRef,
  firestore,
} from "../../../config/firebase";

const layerNum = 3;
const waLayerNum = 3;

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '1',
};

const fractionNames = ['gt7','to7','lt2'];

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    me: state.local.me,
    cocs: state.asbestosLab.cocs,
    analyst: state.asbestosLab.analyst,
    samples: state.asbestosLab.samples,
    staff: state.local.staff,
    sessionID: state.asbestosLab.sessionID,
    genericLocationSuggestions: state.const.genericLocationSuggestions,
    specificLocationSuggestions: state.const.specificLocationSuggestions,
    descriptionSuggestions: state.const.asbestosDescriptionSuggestions,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
    asbestosMaterialCategories: state.const.asbestosMaterialCategories,
    asbestosInSoilSuggestions: state.const.asbestosInSoilSuggestions,
    asbestosSampleDisplayAdvanced: state.display.asbestosSampleDisplayAdvanced
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
    toggleAsbestosSampleDisplayMode: () => dispatch(toggleAsbestosSampleDisplayMode()),
  };
};

const initState = {
  activeSample: 1,
  samples: {},
  displayColorPicker: {},
  modified: false,
  genericLocationSuggestions: [],
  specificLocationSuggestions: [],
  descriptionSuggestions: [],
  materialSuggestions: [],
  result: {},
  override: null,
  changes: {},
};

class AsbestosSampleEditModal extends React.Component {
  state = initState;

  shouldComponentUpdate(nextProps, nextState) {
    if ((this.state.activeSample !== nextState.activeSample) ||
     (this.state.samples !== nextState.samples) ||
     (this.state.result !== nextState.result)) return true;
    if (this.props.asbestosSampleDisplayAdvanced !== nextProps.asbestosSampleDisplayAdvanced) return true;
    console.log('not updating...');
    return false;
  }

  loadProps = (activeSample) => {
    let samples = {};
    let waAnalysis = this.props.cocs[this.props.modalProps.activeCoc].waAnalysis;

    Object.values(this.props.samples[this.props.modalProps.activeCoc]).filter(s => s.cocUid === this.props.modalProps.activeCoc)
      .forEach(s => {
        samples[s.sampleNumber] = s;
      });

    if (samples[activeSample].layers === undefined) samples[activeSample].layers = {};
    [...Array(layerNum).keys()].forEach(num => {
      if (samples[activeSample].layers[`layer${num+1}`] === undefined) {
        samples[activeSample].layers[`layer${num+1}`] = { color: defaultColor, result: {}, };
      }
    });

    if (waAnalysis) {
      if (samples[activeSample].waSoilAnalysis === undefined) samples[activeSample].waSoilAnalysis = {};
      if (samples[activeSample].waLayerNum === undefined) samples[activeSample].waLayerNum = {lt2: waLayerNum, to7: waLayerNum, gt7: waLayerNum} ;
      if (samples[activeSample].waAnalysisComplete === undefined) samples[activeSample].waAnalysisComplete = false;
      fractionNames.forEach(fraction => {
        [...Array(waLayerNum).keys()].forEach(num => {
          if (samples[activeSample].waSoilAnalysis[`subfraction${fraction}-${num+1}`] === undefined) {
            samples[activeSample].waSoilAnalysis[`subfraction${fraction}-${num+1}`] = { result: {}, };
          }
        });
      });
    }

    console.log(samples);

    this.setState({
      activeSample,
      samples,
      override: null,
    });
  }

  clearProps = () => {
    this.setState(initState);
  }

  handleResultClick = (res, sampleNumber) => {
    const { me, analyst, sessionID, } = this.props;
    let sample = this.state.samples[sampleNumber];
    let override = this.state.override;
      // Check analyst has been selected
    if (analyst === "") {
      window.alert(
        "Select analyst from the dropdown at the top of the page."
      );
    }
    // Check if this sample has already been analysed
    if (sample.sessionID && sample.sessionID !== sessionID && sample.result && (!this.state.override || !this.state.override[sampleNumber])) {
      if (this.state.override) {
        //console.log(`This state override sample ${!this.state.override[sample.sampleNumber]}`);
      }
      if (window.confirm("This sample has already been analysed. Do you wish to override the result?")) {
        overrideResult(sample, {name: me.name, uid: me.uid});
        if (!this.state.override) {
          override = {[sampleNumber]: true};
        } else {
          override = {
            ...this.state.override,
            [sampleNumber]: true,
          };
        }
      } else {
        return;
      }
    }

    let newMap = updateResultMap(res, sample.result);
    console.log('Setting modified to true');

    this.setState({
      samples: {
        ...this.state.samples,
        [sampleNumber]: {
          ...this.state.samples[sampleNumber],
          result: newMap,
        }
      },
      override,
      modified: true,
    });
    // Check for situation where all results are unselected
  };

  addLayer = () => {
    let sample = this.state.samples[this.state.activeSample];
    let num = sample.layerNum ? sample.layerNum : layerNum;
    num += 1;
    let sampleLayers = sample.layers;
    if (sampleLayers[`layer${num}`] === undefined) {
      sampleLayers[`layer${num}`] = { color: defaultColor, result: {}, };
    }
    this.setState({
      modified: true,
      samples: {
        ...this.state.samples,
        [this.state.activeSample]: {
          ...this.state.samples[this.state.activeSample],
          layerNum: num,
          layers: sampleLayers,
        },
      },
    });
  };

  removeLayer = () => {
    let sample = this.state.samples[this.state.activeSample];
    let num = sample.layerNum ? sample.layerNum : layerNum;
    num -= 1;
    if (num < 1) num = 1;
    this.setState({
      modified: true,
      samples: {
        ...this.state.samples,
        [this.state.activeSample]: {
          ...this.state.samples[this.state.activeSample],
          layerNum: num,
        },
      },
    });
  };

  previousSample = () => {
    if (this.state.modified || Object.keys(this.state.changes).length > 0) this.saveSample(this.state.activeSample);
    let takeThisSample = false;
    Object.values(this.state.samples).reverse().forEach(sample => {
      if (takeThisSample) {
        this.setState({
          samples: {
            ...this.state.samples,
            [this.state.activeSample]: {
              ...this.state.samples[this.state.activeSample],
              ...this.state.changes,
            }
          },
          changes: {},
          modified: (this.state.modified || Object.keys(this.state.changes) > 0) ? true : false,
          activeSample: sample.sampleNumber,
          override: null,
        });
        takeThisSample = false;
        this.loadProps(sample.sampleNumber);
      }
      if (sample.sampleNumber == this.state.activeSample) takeThisSample = true;
    });
  };

  nextSample = () => {
    if (this.state.modified || Object.keys(this.state.changes).length > 0) this.saveSample(this.state.activeSample);
    let takeThisSample = false;
    Object.values(this.state.samples).forEach(sample => {
      if (takeThisSample) {
        this.setState({
          samples: {
            ...this.state.samples,
            [this.state.activeSample]: {
              ...this.state.samples[this.state.activeSample],
              ...this.state.changes,
            }
          },
          modified: (this.state.modified || Object.keys(this.state.changes) > 0) ? true : false,
          changes: {},
          activeSample: sample.sampleNumber,
          override: null,
        });
        takeThisSample = false;
        this.loadProps(sample.sampleNumber);
      }
      if (sample.sampleNumber == this.state.activeSample) takeThisSample = true;
    });
  };

  saveSample = async (activeSample) => {
    console.log('Save Sample');
    const { override } = this.state;
    let activeSampleNumber = activeSample ? activeSample : this.state.activeSample;
    let sample = {
      ...this.state.samples[activeSampleNumber],
      ...this.state.changes,
    };
    let waTotals = await getWATotalDetails(sample);
    sample.waTotals = waTotals;
    let batch = firestore.batch();

    batch.update(asbestosSamplesRef.doc(sample.uid), sample);

    let log = {
      type: "Analysis",
      log: `Sample ${sample.sampleNumber} (${writeDescription(sample)}) details edited.`,
      sample: sample.uid,
      chainOfCustody: sample.cocUid,
    };
    let resultChanged = !mapsAreEqual(this.props.samples[this.props.modalProps.activeCoc][activeSampleNumber].result, sample.result);
    let weightChanged = this.props.samples[this.props.modalProps.activeCoc][activeSampleNumber].weightReceived != sample.weightReceived;
    let originalResult = this.props.samples[this.props.modalProps.activeCoc][activeSampleNumber].result;
    let originalWeight = this.props.samples[this.props.modalProps.activeCoc][activeSampleNumber].weightReceived;
    addLog("asbestosLab", log, this.props.me, batch);
    if (this.props.samples[this.props.modalProps.activeCoc][this.state.activeSample] &&
      (resultChanged || weightChanged)) {
      recordAnalysis(batch, this.props.analyst, sample, this.props.cocs[this.props.modalProps.activeCoc],
        this.props.samples, this.props.sessionID, this.props.me,
        resultChanged, weightChanged,
        resultChanged && !(originalResult === undefined || originalResult === null),
        weightChanged && !(originalWeight === undefined || originalWeight === null),
      );
    }
    if (sample.verified) {
      verifySample(batch, sample,
        this.props.cocs[this.props.modalProps.activeCoc],
        this.props.samples,
        this.props.sessionID,
        this.props.me, null, null);
    }

    batch.commit();
  }

  saveMultipleSamples = async () => {
    let result = {};
    let weightReceived = 0;
    let originalSamples = this.props.samples[this.props.modalProps.activeCoc];
    let batch = firestore.batch();

    await Object.values(this.state.samples).forEach(sample => {
      let resultChanged = !mapsAreEqual(originalSamples[sample.sampleNumber].result, sample.result);
      let weightChanged = originalSamples[sample.sampleNumber].weightReceived != sample.weightReceived;
      let originalResult = originalSamples[sample.sampleNumber].result;
      let originalWeight = originalSamples[sample.sampleNumber].weightReceived;
      if (originalSamples[sample.sampleNumber] &&
        (resultChanged || weightChanged)) {
        recordAnalysis(batch, this.props.analyst, sample, this.props.cocs[this.props.modalProps.activeCoc],
          this.props.samples, this.props.sessionID, this.props.me,
          resultChanged, weightChanged,
          resultChanged && !(originalResult === undefined || originalResult === null),
          weightChanged && !(originalWeight === undefined || originalWeight === null),
        );
        if (sample.verified) {
          verifySample(batch, sample,
            this.props.cocs[this.props.modalProps.activeCoc],
            this.props.samples,
            this.props.sessionID,
            this.props.me, null, null);
        }
      }
    });

    batch.commit();
  }

  render() {
    const { classes, modalProps, modalType, samples } = this.props;
    const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));

    let sample = {
      ...this.state.samples[this.state.activeSample],
      ...this.state.changes,
    };
    if (sample && Object.keys(sample).length === 0) sample = null;
    let colors = getSampleColors(this.state.samples[this.state.activeSample]);
    let waAnalysis = this.props.cocs[modalProps.activeCoc] && this.props.cocs[modalProps.activeCoc].waAnalysis;
    let sampleDimensions = null;
    let sampleMoisture = null;
    let fractionMap = {};
    let waColors = {};

    if (sample && this.props.asbestosSampleDisplayAdvanced) {
      sampleDimensions = writeSampleDimensions(sample, true);
      sampleMoisture = writeSampleMoisture(sample, true);
    }

    return (
    <Dialog
      open={modalType === ASBESTOS_SAMPLE_EDIT}
      onClose={this.props.hideModal}
      maxWidth="lg"
      fullWidth={true}
      onEnter={() => this.loadProps(modalProps.activeSample)}
      onExit={() => this.clearProps()}
      disableBackdropClick={true}
    >
      {this.props.asbestosSampleDisplayAdvanced ?
        <DialogTitle>{sample ? `Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber} ${writeDescription(sample)}` : 'Analysis Details'}</DialogTitle>
        :
        <DialogTitle>{this.props.cocs[this.props.modalProps.activeCoc] ? `Analysis Details for Job ${this.props.cocs[this.props.modalProps.activeCoc].jobNumber}` : 'Analysis Details'}</DialogTitle>
      }
      {this.props.asbestosSampleDisplayAdvanced ? sample &&
        <DialogContent>
          <Button className={classes.buttonIconText} onClick={() => {
            if (this.state.modified) this.saveSample();
            this.props.toggleAsbestosSampleDisplayMode();
          }}>SWITCH TO BASIC VIEW</Button>
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={5}>
              <div className={classes.subHeading}>Basic Information</div>
                <SuggestionField that={this} label='Generic Location' suggestions='genericLocationSuggestions'
                  value={sample.genericLocation ? sample.genericLocation : ''}
                  defaultValue=''
                  controlled={true}
                  onModify={(value) => {
                    this.setState({
                      modified: true,
                      samples: {
                        ...this.state.samples,
                        [this.state.activeSample]: {
                          ...this.state.samples[this.state.activeSample],
                          genericLocation: value,
                        },
                      },
                    })
                  }}
                />
                <SuggestionField that={this} label='Specific Location' suggestions='specificLocationSuggestions'
                  value={sample.specificLocation ? sample.specificLocation : ''}
                  defaultValue=''
                  controlled={true}
                  onModify={(value) => {
                    this.setState({
                      modified: true,
                      samples: {
                        ...this.state.samples,
                        [this.state.activeSample]: {
                          ...this.state.samples[this.state.activeSample],
                          specificLocation: value,
                        },
                      },
                    })
                  }}
                />
                <SuggestionField that={this} label='Description' suggestions='descriptionSuggestions'
                  value={sample.description ? sample.description : ''}
                  defaultValue=''
                  controlled={true}
                  onModify={(value) => {
                    this.setState({
                      modified: true,
                      samples: {
                        ...this.state.samples,
                        [this.state.activeSample]: {
                          ...this.state.samples[this.state.activeSample],
                          description: value,
                        },
                      },
                    })
                  }}
                />
                <SuggestionField that={this} label='Material' suggestions='materialSuggestions'
                  value={sample.material ? sample.material : ''}
                  defaultValue=''
                  controlled={true}
                  onModify={value => {
                    let category = '';
                    if (sample.category) category = sample.category;
                    else {
                      let materialObj = Object.values(this.props.materialSuggestions).filter(e => e.label === value);
                      if (materialObj.length > 0) {
                        category = materialObj[0].category;
                      }
                    }
                    this.setState({
                      modified: true,
                      samples: {
                        ...this.state.samples,
                        [this.state.activeSample]: {
                          ...this.state.samples[this.state.activeSample],
                          material: value,
                          category: category,
                        },
                      },
                    })
                  }}
                />
              <Select
                className={classes.selectTight}
                value={sample.category ? {value: sample.category, label: sample.category} : {value: '', label: ''}}
                options={this.props.asbestosMaterialCategories.map(e => ({ value: e.label, label: e.label }))}
                onChange={e => {
                  this.setState({
                    modified: true,
                    samples: {
                      ...this.state.samples,
                      [this.state.activeSample]: {
                        ...this.state.samples[this.state.activeSample],
                        category: e.value,
                      },
                    },
                  })
                }}
              />
              <InputLabel className={classes.marginTopSmall}>Sampled By</InputLabel>
              <Select
                isMulti
                className={classes.selectTight}
                value={sample.sampledBy ? sample.sampledBy.map(e => ({value: e.uid, label: e.name})) : null}
                options={names.map(e => ({ value: e.uid, label: e.name }))}
                onChange={e => this.setState({
                  modified: true,
                  samples: {
                    ...this.state.samples,
                    [this.state.activeSample]: {
                      ...this.state.samples[this.state.activeSample],
                      sampledBy: personnelConvert(e),
                    }
                  }
                })}
              />
              <div>
                <DatePicker
                  value={dateOf(sample.sampleDate)}
                  autoOk
                  className={classes.formSelectDateTime}
                  format="D MMMM YYYY"
                  clearable
                  label="Sample Date"
                  onChange={date => this.setState({
                    modified: true,
                    samples: {
                      ...this.state.samples,
                      [this.state.activeSample]: {
                        ...this.state.samples[this.state.activeSample],
                        sampleDate: dateOf(date),
                      }
                    }
                  })}
                />
              </div>
              <div className={classes.flexRow}>
                <DateTimePicker
                  value={dateOf(sample.receivedDate)}
                  autoOk
                  className={classes.formSelectDateTime}
                  format="D MMMM YYYY, h:mma"
                  clearable
                  label="Date Received"
                  onChange={date => this.setState({
                    modified: true,
                    samples: {
                      ...this.state.samples,
                      [this.state.activeSample]: {
                        ...this.state.samples[this.state.activeSample],
                        receivedDate: dateOf(date),
                      }
                    }
                  })}
                />
                <div className={classes.spacerMedium} />
                <DateTimePicker
                  value={dateOf(sample.analysisStartDate)}
                  autoOk
                  className={classes.formSelectDateTime}
                  format="D MMMM YYYY, h:mma"
                  clearable
                  label="Analysis Start Date"
                  onChange={date => this.setState({
                    modified: true,
                    samples: {
                      ...this.state.samples,
                      [this.state.activeSample]: {
                        ...this.state.samples[this.state.activeSample],
                        analysisStartDate: dateOf(date),
                      }
                    }
                  })}
                />
              </div>
              <div className={classes.flexRow}>
                <DateTimePicker
                  value={dateOf(sample.analysisDate)}
                  autoOk
                  className={classes.formSelectDateTime}
                  format="D MMMM YYYY, h:mma"
                  clearable
                  label="Analysis Date"
                  onChange={date => this.setState({
                    modified: true,
                    samples: {
                      ...this.state.samples,
                      [this.state.activeSample]: {
                        ...this.state.samples[this.state.activeSample],
                        analysisDate: dateOf(date),
                      }
                    }
                  })}
                />
                <div className={classes.spacerMedium} />
                <DateTimePicker
                  value={dateOf(sample.verifyDate)}
                  autoOk
                  className={classes.formSelectDateTime}
                  format="D MMMM YYYY, h:mma"
                  clearable
                  label="Verify Date"
                  onChange={date => this.setState({
                    modified: true,
                    samples: {
                      ...this.state.samples,
                      [this.state.activeSample]: {
                        ...this.state.samples[this.state.activeSample],
                        verifyDate: date.toDate(),
                      }
                    }
                  })}
                />
              </div>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={6}>
            {sample.material !== 'soil' && <div>
              <div className={classes.subHeading}>Sampling Method</div>
                {SamplesRadioSelector(this, sample, 'samplingMethod', 'bulk', 'Sampling Method',
                  [{value: 'bulk', label: 'Bulk'},{value: 'tape', label: 'Tape'},{value: 'swab', label: 'Swab'}])}
                {(sample.samplingMethod === 'tape' || sample.samplingMethod === 'swab') &&
                <div>
                  <InputLabel>{`Number of ${sample.samplingMethod}s`}</InputLabel>
                  <NumberSpinner
                    min={1}
                    value={sample.sampleQuantity}
                    onChange={value => this.setState({
                      modified: true,
                      samples: {
                        ...this.state.samples,
                        [this.state.activeSample]: {
                          ...this.state.samples[this.state.activeSample],
                          sampleQuantity: value,
                        }
                      }
                    })}
                  />
                </div>}
              </div>}
              <div className={classes.subHeading}>Weights</div>
              <div className={classes.flexRow}>
                <div className={classes.formInputMediumRequired}>
                  <TextyBox that={this} sample={sample} field={'weightReceived'} label={'Weight as Received'} helperText={'REQUIRED Record the weight as received (tape samples can be recorded as <0.1).'} end={'g'} numericOnly={true} />
                </div>
                <div className={classes.spacerSmall} />
                <div className={classes.formInputMedium}>
                  <TextyBox that={this} sample={sample} field={'weightSubsample'} label={'Weight of Subsample'} helperText={'Record the weight of the subsample if the entire sample is not analysed.'} end={'g'} numericOnly={true} />
                </div>
                <div className={classes.spacerSmall} />
                <div className={classes.formInputMedium}>
                  <TextyBox that={this} sample={sample} field={'weightDry'} label={'Dry Weight'} helperText={'Record the weight after drying (~105°).'} end={'g'} numericOnly={true} />
                </div>
                <div className={classes.spacerSmall} />
                <div className={classes.formInputMedium}>
                  <TextyBox that={this} sample={sample} field={'weightAshed'} label={'Ashed Weight'} helperText={'Record the weight after ashing (~400°).'} end={'g'} numericOnly={true} />
                </div>
              </div>

              {sampleMoisture && <div className={classes.informationBoxRounded}>
                Moisture: {sampleMoisture}%
              </div>}
              {sample.material !== 'soil' && <div>
                <div className={classes.subHeading}>Dimensions</div>
                <div className={classes.flexRow}>
                  <div className={classes.formInputSmall}>
                    <TextyBox that={this} sample={sample} base={'dimensions'} field={'length'} label={'Length'} end={'mm'} numericOnly={true} />
                  </div>
                  <span className={classes.timesSymbol}>X</span>
                  <div className={classes.formInputSmall}>
                    <TextyBox that={this} sample={sample} base={'dimensions'} field={'width'} label={'Width'} end={'mm'} numericOnly={true} />
                  </div>
                  <span className={classes.timesSymbol}>X</span>
                  <div className={classes.formInputSmall}>
                    <TextyBox that={this} sample={sample} base={'dimensions'} field={'depth'} label={'Depth/Thickness'} end={'mm'} numericOnly={true} />
                  </div>
                  {sampleDimensions && <span className={classes.informationBoxRounded}>
                    {sampleDimensions}
                  </span>}
                </div>
              </div>}

              <div className={classes.subHeading}>Lab Notes</div>
                <TextyBox that={this} sample={sample} field={'labComments'} helperText={'Note description of the material or any additional observations or comments. This will not be displayed on the certificate.'} multiline={true} />
                <TextyBox that={this} sample={sample} field={'footnote'} helperText={'Add a footnote to be included in the issued report. This will be displayed as a footnote on the certificate.'} multiline={true} />

              {sample.material === 'soil' &&
                <div className={classes.paddedBox}>
                  <Button
                    variant="outlined"
                    className={classes.paddingTopBottomCenterText}
                    onClick={() => {
                      this.props.showModalSecondary({
                        modalType: SOIL_DETAILS,
                        modalProps: {
                          title: "Edit Soil Details",
                          doc: sample,
                          onExit: details => this.setState({
                            modified: true,
                            samples: {
                              ...this.state.samples,
                              [this.state.activeSample]: {
                                ...this.state.samples[this.state.activeSample],
                                soilDetails: details,
                              }
                            }
                          })
                        }
                      });
                    }}
                  >
                    Edit Geotechnical Soil Description
                  </Button>
                <div className={classes.italic}>{writeSoilDetails(sample.soilDetails)}</div>
              </div>}
            </Grid>
          </Grid>
          <Divider className={classes.marginTopSmall} />
          <div className={classes.flexRowLeftAlignEllipsis}><div className={classes.subHeading}>Reported Asbestos Result</div></div>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(this.props.classes[`colorsButton${colors[res]}`], this.props.classes[`colorsDiv${colors[res]}`], res, () => this.handleResultClick(res, sample.sampleNumber))
            })}
          </div>
          {!waAnalysis && <div>
            <Divider className={classes.marginTopSmall} />
            <div className={classNames(classes.subHeading, classes.flexRowCenter)}>
              Layers
              <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={this.addLayer}><AddIcon /></IconButton>
              <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={this.removeLayer}><RemoveIcon /></IconButton>
            </div>
            {[...Array(sample && sample.layerNum ? sample.layerNum : layerNum).keys()].map(num => {
              return <AsbestosSampleEditLayerRow key={num} num={num+1} result={sample.result} that={this} />;
            })}
          </div>}
          {sample.confirm && <div><Divider className={classes.marginTopSmall} />
            <div className={classNames(classes.subHeading, classes.flexRowCenter)}>Result Checks</div>
            {Object.keys(sample.confirm).map(key => {
              if (key !== 'totalNum' && sample.confirm[key].deleted !== true) return <AsbestosSampleEditConfirmRow key={sample.confirm[key].date} confirm={sample.confirm[key]} that={this} />;
            })}
          </div>}
          {waAnalysis && <div>
            <Divider className={classes.marginTopSmall} />
            <div className={classes.subHeading}>Soil Concentrations</div>
            <AsbestosSampleWASummary sample={sample} that={this} me={this.props.me} moisture={sampleMoisture} acmInSoilLimit={this.props.cocs[modalProps.activeCoc] && this.props.cocs[modalProps.activeCoc].acmInSoilLimit ? parseFloat(this.props.cocs[modalProps.activeCoc].acmInSoilLimit) : 0.01} />
            {fractionNames.map(fraction => {
              return <AsbestosSampleWAFraction key={fraction} sample={sample} fraction={fraction} that={this} />;
            })}
            {/*sample.waAnalysisSubsamples.map(subsample => {
              return <AsbestosSampleWASubsample key={subsample} sample={sample} subsample={subsample} that={this} />;
            })}
            <AsbestosSampleWASubsample sample={sample} that={this} />*/}
          </div>}
          <Divider className={classes.marginTopSmall} />
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={3}>
              <div className={classes.subHeading}>Advanced</div>
              {SamplesRadioSelector(this, sample, 'classification', 'homo', 'Classification',
                [{value: 'homo', label: 'Homogenous', tooltip: 'Uniform distribution of fibres of any type through the entire sample or in each discernibly discrete layer of the sample (sprayed asbestos, mastic, vermiculite)'},
                {value: 'homolayers', label: 'Homogenous Layers', tooltip: 'Uniform distribution of fibres of any type through each discernibly discrete layer of the sample (asbestos-cement, paper-backed vinyl)'},
                {value: 'mixedlayers', label: 'Mixed Layers', tooltip: 'Mix of homogenous and non-homogenous layers (asbestos-cement with soil attached)'},
                {value: 'nonhomo', label: 'Non-homogenous', tooltip: 'Small, discrete amounts of asbestos distributed unevenly in a large body of non-asbestos material (e.g. dust, soil)'},
                {value: 'soil', label: 'Soil'},{value: 'ore', label: 'Ore'}],
              )}
              {SamplesTickyBox(this, 'Asbestos Evident', sample, 'asbestosEvident',)}
              {traceAnalysisRequired(sample)}
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={8}>
              {SamplesTickyBoxGroup(this, sample, 'Sample Conditioning', 'sampleConditioning',
                [{value: 'furnace', label: 'Furnace'},
                {value: 'flame', label: 'Flame'},
                {value: 'lowHeat', label: 'Low Heat/Drying'},
                {value: 'dcm', label: 'Dichloromethane'},
                {value: 'mortarAndPestle', label: 'Mortar and Pestle'},
                {value: 'sieved', label: 'Sieved', },
                ]
              )}

              {SamplesTickyBoxGroup(this, sample, 'Analytical Critera', 'analyticalCriteria',
                [{value: 'dispersion', label: 'Dispersion Staining', tooltip: 'Fibres show positive confirmation of the RIs for both axes for each asbestos type detected.'},
                {value: 'morphology', label: 'Morphology', tooltip: 'Fibres show appropriate and basic morphological features.'},
                {value: 'pleochroism', label: 'Pleochroism', tooltip: 'PP: EW-NS blue-grey indicates Crocidolite, other types have no change.'},
                {value: 'orientation', label: 'Orientation', tooltip: 'XP+1st Red: Length Fast or Length Slow.'},
                {value: 'extinction', label: 'Extinction', tooltip: 'XP: Does fibre go dark at 0° and 90°?'},
                {value: 'birefringence', label: 'Birefringence', tooltip: 'XP: Appropriate intensity of fibre at 45°'},
                {value: 'color', label: 'Color', tooltip: 'PP: Appropriate color for fibre type?' },
                ]
              )}

              {analyticalCriteraOK(sample)}
              {/*<div className={classes.informationBox}>
                {AsbestosClassification(sample.classification)}
              </div>*/}
            </Grid>
          </Grid>
        </DialogContent>
        :
        <DialogContent>
          <Button className={classes.buttonIconText} onClick={() => {
            if (this.state.modified) this.saveMultipleSamples();
            this.props.toggleAsbestosSampleDisplayMode();
          }}>SWITCH TO ADVANCED VIEW</Button>
          {Object.values(this.state.samples).map(sample => {
            return <AsbestosSampleEditBasicResultRow key={sample.sampleNumber} that={this} sample={sample} />;
          })}
        </DialogContent>
      }
      {this.props.asbestosSampleDisplayAdvanced && sample ?
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => this.previousSample()} color="inherit"
            disabled={this.state.samples && Object.values(this.state.samples)[0].uid == sample.uid}>Previous</Button>
          <Button onClick={() => this.nextSample()} color="secondary"
            disabled={this.state.samples && Object.values(this.state.samples)[Object.keys(this.state.samples).length - 1].uid == sample.uid}>Next</Button>
          <Button onClick={() => {
              console.log(this.state.modified);
              if (this.state.modified) this.saveSample();
              this.props.hideModal();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
        :
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => {
              if (this.state.modified) this.saveMultipleSamples();
              this.props.hideModal();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      }
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleEditModal)
);
