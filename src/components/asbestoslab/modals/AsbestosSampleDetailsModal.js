import React from "react";
import reactCSS from 'reactcss';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { hotkeys, hotkey_display } from 'react-keyboard-shortcuts';
import { connect } from "react-redux";
import { ASBESTOS_SAMPLE_DETAILS, } from "../../../constants/modal-types";
import "../../../config/tags.css";

import { SampleTextyDisplay, SampleTextyLine, AsbButton, } from '../../../widgets/FormWidgets';

import ImageUploader from 'react-images-upload';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Good from "@material-ui/icons/ThumbUp";
import Half from "@material-ui/icons/ThumbsUpDown";
import Bad from "@material-ui/icons/ThumbDown";
import AsbestosSampleWASummary from "../components/AsbestosSampleWASummary";
import { hideModal, hideModalSecondary, handleModalChange } from "../../../actions/modal";
import { dateOf, milliToDHM } from "../../../actions/helpers";
import moment from "moment";
import momentbusinesstime from "moment-business-time";
import momentbusinessdays from "moment-business-days";
import momenttimezone from "moment-timezone";
import {
  writeSoilDetails,
  getSampleColors,
  analyticalCriteraOK,
  writeShorthandResult,
  getWAAnalysisSummary,
  writeSampleConditioningList,
  writeSampleDimensions,
  collateLayeredResults,
  compareAsbestosResult,
  writeSampleMoisture,
  writePersonnelQualFull,
  getSampleStatus,
  resetSampleView,
} from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    modalTypeSecondary: state.modal.modalTypeSecondary,
    modalPropsSecondary: state.modal.modalPropsSecondary,
    sampleView: state.asbestosLab.sampleView,
    samples: state.asbestosLab.samples,
    me: state.local.me,
    staff: state.local.staff,
    shortcuts: state.const.keyboardShortcuts,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    hideModalSecondary: () => dispatch(hideModalSecondary()),
    handleModalChange: (target) => dispatch(handleModalChange(target)),
    resetSampleView: () => dispatch(resetSampleView()),
  };
};

const keyNext = 'alt+i';
const keyPrev = 'alt+u';

const tooltipNext = hotkey_display(keyNext);
const tooltipPrev = hotkey_display(keyPrev);

class AsbestosSampleDetailsModal extends React.Component {
  state = {
    pictures: [],
  };

  hot_keys = {
    [keyNext]: {
      priority: 1,
      handler: () => this.nextSample(),
    },
    [keyPrev]: {
      priority: 1,
      handler: () => this.previousSample(),
    },
  }

  previousSample = samples => {
    let takeThisSample = false;
    samples.reverse().forEach(sample => {
      if (takeThisSample) {
        //console.log(sample);
        this.props.handleModalChange({id: 'doc', value: {...sample}});
        takeThisSample = false;
      }
      if (sample.uid === this.props.modalProps.doc.uid) takeThisSample = true;
    });
  };

  nextSample = samples => {
    let takeThisSample = false;
    samples.forEach(sample => {
      if (takeThisSample) {
        //console.log(sample);
        this.props.handleModalChange({id: 'doc', value: {...sample}});
        takeThisSample = false;
      }
      if (sample.uid === this.props.modalProps.doc.uid) takeThisSample = true;
    });
  };


  onDrop = (picture) => {
    this.setState({
      pictures: this.state.pictures.concat(picture),
    });
  }

