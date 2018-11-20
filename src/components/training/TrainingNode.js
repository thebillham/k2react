import React from 'react';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import OpenIcon from '@material-ui/icons/OpenInNew';
import EditIcon from '@material-ui/icons/Edit';
import TrainingLink from './TrainingLink';
import QuizWidget from './QuizWidget';

function TrainingNode(props) {
  const { classes, node } = props;

  return (
    <Paper style={{
      borderRadius: 0,
      padding: 20,
      margin: 20,
      width: '100%',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#004c2f' }}>{ node.title }</h2>
      <div style={{ color: '#444', }} dangerouslySetInnerHTML={{ __html: node.text}} />
      { node.links && node.links.map(link => {
        return(
          <div key={link.title}>
            { link.type == 'quiz' ? (<QuizWidget quiz={link} />) : (<TrainingLink link={link} />) }
          </div>
        );
      })}
    </Paper>
  );
}

export default TrainingNode;
