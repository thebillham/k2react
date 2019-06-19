import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import Grid from "@material-ui/core/Grid";

import GoogleCalendar from "./widgets/GoogleCalendar";
import CurrentJobs from "./widgets/CurrentJobs";
import RecentNotifications from "./widgets/RecentNotifications";
import RecentSamples from "./widgets/RecentSamples";
import Training from "./widgets/Training";
import ToDo from "./widgets/ToDo";
import ReportsChart from "./widgets/ReportsChart";

import { connect } from "react-redux";

const mapStateToProps = state => {
  return { staff: state.staff };
};

class Dashboard extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.appBarSpacer} />
        <Grid
          container
          direction="row"
          justify="flex-start"
          className={classes.container}
          alignItems="stretch"
          spacing={2}
        >
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <GoogleCalendar />
              </Grid>
              <Grid item>
                <Training />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <CurrentJobs />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <RecentNotifications />
              </Grid>
              <Grid item>
                <RecentSamples />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <ToDo />
              </Grid>
              <Grid item>
                <ReportsChart />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(withStyles(styles)(Dashboard));
