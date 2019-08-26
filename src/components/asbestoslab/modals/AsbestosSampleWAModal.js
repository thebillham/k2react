import React from "react";
import { withStyles, } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import classNames from 'classnames';
import { ASBESTOS_SAMPLE_EDIT, SOIL_DETAILS, } from "../../../constants/modal-types";
import "../../../config/tags.css";

import { SamplesTickyBox, SamplesTextyBox, SamplesRadioSelector, SamplesTickyBoxGroup, AsbButton, } from '../../../widgets/FormWidgets';
import { AsbestosClassification } from '../../../config/strings';

import { SketchPicker } from 'react-color';
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
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ConfirmIcon from "@material-ui/icons/ThumbUp";
import ThumbsDown from "@material-ui/icons/ThumbDown";
import Select from 'react-select';
import {
  DatePicker,
  DateTimePicker,
} from "@material-ui/pickers";
import SuggestionField from '../../../widgets/SuggestionField';
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { toggleAsbestosSampleDisplayMode } from "../../../actions/display";
import { addLog, personnelConvert, dateOf } from "../../../actions/local";
import {
  handleSampleChange,
  writeSoilDetails,
  getSampleColors,
  analyticalCriteraOK,
  traceAnalysisRequired,
  recordAnalysis,
  updateResultMap,
  writeDescription,
  writeSampleDimensions,
  writeSampleMoisture,
  getConfirmColor,
  compareAsbestosResult,
} from "../../../actions/asbestosLab";
import moment from "moment";
import {
  asbestosSamplesRef
} from "../../../config/firebase";

const layerNum = 3;

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '1',
};

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
};

class AsbestosSampleWAModal extends React.Component {
  state = initState;

  loadProps = () => {
    console.log('loading props');
    let activeSample = this.props.modalProps.activeSample;
    let samples = {};
    console.log(this.props.samples[this.props.modalProps.activeCoc]);
    console.log(this.props.modalProps.activeCoc);
    Object.values(this.props.samples[this.props.modalProps.activeCoc]).filter(s => s.cocUid === this.props.modalProps.activeCoc)
      .forEach(s => {
        console.log(s);
        samples[s.sampleNumber] = s;
      });
    console.log(samples);
    if (samples[activeSample].layers === undefined) samples[activeSample].layers = {};
    [...Array(layerNum).keys()].forEach(num => {
      if (samples[activeSample].layers[`layer${num+1}`] === undefined) {
        samples[activeSample].layers[`layer${num+1}`] = { color: defaultColor, result: {}, };
      }
    });
    console.log(samples);
    this.setState({
      activeSample,
      samples,
      override: null,
    });
  }

  clearProps = () => {
    console.log('clearing props');
    this.setState(initState);
  }

  handleColorClick = (num) => {
    this.setState({ displayColorPicker: {
        ...this.state.displayColorPicker,
        [num]: !this.state.displayColorPicker[num],
      },
    })
  };

