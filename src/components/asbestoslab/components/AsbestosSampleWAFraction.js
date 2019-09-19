import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import {
  writeDescription,
  getSampleColors,
  getWAFractionDetails,
  updateResultMap,
} from "../../../actions/asbestosLab";
import { SamplesTextyBoxAlt } from '../../../widgets/FormWidgets';

import classNames from 'classnames';

import { SketchPicker } from 'react-color';
import SuggestionField from '../../../widgets/SuggestionField';
import { AsbButton, } from '../../../widgets/FormWidgets';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from "@material-ui/core/Tooltip";
import InputAdornment from "@material-ui/core/InputAdornment";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Grid from '@material-ui/core/Grid';
import AsbestosSampleWASubfraction from './AsbestosSampleWASubfraction';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ExpandMore from "@material-ui/icons/ExpandMore";

import { addLog, } from '../../../actions/local';

const waLayerNum = 1;
const waMap = {
  gt7: '>7',
  to7: '2-7',
  lt2: '<2',
}
const subSampleMap = {
  gt7: 'A',
  to7: 'B',
  lt2: 'C',
}

class AsbestosSampleWAFraction extends React.Component {
  state = {
    expanded: true,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.sample.sampleNumber !== nextProps.sample.sampleNumber) return true;
    if (this.state.expanded !== nextState.expanded) return true; // List has been opened or closed
    if (!nextState.expanded) return false; // List is not expanded (hidden)
    if (this.props.sample.waLayerNum[this.props.fraction] !== nextProps.sample.waLayerNum[this.props.fraction]) return true;
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
      <ExpansionPanel
        expanded={this.state.expanded}
        onChange={(event, ex) => {
          this.setState({
            expanded: ex,
          })
        }}
      >
        <ExpansionPanelSummary className={classes.subHeading} expandIcon={<ExpandMore />}>{title}</ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className={classes.fullWidth}>
            <div className={classes.flexRowCenter}>
              <div>
                <InputLabel>Add/Remove Subsamples</InputLabel>
                <div className={classes.flexRowCenter}>
                  <IconButton size='small' aria-label='add' className={classes.marginLeftSmall} onClick={() => this.addLayer(fraction, sample, that)}><AddIcon /></IconButton>
                  <IconButton size='small' aria-label='remove' className={classes.marginLeftSmall} onClick={() => this.removeLayer(fraction, sample, that)}><RemoveIcon /></IconButton>
                </div>
              </div>
              { fraction === 'lt2' && <div className={classes.flexRow}>
              <div className={classes.spacerMedium} />
              <div className={classes.columnMedSmall}>
                {SamplesTextyBoxAlt(that, sample, 'waSoilAnalysis', 'fractionlt2WeightAshed', null, 'Total Fraction Weight', false, 0, 'g', null, true)}
              </div>
              <div className={classes.spacerMedium} />
              <div className={classes.columnMedSmall}>
                {SamplesTextyBoxAlt(that, sample, 'waSoilAnalysis', 'fractionlt2WeightAshedSubsample', null, 'Weight of Fraction Analysed', false, 0, 'g', null, true)}
              </div>
              <div className={classes.spacerMedium} />
              {sample.waSoilAnalysis && sample.waSoilAnalysis.fractionlt2WeightAshed && sample.waSoilAnalysis.fractionlt2WeightAshedSubsample &&
                <div className={classes.columnLarge}>Asbestos in this fraction multiplied by {parseFloat(sample.waSoilAnalysis.fractionlt2WeightAshed/sample.waSoilAnalysis.fractionlt2WeightAshedSubsample).toFixed(1)}</div>
              }
              </div>}
            </div>
            <div className={classes.marginTopSmall} />
            {[...Array(sample && sample.waLayerNum && sample.waLayerNum[fraction] ? sample.waLayerNum[fraction] : waLayerNum).keys()].map(num => {
              return <AsbestosSampleWASubfraction key={num} sample={sample} num={num+1} fraction={fraction} that={that} prefix={subSampleMap[fraction]} />;
            })}
            {false && <Grid container className={classes.flexRowHover} direction='row'>
              <Grid item xs={12} md={8} lg={6} className={classes.flexRow}>
                <div className={classes.circleShadedHighlighted}>
                  {waMap[fraction]}
                </div>
                <div className={classes.columnMedSmall} />
                <div className={classes.spacerSmall} />
                <div className={classes.columnMedSmall} />
                <div className={classes.spacerSmall} />
                <div className={classes.columnMedSmall}>
                  {fractionMap && fractionMap.totalAsbestosWeight ? `${fractionMap.totalAsbestosWeight.toPrecision(6)}g` : ''}
                </div>
                <div className={classes.spacerSmall} />
                <div className={classes.columnLarge}>
                  {['acm','fa','af'].filter(form => fractionMap && fractionMap.forms[form]).map(form => {
                    return form.toUpperCase()}).join(' ')
                  }
                </div>
              </Grid>
              <Grid item xs={12} lg={6}>
                <div className={classes.flexRowRightAlign}>
                  {['ch','am','cr','umf','no','org','smf'].map(res => {
                    return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
                    null)
                  })}
                </div>
              </Grid>
            </Grid>}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
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
