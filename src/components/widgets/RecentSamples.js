import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { Card, CardContent, Typography, IconButton, CardHeader, Button, Grid } from '@material-ui/core';
import { FormattedDate } from 'react-intl';
import { Close } from '@material-ui/icons';

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

// Gets jobs from your job list
const dummyList = [
  {
    'clientname': 'Secure Asbestos Services',
    'jobnumber': 'AS185151',
    'address': '113 Central Park Drive, Henderson, Auckland',
  },
  {
    'clientname': 'Asbestos Nelson Ltd',
    'jobnumber': 'AS182310',
    'address': 'Bays Boating, 15 Kind Edward Street, Motueka',
  },
  {
    'clientname': 'Hamilton Paint and Plaster Ltd ',
    'jobnumber': 'AS181738',
    'address': '253 Old Hill rd Tahuna Waikato ',
  },
];

function RecentSamples(props) {
  const { classes } = props;

  return (
      <Card className={classes.card}>
        <CardHeader
          style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
          title={
            <Typography className={classes.cardHeaderType} color="textSecondary">
              Recent Analysis
            </Typography>
          }
          action={
            <Close style={{color: 'white'}} />
          }
        />
        <CardContent>
          { dummyList.slice(0, 5).map((job) => {
            return(
              <div key={job.jobnumber} className={classes.fineprint}>
                <b>{job.clientname}</b><br />
                <i>{job.type} ({job.jobnumber})</i><br /><hr />
              </div>
            );
          })}
        </CardContent>
      </Card>
  );
}

export default withStyles(styles)(RecentSamples);
