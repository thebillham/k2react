import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import EditButton from "@material-ui/icons/Edit";
import DeleteButton from "@material-ui/icons/Delete";
import Typography from "@material-ui/core/Typography";
import { FormattedDate } from "react-intl";

const dateOptions = { year: "numeric", month: "long", day: "numeric" };

const styles = {
  card: {
    minWidth: 500,
    minHeight: 50
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  name: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "bold"
  },
  details: {
    fontSize: 14
  },
  media: {
    height: 140
  }
};

function AttrCard(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardMedia className={classes.media} image={props.attr.fileUrl} />
      <CardHeader
        title={
          <Typography className={classes.name} color="textSecondary">
            {props.attr.name}
          </Typography>
        }
        action={
          <div>
            <IconButton aria-label="Edit" onClick={props.onEditClick}>
              <EditButton />
            </IconButton>
            <IconButton aria-label="Delete" onClick={props.onDeleteClick}>
              <DeleteButton />
            </IconButton>
          </div>
        }
      />
      <CardContent>
        {props.attr.category && (
          <Typography className={classes.details}>
            {props.attr.category}
          </Typography>
        )}
        {props.attr.date_acquired && (
          <Typography className={classes.details}>
            <b>Date Acquired: </b>
            <FormattedDate
              value={props.attr.date_acquired}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </Typography>
        )}
        {props.attr.date_expires && (
          <Typography className={classes.details}>
            <b>Expiry Date: </b>
            <FormattedDate
              value={props.attr.date_expires}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

AttrCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AttrCard);
