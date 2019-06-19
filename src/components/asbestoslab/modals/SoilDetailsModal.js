import React from "react";
import reactCSS from 'reactcss';
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { SOILDETAILS } from "../../../constants/modal-types";
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
import FormHelperText from "@material-ui/core/FormHelperText";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from "@material-ui/core/FormLabel";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import UploadIcon from "@material-ui/icons/CloudUpload";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { hideModalSecondary } from "../../../actions/modal";
import { handleSampleChange, writeSoilDetails, } from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalTypeSecondary,
    modalProps: state.modal.modalPropsSecondary,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModalSecondary()),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
  };
};

const sampleInit = {
  type: 'fine',
};

class SoilDetailsModal extends React.Component {
  state = {
    sample: sampleInit,
  };

  loadProps = () => {
    if (this.props.modalProps.sample && this.props.modalProps.sample.soilDetails) {
      this.setState({
        sample: this.props.modalProps.sample.soilDetails,
      });
    }
  }

  clearProps = () => {
    this.setState({ sample: sampleInit, });
  }

  handleCheck = (field, check) => {
    let set = {};
    if (this.state.sample[field]) set = this.state.sample[field];
    let val = true;
    if (set[check]) val = !set[check];
    set = {
      ...set,
      [check]: !set[check],
    }
    this.setState({
      sample: {
        ...this.state.sample,
        [field]: set,
      }
    });
  }

