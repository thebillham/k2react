import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import PinIcon from '@material-ui/icons/Star';
import ReadIcon from '@material-ui/icons/CheckBox';
import DiscardIcon from '@material-ui/icons/Delete';
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
          <CardActions>
            <IconButton aira-label="Pin notice"
              onClick={() => props.onFavNotice(notice.uid)
              }>
              <PinIcon color={props.fav ? "secondary" : "primary" }/>
            </IconButton>
            <IconButton aira-label='Mark as read'
              onClick={() => props.onReadNotice(notice.uid)
              }>
              <ReadIcon color={props.read ? "primary" : "secondary" }/>
            </IconButton>
            <IconButton aira-label='Discard notice'
              onClick={() => props.onDeleteNotice(notice.uid)
              }>
              <DiscardIcon color="action" />
            </IconButton>
          </CardActions>
      </Card>
  );
}

NoticeCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NoticeCard);
