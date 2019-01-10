import React from 'react';

import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { auth, methodsRef, docsRef, } from '../../config/firebase';
import { METHOD, DOCUMENT } from '../../constants/modal-types';
import MethodModal from '../modals/MethodModal';
import UpdateMethodVersion from '../modals/UpdateMethodVersion';
import DocumentModal from '../modals/DocumentModal';
import { onSearchChange, onCatChange, fetchDocuments, fetchStaff, fetchMethods } from '../../actions/local';
import { showModal } from '../../actions/modal';
import store from '../../store';
import DocList from './DocList';

const mapStateToProps = state => {
  return {
    docs: state.local.documents,
    me: state.local.me,
    methods: state.local.methods,
    modal: state.modal.modalType,
    categories: state.const.documentcategories,
    category: state.local.category,
    search: state.local.search,
    staff: state.local.staff,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDocuments: () => dispatch(fetchDocuments()),
    fetchStaff: () => dispatch(fetchStaff()),
    fetchMethods: () => dispatch(fetchMethods()),
    showModal: modal => dispatch(showModal(modal)),
  }
}


class Library extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      listselect: null,
    }
  }

  componentWillMount(){
    this.props.fetchDocuments();
    this.props.fetchMethods();
    this.props.fetchStaff();
    store.dispatch(onSearchChange(null));
    store.dispatch(onCatChange(null));
  }

  handleToggle = (uid) => {
    this.setState({
      listselect: uid,
    })
  }

  switch = (category) => {
    this.props.category === category ?
      store.dispatch(onCatChange(null))
      :
      store.dispatch(onCatChange(category));
    store.dispatch(onSearchChange(null));
    this.setState({
      modPath: null,
    });
  }

  render() {
    const library = this.props.docs.concat(this.props.methods);
    return (
      <div style = {{ marginTop: 80 }}>
        <DocumentModal />
        <MethodModal />
        <UpdateMethodVersion />
        <Grid container spacing={8}>
          <Grid item>
            { this.props.me.auth['Method Editor'] && <Button variant="outlined" color="default" onClick={() => {
              let doc = {
                changes: {
                  changes: 'Document created.',
                  date: new Date(),
                  person: auth.currentUser.displayName,
                  version: '1.0',
                },
                version: 1,
                patch: 0,
                steps: {},
                category: 'k2methods',
                glossary: {},
              }
              this.props.showModal({ modalType: METHOD, modalProps: { title: 'Add New K2 Method', doc: doc, } })
            }}>
              Add New K2 Method
            </Button>}
          </Grid>
          <Grid item>
            { this.props.me.auth['Document Editor'] && <Button variant="outlined" color="default" onClick={() => {
              let doc = {
                docType: 'PDF',
                tags: [],
              }
              this.props.showModal({ modalType: DOCUMENT, modalProps: { title: 'Add New Document', doc: doc, } })
            }}>
              Add New Document
            </Button>}
          </Grid>
        </Grid>
        <Grid container spacing={8}>
          { this.props.categories.map(cat => {
            return (
              <Grid item key={cat.key}>
                <Button variant="outlined" color={this.props.category === cat.key ? "secondary" : "primary"} onClick={() => this.switch(cat.key)}>
                  {cat.desc}
                </Button>
              </Grid>
            );
          })}
        </Grid>
        <List style={{paddingTop: 30}}>
        { library.filter(doc => {
            if (this.props.search) {
              let search = [];
              if (doc.tags) {
                search = [...doc.tags.map(tag => tag.text ? tag.text : tag), doc.title, doc.publisher, doc.author, doc.subtitle, doc.code]
              } else {
                search = [doc.title, doc.publisher, doc.author, doc.subtitle, doc.code]
              }
              let searchterm = this.props.search.toLowerCase().split(' ');
              let res = true;
              searchterm.forEach(term => {
                if (search.find(tag => tag && tag.toLowerCase().includes(term)) === undefined) res = false;
              });
              return res;
            } else if (this.props.category) {
              return doc.category === this.props.category;
            } else {
              return true;
            }
          }).map(doc => {
            return(
              <div key={doc.uid}>
                <DocList doc={doc}
                  showModal={() => {
                      if (doc.category === 'k2methods') {
                        this.props.showModal({ modalType: METHOD, modalProps: { title: 'Edit K2 Method', doc: doc, } });
                      } else {
                        this.props.showModal({ modalType: DOCUMENT, modalProps: { title: 'Edit Document', doc: doc, } });
                      }
                    }}
                  deleteDocument={() => {
                    if (doc.category === 'k2methods') {
                      if (window.confirm(`Are you sure you wish to delete the K2 Method '${doc.title}'?`)) {
                        if (window.confirm(`Are you 100% sure? (This action cannot be undone)`))
                          methodsRef.doc(doc.uid).delete();
                      }
                    } else {
                      if (window.confirm(`Are you sure you wish to delete the document '${doc.title}'?`))
                        docsRef.doc(doc.uid).delete();
                    }
                  }}
                  editor={
                    (doc.category === 'k2methods')
                      ? this.props.me.auth['Method Editor']
                      : this.props.me.auth['Document Editor']
                    } />
              </div>
            )
          })}
        </List>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Library);
