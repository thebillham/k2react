import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import {
  fetchSampleLog,
} from "../../actions/asbestosLab";
import AsbestosLogCard from "./components/AsbestosLogCard";

//Modals
import { showModal } from "../../actions/modal";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";

const mapStateToProps = state => {
  return {
    search: state.local.search,
    me: state.local.me,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // fetchSampleLog: update => dispatch(fetchSampleLog(update)),
  };
};

class AsbestosLog extends React.Component {
  state = {
    searchJobNumber: '',
    searchClient: '',
    searchStartDate: '',
    searchEndDate: '',
    searchDateType: '',
    searchAnalyst: '',
  };

  UNSAFE_componentWillMount = () => {
    // if (this.props.sampleLog === undefined || this.props.sampleLog.length === 0) this.props.fetchSampleLog(true);
  };

  render() {
    const { sampleLog, classes } = this.props;
    return (
      <div style={{ marginTop: 80 }}>
        <div className={classes.paleLarge}>Under Development</div>
        {/*<div style={{ marginTop: 80 }}>
          <div
            style={{
              borderRadius: 4,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#ccc",
              width: '100%',
              padding: 12
            }}
          >
            <Grid container spacing={2} alignItems='flex-start'>
              <Grid item xs={3}>
                <div style={{ marginBottom: 12 }}>
                  <InputLabel style={{ marginLeft: 12 }}>
                    Filter Results
                  </InputLabel>
                </div>
                <div>
                  <FormControl style={{ width: '80%', marginRight: 8, }}>
                    <InputLabel shrink>Job Number</InputLabel>
                    <Input
                      id="searchJobNumber"
                      value={this.state.searchJobNumber}
                      onChange={e => this.setState({ searchJobNumber: e.target.value})}
                      startAdornment={<InputAdornment position="start">AS</InputAdornment>}
                    />
                  </FormControl>
                  <Button
                    variant="outlined"
                    style={{ marginTop: 16, marginBottom: 16, marginLeft: 1 }}
                  >
                    Go
                  </Button>
                </div>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="searchStartDate"
                  label="From"
                  type="date"
                  value={this.state.searchStartDate}
                  onChange={e => this.setState({ searchStartDate: e.target.value})}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="searchEndDate"
                  label="To"
                  type="date"
                  value={this.state.searchEndDate}
                  onChange={e => this.setState({ searchEndDate: e.target.value})}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  style={{ marginTop: 16, marginBottom: 16 }}
                >
                  Go
                </Button>
              </Grid>
            </Grid>
          </div>
          {
            sampleLog && Object.values(sampleLog).length > 0 && Object.values(sampleLog).map(log => {
              return (<AsbestosLogCard log={log} key={log.uid} />);
            })
          }
        </div>*/}
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosLog)
);
