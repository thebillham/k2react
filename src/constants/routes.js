import Dashboard from '../components/Dashboard.js';
import Staff from '../components/Staff.js';
import StaffDetails from '../components/MyDetails.js';
import Reference from '../components/Reference.js';
import MyD from '../components/MyD.js';

export const NavDrawer = [
  {
    path: "/",
    exact: true,
    component: Dashboard,
  },
  {
    path: "/staff/:tab",
    exact: true,
    component: Staff,
  },
  {
    path: "/staff/:uid/:tab",
    exact: true,
    component: StaffDetails,
  },
  {
    path: "/mydetails/:tab",
    exact: true,
    component: StaffDetails,
  },
  {
    path: "/ref/",
    exact: true,
    component: Reference,
  },
];

export default { NavDrawer };
