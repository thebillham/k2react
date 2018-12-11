import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../../config/styles';
import { connect } from 'react-redux';
import { cocsRef, asbestosAnalysisRef, } from '../../config/firebase';
import { fetchCocs, fetchSamples, syncJobWithWFM } from '../../actions/local';
import { showModal } from '../../actions/modal';
import CocModal from '../modals/CocModal';
import { COC } from '../../constants/modal-types';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

import ExpandMore from '@material-ui/icons/ExpandMore';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import Edit from '@material-ui/icons/Edit';
import Inbox from '@material-ui/icons/Inbox';
import Save from '@material-ui/icons/SaveAlt';
import CameraAlt from '@material-ui/icons/CameraAlt';
import Print from '@material-ui/icons/Print';
import Send from '@material-ui/icons/Send';
import More from '@material-ui/icons/MoreVert';

import Popup from 'reactjs-popup';

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    samples: state.local.samples,
    analyst: state.local.analyst,
    analysismode: state.local.analysismode,
    bulkanalysts: state.local.bulkanalysts,
    airanalysts: state.local.airanalysts,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    showModal: modal => dispatch(showModal(modal)),
    fetchSamples: jobnumber => dispatch(fetchSamples(jobnumber)),
    syncJobWithWFM: jobNumber => dispatch(syncJobWithWFM(jobNumber)),
  }
}

class CocList extends React.Component {
  state = {
    samples: {},
    bulkanalyst: '',
    // sessionID creates a unique id for this refresh of the CoC. This is used as the firestore uid for any results reported
    sessionID: '',
  }

  componentWillMount = () => {
    this.props.job.dates = this.props.job.dates ? this.props.job.dates.map(date => {
      return ((date instanceof Date) ? date : date.toDate());
    })
    : [];
    let now = new Intl.DateTimeFormat('en-GB', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);
    let uid = `${this.props.job.uid}-${this.props.me.name}-${now}`;

    this.setState({
      sessionID: uid.replace(/[.:/,\s]/g, '_'),
    });
    console.log(uid.replace(/[.:/,\s]/g, '_'));
  }

  receiveSample = (uid, receivedbylab) => {
    let receiveddate = null;
    if (!receivedbylab) receiveddate = new Date();
    cocsRef.doc(this.props.job.uid).collection("samples").doc(uid).set({ receivedbylab: !receivedbylab, receiveddate: receiveddate }, {merge: true});
  }

  reportSample = (uid, reported) => {
    if (this.props.me && this.props.me.auth && (this.props.me.auth['Analysis Checker'] || this.props.me.auth['Asbestos Admin'])) {
      let reportdate = null;
      if (!reported) reportdate = new Date();
      cocsRef.doc(this.props.job.uid).collection("samples").doc(uid).set({ reported: !reported, reportdate: reportdate }, {merge: true});
    } else {
      window.alert("You don't have sufficient permissions to verify asbestos results.");
    }
  }

