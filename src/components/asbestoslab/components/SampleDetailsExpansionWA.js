import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import {
  firebase,
  auth,
  asbestosSamplesRef
} from "../../../config/firebase";

import { fetchCocs, fetchSamples, logSample, writeResult } from "../../../actions/asbestosLab";

import Grid from "@material-ui/core/Grid";

import Popup from "reactjs-popup";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.asbestosLab.samples,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    logSample: (coc, sample, cocStats) => dispatch(logSample(coc, sample, cocStats)),
  };
};

class SampleDetailsExpansionWA extends React.Component {
  render() {
    const { job, sample, classes } = this.props;

    return (
      <Grid container>
        <Grid item xs={false} xl={1} />
          <div style={{ fontWeight: 700, height: 30}}>Western Australian Standard Analysis</div>

        <Grid item xs={12}>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SampleDetailsExpansionWA)
);
