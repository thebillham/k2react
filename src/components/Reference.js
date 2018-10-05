import React from 'react';
import PDFViewer from 'mgr-pdf-viewer-react';

import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default class Reference extends React.Component {
  state = {
    docRef: null,
    openDrawer: true,
  }

  render() {
    const { docRef, openDrawer } = this.state;

    return (
      <div>
        <Drawer openDrawer={openDrawer}>
          <List>
            <ListItem>
              <ListItemText primary="Hey" />
            </ListItem>
          </List>
        </Drawer>
        <div>
        { docRef ?
        <PDFViewer document={
          {url: docRef}
        } />
        : null }
      </div>
    </div>
    )
  }
}
