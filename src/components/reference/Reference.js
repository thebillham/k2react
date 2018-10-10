import React from 'react';

import { SHOW_MODAL, HIDE_MODAL } from '../../constants/action-types';
import { DOCUMENT } from '../../constants/modal-types';

import { Drawer, List, ListItem, ListItemText, Button } from '@material-ui/core';
import { connect } from 'react-redux';
import { showModal } from '../../actions/index';

const mapStateToProps = state => {
  return { documents: state.documents };
};

const mapDispatchToProps = dispatch => {
  return {
    showModal: document => dispatch(showModal(document))
  };
};

function Reference (props) {
    return (
      <div style = {{ marginTop: 80 }}>
        <div>
          <Button variant="outlined" color="primary"
            onClick={() => props.showModal({modalType: DOCUMENT, modalProps: {docId: null}})}
            >
            Add New Document
          </Button>
        </div>
        {props.documents.length > 0 && props.documents.map((doc) => {
            return(
              <div>{doc.title}</div>
            )
          })
        }
      </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Reference);
