import React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

function DocList(props) {
  const { doc } = props;
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
