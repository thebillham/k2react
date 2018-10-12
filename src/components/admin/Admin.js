import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import store from '../../store';

const mapStateToProps = state => {
  return {

   };
};

function Admin (props) {
  return ( null );
}

export default withStyles(styles)(connect(mapStateToProps)(Admin));
