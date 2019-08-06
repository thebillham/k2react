import React from "react";
import { withStyles, } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import classNames from 'classnames';
import { ASBESTOS_SAMPLE_DETAILS, SOIL_DETAILS, } from "../../../constants/modal-types";
import "../../../config/tags.css";

import { SampleTickyBox, SampleTextyBox, SampleRadioSelector, SampleTickyBoxGroup, AsbButton } from '../../../widgets/FormWidgets';
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
import { SuggestionField, SuggestionFieldSample, } from '../../../widgets/SuggestionField';
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { toggleAsbestosSampleDisplayMode } from "../../../actions/display";
import { addLog, } from "../../../actions/local";
import {
  handleSampleChange,
  writeSoilDetails,
  getSampleColors,
  analyticalCriteraOK,
  traceAnalysisRequired,
  toggleResult,
  updateResultMap,
  writeDescription,
} from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";

const layerNum = 5;

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
    analyst: state.asbestosLab.analyst,
    samples: state.asbestosLab.samples,
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

class AsbestosSampleEditModal extends React.Component {
  state = {
    sample: {},
    samples: {},
    displayColorPicker: {},
    modified: false,
    genericLocationSuggestions: [],
    specificLocationSuggestions: [],
    descriptionSuggestions: [],
    materialSuggestions: [],
    result: {},
    override: false,
  };

  loadProps = () => {
    let sample = this.props.modalProps.doc;
    let samples = this.props.samples[this.props.modalProps.job.uid];
    if (sample.layers === undefined) sample.layers = {};
    [...Array(layerNum).keys()].forEach(num => {
      if (sample.layers[`layer${num+1}`] === undefined) {
        sample.layers[`layer${num+1}`] = { color: defaultColor, result: {}, };
      }
    });
    this.setState({
      sample,
      samples,
    });
  }

