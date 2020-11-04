import React from "react";
// import { connect } from "react-redux";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

// import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import moment from "moment";

function ReadingLogListItem(props) {
  const { log } = props;
  return (
    <ListItem dense>
      <ListItemText
        primary={log.title}
        secondary={moment(log.date.toDate()).format('D MMM YYYY')}
      />
    </ListItem>
  );
}

export default withStyles(styles)(ReadingLogListItem);
