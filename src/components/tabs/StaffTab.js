import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link } from "react-router-dom";

const StaffTab = () => (
  <Tabs
    indicatorColor="secondary"
    textColor="secondary"
    centered>
    <Tab label="Overview" component={Link} to= "/staff/overview" />
    <Tab label="Training" component={Link} to= "/staff/training" />
  </Tabs>
);

export default StaffTab;
