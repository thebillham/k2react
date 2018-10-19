import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, } from '@material-ui/core';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import OpenIcon from '@material-ui/icons/OpenInNew';
import EditIcon from '@material-ui/icons/Edit';

function DocList(props) {
  const { classes, doc } = props;
  const path = "/document/" + doc.uid;

  return (
    <div>
      <Link to={path} style={{ textDecoration: 'none'}}>
        <ListItem
          dense
          button
          selected={props.selected}
          onClick={props.handleToggle}
          >
          <ListItemText primary={doc.title}
          secondary={
            doc.author ? doc.author : doc.publisher
          } />
          {/* <ListItemSecondaryAction>
              <OpenIcon />
          </ListItemSecondaryAction> */}
        </ListItem>
      </Link>
    </div>
  );
}

export default DocList;
