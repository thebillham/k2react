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

import { SampleTextyDisplay, SampleTextyLine, } from '../../../widgets/FormWidgets';
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
import { hideModal, showModalSecondary, } from "../../../actions/modal";
import { addLog, } from "../../../actions/local";
import moment from "moment";
import {
  handleSampleChange,
  writeSoilDetails,
  getSampleColours,
  analyticalCriteraOK,
  traceAnalysisRequired,
} from "../../../actions/asbestosLab";
import {
  asbestosSamplesRef
} from "../../../config/firebase";
import _ from "lodash";

const defaultColor = {
  r: '150',
  g: '150',
  b: '150',
  a: '1',
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

class AsbestosNonanalystDetailsModal extends React.Component {
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
        else if (sample.analysisDate) status = 'Waiting on Analysis Verification';
        else if (sample.analysisStart) status = 'Analysis Started';
        else if (sample.receivedByLab) status = 'Received By Lab';
    }

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
        <DialogContent>
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={6}>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Basic Information</div>
                {SampleTextyLine('Status', status)}
                {SampleTextyLine('Generic Location',sample.genericLocation)}
                {SampleTextyLine('Specific Location',sample.specificLocation)}
                {SampleTextyLine('Short Description',sample.description)}
                {SampleTextyLine('Material', sample.material.charAt(0).toUpperCase() + sample.material.slice(1))}
                {SampleTextyLine('Sampling Personnel',
                  job.personnel && job.personnel.length > 0
                    ? job.personnel.join(", ")
                    : "Not specified")}
                {SampleTextyLine('Sampling Date(s)',
                  dates && dates.length > 0
                    ? dates.join(", ")
                    : "Not specified")}
                {SampleTextyLine('Analyst', sample.analyst ? sample.analyst : "Not analysed")}
                {SampleTextyLine('Analysis Date', analysisDate)}
              </div>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Turnaround Times</div>
                {sample.receivedDate ? sample.verified ? SampleTextyLine('Turnaround Time', `${moment.utc(timeInLab).format('H:mm')}/${moment.utc(timeInLabBusiness).format('H:mm')}`)
                  : SampleTextyLine('Time In Lab', `${moment.utc(timeInLab).format('H:mm')}/${moment.utc(timeInLabBusiness).format('H:mm')}`)
                : SampleTextyLine('Turnaround Time', 'Not yet received by lab')}
              </div>
              <div className={classes.informationBox}>
                <div className={classes.heading}>Sample History</div>
                {SampleTextyLine('Received by Lab', sample.receivedByLab ?
                    `${moment(sample.receivedDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.receivedUser ? sample.receivedUser.name : 'an unknown person'}`
                    : 'Not yet received by lab')}
                {SampleTextyLine('Analysis Started', sample.analysisStart ?
                    `${moment(sample.analysisStartDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.analysisStartedby ? sample.analysisStartedby.name : 'an unknown person'}`
                    : 'Analysis not yet started')}
                {SampleTextyLine('Result Logged', sample.analysisDate ?
                    `${moment(sample.analysisDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.analysisUser ? sample.analysisUser.name : 'an unknown person'}`
                    : 'Result not yet logged')}
                {SampleTextyLine('Result Verified', sample.verified ?
                    `${moment(sample.verifyDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by ${sample.verifyUser ? sample.verifyUser.name : 'an unknown person'}`
                    : 'Result not yet verified')}
                <div>
                  <span>Created at {moment(sample.createdDate.toDate()).format("h:mma, dddd, D MMMM YYYY")} by {sample.createdBy ? <span>{sample.createdBy.name}</span>
                  :<span>an unknown person</span>}</span>
                </div>
              </div>
              <div className={classes.informationBox}>
                {SampleTextyDisplay('Lab Sample Description',sample.labDescription ? sample.labDescription : 'N/A')}
                {SampleTextyDisplay('Lab Observations/Comments', sample.labComments ? sample.labComments : 'N/A')}
                {sample.soilDetails && SampleTextyDisplay('Geotechnical Soil Details', writeSoilDetails(sample.soilDetails))}
              </div>
              {SampleTextyDisplay('Sample Description',sample.labDescription)}
              {SampleTextyDisplay('Lab Comments',sample.labComments)}
            </Grid>
            <Grid item xs={6}>
            </Grid>
          </Grid>
          <Grid container alignItems='flex-start' justify='flex-end'>
            <Grid item xs={5}>
              <div className={this.props.classes.subheading}>Classification</div>
              {traceAnalysisRequired(sample)}
              {analyticalCriteraOK(sample)}
            </Grid>
          </Grid>
          <Divider />
          <Grid container>
            <Grid item xs={12}>
              {[...Array(sample && sample.layerNum ? sample.layerNum : 5).keys()].map(num => {
                return this.getLayerRow(num+1);
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.hideModal()} color="primary">OK</Button>
        </DialogActions>
      </Dialog>}
      </div>
    );
  }

  getLayerRow = (num) => {
    let layer = {};
    let colours = {};
    let sample = this.props.modalProps.doc;

    if (sample.layers && sample.layers[`layer${num}`]) {
      layer = sample.layers[`layer${num}`];
      colours = getSampleColours(layer.result);
    }

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
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
        popover: {
          position: 'fixed',
          top: '45%',
          left: '45%',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return(
      <div key={num} style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }} className={this.props.classes.hoverItem}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#aaa",
            marginRight: 10,
            color: "#fff",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            fontWeight: "bold"
          }}
        >
          {num}
        </div>
        <TextField
          id={`l${num}Description`}
          label="Material description"
          style={{ width: '30%', marginRight: 14, }}
          value={layer.description ? layer.description : ''}
          onChange={null}
        />

        <div style={{ marginRight: 12,}}>
          <div style={ styles.swatch }>
            <div style={ styles.color } />
          </div>
        </div>
        <TextField
          id={`l${num}Concentration`}
          label="Asbestos %"
          style={{ marginRight: 14, }}
          value={layer.concentration ? layer.concentration : 0}
          onChange={null}
        />
        <div
          style={{
            backgroundColor: colours.chDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Chrysotile (white) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.chColor }}
              onClick={null}
            >
              CH
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colours.amDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Amosite (brown) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.amColor }}
              onClick={null}
            >
              AM
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colours.crDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Crocidolite (blue) asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.crColor }}
              onClick={null}
            >
              CR
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colours.umfDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Unidentified mineral fibres detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.umfColor }}
              onClick={null}
            >
              UMF
            </Button>
          </Tooltip>
        </div>
        <div style={{ width: 40, }} />
        <div
          style={{
            backgroundColor: colours.noDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='No asbestos detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.noColor }}
              onClick={null}
            >
              NO
            </Button>
          </Tooltip>
        </div>
        <div style={{ width: 40, }} />
        <div
          style={{
            backgroundColor: colours.orgDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Organic fibres detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.orgColor }}
              onClick={null}
            >
              ORG
            </Button>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: colours.smfDivColor,
            borderRadius: 14,
          }}
        >
          <Tooltip title='Synthetic mineral fibres or MMMF detected'>
            <Button
              variant="outlined"
              style={{ margin: 5, color: colours.smfColor }}
              onClick={null}
            >
              SMF
            </Button>
          </Tooltip>
        </div>
    </div>
    );
  }
}

export default withStyles(modalStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosNonanalystDetailsModal)
);
