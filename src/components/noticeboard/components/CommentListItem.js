import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";

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
import moment from "moment";
import classNames from 'classnames';

function CommentListItem(props) {
  const { classes, comment } = props;

  return (
    <div className={classNames(classes.noticeComments, classes.hoverItem)}>
      <div className={classes.marginRightSmall}>
        <div className={classes.bold}>{comment.author.name}</div>
        <div>
          {moment(comment.date).format('ddd, D MMM YYYY')}
        </div>
        <div><Linkify>{comment.text}</Linkify></div>
      </div>
      <div>
        { props.edit &&
          <div className={classes.flexRow}>
            <Tooltip title={'Edit Comment'}>
              <IconButton
                aira-label="Edit comment"
                onClick={props.onEditComment}
              >
                <EditIcon color="action" />
              </IconButton>
            </Tooltip>
            <Tooltip title={'Delete Comment'}>
              <IconButton
                aira-label="Delete comment"
                onClick={props.onDeleteComment}
              >
                <DiscardIcon color="action" />
              </IconButton>
            </Tooltip>
          </div>
        }
      </div>
    </div>
  );
}

export default withStyles(styles)(CommentListItem);
