import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";

import { AsbButton, } from '../../../widgets/FormWidgets';
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

import {
  writeDescription,
  getSampleColors,
} from "../../../actions/asbestosLab";
import { addLog, } from '../../../actions/local';
import { numericAndLessThanOnly, } from '../../../actions/helpers';

class AsbestosSampleEditBasicResultRow extends React.PureComponent {
  render() {
    const { classes, that, sample } = this.props;
    let colors = getSampleColors(sample);

    return (
      <div className={classes.flexRowHoverPadded}>
        <div className={classes.flexRowLeftAlignEllipsis}>
          <div className={classes.spacerSmall} />
          <div className={classes.circleShaded}>
            {sample.sampleNumber}
          </div>
          {writeDescription(sample)}
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf','no','org','smf'].map(res => {
            return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
            () => that.handleResultClick(res, sample.sampleNumber))
          })}
          <div className={sample.weightReceived ? classes.roundButtonShadedComplete : classes.roundButtonShaded}>
            <TextField
              id={sample.uid}
              value={sample.weightReceived ? sample.weightReceived : ''}
              InputProps={{
                endAdornment: <div className={classes.marginRightSmall}>g</div>,
                className: classes.marginsAllSmall,
              }}
              onChange={e => {
                that.setState({
                  modified: true,
                  samples: {
                    ...that.state.samples,
                    [sample.sampleNumber]: {
                      ...that.state.samples[sample.sampleNumber],
                      weightReceived: numericAndLessThanOnly(e.target.value),
                    },
                  },
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AsbestosSampleEditBasicResultRow);
