import React from 'react';

import { Paper } from '@material-ui/core';

import { connect } from 'react-redux';
import store from '../../store';
import { fetchHelp  } from '../../actions/local';
import { markFootprint } from '../../actions/footprints';

const mapStateToProps = state => {
  return {
    helps: state.local.helps,
    footprint: state.footprints.footprints.help,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchHelp: () => dispatch(fetchHelp()),
    markFootprint: () => dispatch(markFootprint()),
  };
};

class Updates extends React.Component {

  componentWillMount(){
    if (!this.props.footprint) {
      this.props.fetchHelp();
      this.props.markFootprint();
    }
  }

  render() {
    return (
        <div style = {{ marginTop: 80, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', display: 'flex', }}>
          { this.props.helps && this.props.helps.length > 0 && (
              this.props.helps.map(help => {
                return(
                  <Paper key={help.date} style={{ padding: 128, width: 1000, }}>
                    <div style={{ fontSize: 16, color: '#555'}} dangerouslySetInnerHTML={{ __html: help.text}} />
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
