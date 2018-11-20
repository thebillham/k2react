import React from 'react';

import Paper from '@material-ui/core/Paper';

import { connect } from 'react-redux';
import { fetchUpdates  } from '../../actions/local';
import { markFootprint } from '../../actions/footprints';

const mapStateToProps = state => {
  return {
    updates: state.local.updates,
    footprint: state.footprints.footprints.update,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchUpdates: () => dispatch(fetchUpdates()),
    markFootprint: () => dispatch(markFootprint('update')),
  };
};

class Updates extends React.Component {

  componentWillMount(){
    if (!this.props.footprint) {
      this.props.fetchUpdates();
      this.props.markFootprint();
    }
  }

  render() {
    return (
        <div style = {{ marginTop: 80, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', display: 'flex', }}>
          { this.props.updates && this.props.updates.length > 0 && (
              this.props.updates.map(update => {
                return(
                  <Paper key={update.date} style={{ padding: 128, width: 1000, }}>
                    <div style={{ fontSize: 16, color: '#555'}} dangerouslySetInnerHTML={{ __html: update.text}} />
                  </Paper>
                )
              })
            )
          }
        </div>
      )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Updates);
