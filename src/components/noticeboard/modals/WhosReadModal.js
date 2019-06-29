import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { WHOS_READ } from "../../../constants/modal-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

import { hideModal, } from "../../../actions/modal";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    notice: state.modal.modalProps.doc.notice,
    staff: state.local.staff,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
  };
};

class WhosReadModal extends React.Component {
  render() {
    const { staff, modalProps } = this.props;
    let notRead = [];
    let read = [];
    if (staff) {
      Object.values(staff).forEach((staff) => {
        if (modalProps.doc && modalProps.doc.staff && modalProps.doc.staff.indexOf(staff.uid) > -1) {
          read.push(staff.name);
        } else {
          notRead.push(staff.name);
        }
      });
    }

    return (
      <Dialog
        open={this.props.modalType === WHOS_READ}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>
          {"Who Has Read The Notice"}
        </DialogTitle>
        <DialogContent>
          <div style={{ fontWeight: 500, marginBottom: 12, }}>Has Read</div>
          { read.length === 0 ? 'No one has read it.' :
            read.sort().map(name => {
              return (
                <div key={name} style={{ fontSize: 14,}}>
                  {name}
                </div>
              );
            })
          }
          <hr />
          <div style={{ fontWeight: 500, marginBottom: 12, }}>Has Not Read</div>
          { notRead.length === 0 ? 'Everybody has read it.' :
            notRead.sort().map(name => {
              return (
                <div key={name} style={{ fontSize: 14,}}>
                  {name}
                </div>
              );
          })}
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

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WhosReadModal)
);
