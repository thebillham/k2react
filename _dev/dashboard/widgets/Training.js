import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CardHeader from "@material-ui/core/CardHeader";
import LinearProgress from "@material-ui/core/LinearProgress";

// import { FormattedDate } from 'react-intl';
import Add from "@material-ui/icons/Add";
import Close from "@material-ui/icons/Close";
import Edit from "@material-ui/icons/Edit";

// Gets jobs from your job list
const dummyList = [
  {
    name: "Biological Testing",
    subtitle: "Base training module for biological jobs.",
    progress: 5
  },
  {
    name: "B & K",
    subtitle: "Training on how to use the B & K",
    progress: 80
  },
  {
    name: "Asbestos Demolition Surveys",
    subtitle:
      "Training on demolition surveys and aggressive surveying techniques.",
    progress: 60
  }
];

function Training(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardHeader
        style={{
          background: "linear-gradient(to right bottom, #338a69, #fff)"
        }}
        title={
          <Typography className={classes.cardHeaderType} color="textSecondary">
            Training Progress
          </Typography>
        }
        action={
          <div>
            <IconButton>
              <Add className={classes.dashboardIcon} />
            </IconButton>
            <IconButton>
              <Edit className={classes.dashboardIcon} />
            </IconButton>
            <IconButton>
              <Close className={classes.dashboardIcon} />
            </IconButton>
          </div>
        }
      />
      <CardContent>
        {dummyList.slice(0, 5).map(module => {
          return (
            <div key={module.name} className={classes.fineprint}>
              <b>{module.name}</b>
              <br />
              <i>{module.subtitle}</i>
              <br />
              <LinearProgress
                variant="determinate"
                color="primary"
                value={module.progress}
              />
              <hr />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default withStyles(styles)(Training);