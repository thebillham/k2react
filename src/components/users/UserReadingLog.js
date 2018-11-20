import React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { connect } from 'react-redux';
import { FormattedDate } from 'react-intl';

const mapStateToProps = state => {
  return {
    logs: state.local.readingLog,
  };
};

function UserReadingLog(props) {
  return(
    <div style = {{ marginTop: 80 }}>
      <List>
        { props.logs.map((log) => {
          return(
            <ListItem
              dense
              key={log.uid}
              >
              <ListItemText
                primary={ log.title }
                secondary={ <FormattedDate value={log.date.toDate()} month='long' day='numeric' year='numeric' /> }
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}

export default connect(mapStateToProps)(UserReadingLog);
