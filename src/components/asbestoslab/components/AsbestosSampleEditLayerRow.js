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
import Tooltip from "@material-ui/core/Tooltip";

import { addLog, } from '../../../actions/local';

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '1',
};

class AsbestosSampleEditLayerRow extends React.Component {
  state = {
    displayColorPicker: false,
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state !== nextState) return true;
    // if (this.props !== nextProps) return true;
    if (this.props.result !== nextProps.result) return true;
    return false;
  }

  handleColorClick = (num) => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleColorClose = (num) => {
    this.setState({ displayColorPicker: false });
  };

  render() {
    const { classes, that, num } = this.props;
    let layer = {};
    let colors = {};
    let sample = that.state.samples[that.state.activeSample];

    if (sample.layers && sample.layers[`layer${num}`]) {
      layer = sample.layers[`layer${num}`];
      colors = getSampleColors(layer);
    } else {
      colors = getSampleColors(null);
    }

    return(
        <div className={classes.flexRowHoverMed}>
          <div className={classes.flexRow}>
            <div className={classes.spacerSmall} />
            <div className={classes.verticalCenter}>
              <div className={classes.circleShaded}>
                {num}
              </div>
            </div>
            <div className={classes.columnMedLarge}>
              <SuggestionField that={that} suggestions='materialSuggestions'
                value={layer.description}
                defaultValue=''
                controlled={true}
                onModify={(value) => {
                    this.setLayerVar('description', num, value, that);
                  }}
              />
            </div>
            <div className={classes.verticalCenter}>
              <div className={ classes.colorPickerSwatch } onClick={ () => this.handleColorClick(num) }>
                <div className={classes.colorPickerColor} style={{ background: `rgba(${ layer.color ? layer.color.r : null }, ${ layer.color ? layer.color.g : null }, ${ layer.color ? layer.color.b : null }, ${ layer.color ? layer.color.a : null })` }} />
              </div>
              { this.state.displayColorPicker ? <div className={ classes.colorPickerPopover }>
                <div className={ classes.colorPickerCover } onClick={ () => this.handleColorClose(num) }/>
                <SketchPicker color={ sample.layers[`layer${num}`].color } onChangeComplete={ color => this.setLayerVar('color', num, color.rgb, that) } />
              </div> : null }
            </div>
            <TextField
              id={`l${num}Concentration`}
              label="Asbestos %"
              className={classes.columnSmall}
              value={layer.concentration ? layer.concentration : 0}
              onChange={e => {
                this.setLayerVar('concentration', num, e.target.value, that);
              }}
            />
          </div>
          <div className={classes.flexRowRightAlign}>
            {['ch','am','cr','umf','no','org','smf'].map(res => {
              return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
              e => this.toggleLayerRes(res, num, that))
            })}
          </div>
      </div>
    );
  }

  setLayerVar = (variable, num, val, that) => {
    that.setState({
      modified: true,
      samples: {
        ...that.state.samples,
        [that.state.activeSample]: {
          ...that.state.samples[that.state.activeSample],
          layers: {
            ...that.state.samples[that.state.activeSample].layers,
            [`layer${num}`]: {
              ...that.state.samples[that.state.activeSample].layers[`layer${num}`],
              [variable]: val,
            },
          },
        },
      }
    });
  }

  toggleLayerRes = (res, num, that) => {
    let sample = that.state.samples[that.state.activeSample];
    let newMap = updateResultMap(res, sample.layers[`layer${num}`].result);
    this.setLayerVar('result', num, newMap, that);
  }
}

export default withStyles(styles)(AsbestosSampleEditLayerRow);
