import React from "react";
import moment from "moment";

import Grid from "@material-ui/core/Grid";

function SampleDetailsExpansionSummary(props) {
  const { sample } = props;
  let endTime = new Date();
  if (sample.verifyDate) endTime = sample.verifyDate instanceof Date ? sample.verifyDate : sample.verifyDate.toDate();
  let timeInLab = sample.receivedDate ? moment.duration(moment(endTime).diff(sample.receivedDate.toDate())) : null;

  let status = 'In Transit';
  if (sample.verified) status = 'Complete';
    else if (sample.analysisDate) status = 'Waiting on Analysis Verification';
    else if (sample.analysisStart) status = 'Analysis Started';
    else if (sample.receivedByLab) status = 'Received By Lab';

  return (
    <Grid container>
      <Grid item xs={false} xl={1} />
      <Grid item xs={12} xl={11} style={{ fontSize: 14 }}>
        <div style={{ fontWeight: 700, height: 30}}>STATUS: {status}</div>
        <div style={{ fontWeight: 700, height: 25}}>Details</div>
        <div>
          {sample.receivedByLab ?
            <span>Received by lab at {moment(sample.receivedDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {sample.receivedUser ? <span>{sample.receivedUser.name}</span>
            :<span>an unknown person</span>}</span>
            : <span>Not yet received by lab</span>
          }
        </div>
        <div>
          {sample.analysisStart ?
            <span>Analysis started at {moment(sample.analysisStartDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {sample.analysisStartedby ? <span>{sample.analysisStartedby.name}</span>
            :<span>an unknown person</span>}</span>
            : <span>Analysis not yet started</span>
          }
        </div>
        <div>
          {sample.analysisDate ?
            <span>Result logged at {moment(sample.analysisDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {sample.analysisUser ? <span>{sample.analysisUser.name}</span>
            :<span>an unknown person</span>}</span>
            : <span>Result not yet logged</span>
          }
        </div>
        <div>
          {sample.verified ?
            <span>Result verified at {moment(sample.verifyDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {sample.verifyUser ? <span>{sample.verifyUser.name}</span>
            :<span>an unknown person</span>}</span>
            : <span>Result not yet verified</span>
          }
        </div>
        <div>
          {sample.verified ?
            <span>Lab turnaround time: {timeInLab.asHours() >= 24 && <span>{timeInLab.days()} day{timeInLab.days() !== 1 &&<span>s</span>}, </span>}{timeInLab.asMinutes() >= 60 && <span>{timeInLab.hours()} hour{timeInLab.hours() !== 1 && <span>s</span>} and </span>}{timeInLab.minutes()} minute{timeInLab.minutes() !== 1 && <span>s</span>}</span>
            : <span>{sample.receivedDate && <span>Time in lab: {timeInLab.asHours() >= 24 && <span>{timeInLab.days()} day{timeInLab.days() !== 1 &&<span>s</span>}, </span>}{timeInLab.asMinutes() >= 60 && <span>{timeInLab.hours()} hour{timeInLab.hours() !== 1 && <span>s</span>} and </span>}{timeInLab.minutes()} minute{timeInLab.minutes() !== 1 && <span>s</span>}</span>}</span>
          }
        </div>
        <div>
          <span>Created at {moment(sample.createdDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {sample.createdBy ? <span>{sample.createdBy.name}</span>
          :<span>an unknown person</span>}</span>
        </div>
      </Grid>
    </Grid>
  );
}

export default SampleDetailsExpansionSummary;
