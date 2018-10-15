import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import { Card, CardContent, Typography, IconButton, CardHeader, Button, Grid, LinearProgress } from '@material-ui/core';
import { FormattedDate } from 'react-intl';
import { Add, Close, Edit } from '@material-ui/icons';

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

// Gets jobs from your job list
const dummyList = [
  {
    'clientname': 'ABB',
    'jobnumber': 'T1416',
    'type': 'Noise',
    'address': '113 Central Park Drive, Henderson, Auckland',
    'progress': 40,
  },
  {
    'clientname': 'Asbestos Nelson Ltd',
    'jobnumber': 'AS182310',
    'type': 'Asbestos - Clearance',
    'address': 'Bays Boating, 15 Kind Edward Street, Motueka',
    'progress': 15,
  },
  {
    'clientname': 'Hamilton Paint and Plaster Ltd ',
    'jobnumber': 'AS181738',
    'type': 'Asbestos - Clearance',
    'address': '253 Old Hill rd Tahuna Waikato ',
    'progress': 80,
  },
];

function CurrentJobs(props) {
  const { classes } = props;

  return (
      <Card className={classes.card}>
        <CardHeader
          style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
          title={
            <Typography className={classes.cardHeaderType} color="textSecondary">
              Current Jobs
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
          { dummyList.slice(0, 5).map((job) => {
            return(
              <div key={job.jobnumber} className={classes.fineprint}>
                <b>{job.clientname}</b><br />
                <i>{job.type} ({job.jobnumber})</i><br />
                {job.address}
                <LinearProgress
                  variant='determinate'
                  color='secondary'
                  value={job.progress}
                />
                <hr />
              </div>
            );
          })}
          <Grid container direction='row' justify='center'><Grid item>
            <img src="https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/dummygoogle.PNG?alt=media&token=f804036b-ff23-40dd-b44e-fd71d9586ac3" width='400' height='400' />
          </Grid></Grid>
        </CardContent>
      </Card>
  );
}

export default withStyles(styles)(CurrentJobs);
