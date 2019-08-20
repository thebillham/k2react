import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import {
  writeDescription,
  getSampleColors,
  getWAFractionDetails,
  updateResultMap,
} from "../../../actions/asbestosLab";
import classNames from 'classnames';

import { SketchPicker } from 'react-color';
import SuggestionField from '../../../widgets/SuggestionField';
import { AsbButton, } from '../../../widgets/FormWidgets';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import InputAdornment from "@material-ui/core/InputAdornment";
import AsbestosSampleWASubfraction from './AsbestosSampleWASubfraction';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import { addLog, } from '../../../actions/local';

const waLayerNum = 3;
const waMap = {
  gt7: '>7',
  to7: '2-7',
  lt2: '<2',
}

class AsbestosSampleWAFraction extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.sample.sampleNumber !== nextProps.sample.sampleNumber) return true;
    if (this.props.sample.waLayerNum !== nextProps.sample.waLayerNum) return true;
    if (this.props.sample.waSoilAnalysis !== nextProps.sample.waSoilAnalysis) return true;
    return false;
  }

  render() {
    const { classes, that, fraction, sample } = this.props;
    let title = `${waMap[fraction]}mm Fraction`;
    let weightFA = 0.0;
    let weightAF = 0.0;
    let weightACM = 0.0;
    let weightDry = sample.weightDry;

    [...Array(sample && sample.waLayerNum && sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : waLayerNum).keys()].forEach(num => {
      if (sample.waSoilAnalysis && sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`] !== undefined) {
        let sub = sample.waSoilAnalysis[`subfraction${fraction}-${num+1}`];
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
    if (weightDry) {
      concentrationFA = weightFA/weightDry*100;
      concentrationAF = weightAF/weightDry*100;
      concentrationACM = weightACM/weightDry*100;
      concentrationFAAF = (weightFA+weightAF)/weightDry*100;
    }

    console.log(`Rendering ${fraction}`);
    let fractionMap = getWAFractionDetails(sample, fraction);
    let colors = getSampleColors(fractionMap);

    return(
      <div className={classes.paddingAllMedium}>
        <div className={classes.subHeading}>{title}</div>
        <TextField
          id="weightAshed"
          label="Ashed Weight"
          className={classes.columnMedSmall}
          value={sample && sample.waSoilAnalysis && sample.waSoilAnalysis['fraction' + fraction + 'WeightAshed'] ? sample.waSoilAnalysis['fraction' + fraction + 'WeightAshed'] : ''}
          helperText="Record the weight of this fraction after ashing at ~400°C"
          InputProps={{
            endAdornment: <InputAdornment position="end">g</InputAdornment>,
          }}
          onChange={e => {
            that.setState({
              modified: true,
              samples: {
                ...that.state.samples,
                [that.state.activeSample]: {
                  ...that.state.samples[that.state.activeSample],
                  waSoilAnalysis: {
                    ...that.state.samples[that.state.activeSample].waSoilAnalysis,
                    ['fraction' + fraction + 'WeightAshed']: e.target.value,
                  },
                },
              },
            });
          }}
        />
        <div className={classes.flexRowCenter}>
          <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={() => this.addLayer(fraction, sample, that)}><AddIcon /></IconButton>
          <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={() => this.removeLayer(fraction, sample, that)}><RemoveIcon /></IconButton>
        </div>
        {[...Array(sample && sample.waLayerNum && sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : waLayerNum).keys()].map(num => {
          return <AsbestosSampleWASubfraction key={num} sample={sample} num={num+1} fraction={fraction} that={that} />;
        })}
        <div className={classes.flexRowTotals}>
          <div className={classes.circleShadedHighlighted}>
            {waMap[fraction]}
          </div>
          <div className={classes.columnMedSmall} />
          <div className={classes.spacerSmall} />
          <div className={classes.columnMedSmall}>
            {fractionMap && fractionMap.totalAsbestosWeight ? `Total Asbestos Weight:` : ''}
          </div>
          <div className={classes.spacerSmall} />
          <div className={classes.columnMedSmall}>
            {fractionMap && fractionMap.totalAsbestosWeight ? `${fractionMap.totalAsbestosWeight.toPrecision(6)}g` : ''}
          </div>
          <div className={classes.spacerSmall} />
          <div className={classes.columnLarge}>
            {['acm','fa','af'].filter(type => fractionMap && fractionMap.types[type]).map(type => {
              return type.toUpperCase()}).join(' ')
            }
          </div>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
              null)
            })}
          </div>
        </div>
      </div>
    );
  }

  addLayer = (fraction, sample, that) => {
    let num = sample.waLayerNum && sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : waLayerNum;
    num += 1;
    let waLayer = sample.waSoilAnalysis && sample.waSoilAnalysis[`subfraction${fraction}-${num}`];
    if (waLayer === undefined) {
      waLayer = {result: {}};
    }
    that.setState({
      modified: true,
      samples: {
        ...that.state.samples,
        [that.state.activeSample]: {
          ...that.state.samples[that.state.activeSample],
          waLayerNum: {
            ...that.state.samples[that.state.activeSample].waLayerNum,
            [fraction]: num,
          },
          waSoilAnalysis: {
            ...that.state.samples[that.state.activeSample].waSoilAnalysis,
            [`subfraction${fraction}-${num}`]: waLayer,
          }
        },
      },
    });
  };

  removeLayer = (fraction, sample, that) => {
    let num = sample.waLayerNum && sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : waLayerNum;
    num -= 1;
    if (num < 1) num = 1;
    that.setState({
      modified: true,
      samples: {
        ...that.state.samples,
        [that.state.activeSample]: {
          ...that.state.samples[that.state.activeSample],
          waLayerNum: {
            ...that.state.samples[that.state.activeSample].waLayerNum,
            [fraction]: num,
          },
        },
      },
    });
  };
}

export default withStyles(styles)(AsbestosSampleWAFraction);