  handleColorClose = (num) => {
    this.setState({ displayColorPicker: {
        ...this.state.displayColorPicker,
        [num]: false,
      }
    })
  };

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
    let num = this.state.sample.layerNum ? this.state.sample.layerNum : layerNum;
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
    if (this.state.modified) this.saveSample();
    let takeThisSample = false;
    Object.values(this.state.samples).reverse().forEach(sample => {
      if (takeThisSample) {
        this.setState({
          modified: false,
          activeSample: sample.sampleNumber,
          override: null,
        });
        takeThisSample = false;
      }
      if (sample.sampleNumber == this.state.activeSample) takeThisSample = true;
    });
  };

  nextSample = () => {
    if (this.state.modified) this.saveSample();
    let takeThisSample = false;
    Object.values(this.state.samples).forEach(sample => {
      if (takeThisSample) {
        this.setState({
          modified: false,
          activeSample: sample.sampleNumber,
          override: null,
        });
        takeThisSample = false;
      }
      if (sample.sampleNumber == this.state.activeSample) takeThisSample = true;
    });
  };

  saveSample = () => {
    const { override } = this.state;
    let sample = this.state.samples[this.state.activeSample];
    asbestosSamplesRef
      .doc(sample.uid)
      .update(sample);

    let log = {
      type: "Analysis",
      log: `Sample ${sample.sampleNumber} (${writeDescription(sample)}) details edited.`,
      sample: sample.uid,
      chainOfCustody: sample.cocUid,
    };
    addLog("asbestosLab", log, this.props.me);
    if (this.props.samples[this.props.modalProps.activeCoc][this.state.activeSample] && this.props.samples[this.props.modalProps.activeCoc][this.state.activeSample].result !== sample.result)
      recordAnalysis(this.props.analyst, sample, this.props.cocs[this.props.modalProps.activeCoc],
        this.props.samples, this.props.sessionID, this.props.me,
        this.props.samples[this.props.modalProps.activeCoc][this.state.activeSample].result !== sample.result,
        this.props.samples[this.props.modalProps.activeCoc][this.state.activeSample].result != sample.weightReceived,
      );
  }

  saveMultipleSamples = () => {
    let result = {};
    let weightReceived = 0;
    let originalSamples = this.props.samples[this.props.modalProps.activeCoc];
    Object.values(this.state.samples).forEach(sample => {
      if (originalSamples[sample.sampleNumber].result !== sample.result || originalSamples[sample.sampleNumber].weightReceived !== sample.weightReceived) {
        recordAnalysis(this.props.analyst, sample, this.props.cocs[this.props.modalProps.activeCoc], this.props.samples, this.props.sessionID, this.props.me,
          sample.result !== originalSamples[sample.sampleNumber].result,
          sample.weightReceived !== originalSamples[sample.sampleNumber].weightReceived
        );
      }
    });
  }

  render() {
    const { classes, modalProps, modalType, samples } = this.props;
    const names = [{ name: 'Client', uid: 'Client', }].concat(Object.values(this.props.staff).sort((a, b) => a.name.localeCompare(b.name)));

    // if (modalType === ASBESTOS_SAMPLE_EDIT) {
      console.log(this.state.samples);
      console.log(this.state.activeSample);
      let sample = this.state.samples[this.state.activeSample];
      let sampleDimensions = null;
      let sampleMoisture = null;
      if (sample) {
        sampleDimensions = writeSampleDimensions(sample, true);
        sampleMoisture = writeSampleMoisture(sample, true);
      }

      let colors = getSampleColors(this.state.samples[this.state.activeSample]);
      return (
      <Dialog
        open={modalType === ASBESTOS_SAMPLE_EDIT}
        onClose={this.props.hideModal}
        maxWidth="lg"
        fullWidth={true}
        onEnter={() => this.loadProps()}
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
                  <SuggestionField that={this} label='Generic Location' suggestions='descriptionSuggestions'
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
                  <SuggestionField that={this} label='Specific Location' suggestions='materialSuggestions'
                    value={sample.material ? sample.material : ''}
                    defaultValue=''
                    controlled={true}
                    onModify={(value) => {
                      this.setState({
                        modified: true,
                        samples: {
                          ...this.state.samples,
                          [this.state.activeSample]: {
                            ...this.state.samples[this.state.activeSample],
                            material: value,
                          },
                        },
                      })
                    }}
                  />
                <InputLabel className={classes.marginTopSmall}>Sampled By</InputLabel>
                <Select
                  isMulti
                  className={classes.selectTight}
                  value={sample.sampledBy ? sample.sampledBy.map(e => ({value: e, label: e})) : null}
                  options={names.map(e => ({ value: e.name, label: e.name }))}
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
                          sampleDate: date.toDate(),
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
                          receivedDate: date.toDate(),
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
                          analysisStartDate: date.toDate(),
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
                          analysisDate: date.toDate(),
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
                <div className={classes.subHeading}>Sampling Method</div>
                  <div className={classes.flexRowLeftDown}>
                  {SamplesRadioSelector(this, sample, 'samplingMethod', 'normal', 'Sampling Method',
                    [{value: 'normal', label: 'Normal'},{value: 'tape', label: 'Tape'},{value: 'swab', label: 'Swab'}])}
                    {(sample.samplingMethod === 'tape' || sample.samplingMethod === 'swab') &&
                    <div>
                      <InputLabel>{`Number of ${sample.samplingMethod}s`}</InputLabel>
                      <Input
                        className={classes.formInputNumber}
                        type='number'
                        value={sample.sampleQuantity}
                        onChange={(event) => this.setState({
                          modified: true,
                          samples: {
                            ...this.state.samples,
                            [this.state.activeSample]: {
                              ...this.state.samples[this.state.activeSample],
                              sampleQuantity: event.target.value,
                            }
                          }
                        })}
                        inputProps={{
                          min: 1,
                        }}
                      />
                    </div>}
                  </div>
                <div className={classes.subHeading}>Weights</div>
                <div className={classes.flexRow}>
                  <div className={classes.formInputMedium}>{SamplesTextyBox(this, sample, 'weightReceived', 'Weight as Received', 'Record the weight as received (e.g. entire sample including tape or swab before any conditioning).', false, 0, 'g', null)}</div>
                  <div className={classes.spacerSmall} />
                  <div className={classes.formInputMedium}>{SamplesTextyBox(this, sample, 'weightSubsample', 'Weight of Subsample', 'Record the weight of the subsample if the entire sample is not analysed.', false, 0, 'g', null)}</div>
                  <div className={classes.spacerSmall} />
                  <div className={classes.formInputMedium}>{SamplesTextyBox(this, sample, 'weightDry', 'Dry Weight', 'Record the weight after drying (~105°).', false, 0, 'g', null)}</div>
                  <div className={classes.spacerSmall} />
                  <div className={classes.formInputMedium}>{SamplesTextyBox(this, sample, 'weightAshed', 'Ashed Weight', 'Record the weight after ashing (~400°).', false, 0, 'g', null)}</div>
                </div>

                {sampleMoisture && <div className={classes.informationBox}>
                  Moisture: {sampleMoisture}%
                </div>}

                <div className={classes.subHeading}>Dimensions</div>
                <div className={classes.flexRow}>
                  <div className={classes.formInputSmall}>{SamplesTextyBox(this, sample, 'dimensionsL', 'Length', null, false, 0, 'mm', null)}</div>
                  <span className={classes.timesSymbol}>X</span>
                  <div className={classes.formInputSmall}>{SamplesTextyBox(this, sample, 'dimensionsW', 'Width', null, false, 0, 'mm', null)}</div>
                  <span className={classes.timesSymbol}>X</span>
                  <div className={classes.formInputSmall}>{SamplesTextyBox(this, sample, 'dimensionsD', 'Depth/Thickness', null, false, 0, 'mm', null)}</div>
                  {sampleDimensions && <span className={classes.informationBox}>
                    {sampleDimensions}
                  </span>}
                </div>

                <div className={classes.subHeading}>Lab Notes</div>
                {SamplesTextyBox(this, sample, 'labDescription', null, 'Provide a detailed description of the material.', true, 1, null, null)}
                {SamplesTextyBox(this, sample, 'labComments', null, 'Note any additional observations or comments.', true, 1, null, null)}
                {SamplesTextyBox(this, sample, 'footnote', null, 'Add a footnote to be included in the issued report. This will be displayed as a footnote below the results table.', true, 1, null, null)}

                {sample.material === 'soil' && <div style={{ padding: 48, margin: 12, justifyContent: 'center', alignItems: 'center', width: 600 }}>
                  <Button
                    variant="outlined"
                    style={{ marginBottom: 16, marginTop: 16, textAlign: 'center' }}
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
                  <div style={{ fontStyle: 'italic'}}>{writeSoilDetails(sample.soilDetails)}</div>
                </div>}
              </Grid>
            </Grid>
            <Divider />
            <Grid container>
              <Grid item xs={12}>
                <div className={classes.flexRowLeftAlignEllipsis}><div className={classes.subHeading}>Result</div></div>
                <div className={classes.flexRowRightAlign}>
                  {['ch','am','cr','umf','no','org','smf'].map(res => {
                    return AsbButton(this.props.classes[`colorsButton${colors[res]}`], this.props.classes[`colorsDiv${colors[res]}`], res, () => this.handleResultClick(res, sample.sampleNumber))
                  })}
                </div>
                <Divider />
                <div className={classNames(classes.subHeading, classes.flexRowCenter)}>
                  Layers
                  <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={this.addLayer}><AddIcon /></IconButton>
                  <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={this.removeLayer}><RemoveIcon /></IconButton>
                </div>
                {[...Array(sample && sample.layerNum ? sample.layerNum : layerNum).keys()].map(num => {
                  return this.getLayerRow(num+1);
                })}
                {sample.confirm && <div><Divider />
                  <div className={classNames(classes.subHeading, classes.flexRowCenter)}>Result Checks</div>
                  {Object.keys(sample.confirm).map(key => {
                    if (key !== 'totalNum') return this.getConfirmRow(sample.confirm[key]);
                  })}
                </div>}
              </Grid>
            </Grid>
            <Divider />
            <Grid container alignItems='flex-start' justify='flex-end'>
              <Grid item xs={3}>
                <div className={classes.subHeading}>Classification</div>
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
              return this.getSampleRow(sample);
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
    // } else return null;
  }

  getSampleRow = (sample) => {
    const { classes } = this.props;
    let colors = getSampleColors(sample);

    return(
      <div key={sample.sampleNumber} className={classes.flexRowHoverPadded}>
        <div className={classes.flexRowLeftAlignEllipsis}>
          <div className={classes.spacerSmall} />
          <div className={classes.circleShaded}>
            {sample.sampleNumber}
          </div>
          {writeDescription(sample)}
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf','no','org','smf'].map(res => {
            return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
            () => this.handleResultClick(res, sample.sampleNumber))
          })}
          <div className={classes.roundButtonShadedInput}>
            <TextField
              id={sample.uid}
              value={sample.weightReceived ? sample.weightReceived : ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>,
                className: classes.roundButtonShadedInputText,
              }}
              onChange={e => {
                this.setState({
                  modified: true,
                  samples: {
                    ...this.state.samples,
                    [sample.sampleNumber]: {
                      ...this.state.samples[sample.sampleNumber],
                      weightReceived: e.target.value,
                    },
                  },
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  getLayerRow = (num) => {
      let layer = {};
      let colors = {};
      let sample = this.state.samples[this.state.activeSample];
      const { classes } = this.props;

      if (sample.layers && sample.layers[`layer${num}`]) {
        layer = sample.layers[`layer${num}`];
        colors = getSampleColors(layer);
      } else {
        colors = getSampleColors(null);
      }

      return(
        <div key={num} className={classes.flexRowHoverMed}>
          <div className={classes.flexRow}>
            <div className={classes.spacerSmall} />
            <div className={classes.verticalCenter}>
              <div className={classes.circleShaded}>
                {num}
              </div>
            </div>
            <div className={classes.columnMedLarge}>
              <SuggestionField that={this} suggestions='materialSuggestions'
                defaultValue={layer.description}
                onModify={(value) => {
                    this.setLayerVar('description', num, value);
                  }}
              />
            </div>
            <div className={classes.verticalCenter}>
              <div className={ classes.colorPickerSwatch } onClick={ () => this.handleColorClick(num) }>
                <div className={classes.colorPickerColor} style={{ background: `rgba(${ layer.color ? layer.color.r : null }, ${ layer.color ? layer.color.g : null }, ${ layer.color ? layer.color.b : null }, ${ layer.color ? layer.color.a : null })` }} />
              </div>
              { this.state.displayColorPicker[num] ? <div className={ classes.colorPickerPopover }>
                <div className={ classes.colorPickerCover } onClick={ () => this.handleColorClose(num) }/>
                <SketchPicker color={ sample.layers[`layer${num}`].color } onChangeComplete={ color => this.setLayerVar('color', num, color.rgb) } />
              </div> : null }
            </div>
            <TextField
              id={`l${num}Concentration`}
              label="Asbestos %"
              className={classes.columnSmall}
              value={layer.concentration ? layer.concentration : 0}
              onChange={e => {
                this.setLayerVar('concentration',num,e.target.value);
              }}
            />
          </div>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(this.props.classes[`colorsButton${colors[res]}`], this.props.classes[`colorsDiv${colors[res]}`], res,
              e => this.toggleLayerRes(res, num))
            })}
          </div>
      </div>
      );
    }

  getConfirmRow = (confirm) => {
    const { classes } = this.props;
    let colors = getSampleColors(confirm);
    let match = compareAsbestosResult(confirm, this.state.samples[this.state.activeSample]);

    //console.log(colors);

    return(
      <div key={confirm.date} className={classes.flexRowHoverMed}>
        <div className={classes.flexRow}>
          <div className={classes.spacerSmall} />
          <div className={classes.verticalCenter}>
            <div className={classes.circle}>
              {match === 'no' ? <ThumbsDown className={classes.iconRegularRed} /> :
              <ConfirmIcon className={classes[`iconRegular${match === 'differentAsbestos' ? 'Orange' : 'Green'}`]} />}
            </div>
          </div>
          <div className={classes.verticalCenter}>
            {confirm.analyst}
          </div>
          <div className={classes.verticalCenter}>
            {moment(confirm.date.toDate()).format('D MMMM YYYY')}
          </div>
          <div className={classes.verticalCenter}>
            {confirm.comments}
          </div>
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf','no','org','smf'].map(res => {
            return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
            null)
          })}
        </div>
    </div>
    );
  }

  setLayerVar = (variable, num, val) => {
    this.setState({
      modified: true,
      samples: {
        ...this.state.samples,
        [this.state.activeSample]: {
          ...this.state.samples[this.state.activeSample],
          layers: {
            ...this.state.samples[this.state.activeSample].layers,
            [`layer${num}`]: {
              ...this.state.samples[this.state.activeSample].layers[`layer${num}`],
              [variable]: val,
            },
          },
        },
      }
    });
  }

  setLayerResVar = (variable, num, val) => {
    this.setState({
      modified: true,
      samples: {
        ...this.state.samples,
        [this.state.activeSample]: {
          ...this.state.samples[this.state.activeSample],
          layers: {
            ...this.state.samples[this.state.activeSample].layers,
            [`layer${num}`]: {
              ...this.state.samples[this.state.activeSample].layers[`layer${num}`],
              result: {
                ...this.state.samples[this.state.activeSample].layers[`layer${num}`].result,
                [variable]: val,
              }
            },
          },
        },
      }
    });
  }

  toggleLayerRes = (res, num) => {
    let sample = this.state.samples[this.state.activeSample];
    let newMap = updateResultMap(res, sample.layers[`layer${num}`].result);
    this.setState({
      modified: true,
      samples: {
        ...this.state.samples,
        [this.state.activeSample]: {
          ...this.state.samples[this.state.activeSample],
          layers: {
            ...this.state.samples[this.state.activeSample].layers,
            [`layer${num}`]: {
              ...this.state.samples[this.state.activeSample].layers[`layer${num}`],
              result: newMap
            },
          },
        },
      }
    });
  }

  removeLayerPositives = (num) => {
    let noRes = true;
    let res = this.state.samples[this.state.activeSample].layers[`layer${num}`].result;
    if (res && res.no !== undefined) noRes = !res.no;

    if (res)
    {
      let update = {no: noRes};
      ['ch','am','cr','umf'].forEach(type => {
        if (res[type]) update[type] = false;
      });
      this.setState({
        modified: true,
        samples: {
          ...this.state.samples,
          [this.state.activeSample]: {
            ...this.state.samples[this.state.activeSample],
            layers: {
              ...this.state.samples[this.state.activeSample].layers,
              [`layer${num}`]: {
                ...this.state.samples[this.state.activeSample].layers[`layer${num}`],
                result: {
                  ...this.state.samples[this.state.activeSample].layers[`layer${num}`].result,
                  ...update,
                }
              },
            },
          },
        }
      });
    }
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleWAModal)
);
