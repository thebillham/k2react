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
import { writeSoilDetails, getWAAnalysisSummary, } from "../../../actions/asbestosLab";
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
          <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', }}>
            <div style={{ width: 502, padding: 48, margin: 12, }}>
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
              <div className={this.props.classes.subHeading}>Description</div>
              <TextField
                id="labDescription"
                style={{ width: '100%' }}
                value={sample.labDescription}
                helperText="Provide a short description of the soil."
                multiline
                rows={3}
                onChange={e => {
                  this.setState({
                    modified: true,
                    sample: {
                      ...sample,
                      labDescription: e.target.value,
                    }
                  });
                }}
              />
              <TextField
                id="labComments"
                style={{ width: '100%' }}
                value={sample.labComments}
                helperText="Note any additional observations or comments."
                multiline
                rows={3}
                onChange={e => {
                  this.setState({
                    modified: true,
                    sample: {
                      ...sample,
                      labComments: e.target.value,
                    }
                  });
                }}
              />

              {SampleTickyBoxGroup(this, sample, 'Sample Conditioning', 'sampleConditioning',
                [{value: 'furnace', label: 'Furnace'},
                {value: 'flame', label: 'Flame'},
                {value: 'lowHeat', label: 'Low Heat/Drying'},
                {value: 'dcm', label: 'Dichloromethane'},
                {value: 'mortarAndPestle', label: 'Mortar and Pestle'},
                {value: 'sieved', label: 'Sieved', },
                ]
              )}

              <div className={this.props.classes.subHeading}>Weight</div>
              <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 14, }}>
                {SampleTextyBox(this, sample, 'weightReceived', 'Weight as Received', 'Record the weight as received (e.g. entire sample received by client).', false, 0, 'g', null)}
                {SampleTextyBox(this, sample, 'weightAnalysed', 'Weight Analysed', 'Record the weight analysed (i.e. portion selected for analysis).', false, 0, 'g', null)}
                {SampleTextyBox(this, sample, 'weightConditioned', 'Weight Conditioned', 'Record the conditioned weight (e.g. after conditioning such as furnacing).', false, 0, 'g', null)}
              </div>
            </div>
            <div>
              {getWAAnalysisSummary(sample)}
              <div style={{ padding: 48, margin: 12, justifyContent: 'center', width: 600 }}>
                <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'center', }}>Geotechnical Soil Description</div>
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
                <div style={{ fontStyle: 'italic'}}>{writeSoilDetails(sample.soilDetails)}</div>
              </div>
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
    let weightConditioned = this.state.sample.weightConditioned;

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
    if (weightConditioned) {
      concentrationFA = weightFA/weightConditioned*100;
      concentrationAF = weightAF/weightConditioned*100;
      concentrationACM = weightACM/weightConditioned*100;
      concentrationFAAF = (weightFA+weightAF)/weightConditioned*100;
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
            id="weightConditioned"
            label="Weight Conditioned"
            style={{ width: 180, marginTop: 12, }}
            value={this.state.sample && this.state.sample.waAnalysis && this.state.sample.waAnalysis['fraction' + fraction + 'WeightConditioned'] ? this.state.sample.waAnalysis['fraction' + fraction + 'WeightConditioned'] : ''}
            helperText="Record the conditioned weight of this fraction (e.g. after conditioning such as furnacing)."
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
                    ['fraction' + fraction + 'WeightConditioned']: e.target.value,
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
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationACM > 0.01 ? 'red' : 'black' }}>{concentrationACM.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationFA > 0.01 ? 'red' : 'black' }}>{concentrationFA.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationAF > 0.001 ? 'red' : 'black' }}>{concentrationAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
              <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationFAAF > 0.001 ? 'red' : 'black' }}>{concentrationFAAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
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
