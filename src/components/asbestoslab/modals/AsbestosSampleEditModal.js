import React from "react";
import reactCSS from 'reactcss';
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { ASBESTOS_SAMPLE_DETAILS, SOIL_DETAILS } from "../../../constants/modal-types";
import { cocsRef, auth } from "../../../config/firebase";
import "../../../config/tags.css";

import { SampleTickyBox, SampleTextyBox, SampleRadioSelector, SampleTickyBoxGroup, SampleTextyDisplay, } from '../../../widgets/FormWidgets';
import { AsbestosClassification } from '../../../config/strings';

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
import { SuggestionField } from '../../../widgets/SuggestionField';
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { addLog, } from "../../../actions/local";
import {
  handleSampleChange,
  writeSoilDetails,
  getSampleColors,
  analyticalCriteraOK,
  traceAnalysisRequired,
} from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";
import _ from "lodash";

const layerNum = 5;

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '0',
};

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    me: state.local.me,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
  };
};

class AsbestosSampleEditModal extends React.Component {
  state = {
    sample: {},
    displayColorPicker: {},
    modified: false,
    materialSuggestions: [],
  };

  loadProps = () => {
    let sample = this.props.modalProps.doc;
    if (sample.layers === undefined) sample.layers = {};
    [...Array(layerNum).keys()].forEach(num => {
      if (sample.layers[`layer${num+1}`] === undefined) {
        sample.layers[`layer${num+1}`] = { color: defaultColor, result: {}, };
      }
    });
    this.setState({
      sample
    });
  }

  clearProps = () => {
    this.setState({ sample: {}, displayColorPicker: {}, modified: false, });
  }

