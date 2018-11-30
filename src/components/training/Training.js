import React from 'react';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { fetchTrainingPaths } from '../../actions/local';

const mapStateToProps = state => {
  return {
    paths: state.local.trainingpaths,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTrainingPaths: () => dispatch(fetchTrainingPaths()),
  }
}

class Training extends React.Component {
  componentWillMount() {
    this.props.fetchTrainingPaths();
  }
  render() {
    return (
        <div style = {{ marginTop: 80 }}>
          <GridList cellHeight='300' cols={4}>
            { this.props.paths.map(path => {
              const url = "/training/" + path.uid;
              return(
                <GridListTile>
                  <Link to={url}>
                    <img src={path.img} alt={path.title} />
                  <GridListTileBar
                    title={path.title}
                    subtitle={path.subtitle}
                    />
                  </Link>
                </GridListTile>
              );
            })}
          </GridList>
        </div>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Training);
