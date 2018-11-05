import React from 'react';

import { GridList, GridListTile, GridListTileBar } from '@material-ui/core';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    paths: state.local.trainingpaths,
   };
};

class Training extends React.Component {
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

export default connect(mapStateToProps)(Training);