  toggleResult = (sample, result) => {
    if (this.props.me && this.props.me.auth && (this.props.me.auth['Asbestos Bulk Analysis'] || this.props.me.auth['Asbestos Admin'])) {
      // Check analyst has been selected
      if (this.props.analyst === '') {
        window.alert("Select analyst from the dropdown at the top of the page.");
      }
      // Check if this sample has already been analysed
      if (sample.sessionID !== this.state.sessionID) {
        if (window.confirm("This sample has already been analysed. Do you wish to override the result? (If not, set your analysis mode to 'quality control' or 'practice')")) {
        } else {
          return;
        }
      }
      let newmap = {};
      let map = sample.result;
      if (sample.reported) {
        cocsRef.doc(this.props.job.uid).collection("samples").doc(sample.uid).set({ reported: false, reportdate: null }, {merge: true});
      }
      if (map === undefined) {
        newmap = { [result]: true }
      } else if (result === 'no') {
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

      // Check for situation where all results are unselected
      let notBlankAnalysis = false;
      Object.values(newmap).forEach(value => { if (value) notBlankAnalysis = true });

      if (notBlankAnalysis) {
        asbestosAnalysisRef.doc(`${this.state.sessionID}-${sample.uid}`).set({
          analyst: this.props.analyst,
          mode: this.props.analysismode ,
          sessionID: this.state.sessionID,
          cocUID: this.props.job.uid,
          sampleUID: sample.uid,
          result: newmap,
          description: sample.description,
          material: sample.material,
          samplers: this.props.job.personnel,
          analysisdate: new Date(),
        });
      } else {
        asbestosAnalysisRef.doc(`${this.state.sessionID}-${sample.uid}`).delete();
      }

      cocsRef.doc(this.props.job.uid).collection('samples').doc(sample.uid).update({
        sessionID: this.state.sessionID,
        analyst: this.props.analyst,
        result: newmap,
        resultdate: new Date(),
      });

      cocsRef.doc(this.props.job.uid).update({ versionUpToDate: false, });

    } else {
      window.alert("You don't have sufficient permissions to set asbestos results.");
    }
  }

  sortSamples = samples => {
    let samplemap = {};
    samples.forEach(sample => {
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
    if (result === undefined) return ('Not analysed');
    Object.keys(result).forEach(type => {
      if (result[type]) detected.push(type);
    });
    if (detected.length < 1) return ('Not analysed');
    if (detected[0] === 'no') return ('No asbestos detected');
    let asbestos = [];
    if (result['ch']) asbestos.push('chrysotile');
    if (result['am']) asbestos.push('amosite');
    if (result['cr']) asbestos.push('crocidolite');
    if (asbestos.length > 0) {
      asbestos[asbestos.length - 1] = asbestos[asbestos.length - 1] + ' asbestos';
    }
    let str = '';
    if (asbestos.length === 1) {
      str = asbestos[0];
    } else if (asbestos.length > 1) {
      var last_element = asbestos.pop();
      str = asbestos.join(', ') + ' and ' + last_element;
    }
    detected.forEach(detect => {
      if (detect === 'umf') {
        if (asbestos.length > 0) {
          str = str + ' and unknown mineral fibres (UMF)';
        } else {
          str = 'unknown mineral fibres (UMF)';
        }
      }
    });
    return str.charAt(0).toUpperCase() + str.slice(1) + ' detected';
  }

  writeVersionJson = job => {
    let aanumbers = {};
    Object.values(this.props.staff).forEach(staff =>  {
      aanumbers[staff.name] = staff.aanumber ? staff.aanumber : '-';
    });
    aanumbers[this.props.me.name] = this.props.me.aanumber ? this.props.me.aanumber : '-';
    aanumbers['Client'] = '-';
    console.log(aanumbers);
    let samples = [];
    this.props.samples[job.uid] && Object.values(this.props.samples[job.uid]).forEach(sample => {
      if (sample.reported) {
        let samplemap = {};
        samplemap['no'] = sample.samplenumber;
        samplemap['description'] = sample.description.charAt(0).toUpperCase() + sample.description.slice(1);
        samplemap['material'] = sample.material.charAt(0).toUpperCase() + sample.material.slice(1);
        samplemap['result'] = this.writeResult(sample.result);
        samples.push(samplemap);
      }
    })
    let report = {
      jobNumber: job.jobNumber,
      client: `${job.client} ${job.clientOrderNumber}`,
      address: job.address,
      date: job.dates.sort((b,a) => {
        let aDate = (a instanceof Date) ? a : a.toDate();
        let bDate = (b instanceof Date) ? b : b.toDate();
        return new Date(bDate - aDate)
      }).map(date => {
        let formatDate = (date instanceof Date) ? date : date.toDate()
        return(
        new Intl.DateTimeFormat('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(formatDate)
      )}).join(', '),
      ktp: 'Stuart Keer-Keer',
      personnel: job.personnel.sort(),
      assessors: job.personnel.sort().map(staff => { return(aanumbers[staff])}),
      analysts: this.getAnalysts() ? this.getAnalysts() : ['Not specified.'],
      samples: samples,
    }
    return report;
  }

  issueLabReport = version => {
    // first check all samples have been checked
    // if not version 1, prompt for reason for new version
    let changes = 'Prompted changes';
    let json = this.writeVersionJson(this.props.job);
    let versionHistory = this.props.job.versionHistory ? this.props.job.versionHistory : {};
    versionHistory[version] = {
      issueDate: new Date(),
      changes: changes,
      data: json,
    }
    cocsRef.doc(this.props.job.uid).set({ currentVersion: version, versionHistory: versionHistory, versionUpToDate: true, }, {merge: true});
  }

  printLabReport = job => {
    console.log(this.props.job.versionHistory[this.props.job.currentVersion]);
    let url = 'http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(this.props.job.versionHistory[this.props.job.currentVersion].data);
    this.setState({ url: url });
    window.open(url);
    // fetch('http://api.k2.co.nz/v1/doc/scripts/asbestos/issue/labreport_singlepage.php?report=' + JSON.stringify(report));
  }

  getSamples = (expanded, cocUid) => {
    if (expanded && cocUid) {
      this.props.fetchSamples(cocUid);
    }
  }

// Restructure result first to include analyst, analysis type, date etc.
  getAnalysts = () => {
    let analysts = {};
    this.props.samples[this.props.job.uid] && Object.values(this.props.samples[this.props.job.uid]).forEach(sample => {
      if (sample.analyst && sample.reported) {
        analysts[sample.analyst] = true;
      }
    });
    let list = [];
    Object.keys(analysts).forEach(analyst => {list.push(analyst)});
    if (list.length === 0) return false;
    return list;
  }

  render() {
    const { classes, job, samples, bulkanalysts, airanalysts } = this.props;
    let version = 1;
    if (job.currentVersion) version = job.currentVersion + 1;
    return (
      <ExpansionPanel onChange={(event, ex) => {
        if (!job.samples) this.getSamples(ex, job.uid);
      }}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <b>{job.jobNumber}</b> {job.client} ({job.address})
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List>
            <div>
              <Button variant='outlined' onClick={() => {
                this.props.syncJobWithWFM(job.jobNumber);
                this.props.showModal({ modalType: COC, modalProps: { title: 'Edit Chain of Custody', doc: {...job, samples: samples[job.uid]}} });
              }}>
                <Edit style={{ fontSize: 20, margin: 5, }} />
                Edit
              </Button>
              <Button style={{ marginLeft: 5, }} variant='outlined' disabled onClick={() => {this.printCoc(job)}}>
                <Print style={{ fontSize: 20, margin: 5, }} /> Print Chain of Custody
              </Button>
              <Button style={{ marginLeft: 5, }} variant='outlined' disabled={ job.versionUpToDate } onClick={() => {this.issueLabReport(version)}}>
                <Send style={{ fontSize: 20, margin: 5, }} />
                Issue Version { version }
              </Button>
              <Button style={{ marginLeft: 5, }} variant='outlined' disabled={ !job.currentVersion || !job.versionUpToDate } onClick={() => {this.printLabReport(job)}}>
                <Save style={{ fontSize: 20, margin: 5, }} /> Download Test Certificate
              </Button>
              <IconButton>
                <More />
              </IconButton>
            </div>
            <div style={{ marginTop: 12, marginBottom: 12, }}>
              Sampled by: <span style={{ fontWeight: 300, }}>{ job.personnel ? job.personnel.join(', ') : 'Not specified.' }</span><br />
              Analysis by: <span style={{ fontWeight: 300, }}>{ this.getAnalysts() ? this.getAnalysts().join(', ') : 'Not specified.'}</span><br />
            </div>
          { samples[job.uid] && Object.values(samples[job.uid]).map(sample => {
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
            if (result === 'positive') {
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
            if (result === 'negative') {
              nocolor = 'green';
              nodivcolor = 'lightgreen';
            }
            let asbdivcolor = '#fff';
            if (result === 'positive') asbdivcolor = 'red';
            return(
              <ListItem dense className={classes.hoverItem} key={sample.jobnumber+sample.samplenumber.toString()+sample.description}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '70vw'}}>
                  <div style={{ width: '30vw', display: 'flex', flexDirection: 'row',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden',
                    alignItems: 'center', justifyContent: 'flex-start',}}>
                    <Popup
                      trigger={<CameraAlt style={{ fontSize: 24, color: cameracolor, margin: 10 }} />}
                      position="right center"
                      on="hover"
                      disabled={sample.path_remote == null}
                      >
                      { sample.path_remote &&
                      <img alt='' src={sample.path_remote} width={200} />}
                    </Popup>
                    <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#aaa',
                        marginRight: 10, color: '#fff', justifyContent: 'center', alignItems: 'center', display: 'flex',
                        fontWeight: 'bold', }}>{sample.samplenumber}</div>
                    { sample.description + ', ' + sample.material }
                  </div>
                  <div style={{ width: '40vw', display: 'flex', flexDirection: 'row',
                    justifyContent: 'flex-end', alignItems: 'center',}}>
                    <IconButton onClick={ () => { this.receiveSample(sample.uid, sample.receivedbylab) } }>
                      <Inbox style={{ fontSize: 24, margin: 10, color: receivedcolor }} />
                    </IconButton>
                    <div style={{ backgroundColor: asbdivcolor, borderRadius: 5 }}>
                    <Button variant='outlined' style={{ margin: 5, color: chcolor, }} onClick={ () => { this.toggleResult(sample, 'ch') }}>CH</Button>
                    <Button variant='outlined' style={{ margin: 5, color: amcolor, }} onClick={ () => { this.toggleResult(sample, 'am') }}>AM</Button>
                    <Button variant='outlined' style={{ margin: 5, color: crcolor, }} onClick={ () => { this.toggleResult(sample, 'cr') }}>CR</Button>
                    <Button variant='outlined' style={{ margin: 5, color: umfcolor, }} onClick={ () => { this.toggleResult(sample, 'umf') }}>UMF</Button>
                    </div>
                    <div style={{ width: 30 }} />
                    <div style={{ backgroundColor: nodivcolor, borderRadius: 5 }}>
                      <Button variant='outlined' style={{ margin: 5, color: nocolor, }} onClick={ () => { this.toggleResult(sample, 'no') }}>NO</Button>
                    </div>
                    <IconButton onClick={ () => { this.reportSample(sample.uid, sample.reported) }}>
                      <CheckCircleOutline style={{ fontSize: 24, margin: 10, color: reportcolor }} />
                    </IconButton>
                    <IconButton>
                      <More />
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
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CocList));
