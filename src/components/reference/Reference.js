import React from 'react';

import { SHOW_MODAL, HIDE_MODAL } from '../../constants/action-types';
import { DOCUMENT } from '../../constants/modal-types';

import { Drawer, List, ListItem, ListItemText, Button } from '@material-ui/core';
import { connect } from 'react-redux';
import { showModal } from '../../actions/modal';
import { modalInit } from '../../reducers/modal';
import DocumentModal from '../modals/DocumentModal';
import store from '../../store';

const mapStateToProps = state => {
  return {
    documents: state.local.documents,
    modal: state.modal.modalType
  };
}; 

function Reference (props) {
    return (
      <div style = {{ marginTop: 80 }}>
        <div>
          <Button variant="outlined" color="primary"
            onClick={() => store.dispatch(
              showModal({
                modalType: DOCUMENT,
                modalProps: modalInit.modalProps,
              })
            )}
            >
            Add New Document
          </Button>
          <DocumentModal />
        </div>
        <hr />
        {props.documents && <div>{ props.documents.map((doc) => {
            return(
              <div key={doc.title}>{doc.title}</div>
            )
          })
        }</div>}
      </div>
    )
}

export default connect(mapStateToProps)(Reference);
