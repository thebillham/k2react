import React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

function QuizList(props) {
  const { quiz } = props;
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
