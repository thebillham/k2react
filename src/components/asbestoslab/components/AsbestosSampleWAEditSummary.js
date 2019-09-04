import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import {
  writeDescription,
  getSampleColors,
  updateResultMap,
  getWATotalDetails,
} from "../../../actions/asbestosLab";
import classNames from 'classnames';

import { SketchPicker } from 'react-color';
import SuggestionField from '../../../widgets/SuggestionField';
import TextField from "@material-ui/core/TextField";
import { SampleTextyDisplay, SampleTextyLine, AsbButton, } from '../../../widgets/FormWidgets';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import AsbestosSampleWASubfraction from './AsbestosSampleWASubfraction';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { PieChart, Pie, Cell } from "recharts";
import theme from "../../../config/theme";

import { addLog, } from '../../../actions/local';

const waLayerNum = 3;
const waMap = {
  gt7: '>7',
  to7: '2-7',
  lt2: '<2',
}


const renderLabel = ({
cx, cy, midAngle, innerRadius, outerRadius, percent, index,
}) => {

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

class AsbestosSampleWAEditSummary extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.sample.waSoilAnalysis !== nextProps.sample.waSoilAnalysis ||
    this.props.sample.waLayerNum !== nextProps.waLayerNum ||
    this.props.sample.weightDry !== nextProps.sample.weightDry) return true;
    return false;
  }

  render() {
    const { classes, sample } = this.props;
    let fractionMap = getWATotalDetails(sample);
    let waColors = getSampleColors({result: fractionMap.result.total});

    let chartData = [];
    if (sample.waSoilAnalysis) {
      Object.keys(waMap).forEach(key => {
        if (sample.waSoilAnalysis[`fraction${key}WeightAshed`]) {
          chartData.push({
            value: parseFloat(sample.waSoilAnalysis[`fraction${key}WeightAshed`]),
            name: waMap[key],
            label: waMap[key],
          });
        }
      });
    }
    console.log(chartData);

    return(
      <div>
        <Grid container direction='row'>
          <Grid item xs={6} className={classes.headingRow}>
            Asbestos Form
          </Grid>
          <Grid item xs={3} className={classes.headingRow}>
            Weight (g)
          </Grid>
          <Grid item xs={3} className={classes.headingRow}>
            Percentage of Total
          </Grid>
        </Grid>
        <Grid container direction='row'>
          <Grid item xs={6} className={classes.firstColumn}>
            Combined
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            {fractionMap.weight.total.toPrecision(2)}g
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            {fractionMap && fractionMap.concentration.total ?
                <span className={(fractionMap.concentration.acm > 0.01 ||
                fractionMap.concentration.faaf > 0.001) ?
                  classes.boldRedWarningText :
                  classes.boldBlack}>{fractionMap.concentration.total.toPrecision(2)}%</span> :
            ''}
          </Grid>
        </Grid>
        <Grid container direction='row'>
          <Grid item xs={6} className={classes.firstColumn}>
            Asbestos-containing Material (ACM)
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            {fractionMap.weight.acm.toPrecision(2)}g
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            <span className={fractionMap.concentration.acm > 0.01 ?
              classes.boldRedWarningText :
              classes.boldBlack}>{fractionMap.concentration.acm.toPrecision(2)}%</span>
          </Grid>
        </Grid>
        <Grid container direction='row'>
          <Grid item xs={6} className={classes.firstColumn}>
            Friable Asbestos (FA)
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            {fractionMap.weight.fa.toPrecision(2)}g
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            <span className={fractionMap.concentration.fa > 0.001 ?
              classes.boldRedWarningText :
              classes.boldBlack}>{fractionMap.concentration.fa.toPrecision(2)}%</span>
          </Grid>
        </Grid>
        <Grid container direction='row'>
          <Grid item xs={6} className={classes.firstColumn}>
            Asbestos Fines (AF)
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            {fractionMap.weight.af.toPrecision(2)}g
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            <span className={fractionMap.concentration.af > 0.001 ?
              classes.boldRedWarningText :
              classes.boldBlack}>{fractionMap.concentration.af.toPrecision(2)}%</span>
          </Grid>
        </Grid>
        <Grid container direction='row'>
          <Grid item xs={6} className={classes.firstColumn}>
            Combined FA and AF
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            {fractionMap.weight.faaf.toPrecision(2)}g
          </Grid>
          <Grid item xs={3} className={classes.numberColumn}>
            <span className={fractionMap.concentration.faaf > 0.001 ?
              classes.boldRedWarningText :
              classes.boldBlack}>{fractionMap.concentration.faaf.toPrecision(2)}%</span>
          </Grid>
        </Grid>
        <div>
          {chartData.length > 1 && <PieChart width={200} height={200}>
            <Pie data={chartData} dataKey="value" nameKey="name" labelLine={false} label>
              {
                chartData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={theme.palette.colorList[index % theme.palette.colorList.length]}
                  />)
              }
            </Pie>
          </PieChart>}
        </div>
        {
          fractionMap && fractionMap.types && Object.keys(fractionMap.types).map(type => {
            console.log(type);
            return (
              <div className={classes.flexRowTotals} key={type}>
                <div className={classes.circleShadedHighlighted}>
                  {type.toUpperCase()}
                </div>
                <div className={classes.columnMedSmall} />
                <div className={classes.spacerSmall} />
                <div className={classes.columnMedSmall} />
                <div className={classes.spacerSmall} />
                <div className={classes.columnMedSmall}>
                  {fractionMap && fractionMap.weight[type] ? `${fractionMap.weight[type].toPrecision(4)}g` : ''}
                </div>
                <div className={classes.spacerSmall} />
                <div className={classes.columnLarge}>
                  {fractionMap && fractionMap.concentration[type] ?
                      <span className={((type === 'acm' && fractionMap.concentration.acm > 0.01) ||
                      (type !== 'acm' && fractionMap.concentration[type] > 0.001)) ?
                        classes.boldRedWarningText :
                        classes.boldBlack}>{fractionMap.concentration[type].toPrecision(2)}%</span> :
                  ''}
                </div>
                <div className={classes.flexRowRightAlign}>
                  {['ch','am','cr','umf','no','org','smf'].map(res => {
                    let cols = getSampleColors({result: fractionMap.result[type]});
                    return AsbButton(classes[`colorsButton${cols[res]}`], classes[`colorsDiv${cols[res]}`], res,
                    null)
                  })}
                </div>
              </div>
            );
          })
        }
        <div className={classes.flexRowTotals}>
          <div className={classes.circleShadedHighlighted}>
            ALL
          </div>
          <div className={classes.columnMedSmall} />
          <div className={classes.spacerSmall} />
          <div className={classes.columnMedSmall} />
          <div className={classes.spacerSmall} />
          <div className={classes.columnMedSmall}>
            {fractionMap && fractionMap.weight.total ? `${fractionMap.weight.total.toPrecision(4)}g` : ''}
          </div>
          <div className={classes.spacerSmall} />
          <div className={classes.columnLarge}>
            {fractionMap && fractionMap.concentration.total ?
                <span className={(fractionMap.concentration.acm > 0.01 ||
                fractionMap.concentration.faaf > 0.001) ?
                  classes.boldRedWarningText :
                  classes.boldBlack}>{fractionMap.concentration.total.toPrecision(4)}%</span> :
            ''}
          </div>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(classes[`colorsButton${waColors[res]}`], classes[`colorsDiv${waColors[res]}`], res,
              null)
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AsbestosSampleWAEditSummary);