  handleColorClick = (num) => {
    console.log(this.state.displayColorPicker);
    this.setState({ displayColorPicker: {
        ...this.state.displayColorPicker,
        [num]: !this.state.displayColorPicker[num],
      },
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

  render() {
    const { classes, modalProps, modalType } = this.props;
    const { sample } = this.state;
    let editor = this.props.me.auth && this.props.me.auth['Asbestos Bulk Analysis'];
    return (
      <div>
      {sample &&
      <Dialog
        open={modalType === ASBESTOS_SAMPLE_DETAILS}
        onClose={this.props.hideModal}
        maxWidth="lg"
        fullWidth={true}
        onEnter={() => this.loadProps()}
        onExit={() => this.clearProps()}
      >
        <DialogTitle>{`Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber} (${sample.description})`}</DialogTitle>
        <DialogContent>
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={5}>
              <div className={classes.subheading}>Description</div>
              {editor ? SampleTextyBox(this, sample, 'labDescription', null, 'Provide a detailed description of the material.', true, 3, null, null)
              : SampleTextyDisplay('Sample Description',sample.labDescription)}
              {editor ? SampleTextyBox(this, sample, 'labComments', null, 'Note any additional observations or comments.', true, 3, null, null)
              : SampleTextyDisplay('Lab Comments',sample.labComments)}

              <div style={{ padding: 48, margin: 12, justifyContent: 'center', alignItems: 'center', width: 600 }}>
                {editor && <Button
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
                </Button>}
                <div style={{ fontStyle: 'italic'}}>{writeSoilDetails(sample.soilDetails)}</div>
              </div>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={6}>
              <div className={this.props.classes.subheading}>Sampling Method</div>
                {SampleRadioSelector(this, sample, 'samplingMethod', 'normal', 'Sampling Method',
                  [{value: 'normal', label: 'Normal'},{value: 'tape', label: 'Tape'},{value: 'swab', label: 'Swab'}])}
              <div className={this.props.classes.subheading}>Weight</div>
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                {SampleTextyBox(this, sample, 'weightReceived', 'Weight as Received', 'Record the weight as received (e.g. before any conditioning).', false, 0, 'g', null)}
                <div style={{ width: 200 }} />
                {SampleTextyBox(this, sample, 'weightAnalysed', 'Weight Analysed', 'Record the weight analysed (e.g. after conditioning such as furnacing).', false, 0, 'g', null)}
              </div>

              <div className={this.props.classes.subheading}>Dimensions</div>
              <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                {SampleTextyBox(this, sample, 'dimensionsL', 'Length', null, false, 0, 'mm', null)}
                <span style={{ fontWeight: 450, fontSize: 12, margin: 14, }}>X</span>
                {SampleTextyBox(this, sample, 'dimensionsW', 'Width', null, false, 0, 'mm', null)}
                <span style={{ fontWeight: 450, fontSize: 12, margin: 14, }}>X</span>
                {SampleTextyBox(this, sample, 'dimensionsD', 'Depth/Thickness', null, false, 0, 'mm', null)}
              </div>
            </Grid>
          </Grid>
          <Divider />
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={5}>
              <div className={this.props.classes.subheading}>Classification</div>
              {SampleRadioSelector(this, sample, 'classification', 'homo', 'Classification',
                [{value: 'homo', label: 'Homogenous', tooltip: 'Uniform distribution of fibres of any type through the entire sample or in each discernibly discrete layer of the sample (sprayed asbestos, asbestos-cement, mastic, vermiculite)'},
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
              <div className={this.props.classes.informationBox}>
                {AsbestosClassification(sample.classification)}
              </div>
            </Grid>
          </Grid>
          <Divider />
          <Grid container>
            <Grid item xs={12}>
              <div className={this.props.classes.subheading} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
                Layers
                <IconButton size='small' aria-label='add' style={{ marginLeft: 12 }} onClick={this.addLayer}><AddIcon /></IconButton>
                <IconButton size='small' aria-label='remove' style={{ marginLeft: 12 }} onClick={this.removeLayer}><RemoveIcon /></IconButton>
              </div>
              {[...Array(sample && sample.layerNum ? sample.layerNum : layerNum).keys()].map(num => {
                return this.getLayerRow(num+1);
              })}
            </Grid>
          </Grid>
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
                    }) details edited.`,
                sample: sample.uid,
                chainOfCustody: sample.cocUid,
              };
              addLog("asbestosLab", log, this.props.me);
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

  getLayerRow = (num) => {
    let layer = {};
    let colors = {};

    if (this.state.sample.layers && this.state.sample.layers[`layer${num}`]) {
      layer = this.state.sample.layers[`layer${num}`];
      colors = getSampleColors(layer);
    }

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '12px',
          background: `rgba(${ layer.color ? layer.color.r : null }, ${ layer.color ? layer.color.g : null }, ${ layer.color ? layer.color.b : null }, ${ layer.color ? layer.color.a : null })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'fixed',
          top: '45%',
          left: '45%',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return(
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
        {SuggestionField(this, false, 'Description', 'materialSuggestions', layer.description,
          (value) => {
            this.setLayerVar('description', num, value);
            }
        )}

        <div style={{ marginRight: 12,}}>
          <div style={ styles.swatch } onClick={ () => this.handleColorClick(num) }>
            <div style={ styles.color } />
          </div>
          { this.state.displayColorPicker[num] ? <div style={ styles.popover }>
            <div style={ styles.cover } onClick={ () => this.handleColorClose(num) }/>
            <SketchPicker color={ this.state.sample.layers[`layer${num}`].color } onChangeComplete={ color => this.setLayerVar('color', num, color.rgb) } />
          </div> : null }

        </div>
        <TextField
          id={`l${num}Concentration`}
          label="Asbestos %"
          style={{ marginRight: 14, }}
          value={layer.concentration ? layer.concentration : 0}
          onChange={e => {
            this.setLayerVar('concentration',num,e.target.value);
          }}
        />
        <div
          style={{
            backgroundColor: colors.chDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Chrysotile (white) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.chColor }}
              onClick={e => {
                this.toggleLayerRes('ch', num, layer, true);
              }}
            >
              CH
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colors.amDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Amosite (brown) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.amColor }}
              onClick={e => {
                this.toggleLayerRes('am', num, layer, true);
              }}
            >
              AM
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colors.crDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Crocidolite (blue) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.crColor }}
              onClick={e => {
                this.toggleLayerRes('cr', num, layer, true);
              }}
            >
              CR
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colors.umfDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Unidentified mineral fibres detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.umfColor }}
              onClick={e => {
                this.toggleLayerRes('umf', num, layer, true);
              }}
            >
              UMF
            </Button>
          </Tooltip>
        </div>
        <div style={{ width: 40, }} />
        <div
          style={{
            backgroundColor: colors.noDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='No asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.noColor }}
              onClick={e => {
                this.removeLayerPositives(num);
              }}
            >
              NO
            </Button>
          </Tooltip>
        </div>
        <div style={{ width: 40, }} />
        <div
          style={{
            backgroundColor: colors.orgDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Organic fibres detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.orgColor }}
              onClick={e => {
                this.toggleLayerRes('org', num, layer,);
              }}
            >
              ORG
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colors.smfDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Synthetic mineral fibres or MMMF detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colors.smfColor }}
              onClick={e => {
                this.toggleLayerRes('smf', num, layer,);
              }}
            >
              SMF
            </Button>
          </Tooltip>
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

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleEditModal)
);
