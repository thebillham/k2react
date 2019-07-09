import React from "react";
import reactCSS from 'reactcss';
import { WithContext as ReactTags } from "react-tag-input";
import { withStyles } from "@material-ui/core/styles";
import { modalStyles } from "../../../config/styles";
import { connect } from "react-redux";
import store from "../../../store";
import { ASBESTOS_NONANALYST_DETAILS, } from "../../../constants/modal-types";
import { cocsRef, auth } from "../../../config/firebase";
import "../../../config/tags.css";

import { SampleTextyDisplay, SampleTextyLine, AsbButton, } from '../../../widgets/FormWidgets';
import { AsbestosClassification } from '../../../config/strings';

import { SketchPicker } from 'react-color';
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Divider from "@material-ui/core/Divider";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from "@material-ui/core/FormLabel";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import UploadIcon from "@material-ui/icons/CloudUpload";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import Good from "@material-ui/icons/ThumbUp";
import Half from "@material-ui/icons/ThumbsUpDown";
import Bad from "@material-ui/icons/ThumbDown";
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { addLog, } from "../../../actions/local";
import moment from "moment";
import {
  handleSampleChange,
  writeSoilDetails,
  getSampleColors,
  getBasicResult,
  analyticalCriteraOK,
  traceAnalysisRequired,
  writeShorthandResult,
  getWAAnalysisSummary,
  writeSampleConditioningList,
  writeSampleDimensions,
  collateLayeredResults,
  getConfirmResult,
} from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";
import _ from "lodash";

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '0',
};


const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    me: state.local.me,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
  };
};