  render() {
    const { classes, modalProps, modalType, modalTypeSecondary, modalPropsSecondary, } = this.props;
    if (modalType === ASBESTOS_SAMPLE_DETAILS || modalTypeSecondary === ASBESTOS_SAMPLE_DETAILS) {
      let sample = null;
      let job = null;
      if (!modalPropsSecondary || modalPropsSecondary.doc !== false) sample = modalProps.doc;
        else if (this.props.sampleView) sample = this.props.sampleView.sample;
      // let sample = modalProps.doc;
      if (!modalPropsSecondary || modalPropsSecondary.job !== false) job = modalProps.job;
        else if (this.props.sampleView) job = this.props.sampleView.coc;

      let dates = job && job.dates ? job.dates.map(date => {
        return moment(dateOf(date)).format('D MMMM YYYY');
      }) : [];

      let analysisDate = "Not analysed";
      if (sample && sample.analysisDate) {
        analysisDate = moment(dateOf(sample.analysisDate)).format('D MMMM YYYY');
      }

      // let nz = moment.tz.setDefault("Pacific/Auckland");
      moment.updateLocale('en', {
        // workingWeekdays: [1,2,3,4,5],
        workinghours: {
          0: null,
          1: ['08:00:00', '17:00:00'],
          2: ['08:00:00', '17:00:00'],
          3: ['08:00:00', '17:00:00'],
          4: ['08:00:00', '17:00:00'],
          5: ['08:00:00', '17:00:00'],
          6: null,
        },
        holidays: [
          '2019-11-15',
          '2019-12-25',
          '2019-12-26',
          '2020-01-01',
          '2020-01-02',
          '2020-02-06',
          '2020-04-10',
          '2020-04-13',
          '2020-04-27',
          '2020-06-01',
          '2020-10-26',
          '2020-11-13',
          '2020-12-25',
          '2020-12-26',
        ],
      });
      moment.locale('en');
      moment.tz.setDefault("Pacific/Auckland");

      // console.log(`is working time now ${moment().isWorkingTime()}`);

      let endTime = new Date();
      if (sample && sample.verifyDate) endTime = dateOf(sample.verifyDate);
      // console.log(endTime);
      let timeTotal = sample && sample.receivedDate ? moment(endTime).diff(moment(dateOf(sample.receivedDate))) : null;
      let timeTotalBusiness = sample && sample.receivedDate ? moment(endTime).workingDiff(moment(dateOf(sample.receivedDate))) : null;
      let timeAdmin = sample && sample.analysisDate ? moment(endTime).diff(moment(dateOf(sample.analysisDate))) : null;
      let timeAdminBusiness = sample && sample.analysisDate ? moment(endTime).workingDiff(moment(dateOf(sample.analysisDate))) : null;
      endTime = new Date();
      if (sample && sample.analysisDate) endTime = dateOf(sample.analysisDate);
      let timeLab = sample && sample.receivedDate ? moment(endTime).diff(moment(dateOf(sample.receivedDate))) : null;
      let timeLabBusiness = sample && sample.receivedDate ? moment(endTime).workingDiff(moment(dateOf(sample.receivedDate))) : null;
      // console.log(milliToDHM(timeInLab));
      // console.log(milliToDHM(timeInLabBusiness));
      // console.log(timeInLabBusiness);
      // //console.log(timeInLab);
      // //console.log(timeInLabBusiness);
      let status = getSampleStatus(sample);
      let colors = getSampleColors(sample, classes);
      let layersResult = null;
      let soilResult = null;
      if (sample && sample.layers) layersResult = compareAsbestosResult({result: collateLayeredResults(sample.layers)}, sample);
      if (sample && sample.waSoilAnalysis) soilResult = compareAsbestosResult({result: collateLayeredResults(sample.waSoilAnalysis)}, sample);

      const good = (<Good style={{ color: 'green', fontSize: 14, }}/>);
      const half = (<Bad style={{ color: 'orange', fontSize: 14, }}/>);
      const bad = (<Bad style={{ color: 'red', fontSize: 14, }}/>);

      let sampleMoisture = null;
      if (sample) sampleMoisture = writeSampleMoisture(sample, true);
      let samples = [];
      if (!modalPropsSecondary || modalPropsSecondary.noNext === undefined) samples = Object.values(this.props.samples[job.uid]).filter(s => s.cocUid === job.uid);

      return (
        <div>
        {job && sample && (modalType === ASBESTOS_SAMPLE_DETAILS || modalTypeSecondary === ASBESTOS_SAMPLE_DETAILS) &&
        <Dialog
          open={modalType === ASBESTOS_SAMPLE_DETAILS || modalTypeSecondary === ASBESTOS_SAMPLE_DETAILS}
          onClose={() => {
            if (modalType === ASBESTOS_SAMPLE_DETAILS) this.props.hideModal();
              else this.props.hideModalSecondary();
          }}
          maxWidth="lg"
          fullWidth={true}
        >
          <DialogTitle>{`Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber}`}</DialogTitle>
          {(modalType === ASBESTOS_SAMPLE_DETAILS || modalTypeSecondary === ASBESTOS_SAMPLE_DETAILS) && <DialogContent>
            <Grid container alignItems='flex-start' justify='flex-end'>
              <Grid item xs={6}>
                <div className={classes.informationBox}>
                  <div className={classes.heading}>Basic Information</div>
                  {SampleTextyLine('Status', status.toUpperCase())}
                  {job.client && SampleTextyLine('Client',job.client)}
                  {job.address && SampleTextyLine('Address',job.address)}
                  {sample.genericLocation && SampleTextyLine('Generic Location',sample.genericLocation)}
                  {sample.specificLocation && SampleTextyLine('Specific Location',sample.specificLocation)}
                  {sample.description && SampleTextyLine('Short Description',sample.description)}
                  {sample.material && SampleTextyLine('Material', sample.material.charAt(0).toUpperCase() + sample.material.slice(1))}
                  {sample.category && SampleTextyLine('Material Category', sample.category)}
                </div>
                <div className={classes.informationBox}>
                  <div className={classes.heading}>Results</div>
                  <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 12, }}>
                    {['ch','am','cr','umf','no','org','smf'].map(res => {
                      if (sample.result && sample.result[res] === true) return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res, null);
                    })}
                  </div>
                  {SampleTextyLine('Analyst', sample.analyst ? sample.analyst : "Not analysed")}
                  {SampleTextyLine('Analysis Date', analysisDate)}
                  {sample.analysisRecordedBy && sample.analysisRecordedBy.name !== sample.analyst && SampleTextyLine('Analysis Recorded By', sample.analysisRecordedBy.name)}
                  {SampleTextyLine('Result Verified?', sample.verified ? 'Yes' : 'No')}
                  {sample.verifiedBy && SampleTextyLine('Result Verified By', sample.verifiedBy.name)}
                  {sample.layers && <div style={{ display: 'flex', flexDirection: 'row', }}>
                    <div style={{ width: '60%'}}>{SampleTextyLine('Cumulative Layer Results', writeShorthandResult(collateLayeredResults(sample.layers)))}</div>
                    <div style={{ width: '40%'}}>{(layersResult === 'yes' || layersResult === 'differentNonAsbestos') ? good : layersResult === 'no' ? bad : layersResult === 'none' ? '' : half}</div>
                  </div>}
                  {sample.waSoilAnalysis && <div style={{ display: 'flex', flexDirection: 'row', }}>
                    <div style={{ width: '60%'}}>{SampleTextyLine('WA Standard Results', writeShorthandResult(collateLayeredResults(sample.waSoilAnalysis)))}</div>
                    <div style={{ width: '40%'}}>{(soilResult === 'yes' || soilResult === 'differentNonAsbestos') ? good : soilResult === 'no' ? bad : soilResult === 'none' ? '' : half}</div>
                  </div>}
                  {sample.confirm && Object.keys(sample.confirm).map(key => {
                    if (sample.confirm[key] !== undefined && sample.confirm[key] !== undefined &&
                      sample.confirm[key].deleted !== true && sample.confirm[key].analyst !== undefined) {
                      let check = compareAsbestosResult(sample.confirm[key], sample);
                      return <div key={key} style={{ display: 'flex', flexDirection: 'row', }}>
                        <div style={{ width: '60%'}}>{SampleTextyLine(`Sample Check ${key}`, `${writeShorthandResult(sample.confirm[key].result)} (${sample.confirm[key].analyst})`)}</div>
                        <div style={{ width: '40%'}}>{(check === 'yes' || check === 'differentNonAsbestos') ? good : check === 'no' ? bad : check === 'none' ? '' : half}</div>
                      </div>
                    } else return null;
                  })}
                </div>
                <div className={classes.informationBox}>
                  <div className={classes.heading}>Analysis Details</div>
                  {sample.classification !== undefined && SampleTextyLine('Homogenous?', sample.classification === "homo" ? 'Yes' : 'No')}
                  {sample.asbestosEvident !== undefined && SampleTextyLine('Asbestos Evident?', sample.asbestosEvident ? 'Yes' : 'No')}
                  {sample.sampleConditioning !== undefined &&
                    SampleTextyLine('Sample Conditioning', writeSampleConditioningList(sample.sampleConditioning))
                  }
                  {SampleTextyDisplay('Analytical Criteria OK?', analyticalCriteraOK(sample))}
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className={classes.informationBox}>
                  <div className={classes.heading}>Sample Details</div>
                  {SampleTextyLine('Sampling Personnel', sample.sampledBy && sample.sampledBy.length > 0 ? sample.sampledBy.map(e => e.name).join(", ") : 'Not specified')}
                  {SampleTextyLine('Sampling Date(s)', sample.sampleDate ? moment(dateOf(sample.sampleDate)).format("dddd, D MMMM YYYY") : 'Not specified')}
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    {SampleTextyDisplay('Weight Received',sample.weightReceived ? sample.weightReceived + 'g' : 'N/A')}
                      {SampleTextyDisplay('Subsample Weight',sample.weightSubsample ? sample.weightSubsample + 'g' : 'N/A')}
                    {SampleTextyDisplay('Dry Weight (~105°C)',sample.weightDry ? sample.weightDry + 'g' : 'N/A')}
                    {SampleTextyDisplay('Ashed Weight (~400°C)',sample.weightAshed ? sample.weightAshed + 'g' : 'N/A')}
                  </div>

                  {sampleMoisture && <div>
                    {SampleTextyDisplay('Moisture Content',`${sampleMoisture}%`)}
                  </div>}

                  {(sample.dimensions) && SampleTextyDisplay('Dimensions', writeSampleDimensions(sample))}
                  {sample.labDescription && SampleTextyDisplay('Lab Sample Description',sample.labDescription)}
                  {sample.labComments && SampleTextyDisplay('Lab Observations/Comments', sample.labComments)}
                  {sample.footnote && SampleTextyDisplay('Lab Footnote for Report', sample.footnote)}
                  {sample.soilDetails && SampleTextyDisplay('Geotechnical Soil Details', writeSoilDetails(sample.soilDetails))}
                  {sample.layers &&
                    ((sample.layers[`layer1`] !== undefined && Object.keys(sample.layers[`layer1`].result).length > 0) ||
                    (sample.layers[`layer2`] !== undefined && Object.keys(sample.layers[`layer2`].result).length > 0) ||
                    (sample.layers[`layer3`] !== undefined && Object.keys(sample.layers[`layer3`].result).length > 0)) &&
                    SampleTextyDisplay('Layers', [...Array(sample.layerNum ? sample.layerNum : 5).keys()].filter(num => sample.layers[`layer${num+1}`] &&
                      ((sample.layers[`layer${num+1}`].description !== '' && sample.layers[`layer${num+1}`].description !== undefined) ||
                      (sample.layers[`layer${num+1}`].result && Object.keys(sample.layers[`layer${num+1}`].result).length > 0)))
                      .map(num => this.getLayerRow(num+1)))
                  }
                </div>
                <div className={classes.informationBox}>
                  <div className={classes.heading}>Turnaround Times</div>
                  {sample.receivedDate ? sample.verified ? SampleTextyLine('Turnaround Time (Total)', milliToDHM(timeTotal, true, false))
                    : SampleTextyLine('Time Since Received (Total)', milliToDHM(timeTotal, true, false))
                  : SampleTextyLine('Turnaround Time (Total)', 'Not yet received by lab')}
                  {sample.receivedDate ? sample.verified ? SampleTextyLine('Turnaround Time (Business Hours Only)', milliToDHM(timeTotalBusiness, true, true))
                    : SampleTextyLine('Time Since Received (Business Hours Only)', milliToDHM(timeTotalBusiness, true, true))
                  : SampleTextyLine('Turnaround Time (Business Hours Only)', 'Not yet received by lab')}

                  {sample.receivedDate ? sample.analysisDate ? SampleTextyLine('Lab Time (Total)', milliToDHM(timeLab, true, false))
                    : SampleTextyLine('Time In Lab (Total)', milliToDHM(timeLab, true, false))
                  : SampleTextyLine('Lab Time (Total)', 'Not yet received by lab')}
                  {sample.receivedDate ? sample.analysisDate ? SampleTextyLine('Lab Time (Business Hours Only)', milliToDHM(timeLabBusiness, true, true))
                    : SampleTextyLine('Time In Lab (Business Hours Only)', milliToDHM(timeLabBusiness, true, true))
                  : SampleTextyLine('Lab Time (Business Hours Only)', 'Not yet received by lab')}

                  {sample.analysisDate ? sample.verified ? SampleTextyLine('Admin Time (Total)', milliToDHM(timeAdmin, true, false))
                    : SampleTextyLine('Time In Admin (Total)', milliToDHM(timeAdmin, true, false))
                  : SampleTextyLine('Admin Time (Total)', 'Not yet received from lab')}
                  {sample.analysisDate ? sample.verified ? SampleTextyLine('Admin Time (Business Hours Only)', milliToDHM(timeAdminBusiness, true, true))
                    : SampleTextyLine('Time In Admin (Business Hours Only)', milliToDHM(timeAdminBusiness, true, true))
                  : SampleTextyLine('Admin Time (Business Hours Only)', 'Not yet received from lab')}
                </div>
                <div className={classes.informationBox}>
                  <div className={classes.heading}>Sample History</div>
                  {SampleTextyLine('Created', sample.createdDate ?
                      `${moment(sample.createdDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.createdBy ? sample.createdBy.name : 'an unknown person'}`
                      : 'No creation date')}
                  {SampleTextyLine('Received by Lab', sample.receivedDate ?
                      `${moment(sample.receivedDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.receivedBy ? sample.receivedBy.name : 'an unknown person'}`
                      : 'Not yet received by lab')}
                  {SampleTextyLine('Analysis Started', sample.analysisStartDate ?
                      `${moment(sample.analysisStartDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.analysisStartedBy ? sample.analysisStartedBy.name : 'an unknown person'}`
                      : 'Analysis not yet started')}
                  {SampleTextyLine('Result Logged', sample.analysisDate ?
                      `${moment(sample.analysisDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.analysisRecordedBy ? sample.analysisRecordedBy.name : 'an unknown person'}`
                      : 'Result not yet logged')}
                  {SampleTextyLine('Result Verified', sample.verifyDate ?
                      `${moment(sample.verifyDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.verifiedBy ? sample.verifiedBy.name : 'an unknown person'}`
                      : 'Result not yet verified')}
                </div>
              </Grid>
            </Grid>
            {job.waAnalysis && <div className={classes.informationBox}>
              <div className={classes.heading}>Soil Concentrations</div>
              <AsbestosSampleWASummary sample={sample} noEdit moisture={sampleMoisture} acmInSoilLimit={job.acmInSoilLimit ? parseFloat(job.acmInSoilLimit) : 0.01}/>
            </div>}
          </DialogContent>}
          <DialogActions>
            {(!modalPropsSecondary || modalPropsSecondary.noNext === undefined) &&
              <span><Button onClick={() => this.previousSample(samples)} color="inherit" disabled={samples[0].uid == sample.uid}>Previous</Button>
              <Button onClick={() => this.nextSample(samples)} color="secondary" disabled={samples[samples.length - 1].uid == sample.uid}>Next</Button></span>}
            <Button onClick={() => {
              if (modalType === ASBESTOS_SAMPLE_DETAILS) this.props.hideModal();
                else {
                  this.props.resetSampleView();
                  this.props.hideModalSecondary();
                }
              }} color="primary">OK</Button>
          </DialogActions>
        </Dialog>}
        </div>
      );
    } else return null;
  }

  getLayerRow = (num) => {
    let layer = {};
    let colors = {};
    let sample = this.props.modalProps.doc;

    if (sample.layers && sample.layers[`layer${num}`]) {
      layer = sample.layers[`layer${num}`];
      colors = getSampleColors(layer.result);
    }

    const styles = reactCSS({
      'default': {
        color: {
          width: '14',
          height: '14px',
          borderRadius: '12px',
          background: `rgba(${ layer.color ? layer.color.r : null }, ${ layer.color ? layer.color.g : null }, ${ layer.color ? layer.color.b : null }, ${ layer.color ? layer.color.a : null })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
      },
    });

    return(
      <div key={num} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', width: '100%', padding: 6,}}>
        <div style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `rgba(${ layer.color ? layer.color.r : null }, ${ layer.color ? layer.color.g : null }, ${ layer.color ? layer.color.b : null }, ${ layer.color ? layer.color.a : null })`,
            marginRight: 10,
            color: "#fff",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            fontWeight: "bold"
          }}>
          {num}
        </div>
        <div style={{width: '25%'}}>
          {layer.description ? `${layer.description.charAt(0).toUpperCase()}${layer.description.slice(1)}` : 'No description'}
        </div>
        <div style={{ width: '20%'}}>
          {writeShorthandResult(layer.result)}
        </div>
        <div style={{ width: '30%'}}>
          {layer.concentration && `Approx. ${layer.concentration}% asbestos content`}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleDetailsModal)
);
