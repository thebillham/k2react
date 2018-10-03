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
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
  },
};

function AttrCard(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.name} color="textSecondary">
          { props.attr.name }
        </Typography>
        <Typography className={classes.details}>
          { props.attr.category }
          <br />
        </Typography>
      </CardContent>
    </Card>
  )
}

AttrCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttrCard);
