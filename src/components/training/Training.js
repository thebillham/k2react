import React from 'react';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import { TRAINING } from '../../constants/modal-types';

import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { fetchTrainingPaths } from '../../actions/local';
import { showModal } from '../../actions/modal';
import TrainingModuleModal from '../modals/TrainingModuleModal';

const mapStateToProps = state => {
  return {
    me: state.local.me,
    paths: state.local.trainingpaths,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTrainingPaths: () => dispatch(fetchTrainingPaths()),
    showModal: modal => dispatch(showModal(modal)),
  }
}

class Training extends React.Component {
  componentWillMount() {
    this.props.fetchTrainingPaths();
  }
  render() {
    return (
        <div style = {{ marginTop: 80 }}>
          { this.props.me.auth['Training Editor'] &&
            <Button variant='outlined' style={{ marginBottom: 16, }} onClick={() => {this.props.showModal({ modalType: TRAINING, modalProps: { title: 'Add New Training Module', } })}}>
              Add New Training Module
            </Button>
          }
          <TrainingModuleModal />
          <GridList cellHeight={300} cols={4}>
            { this.props.paths.map(path => {
              const url = "/training/" + path.uid;
              return(
                <GridListTile key={path.uid}>
                  <Link to={url}>
                    {path.img ? <img src={path.img} alt={path.title} /> : <img src={path.fileUrl} alt={path.title} />}
                  </Link>
                  <GridListTileBar
                    title={path.title}
                    subtitle={path.subtitle}
                    actionIcon={
                      <div>
                        { this.props.me.auth['Training Editor'] &&
                          <IconButton onClick={() => {this.props.showModal({ modalType: TRAINING, modalProps: { title: 'Edit Training Module', doc: path, } })}}>
                            <Edit style={{ color: 'white', }} />
                          </IconButton>
                        }
                      </div>
                    }
                    />
                </GridListTile>
              );
            })}
          </GridList>
        </div>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Training);
