import React from 'react';

import Paper from '@material-ui/core/Paper';

import TrainingLink from './TrainingLink';
import TrainingReading from './TrainingReading';
import QuizWidget from './QuizWidget';

function TrainingReview(props) {
  const { path } = props;

  return (
    <Paper style={{
      borderRadius: 0,
      padding: 20,
      margin: 20,
      width: '100%',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#004c2f' }}>Training Review</h2>
      All the training graphs and stuff.
    </Paper>
  );
}

export default TrainingReview;
