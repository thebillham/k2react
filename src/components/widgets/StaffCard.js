import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Card, CardContent, Typography, IconButton, CardHeader, Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

const styles = {
  card: {
    minWidth: 50,
    minHeight: 200,
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

function StaffCard(props) {
  const { classes, staff } = props;
  const path = "/staff/details/" + staff.uid;

  return (
      <Card className={classes.card}>
        <CardHeader
          title={
            <Typography className={classes.name} color="textSecondary">
              { staff.name }
            </Typography>
          }
          subheader={
            <Typography className={classes.details} color="textSecondary">
              { staff.jobdescription }
            </Typography>
          }
          action={
            <Link to={path}><EditIcon /></Link>
          }
        />
        <CardContent>
          <Typography className={classes.details}>
            { staff.office }
          </Typography>
          <Typography className={classes.details} color="textSecondary">
            { staff.email }
          </Typography>
          <Typography className={classes.details} color="textSecondary">
            { staff.gmail }
            <br />
          </Typography>
        </CardContent>
      </Card>
  );
}

StaffCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StaffCard);
