import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import {
  writeDescription,
  getSampleColors,
  updateResultMap,
} from "../../../actions/asbestosLab";

import { SketchPicker } from 'react-color';
import SuggestionField from '../../../widgets/SuggestionField';
import { AsbButton, } from '../../../widgets/FormWidgets';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Tooltip from "@material-ui/core/Tooltip";

import { addLog, } from '../../../actions/local';

class AsbestosSampleWASubfraction extends React.Component {
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

    console.log(`Rendering ${fraction}-${num}`);

    return(
      <div className={classes.flexRowHover}>
        <div className={classes.circleShaded}>
          {num}
        </div>
        <div className={classes.columnMedSmall}>
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
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall}>
          <TextField
            id={`l${num}Concentration`}
            label="Asbestos %"
            InputLabelProps={{ shrink: true }}
            InputProps = {{ inputProps: { min: 0, max: 100 }}}
            value={layer.concentration ? layer.concentration : ''}
            type='number'
            onChange={e => {
              this.setLayerVar('concentration', num, fraction, e.target.value, that);
            }}
          />
        </div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall}>
          <TextField
            id={`l${num}AsbestosWeight`}
            label="Asbestos Weight (g)"
            InputLabelProps={{ shrink: true, readOnly: true, }}
            value={layer.concentration && layer.weight ? (parseFloat(layer.weight) * parseFloat(layer.concentration) / 100).toPrecision(3) : ''}
          />
        </div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnLarge}>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="Type"
              name="type"
              value={ layer.type ? layer.type : '' }
              row
              onChange={e => {
                this.setLayerVar('type', num, fraction, e.target.value, that);
              }}
            >
              <FormControlLabel value="acm" control={<Radio />} label="ACM" />
              <FormControlLabel value="fa" control={<Radio />} label="FA" />
              <FormControlLabel value="af" control={<Radio />} label="AF" />
            </RadioGroup>
          </FormControl>
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf','no','org','smf'].map(res => {
            return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
            e => this.toggleLayerRes(res, num, fraction, sample, that))
          })}
        </div>
      </div>
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

export default withStyles(styles)(AsbestosSampleWASubfraction);
