import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../../config/styles';
import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import LineChart from 'recharts/lib/chart/LineChart';
import Line from 'recharts/lib/cartesian/Line';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Tooltip from 'recharts/lib/component/Tooltip';
import Legend from 'recharts/lib/component/Legend';
import { Card, CardHeader, CardContent, Typography, IconButton } from '@material-ui/core';
import { Close, Edit } from '@material-ui/icons';

const data = [
  { name: 'Mon', 'Last Week': 5, 'This Week': 3 },
  { name: 'Tue', 'Last Week': 2, 'This Week': 8 },
  { name: 'Wed', 'Last Week': 4, 'This Week': 5 },
  { name: 'Thu', 'Last Week': 1, 'This Week': 14 },
  { name: 'Fri', 'Last Week': 0, 'This Week': 5 },
];

function ReportsChart(props) {
  const { classes } = props;

  return (
      <Card className={classes.card}>
        <CardHeader
          style={{ background: 'linear-gradient(to right bottom, #338a69, #fff)'}}
          title={
            <Typography className={classes.cardHeaderType} color="textSecondary">
              Report Stats
            </Typography>
          }
          action={
            <div>
              <IconButton><Edit className={classes.dashboardIcon} /></IconButton>
              <IconButton><Close className={classes.dashboardIcon} /></IconButton>
            </div>
          }
        />
        <CardContent>
          <ResponsiveContainer width="99%" height={150}>
            <LineChart data={data} margin={{ left: 2, right: 2 }}>
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <Tooltip />
              {/* <Legend /> */}
              <Line type="monotone" dataKey="Last Week" stroke="#338a69" />
              <Line type="monotone" dataKey="This Week" stroke="#ff5733" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
  );
}

export default withStyles(styles)(ReportsChart);
