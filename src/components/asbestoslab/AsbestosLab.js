import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import store from '../../store';
import { asbestosSamplesRef } from '../../config/firebase';
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress, Button,
  ListItemSecondaryAction, Grid, Paper, TextField, IconButton } from '@material-ui/core';
import { ExpandMore, CheckCircleOutline, Edit, Inbox, CameraAlt, Print } from '@material-ui/icons';
import Popup from 'reactjs-popup';

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

  receiveSample = (uid, receivedbylab) => {
    let receiveddate = null;
    if (!receivedbylab) receiveddate = new Date();
    asbestosSamplesRef.doc(uid).set({ receivedbylab: !receivedbylab, receiveddate: receiveddate }, {merge: true});
  }

  reportSample = (uid, reported) => {
    let reportdate = null;
    if (!reported) reportdate = new Date();
    asbestosSamplesRef.doc(uid).set({ reported: !reported, reportdate: reportdate }, {merge: true});
  }

  toggleResult = (uid, result, map, reported) => {
    let newmap = {};
    if (reported) {
      asbestosSamplesRef.doc(uid).set({ reported: false, reportdate: null }, {merge: true});
    }
    if (map === undefined) {
      newmap = { [result]: true }
    } else if (result == 'no') {
      let val = map[result];
      newmap = { 'no': !val };
    } else if (map[result] === undefined) {
      newmap = map;
      newmap['no'] = false;
      newmap[result] = true;
    } else {
      newmap = map;
      newmap['no'] = false;
      newmap[result] = !map[result];
    }
    asbestosSamplesRef.doc(uid).update({ result: newmap, resultdate: new Date() });
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

  writeResult = result => {
    let detected = [];
    Object.keys(result).forEach(type => {
      if (result[type]) detected.push(type);
    });
    if (detected.length < 1) return ('Not analysed');
    if (detected[0] == 'no') return ('No asbestos detected');
    let asbestos = [];
    detected.forEach(detect => {
      if (detect == 'ch') asbestos.push('chrysotile');
      if (detect == 'am') asbestos.push('amosite');
      if (detect == 'cr') asbestos.push('crocidolite');
    });
    if (asbestos.length > 0) asbestos[asbestos.length] = asbestos[asbestos.length] + ' asbestos';
    detected.forEach(detect => {
      if (detect == 'umf') asbestos.push('unknown mineral fibres');
    });
    let str = asbestos.join(", ") + ' detected';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  printLabReport = job => {
    let str = 'http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=';
    let samples = [];
    job.samples.forEach(sample => {
      if (sample.reported) {
        let samplemap = {};
        samplemap['no'] = sample.samplenumber;
        samplemap['description'] = sample.description;
        samplemap['material'] = sample.material;
        samplemap['result'] = this.writeResult(sample.result);
        samples.push(samplemap);
      }
    })
    let report = {
      jobNumber: job.jobNumber,
      client: job.clientname,
      address: job.address,
      date: '7 November 2018',
      ktp: 'Stuart Keer-Keer',
      personnel: ['Max van den Oever','Reagan Solodi',],
      assessors: ['AA16100168','AA18050075',],
      analysts: ['Ben Dodd'],
      samples: samples,
    }
    str = str + JSON.stringify(report);
    this.setState({
      print: str,
    })
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
            <ExpansionPanel key={job}>
              <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                <IconButton onClick={() => {this.printLabReport(samples[job])}} ><Print style={{ fontSize: 24, margin: 5, }} /></IconButton>
                <b>{job}</b> {samples[job].clientname} ({samples[job].address})
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <List>
                { samples[job].samples.map(sample => {
                  let result = 'none';
                  if (sample.result && (sample.result['ch'] || sample.result['am'] || sample.result['cr'] || sample.result['umf'])) result = 'positive';
                  if (sample.result && sample.result['no']) result = 'negative';
                  let cameracolor = '#ddd';
                  if (sample.path_remote) cameracolor = 'green';
                  let receivedcolor = '#ddd';
                  if (sample.receivedbylab) receivedcolor = 'green';
                  let reportcolor = '#ddd';
                  if (sample.reported) reportcolor = 'green';
                  let chcolor = '#ddd';
                  let amcolor = '#ddd';
                  let crcolor = '#ddd';
                  let umfcolor = '#ddd';
                  if (result == 'positive') {
                    chcolor = '#b00';
                    amcolor = '#b00';
                    crcolor = '#b00';
                    umfcolor = '#b00';
                  }
                  if (sample.result && sample.result['ch']) chcolor = 'white';
                  if (sample.result && sample.result['am']) amcolor = 'white';
                  if (sample.result && sample.result['cr']) crcolor = 'white';
                  if (sample.result && sample.result['umf']) umfcolor = 'white';
                  let nocolor = '#ddd';
                  let nodivcolor = '#fff';
                  if (result == 'negative') {
                    nocolor = 'green';
                    nodivcolor = 'lightgreen';
                  }
                  let asbdivcolor = '#fff';
                  if (result == 'positive') asbdivcolor = 'red';
                  return(
                    <ListItem dense className={classes.hoverItem} key={sample.jobnumber+sample.samplenumber+sample.description}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '70vw'}}>
                        <div style={{ width: '60vw', display: 'flex', flexDirection: 'row',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden',
                          alignItems: 'center', justifyContent: 'flex-start',}}>
                          <Popup
                            trigger={<CameraAlt style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
                            position="right center"
                            on="hover"
                            disabled={sample.path_remote == null}
                            >
                            { sample.path_remote &&
                            <img src={sample.path_remote} width={400} />}
                          </Popup>

                          <Popup
                            trigger={<Edit style={{ fontSize: 24, margin: 10 }} />}
                            position="right center"
                            closeOnDocumentClick
                            >
                            <Paper>
                              <TextField value={sample.samplenumber} />
                              <TextField value={sample.description} />
                              <TextField value={sample.material} />
                            </Paper>
                          </Popup>

                          <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#aaa',
                              marginRight: 10, color: '#fff', justifyContent: 'center', alignItems: 'center', display: 'flex',
                              fontWeight: 'bold', }}>{sample.samplenumber}</div>
                          { sample.description + ', ' + sample.material }
                        </div>
                        <div style={{ width: '40vw', display: 'flex', flexDirection: 'row',
                          justifyContent: 'flex-end', alignItems: 'center',}}>
                          <IconButton onClick={ () => { this.receiveSample(sample.uid, sample.receivedbylab) } } disabled={this.state.isLoading}>
                            <Inbox style={{ fontSize: 24, margin: 10, color: receivedcolor }} />
                          </IconButton>
                          <div style={{ backgroundColor: asbdivcolor, borderRadius: 5 }}>
                          <Button variant='outlined' style={{ margin: 5, color: chcolor, }} onClick={ () => { this.toggleResult(sample.uid, 'ch', sample.result, sample.reported) }}>CH</Button>
                          <Button variant='outlined' style={{ margin: 5, color: amcolor, }} onClick={ () => { this.toggleResult(sample.uid, 'am', sample.result, sample.reported) }}>AM</Button>
                          <Button variant='outlined' style={{ margin: 5, color: crcolor, }} onClick={ () => { this.toggleResult(sample.uid, 'cr', sample.result, sample.reported) }}>CR</Button>
                          <Button variant='outlined' style={{ margin: 5, color: umfcolor, }} onClick={ () => { this.toggleResult(sample.uid, 'umf', sample.result, sample.reported) }}>UMF</Button>
                          </div>
                          <div style={{ width: 30 }} />
                          <div style={{ backgroundColor: nodivcolor, borderRadius: 5 }}>
                            <Button variant='outlined' style={{ margin: 5, color: nocolor, }} onClick={ () => { this.toggleResult(sample.uid, 'no', sample.result, sample.reported) }}>NO</Button>
                          </div>
                          <IconButton onClick={ () => { this.reportSample(sample.uid, sample.reported) }} disabled={this.state.isLoading}>
                            <CheckCircleOutline style={{ fontSize: 24, margin: 10, color: reportcolor }} />
                          </IconButton>
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