class AsbestosSampleDetailsModal extends React.Component {
  render() {
    const { classes, modalProps, modalType } = this.props;
    let sample = modalProps.doc;
    let job = modalProps.job;

    let dates = job && job.dates ? job.dates.map(date => {
      let formatDate = date instanceof Date ? date : date.toDate();
      return moment(formatDate).format('D MMMM YYYY');
    }) : [];

    let analysisDate = "Not analysed";
    if (sample && sample.analysisDate) {
      analysisDate = sample.analysisDate instanceof Date ? sample.analysisDate : sample.analysisDate.toDate();
      analysisDate = moment(analysisDate).format('D MMMM YYYY');
    }

    let nz = moment.tz.setDefault("Pacific/Auckland");
    moment.tz.setDefault("Pacific/Auckland");
    moment.updateLocale('en', {
      // workingWeekdays: [1,2,3,4,5],
      workinghours: {
        0: null,
        1: ['08:30:00', '17:00:00'],
        2: ['08:30:00', '17:00:00'],
        3: ['08:30:00', '17:00:00'],
        4: ['08:30:00', '17:00:00'],
        5: ['08:30:00', '17:00:00'],
        6: null,
      },
      holidays: [],
    });

    let endTime = new Date();
    if (sample && sample.verifyDate) endTime = sample.verifyDate instanceof Date ? sample.verifyDate : sample.verifyDate.toDate();
    let timeInLab = sample && sample.receivedDate ? moment(endTime).diff(sample.receivedDate.toDate()) : null;

    let timeInLabBusiness = sample && sample.receivedDate ? moment(endTime).workingDiff(sample.receivedDate.toDate()) : null;
    console.log(timeInLab);
    console.log(timeInLabBusiness);

    let status = 'In Transit';
    if (sample) {
      if (sample.verified) status = 'Complete';
        else if (sample.analysisDate) status = 'Waiting on Verification';
        else if (sample.analysisStart) status = 'Analysis Started';
        else if (sample.receivedByLab) status = 'Received By Lab';
    }
    if (sample.onHold) status = status + " (ON HOLD)";
    let colors = getSampleColors(sample);
    let layersResult = null;
    let soilResult = null;
    if (sample.layers) layersResult = getConfirmResult({result: collateLayeredResults(sample.layers)}, sample);
    if (sample.waSoilAnalysis) soilResult = getConfirmResult({result: collateLayeredResults(sample.waSoilAnalysis)}, sample);

    const good = (<Good style={{ color: 'green', fontSize: 14, }}/>);
    const half = (<Bad style={{ color: 'orange', fontSize: 14, }}/>);
    const bad = (<Bad style={{ color: 'red', fontSize: 14, }}/>);

    return (
      <div>
      {job && sample &&
      <Dialog
        open={modalType === ASBESTOS_NONANALYST_DETAILS}
        onClose={this.props.hideModal}
        maxWidth="lg"
        fullWidth={true}
      >
        <DialogTitle>{`Analysis Details for Sample ${sample.jobNumber}-${sample.sampleNumber}`}</DialogTitle>
        {sample && <DialogContent>
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={6}>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Basic Information</div>
                {SampleTextyLine('Status', status.toUpperCase())}
                {SampleTextyLine('Generic Location',sample.genericLocation)}
                {SampleTextyLine('Specific Location',sample.specificLocation)}
                {SampleTextyLine('Short Description',sample.description)}
                {SampleTextyLine('Material', sample.material && sample.material.charAt(0).toUpperCase() + sample.material.slice(1))}
              </div>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Results</div>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 12, }}>
                  {AsbButton(colors,'ch',null)}
                  {AsbButton(colors,'am',null)}
                  {AsbButton(colors,'cr',null)}
                  {AsbButton(colors,'umf',null)}
                  {AsbButton(colors,'no',null)}
                  {AsbButton(colors,'org',null)}
                  {AsbButton(colors,'smf',null)}
                </div>
                {SampleTextyLine('Analyst', sample.analyst ? sample.analyst : "Not analysed")}
                {SampleTextyLine('Analysis Date', analysisDate)}
                {sample.analysisUser && sample.analysisUser.name !== sample.analyst && SampleTextyLine('Analysis Recorded By', sample.analysisUser.name)}
                {SampleTextyLine('Result Verified?', sample.verified ? 'Yes' : 'No')}
                {sample.verifyUser && SampleTextyLine('Result Verified By', sample.verifyUser.name)}
                {sample.layers && <div style={{ display: 'flex', flexDirection: 'row', }}>
                  <div style={{ width: '60%'}}>{SampleTextyLine('Sample Detail Results', writeShorthandResult(collateLayeredResults(sample.layers)))}</div>
                  <div style={{ width: '40%'}}>{(layersResult === 'yes' || layersResult === 'differentNonAsbestos') ? good : layersResult === 'no' ? bad : layersResult === 'none' ? '' : half}</div>
                </div>}
                {sample.waSoilAnalysis && <div style={{ display: 'flex', flexDirection: 'row', }}>
                  <div style={{ width: '60%'}}>{SampleTextyLine('WA Standard Results', writeShorthandResult(collateLayeredResults(sample.waSoilAnalysis)))}</div>
                  <div style={{ width: '40%'}}>{(soilResult === 'yes' || soilResult === 'differentNonAsbestos') ? good : soilResult === 'no' ? bad : soilResult === 'none' ? '' : half}</div>
                </div>}
                {sample.confirm && Object.keys(sample.confirm).map(key => {
                  if (sample.confirm[key] !== undefined && sample.confirm[key] !== undefined &&
                    sample.confirm[key].deleted !== true && sample.confirm[key].analyst !== undefined) {
                    let check = getConfirmResult(sample.confirm[key], sample);
                    return <div key={key} style={{ display: 'flex', flexDirection: 'row', }}>
                      <div style={{ width: '60%'}}>{SampleTextyLine(`Sample Check ${key}`, `${writeShorthandResult(sample.confirm[key].result)} (${sample.confirm[key].analyst})`)}</div>
                      <div style={{ width: '40%'}}>{(check === 'yes' || check === 'differentNonAsbestos') ? good : check === 'no' ? bad : check === 'none' ? '' : half}</div>
                    </div>
                  } else return null;
                })}
              </div>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Turnaround Times</div>
                {sample.receivedDate ? sample.verified ? SampleTextyLine('Turnaround Time', `${moment.utc(timeInLab).format('H:mm')}/${moment.utc(timeInLabBusiness).format('H:mm')}`)
                  : SampleTextyLine('Time In Lab', `${moment.utc(timeInLab).format('H:mm')}/${moment.utc(timeInLabBusiness).format('H:mm')}`)
                : SampleTextyLine('Turnaround Time', 'Not yet received by lab')}
              </div>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Sample History</div>
                {SampleTextyLine('Received by Lab', sample.receivedDate ?
                    `${moment(sample.receivedDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.receivedUser ? sample.receivedUser.name : 'an unknown person'}`
                    : 'Not yet received by lab')}
                {SampleTextyLine('Analysis Started', sample.analysisStartDate ?
                    `${moment(sample.analysisStartDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.analysisStartedby ? sample.analysisStartedby.name : 'an unknown person'}`
                    : 'Analysis not yet started')}
                {SampleTextyLine('Result Logged', sample.analysisDate ?
                    `${moment(sample.analysisDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.analysisUser ? sample.analysisUser.name : 'an unknown person'}`
                    : 'Result not yet logged')}
                {SampleTextyLine('Result Verified', sample.verifyDate ?
                    `${moment(sample.verifyDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.verifyUser ? sample.verifyUser.name : 'an unknown person'}`
                    : 'Result not yet verified')}
                {SampleTextyLine('Created', sample.createdDate ?
                    `${moment(sample.createdDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.createdBy ? sample.createdBy.name : 'an unknown person'}`
                    : 'No creation date')}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Sample Details</div>
                {SampleTextyLine('Sampling Personnel',
                  job.personnel && job.personnel.length > 0
                    ? job.personnel.join(", ")
                    : "Not specified")}
                {SampleTextyLine('Sampling Date(s)',
                  dates && dates.length > 0
                    ? dates.join(", ")
                    : "Not specified")}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  {SampleTextyDisplay('Weight Received',sample.weightReceived ? sample.weightReceived + 'g' : 'N/A')}
                  {SampleTextyDisplay('Weight Analysed',sample.weightAnalysed ? sample.weightAnalysed + 'g' : 'N/A')}
                  {SampleTextyDisplay('Weight Conditioned',sample.weightConditioned ? sample.weightConditioned + 'g' : 'N/A')}
                </div>
                {SampleTextyDisplay('Dimensions', writeSampleDimensions(sample))}
                {SampleTextyDisplay('Lab Sample Description',sample.labDescription ? sample.labDescription : 'N/A')}
                {SampleTextyDisplay('Lab Observations/Comments', sample.labComments ? sample.labComments : 'N/A')}
                {sample.soilDetails && SampleTextyDisplay('Geotechnical Soil Details', writeSoilDetails(sample.soilDetails))}
                {sample.layers &&
                  ((sample.layers[`layer1`] !== undefined && Object.keys(sample.layers[`layer1`].result).length > 0) ||
                  (sample.layers[`layer2`] !== undefined && Object.keys(sample.layers[`layer2`].result).length > 0) ||
                  (sample.layers[`layer3`] !== undefined && Object.keys(sample.layers[`layer3`].result).length > 0) ||
                  (sample.layers[`layer4`] !== undefined && Object.keys(sample.layers[`layer4`].result).length > 0) ||
                  (sample.layers[`layer5`] !== undefined && Object.keys(sample.layers[`layer5`].result).length > 0)) &&
                  SampleTextyDisplay('Layers', [...Array(sample.layerNum ? sample.layerNum : 5).keys()].filter(num => sample.layers[`layer${num+1}`] && sample.layers[`layer${num+1}`].description !== '' && sample.layers[`layer${num+1}`].description !== undefined).map(num => this.getLayerRow(num+1)))}
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
              <div className={classes.informationBox}>
                <div className={classes.heading}>Western Australian Standard</div>
                {getWAAnalysisSummary(sample)}
              </div>
            </Grid>
          </Grid>
        </DialogContent>}
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="primary">OK</Button>
        </DialogActions>
      </Dialog>}
      </div>
    );
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

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosSampleDetailsModal)
);
