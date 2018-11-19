import React from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { Card, CardContent, Typography, CardHeader, Button, Grid, List, ListItem,
  CircularProgress, ListItemText, Avatar, ListSubheader, } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { FormattedDate } from 'react-intl';

const mapStateToProps = state => {
  return {
    me: state.local.me,
   };
};

function displayTimeAtK2(user) {
  if (user.startdate) {
    var timeAtK2 = new Date() - new Date(user.startdate);
    var divideBy = {
      d: 86400000,
      m: 2629800000,
      y: 31557600000,
    };
    var years = Math.floor(timeAtK2/divideBy['y']);
    timeAtK2 = timeAtK2 % divideBy['y'];
    var months = Math.floor(timeAtK2/divideBy['m']);
    timeAtK2 = timeAtK2 % divideBy['m'];
    var days = Math.floor(timeAtK2/divideBy['d']);
    let y = ' years ';
    let m = ' months and ';
    let d = ' days';
    if (years == 1) y = ' year ';
    if (months == 1) m = ' month and ';
    if (days == 1) d = ' day';
    return (years + y + months + m + days + d);
  } else {
    return ('No start date set')
  }
}

function StaffCard(props) {
  const { classes, staff } = props;
  const path = staff.uid ? "/staff/details/" + staff.uid : "/mydetails";

  return (
      <Grid container>
        <Grid item xs={6}>
            { props.me.auth && props.me.auth['Admin'] &&
                <Link to={path} style={{ textDecoration: 'none',}} >
                  <Button style={{ marginBottom: 20, }} variant='outlined'>Edit User</Button><br />
                </Link>
            }
            <i>{staff.jobdescription}</i><br />
            Office: <span style={{ fontWeight: 100 }}>{staff.office ? staff.office : 'Office not set.' }</span><br />
            Phone: <span style={{ fontWeight: 100, textDecoration: 'none' }}>{staff.workphone ? <a href={'tel:' + staff.workphone}>{staff.workphone}</a> : 'No work phone set.'}</span><br />
            Email: <span style={{ fontWeight: 100, textDecoration: 'none' }}>{staff.email ? <a href={'mailto:' + staff.email}>{staff.email}</a> : 'No email set.'}</span><br />
            Gmail: <span style={{ fontWeight: 100, textDecoration: 'none' }}>{staff.gmail ? <a href={'mailto:' + staff.gmail}>{staff.gmail}</a> : 'No Gmail set.'}</span><br />
            Personal Phone: <span style={{ fontWeight: 100, textDecoration: 'none' }}>{staff.personalphone ? <a href={'tel:' + staff.personalphone}>{staff.personalphone}</a> : 'Personal phone not set.'}</span><br />
            <hr />
            IP402: <span style={{ fontWeight: 100 }}>{staff.ip402 ? 'Yes' : 'No' }</span><br />
            Asbestos Assessor: <span style={{ fontWeight: 100 }}>{staff.aanumber ? staff.aanumber : 'No' }</span><br />
            Mask Fit Tested: <span style={{ fontWeight: 100 }}>{staff.maskfit ? staff.maskfit : 'No' }</span><br />
            <hr />
            Start Date at K2: <span style={{ fontWeight: 100 }}>{staff.startdate ? <FormattedDate value={staff.startdate} month='long' day='numeric' year='numeric' /> : 'Start date not set.' }</span><br />
            Time at K2: <span style={{ fontWeight: 100 }}>{displayTimeAtK2(staff)}</span><br />
            <hr />
            Asbestos Air Analyst: <span style={{ fontWeight: 100 }}>{staff.auth && staff.auth['Asbestos Air Analysis'] ? 'Yes' : 'No' }</span><br />
            Asbestos Bulk Analyst: <span style={{ fontWeight: 100 }}>{staff.auth && staff.auth['Asbestos Bulk Analysis'] ? 'Yes' : 'No' }</span><br />
            Asbestos Checker: <span style={{ fontWeight: 100 }}>{staff.auth && staff.auth['Analysis Checker'] ? 'Yes' : 'No' }</span><br />
        </Grid>
        <Grid item xs={6}>
          { staff.events ?
            <List subheader={<ListSubheader>Upcoming Events</ListSubheader>}>
              { staff.events.map(event => {
                return(
                  <ListItem button onClick={() => { window.open(event.htmlLink) }} key={event.id}>
                    <ListItemText
                      primary={event.summary}
                      secondary={ event.start.date ? <FormattedDate value={Date.parse(event.start.date)} month='long' day='numeric' /> : <FormattedDate value={Date.parse(event.start.dateTime)} month='long' day='numeric' hour='numeric' minute='numeric' />} /><br />

                  </ListItem>
                )
              })
            }
            </List>
          :
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 100, fontSize: 12, color: '#aaa', }}>No events to display. Either the user has not set their Gmail address, they have not shared their calendar with you, or they have no upcoming events.</div>
          }
        </Grid>
      </Grid>
  );
}

export default connect(mapStateToProps)(StaffCard);
