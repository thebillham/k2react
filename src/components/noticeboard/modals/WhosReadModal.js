import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { WHOS_READ } from "../../../constants/modal-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import { stateRef } from "../../../config/firebase";
import classNames from "classnames";

import { hideModal } from "../../../actions/modal";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    notice: state.modal.modalProps.doc.notice,
    staff: state.local.staff
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal())
  };
};

class WhosReadModal extends React.Component {
  state = {
    whosRead: []
  };

  UNSAFE_componentWillMount() {
    stateRef
      .doc("noticereads")
      .collection("notices")
      .doc(this.props.modalProps.doc.uid)
      .get()
      .then(doc => {
        if (doc.exists)
          this.setState({
            whosRead: doc.data().payload
          });
      });
  }

  render() {
    const { staff, modalProps, classes } = this.props;
    let notRead = [];
    let read = [];
    if (staff) {
      Object.values(staff)
        .filter(s => s.auth && Boolean(s.auth["K2 Staff"]))
        .forEach(staff => {
          if (this.state.whosRead.includes(staff.uid)) {
            read.push(staff.name);
          } else {
            notRead.push(staff.name);
          }
        });
    }

    return (
      <Dialog
        open={this.props.modalType === WHOS_READ}
        onClose={this.props.hideModal}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>{"Who Has Read The Notice"}</DialogTitle>
        <DialogContent>
          <Grid container>
            {notRead.length !== 0 && (
              <Grid item xs={6}>
                <div
                  className={classNames(
                    classes.marginBottomSmall,
                    classes.bold
                  )}
                >
                  Has Read
                </div>
                {read.length === 0
                  ? "No one has read it."
                  : read.sort().map(name => <div key={name}>{name}</div>)}
              </Grid>
            )}
            {read.length !== 0 && (
              <Grid item xs={6}>
                <div
                  className={classNames(
                    classes.marginBottomSmall,
                    classes.bold
                  )}
                >
                  Has Not Read
                </div>
                {notRead.length === 0
                  ? "Everybody has read it."
                  : notRead.sort().map(name => <div key={name}>{name}</div>)}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WhosReadModal)
);
