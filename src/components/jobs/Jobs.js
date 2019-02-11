import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
import ReactTable from 'react-table';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import JobCard from './JobCard';
import { FormattedDate } from 'react-intl';

import { fetchWFMJobs, fetchWFMLeads } from '../../actions/local';

const mapStateToProps = state => {
  return {
    wfmJobs: state.local.wfmJobs,
    wfmLeads: state.local.wfmLeads,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFMJobs: () => dispatch(fetchWFMJobs()),
    fetchWFMLeads: () => dispatch(fetchWFMLeads()),
  }
}

class Jobs extends React.Component {

  componentWillMount() {
    this.props.fetchWFMJobs();
    this.props.fetchWFMLeads();
  }

  displayTimeDifference = (date) => {
    var timeDifference = new Date() - new Date(date);
    var divideBy = {
      d: 86400000,
      m: 2629800000,
      y: 31557600000,
    };
    var years = Math.floor(timeDifference/divideBy['y']);
    timeDifference = timeDifference % divideBy['y'];
    var months = Math.floor(timeDifference/divideBy['m']);
    timeDifference = timeDifference % divideBy['m'];
    var days = Math.floor(timeDifference/divideBy['d']);
    let y = years + ' years ';
    let m = months + ' months ';
    let d = days + ' days';
    if (years === 1) y = years + ' year ';
    if (months === 1) m = months + ' month ';
    if (days === 1) d = days + ' day';
    if (years === 0) y = '';
    if (months === 0) m = '';
    return (y + m + d);
  }

  render() {
    const { wfmJobs, wfmLeads } = this.props;

    return (
      <div style = {{ marginTop: 80 }}>
        {wfmLeads &&
        <ReactTable
          data={wfmLeads}
          columns={[
            {
              Header: "Name",
              accessor: "name"
            },
            {
              Header: "Category",
              accessor: "category"
            },
            {
              Header: "Client",
              accessor: "client"
            },
            {
              Header: "Owner",
              accessor: "owner"
            },
            {
              Header: "Date",
              id: "date",
              accessor: d => <FormattedDate value={d.date instanceof Date ? d.date : new Date(d.date)} month='long' day='numeric' year='numeric' />
            },
            {
              Header: "How Old",
              id: "howold",
              accessor: d => d.date instanceof Date ? this.displayTimeDifference(d.date) : this.displayTimeDifference(new Date(d.date))
            }
          ]}
          defaultSorted={[
            {
              id: "ID",
              desc: true,
            }
          ]}
          defaultPageSize={25}
          className="-striped -highlight"
          />
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Jobs);
