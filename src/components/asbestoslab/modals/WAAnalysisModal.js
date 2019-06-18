import React from "react";
import reactCSS from 'reactcss';
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { WAANALYSIS, SOILDETAILS } from "../../../constants/modal-types";
import { cocsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import { SketchPicker } from 'react-color';
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Divider from "@material-ui/core/Divider";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from "@material-ui/core/FormLabel";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import UploadIcon from "@material-ui/icons/CloudUpload";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { hideModal, showModalSecondary } from "../../../actions/modal";
import { handleSampleChange } from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";
import _ from "lodash";

const layerNum = 5;

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
    modalProps: state.modal.modalProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
  };
};

class WAAnalysisModal extends React.Component {
  state = {
    sample: {},
    displayColorPicker: {},
  };

  loadProps = () => {
    let sample = this.props.modalProps.sample;
    if (sample.waSoilAnalysis === undefined) sample.waSoilAnalysis = {};
    if (sample.layerNum === undefined) sample.layerNum = {lt2: layerNum, to7: layerNum, gt7: layerNum} ;
    if (sample.waAnalysisDone === undefined) sample.waAnalysisDone = false;
    fractionNames.forEach(fraction => {
      [...Array(layerNum).keys()].forEach(num => {
        if (sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] === undefined) {
          sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] = { result: {}, };
        }
      });
    });
    console.log(sample);
    this.setState({
      sample
    });
  }

  clearProps = () => {
    this.setState({ sample: {}, displayColorPicker: {}, });
  }

  handleColorClick = (num) => {
    console.log(this.state.displayColorPicker);
    this.setState({ displayColorPicker: {
        ...this.state.displayColorPicker,
        [num]: !this.state.displayColorPicker[num],
      }
    })
  };

  handleColorClose = (num) => {
    console.log(this.state.displayColorPicker);
    this.setState({ displayColorPicker: {
        ...this.state.displayColorPicker,
        [num]: false,
      }
    })
  };

  addLayer = (fraction) => {
    let num = this.state.sample.layerNum[fraction] ? this.state.sample.layerNum[fraction] : layerNum;
    num += 1;
    let sampleLayers = this.state.sample.waSoilAnalysis;
    if (sampleLayers[`subfraction${fraction}-${num}`] === undefined) {
      sampleLayers[`subfraction${fraction}-${num}`] = { result: {}, };
    }
    this.setState({
      sample: {
        ...this.state.sample,
        layerNum: {
          ...this.state.sample.layerNum,
          [fraction]: num,
        },
        waSoilAnalysis: sampleLayers,
      }
    });
  };

  removeLayer = (fraction) => {
    let num = this.state.sample.layerNum[fraction] ? this.state.sample.layerNum[fraction] : layerNum;
    num -= 1;
    if (num < 1) num = 1;
    this.setState({
      sample: {
        ...this.state.sample,
        layerNum: {
          ...this.state.sample.layerNum,
          [fraction]: num,
        },
      }
    });
  };

  render() {
    const { classes, modalProps, modalType } = this.props;
    const { sample } = this.state;
    return (
      <div>
      {sample &&
      <Dialog
        open={modalType === WAANALYSIS}
        onClose={() => this.props.hideModal()}
        maxWidth="xl"
        fullWidth={true}
        fullScreen={true}
        onEnter={() => this.loadProps()}
        onExit={() => this.clearProps()}
      >
        <DialogTitle>{`WA Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber} (${sample.description})`}</DialogTitle>
        <DialogContent>
          <Grid container justify='center'>
            <Grid item xs={12} lg={4}>
              <div style={{ borderRadius: 12, borderWidth: 1, borderColor: '#aaa', borderStyle: 'solid', width: '95%', padding: 48, margin: 12, }}>
                <div className={this.props.classes.subheading}>Description</div>
                <TextField
                  id="labDescription"
                  style={{ width: '100%' }}
                  value={sample.labDescription}
                  helperText="Provide a short description of the soil."
                  multiline
                  rows={3}
                  onChange={e => {
                    this.setState({
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
                      sample: {
                        ...sample,
                        labComments: e.target.value,
                      }
                    });
                  }}
                />
                <div className={this.props.classes.subheading}>Sample Conditioning</div>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sample.sampleConditioningFurnace ?
                          sample.sampleConditioningFurnace :
                          false }
                        onChange={e => {
                          this.setState({
                            sample: {
                              ...sample,
                              sampleConditioningFurnace: e.target.checked,
                            }
                          });
                        }}
                        value="sampleConditioningFurnace"
                      />
                    }
                    label="Furnace"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sample.sampleConditioningLowHeat ?
                          sample.sampleConditioningLowHeat :
                          false}
                        onChange={e => {
                          this.setState({
                            sample: {
                              ...sample,
                              sampleConditioningLowHeat: e.target.checked,
                            }
                          });
                        }}
                        value="sampleConditioningLowHeat"
                      />
                    }
                    label="Low Heat/Drying"
                  />
                </FormGroup>

                <div className={this.props.classes.subheading}>Weight</div>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 14, }}>
                  <TextField
                    id="weightReceived"
                    label="Weight as Received"
                    value={sample.weightReceived ? sample.weightReceived : ''}
                    helperText="Record the weight as received (i.e. entire sample received by client)."
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>,
                    }}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          weightReceived: e.target.value,
                        }
                      });
                    }}
                  />
                  <TextField
                    id="weightAnalysed"
                    label="Weight Analysed"
                    style={{ marginLeft: 12, }}
                    value={sample.weightAnalysed ? sample.weightAnalysed : ''}
                    helperText="Record the weight analysed (i.e. portion selected for analysis)."
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>,
                    }}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          weightAnalysed: e.target.value,
                        }
                      });
                    }}
                  />
                  <TextField
                    id="weightConditioned"
                    label="Weight Conditioned"
                    style={{ marginLeft: 12, }}
                    value={sample.weightConditioned ? sample.weightConditioned : ''}
                    helperText="Record the conditioned weight (e.g. after conditioning such as furnacing)."
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>,
                    }}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          weightConditioned: e.target.value,
                        }
                      });
                    }}
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              {this.getTotals()}
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <div style={{ borderRadius: 12, borderWidth: 1, borderColor: '#aaa', borderStyle: 'solid', width: '95%', padding: 48, margin: 12, }}>
                <div className={this.props.classes.subheading}>Soil Type</div>
                <Button
                  variant="outlined"
                  style={{ marginBottom: 16, width: 220 }}
                  onClick={() => {
                    this.props.showModalSecondary({
                      modalType: SOILDETAILS,
                      modalProps: {
                        title: "Edit Soil Description",
                        sample: sample,
                      }
                    });
                  }}
                >
                  Edit Soil Details
                </Button>
              </div>
            </Grid>
          </Grid>
          <Divider />
          <Grid container>
            <Grid item xs={12}>
              {fractionNames.map(fraction => {
                  return this.getFractionColumn(fraction);
                }
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              asbestosSamplesRef
                .doc(sample.uid)
                .update(sample);
              this.props.hideModal();
            }}
            color="primary"
          >
            Submit
          </Button>
          }
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

    [...Array(this.state.sample && this.state.sample.layerNum && this.state.sample.layerNum[fraction] ? this.state.sample.layerNum[fraction] : layerNum).keys()].forEach(num => {
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
      <div key={fraction} style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#aaa',
          borderStyle: 'solid',
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
        <div className={this.props.classes.subheading} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
          Subfractions
          <IconButton size='small' aria-label='add' style={{ marginLeft: 12 }} onClick={() => this.addLayer(fraction)}><AddIcon /></IconButton>
          <IconButton size='small' aria-label='remove' style={{ marginLeft: 12 }} onClick={() => this.removeLayer(fraction)}><RemoveIcon /></IconButton>
        </div>
        {[...Array(this.state.sample && this.state.sample.layerNum && this.state.sample.layerNum[fraction] ? this.state.sample.layerNum[fraction] : layerNum).keys()].map(num => {
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
    );
  }

  getSubfractionRow = (num, fraction) => {
    let chColor, amColor, crColor, umfColor, noColor, orgColor, smfColor = '#ddd';
    let chDivColor, amDivColor, crDivColor, umfDivColor, noDivColor, orgDivColor, smfDivColor = 'white';

    let layer = {};

    if (this.state.sample.waSoilAnalysis && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`]) {
      layer = this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`];
    }

    return(
      <div key={num+fraction}>
        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }} className={this.props.classes.hoverItem}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#aaa",
              marginRight: 10,
              color: "#fff",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              fontWeight: "bold"
            }}
          >
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

  getTotals = () => {
    let weightACM = 0;
    let weightFA = 0;
    let weightAF = 0;
    let weightConditioned = this.state.sample.weightConditioned;
    let ch = false;
    let am = false;
    let cr = false;
    let umf = false;
    let fractionTotalWeight = 0.0;
    let fractionWeightNum = 0;
    let subFractionTotalWeight = 0.0;
    let asbestosTotalWeight = 0.0;
    let allHaveTypes = true;
    let allHaveForms = true;

    fractionNames.forEach(fraction => {
      if (this.state.sample && this.state.sample.waAnalysis && this.state.sample.waAnalysis['fraction' + fraction + 'WeightConditioned'] > 0) {
        fractionWeightNum++;
        fractionTotalWeight += parseFloat(this.state.sample.waAnalysis['fraction' + fraction + 'WeightConditioned']);
      }

      [...Array(this.state.sample && this.state.sample.layerNum && this.state.sample.layerNum[fraction] ? this.state.sample.layerNum[fraction] : layerNum).keys()].forEach(num => {
        if (this.state.sample && this.state.sample.waSoilAnalysis && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] !== undefined) {
          let sub = this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
          if (sub.weight) {
            subFractionTotalWeight += parseFloat(sub.weight);
          }
          if (sub.weight && sub.concentration) {
            let asbestosWeight = (parseFloat(sub.weight) * parseFloat(sub.concentration) / 100);
            asbestosTotalWeight += asbestosWeight;
            if (sub.type === undefined) allHaveForms = false;
            if (sub.type === 'fa') weightFA += parseFloat(asbestosWeight);
              else if (sub.type === 'af') weightAF += parseFloat(asbestosWeight);
              else if (sub.type === 'acm') weightACM += parseFloat(asbestosWeight);
            if (sub.result) {
              if (sub.result.ch === true) ch = true;
              if (sub.result.am === true) am = true;
              if (sub.result.cr === true) cr = true;
              if (sub.result.umf === true) umf = true;
              if (!sub.result.ch && !sub.result.am && !sub.result.cr && !sub.result.umf) allHaveTypes = false;
            } else {
              allHaveTypes = false;
            }
          }
        }
      });
    });

    let match = true;
    if (this.state.sample.result) {
      if ((ch || this.state.sample.result.ch) && ch !== this.state.sample.result.ch) match = false;
      if ((am || this.state.sample.result.am) && am !== this.state.sample.result.am) match = false;
      if ((cr || this.state.sample.result.cr) && cr !== this.state.sample.result.cr) match = false;
      if ((umf || this.state.sample.result.umf) && umf !== this.state.sample.result.umf) match = false;
    }

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
      <div style={{ borderRadius: 12, borderWidth: 1, borderColor: '#aaa', borderStyle: 'solid', width: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 48, margin: 12, }}>
        <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'center', }}>Totals</div>
        <div style={{ flexDirection: 'row', display: 'flex', textAlign: 'right', marginTop: 14, }}>
          <div style={{ width: 160, marginRight: 12, marginTop: 14, }}>
            <div style={{ fontWeight: 500}}>Conditioned Weight: </div>
            <div style={{ fontWeight: 500}}>Fraction Total: </div>
            <div style={{ fontWeight: 500}}>Subfraction Total: </div>
            <div style={{ fontWeight: 500}}>Asbestos Total: </div>
          </div>
          <div style={{ width: 80, marginRight: 12, marginTop: 14, }}>
            <div>{weightConditioned ? <span>{parseFloat(weightConditioned).toFixed(2)}g</span> : <span>N/A</span>}</div>
            <div>{fractionWeightNum === 3 ? <span>{parseFloat(fractionTotalWeight).toFixed(2)}g</span> : <span>N/A</span>}</div>
            <div>{subFractionTotalWeight ? <span>{parseFloat(subFractionTotalWeight).toFixed(4)}g</span> : <span>N/A</span>}</div>
            <div>{asbestosTotalWeight > 0 ? <span>{parseFloat(asbestosTotalWeight).toFixed(4)}g</span> : <span>N/A</span>}</div>
          </div>
        </div>
        <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginTop: 14, }}>
          <div style={{ width: 140, marginRight: 12, }}>
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
            <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationFA > 0.001 ? 'red' : 'black' }}>{concentrationFA.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationAF > 0.001 ? 'red' : 'black' }}>{concentrationAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
            <div style={{ borderBottomStyle: 'dotted', borderBottomWidth: 1}}>{weightConditioned ? <span style={{ color: concentrationFAAF > 0.001 ? 'red' : 'black' }}>{concentrationFAAF.toFixed(4)}%</span> : <span>&nbsp;</span>}</div>
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "row", justifyContent: 'flex-end', marginTop: 14, marginBottom: 14, }}
        >
          <div
            style={{
              backgroundColor: ch ? 'red' : 'white',
              borderRadius: 5
            }}
          >
            <Button
              variant="outlined"
              style={{ margin: 5, color: ch ? 'white' : '#ddd' }}
              onClick={event => {
                event.stopPropagation();
                this.toggleResult("ch");
              }}
            >
              CH
            </Button>
          </div>
          <div
            style={{
              backgroundColor: am ? 'red' : 'white',
              borderRadius: 5
            }}
          >
            <Button
              variant="outlined"
              style={{ margin: 5, color: am ? 'white' : '#ddd' }}
              onClick={event => {
                event.stopPropagation();
                this.toggleResult("am");
              }}
            >
              AM
            </Button>
          </div>
          <div
            style={{
              backgroundColor: cr ? 'red' : 'white',
              borderRadius: 5
            }}
          >
            <Button
              variant="outlined"
              style={{ margin: 5, color: cr ? 'white' : '#ddd' }}
              onClick={event => {
                event.stopPropagation();
                this.toggleResult("cr");
              }}
            >
              CR
            </Button>
          </div>
          <div
            style={{
              backgroundColor: umf ? 'red' : 'white',
              borderRadius: 5
            }}
          >
            <Button
              variant="outlined"
              style={{ margin: 5, color: umf ? 'white' : '#ddd' }}
              onClick={event => {
                event.stopPropagation();
                this.toggleResult("umf");
              }}
            >
              UMF
            </Button>
          </div>
        </div>
        { fractionWeightNum === 3 && parseFloat(fractionTotalWeight) !== parseFloat(weightConditioned) && <div style={{ color: '#a0a0a0', fontWeight: 100, fontSize: 14, }}>
          The weight of all fractions does not match the total conditioned weight.
        </div>}
        { parseFloat(subFractionTotalWeight) > parseFloat(weightConditioned) && <div style={{ color: '#a0a0a0', fontWeight: 100, fontSize: 14, }}>
          The weight of all analysed subfractions exceeds the total conditioned weight of the entire sample!
        </div>}
        { allHaveTypes === false && <div style={{ color: '#a0a0a0', fontWeight: 100, fontSize: 14, }}>
          Not all subfractions have been assigned an asbestos type (i.e. CH/AM/CR/UMF).
        </div>}
        { allHaveForms === false && <div style={{ color: '#a0a0a0', fontWeight: 100, fontSize: 14, }}>
          Not all subfractions have been assigned an asbestos form (i.e. AF/FA/ACM). This will result in an incorrect concentration.
        </div>}
        { match === false && <div style={{ color: '#a0a0a0', fontWeight: 100, fontSize: 14, }}>
          The cumulative result of the analysed fractions does not match with the reported asbestos result for the entire sample. Please check.
        </div>}
      </div>
    );
  }

  setLayerVar = (variable, num, fraction, val) => {
    this.setState({
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

  getResultColor = (state, type, noColor, yesColor) => {
    if(state && state[type] === true) return yesColor;
    return noColor;
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WAAnalysisModal)
);
