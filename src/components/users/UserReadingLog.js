import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';

import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
import { fetchReadingLog } from '../../actions/local';
import ReadingLogList from './ReadingLogList';

const mapStateToProps = state => {
  return {
    logs: state.local.me.readingLog,
  };
};


const mapDispatchToProps = dispatch => {
  return {
    fetchReadingLog: () => dispatch(fetchReadingLog()),
  };
};

class UserReadingLog extends React.Component {
  constructor(props){
    super(props);

    this.state = {};
  }

  componentWillMount() {
    if (this.props.logs && this.props.logs.length < 1) this.props.fetchReadingLog();
  }

  render() {
    const { logs } = this.props;
    console.log(logs);
    return(
      <div style = {{ marginTop: 80 }}>
        { logs && logs.map(log => {
          console.log('Read log: ' + log.title)
          return(
            <ReadingLogList log={log} key={log.uid} />
          );
        })}
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(UserReadingLog));
