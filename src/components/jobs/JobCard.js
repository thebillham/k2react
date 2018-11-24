import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    minWidth: 500,
    minHeight: 50,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  name: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
  },
};

function JobCard(props) {
  const { classes, job } = props;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.name} color="textSecondary">
          { job.jobNumber + ' (' + job.type + ')'}
        </Typography>
        <Typography className={classes.name}>
          { job.client }
        </Typography>
        <Typography className={classes.details} color="textSecondary">
          <i>{ job.state }</i>
        </Typography>
        <Typography className={classes.details} color="textSecondary">
          { job.address }
        </Typography>
        <Typography className={classes.details} color="textSecondary">
          { job.description }
          <br />
        </Typography>
      </CardContent>
    </Card>
  )
}

JobCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(JobCard);
