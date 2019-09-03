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
import { PieChart, Pie } from "recharts";

import { addLog, } from '../../../actions/local';

const waLayerNum = 3;
const waMap = {
  gt7: '>7',
  to7: '2-7',
  lt2: '<2',
}

class AsbestosSampleWAEditSummary extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.sample.waSoilAnalysis !== nextProps.sample.waSoilAnalysis ||
    this.props.sample.weightReceived !== nextProps.sample.weightReceived) return true;
    return false;
  }

  render() {
    const { classes, sample } = this.props;
    let fractionMap = getWATotalDetails(sample);
    let waColors = getSampleColors(fractionMap);

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
      <Grid container>
        <Grid>
          {SampleTextyLine('Asbestos in ACM as % of Total', `${fractionMap.asbestosInACMConc}%`)}
          {SampleTextyLine('Combined FA and AF as % of Total', `${fractionMap.asbestosInFAAFConc}%`)}
          {SampleTextyLine('Asbestos in Friable Asbestos as % of Total', `${fractionMap.asbestosInFAConc}%`)}
          {SampleTextyLine('Asbestos in Asbestos Fines as % of Total', `${fractionMap.asbestosInAFConc}%`)}
          {SampleTextyLine('Weight of Asbestos in ACM', `${fractionMap.asbestosInACM}g`)}
          {SampleTextyLine('Weight of Asbestos as Friable Asbestos', `${fractionMap.asbestosInFA}g`)}
          {SampleTextyLine('Weight of Asbestos as Asbestos Fines', `${fractionMap.asbestosInAF}g`)}
          <div className={classes.flexRowTotals}>
            <div className={classes.circleShadedHighlighted}>
              ALL
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
                return AsbButton(classes[`colorsButton${waColors[res]}`], classes[`colorsDiv${waColors[res]}`], res,
                null)
              })}
            </div>
          </div>
        </Grid>
        <Grid>
          {chartData.length > 1 && <PieChart width={200} height={200}>
            <Pie data={chartData} dataKey="value" nameKey="name">
              {
                chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
              }
            </Pie>
          </PieChart>}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(AsbestosSampleWAEditSummary);
