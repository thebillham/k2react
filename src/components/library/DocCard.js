import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/icons/Button';
import Typography from '@material-ui/core/Typography';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

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
  title: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 600,
  },
  author: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  details: {
    fontSize: 14,
  },
  formIcon: {
    color: 'black',
    fontSize: 14,
  },
};

function DocCard(props) {
  const { classes, doc } = props;

  return (
      <Card className={classes.card} style={{borderRadius: 20}}>
          <CardHeader
            title={
              <Typography className={classes.title} color="textSecondary">
                { doc.title }
              </Typography>
            }
            subheader={
              <Typography className={classes.author} color="textSecondary">
                { doc.author ? doc.author : doc.publisher }
              </Typography>
            }
          />
          <CardContent>
            <Typography className={classes.details} color="textSecondary">
              { doc.desc }
            </Typography>
          </CardContent>
      </Card>
  );
}

DocCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DocCard);
