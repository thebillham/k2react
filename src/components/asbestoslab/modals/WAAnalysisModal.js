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
    ['lt2','to7','gt7'].forEach(fraction => {
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
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={5}>
              <Button
                variant="outlined"
                style={{ marginBottom: 16, width: 220 }}
                onClick={() => {
                  this.props.showModalSecondary({
                    modalType: SOILDETAILS,
                    modalProps: {
                      title: "Edit Soil Details",
                      sample: sample,
                    }
                  });
                }}
              >
                Edit Soil Details
              </Button>
              <div className={this.props.classes.subheading}>Description</div>
              <TextField
                id="labDescription"
                style={{ width: '100%' }}
                value={sample.labDescription}
                helperText="Provide a detailed description of the material."
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
                      checked={sample.sampleConditioningFlame ?
                        sample.sampleConditioningFlame :
                        false}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            sampleConditioningFlame: e.target.checked,
                          }
                        });
                      }}
                      value="sampleConditioningFlame"
                    />
                  }
                  label="Flame"
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sample.sampleConditioningDCM ?
                        sample.sampleConditioningDCM :
                        false}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            sampleConditioningDCM: e.target.checked,
                          }
                        });
                      }}
                      value="sampleConditioningDCM"
                    />
                  }
                  label="Dichloromethane"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={6}>
              <div className={this.props.classes.subheading}>Weight</div>
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <TextField
                  id="weightReceived"
                  label="Weight as Received"
                  value={sample.weightReceived ? sample.weightReceived : ''}
                  helperText="Record the weight as received (e.g. before any conditioning)."
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
                  helperText="Record the weight analysed (e.g. after conditioning such as furnacing)."
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
              </div>
              <div className={this.props.classes.subheading}>Dimensions</div>
              <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                <TextField
                  id="dimensionsL"
                  label="Length"
                  style={{ width: '100%', margin: 12, }}
                  value={sample.dimensionsL ? sample.dimensionsL : ''}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                  }}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        dimensionsL: e.target.value,
                      }
                    });
                  }}
                />
                <span style={{ fontWeight: 450, fontSize: 12, margin: 14, }}>X</span>
                <TextField
                  id="dimensionsW"
                  label="Width"
                  style={{ width: '100%', margin: 12, }}
                  value={sample.dimensionsW ? sample.dimensionsW : ''}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                  }}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        dimensionsW: e.target.value,
                      }
                    });
                  }}
                />
                <span style={{ fontWeight: 450, fontSize: 12, margin: 14, }}>X</span>
                <TextField
                  id="dimensionsD"
                  label="Depth/Thickness"
                  style={{ width: '100%', margin: 12 }}
                  value={sample.dimensionsD ? sample.dimensionsD : ''}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                  }}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        dimensionsD: e.target.value,
                      }
                    });
                  }}
                />
              </div>
            </Grid>
          </Grid>
          <Divider />
          {['lt2','to7','gt7'].map(fraction => {
              return this.getFractionColumn(fraction);
            }
          )}
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
    if (fraction === 'to7') title = '2 - 7 mm Fraction';
    else if (fraction === 'gt7') title = '> 7mm Fraction';
    return(
      <div style={{ borderRadius: 12, borderWidth: 1, borderColor: '#aaa', borderStyle: 'solid', width: '50%', display: 'flex', flexDirection: 'column', padding: 12, margin: 12, }}>
        <div style={{ fontWeight: 500, fontSize: 16, }}>{title}</div>
        <div className={this.props.classes.subheading} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
          Layers
          <IconButton size='small' aria-label='add' style={{ marginLeft: 12 }} onClick={() => this.addLayer(fraction)}><AddIcon /></IconButton>
          <IconButton size='small' aria-label='remove' style={{ marginLeft: 12 }} onClick={() => this.removeLayer(fraction)}><RemoveIcon /></IconButton>
        </div>
        {[...Array(this.state.sample && this.state.sample.layerNum && this.state.sample.layerNum[fraction] ? this.state.sample.layerNum[fraction] : layerNum).keys()].map(num => {
          return this.getSubfractionRow(num+1, fraction);
        })}
      </div>
    )
  }

  getSubfractionRow = (num, fraction) => {
    let chColor, amColor, crColor, umfColor, noColor, orgColor, smfColor = '#ddd';
    let chDivColor, amDivColor, crDivColor, umfDivColor, noDivColor, orgDivColor, smfDivColor = 'white';

    let layer = {};

    if (this.state.sample.waSoilAnalysis && this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`]) {
      layer = this.state.sample.waSoilAnalysis[`subfraction${fraction}-${num}`];
    }

    return(
      <div>
        <div key={num} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }} className={this.props.classes.hoverItem}>
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
            style={{ width: '10%', marginRight: 14, }}
            value={layer.weight ? layer.weight : ''}
            onChange={e => {
              this.setLayerVar('weight', num, fraction, e.target.value);
            }}
          />
          <TextField
            id={`l${num}Concentration`}
            label="Asbestos %"
            InputLabelProps={{ shrink: true }}
            style={{ width: '10%', marginRight: 14, }}
            value={layer.concentration ? layer.concentration : ''}
            onChange={e => {
              this.setLayerVar('concentration', num, fraction, e.target.value);
            }}
          />
          <TextField
            id={`l${num}AsbestosWeight`}
            label="Asbestos Weight (g)"
            InputLabelProps={{ shrink: true, readOnly: true, }}
            style={{ width: '10%', marginRight: 14, }}
            value={layer.weight && layer.concentration ? (parseFloat(layer.weight) * parseFloat(layer.concentration) / 100).toPrecision(3) : ''}
            onChange={e => {
              this.setLayerVar('asbestosWeight', num, fraction, e.target.value);
            }}
          />

          <FormControl component="fieldset">
            <RadioGroup
              aria-label="Type"
              name="type"
              value={layer.type ? layer.type : 'acm' }
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
