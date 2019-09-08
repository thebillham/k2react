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
   };
};

class AsbestosSampleWASubfraction extends React.Component {
  state = {
    form: this.props.sample.waSoilAnalysis[`subfraction${this.props.fraction}-${this.props.num}`].formDescription ?
    this.props.sample.waSoilAnalysis[`subfraction${this.props.fraction}-${this.props.num}`].formDescription : '',
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.sample.sampleNumber !== nextProps.sample.sampleNumber) return true;
    if (this.props.sample.waSoilAnalysis && nextProps.sample.waSoilAnalysis &&
      this.props.sample.waSoilAnalysis[`subfraction${this.props.fraction}-${this.props.num}`] !== nextProps.sample.waSoilAnalysis[`subfraction${this.props.fraction}-${this.props.num}`]) return true;
    return false;
  }

  render() {
    const { classes, num, sample, fraction, that } = this.props;

    let layer = {};
    let colors = {};

    if (sample.waSoilAnalysis && sample.waSoilAnalysis[`subfraction${fraction}-${num}`]) {
      layer = sample.waSoilAnalysis[`subfraction${fraction}-${num}`];
      colors = getSampleColors(layer);
    } else {
      colors = getSampleColors(null);
    }

    return(
      <Grid container className={classes.flexRowHover} direction='row' spacing={1}>
        <Grid item xs={12} lg={6} className={classes.flexRow}>
          <div className={classes.circleShaded}>
            {num}
          </div>
          <div className={classes.columnSmall}>
            <TextField
              id={`l${num}Weight`}
              label="Weight (g)"
              InputLabelProps={{ shrink: true }}
              value={layer.weight ? layer.weight : ''}
              type='number'
              onChange={e => {
                this.setLayerVar('weight', num, fraction, e.target.value, that);
              }}
            />
          </div>
          <div className={classes.columnMed}>
            <Select
              value={layer.formDescription ? {value: layer.formDescription, label: layer.formDescription} : {value: '', label: ''}}
              options={this.props.asbestosInSoilForms.map(e => ({ value: e, label: e.description }))}
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
                          formDescription: e.value.description,
                          form: e.value.form,
                          concentration: e.value.concentration,
                        }
                      },
                    },
                  }
                })
              }}
            />
            {false && <TextField
              id={`l${num}Concentration`}
              label="Asbestos %"
              InputLabelProps={{ shrink: true }}
              InputProps = {{ inputProps: { min: 0, max: 100 }}}
              value={layer.concentration ? layer.concentration : ''}
              type='number'
              onChange={e => {
                this.setLayerVar('concentration', num, fraction, e.target.value, that);
              }}
            />}
          </div>
          <div className={classNames(classes.columnSmall, classes.informationBox)}>
            {layer.concentration && layer.weight ? (parseFloat(layer.weight) * parseFloat(layer.concentration) / 100).toPrecision(3) + 'g' : ''}
          </div>
          <div className={classes.spacerSmall} />
          {false && <div className={classes.columnLarge}>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Form"
                name="form"
                value={ layer.form ? layer.form : '' }
                row
                onChange={e => {
                  this.setLayerVar('form', num, fraction, e.target.value, that);
                }}
              >
                <FormControlLabel value="acm" control={<Radio />} label="ACM" />
                <FormControlLabel value="fa" control={<Radio />} label="FA" />
                <FormControlLabel value="af" control={<Radio />} label="AF" />
              </RadioGroup>
            </FormControl>
          </div>}
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
  )(AsbestosSampleWASubfraction));
