import React from 'react';
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from '@material-ui/core/styles';
import { modalStyles } from '../../config/styles';
import { connect } from 'react-redux';
import { WithContext as ReactTags } from 'react-tag-input';
// import store from '../../store';
import { UPDATEDATA } from '../../constants/modal-types';
import { appSettingsRef } from '../../config/firebase';
import '../../config/tags.css';
import { sendSlackMessage } from '../../Slack';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';

import UploadIcon from '@material-ui/icons/CloudUpload';
import Close from '@material-ui/icons/Close';
import {
  fetchCocs,
  fetchDocuments,
  fetchMethods,
  fetchNotices,
  fetchQuestions,
  fetchQuizzes,
  fetchSamples,
  fetchStaff,
  fetchTools,
  fetchTrainingPaths,
  fetchVehicles,
  } from '../../actions/local';
import { hideModal } from '../../actions/modal';
import _ from 'lodash';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    doc: state.modal.modalProps.doc,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs(true)),
    fetchDocuments: () => dispatch(fetchDocuments(true)),
    fetchMethods: () => dispatch(fetchMethods(true)),
    fetchNotices: () => dispatch(fetchNotices(true)),
    fetchQuestions: () => dispatch(fetchQuestions(true)),
    fetchQuizzes: () => dispatch(fetchQuizzes(true)),
    fetchSamples: () => dispatch(fetchSamples(true)),
    fetchStaff: () => dispatch(fetchStaff(true)),
    fetchTools: () => dispatch(fetchTools(true)),
    fetchTrainingPaths: () => dispatch(fetchTrainingPaths(true)),
    fetchVehicles: () => dispatch(fetchVehicles(true)),
    hideModal: modal => dispatch(hideModal(modal)),
  }
}

class UpdateData extends React.Component {
  render() {
    const updateTypes = [
      {
        event: this.props.fetchCocs,
        title: 'Chains of Custody',
      },
      {
        event: this.props.fetchDocuments,
        title: 'Documents',
      },
      {
        event: this.props.fetchMethods,
        title: 'Methods',
      },
      {
        event: this.props.fetchNotices,
        title: 'Notices',
      },
      {
        event: this.props.fetchQuestions,
        title: 'Questions',
      },
      {
        event: this.props.fetchQuizzes,
        title: 'Quizzes',
      },
      {
        event: this.props.fetchStaff,
        title: 'Staff',
      },
      {
        event: this.props.fetchTools,
        title: 'Tools',
      },
      {
        event: this.props.fetchTrainingPaths,
        title: 'Training Paths',
      },
      {
        event: this.props.fetchVehicles,
        title: 'Vehicles',
      },
    ]
    return(
      <Dialog
        open={ this.props.modalType === UPDATEDATA }
        onClose = {() => this.props.hideModal}
        >
        <DialogTitle>Update Cached Data</DialogTitle>
        <DialogContent>
          { updateTypes.map(update => (
            <div key={update}>
              <Button variant="outlined" color="default" style={{ marginTop: 16, }} onClick={update.event}>
              { update.title }
              </Button>
            </div>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { this.props.hideModal() }} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(modalStyles)(connect(mapStateToProps, mapDispatchToProps)(UpdateData));
