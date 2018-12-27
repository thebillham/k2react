import React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { QUESTION } from '../../constants/modal-types';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

function QuestionList(props) {
  const { question } = props;

  return (
    <div>
      <ListItem
        dense
        button
        onClick={props.showModal} >
        <ListItemText primary={question.question}
        secondary={
          (question.tags ? question.tags.map(tag => tag.text).join(", ") + " " : "") + "(" + question.type + ")"
        } />
      </ListItem>
    </div>
  );
}

export default QuestionList;
