import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

import HealthAndSafetyIcon from "@material-ui/icons/LocalHospital";
import MethIcon from "@material-ui/icons/Highlight";
import OccHealthIcon from "@material-ui/icons/LocationCity";
import AsbestosIcon from "@material-ui/icons/Whatshot";
import BioIcon from "@material-ui/icons/LocalFlorist";
import GeneralIcon from "@material-ui/icons/Info";
import LeadsIcon from "@material-ui/icons/LocalPhone";
import EquipmentIcon from "@material-ui/icons/Build";

import PinIcon from "@material-ui/icons/Star";
import ReadIcon from "@material-ui/icons/CheckBox";
import DiscardIcon from "@material-ui/icons/Delete";
import EditIcon from '@material-ui/icons/Edit';
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
    fontSize: 14
  },
  whosRead: {
    fontSize: 12
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
      console.log(notice.staff.length);
      console.log(props.staff && props.staff[staff]);
      console.log(readlist);
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
        avatar={
          <div>
            {notice.category === 'gen' && <GeneralIcon color="secondary" />}
            {notice.category === 'leads' && <LeadsIcon color="secondary" />}
            {notice.category === 'has' && <HealthAndSafetyIcon color="secondary" />}
            {notice.category === 'jqfasb' && <AsbestosIcon color="secondary" />}
            {notice.category === 'jqfmeth' && <MethIcon color="secondary" />}
            {notice.category === 'occjqf' && <OccHealthIcon color="secondary" />}
            {notice.category === 'eq' && <EquipmentIcon color="secondary" />}
          </div>
        }
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
        <Typography className={classes.details} color="textSecondary">
          {notice.category === 'has' ? <div>
          {notice.incidentno && <div><b>Incident No.: </b>{notice.incidentno}</div>}
          {notice.incidentstaff && <div><b>Staff: </b>{notice.incidentstaff}</div>}
          {notice.incidentdesc && <div><b>Incident Desc.: </b>{notice.incidentdesc}</div>}
          {notice.text && <div><b>Learnings: </b>{notice.text}</div>}
          </div> :
          notice.text}
        </Typography><br />
        <Typography className={classes.whosRead} color="textPrimary">
          Submitted by {notice.author}
        </Typography>
        <Typography className={classes.whosRead} color="textPrimary">
          Read by {readlist}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton
          aira-label="Pin notice"
          onClick={props.onFavNotice}
        >
          <PinIcon color={props.fav ? "secondary" : "action"} />
        </IconButton>
        <IconButton
          aira-label="Mark as read"
          onClick={props.onReadNotice}
        >
          <ReadIcon color={props.read ? "secondary" : "action"} />
        </IconButton>
        { props.edit &&
          <span>
          <IconButton
            aira-label="Edit notice"
            onClick={props.onEditNotice}
          >
            <EditIcon color="action" />
          </IconButton>
          <IconButton
            aira-label="Discard notice"
            onClick={props.onDeleteNotice}
          >
            <DiscardIcon color="action" />
          </IconButton>
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
