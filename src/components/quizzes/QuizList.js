import React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter
} from "react-router-dom";

function QuizList(props) {
  const { quiz } = props;
  const path = "/quiz/" + quiz.uid;

  return (
    <div>
      <ListItem
        dense
        button
        onClick={() => props.history.push(path)}
        selected={props.selected}
      >
        <ListItemText primary={quiz.title} secondary={quiz.desc} />
        {props.editor && (
          <ListItemSecondaryAction>
            <IconButton aria-label="Edit" onClick={props.showModal}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label="Delete" onClick={props.deleteQuiz}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  );
}

export default withRouter(QuizList);
