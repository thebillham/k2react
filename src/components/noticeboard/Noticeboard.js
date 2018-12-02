import React from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { connect } from 'react-redux';
import NoticeCard from './NoticeCard';
import { onCatChange, onSearchChange } from '../../actions/local';
import store from '../../store';
import { onFavNotice, onReadNotice, onDeleteNotice, fetchNotices } from '../../actions/local';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    notices: state.local.notices,
    categories: state.const.noticecategories,
    search: state.local.search,
    category: state.local.category,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchNotices: () => dispatch(fetchNotices()),
  }
}

class Noticeboard extends React.Component {
  constructor(props){
    super(props);

    this.select = this.select.bind(this);
    this.onFavNotice = this.onFavNotice.bind(this);
    this.onReadNotice = this.onReadNotice.bind(this);
    this.onDeleteNotice = this.onDeleteNotice.bind(this);
  }

  componentWillMount(){
    this.props.fetchNotices();
    store.dispatch(onSearchChange(null));
    store.dispatch(onCatChange(null));
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

  select = (uid) => {
    this.setState({
      modPath: uid,
    });
  }

  onFavNotice = uid => {
    var favnotices = [];
    favnotices.push(this.props.me.favnotices);
    store.dispatch(onFavNotice(favnotices, uid));
  }

  onReadNotice = uid => {
    var readnotices = [];
    readnotices.push(this.props.me.readnotices);
    store.dispatch(onReadNotice(readnotices, uid));
  }

  onDeleteNotice = uid => {
    var deletednotices = [];
    deletednotices.push(this.props.me.deletednotices);
    store.dispatch(onDeleteNotice(deletednotices, uid));
  }

  render() {
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
          <Grid container spacing={16} style={{paddingTop: 30}}>
          { this.props.notices.filter(notice => {
              if (notice.auth !== undefined && this.props.me.auth.includes(notice.auth) === false) {
                return false;
              }
              if (this.props.me.deletednotices && this.props.me.deletednotices.includes(notice.uid)) {
                return false;
              }
              if (this.props.me.favnotices && this.props.category === 'fav' && this.props.me.favnotices.includes(notice.uid)) {
                return true;
              }
              if (this.props.search) {
                if (notice.tags) {
                  return [...notice.tags, notice.text].find(tag => tag.toLowerCase().includes(this.props.search.toLowerCase()));
                } else {
                  return notice.text.toLowerCase().includes(this.props.search.toLowerCase());
                }
              } else if (this.props.category) {
                return notice.category === this.props.category;
              } else {
                return true;
              }
            }).map(notice => {
              return(
                <Grid item xs={12} s={6} m={4} l={3} xl={2} key={notice.uid}>
                  <NoticeCard notice={notice}
                    // fav={this.props.me.favnotices && this.props.me.favnotices.includes(notice.uid)} read={this.props.me.readnotices && this.props.me.readnotices.includes(notice.uid)}
                  onFavNotice={() => this.onFavNotice(notice.uid)} onDeleteNotice={() => this.onDeleteNotice(notice.uid)} onReadNotice={() => this.onReadNotice(notice.uid)} />
                </Grid>
              )})}
            </Grid>
        </div>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Noticeboard);
