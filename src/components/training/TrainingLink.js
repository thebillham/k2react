import React from 'react';
import { BrowserRouter as Link } from "react-router-dom";
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
    <div>
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
    </div>
  );
}

export default TrainingLink;
