import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Card, CardContent, Typography, CardHeader, Button } from '@material-ui/core';
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

function ToolCard(props) {
  const { classes, tool } = props;

  return (
      <Card className={classes.card} style={{borderRadius: 20}}>
          <CardHeader
            title={
              <Typography className={classes.name} color="textSecondary">
                { tool.title }
              </Typography>
            }
          />
          <CardContent>
            <Typography className={classes.details} color="textSecondary">
              { tool.desc }
            </Typography>
          </CardContent>
      </Card>
  );
}

ToolCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ToolCard);
