import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Card, CardContent, Typography, IconButton, CardHeader, Button, CardActionArea, CardMedia } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

const styles = {
  card: {
    minWidth: 50,
    minHeight: 300,
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
  formIcon: {
    color: 'black',
    fontSize: 14,
  },
};

function StaffCard(props) {
  const { classes, staff } = props;
  const path = "/staff/details/" + staff.uid;

  return (
      <Card className={classes.card}>
        {/* <CardActionArea> */}
          {/* <CardMedia
            component="img"
            image="https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/dummyprofilephoto.jpg?alt=media&token=0fa9ec7e-14b0-4b94-ae10-adc79824040f"
          /> */}
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
              <Link to={path}><EditIcon className={classes.formIcon} /></Link>
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
        {/* </CardActionArea> */}
      </Card>
  );
}

StaffCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StaffCard);
