
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../config/styles";
import classNames from 'classnames';

class AsbestosSampleStatusComponent extends React.Component {
  render() {
    const { classes, status } = this.props;
    const statusMap = {
      'inTransit': {
        label: 'In Transit',
        progress: 0,
        divClass: classes.colorsStart,
      },
      'received': {
        label: 'Received By Lab',
        progress: 10,
        divClass: classes.colorsReceived,
      },
      'analysisStarted': {
        label: 'Analysis Started',
        progress: 20,
        divClass: classes.colorsWorkInProgress,
      },
      'analysisRecorded': {
        label: 'Analysis Complete',
        progress: 80,
        divClass: classes.colorsWorkComplete,
      },
      'verified': {
        label: 'Result Verified',
        progress: 100,
        divClass: classes.colorsReadyForIssue,
      },
    };
    return(
      <div>
        <div className={classNames(classes.roundButtonLongBlank, statusMap[status].divClass)}>
          {statusMap[status].label.toUpperCase()}
        </div>
        {/*<LinearProgress variant='determinate' color='secondary' value={statusMap[status].progress} />*/}
      </div>
    );
  }
};

const AsbestosSampleStatus = withStyles(styles)(AsbestosSampleStatusComponent);

export {
  AsbestosSampleStatus,
};
