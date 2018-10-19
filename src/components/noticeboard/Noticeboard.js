import React from 'react';

import { Button, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Grid } from '@material-ui/core';

import { connect } from 'react-redux';
import { ExpandMore  } from '@material-ui/icons';
import NoticeCard from '../widgets/NoticeCard';
import { onCatChange, onSearchChange } from '../../actions/local';
import store from '../../store';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    auth: state.local.auth,
    notices: state.local.notices,
    categories: state.const.noticecategories,
    search: state.local.search,
    category: state.local.category,
   };
};

class Noticeboard extends React.Component {
  constructor(props){
    super(props);

    this.select = this.select.bind(this);
  }

  componentWillMount(){
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
              if (notice.auth !== undefined && this.props.auth.includes(notice.auth) == false) {
                return false;
              }
              if (this.props.search) {
                if (notice.tags) {
                  return [...notice.tags, notice.text].find(tag => tag.toLowerCase().includes(this.props.search.toLowerCase()));
                } else {
                  return notice.text.toLowerCase().includes(this.props.search.toLowerCase());
                }
              } else if (this.props.category) {
                return notice.category == this.props.category;
              } else {
                return true;
              }
            }).map(notice => {
              return(
                <Grid item xs={2} key={notice.uid}>
                  <NoticeCard notice={notice} />
                </Grid>
              )})}
            </Grid>
        </div>
      )
    }
}

export default connect(mapStateToProps)(Noticeboard);
