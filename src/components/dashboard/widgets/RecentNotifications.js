import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CardHeader from '@material-ui/core/CardHeader';

import { FormattedDate } from 'react-intl';
import Add from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import UrgentIcon from '@material-ui/icons/Warning';
import AnalysisIcon from '@material-ui/icons/Colorize';
import TrainingIcon from '@material-ui/icons/School';
import NotificationIcon from '@material-ui/icons/Notifications';

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

// Gets jobs from your job list
const dummyList = [
  {
    'type': 'urgent',
    'text': 'Report for job AS181818 requires KTP urgently.',
  },
  {
    'type': 'training',
    'text': 'John Doe has completed all required readings for training module "Asbestos Clearances"',
  },
  {
    'type': 'training',
    'text': 'John Doe has been signed off to complete Asbestos Clearances',
  },
  {
    'type': 'analysis',
    'text': 'Results have been reported for asbestos job AS181818 (Morgan Project Services)',
  },
  {
    'type': 'general',
    'text': 'K2 Christmas Function is on 12 December',
  }
];

function RecentNotifications(props) {
  const { classes } = props;

  return (
      <Card className={classes.card}>
        <CardHeader
          // className={classes.cardHeader}
          style={{ background: 'linear-gradient(to right bottom, #338a69, #fff)'}}
          title={
            <Typography className={classes.cardHeaderType} color="textSecondary">
              Recent Notifications
            </Typography>
          }
          action={
            <div>
              <IconButton><Edit className={classes.dashboardIcon} /></IconButton>
              <IconButton><Close className={classes.dashboardIcon} /></IconButton>
            </div>
          }
        />
        <CardContent>
          { dummyList.slice(0, 5).map((not) => {
            return(
              <div key={not.text}>
                <div className={classes.notifications}>
                  {not.type==='training' && <TrainingIcon className={classes.notificationIcon} />}
                  {not.type==='analysis' && <AnalysisIcon className={classes.notificationIcon} />}
                  {not.type==='urgent' && <NotificationIcon className={classes.notificationIconUrgent} />}
                  {not.type==='general' && <NotificationIcon className={classes.notificationIcon} />}
                  {not.text}
                </div>
                <hr />
              </div>
            );
          })}
        </CardContent>
      </Card>
  );
}

export default withStyles(styles)(RecentNotifications);
