import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { COCLOG } from "../../../constants/modal-types";
import { docsRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { hideModal, handleModalChange } from "../../../actions/modal";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    )
  };
};

class CocLogModal extends React.Component {
  render() {
    const { classes, modalProps, modalType } = this.props;
    return (
      <Dialog
        open={modalType === COCLOG}
        onClose={() => this.props.hideModal()}
        maxWidth="lg"
        fullWidth={true}
      >
        <DialogTitle>Change Log for {modalProps.jobNumber}</DialogTitle>
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
              {modalProps.cocLog &&
                modalProps.cocLog.map(log => {
                  let date =
                    log.date instanceof Date ? log.date : log.date.toDate();
                  let formatDate = new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }).format(date);
                  return (
                    <Grid
                      key={formatDate + log.log}
                      container
                      style={{ marginTop: 12 }}
                    >
                      <Grid item xs={2}>
                        {formatDate}
                      </Grid>
                      <Grid item xs={1}>
                        {log.type}
                      </Grid>
                      <Grid item xs={7}>
                        {log.log}
                      </Grid>
                      <Grid item xs={2}>
                        {log.username}
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
  )(CocLogModal)
);
