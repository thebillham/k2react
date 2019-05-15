import React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";

import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter
} from "react-router-dom";

function DocList(props) {
  const { doc } = props;
  const path =
    doc.category === "k2methods"
      ? "/method/" + doc.uid
      : "/document/" + doc.uid;
  let secondarytext = "";
  if (doc.author) {
    secondarytext = doc.author;
  } else if (doc.publisher) {
    secondarytext = doc.publisher;
  } else if (doc.tmCode) {
    secondarytext = doc.tmCode;
  } else if (doc.subtitle) {
    secondarytext = doc.subtitle;
  }

  return (
    <ListItem button onClick={() => props.history.push(path)}>
      <ListItemText primary={doc.title} secondary={secondarytext} />
      {props.editor && (
        <ListItemSecondaryAction>
          <IconButton aria-label="Edit" onClick={props.showModal}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Delete" onClick={props.deleteDocument}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

export default withRouter(DocList);
