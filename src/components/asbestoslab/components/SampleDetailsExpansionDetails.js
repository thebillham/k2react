import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  cocsRef,
  asbestosAnalysisRef,
  firebase,
  auth,
  asbestosSamplesRef
} from "../../../config/firebase";

import Grid from "@material-ui/core/Grid";
import Popup from "reactjs-popup";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
    analyst: state.asbestosLab.analyst,
    sessionID: state.asbestosLab.sessionID,
  };
};

const mapDispatchToProps = dispatch => {
  return {

  };
};

class SampleDetailsExpansionDetails extends React.Component {

  render() {
    const { job, sample, classes } = this.props;

    return (
      <Grid container>
        <Grid item>
        </Grid>
        <Grid item>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SampleDetailsExpansionDetails)
);
