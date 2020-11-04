import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import {
  writeDescription,
  getSampleColors,
  compareAsbestosResult,
} from "../../../actions/asbestosLab";

import { AsbButton, } from '../../../widgets/FormWidgets';
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ConfirmIcon from "@material-ui/icons/ThumbUp";
import ThumbsDown from "@material-ui/icons/ThumbDown";
import moment from "moment";

import { addLog, } from '../../../actions/local';

class AsbestosSampleEditConfirmRow extends React.Component {
  render() {
    const { classes, confirm, that } = this.props;
    let colors = getSampleColors(confirm);
    let match = compareAsbestosResult(confirm, that.state.samples[that.state.activeSample]);

    //console.log(colors);

    return(
      <div className={classes.flexRowHoverMed}>
        <div className={classes.flexRow}>
          <div className={classes.spacerSmall} />
          <div className={classes.verticalCenter}>
            <div className={classes.circle}>
              {match === 'no' ? <ThumbsDown className={classes.iconRegularRed} /> :
              <ConfirmIcon className={classes[`iconRegular${match === 'differentAsbestos' ? 'Orange' : 'Green'}`]} />}
            </div>
          </div>
          <div className={classes.verticalCenter}>
            {confirm.analyst}
          </div>
          <div className={classes.verticalCenter}>
            {moment(confirm.date.toDate()).format('D MMMM YYYY')}
          </div>
          <div className={classes.verticalCenter}>
            {confirm.comments}
          </div>
        </div>
        <div className={classes.flexRowRightAlign}>
          {['ch','am','cr','umf','no','org','smf'].map(res => {
            return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res,
            null)
          })}
        </div>
    </div>
    );
  }
}

export default withStyles(styles)(AsbestosSampleEditConfirmRow);
