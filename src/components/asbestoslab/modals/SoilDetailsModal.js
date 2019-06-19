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
              <FormHelperText>Select the major component of the soil. If over 35% clay or silt then it is fine. If there is enough organic material in the sample to make it behave differently to clay or silt, then it is organic.</FormHelperText>
            </FormControl>
            <div className={classes.subheading}>Major Fraction Type (≥50% content)</div>
            { sample.type === 'coarse' && <FormControl component="fieldset">
              <RadioGroup
                aria-label="Type"
                name="type"
                value={sample.majorFractionType ? sample.majorFractionType : null }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      majorFractionType: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="boulders" control={<Radio />} label="Boulders (>200mm)" />
                <FormControlLabel value="cobbles" control={<Radio />} label="Cobbles (60-200mm)" />
                <FormControlLabel value="gravel" control={<Radio />} label="Gravel (2-60mm)" />
                <FormControlLabel value="sand" control={<Radio />} label="Sand (0.06 - 2mm)" />
              </RadioGroup>
            </FormControl>}
            { sample.type === 'fine' && <FormControl component="fieldset">
              <RadioGroup
                aria-label="Type"
                name="type"
                value={sample.majorFractionType ? sample.majorFractionType : null }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      majorFractionType: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="silt" control={<Radio />} label="Silt (dilatant, quick)" />
                <FormControlLabel value="clay" control={<Radio />} label="Clay (cohesive, plastic)" />
              </RadioGroup>
              <FormHelperText>To test whether soil is silt or clay, put a sample of wet soil on your hand and tap that hand with your other hand. If water pools at the surface then it is silt.
              </FormHelperText>
            </FormControl>}
            { sample.type === 'organic' && <FormControl component="fieldset">
              <RadioGroup
                aria-label="Major Fraction Type"
                name="majorFractionType"
                value={sample.majorFractionType ? sample.majorFractionType : null }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      majorFractionType: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="topsoil" control={<Radio />} label="Topsoil (surficial organic soil, living matter)" />
                <FormControlLabel value="organicsand" control={<Radio />} label="Organic Sand (finely divided organic matter)" />
                <FormControlLabel value="organicclay" control={<Radio />} label="Organic Clay (finely divided organic matter)" />
                <FormControlLabel value="organicsilt" control={<Radio />} label="Organic Silt (finely divided organic matter)" />
                <FormControlLabel value="peat" control={<Radio />} label="Peat (plant remains)" />
              </RadioGroup>
              <FormHelperText>Organic clay, silt or sand may have distinctive smell, may stain, may oxidise rapidly.
              </FormHelperText>
            </FormControl>}
            { sample.type === 'coarse' && sample.majorFractionType === 'gravel' && <FormControl component="fieldset">
              <div className={classes.subheading}>Major Fraction Range</div>
              <RadioGroup
                aria-label="Major Fraction Range"
                name="majorFractionRange"
                value={sample.majorFractionRange ? sample.majorFractionRange : null }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      majorFractionRange: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="fine" control={<Radio />} label="Fine (2-6mm)" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium (6-20mm)" />
                <FormControlLabel value="coarse" control={<Radio />} label="Coarse (20-60mm)" />
                <FormControlLabel value="finetomedium" control={<Radio />} label="F-M (2-20mm)" />
                <FormControlLabel value="mediumtocoarse" control={<Radio />} label="M-C (6-20mm)" />
                <FormControlLabel value="finetocoarse" control={<Radio />} label="F-C (2-60mm)" />
              </RadioGroup>
            </FormControl>}
            { sample.type === 'coarse' && (sample.majorFractionType === 'sand' || sample.majorFractionType === 'organicsand') && <FormControl component="fieldset">
              <div className={classes.subheading}>Major Fraction Range</div>
              <RadioGroup
                aria-label="Major Fraction Range"
                name="majorFractionRange"
                value={sample.majorFractionRange ? sample.majorFractionRange : null }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      majorFractionRange: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="fine" control={<Radio />} label="Fine (0.06-0.2mm)" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium (0.2-0.6mm)" />
                <FormControlLabel value="coarse" control={<Radio />} label="Coarse (0.6-2mm)" />
                <FormControlLabel value="finetomedium" control={<Radio />} label="F-M (0.06-0.6mm)" />
                <FormControlLabel value="mediumtocoarse" control={<Radio />} label="M-C (0.2-2mm)" />
                <FormControlLabel value="finetocoarse" control={<Radio />} label="F-C (0.06-2mm)" />
              </RadioGroup>
            </FormControl>}
            <div className={classes.subheading}>Subordinate Fraction Type (20-50% content)</div>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Subordinate Fraction Type"
                name="subFractionType"
                value={sample.subFractionType ? sample.subFractionType : 'none' }
                row
                onChange={e => {
                  this.setState({
                    sample: {
                      ...sample,
                      subFractionType: e.target.value,
                    }
                  });
                }}
              >
                <FormControlLabel value="none" control={<Radio />} label="None" />
                <FormControlLabel value="cobbles" control={<Radio />} label="Cobbles" />
                <FormControlLabel value="gravel" control={<Radio />} label="Gravel" />
                <FormControlLabel value="sand" control={<Radio />} label="Sand" />
                <FormControlLabel value="silt" control={<Radio />} label="Silt" />
                <FormControlLabel value="clay" control={<Radio />} label="Clay" />
                <FormControlLabel value="topsoil" control={<Radio />} label="Topsoil" />
                <FormControlLabel value="organicsand" control={<Radio />} label="Organic Sand" />
                <FormControlLabel value="organicclay" control={<Radio />} label="Organic Clay" />
                <FormControlLabel value="organicsilt" control={<Radio />} label="Organic Silt" />
                <FormControlLabel value="peat" control={<Radio />} label="Peat" />
              </RadioGroup>
            </FormControl>
            <div className={classes.subheading}>Minor Fraction Types (12-20% content)</div>
            <FormControl component="fieldset">
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.cobbles} onChange={() => this.handleCheck('someFractionTypes','cobbles')} value="cobbles" />}
                  label="Cobbles"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.gravel} onChange={() => this.handleCheck('someFractionTypes','gravel')} value="gravel" />}
                  label="Gravel"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.sand} onChange={() => this.handleCheck('someFractionTypes','sand')} value="sand" />}
                  label="Sand"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.silt} onChange={() => this.handleCheck('someFractionTypes','silt')} value="silt" />}
                  label="Silt"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.clay} onChange={() => this.handleCheck('someFractionTypes','clay')} value="clay" />}
                  label="Clay"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.topsoil} onChange={() => this.handleCheck('someFractionTypes','topsoil')} value="topsoil" />}
                  label="Topsoil"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.organicsand} onChange={() => this.handleCheck('someFractionTypes','organicsand')} value="organicsand" />}
                  label="Organic Sand"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.organicsilt} onChange={() => this.handleCheck('someFractionTypes','organicsilt')} value="organicsilt" />}
                  label="Organic Silt"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.organicclay} onChange={() => this.handleCheck('someFractionTypes','organicclay')} value="organicclay" />}
                  label="Organic Clay"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.someFractionTypes && sample.someFractionTypes.peat} onChange={() => this.handleCheck('someFractionTypes','peat')} value="peat" />}
                  label="Peat"
                />
              </FormGroup>
            </FormControl>
            <div className={classes.subheading}>Minor Fraction Types (5-12% content)</div>
            <FormControl component="fieldset">
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.cobbles} onChange={() => this.handleCheck('minorFractionTypes','cobbles')} value="cobbles" />}
                  label="Cobbles"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.gravel} onChange={() => this.handleCheck('minorFractionTypes','gravel')} value="gravel" />}
                  label="Gravel"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.sand} onChange={() => this.handleCheck('minorFractionTypes','sand')} value="sand" />}
                  label="Sand"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.silt} onChange={() => this.handleCheck('minorFractionTypes','silt')} value="silt" />}
                  label="Silt"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.clay} onChange={() => this.handleCheck('minorFractionTypes','clay')} value="clay" />}
                  label="Clay"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.topsoil} onChange={() => this.handleCheck('minorFractionTypes','topsoil')} value="topsoil" />}
                  label="Topsoil"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.organicsand} onChange={() => this.handleCheck('minorFractionTypes','organicsand')} value="organicsand" />}
                  label="Organic Sand"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.organicsilt} onChange={() => this.handleCheck('minorFractionTypes','organicsilt')} value="organicsilt" />}
                  label="Organic Silt"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.organicclay} onChange={() => this.handleCheck('minorFractionTypes','organicclay')} value="organicclay" />}
                  label="Organic Clay"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.minorFractionTypes && sample.minorFractionTypes.peat} onChange={() => this.handleCheck('minorFractionTypes','peat')} value="peat" />}
                  label="Peat"
                />
              </FormGroup>
            </FormControl>
            <div className={classes.subheading}>Trace Fraction Types (less than 5% content)</div>
            <FormControl component="fieldset">
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.cobbles} onChange={() => this.handleCheck('traceFractionTypes','cobbles')} value="cobbles" />}
                  label="Cobbles"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.gravel} onChange={() => this.handleCheck('traceFractionTypes','gravel')} value="gravel" />}
                  label="Gravel"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.sand} onChange={() => this.handleCheck('traceFractionTypes','sand')} value="sand" />}
                  label="Sand"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.silt} onChange={() => this.handleCheck('traceFractionTypes','silt')} value="silt" />}
                  label="Silt"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.clay} onChange={() => this.handleCheck('traceFractionTypes','clay')} value="clay" />}
                  label="Clay"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.topsoil} onChange={() => this.handleCheck('traceFractionTypes','topsoil')} value="topsoil" />}
                  label="Topsoil"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.organicsand} onChange={() => this.handleCheck('traceFractionTypes','organicsand')} value="organicsand" />}
                  label="Organic Sand"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.organicsilt} onChange={() => this.handleCheck('traceFractionTypes','organicsilt')} value="organicsilt" />}
                  label="Organic Silt"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.organicclay} onChange={() => this.handleCheck('traceFractionTypes','organicclay')} value="organicclay" />}
                  label="Organic Clay"
                />
                <FormControlLabel
                  control={<Checkbox checked={sample.traceFractionTypes && sample.traceFractionTypes.peat} onChange={() => this.handleCheck('traceFractionTypes','peat')} value="peat" />}
                  label="Peat"
                />
              </FormGroup>
            </FormControl>
          </div>
          <div>
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
