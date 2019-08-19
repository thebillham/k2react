import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { WA_ANALYSIS, SOIL_DETAILS } from "../../../constants/modal-types";
import "../../../config/tags.css";

import { SampleTextyBox, SampleTickyBoxGroup, } from '../../../widgets/FormWidgets';
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Switch from "@material-ui/core/Switch";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from "@material-ui/core/FormLabel";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { hideModal, showModalSecondary } from "../../../actions/modal";
import { writeSoilDetails, getWAAnalysisSummary, writeSampleMoisture } from "../../../actions/asbestosLab";
import { addLog, } from '../../../actions/local';
import {
  asbestosSamplesRef
} from "../../../config/firebase";

const waLayerNum = 5;

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '1',
};

const fractionNames = ['gt7','to7','lt2'];

const mapStateToProps = state => {
  return {
    me: state.local.me,
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
  };
};

class WAAnalysisModal extends React.Component {
  state = {
    sample: {},
    displayColorPicker: {},
    modified: false,
  };

  loadProps = () => {
    let sample = this.props.modalProps.doc;
    if (sample.waSoilAnalysis === undefined) sample.waSoilAnalysis = {};
    if (sample.waLayerNum === undefined) sample.waLayerNum = {lt2: waLayerNum, to7: waLayerNum, gt7: waLayerNum} ;
    if (sample.waAnalysisComplete === undefined) sample.waAnalysisComplete = false;
    fractionNames.forEach(fraction => {
      [...Array(waLayerNum).keys()].forEach(num => {
        if (sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] === undefined) {
          sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] = { result: {}, };
        }
      });
    });
    //console.log(sample);
    this.setState({
      sample
    });
  }

  clearProps = () => {
    this.setState({ sample: {}, displayColorPicker: {}, modified: false, });
  }

  render() {
    const { classes, modalProps, modalType, me } = this.props;
    const { sample } = this.state;

    let sampleMoisture = null;
    if (sample) sampleMoisture = writeSampleMoisture(sample, true);
    return (
      <div>
      {modalType === WA_ANALYSIS && sample &&
      <Dialog
        open={modalType === WA_ANALYSIS}
        onClose={this.props.hideModal}
        maxWidth="xl"
        fullWidth={true}
        fullScreen={true}
        onEnter={this.loadProps}
        onExit={this.clearProps}
      >
        <DialogTitle>{`WA Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber} (${sample.description})`}</DialogTitle>
        <DialogContent>
          <div className={classes.flexRow}>
            <div className={classes.columnExtraExtraLarge}>
              <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'center', }}>Analysis Details</div>
              <FormControlLabel
                control={
                  <Switch
                    checked={sample.waAnalysisComplete === true ? true : false}
                    onClick={e => {
                      this.setState({
                        modified: true,
                        sample: {
                          ...sample,
                          waAnalysisComplete: e.target.checked,
                        }
                      });
                      let log = {
                        type: "Analysis",
                        log: e.target.checked === true
                          ? `Sample ${sample.sampleNumber} (${sample.description} ${
                              sample.material
                            }) WA Analysis marked as complete.`
                          : `Sample ${sample.sampleNumber} (${sample.description} ${
                              sample.material
                            }) WA Analysis marked as incomplete.`,
                        sample: sample.uid,
                        chainOfCustody: sample.cocUid,
                      };
                      addLog("asbestosLab", log, me);
                    }}
                    value="waAnalysisComplete"
                    color="primary"
                  />
                }
                label="WA Analysis Complete"
              />

              {/*{SampleTickyBoxGroup(this, sample, 'Sample Conditioning', 'sampleConditioning',
                [{value: 'furnace', label: 'Furnace'},
                {value: 'flame', label: 'Flame'},
                {value: 'lowHeat', label: 'Low Heat/Drying'},
                {value: 'dcm', label: 'Dichloromethane'},
                {value: 'mortarAndPestle', label: 'Mortar and Pestle'},
                {value: 'sieved', label: 'Sieved', },
                ]
              )}*/}

              <div className={classes.subHeading}>Lab Notes</div>
              {SampleTextyBox(this, sample, 'labDescription', null, 'Provide a detailed description of the material.', true, 1, null, null)}
              {SampleTextyBox(this, sample, 'labComments', null, 'Note any additional observations or comments.', true, 1, null, null)}
              {SampleTextyBox(this, sample, 'footnote', null, 'Add a footnote to be included in the issued report. This will be displayed as a footnote below the results table.', true, 1, null, null)}
              {SampleTextyBox(this, sample, 'asbestosFormDescription', null, 'Give a short description of the asbestos form. This will appear in the report (e.g. Asbestos cement, loose fibres).', false, 1, null, null)}

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

              {sampleMoisture && <div className={classes.informationBox}>
                Moisture: {sampleMoisture}%
              </div>}
              <div style={{ padding: 48, margin: 12, justifyContent: 'center', width: 600 }}>
                <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'center', }}>Geotechnical Soil Description</div>
                <div style={{ textAlign: 'center'}}>
                  <Button
                    variant="outlined"
                    style={{ marginBottom: 16, marginTop: 16, }}
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
                    Edit Soil Details
                  </Button>
                </div>
                <div style={{ fontStyle: 'italic'}}>{writeSoilDetails(sample.soilDetails)}</div>
              </div>
            </div>
            <div>
              {getWAAnalysisSummary(sample)}
            </div>
          </div>
          {fractionNames.map(fraction => {
              return this.getFractionColumn(fraction);
            }
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button disabled={!this.state.modified}
            onClick={() => {
              asbestosSamplesRef
                .doc(sample.uid)
                .update(sample);
              this.props.hideModal();

              let log = {
                type: "Analysis",
                log: `Sample ${sample.sampleNumber} (${sample.description} ${
                      sample.material
                    }) WA analysis edited.`,
                sample: sample.uid,
                chainOfCustody: sample.cocUid,
              };
              addLog("asbestosLab", log, me);
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>}
      </div>
    );
  }

  getFractionColumn = (fraction) => {
    let title = '< 2mm Fraction';
    if (fraction === 'to7') title = '2mm-7mm Fraction';
    else if (fraction === 'gt7') title = '> 7mm Fraction';
    let weightFA = 0.0;
    let weightAF = 0.0;
    let weightACM = 0.0;
    let weightDry = this.state.sample.weightDry;

    [...Array(this.state.sample && this.state.sample.waLayerNum && this.state.sample.waLayerNum[fraction] ? this.state.sample.waLayerNum[fraction] : waLayerNum).keys()].forEach(num => {
      if (this.state.sample && this.state.sample.waSoilAnalysis && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] !== undefined) {
        let sub = this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
        if (sub.weight && sub.concentration) {
          let asbestosWeight = (parseFloat(sub.weight) * parseFloat(sub.concentration) / 100);

          if (sub.type === 'fa') weightFA += parseFloat(asbestosWeight);
            else if (sub.type === 'af') weightAF += parseFloat(asbestosWeight);
            else if (sub.type === 'acm') weightACM += parseFloat(asbestosWeight);
        }
      }
    });

    let concentrationFA = 0.0;
    let concentrationAF = 0.0;
    let concentrationACM = 0.0;
    let concentrationFAAF = 0.0;
    if (weightDry) {
      concentrationFA = weightFA/weightDry*100;
      concentrationAF = weightAF/weightDry*100;
      concentrationACM = weightACM/weightDry*100;
      concentrationFAAF = (weightFA+weightAF)/weightDry*100;
    }

    return(
      <div key={fraction}>
        <hr />
        <div style={{
            width: 1150,
            display: 'flex',
            flexDirection: 'column',
            padding: 48,
            margin: 12,
          }}>
          <div style={{ fontWeight: 500, fontSize: 16, }}>{title}</div>
          <TextField
            id="weightAshed"
            label="Ashed Weight"
            style={{ width: 180, marginTop: 12, }}
            value={this.state.sample && this.state.sample.waAnalysis && this.state.sample.waAnalysis['fraction' + fraction + 'WeightAshed'] ? this.state.sample.waAnalysis['fraction' + fraction + 'WeightAshed'] : ''}
            helperText="Record the weight of this fraction after ashing at ~400°C"
            InputProps={{
              endAdornment: <InputAdornment position="end">g</InputAdornment>,
            }}
            onChange={e => {
              this.setState({
                modified: true,
                sample: {
                  ...this.state.sample,
                  waAnalysis: {
                    ...this.state.sample.waAnalysis,
                    ['fraction' + fraction + 'WeightAshed']: e.target.value,
                  }
                }
              });
            }}
          />
          <div className={this.props.classes.subHeading} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
            Subfractions
            <IconButton size='small' aria-label='add' style={{ marginLeft: 12 }} onClick={() => this.addLayer(fraction)}><AddIcon /></IconButton>
            <IconButton size='small' aria-label='remove' style={{ marginLeft: 12 }} onClick={() => this.removeLayer(fraction)}><RemoveIcon /></IconButton>
          </div>
          {[...Array(this.state.sample && this.state.sample.waLayerNum && this.state.sample.waLayerNum[fraction] ? this.state.sample.waLayerNum[fraction] : waLayerNum).keys()].map(num => {
            return this.getSubfractionRow(num+1, fraction);
          })}
          <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginTop: 14, }}>
            <div style={{ marginRight: 12, }}>
              <div style={{ fontWeight: 500 }}>Type</div>
              <div>ACM Bonded</div>
              <div>Friable Asbestos</div>
              <div>Asbestos Fines</div>
              <div>FA/AF Total</div>
            </div>
            <div style={{ width: 140, }}>
              <div style={{ fontWeight: 500 }}>Asbestos Weight</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightACM.toFixed(6)}g</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightFA.toFixed(6)}g</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightAF.toFixed(6)}g</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{(weightFA+weightAF).toFixed(6)}g</div>
            </div>
            <div style={{ width: 200, marginRight: 14, }}>
              <div style={{ fontWeight: 500 }}>Asbestos Concentration</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightDry ? <span style={{ color: concentrationACM > 0.01 ? 'red' : 'black' }}>{concentrationACM.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightDry ? <span style={{ color: concentrationFA > 0.01 ? 'red' : 'black' }}>{concentrationFA.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightDry ? <span style={{ color: concentrationAF > 0.001 ? 'red' : 'black' }}>{concentrationAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightDry ? <span style={{ color: concentrationFAAF > 0.001 ? 'red' : 'black' }}>{concentrationFAAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getSubfractionRow = (num, fraction) => {
    const { classes } = this.props;

    let layer = {};

    if (this.state.sample.waSoilAnalysis && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`]) {
      layer = this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`];
    }

    return(
      <div key={num+fraction}>
        <div className={classes.flexRowHover}>
          <div className={classes.circleShaded}>
            {num}
          </div>
          <TextField
            id={`l${num}Weight`}
            label="Weight (g)"
            InputLabelProps={{ shrink: true }}
            style={{ width: 100, marginRight: 14, }}
            value={layer.weight ? layer.weight : ''}
            type='number'
            onChange={e => {
              this.setLayerVar('weight', num, fraction, e.target.value);
            }}
          />
          <TextField
            id={`l${num}Concentration`}
            label="Asbestos %"
            InputLabelProps={{ shrink: true }}
            InputProps = {{ inputProps: { min: 0, max: 100 }}}
            style={{ width: 90, marginRight: 14, }}
            value={layer.concentration ? layer.concentration : ''}
            type='number'
            onChange={e => {
              this.setLayerVar('concentration', num, fraction, e.target.value);
            }}
          />
          <TextField
            id={`l${num}AsbestosWeight`}
            label="Asbestos Weight (g)"
            InputLabelProps={{ shrink: true, readOnly: true, }}
            style={{ width: 150, marginRight: 48, }}
            value={layer.concentration && layer.weight ? (parseFloat(layer.weight) * parseFloat(layer.concentration) / 100).toPrecision(3) : ''}
          />

          <FormControl component="fieldset">
            <RadioGroup
              aria-label="Type"
              name="type"
              value={ layer.type ? layer.type : '' }
              row
              onChange={e => {
                this.setLayerVar('type', num, fraction, e.target.value);
              }}
            >
              <FormControlLabel value="acm" control={<Radio />} label="ACM" />
              <FormControlLabel value="fa" control={<Radio />} label="FA" />
              <FormControlLabel value="af" control={<Radio />} label="AF" />
            </RadioGroup>
          </FormControl>
          <div style={{width: 80}} />
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={layer.result && layer.result.ch ?
                    layer.result.ch :
                    false }
                  onChange={e => { this.setLayerResVar('ch', num, fraction, e.target.checked) }}
                  value="ch"
                />
              }
              label="CH"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={layer.result && layer.result.am ?
                    layer.result.am :
                    false }
                  onChange={e => { this.setLayerResVar('am', num, fraction, e.target.checked) }}
                  value="am"
                />
              }
              label="AM"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={layer.result && layer.result.cr ?
                    layer.result.cr :
                    false }
                  onChange={e => { this.setLayerResVar('cr', num, fraction, e.target.checked) }}
                  value="cr"
                />
              }
              label="CR"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={layer.result && layer.result.umf ?
                    layer.result.umf :
                    false }
                  onChange={e => { this.setLayerResVar('umf', num, fraction, e.target.checked) }}
                  value="umf"
                />
              }
              label="UMF"
            />
          </FormGroup>
        </div>
      </div>
    );
  }

  setLayerVar = (variable, num, fraction, val) => {
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        waSoilAnalysis: {
          ...this.state.sample.waSoilAnalysis,
          [`subfraction${fraction}-${num}`]: {
            ...this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`],
            [variable]: val,
          }
        }
      }
    });
  }

  setLayerResVar = (variable, num, fraction, val) => {
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        waSoilAnalysis: {
          ...this.state.sample.waSoilAnalysis,
          [`subfraction${fraction}-${num}`]: {
            ...this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`],
            result: {
              ...this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`].result,
              [variable]: val,
            }
          }
        }
      }
    })
  }

  toggleLayerRes = (type, num, fraction, stateLayer ) => {
    let update = {};
    if (this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`]
      && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`].result
      && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`].result[type] !== undefined) {
      update[type] = !this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`].result[type];
    } else {
      update[type] = true;
    }
    this.setState({
      modified: true,
      sample: {
        ...this.state.sample,
        waSoilAnalysis: {
          ...this.state.sample.waSoilAnalysis,
          [`subfraction${fraction}-${num}`]: {
            ...this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`],
            result: {
              ...this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`].result,
              ...update,
            }
          }
        }
      }
    });
  }

  getResultColour = (state, type, noColor, yesColor) => {
    if(state && state[type] === true) return yesColor;
    return noColor;
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WAAnalysisModal)
);
