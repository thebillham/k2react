import React from 'react';

import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Grid from '@material-ui/core/Grid';

import { connect } from 'react-redux';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ModuleCard from '../widgets/ModuleCard';
import { onCatChange, onSearchChange } from '../../actions/local';
import store from '../../store';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    modules: state.local.modules,
    categories: state.const.trainingcategories,
    search: state.local.search,
    category: state.local.category,
   };
};

class TrainingModules extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      // staffList: [],
      modPath: null,
      admin: false,
    }
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
                <Grid item>
                  <Button variant="outlined" color={this.props.category === cat.key ? "secondary" : "primary"} onClick={() => this.switch(cat.key)}>
                    {cat.desc}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
          <Grid container spacing={16} style={{paddingTop: 30}}>
            <Grid item xs={6} >
              { this.props.modules.filter(mod => {
                if (this.props.search) {
                  return mod.title.toLowerCase().includes(this.props.search.toLowerCase())
                } else if (this.props.category) {
                  return mod.category === this.props.category
                } else {
                  return true;
                }
              }).map(mod => {
                return(
                  <div>
                    <ExpansionPanel onChange={e => { this.select(mod.uid) }}>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        { mod.title }
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <i>{ mod.description }</i>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>
                );
              }) }
            </Grid>
            <Grid item xs={6} >
              { this.state.modPath &&
              <ModuleCard key={this.state.modPath} mod={this.state.modPath} /> }
            </Grid>
          </Grid>
        </div>
      )
    }
}

export default connect(mapStateToProps)(TrainingModules);
