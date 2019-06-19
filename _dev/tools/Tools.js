import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import { onSearchChange, onCatChange, fetchTools, } from '../../actions/local';
import store from '../../store';
import ToolCard from './ToolCard';

const mapStateToProps = state => {
  return {
    tools: state.local.tools,
    search: state.local.search,
    categories: state.const.toolcategories,
    category: state.local.category,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTools: () => dispatch(fetchTools())
  }
}

class Tools extends React.Component {
  constructor(props){
    super(props);

    this.state = {

    }
  }

  componentWillMount(){
    this.props.fetchTools();
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

  render() {
    return (
      <div style = {{ marginTop: 80 }}>
        <Grid container spacing={1}>
          { this.props.categories.map(cat => {
            return (
              <Grid item>
                <Button variant="outlined" color={this.props.category === cat.key ? "secondary" : "primary"} onClick={() => this.switch(cat.key)}>
                  {cat.desc}
                </Button>
              </Grid>
            );
          })}
        </Grid>
        <Grid container spacing={2} style={{paddingTop: 30}}>
        { this.props.tools.filter(tool => {
            if (this.props.search) {
              if (tool.tags) {
                return [...tool.tags, tool.title].find(tag => tag.toLowerCase().includes(this.props.search.toLowerCase()));
              } else {
                return tool.title.toLowerCase().includes(this.props.search.toLowerCase());
              }
            } else if (this.props.category) {
              return tool.category === this.props.category;
            } else {
              return true;
            }
          }).map(tool => {
            return(
              <Grid item xs={2}>
                <ToolCard tool={tool} />
              </Grid>
            )})}
          </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Tools));
