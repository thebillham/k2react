import React from 'react';

<<<<<<< HEAD
import Paper from '@material-ui/core/Paper';
=======
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
>>>>>>> 947a2ba95b689774eab952b8a181ffa246ab3010

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import OpenIcon from '@material-ui/icons/OpenInNew';
import QuizWidget from './QuizWidget';


function TrainingLink(props) {
  const { link } = props;
  const checked = Math.random() < 0.5;
  var color = '#338a69';
  var path = link.link;
  if (path === '') path = '/';
  if (link.required) color='#ff5733';
  if (checked) color='#aaa';

  if (link.type === 'method') path = '/method/' + link.link;
  else if (link.type === 'reading') path = '/document/' + link.link;

  return (
    <Paper style={{ borderRadius: 12, marginTop: 12, width: '100%' }}>
      <div style={{ padding: 12, backgroundColor: color, color: 'white', fontWeight: 500, fontSize: 18, display: 'flex', justifyContent: 'space-between', flexDirection: 'row',}}>
        { link.title }
        <Link to={path} style={{ textDecoration: 'none', }}><OpenIcon style={{ color: 'white' }} /></Link>
      </div>
      <div style={{ color: '#444', padding: 12, }}>
        { link.text }
      </div>
      {
        link.quiz &&
        (
          <QuizWidget quiz={{ link: link.quiz, required: link.required, }} />
        )
      }
    </Paper>
  );
}

export default TrainingLink;
