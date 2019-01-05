import React from 'react';

import Paper from '@material-ui/core/Paper';

import TrainingLink from './TrainingLink';
import TrainingReading from './TrainingReading';
import QuizWidget from './QuizWidget';

function TrainingNode(props) {
  const { node } = props;
  console.log(node);
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
          <div>
          { link ?
          <div key={link.title}>
            { link.type === 'quiz' ? (<QuizWidget quiz={link} />) : (<TrainingReading link={link} />) }
          </div>
          :
          <div key='missing'>
            Link missing.
          </div>
          }
          </div>
        );
      })}
    </Paper>
  );
}

export default TrainingNode;
