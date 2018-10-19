import React from 'react';

import { DOCUMENT } from '../../constants/modal-types';

import { Button, Grid, List } from '@material-ui/core';
import { connect } from 'react-redux';
import { showModal } from '../../actions/modal';
import { modalInit } from '../../reducers/modal';
import DocumentModal from '../modals/DocumentModal';
import { onSearchChange, onCatChange } from '../../actions/local';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import store from '../../store';
import DocList from '../widgets/DocList';

const mapStateToProps = state => {
  return {
    docs: state.local.documents,
    modal: state.modal.modalType,
    categories: state.const.documentcategories,
    category: state.local.category,
    search: state.local.search,
  };
};

class Library extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      listselect: null,

    }

  }

  componentWillMount(){
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
    const { docs } = this.props;
    return (
      <div style = {{ marginTop: 80 }}>
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
        { this.props.docs.filter(doc => {
            if (this.props.search) {
              if (doc.tags) {
                return [...doc.tags, doc.title].find(tag => tag.toLowerCase().includes(this.props.search.toLowerCase()));
              } else {
                return doc.title.toLowerCase().includes(this.props.search.toLowerCase());
              }
            } else if (this.props.category) {
              return doc.category == this.props.category;
            } else {
              return true;
            }
          }).map(doc => {
            return(
              <div key={doc.uid}>
                <DocList doc={doc} handleToggle={() => this.handleToggle(doc.uid)} selected={this.state.listselect == doc.uid} />
              </div>
            )
          })}
        </List>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Library);
