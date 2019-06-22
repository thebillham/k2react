import React from "react";
import reactCSS from 'reactcss';
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { ASBESTOSSAMPLEDETAILS, SOILDETAILS } from "../../../constants/modal-types";
import { cocsRef, auth } from "../../../config/firebase";
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
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { handleSampleChange, writeSoilDetails, } from "../../../actions/asbestosLab";
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
    modalProps: state.modal.modalProps,
    me: state.local.me,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleSampleChange: (number, type, value) => dispatch(handleSampleChange(number, type, value)),
    showModalSecondary: modal => dispatch(showModalSecondary(modal)),
  };
};

class AsbestosSampleDetailsModal extends React.Component {
  state = {
    sample: {},
    displayColorPicker: {},
    modified: false,
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
    return (
      <div>
      {sample &&
      <Dialog
        open={modalType === ASBESTOSSAMPLEDETAILS}
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
              <div className={this.props.classes.subheading}>Sampling Method</div>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="Sampling Method"
                  name="samplingMethod"
                  value={sample.samplingMethod ? sample.samplingMethod : 'normal' }
                  row
                  onChange={e => {
                    this.setState({
                      modified: true,
                      sample: {
                        ...sample,
                        labDescription: e.target.value,
                      }
                    });
                  }}
                >
                  <FormControlLabel value="normal" control={<Radio />} label="Normal" />
                  <FormControlLabel value="tape" control={<Radio />} label="Tape" />
                  <FormControlLabel value="swab" control={<Radio />} label="Swab" />
                </RadioGroup>
              </FormControl>
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
                        modified: true,
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
                          modified: true,
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
                          modified: true,
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
                          modified: true,
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
                      modified: true,
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
                      modified: true,
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
                      modified: true,
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
                      modified: true,
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
                      modified: true,
                      sample: {
                        ...sample,
                        dimensionsD: e.target.value,
                      }
                    });
                  }}
                />
              </div>
              <div style={{ padding: 48, margin: 12, justifyContent: 'center', width: 600 }}>
                <div style={{ fontWeight: 500, fontSize: 16, textAlign: 'center', }}>Geotechnical Soil Description</div>
                <Button
                  variant="outlined"
                  style={{ marginBottom: 16, marginTop: 16, }}
                  onClick={() => {
                    this.props.showModalSecondary({
                      modalType: SOILDETAILS,
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
              {/*{doc.fileUrl && (
                <div>
                  <img
                    src={doc.fileUrl}
                    alt=""
                    width="200px"
                    style={{
                      opacity: "0.5",
                      borderStyle: "solid",
                      borderWidth: "2px"
                    }}
                  />
                  <IconButton
                    style={{
                      position: "relative",
                      top: "2px",
                      left: "-120px",
                      borderStyle: "solid",
                      borderWidth: "2px",
                      fontSize: 8
                    }}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you wish to delete the image?"
                        )
                      )
                        this.deleteImage(doc.fileRef, doc.uid);
                    }}
                  >
                    <Close />
                  </IconButton>
                </div>
              )}

              Always allow file upload
              <InputLabel style={{ fontSize: 12, marginTop: 4 }}>
                Upload Photos
              </InputLabel>
              <label>
                <UploadIcon className={classes.accentButton} />
                <input
                  id="attr_upload_file"
                  type="file"
                  style={{ display: "none" }}
                  onChange={e => {
                    this.props.onUploadFile({
                      file: e.currentTarget.files[0],
                      storagePath:
                        "attr/" +
                        modalProps.staffName.replace(/\s+/g, "") +
                        "/" +
                        doc.type +
                        "_"
                    });
                  }}
                />
                <LinearProgress
                  style={{ marginTop: 4 }}
                  variant="determinate"
                  value={modalProps.uploadProgress}
                />
              </label>*/}
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
                user: auth.currentUser.uid,
                sample: sample.uid,
                userName: this.props.me.name,
                date: new Date()
              };
              let cocLog = modalProps.job.cocLog;
              cocLog ? cocLog.push(log) : (cocLog = [log]);
              cocsRef
                .doc(modalProps.job.uid)
                .update({ cocLog: cocLog });
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
    let chColor, amColor, crColor, umfColor, noColor, orgColor, smfColor = '#ddd';
    let chDivColor, amDivColor, crDivColor, umfDivColor, noDivColor, orgDivColor, smfDivColor = 'white';

    let layer = {};

    if (this.state.sample.layers && this.state.sample.layers[`layer${num}`]) {
      layer = this.state.sample.layers[`layer${num}`];
      let res = layer.result;

      chColor = this.getResultColor(res, 'ch', '#ddd', 'white');
      chDivColor = this.getResultColor(res, 'ch', 'white', 'red');

      amColor = this.getResultColor(res, 'am', '#ddd', 'white');
      amDivColor = this.getResultColor(res, 'am', 'white', 'red');

      crColor = this.getResultColor(res, 'cr', '#ddd', 'white');
      crDivColor = this.getResultColor(res, 'cr', 'white', 'red');

      umfColor = this.getResultColor(res, 'umf', '#ddd', 'white');
      umfDivColor = this.getResultColor(res, 'umf', 'white', 'red');

      noColor = this.getResultColor(res, 'no', '#ddd', 'green');
      noDivColor = this.getResultColor(res, 'no', 'white', 'lightgreen');

      orgColor = this.getResultColor(res, 'org', '#ddd', 'mediumblue');
      orgDivColor = this.getResultColor(res, 'org', 'white', 'lightblue');

      smfColor = this.getResultColor(res, 'smf', '#ddd', 'mediumblue');
      smfDivColor = this.getResultColor(res, 'smf', 'white', 'lightblue');
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
        <TextField
          id={`l${num}Description`}
          label="Material description"
          style={{ width: '30%', marginRight: 14, }}
          value={layer.description ? layer.description : ''}
          onChange={e => {
            this.setLayerVar('description', num, e.target.value);
          }}
        />

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
            backgroundColor: chDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Chrysotile (white) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: chColor }}
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
            backgroundColor: amDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Amosite (brown) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: amColor }}
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
            backgroundColor: crDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Crocidolite (blue) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: crColor }}
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
            backgroundColor: umfDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Unidentified mineral fibres detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: umfColor }}
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
            backgroundColor: noDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='No asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: noColor }}
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
            backgroundColor: orgDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Organic fibres detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: orgColor }}
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
            backgroundColor: smfDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Synthetic mineral fibres or MMMF detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: smfColor }}
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

  getResultColor = (state, type, noColor, yesColor) => {
    if(state && state[type] === true) return yesColor;
    return noColor;
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleDetailsModal)
);
