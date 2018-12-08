import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import { jobsRef, cocsRef, asbestosSamplesRef } from '../../config/firebase';
import { fetchCocs, fetchSamples, } from '../../actions/local';
import { showModal } from '../../actions/modal';
import CocModal from '../modals/CocModal';
import { COC } from '../../constants/modal-types';
import CocList from './CocList';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import ExpandMore from '@material-ui/icons/ExpandMore';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import Edit from '@material-ui/icons/Edit';
import Inbox from '@material-ui/icons/Inbox';
import CameraAlt from '@material-ui/icons/CameraAlt';
import Print from '@material-ui/icons/Print';
import Send from '@material-ui/icons/Send';
import Popup from 'reactjs-popup';

const mapStateToProps = state => {
  return {
    cocs: state.local.cocs,
    search: state.local.search,
    me: state.local.me,
    staff: state.local.staff,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    showModal: modal => dispatch(showModal(modal)),
    fetchSamples: jobnumber => dispatch(fetchSamples(jobnumber)),
  }
}

class AsbestosLab extends React.Component {
  componentWillMount = () => {
    this.props.fetchCocs();
  }

  render() {
    const { classes, cocs } = this.props;

    return (
      <div style = {{ marginTop: 80 }}>
        <CocModal />
        <div>
          <Button variant='outlined' style={{ marginBottom: 16 }} onClick={() => {this.props.showModal({ modalType: COC, modalProps: { title: 'Add New Chain of Custody' } })}}>
            New Chain of Custody
          </Button>
        </div>
        { Object.keys(cocs).length < 1 ?
          <div>No results.</div>
        :
        (<div>{ Object.keys(cocs).filter(job => {
          if (this.props.search) {
            let terms = this.props.search.split(' ');
            let search = job + ' ' + cocs[job].client + ' ' + cocs[job].address;
            let result = true;
            terms.forEach(term => {
              if (!search.toLowerCase().includes(term.toLowerCase())) result = false;
            });
            return result;
          } else {
            return true;
          }
        }).map(job => {
          let version = 1;
          if (cocs[job].reportversion) version = cocs[job].reportversion + 1;
          return (
            <CocList key={job} job={cocs[job]} />
          );
        })
      }</div>)}
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AsbestosLab));
