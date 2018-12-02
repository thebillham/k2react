import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';

<<<<<<< HEAD
import { connect } from 'react-redux';
// import { FormattedDate } from 'react-intl';
=======
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { connect } from 'react-redux';
import { FormattedDate } from 'react-intl';
>>>>>>> 947a2ba95b689774eab952b8a181ffa246ab3010
import { fetchReadingLog } from '../../actions/local';
import ReadingLogList from './ReadingLogList';

const mapStateToProps = state => {
  return {
    logs: state.local.readingLog,
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
    if (this.props.logs.length < 1) this.props.fetchReadingLog();
  }

  render() {
    console.log('Render!');
    const { logs } = this.props;
    console.log(logs);
    return(
      <div style = {{ marginTop: 80 }}>
        { logs.map(log => {
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
