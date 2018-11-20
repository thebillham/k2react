import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import { Bar, XAxis, YAxis, BarChart } from 'recharts';

const mapStateToProps = state => {
  return {
      quiztags: state.local.me.quiztags,
   };
};

function UserTraining (props) {
  var tagScores;
  if (props.quiztags) {
    tagScores = Object.keys(props.quiztags).map(key => { return({
      name: key,
      value: props.quiztags[key].score / props.quiztags[key].num * 100,
    })});
  }
  return (
    <div style = {{ marginTop: 80 }}>
      { props.quiztags &&
      <BarChart width={850} height={400} data={ tagScores }>
        <XAxis dataKey="name" interval={0} tick={{ angle: -90, size: 8, }} height={200} tickMargin={100} />
        <YAxis domain={[0, 100]} />
        <Bar barSize={2} dataKey="value" fill="#FF2D00" />
      </BarChart>}
    </div>
   );
}

export default withStyles(styles)(connect(mapStateToProps)(UserTraining));
