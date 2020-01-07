import React from "react";
import ReactTable from 'react-table';
import 'react-table/react-table.css';

function AsbestosRegisterTable(props) {
  const { loading, airMonitoringRecords, classes } = props;

  return (
    <div>
      <div className={classes.heading}>Air Monitoring Records</div>
      <ReactTable
        loading={loading}
        pageSizeOptions={[10, 15, 20, 25, 50, 100, 200]}
        data={airMonitoringRecords}
        minRows={1}
        columns={
        [{
          Header: 'Date',
          accessor: 'date',
        }, {
          Header: 'Sample Number',
          accessor: 'sample',
          maxWidth: 120,
        }, {
          Header: 'Location',
          accessor: 'location',
        }, {
          Header: 'Sample Volume (L)',
          accessor: 'sampleVolume',
          maxWidth: 120,
        }, {
          Header: 'Start Time',
          accessor: 'startTime',
          maxWidth: 120,
        }, {
          Header: 'Total Time (mins)',
          accessor: 'totalTime',
          maxWidth: 120,
        }, {
          Header: 'Fibre Count',
          accessor: 'fibreResult',
          maxWidth: 120,
        }, {
          id: 'reportConcentration',
          Header: 'Concentration (fibres/mL)',
          accessor: d => d.reportConcentration,
          Cell: c => <span className={(c.value && c.value.includes('<')) ? classes.colorsCellOk : classes.colorsCellBad}>{c.value}</span>,
        },]
      }
    />
    </div>
  );
}

export default AsbestosRegisterTable;
