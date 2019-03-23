import React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

function QuestionList(props) {
  const { question } = props;

  return (
    <div>
      <ListItem dense button onClick={props.showModal}>
        <ListItemText
          primary={question.question}
          secondary={
            (question.tags
              ? question.tags.map(tag => tag.text).join(", ") + " "
              : "") +
            "(" +
            question.type +
            ")"
          }
        />
        {props.editor && (
          <ListItemSecondaryAction>
            <IconButton aria-label="Add" onClick={props.addToQuiz}>
              <AddIcon />
            </IconButton>
            <IconButton aria-label="Delete" onClick={props.deleteQuestion}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  );
}

export default QuestionList;
