import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { SOILDETAILS } from "../../../constants/modal-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
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
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { hideModalSecondary, handleModalChange, } from "../../../actions/modal";
import { writeSoilDetails, getSoilSensitivity, } from "../../../actions/asbestosLab";
import { asbestosSamplesRef } from "../../../config/firebase";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalTypeSecondary,
    modalProps: state.modal.modalPropsSecondary,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModalSecondary()),
    handleModalChange: (target) => dispatch(handleModalChange(target)),
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
    if (this.props.modalProps.doc && this.props.modalProps.doc.soilDetails) {
      this.setState({
        sample: this.props.modalProps.doc.soilDetails,
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
    let updates = {
      [field]: set,
    };
    ['minorFractionTypes','someFractionTypes','traceFractionTypes'].forEach(type => {
      if (type !== field) {
        updates[type] = {
          ...this.state.sample[type],
          [check]: false,
        }
      }
    })
    this.setState({
      sample: {
        ...this.state.sample,
        ...updates,
      }
    });
  }

  render() {
    const { classes, modalProps, modalType } = this.props;
    const { sample } = this.state;
    console.log(sample);
    return (
      <div>
      {modalProps && modalProps.doc && sample &&
      <Dialog
        open={modalType === SOILDETAILS}
        onClose={this.props.hideModal}
        maxWidth="lg"
        fullWidth={true}
        onEnter={this.loadProps}
        onExit={this.clearProps}
      >
        <DialogTitle>
          <div>{`Soil Details for Sample ${modalProps.doc.jobNumber}-${modalProps.doc.sampleNumber} (${modalProps.doc.description})`}</div>
          <div style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 14, }}>{writeSoilDetails(sample)}</div>
        </DialogTitle>
        <DialogContent>
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
                          someFractionTypes: {
                            ...this.state.sample.someFractionTypes,
                            [e.target.value]: false,
                          },
                          minorFractionTypes: {
                            ...this.state.sample.minorFractionTypes,
                            [e.target.value]: false,
                          },
                          traceFractionTypes: {
                            ...this.state.sample.traceFractionTypes,
                            [e.target.value]: false,
                          },
                        }
                      });
                    }}
                    inputProps={{
                      name: 'majorFractionType',
                    }}
                  >
                    <option value="" />
                    <optgroup label="Coarse">
                      <option value={'cobbles'}>Cobbles (60-200mm)</option>
                      <option value={'gravel'}>Gravel (2-60mm)</option>
                      <option value={'sand'}>Sand (0.06-2mm)</option>
                    </optgroup>
                    <optgroup label="Fine">
                      <option value={'silt'}>Silt (fine, dilatant, quick, 0.002-0.06mm)</option>
                      <option value={'clay'}>{`Clay (fine, plastic, cohesive, <0.002mm)`}</option>
                    </optgroup>
                    <optgroup label="Organic">
                      <option value={'organic topsoil'}>Topsoil (surficial organic soil that may contain living matter)</option>
                      <option value={'organic sand'}>Organic Sand (contains finely divided organic matter)</option>
                      <option value={'organic clay'}>Organic Clay (contains finely divided organic matter)</option>
                      <option value={'organic silt'}>Organic Silt (contains finely divided organic matter)</option>
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
                    value={sample.plasticity ? sample.plasticity : ""}
                    onChange={e => {
                      this.setState({
                        sample: {
                          ...sample,
                          plasticity: e.target.value,
                        }
                      });
                    }}
                    inputProps={{
                      name: 'plasticity',
                    }}
                  >
                    <option value="" />
                    <option value={'low plasticity'}>Low Plasticity (crumbles easily when dry)</option>
                    <option value={'medium plasticity'}>Medium Plasticity</option>
                    <option value={'high plasticity'}>High Plasticity (rock hard when dry)</option>
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
                          someFractionTypes: {
                            ...this.state.sample.someFractionTypes,
                            [e.target.value]: false,
                          },
                          minorFractionTypes: {
                            ...this.state.sample.minorFractionTypes,
                            [e.target.value]: false,
                          },
                          traceFractionTypes: {
                            ...this.state.sample.traceFractionTypes,
                            [e.target.value]: false,
                          },
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
                      <option value={'silt'}>Silt (fine, dilatant, quick, 0.002-0.06mm)</option>
                      <option value={'clay'}>{`Clay (fine, plastic, cohesive, <0.002mm)`}</option>
                    </optgroup>
                    <optgroup label="Organic">
                      <option value={'organic topsoil'}>Topsoil (surficial organic soil that may contain living matter)</option>
                      <option value={'organic sand'}>Organic Sand (contains finely divided organic matter)</option>
                      <option value={'organic clay'}>Organic Clay (contains finely divided organic matter)</option>
                      <option value={'organic silt'}>Organic Silt (contains finely divided organic matter)</option>
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
                { (sample.subFractionType === 'clay' || sample.subFractionType === 'organicclay') &&
                  <FormControl>
                    <InputLabel>Plasticity</InputLabel>
                    <Select
                      native
                      value={sample.plasticity ? sample.plasticity : ""}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            plasticity: e.target.value,
                          }
                        });
                      }}
                      inputProps={{
                        name: 'plasticity',
                      }}
                    >
                      <option value="" />
                      <option value={'low plasticity'}>Low Plasticity (crumbles easily when dry)</option>
                      <option value={'medium plasticity'}>Medium Plasticity</option>
                      <option value={'high plasticity'}>High Plasticity (rock hard when dry)</option>
                    </Select>
                  </FormControl>}
              </div>
            </div>
            <div style={{ fontSize: 12, marginTop: 16, color: '#333' }}>Minor Fraction Types (12-20% content)</div>
            <FormControl component="fieldset" margin="dense" style={{ marginBottom: 4, }}>
              <FormGroup row>
                {[{label: 'Cobbles', name: 'cobbles'}, {label: 'Gravel', name: 'gravel'}, {label: 'Sand', name: 'sand'}, {label: 'Silt', name: 'silt'},
                  {label: 'Clay', name: 'clay'}, {label: 'Topsoil', name: 'organic topsoil'}, {label: 'Organic Sand', name: 'organic sand'},
                  {label: 'Organic Silt', name: 'organic silt'}, {label: 'Organic Clay', name: 'organic clay'}, {label: 'Peat', name: 'peat'}].map(check => {
                  return (<FormControlLabel key={check.name}
                    control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes[check.name]
                      ? sample.someFractionTypes[check.name] : false}
                    onChange={() => this.handleCheck('someFractionTypes',check.name)} value={check.name}/>}
                    disabled={sample.majorFractionType === check.name || sample.subFractionType === check.name}
                    label={check.label}
                  />)
                })}
              </FormGroup>
            </FormControl>
            <div style={{ fontSize: 12, marginTop: 4, color: '#333' }}>Minor Fraction Types (5-12% content)</div>
            <FormControl component="fieldset" margin="dense" style={{ marginBottom: 4, }}>
              <FormGroup row>
                {[{label: 'Cobbles', name: 'cobbles'},{label: 'Gravel', name: 'gravel'},{label: 'Sand', name: 'sand'},{label: 'Silt', name: 'silt'},
                  {label: 'Clay', name: 'clay'},{label: 'Topsoil', name: 'organic topsoil'},{label: 'Organic Sand', name: 'organic sand'},
                  {label: 'Organic Silt', name: 'organic silt'},{label: 'Organic Clay', name: 'organic clay'},{label: 'Peat', name: 'peat'},
                ].map(check => {
                  return (<FormControlLabel key={check.name}
                    control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes[check.name]
                    ? sample.minorFractionTypes[check.name] : false}
                    onChange={() => this.handleCheck('minorFractionTypes',check.name)} value={check.name}/>}
                    disabled={sample.majorFractionType === check.name || sample.subFractionType === check.name}
                    label={check.label}
                  />)
                })}
              </FormGroup>
            </FormControl>
            <div style={{ fontSize: 12, marginTop: 4, color: '#333' }}>Trace Fraction Types (less than 5% content)</div>
            <FormControl component="fieldset" margin="dense" style={{ marginBottom: 4, }}>
              <FormGroup row>
                {[{label: 'Cobbles', name: 'cobbles'},{label: 'Gravel', name: 'gravel'},{label: 'Sand', name: 'sand'},{label: 'Silt', name: 'silt'},
                  {label: 'Clay', name: 'clay'},{label: 'Topsoil', name: 'organic topsoil'},{label: 'Organic Sand', name: 'organic sand'},
                  {label: 'Organic Silt', name: 'organic silt'},{label: 'Organic Clay', name: 'organic clay'},{label: 'Peat', name: 'peat'},
                ].map(check => {
                  return (<FormControlLabel key={check.name}
                    control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes[check.name] ? sample.traceFractionTypes[check.name] : false}
                    onChange={() => this.handleCheck('traceFractionTypes',check.name)} value={check.name}/>}
                    disabled={sample.majorFractionType === check.name || sample.subFractionType === check.name}
                    label={check.label}
                  />)
                })}
              </FormGroup>
            </FormControl>
          </div>
          <hr />
          <div>
            <div className={classes.heading} style={{ marginTop: 12, }}>Sample Characteristics</div>
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
            { sample.type !== 'fine' &&
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
                  <option value={'well graded'}>Well graded (good representation of grain sizes)</option>
                  <option value={'uniformly graded'}>Uniformly graded (a limited representation of grain sizes)</option>
                  <option value={'gap graded'}>Gap graded (absence of one or more intermediate sizes within what otherwise would be a well graded material)</option>
                </Select>
              </FormControl>
              <div style={{ marginTop: 12, }}>
                <TextField
                  label={'Maximum Particle Size'}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                  }}
                  value={sample.maximumParticleSize ? sample.maximumParticleSize : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        maximumParticleSize: e.target.value,
                      }
                    });
                  }}
                />
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'row', }}>
                  <FormControl>
                    <InputLabel>Particle Shape</InputLabel>
                    <Select
                      native
                      value={sample.particleShape ? sample.particleShape : ""}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            particleShape: e.target.value,
                          }
                        });
                      }}
                      inputProps={{
                        name: 'particleShape',
                      }}
                    >
                      <option value="" />
                      <option value={'rounded'}>Rounded (circular)</option>
                      <option value={'rounded to subrounded'}>Rounded to Subrounded</option>
                      <option value={'rounded to subangular'}>Rounded to Subangular</option>
                      <option value={'rounded to angular'}>Rounded to Angular</option>
                      <option value={'subrounded'}>Subrounded (rounded edges, rounded corners)</option>
                      <option value={'subrounded to subangular'}>Subrounded to Subangular</option>
                      <option value={'subrounded to angular'}>Subrounded to Angular</option>
                      <option value={'subangular'}>Subangular (straight edges, round corners)</option>
                      <option value={'subangular to angular'}>Subangular to Angular</option>
                      <option value={'Angular'}>Angular (straight edges, sharp corners)</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>Grading</InputLabel>
                    <Select
                      native
                      value={sample.particleShapeSecondary ? sample.particleShapeSecondary : ""}
                      onChange={e => {
                        this.setState({
                          sample: {
                            ...sample,
                            particleShapeSecondary: e.target.value,
                          }
                        });
                      }}
                      inputProps={{
                        name: 'particleShapeSecondary',
                      }}
                    >
                      <option value="" />
                      <option value={'equidimensional'}>Equidimensional</option>
                      <option value={'flat'}>Flat</option>
                      <option value={'elongated'}>Elongated</option>
                      <option value={'flat and elongated'}>Flat and Elongated</option>
                      <option value={'irregular'}>Irregular</option>
                    </Select>
                  </FormControl>
              </div>
              {/* ADD MAXIMUM PARTICLE SIZE, PARTICLE SHAPE, OTHER MATERIAL, GEOLOGICAL INFORMATION */}
            </div>}
          </div>
          <div className={classes.heading} style={{ marginTop: 12, }}>In-Situ Characteristics</div>
          { sample.type === 'coarse' &&
            <FormControl>
              <InputLabel>Density</InputLabel>
              <Select
                native
                value={sample.density ? sample.density : ""}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      density: e.target.value,
                    }
                  });
                }}
                inputProps={{
                  name: 'density',
                }}
              >
                <option value="" />
                <option value={'loosely packed'}>Loosely packed (can be removed from exposures by hand or removed easily by shovel)</option>
                <option value={'tightly packed'}>Tightly packed (requires a pick for removal, either as lumps or as disaggregated material)</option>
              </Select>
            </FormControl>
          }
          { sample.type === 'fine' && <div>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 12,}}>
              <FormControl>
                <InputLabel>Strength In-Situ</InputLabel>
                <Select
                  native
                  value={sample.strength ? sample.strength : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        strength: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'strength',
                  }}
                >
                  <option value="" />
                  <option value={'very soft'}>Very soft (easily exudes between fingers when squeezed)</option>
                  <option value={'soft'}>Soft (easily indented by fingers)</option>
                  <option value={'firm'}>Firm (indented by strong finger pressure and can be indented by thumb pressure)</option>
                  <option value={'stiff'}>Stiff (cannot be indented by thumb pressure)</option>
                  <option value={'very stiff'}>Very stiff (can be indented by thumbnail)</option>
                  <option value={'hard'}>Hard (difficult to indent by thumbnail))</option>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Strength After Remoulding/Disturbing</InputLabel>
                <Select
                  native
                  value={sample.sensitivityStrength ? sample.sensitivityStrength : ""}
                  onChange={e => {
                    this.setState({
                      sample: {
                        ...sample,
                        sensitivityStrength: e.target.value,
                      }
                    });
                  }}
                  inputProps={{
                    name: 'sensitivityStrength',
                  }}
                >
                  <option value="" />
                  <option value={'very soft'}>Very soft (easily exudes between fingers when squeezed)</option>
                  <option value={'soft'}>Soft (easily indented by fingers)</option>
                  <option value={'firm'}>Firm (indented by strong finger pressure and can be indented by thumb pressure)</option>
                  <option value={'stiff'}>Stiff (cannot be indented by thumb pressure)</option>
                  <option value={'very stiff'}>Very stiff (can be indented by thumbnail)</option>
                  <option value={'hard'}>Hard (difficult to indent by thumbnail))</option>
                </Select>
              </FormControl>
            </div>
            { sample.strength && sample.sensitivityStrength && <div style={{ marginTop: 12, }}>

            <InputLabel>Sensitivity</InputLabel>
            {getSoilSensitivity(sample)}</div>}
          </div>}
          <div style={{ marginTop: 12, }}>
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
          </div>
          <div style={{ marginTop: 12, }}>
            <FormControl>
              <InputLabel>Moisture Content</InputLabel>
              <Select
                native
                value={sample.moisture ? sample.moisture : ""}
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      moisture: e.target.value,
                    }
                  });
                }}
                inputProps={{
                  name: 'moisture',
                }}
              >
                <option value="" />
                <option value={'dry'}>Dry (looks and feels dry, powdery, friable)</option>
                <option value={'moist'}>Moist (cool, dark, no free water on hands when remoulding)</option>
                <option value={'wet'}>Wet (cool, dark, free water forms on hands when handling)</option>
                <option value={'saturated'}>Saturated (free water is present on sample)</option>
              </Select>
            </FormControl>
          </div>
          <div style={{ marginTop: 12, }}>
            <TextField
              label={'Additional Structures'}
              value={sample.additionalStructures ? sample.additionalStructures : ""}
              helperText="Note any other material present (e.g. coal, shell, oils) and strong odours."
              onChange={e => {
                this.setState({
                  sample: {
                    ...sample,
                    additionalStructures: e.target.value,
                  }
                });
              }}
            />
          </div>
          <div style={{ marginTop: 12, }}>
            <TextField
              label={'Geological Information'}
              value={sample.geological ? sample.geological : ""}
              helperText="Note the geological information if known (e.g. Mt John Outwash Gravel)."
              onChange={e => {
                this.setState({
                  sample: {
                    ...sample,
                    geological: e.target.value,
                  }
                });
              }}
            />
          </div>
          <hr />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              modalProps.onExit(this.state.sample);
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
