import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import store from '../../store';
import { asbestosSamplesRef } from '../../config/firebase';
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress, Button,
  ListItemSecondaryAction, Grid } from '@material-ui/core';
import { ExpandMore, CheckCircleOutline, Edit, Inbox } from '@material-ui/icons';

const mapStateToProps = state => {
  return {
    samples: state.local.samplesasbestos,
   };
};

class AsbestosLab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  componentWillMount(){
    // let samples = [];
    // asbestosSamplesRef.orderBy("jobnumber", "desc").orderBy("samplenumber").limit(50).get().then(snap => {
    //   snap.forEach(doc => {
    //     samples.push(doc.data());
    //   });
    //   this.setState({
    //     isLoading: false,
    //   });
    // });
  }

  sortSamples = samples => {
    let samplemap = {};
    samples.map(sample => {
      if (samplemap[sample.jobnumber]) {
        samplemap[sample.jobnumber].push(sample);
      } else {
        samplemap[sample.jobnumber] = [sample];
      }
    });
    return samplemap;
  }

  render() {
    const { classes, samples } = this.props;

    var jobnumber = '';
    return (
      <div style = {{ marginTop: 80 }}>
        { Object.keys(samples).length < 1 ?
        ( <CircularProgress />)
        :
        (<div>{ Object.keys(samples).map(job => {
          return (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                <b>{job}</b> {samples[job].clientname} ({samples[job].address})
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <List>
                { samples[job].samples.map(sample => {
                  return(
                    <ListItem dense className={classes.hoverItem} key={sample.jobnumber+sample.samplenumber+sample.description}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '70vw'}}>
                        <div style={{ width: '30vw', display: 'flex', flexDirection: 'row',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden',
                          alignItems: 'center', justifyContent: 'flex-start',}}>
                          <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#aaa',
                              marginRight: 10, color: '#fff', justifyContent: 'center', alignItems: 'center', display: 'flex',
                              fontWeight: 'bold', }}>{sample.samplenumber}</div>
                          { sample.description + ', ' + sample.material }
                        </div>
                        <div style={{ width: '30vw', display: 'flex', flexDirection: 'row',
                          justifyContent: 'flex-end', alignItems: 'center',}}>
                          <Inbox style={{ fontSize: 24, margin: 5, }} />
                          <Button variant='outlined' style={{ margin: 5}}>CH</Button>
                          <Button variant='outlined' style={{ margin: 5}}>AM</Button>
                          <Button variant='outlined' style={{ margin: 5}}>CR</Button>
                          <Button variant='outlined' style={{ margin: 5}}>UMF</Button>
                          <Button variant='outlined' style={{ margin: 5}}>NO</Button>
                          <CheckCircleOutline style={{ fontSize: 24, margin: 5 }} />
                          <Edit style={{ fontSize: 24, margin: 5 }} />
                        </div>
                      </div>
                    </ListItem>
                  );
                })}
                </List>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          );
        })}</div>
      )}
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps)(AsbestosLab));
