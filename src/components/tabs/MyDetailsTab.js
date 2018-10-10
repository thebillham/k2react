import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link } from "react-router-dom";
import { withTheme } from '@material-ui/core/styles';

const MyDetailsTab = () => (
  <Tabs centered>
    <Tab label="General Information" component={Link} to= "/general" />
    <Tab label="Qualifications" component={Link} to= "/qualifications" />
    <Tab label="Training Log" component={Link} to= "/log" />
    <Tab label="Training Roadmap" component={Link} to= "/training" />
  </Tabs>
);

export default withTheme()(MyDetailsTab);
