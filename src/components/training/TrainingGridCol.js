import React from 'react';
import { Grid } from '@material-ui/core';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import OpenIcon from '@material-ui/icons/OpenInNew';
import EditIcon from '@material-ui/icons/Edit';
import QuizWidget from './QuizWidget';
import TrainingNode from './TrainingNode';

function TrainingGridCol(props) {
  const { classes, node } = props;

  return (
    <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
    { node.type == 'quiz' ?
      <QuizWidget quiz={{ link: node.link, title: node.title }} />
    :
      <TrainingNode node={{ title: node.title, text: node.text, links: node.links, }} />
    }
    </Grid>
  );
}

export default TrainingGridCol;
