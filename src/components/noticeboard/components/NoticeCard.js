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
import Avatar from "@material-ui/core/Avatar";
import Linkify from "react-linkify";

import PinIcon from "@material-ui/icons/Star";
import ReadIcon from "@material-ui/icons/CheckBox";
import DiscardIcon from "@material-ui/icons/Delete";
import EditIcon from '@material-ui/icons/Edit';
import CommentIcon from '@material-ui/icons/AddComment';
import WhosReadIcon from "@material-ui/icons/HowToReg";

import GeneralIcon from "@material-ui/icons/Note";
import HealthIcon from "@material-ui/icons/LocalHospital";
import JobLeadsIcon from "@material-ui/icons/Call";
import ClientIcon from "@material-ui/icons/RecordVoiceOver";
import ReportIcon from "@material-ui/icons/ImportContacts"

import { FormattedDate } from "react-intl";
import { auth } from "../../../config/firebase";

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

  let avatar = (<GeneralIcon style={{ color: '6fa1b6'}} />);
  if (notice.category === 'has') avatar = (<HealthIcon style={{ color: 'red', }} />);
  if (notice.category === 'client') avatar = (<ClientIcon style={{ color: '#6fa1b6'}} />);
  if (notice.category === 'reports') avatar = (<ReportIcon style={{ color: '#6fa1b6'}} />);
  if (notice.category === 'leads') avatar = (<JobLeadsIcon style={{ color: '#6fa1b6'}} />);
  if (notice.category === 'jqfasb') avatar = (<Avatar style={{ backgroundColor: '#7d6d26', color: 'white' }}>A</Avatar>);
  if (notice.category === 'jqfmeth') avatar = (<Avatar style={{ backgroundColor: '#ff0065', color: 'white' }}>M</Avatar>);
  if (notice.category === 'occjqf') avatar = (<Avatar style={{ backgroundColor: '#a2539c', color: 'white' }}>O</Avatar>);
  if (notice.category === 'jqfbio') avatar = (<Avatar style={{ backgroundColor: '#87cc14', color: 'white' }}>B</Avatar>);
  if (notice.category === 'jqfnoise') avatar = (<Avatar style={{ backgroundColor: '#995446', color: 'white' }}>B</Avatar>);
  if (notice.category === 'jqfstack') avatar = (<Avatar style={{ backgroundColor: '#e33714', color: 'white' }}>B</Avatar>);

  return (
    <Card className={classes.card} style={{ borderRadius: 20, height: '100%', display: 'flex', flexDirection: 'column', }}>
      <CardHeader
        style={{height: '4vw', backgroundColor: '#eee'}}
        avatar={avatar}
        title={
          <Typography className={classes.title} color="textSecondary">
          {notice.categorydesc}
          </Typography>
        }
        subheader={
          <div>
            <Typography color="textPrimary">
              Submitted by <span style={{ fontWeight: 500,}}>{notice.author}</span>
            </Typography>
            <Typography className={classes.subtitle} color="textSecondary">
              <FormattedDate
                value={notice.date}
                month="long"
                day="numeric"
                weekday="short"
                year="numeric"
              />
            </Typography>
          </div>
        }
      />
      <CardContent>
        <div className={classes.details} color="textSecondary">
          {notice.category === 'has' ? <div>
          {notice.incidentno && <div><b>Incident No.: </b>{notice.incidentno}</div>}
          {notice.job && <div><b>Job: </b>{notice.job}</div>}
          {notice.incidentstaff && <div><b>Staff Involved: </b>{notice.incidentstaff}</div>}
          {notice.incidentdesc && <div><b>Incident Desc.: </b>{notice.incidentdesc}</div>}
          {notice.text && <div><b>Learnings: </b>{notice.text}</div>}
          </div> :
          <Linkify>
            {!'geneq'.includes(notice.category) &&
              <div style={{ fontWeight: 500, textDecoration: 'underline', marginBottom: 6, }}>{notice.job}</div>
            }
            {notice.text}
          </Linkify>}
        </div><br />
        {notice.comments && Object.values(notice.comments).length > 0 &&
          <div>
            <hr />
            <div>
              {Object.values(notice.comments).map(comment =>
                <CommentListItem
                  key={comment.text}
                  comment={comment}
                  edit={notice.authorUid === auth.currentUser.uid ||
                    comment.author.uid === auth.currentUser.uid ||
                    notice.author === props.me.name ||
                    props.me.auth['Admin']
                  }
                  onEditComment={() => props.onEditComment(comment, notice)}
                  onDeleteComment={() => props.onDeleteComment(comment, notice)}
                />
              )}
            </div><hr />
          </div>
        }
      </CardContent>
      <div style={{ display: 'flex', flex: 'auto', alignItems: 'flex-start', justifyContent: 'flex-end', flexDirection: 'column', }}>
        <CardActions style={{ display: 'flex', justifyContent: 'flex-end', }}>
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
          <Tooltip title={'Check who has read'}>
            <IconButton
              aira-label="Check who has read"
              onClick={props.onCheckRead}
            >
              <WhosReadIcon />
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
      </div>
    </Card>
  );
}

NoticeCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NoticeCard);
