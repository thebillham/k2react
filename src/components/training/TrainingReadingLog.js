import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";

import { connect } from "react-redux";
// import { FormattedDate } from 'react-intl';
import { fetchReadingLog } from "../../actions/local";
import ReadingLogListItem from "./components/ReadingLogListItem";

const mapStateToProps = state => {
  return {
    logs: state.local.me.readingLog
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchReadingLog: () => dispatch(fetchReadingLog())
  };
};

class TrainingReadingLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    console.log(this.props.logs);
    if (this.props.logs === undefined || this.props.logs.length < 1)
      this.props.fetchReadingLog();
  }

  render() {
    const { logs } = this.props;
    console.log(logs);
    return (
      <div style={{ marginTop: 80 }}>
        {logs &&
          logs.map(log => {
            console.log("Read log: " + log.title);
            return <ReadingLogListItem log={log} key={log.uid} />;
          })}
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TrainingReadingLog)
);