  render() {
    const { classes, modalProps, modalType } = this.props;
    const { sample } = this.state;
    console.log(sample);
    return (
      <div>
      {modalProps && modalProps.sample && sample &&
      <Dialog
        open={modalType === SOILDETAILS}
        onClose={() => this.props.hideModal()}
        maxWidth="lg"
        fullWidth={true}
        onEnter={() => this.loadProps()}
        onExit={() => this.clearProps()}
      >
        <DialogTitle>{`Soil Details for Sample ${modalProps.sample.jobNumber}-${modalProps.sample.sampleNumber} (${modalProps.sample.description})`}</DialogTitle>
        <DialogContent>
          <div>{writeSoilDetails(sample)}</div>
          <div className={classes.heading}>Soil Material Classification</div>
          <hr />
          <div>
            <div className={classes.heading}>Soil Name</div>
            <div className={classes.subheading}>Type</div>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Type"
                name="type"
                value={sample.type ? sample.type : null }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      type: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="coarse" control={<Radio />} label="Coarse" />
                <FormControlLabel value="fine" control={<Radio />} label="Fine" />
                <FormControlLabel value="organic" control={<Radio />} label="Organic" />
              </RadioGroup>
              <FormHelperText style={{ width: 500, }}>Select the major category of the soil. If over 35% clay or silt then it is fine. If there is enough organic material in the sample to make it behave differently to clay or silt, then it is organic.</FormHelperText>
            </FormControl>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 16, }}>
              <div>
                <FormControl>
                  <InputLabel>Major Fraction Type (≥50% content)</InputLabel>
                  <Select
                    native
                    value={sample.majorFractionType ? sample.majorFractionType : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          majorFractionType: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'majorFractionType',
                    }}
                  >
                    <option value="" />
                    <optgroup label="Coarse" disabled={sample.type !== 'coarse'}>
                      <option value={'cobbles'}>Cobbles (60-200mm)</option>
                      <option value={'gravel'}>Gravel (2-60mm)</option>
                      <option value={'sand'}>Sand (0.06-2mm)</option>
                    </optgroup>
                    <optgroup label="Fine" disabled={sample.type !== 'fine'}>
                      <option value={'silt'}>Silt (fine, dilatant, quick, 0.002-0.06mm)</option>
                      <option value={'clay'}>{`Clay (fine, plastic, cohesive, <0.002mm)`}</option>
                    </optgroup>
                    <optgroup label="Organic" disabled={sample.type !== 'organic'}>
                      <option value={'topsoil'}>Topsoil (surficial organic soil that may contain living matter)</option>
                      <option value={'organicsand'}>Organic Sand (contains finely divided organic matter)</option>
                      <option value={'organicclay'}>Organic Clay (contains finely divided organic matter)</option>
                      <option value={'organicsilt'}>Organic Silt (contains finely divided organic matter)</option>
                      <option value={'peat'}>Peat (plant remains)</option>
                    </optgroup>
                  </Select>
                </FormControl>
                  {/*{ sample.type === 'coarse' &&
                  <FormControl>
                    <InputLabel>Major Fraction Type (≥50% content)</InputLabel>
                    <Select
                      native
                      value={sample.majorFractionType ? sample.majorFractionType : ""}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            majorFractionType: e.target.value,
                          }
                        });
                      }}
                      inputProps={{
                        name: 'majorFractionType',
                      }}
                    >
                      <option value="" />
                      <option value={'boulders'}>{`Boulders (>200mm)`}</option>
                      <option value={'cobbles'}>Cobbles (60-200mm)</option>
                      <option value={'gravel'}>Gravel (2-60mm)</option>
                      <option value={'sand'}>Sand (0.06 - 2mm)</option>
                    </Select>
                  </FormControl>}
                  { sample.type === 'fine' &&
                  <FormControl>
                    <InputLabel>Major Fraction Type (≥50% content)</InputLabel>
                    <Select
                      native
                      value={sample.majorFractionType ? sample.majorFractionType : ""}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            majorFractionType: e.target.value,
                          }
                        });
                      }}
                      inputProps={{
                        name: 'majorFractionType',
                      }}
                    >
                      <option value="" />
                      <option value={'silt'}>Silt (dilatant, quick)</option>
                      <option value={'clay'}>Clay (cohesive, plastic)</option>
                    </Select>
                  </FormControl>}
                  { sample.type === 'organic' &&
                    <FormControl>
                      <InputLabel>Major Fraction Type (≥50% content)</InputLabel>
                      <Select
                        native
                        value={sample.majorFractionType ? sample.majorFractionType : ""}
                        onChange={e => {
                          this.setState({
                            sample: {
                              ...sample,
                              majorFractionType: e.target.value,
                            }
                          });
                        }}
                        inputProps={{
                          name: 'majorFractionType',
                        }}
                      >
                        <option value="" />
                        <option value={'topsoil'}>Topsoil (surficial organic soil, living matter)</option>
                        <option value={'organicsand'}>Organic Sand (finely divided organic matter)</option>
                        <option value={'organicclay'}>Organic Clay (finely divided organic matter)</option>
                        <option value={'organicsilt'}>Organic Silt (finely divided organic matter)</option>
                        <option value={'peat'}>Peat (plant remains)</option>
                      </Select>
                  </FormControl>}*/}
              </div>
              <div>
                { sample.majorFractionType === 'gravel' &&
                <FormControl>
                  <InputLabel>Particle Size Range</InputLabel>
                  <Select
                    native
                    value={sample.majorFractionQualifier ? sample.majorFractionQualifier : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          majorFractionQualifier: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'majorFractionQualifier',
                    }}
                  >
                    <option value="" />
                    <option value={'fine'}>Fine (2-6mm)</option>
                    <option value={'medium'}>Medium (6-20mm)</option>
                    <option value={'coarse'}>Coarse (20-60mm)</option>
                    <option value={'finetomedium'}>Fine to Medium (2-20mm)</option>
                    <option value={'mediumtocoarse'}>Medium to Coarse (6-20mm)</option>
                    <option value={'finetocoarse'}>Fine to Coarse (2-60mm)</option>
                  </Select>
                </FormControl>}
                { (sample.majorFractionType === 'sand' || sample.majorFractionType === 'organicsand') &&
                <FormControl>
                  <InputLabel>Particle Size Range</InputLabel>
                  <Select
                    native
                    value={sample.majorFractionQualifier ? sample.majorFractionQualifier : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          majorFractionQualifier: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'majorFractionQualifier',
                    }}
                  >
                    <option value="" />
                    <option value={'fine'}>Fine (0.06-0.2mm)</option>
                    <option value={'medium'}>Medium (0.2-0.6mm)</option>
                    <option value={'coarse'}>Coarse (0.6-2mm)</option>
                    <option value={'finetomedium'}>Fine to Medium (0.06-0.6mm)</option>
                    <option value={'mediumtocoarse'}>Medium to Coarse (0.2-2mm)</option>
                    <option value={'finetocoarse'}>Fine to Coarse (0.06-2mm)</option>
                  </Select>
                </FormControl>}
                { sample.majorFractionType === 'peat' &&
                <FormControl>
                  <InputLabel>Peat Type</InputLabel>
                  <Select
                    native
                    value={sample.majorFractionQualifier ? sample.majorFractionQualifier : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          majorFractionQualifier: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'majorFractionQualifier',
                    }}
                  >
                    <option value="" />
                    <option value={'firm'}>Firm (fibres already compressed together)</option>
                    <option value={'spongy'}>Spongy (very compressible and open structure)</option>
                    <option value={'plastic'}>Plastic (can be moulded in hand and smears in fingers)</option>
                    <option value={'fibrous'}>Fibrous (plant remains recognisable and retain some strength)</option>
                    <option value={'amorphous'}>Amorphous (no recognisable plant remains)</option>
                  </Select>
                </FormControl>}
                { (sample.majorFractionType === 'clay' || sample.majorFractionType === 'organicclay') &&
                <FormControl>
                  <InputLabel>Plasticity</InputLabel>
                  <Select
                    native
                    value={sample.majorFractionPlasticity ? sample.majorFractionPlasticity : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          majorFractionPlasticity: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'majorFractionPlasticity',
                    }}
                  >
                    <option value="" />
                    <option value={'low'}>Low Plasticity (crumbles easily when dry)</option>
                    <option value={'medium'}>Medium Plasticity</option>
                    <option value={'high'}>High Plasticity (rock hard when dry)</option>
                  </Select>
                </FormControl>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 16, }}>
              <div>
                <FormControl>
                  <InputLabel>Subordinate Fraction Type (20-50% content)</InputLabel>
                  <Select
                    native
                    value={sample.subFractionType ? sample.subFractionType : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          subFractionType: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'subFractionType',
                    }}
                  >
                    <option value="" />
                    <optgroup label="Coarse">
                      <option value={'cobbles'}>Cobbles (60-200mm)</option>
                      <option value={'gravel'}>Gravel (2-60mm)</option>
                      <option value={'sand'}>Sand (0.06-2mm)</option>
                    </optgroup>
                    <optgroup label="Fine">
                      <option value={'silt'}>Silt (fine, dilatant, quick)</option>
                      <option value={'clay'}>Clay (fine, plastic, cohesive)</option>
                    </optgroup>
                    <optgroup label="Organic">
                      <option value={'topsoil'}>Topsoil (surficial organic soil that may contain living matter)</option>
                      <option value={'organicsand'}>Organic Sand (contains finely divided organic matter)</option>
                      <option value={'organicclay'}>Organic Clay (contains finely divided organic matter)</option>
                      <option value={'organicsilt'}>Organic Silt (contains finely divided organic matter)</option>
                      <option value={'peat'}>Peat (plant remains)</option>
                    </optgroup>
                  </Select>
                </FormControl>
              </div>

              <div>
                { sample.subFractionType === 'gravel' &&
                <FormControl>
                  <InputLabel>Particle Size Range</InputLabel>
                  <Select
                    native
                    value={sample.subFractionQualifier ? sample.subFractionQualifier : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          subFractionQualifier: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'subFractionQualifier',
                    }}
                  >
                    <option value="" />
                    <option value={'fine'}>Fine (2-6mm)</option>
                    <option value={'medium'}>Medium (6-20mm)</option>
                    <option value={'coarse'}>Coarse (20-60mm)</option>
                    <option value={'finetomedium'}>Fine to Medium (2-20mm)</option>
                    <option value={'mediumtocoarse'}>Medium to Coarse (6-20mm)</option>
                    <option value={'finetocoarse'}>Fine to Coarse (2-60mm)</option>
                  </Select>
                </FormControl>}
                { (sample.subFractionType === 'sand' || sample.subFractionType === 'organicsand') &&
                <FormControl>
                  <InputLabel>Particle Size Range</InputLabel>
                  <Select
                    native
                    value={sample.subFractionQualifier ? sample.subFractionQualifier : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          subFractionQualifier: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'subFractionQualifier',
                    }}
                  >
                    <option value="" />
                    <option value={'fine'}>Fine (0.06-0.2mm)</option>
                    <option value={'medium'}>Medium (0.2-0.6mm)</option>
                    <option value={'coarse'}>Coarse (0.6-2mm)</option>
                    <option value={'finetomedium'}>Fine to Medium (0.06-0.6mm)</option>
                    <option value={'mediumtocoarse'}>Medium to Coarse (0.2-2mm)</option>
                    <option value={'finetocoarse'}>Fine to Coarse (0.06-2mm)</option>
                  </Select>
                </FormControl>}
              </div>
            </div>
            <div style={{ fontSize: 12, marginTop: 16, color: '#333' }}>Minor Fraction Types (12-20% content)</div>
            <FormControl component="fieldset" margin="dense" style={{ marginBottom: 4, }}>
              <FormGroup row>
                {[{label: 'Cobbles', name: 'cobbles'}, {label: 'Gravel', name: 'gravel'}, {label: 'Sand', name: 'sand'}, {label: 'Silt', name: 'silt'},
                  {label: 'Clay', name: 'clay'}, {label: 'Topsoil', name: 'topsoil'}, {label: 'Organic Sand', name: 'organicsand'},
                  {label: 'Organic Silt', name: 'organicsilt'}, {label: 'Organic Clay', name: 'organicclay'}, {label: 'Peat', name: 'peat'}].map(check => {
                  return (<FormControlLabel key={check.name}
                    control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes[check.name] ? sample.someFractionTypes[check.name] : false}
                    onChange={() => this.handleCheck('someFractionTypes',check.name)} value={check.name} />}
                    label={check.label}
                  />)
                })}
              </FormGroup>
            </FormControl>
            <div style={{ fontSize: 12, marginTop: 4, color: '#333' }}>Minor Fraction Types (5-12% content)</div>
            <FormControl component="fieldset" margin="dense" style={{ marginBottom: 4, }}>
              <FormGroup row>
                {[{label: 'Cobbles', name: 'cobbles'},{label: 'Gravel', name: 'gravel'},{label: 'Sand', name: 'sand'},{label: 'Silt', name: 'silt'},
                  {label: 'Clay', name: 'clay'},{label: 'Topsoil', name: 'topsoil'},{label: 'Organic Sand', name: 'organicsand'},
                  {label: 'Organic Silt', name: 'organicsilt'},{label: 'Organic Clay', name: 'organicclay'},{label: 'Peat', name: 'peat'},
                ].map(check => {
                  return (<FormControlLabel key={check.name}
                    control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes[check.name] ? sample.minorFractionTypes[check.name] : false}
                    onChange={() => this.handleCheck('minorFractionTypes',check.name)} value={check.name} />}
                    label={check.label}
                  />)
                })}
              </FormGroup>
            </FormControl>
            <div style={{ fontSize: 12, marginTop: 4, color: '#333' }}>Trace Fraction Types (less than 5% content)</div>
            <FormControl component="fieldset" margin="dense" style={{ marginBottom: 4, }}>
              <FormGroup row>
                {[{label: 'Cobbles', name: 'cobbles'},{label: 'Gravel', name: 'gravel'},{label: 'Sand', name: 'sand'},{label: 'Silt', name: 'silt'},
                  {label: 'Clay', name: 'clay'},{label: 'Topsoil', name: 'topsoil'},{label: 'Organic Sand', name: 'organicsand'},
                  {label: 'Organic Silt', name: 'organicsilt'},{label: 'Organic Clay', name: 'organicclay'},{label: 'Peat', name: 'peat'},
                ].map(check => {
                  return (<FormControlLabel key={check.name}
                    control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes[check.name] ? sample.traceFractionTypes[check.name] : false}
                    onChange={() => this.handleCheck('traceFractionTypes',check.name)} value={check.name} />}
                    label={check.label}
                  />)
                })}
              </FormGroup>
            </FormControl>
          </div>
          <hr />
          <div>
            { sample.type === 'coarse' &&
            <div>
              <FormControl>
                <InputLabel>Grading</InputLabel>
                <Select
                  native
                  value={sample.grading ? sample.grading : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        grading: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'grading',
                  }}
                >
                  <option value="" />
                  <option value={'well'}>Well graded (good representation of grain sizes)</option>
                  <option value={'uniformly'}>Uniformly graded (a limited representation of grain sizes)</option>
                  <option value={'gap'}>Gap graded (absence of one or more intermediate sizes within what otherwise would be a well graded material)</option>
                </Select>
              </FormControl>
              {/* ADD MAXIMUM PARTICLE SIZE, PARTICLE SHAPE, OTHER MATERIAL, GEOLOGICAL INFORMATION */}
            </div>}
            <div className={classes.heading}>Visual Characteristics</div>

            <div className={classes.subheading}>Colour</div>
            <div style={{ display: 'flex', flexDirection: 'row', }}>
              <FormControl>
                <InputLabel>Shade</InputLabel>
                <Select
                  native
                  value={sample.colourShade ? sample.colourShade : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        colourShade: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'shade',
                  }}
                >
                  <option value="" />
                  <option value={'light'}>Light</option>
                  <option value={'dark'}>Dark</option>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Qualifier</InputLabel>
                <Select
                  native
                  value={sample.colourQualifier ? sample.colourQualifier : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        colourQualifier: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'colourQualifier',
                  }}
                >
                  <option value="" />
                  <option value={'pinkish'}>Pinkish</option>
                  <option value={'reddish'}>Reddish</option>
                  <option value={'yellowish'}>Yellowish</option>
                  <option value={'brownish'}>Brownish</option>
                  <option value={'greenish'}>Greenish</option>
                  <option value={'bluish'}>Bluish</option>
                  <option value={'greyish'}>Greyish</option>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Colour</InputLabel>
                <Select
                  native
                  value={sample.colour ? sample.colour : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        colour: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'colour',
                  }}
                >
                  <option value="" />
                  <option value={'pink'}>Pink</option>
                  <option value={'red'}>Red</option>
                  <option value={'orange'}>Orange</option>
                  <option value={'yellow'}>Yellow</option>
                  <option value={'brown'}>Brown</option>
                  <option value={'green'}>Green</option>
                  <option value={'blue'}>Blue</option>
                  <option value={'white'}>White</option>
                  <option value={'grey'}>Grey</option>
                  <option value={'black'}>Black</option>
                </Select>
              </FormControl>
              { sample.type === 'fine' && <span>

              <FormControl>
                <InputLabel>Colour</InputLabel>
                <Select
                  native
                  value={sample.colourPattern ? sample.colourPattern : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        colourPattern: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'colourPattern',
                  }}
                >
                  <option value="" />
                  <option value={'mottled'}>Mottled</option>
                  <option value={'banded'}>Banded</option>
                  <option value={'mixed'}>Mixed</option>
                  <option value={'speckled'}>Speckled</option>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Colour</InputLabel>
                <Select
                  native
                  value={sample.colourSecondary ? sample.colourSecondary : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        colourSecondary: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'colourSecondary',
                  }}
                >
                  <option value="" />
                  <option value={'pink'}>Pink</option>
                  <option value={'red'}>Red</option>
                  <option value={'orange'}>Orange</option>
                  <option value={'yellow'}>Yellow</option>
                  <option value={'brown'}>Brown</option>
                  <option value={'green'}>Green</option>
                  <option value={'blue'}>Blue</option>
                  <option value={'white'}>White</option>
                  <option value={'grey'}>Grey</option>
                  <option value={'black'}>Black</option>
                </Select>
              </FormControl>
              </span>}
            </div>
          </div>
          <div className={classes.heading}>In-Situ Characteristics</div>
          <FormControl>
            <InputLabel>Structure</InputLabel>
            <Select
              native
              value={sample.structure ? sample.structure : ""}
              onChange={e => {
                this.setState({
                  sample: {
                    ...sample,
                    structure: e.target.value,
                  }
                });
              }}
              inputProps={{
                name: 'structure',
              }}
            >
              <option value="" />
              <option value={'homogenous'}>Homogenous (lack of visible bedding and same colour and appearance)</option>
              <option value={'bedded'}>Bedded (presence of layers)</option>
              <option value={'fissured'}>Fissured (breaks along definite planes of fracture with little resistance to fracturing)</option>
              <option value={'polished'}>Polished (fracture planes are polished or glossy)</option>
              <option value={'slickensided'}>Slickensided (fracture planes are striated)</option>
              <option value={'blocky'}>Blocky (cohesive soil that can be broken down into angular lumps that resist further breakdown)</option>
              <option value={'lensoidal'}>Lensoidal (discontinuous pockets of a soil within a different soil mass)</option>
            </Select>
          </FormControl>
          <hr />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              asbestosSamplesRef
                .doc(modalProps.sample.uid)
                .update({soilDetails: sample});
              this.props.hideModal();
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
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SoilDetailsModal)
);
