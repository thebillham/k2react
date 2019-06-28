import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { SAMPLEHISTORY } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import { hideModal } from "../../../actions/modal";
import { fetchLogs, clearLog } from "../../../actions/local";
import _ from "lodash";
import moment from "moment";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    logs: state.local.logs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchLogs: (uid, limit) => dispatch(fetchLogs("asbestosLab", "sample", uid, limit)),
    clearLog: () => dispatch(clearLog()),
    hideModal: () => dispatch(hideModal()),
  };
};

class SampleLogModal extends React.Component {
  render() {
    const { classes, modalProps, modalType, logs } = this.props;
    // console.log('Printing modal props');
    // console.log(JSON.stringify(modalProps));
    // console.log(modalProps.uid.toString());
    return (
      <Dialog
        open={modalType === SAMPLEHISTORY}
        onClose={this.props.hideModal}
        maxWidth="lg"
        fullWidth={true}
        onEnter={() => this.props.fetchLogs(modalProps.uid, 10)}
        onExit={this.props.clearLog}
      >
        <DialogTitle>{modalProps.title}</DialogTitle>
        <DialogContent>
        <Grid container direction="column">
          <Grid item>
            <Grid container style={{ fontWeight: "bold" }}>
              <Grid item xs={2}>
                Date
              </Grid>
              <Grid item xs={1}>
                Category
              </Grid>
              <Grid item xs={7}>
                Change
              </Grid>
              <Grid item xs={2}>
                User
              </Grid>
            </Grid>
            {logs &&
              logs.map(log => {
                let date =
                  log.date instanceof Date ? log.date : log.date.toDate();
                return (
                  <Grid
                    key={log.uid}
                    container
                    style={{ marginTop: 12 }}
                  >
                    <Grid item xs={2}>
                      {moment(date).format('D MMM YYYY, h:ma')}
                    </Grid>
                    <Grid item xs={1}>
                      {log.type}
                    </Grid>
                    <Grid item xs={7}>
                      {log.log}
                    </Grid>
                    <Grid item xs={2}>
                      {log.userName}
                    </Grid>
                  </Grid>
                );
              })}
          </Grid>
        </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SampleLogModal)
);
