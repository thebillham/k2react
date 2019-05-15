import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import EditButton from "@material-ui/icons/Edit";
import DeleteButton from "@material-ui/icons/Delete";
import { FormattedDate } from "react-intl";

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
  }
};

function TrainingCard(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardHeader
        title={
          <Typography className={classes.name} color="textSecondary">
            {props.training.type}
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
        <Typography className={classes.details}>
          <b>Supervisor: </b>
          {props.training.supervisor}
        </Typography>
        {props.training.date && (
          <Typography className={classes.details}>
            <b>Date: </b>
            <FormattedDate
              value={props.training.date}
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

TrainingCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TrainingCard);
