import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  writeDescription,
  getSampleColors,
  updateResultMap,
} from "../../../actions/asbestosLab";
import classNames from 'classnames';

import { SketchPicker } from 'react-color';
import SuggestionField from '../../../widgets/SuggestionField';
import { AsbButton, } from '../../../widgets/FormWidgets';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import Select from 'react-select';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Tooltip from "@material-ui/core/Tooltip";

import { addLog, } from '../../../actions/local';

const mapStateToProps = state => {
  return {
    asbestosInSoilForms: state.const.asbestosInSoilForms,
    asbestosInSoilConcentrations: state.const.asbestosInSoilConcentrations,
   };
};

class AsbestosSampleWASubsample extends React.Component {
  state = {
    form: this.props.subsample.formDescription ?
    this.props.subsample.formDescription : '',
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.sample.sampleNumber !== nextProps.sample.sampleNumber) return true;
    if (this.props.subsample !== nextProps.subsample) return true;
    return false;
  }

  render() {
    const { classes, num, sample, subsample, that, } = this.props;
    let colors = getSampleColors(subsample);
    let fraction = 'gt7';

    return(
      <Grid container className={classes.flexRowHover} direction='row' spacing={1}>
        <Grid item xs={12} lg={6} className={classes.flexRow}>
          <div className={classNames(classes.bold, classes.columnSmall)}>
            <TextField
              id={`l${num}ID`}
              label="ID"
              InputLabelProps={{ shrink: true }}
              value={subsample.containerID ? subsample.containerID : ''}
              onChange={e => {
                this.setLayerVar('containerID', num, fraction, e.target.value, that);
              }}
            />
            {/*`${prefix}${num}`*/}
          </div>
          <div className={classes.columnMedSmall}>
            <TextField
              id={`l${num}Weight`}
              label="Weight (g)"
              InputLabelProps={{ shrink: true }}
              value={subsample.weight ? subsample.weight : ''}
              type='number'
              onChange={e => {
                this.setLayerVar('weight', num, fraction, e.target.value, that);
              }}
            />
          </div>
          <div className={classes.spacerSmall} />
          <div className={classes.columnMedSmall}>
            <TextField
              id={`l${num}TareWeight`}
              label="Tare Weight (g)"
              InputLabelProps={{ shrink: true }}
              value={subsample.tareWeight ? subsample.tareWeight : ''}
              type='number'
              onChange={e => {
                this.setLayerVar('tareWeight', num, fraction, e.target.value, that);
              }}
            />
          </div>
          <div className={classes.spacerSmall} />
          <div className={classes.columnMedLarge}>
            <Select
              value={subsample.concentration ?
                {value: subsample.concentration, label: this.props.asbestosInSoilConcentrations.filter(e => e.value === subsample.concentration)[0].label} :
                {value: '', label: ''}}
              options={this.props.asbestosInSoilConcentrations.map(e => ({ value: e.value, label: e.label }))}
              onChange={e => {
                that.setState({
                  modified: true,
                  samples: {
                    ...that.state.samples,
                    [that.state.activeSample]: {
                      ...that.state.samples[that.state.activeSample],
                      waSoilAnalysis: {
                        ...that.state.samples[that.state.activeSample].waSoilAnalysis,
                        [`subfraction${fraction}-${num}`]: {
                          ...that.state.samples[that.state.activeSample].waSoilAnalysis[`subfraction${fraction}-${num}`],
                          concentration: e.value,
                        }
                      },
                    },
                  }
                })
              }}
            />
        </div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall}>
          <Select
            value={subsample.form ? {value: subsample.form, label: this.props.asbestosInSoilForms.filter(e => e.value === subsample.form)[0].label} : {value: '', label: ''}}
            options={subsample.fraction === 'gt7' ?
              this.props.asbestosInSoilForms.map(e => ({ value: e.value, label: e.label })) :
              this.props.asbestosInSoilForms.filter(e => e.value !== 'acm').map(e => ({ value: e.value, label: e.label }))
            }
            onChange={e => {
              that.setState({
                modified: true,
                samples: {
                  ...that.state.samples,
                  [that.state.activeSample]: {
                    ...that.state.samples[that.state.activeSample],
                    waSoilAnalysis: {
                      ...that.state.samples[that.state.activeSample].waSoilAnalysis,
                      [`subfraction${fraction}-${num}`]: {
                        ...that.state.samples[that.state.activeSample].waSoilAnalysis[`subfraction${fraction}-${num}`],
                        form: e.value,
                      }
                    },
                  },
                }
              })
            }}
          />
        </div>
        <div className={classes.columnMedSmall}>
          <div className={classNames(classes.informationBoxRounded, classes.bold)}>
            {subsample.concentration && subsample.weight ? subsample.tareWeight ?
              ((parseFloat(subsample.weight) - parseFloat(subsample.tareWeight)) * parseFloat(subsample.concentration) / 100).toFixed(5) + 'g'
              : (parseFloat(subsample.weight) * parseFloat(subsample.concentration) / 100).toFixed(5) + 'g'
            : ''}
          </div>
        </div>
        </Grid>
        <Grid item xs={12} lg={6}>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
              e => this.toggleLayerRes(res, num, fraction, sample, that))
            })}
          </div>
        </Grid>
      </Grid>
    );
  }

  setLayerVar = (variable, num, fraction, val, that) => {
    that.setState({
      modified: true,
      samples: {
        ...that.state.samples,
        [that.state.activeSample]: {
          ...that.state.samples[that.state.activeSample],
          waSoilAnalysis: {
            ...that.state.samples[that.state.activeSample].waSoilAnalysis,
            [`subfraction${fraction}-${num}`]: {
              ...that.state.samples[that.state.activeSample].waSoilAnalysis[`subfraction${fraction}-${num}`],
              [variable]: val,
            }
          },
        },
      },
    });
  }

  toggleLayerRes = (res, num, fraction, sample, that) => {
    let newMap = updateResultMap(res, sample.waSoilAnalysis[`subfraction${fraction}-${num}`].result);
    this.setLayerVar('result', num, fraction, newMap, that);
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    null,
  )(AsbestosSampleWASubsample));
