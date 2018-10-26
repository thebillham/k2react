import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, } from '@material-ui/core';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import OpenIcon from '@material-ui/icons/OpenInNew';
import EditIcon from '@material-ui/icons/Edit';

function QuizList(props) {
  const { classes, quiz } = props;
  const path = "/quiz/" + quiz.uid;

  return (
    <div>
      <Link to={path} style={{ textDecoration: 'none'}}>
        <ListItem
          dense
          button
          selected={props.selected}
          onClick={props.handleToggle}
          >
          <ListItemText primary={quiz.title}
          secondary={
            quiz.desc
          } />
        </ListItem>
      </Link>
    </div>
  );
}

export default QuizList;
