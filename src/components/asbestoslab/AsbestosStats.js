import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import {
  fetchCocs,
  setAnalyst,
  setAnalysisMode
} from "../../actions/local";

//Modals
import { COC } from "../../constants/modal-types";
import { showModal } from "../../actions/modal";

import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";

const mapStateToProps = state => {
  return {
    cocs: state.local.cocs,
    search: state.local.search,
    me: state.local.me,
    staff: state.local.staff,
    bulkanalysts: state.local.bulkanalysts,
    airanalysts: state.local.airanalysts,
    analyst: state.local.analyst,
    analysismode: state.local.analysismode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    showModal: modal => dispatch(showModal(modal)),
    setAnalyst: analyst => dispatch(setAnalyst(analyst)),
    setAnalysisMode: analysismode => dispatch(setAnalysisMode(analysismode))
  };
};

class AsbestosStats extends React.Component {
  state = {
    analyst: false
  };

  componentWillMount = () => {
    //
  };

  render() {
    const { cocs, classes } = this.props;

    return (
      <div style={{ marginTop: 80 }}>
        <div className={classes.paleLarge}>Under Development</div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosStats)
);