  clearProps = () => {
    this.setState({ sample: {}, displayColorPicker: {}, modified: false, });
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

  handleResultClickAdvanced = (res) => {
    const { me, analyst, sessionID, } = this.props;
    let sample = this.state.samples[this.state.sample.sampleNumber];
    let override = false;
    if (
      me.auth &&
      (me.auth["Asbestos Bulk Analysis"] ||
        me.auth["Asbestos Admin"])
    ) {
      // Check analyst has been selected
      if (analyst === "") {
        window.alert(
          "Select analyst from the dropdown at the top of the page."
        );
      }
      // Check if this sample has already been analysed
      if (sample.sessionID !== sessionID && sample.result && !this.state.override) {
        if (
          window.confirm(
            "This sample has already been analysed. Do you wish to override the result?"
          )
        ) {
          override = true;
        } else {
          return;
        }
      }

      let newMap = updateResultMap(res, this.state.result);

      this.setState({
        samples: {
          ...this.state.samples,
          [sample.sampleNumber]: {
            ...this.state.samples[sample.sampleNumber],
            result: newMap,
          }
        },
        modified: true,
        override,
      })

      // Check for situation where all results are unselected

    } else {
      window.alert(
        "You don't have sufficient permissions to set asbestos results."
      );
    }
  };

  handleResultClickBasic = (res, sampleNumber) => {
    const { me, analyst, sessionID, } = this.props;
    let sample = this.state.samples[sampleNumber];
    let override = this.state.override;
    if (
      me.auth &&
      (me.auth["Asbestos Bulk Analysis"] ||
        me.auth["Asbestos Admin"])
    ) {
      // Check analyst has been selected
      if (analyst === "") {
        window.alert(
          "Select analyst from the dropdown at the top of the page."
        );
      }
      // Check if this sample has already been analysed
      if (sample.sessionID !== sessionID && sample.result && !this.state.override) {
        if (
          window.confirm(
            "This sample has already been analysed. Do you wish to override the result?"
          )
        ) {
          override = true;
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
      })

      // Check for situation where all results are unselected

    } else {
      window.alert(
        "You don't have sufficient permissions to set asbestos results."
      );
    }
  };

  addLayer = () => {
    let num = this.state.sample.layerNum ? this.state.sample.layerNum : layerNum;
    num += 1;
    let sampleLayers = this.state.sample.layers;
    if (sampleLayers[`layer${num}`] === undefined) {
      sampleLayers[`layer${num}`] = { color: defaultColor, result: {}, };
    }
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        layerNum: num,
        layers: sampleLayers,
      },
    });
  };

  removeLayer = () => {
    let num = this.state.sample.layerNum ? this.state.sample.layerNum : layerNum;
    num -= 1;
    if (num < 1) num = 1;
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        layerNum: num,
      }
    });
  };

  previousSample = () => {
    if (this.state.modified) this.saveSample();
    let takeThisSample = false;
    Object.values(this.props.samples[this.props.modalProps.job.uid]).reverse().forEach(sample => {
      if (takeThisSample) {
        this.setState({
          modified: false,
          sample: sample,
        });
        takeThisSample = false;
      }
      if (sample.uid === this.state.sample.uid) takeThisSample = true;
    });
  };

  nextSample = () => {
    if (this.state.modified) this.saveSample();
    let takeThisSample = false;
    Object.values(this.props.samples[this.props.modalProps.job.uid]).forEach(sample => {
      if (takeThisSample) {
        this.setState({
          modified: false,
          sample: sample,
        });
        takeThisSample = false;
      }
      if (sample.uid === this.state.sample.uid) takeThisSample = true;
    });
  };

  saveSample = () => {
    const { sample, override } = this.state;
    asbestosSamplesRef
      .doc(sample.uid)
      .update(sample);

    let log = {
      type: "Analysis",
      log: `Sample ${sample.sampleNumber} (${sample.description} ${
            sample.material
          }) details edited.`,
      sample: sample.uid,
      chainOfCustody: sample.cocUid,
    };
    addLog("asbestosLab", log, this.props.me);
  }

  saveMultipleSamples = () => {
    let result = {};
    let weightReceived = 0;
    let originalSamples = this.props.samples[this.props.modalProps.job.uid];
    Object.values(this.state.samples).forEach(sample => {
      console.log(sample);
      console.log(originalSamples[sample.sampleNumber]);
      if (originalSamples[sample.sampleNumber].result !== sample.result || originalSamples[sample.sampleNumber].weightReceived !== sample.weightReceived) {
        if (sample.result) result = sample.result;
        if (sample.weightReceived) weightReceived = sample.weightReceived;
        asbestosSamplesRef
          .doc(sample.uid)
          .update({result, weightReceived});

        let log = {
          type: "Analysis",
          log: `Sample ${sample.sampleNumber} (${sample.description} ${
                sample.material
              }) results changed.`,
          sample: sample.uid,
          chainOfCustody: sample.cocUid,
        };
        addLog("asbestosLab", log, this.props.me);
      }
    });
  }

  render() {
    const { classes, modalProps, modalType, samples } = this.props;
    if (modalType === ASBESTOS_SAMPLE_DETAILS) {
      let sample = this.state.sample;
      let colors = {};
      if (this.state.samples && this.state.samples[sample.sampleNumber]) colors = getSampleColors(this.state.samples[sample.sampleNumber]);
      return (
      <Dialog
        open={modalType === ASBESTOS_SAMPLE_DETAILS}
        onClose={this.props.hideModal}
        maxWidth="lg"
        fullWidth={true}
        onEnter={() => this.loadProps()}
        onExit={() => this.clearProps()}
      >
        {this.props.asbestosSampleDisplayAdvanced ?
        <div>
          <DialogTitle>{`Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber} (${sample.description})`}</DialogTitle>
          <DialogContent>
            <Button className={classes.buttonIconText} onClick={() => {
              if (this.state.modified) this.saveSample();
              this.props.toggleAsbestosSampleDisplayMode();
            }}>SWITCH TO BASIC VIEW</Button>
            <Grid container alignItems='flex-start' justify='flex-end'>
              <Grid item xs={5}>
                <div className={classes.subHeading}>Basic Information</div>
                {SuggestionFieldSample(this, false, 'Generic Location', 'genericLocation')}
                {SuggestionFieldSample(this, false, 'Specific Location', 'specificLocation')}
                {SuggestionFieldSample(this, false, 'Description', 'description')}
                {SuggestionFieldSample(this, false, 'Material', 'material')}
                <div className={classes.subHeading}>Lab Description</div>
                {SampleTextyBox(this, sample, 'labDescription', null, 'Provide a detailed description of the material.', true, 3, null, null)}
                {SampleTextyBox(this, sample, 'labComments', null, 'Note any additional observations or comments.', true, 3, null, null)}

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
                            sample: {
                              ...this.state.sample,
                              soilDetails: details,
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
              <Grid item xs={1} />
              <Grid item xs={6}>
                <div className={classes.subHeading}>Sampling Method</div>
                  <div className={classes.flexRowLeftDown}>
                  {SampleRadioSelector(this, sample, 'samplingMethod', 'normal', 'Sampling Method',
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
                          sample: {
                            ...this.state.sample,
                            sampleQuantity: event.target.value,
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
                  <div className={classes.formInputMedium}>{SampleTextyBox(this, sample, 'weightReceived', 'Weight as Received', 'Record the weight as received (e.g. entire sample including tape or swab before any conditioning).', false, 0, 'g', null)}</div>
                  <div className={classes.spacerSmall} />
                  <div className={classes.formInputMedium}>{SampleTextyBox(this, sample, 'weightSubsample', 'Weight of Subsample', 'Record the weight of the subsample if the entire sample is not analysed.', false, 0, 'g', null)}</div>
                  <div className={classes.spacerSmall} />
                  <div className={classes.formInputMedium}>{SampleTextyBox(this, sample, 'weightDry', 'Dry Weight', 'Record the weight after drying (~105°).', false, 0, 'g', null)}</div>
                  <div className={classes.spacerSmall} />
                  <div className={classes.formInputMedium}>{SampleTextyBox(this, sample, 'weightAshed', 'Ashed Weight', 'Record the weight after ashing (~400°).', false, 0, 'g', null)}</div>
                </div>

                <div className={classes.subHeading}>Dimensions</div>
                <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                  <div className={classes.formInputSmall}>{SampleTextyBox(this, sample, 'dimensionsL', 'Length', null, false, 0, 'mm', null)}</div>
                  <span className={classes.timesSymbol}>X</span>
                  <div className={classes.formInputSmall}>{SampleTextyBox(this, sample, 'dimensionsW', 'Width', null, false, 0, 'mm', null)}</div>
                  <span className={classes.timesSymbol}>X</span>
                  <div className={classes.formInputSmall}>{SampleTextyBox(this, sample, 'dimensionsD', 'Depth/Thickness', null, false, 0, 'mm', null)}</div>
                </div>
              </Grid>
            </Grid>
            <Divider />
            <Grid container>
              <Grid item xs={12}>
                <div className={classes.flexRowLeftAlignEllipsis}><div className={classes.subHeading}>Result</div></div>
                <div className={classes.flexRowRightAlign}>
                  {['ch','am','cr','umf','no','org','smf'].map(res => {
                    return AsbButton(this.props.classes[`colorsButton${colors[res]}`], this.props.classes[`colorsDiv${colors[res]}`], res, () => this.handleResultClickAdvanced(res))
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
                <Divider />
                <div className={classNames(classes.subHeading, classes.flexRowCenter)}>Result Checks</div>

              </Grid>
            </Grid>
            <Divider />
            <Grid container alignItems='flex-start' justify='flex-end'>
              <Grid item xs={5}>
                <div className={classes.subHeading}>Classification</div>
                {SampleRadioSelector(this, sample, 'classification', 'homo', 'Classification',
                  [{value: 'homo', label: 'Homogenous', tooltip: 'Uniform distribution of fibres of any type through the entire sample or in each discernibly discrete layer of the sample (sprayed asbestos, mastic, vermiculite)'},
                  {value: 'homolayers', label: 'Homogenous Layers', tooltip: 'Uniform distribution of fibres of any type through each discernibly discrete layer of the sample (asbestos-cement, paper-backed vinyl)'},
                  {value: 'mixedlayers', label: 'Mixed Layers', tooltip: 'Mix of homogenous and non-homogenous layers (asbestos-cement with soil attached)'},
                  {value: 'nonhomo', label: 'Non-homogenous', tooltip: 'Small, discrete amounts of asbestos distributed unevenly in a large body of non-asbestos material (e.g. dust, soil)'},
                  {value: 'soil', label: 'Soil'},{value: 'ore', label: 'Ore'}],
                )}

                {SampleTickyBox(this, 'Asbestos Evident', sample, 'asbestosEvident',)}

                {traceAnalysisRequired(sample)}

                {SampleTickyBoxGroup(this, sample, 'Sample Conditioning', 'sampleConditioning',
                  [{value: 'furnace', label: 'Furnace'},
                  {value: 'flame', label: 'Flame'},
                  {value: 'lowHeat', label: 'Low Heat/Drying'},
                  {value: 'dcm', label: 'Dichloromethane'},
                  {value: 'mortarAndPestle', label: 'Mortar and Pestle'},
                  {value: 'sieved', label: 'Sieved', },
                  ]
                )}

                {SampleTickyBoxGroup(this, sample, 'Analytical Critera', 'analyticalCriteria',
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


              </Grid>
              <Grid item xs={1} />
              <Grid item xs={6}>
                <div className={classes.informationBox}>
                  {AsbestosClassification(sample.classification)}
                </div>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.props.hideModal()} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => this.previousSample()} color="inherit" disabled={modalProps && modalProps.job && modalProps.job.sampleList && modalProps.job.sampleList[0] === sample.uid}>Previous</Button>
            <Button onClick={() => this.nextSample()} color="secondary" disabled={modalProps && modalProps.job && modalProps.job.sampleList && modalProps.job.sampleList[modalProps.job.sampleList.length - 1] === sample.uid}>Next</Button>
            <Button onClick={() => {
                if (this.state.modified) this.saveSample();
                this.props.hideModal();
              }}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </div> :
        <div>
          <DialogTitle>{`Analysis Details for Job ${this.props.modalProps.job.jobNumber}`}</DialogTitle>
          <DialogContent>
            <Button className={classes.buttonIconText} onClick={() => {
              if (this.state.modified) this.saveMultipleSamples();
              this.props.toggleAsbestosSampleDisplayMode();
            }}>SWITCH TO ADVANCED VIEW</Button>
            {Object.values(this.state.samples).map(sample => {
              return this.getSampleRow(sample);
            })}
          </DialogContent>
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
        </div>
        }
        </Dialog>
      );
    } else return null;
  }

  getSampleRow = (sample) => {
    const { classes } = this.props;
    let colors = getSampleColors(sample);

    return(
      <div key={sample.sampleNumber} className={classes.flexRowHoverPadded}>
        <div className={classes.flexRowLeftAlignEllipsis}>
          <div className={classes.circleShaded}>
            {sample.sampleNumber}
          </div>
          {writeDescription(sample)}
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf','no','org','smf'].map(res => {
            return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
            () => this.handleResultClickBasic(res, sample.sampleNumber))
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
      const { classes } = this.props;

      if (this.state.sample.layers && this.state.sample.layers[`layer${num}`]) {
        layer = this.state.sample.layers[`layer${num}`];
        colors = getSampleColors(layer);
      } else {
        colors = getSampleColors(null);
      }

      return(
        <div key={num} className={classes.flexRowHover}>
          <div className={classes.flexRowLeftAlignEllipsis}>
            <div className={classes.circleShaded}>
              {num}
            </div>
            {SuggestionField(this, false, 'Description', 'materialSuggestions', layer.description,
              (value) => {
                this.setLayerVar('description', num, value);
                }
            )}

            <div className={classes.marginRight}>
              <div className={ classes.colorPickerSwatch } onClick={ () => this.handleColorClick(num) }>
                <div className={classes.colorPickerColor} style={{ background: `rgba(${ layer.color ? layer.color.r : null }, ${ layer.color ? layer.color.g : null }, ${ layer.color ? layer.color.b : null }, ${ layer.color ? layer.color.a : null })` }} />
              </div>
              { this.state.displayColorPicker[num] ? <div className={ classes.colorPickerPopover }>
                <div className={ classes.colorPickerCover } onClick={ () => this.handleColorClose(num) }/>
                <SketchPicker color={ this.state.sample.layers[`layer${num}`].color } onChangeComplete={ color => this.setLayerVar('color', num, color.rgb) } />
              </div> : null }

            </div>
            <TextField
              id={`l${num}Concentration`}
              label="Asbestos %"
              className={classes.marginRight}
              value={layer.concentration ? layer.concentration : 0}
              onChange={e => {
                this.setLayerVar('concentration',num,e.target.value);
              }}
            />
          </div>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(this.props.classes[`colorsButton${colors[res]}`], this.props.classes[`colorsDiv${colors[res]}`], res,
              e => this.toggleLayerRes(res, num, layer, true))
            })}
          </div>
      </div>
      );
    }

  setLayerVar = (variable, num, val) => {
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        layers: {
          ...this.state.sample.layers,
          [`layer${num}`]: {
            ...this.state.sample.layers[`layer${num}`],
            [variable]: val,
          }
        }
      }
    })
    console.log(this.state.sample.layers[`layer${num}`]);
  }

  setLayerResVar = (variable, num, val) => {
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        layers: {
          ...this.state.sample.layers,
          [`layer${num}`]: {
            ...this.state.sample.layers[`layer${num}`],
            result: {
              ...this.state.sample.layers[`layer${num}`].result,
              [variable]: val,
            }
          }
        }
      }
    })
  }

  toggleLayerRes = (type, num, stateLayer, removeNo) => {
    let update = {};
    if (removeNo) update = {no: false};
    if (this.state.sample.layers[`layer${num}`] && this.state.sample.layers[`layer${num}`].result && this.state.sample.layers[`layer${num}`].result[type] !== undefined) {
      update[type] = !this.state.sample.layers[`layer${num}`].result[type];
    } else {
      update[type] = true;
    }
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        layers: {
          ...this.state.sample.layers,
          [`layer${num}`]: {
            ...this.state.sample.layers[`layer${num}`],
            result: {
              ...this.state.sample.layers[`layer${num}`].result,
              ...update,
            }
          }
        }
      }
    });
  }

  removeLayerPositives = (num) => {
    let noRes = true;
    let res = this.state.sample.layers[`layer${num}`].result;
    if (res && res.no !== undefined) noRes = !res.no;

    if (res)
    {
      let update = {no: noRes};
      ['ch','am','cr','umf'].forEach(type => {
        if (res[type]) update[type] = false;
      });
      this.setState({
        modified: true,
        sample: {
          ...this.state.sample,
          layers: {
            ...this.state.sample.layers,
            [`layer${num}`]: {
              ...this.state.sample.layers[`layer${num}`],
              result: {
                ...this.state.sample.layers[`layer${num}`].result,
                ...update,
              }
            }
          }
        }
      });
    }
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleEditModal)
);
