import React from 'react';

import { DOCUMENT } from '../../constants/modal-types';

import { List, ListItem, ListItemText } from '@material-ui/core';
import { connect } from 'react-redux';
import { onSearchChange, onCatChange } from '../../actions/local';
import store from '../../store';
import DocList from '../widgets/DocList';
import { docsRef } from '../../config/firebase';
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
