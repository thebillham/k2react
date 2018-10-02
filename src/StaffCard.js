import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
};

function StaffCard(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary">
          { props.staff.name }
        </Typography>
        <Typography variant="headline" component="h2">
          { props.staff.address }
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          { props.staff.email }
        </Typography>
        <Typography component="p">
          { props.staff.gmail }
          <br />
        </Typography>
      </CardContent>
    </Card>
  )
}

StaffCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StaffCard);
