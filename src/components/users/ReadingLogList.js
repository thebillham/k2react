import React from 'react';
<<<<<<< HEAD
// import { connect } from "react-redux";
=======
import { connect } from "react-redux";
>>>>>>> 947a2ba95b689774eab952b8a181ffa246ab3010

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

<<<<<<< HEAD
// import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
=======
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
>>>>>>> 947a2ba95b689774eab952b8a181ffa246ab3010


import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';

import { FormattedDate } from 'react-intl';

function ReadingLogList(props) {
<<<<<<< HEAD
  const { log } = props;
=======
  const { classes, log } = props;
>>>>>>> 947a2ba95b689774eab952b8a181ffa246ab3010
  return (
    <ListItem
      dense
      >
      <ListItemText
        primary={ log.title }
        secondary={ <FormattedDate value={log.date.toDate()} month='long' day='numeric' year='numeric' /> }
      />
    </ListItem>
  );
}

export default withStyles(styles)(ReadingLogList);
