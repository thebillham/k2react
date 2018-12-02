import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import treeTableHOC from 'react-table/lib/hoc/treeTable';
import JobCard from './JobCard';
import { fetchWFM } from '../../actions/local';

const mapStateToProps = state => {
  return {
    wfmJobs: state.local.wfmJobs,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchWFM: () => dispatch(fetchWFM()),
  }
}

class Jobs extends React.Component {

  componentWillMount() {
    this.props.fetchWFM();
  }

  render() {
    const TreeTable = treeTableHOC(ReactTable);
    return (
      <div style = {{ marginTop: 80 }}>
        {/* <Grid container spacing={8}>
          <Grid item>
            <Button color="secondary" variant="outlined">
              Asbestos
            </Button>
          </Grid>
            <Grid item>
              <Button color="secondary" variant="outlined">
                Biological
              </Button>
            </Grid>
        </Grid> */}
        <div>
          <TreeTable
            // filterable
            // defaultFilterMethod={(filter, row, column) => {
            //   const id = filter.pivotId || filter.id;
            //   return row[id] !== undefined
            //     ? String(row[id])
            //       .toLowerCase()
            //       .includes(filter.value.toLowerCase())
            //     : true;
            // }}
            data={this.props.wfmJobs}
            showPagination={false}
            pivotBy={['type', 'client']}
            columns={[
              {
                accessor: 'type',
                show: false
              },
              {
                accessor: 'client',
                show: false
              },
              {
                accessor: 'description',
                show: false
              },
              {
                accessor: 'clientID',
                show: false
              },
              {
                accessor: 'clientOrderNumber',
                show: false
              },
              {
                accessor: 'contact',
                show: false
              },
              {
                accessor: 'contactID',
                show: false
              },
              {
                accessor: 'manager',
                show: false
              },
              {
                accessor: 'managerID',
                show: false
              },
              {
                accessor: 'dueDate',
                show: false
              },
              {
                accessor: 'startDate',
                show: false
              },
              {
                accessor: 'jobNumber',
                // show: false
              },
              {
                accessor: 'address',
                show: false
              },
              {
                accessor: 'state',
                show: false
              }
            ]}
            SubComponent={row => {
              // a SubComponent just for the final detail
              return (
                <JobCard job={row.row} />
              );
            }}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Jobs));
