import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import CommentListItem from "./CommentListItem";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Linkify from "react-linkify";

import PinIcon from "@material-ui/icons/Star";
import ReadIcon from "@material-ui/icons/CheckBox";
import DiscardIcon from "@material-ui/icons/Delete";
import EditIcon from '@material-ui/icons/Edit';
import CommentIcon from '@material-ui/icons/AddComment';
import { FormattedDate } from "react-intl";

const styles = {
  card: {
    minWidth: 50,
    minHeight: 300
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 600
  },
  subtitle: {
    marginBottom: 0,
    fontSize: 14,
    fontStyle: "italic"
  },
  details: {
    fontSize: 14,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  whosRead: {
    fontSize: 14
  },
  formIcon: {
    color: "black",
    fontSize: 14
  }
};

function NoticeCard(props) {
  const { classes, notice } = props;
  let readlist = "no one";
  var count = 0;

  if (notice.staff !== undefined && notice.staff.length > 0) {
    readlist = "";
    notice.staff.forEach(staff => {
      count = count + 1;
      if (notice.staff.length === 1) {
        readlist = props.staff && props.staff[staff] && props.staff[staff]['name'];
      } else if (count === notice.staff.length) {
        readlist = props.staff && props.staff[staff] && readlist + "and " + props.staff[staff]['name'];
      } else if (count === notice.staff.length - 1) {
        readlist = props.staff && props.staff[staff] && readlist + props.staff[staff]['name'] + " ";
      } else {
        readlist = props.staff && props.staff[staff] && readlist + props.staff[staff]['name'] + ", ";
      }
    });
  }

  return (
    <Card className={classes.card} style={{ borderRadius: 20 }}>
      <CardHeader
        style={{height: '4vw'}}
        title={
          <Typography className={classes.title} color="textSecondary">
          {notice.categorydesc}
          </Typography>
        }
        subheader={
          <Typography className={classes.subtitle} color="textSecondary">
            <FormattedDate
              value={notice.date}
              month="long"
              day="numeric"
              weekday="short"
            />
          </Typography>
        }
      />
      <CardContent>
        <hr/>
        <div className={classes.details} color="textSecondary">
          {notice.category === 'has' ? <div>
          {notice.incidentno && <div><b>Incident No.: </b>{notice.incidentno}</div>}
          {notice.incidentstaff && <div><b>Staff: </b>{notice.incidentstaff}</div>}
          {notice.incidentdesc && <div><b>Incident Desc.: </b>{notice.incidentdesc}</div>}
          {notice.text && <div><b>Learnings: </b>{notice.text}</div>}
          </div> :
          <Linkify>
            {notice.text}
          </Linkify>}
        </div><br />
        {notice.comments && Object.values(notice.comments).length > 0 &&
          <div>
            <div>
              {Object.values(notice.comments).map(comment =>
                <CommentListItem
                  key={comment.text}
                  comment={comment}
                  edit={true}
                  onEditComment={() => props.onEditComment(comment, notice)}
                />
              )}
            </div><hr />
          </div>
        }
        <div className={classes.whosRead} color="textPrimary">
          Submitted by {notice.author}
        </div>
        <div className={classes.whosRead} color="textPrimary">
          Read by {readlist}
        </div>
      </CardContent>
      <CardActions>
        <Tooltip title={'Pin Notice'}>
          <IconButton
            aira-label="Pin notice"
            onClick={props.onFavNotice}
          >
            <PinIcon color={props.fav ? "secondary" : "action"} />
          </IconButton>
        </Tooltip>
        <Tooltip title={'Mark As Read'}>
          <IconButton
            aira-label="Mark as read"
            onClick={props.onReadNotice}
          >
            <ReadIcon color={props.read ? "secondary" : "action"} />
          </IconButton>
        </Tooltip>
        <Tooltip title={'Add Comment'}>
          <IconButton
            aira-label="Add comment"
            onClick={props.onAddComment}
          >
            <CommentIcon />
          </IconButton>
        </Tooltip>
        { props.edit &&
          <span>

          <Tooltip title={'Edit Notice' }>
            <IconButton
              aira-label="Edit notice"
              onClick={props.onEditNotice}
            >
              <EditIcon color="action" />
            </IconButton>
          </Tooltip>
          <Tooltip title={'Delete Notice' }>
            <IconButton
              aira-label="Discard notice"
              onClick={props.onDeleteNotice}
            >
              <DiscardIcon color="action" />
            </IconButton>
          </Tooltip>
          </span>
        }
      </CardActions>
    </Card>
  );
}

NoticeCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NoticeCard);
