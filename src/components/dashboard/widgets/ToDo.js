import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import { Card, CardContent, Typography, IconButton, CardHeader, Checkbox } from '@material-ui/core';
import { FormattedDate } from 'react-intl';
import { Close, Edit, Add } from '@material-ui/icons';
import UrgentIcon from '@material-ui/icons/Warning';
import AnalysisIcon from '@material-ui/icons/Colorize';
import TrainingIcon from '@material-ui/icons/School';
import NotificationIcon from '@material-ui/icons/Notifications';

// Gets jobs from your job list
const dummyList = [
  {
    'done': true,
    'text': 'Complete readings for Noise Testing training.',
  },
  {
    'done': false,
    'text': 'Order more slides for lab.',
  },
];

function ToDo(props) {
  const { classes } = props;

  return (
      <Card className={classes.card}>
        <CardHeader
          // className={classes.cardHeader}
          style={{ background: 'linear-gradient(to right bottom, #338a69, #fff)'}}
          title={
            <Typography className={classes.cardHeaderType} color="textSecondary">
              To Do List
            </Typography>
          }
          action={
            <div>
              <IconButton><Add className={classes.dashboardIcon} /></IconButton>
              <IconButton><Edit className={classes.dashboardIcon} /></IconButton>
              <IconButton><Close className={classes.dashboardIcon} /></IconButton>
            </div>
          }
        />
        <CardContent>
          { dummyList.slice(0, 5).map((todo) => {
            return(
              <div key={todo.text}>
                <div className={classes.notifications}>
                  <Checkbox
                    checked={todo.done}
                    color='primary'
                    style={{fontSize: 16}}
                  />
                  <div className={classes.todo}>
                    {todo.done ? <del>{todo.text}</del> : <div>{todo.text}</div>}
                  </div>
                </div>
                <hr />
              </div>
            );
          })}
        </CardContent>
      </Card>
  );
}

export default withStyles(styles)(ToDo);
