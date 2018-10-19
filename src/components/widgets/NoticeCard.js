import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Card, CardContent, Typography, CardHeader, Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { FormattedDate } from 'react-intl';

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

function NoticeCard(props) {
  const { classes, notice } = props;

  return (
      <Card className={classes.card} style={{borderRadius: 20}}>
          <CardHeader
            title={
              <Typography className={classes.title} color="textSecondary">
                <FormattedDate value={notice.date.toDate()} month='long' day='numeric' weekday='short' />
              </Typography>
            }
            subheader={
              <Typography className={classes.author} color="textSecondary">
                { notice.author }
              </Typography>
            }
          />
          <CardContent>
            <hr />
            <Typography className={classes.details} color="textSecondary">
              { notice.text }
            </Typography>
          </CardContent>
      </Card>
  );
}

NoticeCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NoticeCard);
