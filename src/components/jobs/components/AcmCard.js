import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { TEMPLATE_ACM } from "../../../constants/modal-types";
import { sitesRef, storage, templateAcmRef, } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import Select from 'react-select';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
// import Geosuggest from 'react-geosuggest';
import ImageUploader from 'react-images-upload';
import ImageTools from '../../../config/ImageTools';
import SuggestionField from '../../../widgets/SuggestionField';

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import UploadIcon from "@material-ui/icons/CloudUpload";
import Go from '@material-ui/icons/ArrowForwardIos';
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  resetModal,
  onUploadFile,
  setModalError,
} from "../../../actions/modal";
import { fetchSites, getDetailedWFMJob, } from '../../../actions/jobs';
import { getSampleColors, updateResultMap, writeDescription, } from '../../../actions/asbestosLab';
import { getUserAttrs, } from "../../../actions/local";
import { sendSlackMessage, numericAndLessThanOnly, } from '../../../actions/helpers';
import { AsbButton, ScoreButton, } from '../../../widgets/FormWidgets';
import _ from "lodash";
import classNames from 'classnames';

import '../../../config/geosuggest.css';

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    siteCocs: state.jobs.siteCocs,
    siteJobs: state.jobs.siteJobs,
    samples: state.asbestosLab.samples,
    asbestosMaterialCategories: state.const.asbestosMaterialCategories,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
    asbestosManagementOptions: state.const.asbestosManagementOptions,

    asbestosAccessibilitySuggestions: state.const.asbestosAccessibilitySuggestions,

    // Material Risk
    asbestosProductScores: state.const.asbestosProductScores,
    asbestosSurfaceScores: state.const.asbestosSurfaceScores,
    asbestosDamageScores: state.const.asbestosDamageScores,

    // Activity
    asbestosPriMainActivityScores: state.const.asbestosPriMainActivityScores,
    asbestosPriSecondaryActivityScores: state.const.asbestosPriSecondaryActivityScores,

    // Disturbance
    asbestosPriLocationScores: state.const.asbestosPriLocationScores,
    asbestosPriAccessibilityScores: state.const.asbestosPriAccessibilityScores,
    asbestosPriExtentScores: state.const.asbestosPriExtentScores,

    // Exposure
    asbestosPriOccupantsScores: state.const.asbestosPriOccupantsScores,
    asbestosPriUseFreqScores: state.const.asbestosPriUseFreqScores,
    asbestosPriAvgTimeScores: state.const.asbestosPriAvgTimeScores,

    // Maintenance
    asbestosPriMaintTypeScores: state.const.asbestosPriMaintTypeScores,
    asbestosPriMaintFreqScores: state.const.asbestosPriMaintFreqScores,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSites: update => dispatch(fetchSites(update)),
    hideModal: () => dispatch(hideModal()),
    setModalError: e => dispatch(setModalError(e)),
    resetModal: () => dispatch(resetModal()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    onUploadFile: (file, pathRef, prefix, imageQuality) => dispatch(onUploadFile(file, pathRef, prefix, imageQuality)),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
  };
};

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    // [{ 'direction': 'rtl' }],                         // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    // [{ 'font': [] }],
    [{ align: [] }],

    ["image"],

    ["clean"] // remove formatting button
  ]
  // imageResize: {
  //   parchment: Quill.import('parchment'),
  // },
  // imageDrop: true,
};

const initState = {
  asbestosType: {
    ch: true,
    am: true,
    cr: true,
  },
  acmRemoved: false,
  acmRemovalJob: "",
  accessibility: "Easy",
  asbestosContent: "",
  category: "",
  comment: "",
  description: "",
  genericItem: false,
  genericItemBlurb: "",
  idKey: "p",
  inaccessibleItem: false,
  managementPrimary: "",
  managementSecondary: "",
  material: "",
  productScore: "1",
  room: {label: "", uid: ""},
  sample: null,
  surfaceScore: "1",
  templateName: "",
  uid: null,
  sampleType: 'bulk',
}

class AcmCard extends React.Component {
  state = initState;

  deleteImage = () => {
    storage.ref(this.state.acmImageRef).delete();
    this.setState({acmImageUrl: null, acmImageRef: null});
  };

  handleAsbestosType = res => {
    this.setState({
      asbestosType: updateResultMap(res, this.state.asbestosType)
    });
  }

  UNSAFE_componentWillMount() {
    console.log('mount');
    this.loadAcm();
  }

  componentWillUnmount() {
    console.log('unmount');
    this.saveAcm(this.state);
  }

  loadAcm = () => {
    console.log('loading');
    if (this.props.item) {
      let item = {...this.props.item};
      if (item.sample) {
        let cocUid = item.sample.cocUid,
          sampleNumber = item.sample.sampleNumber;
        if (this.props.samples && this.props.samples[cocUid] && this.props.samples[cocUid][sampleNumber]) {
          item.sample = this.props.samples[cocUid][sampleNumber];
          if (this.props.samples[cocUid][sampleNumber].sampleType) item.sampleType = this.props.samples[cocUid][sampleNumber].sampleType
        }
      }
      console.log(item);
      this.setState({...initState, ...item})
    }
  }

  saveAcm = item => {
    console.log('saving');
    sitesRef.doc(this.props.site).collection('acm').doc(item.uid).update(item);
  }

  render() {
    console.log(this.props.const);
    const { modalProps, item, classes } = this.props;
    const colors = getSampleColors({ result: this.state.asbestosType });
    if (item.uid !== this.state.uid) {
      this.saveAcm(this.state);
      this.loadAcm();
    }
    let samples = {};
    this.props.siteCocs && this.props.siteCocs[this.props.site] && Object.keys(this.props.siteCocs[this.props.site]).forEach(k => {
      if (this.props.samples && this.props.samples[k])
        Object.values(this.props.samples[k]).forEach(m => {
          samples[m.uid] = m;
        });
    });
    const negative = (this.state.sample && this.state.sample.result && this.state.sample.result.no);
    console.log(this.state);
    return (
      <Card>
        { item.sampleType === 'air' ?
          <CardContent className={classes.minHeightDialog90}>
            <div className={classes.heading}>{`${this.state.room ? this.state.room.label : ''} Air Sample`}</div>
            <InputLabel className={classes.marginTopSmall}>Sample Number</InputLabel>
            <Select
              className={classes.selectTight}
              value={this.state.sample ?
                {value: this.state.sample,
                label: `${this.state.sample.jobNumber}-${this.state.sample.sampleNumber}: ${writeDescription(this.state.sample)}`} : {value: '', label: ''}}
              options={Object.values(samples).filter(e => e.sampleType === 'air').map(e => ({ value: e || null, label: e ? `${e.jobNumber}-${e.sampleNumber}: ${writeDescription(e)}` : null }))}
              onChange={e => {
                this.setState({sample: e.value});
              }}
            />
            <InputLabel className={classes.marginTopSmall}>Concentration</InputLabel>
            {this.state.sample.reportConcentration ? <div className={this.state.sample.reportConcentration.includes("<") ? classes.informationBoxOk : classes.informationBoxError}>
              {this.state.sample.reportConcentration}
            </div> : ''}
          </CardContent>
        :
          <CardContent>
            <div className={classes.heading}>{this.state.room && this.state.room.label}</div>
            <InputLabel>Item Description</InputLabel>
            <SuggestionField that={this} suggestions='descriptionSuggestions'
              controlled
              value={this.state.description ? this.state.description : ''}
              onModify={value => this.setState({ description: value})} />

            <FormControlLabel
              className={classes.marginTopSmall}
              control={
                <Switch
                  checked={this.state.inaccessibleItem || false}
                  onClick={e => { this.setState({ inaccessibleItem: e.target.checked })}}
                  value="inaccessibleItem"
                  color="secondary"
                />
              }
              label="Inaccessible Item"
            />

            {!this.state.inaccessibleItem && <div>
              <InputLabel className={classes.marginTopSmall}>Material</InputLabel>
              <SuggestionField that={this} suggestions='materialSuggestions'
                controlled
                value={this.state.material ? this.state.material : ''}
                onModify={(value) => {
                  let category = '',
                    asbestosType = this.state.asbestosType ? this.state.asbestosType : { ch: true, am: true, cr: true },
                    asbestosContent = this.state.asbestosContent ? this.state.asbestosContent : '',
                    materialObj = Object.values(this.props.materialSuggestions).filter(e => e.label === value);
                  if (materialObj.length > 0) {
                    category = materialObj[0].category;
                    if (materialObj[0].asbestosType) asbestosType = { ch: materialObj[0].asbestosType.includes('ch'), am: materialObj[0].asbestosType.includes('am'), cr: materialObj[0].asbestosType.includes('cr'), };
                    if (materialObj[0].asbestosContent) asbestosContent = parseInt(materialObj[0].asbestosContent);
                  }
                  this.setState({material: value ? value.trim() : null, category, asbestosType, asbestosContent, });
                }}
              />
              <InputLabel className={classes.marginTopSmall}>Material Category</InputLabel>
              <Select
                className={classes.selectTight}
                value={this.state.category ? {value: this.state.category, label: this.state.category} : {value: '', label: ''}}
                options={this.props.asbestosMaterialCategories.map(e => ({ value: e.label, label: e.label }))}
                onChange={e => {
                  this.setState({category: e.value});
                }}
              />
            </div>}

            <InputLabel className={classes.marginTopSmall}>Identification</InputLabel>
            <div className={classes.flexRow}>
              {[{
                label: 'Presumed',
                value: 'p',
                color: 'Warning',
                tooltip: 'Default.',
              },{
                label: 'Strongly Presumed',
                value: 's',
                color: 'StrongWarning',
                tooltip: 'Strongly presumed.',
              },{
                label: 'Sampled',
                value: 'i',
                color: negative ? 'Ok' : 'Bad',
                tooltip: 'Sampled.'
              }].map(res => {
                return ScoreButton(
                  classes[`colorsButton${this.state.idKey === res.value ? res.color : 'Off'}`],
                  classes[`colorsDiv${this.state.idKey === res.value ? res.color : 'Off'}`],
                  res.label,
                  res.tooltip,
                  () => this.setState({ idKey: res.value, })
                )
              })}
            </div>
            { (this.state.idKey === 'i' || this.state.idKey === 's') && <div>
              <InputLabel className={classes.marginTopSmall}>{this.state.idKey === 'i' ? 'Sample Number' : 'Presume As Sample'}</InputLabel>
              <Select
                className={classes.selectTight}
                value={this.state.sample ?
                  {value: this.state.sample,
                  label: `${this.state.sample.jobNumber}-${this.state.sample.sampleNumber}: ${writeDescription(this.state.sample)}`} : {value: '', label: ''}}
                options={Object.values(samples).filter(e => e.sampleType !== 'air').map(e => ({ value: e || null, label: e ? `${e.jobNumber}-${e.sampleNumber}: ${writeDescription(e)}` : null }))}
                onChange={e => {
                  this.setState({sample: e.value});
                }}
              />
            </div>}
            <InputLabel className={classes.marginTopSmall}>Extent</InputLabel>
            <SuggestionField that={this} suggestions='extentSuggestions'
              controlled
              value={this.state.extent || ''}
              onModify={value => this.setState({ extent: value})} />

            <div className={classes.flexRow}>
              <TextField
                id="extentNum"
                label="Extent Amount"
                style={{ width: '30%' }}
                value={this.state.extentNum}
                onChange={e => this.setState({ extentNum: numericAndLessThanOnly(e.target.value), })}
              />
              <Select
                className={classNames(classes.selectTight, classes.columnSmall)}
                value={this.state.extentNumUnits ?
                  { value: this.state.extentNumUnits,
                  label: this.state.extentNumUnits } : { value: 'm²', label: 'm²' }}
                options={['m²','m','lm','m³','items'].map(e => ({ value: e, label: e}))}
                onChange={e => {
                  this.setState({extentNumUnits: e.value});
                }}
              />
            </div>

            <FormControlLabel
              control={
                <Switch
                  checked={this.state.acmRemoved || false}
                  onClick={e => { this.setState({ acmRemoved: e.target.checked })}}
                  value="acmRemoved"
                  color="secondary"
                />
              }
              label="ACM Removed"
            />

            {this.state.acmRemoved && <div>
              <InputLabel className={classes.marginTopSmall}>Clearance Job</InputLabel>
              <Select
                className={classes.selectTight}
                value={this.state.acmRemovalJob ? { value: this.state.acmRemovalJob, label: this.props.siteJobs && this.props.siteJobs[this.props.site] && `${this.props.siteJobs[this.props.site][this.state.acmRemovalJob].jobNumber} ${this.props.siteJobs[this.props.site][this.state.acmRemovalJob].jobDescription}`} : { value: '', label: '' }}
                options={this.props.siteJobs && this.props.siteJobs[this.props.site] ? Object.values(this.props.siteJobs[this.props.site]).map(e => ({ value: e.uid, label: `${e.jobNumber} ${e.jobDescription}` })) : []}
                onChange={e => {
                  this.setState({acmRemovalJob: e.value});
                }}
              />
            </div>

            }

            {!negative && !this.state.acmRemoved && <div>

            <InputLabel className={classes.marginTopSmall}>Accessibility Score</InputLabel>
            <div className={classes.flexRow}>
              {this.props.asbestosAccessibilitySuggestions && this.props.asbestosAccessibilitySuggestions.map(res => {
                return ScoreButton(
                  classes[`colorsButton${this.state.accessibility === res.label ? res.color : 'Off'}`],
                  classes[`colorsDiv${this.state.accessibility === res.label ? res.color : 'Off'}`],
                  res.label,
                  res.tooltip,
                  () => this.setState({ accessibility: res.label, })
                )
              })}
            </div>

            <FormControlLabel
              control={
                <Switch
                  checked={this.state.genericItem || false}
                  onClick={e => { this.setState({ genericItem: e.target.checked })}}
                  value="genericItem"
                  color="secondary"
                />
              }
              label="Generic Item"
            />
            { this.state.genericItem &&
              <div>
                <InputLabel className={classes.marginTopSmall}>Blurb for Report</InputLabel>
                <ReactQuill
                  value={this.state.genericItemBlurb || ''}
                  modules={quillModules}
                  theme="snow"
                  className={classes.marginBottomMedium}
                  onChange={(content, delta, source) => {
                    if (source === "user") this.setState({ genericItemBlurb: content })
                  }}
                />
              </div>
            }

            {!this.state.inaccessibleItem && <div>
              <div className={classes.flexRowSpread}>
                <div>
                  <InputLabel className={classes.marginTopSmall}>Product Score</InputLabel>
                  <div className={classes.flexRow}>
                    {this.props.asbestosProductScores && this.props.asbestosProductScores.map(res => {
                      return ScoreButton(
                        classes[`colorsButton${this.state.productScore === res.label ? res.color : 'Off'}`],
                        classes[`colorsDiv${this.state.productScore === res.label ? res.color : 'Off'}`],
                        res.label,
                        res.tooltip,
                        () => this.setState({ productScore: res.label, })
                      )
                    })}
                  </div>
                </div>

                <div>
                  <InputLabel className={classes.marginTopSmall}>Surface Score</InputLabel>
                  <div className={classes.flexRow}>
                    {this.props.asbestosSurfaceScores && this.props.asbestosSurfaceScores.map(res => {
                      return ScoreButton(
                        classes[`colorsButton${this.state.surfaceScore === res.label ? res.color : 'Off'}`],
                        classes[`colorsDiv${this.state.surfaceScore === res.label ? res.color : 'Off'}`],
                        res.label,
                        res.tooltip,
                        () => this.setState({ surfaceScore: res.label, })
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className={classes.flexRowSpread}>
                <div>
                  <InputLabel className={classes.marginTopSmall}>Presumed Asbestos Type</InputLabel>
                  <div className={classes.flexRow}>
                    {['ch','am','cr'].map(res => {
                      return AsbButton(classes[`colorsButton${colors[res]}`], classes[`colorsDiv${colors[res]}`], res, () => this.handleAsbestosType(res))
                    })}
                  </div>
                </div>

                <div>
                  <InputLabel className={classes.marginTopSmall}>Estimated Asbestos Concentration</InputLabel>
                  <TextField
                    value={this.state.asbestosContent ? this.state.asbestosContent: ''}
                    style={{ width: '100%'}}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    onChange={e => {
                      this.setState({
                        asbestosContent: numericAndLessThanOnly(e.target.value, 1),
                      });
                    }}
                  />
                </div>
              </div>
            </div>}

            <InputLabel className={classes.marginTopSmall}>Comment for Report</InputLabel>
            <ReactQuill
              value={this.state.comment || ''}
              modules={quillModules}
              className={classes.marginBottomMedium}
              theme="snow"
              onChange={(content, delta, source) => {
                if (source === "user") this.setState({ comment: content })
              }}
            />

            <InputLabel className={classes.marginTopSmall}>Basic Primary Management</InputLabel>
            <Select
              className={classes.selectTight}
              value={this.state.managementPrimary ? {value: this.state.managementPrimary, label: this.state.managementPrimary} : {value: '', label: ''}}
              options={this.props.asbestosManagementOptions.map(e => ({ value: e.label, label: e.label }))}
              onChange={e => {
                this.setState({managementPrimary: e.value});
              }}
            />

              <InputLabel className={classes.marginTopSmall}>Basic Secondary Management</InputLabel>
              <Select
                className={classes.selectTight}
                value={this.state.managementSecondary ? {value: this.state.managementSecondary, label: this.state.managementSecondary} : {value: '', label: ''}}
                options={this.props.asbestosManagementOptions.map(e => ({ value: e.label, label: e.label }))}
                onChange={e => {
                  this.setState({managementSecondary: e.value});
                }}
              />

            <InputLabel className={classes.marginTopSmall}>Management Recommendations</InputLabel>
            <ReactQuill
              value={this.state.recommendations || ''}
              modules={quillModules}
              theme="snow"
              className={classes.marginBottomMedium}
              onChange={(content, delta, source) => {
                if (source === "user") this.setState({ recommendations: content })
              }}
            /></div>}

            <InputLabel className={classes.marginTopSmall}>Priority Risk Assessment</InputLabel>
            <InputLabel className={classes.marginTopSmall}>Activity</InputLabel>

            <div>
              <InputLabel className={classes.marginTopSmall}>Main Activity Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriMainActivityScores && this.props.asbestosPriMainActivityScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priMainActivityScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priMainActivityScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priMainActivityScore: this.state.priMainActivityScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <div>
              <InputLabel className={classes.marginTopSmall}>Secondary Activity Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriSecondaryActivityScores && this.props.asbestosPriSecondaryActivityScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priSecondaryActivityScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priSecondaryActivityScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priSecondaryActivityScore: this.state.priSecondaryActivityScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <InputLabel className={classes.marginTopSmall}>Disturbance</InputLabel>
            <div>
              <InputLabel className={classes.marginTopSmall}>Location Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriLocationScores && this.props.asbestosPriLocationScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priLocationScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priLocationScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priLocationScore: this.state.priLocationScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <div>
              <InputLabel className={classes.marginTopSmall}>Accessibility Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriAccessibilityScores && this.props.asbestosPriAccessibilityScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priAccessibilityScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priAccessibilityScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priAccessibilityScore: this.state.priAccessibilityScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <div>
              <InputLabel className={classes.marginTopSmall}>Extent Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriExtentScores && this.props.asbestosPriExtentScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priExtentScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priExtentScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priExtentScore: this.state.priExtentScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <InputLabel className={classes.marginTopSmall}>Exposure</InputLabel>
            <div>
              <InputLabel className={classes.marginTopSmall}>Occupants Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriOccupantsScores && this.props.asbestosPriOccupantsScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priOccupantScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priOccupantScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priOccupantScore: this.state.priOccupantScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <div>
              <InputLabel className={classes.marginTopSmall}>Use Frequency Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriUseFreqScores && this.props.asbestosPriUseFreqScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priUseFreqScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priUseFreqScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priUseFreqScore: this.state.priUseFreqScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <div>
              <InputLabel className={classes.marginTopSmall}>Average Time Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriAvgTimeScores && this.props.asbestosPriAvgTimeScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priAvgTimeScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priAvgTimeScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priAvgTimeScore: this.state.priAvgTimeScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <InputLabel className={classes.marginTopSmall}>Maintenance</InputLabel>
            <div>
              <InputLabel className={classes.marginTopSmall}>Maintenance Type Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriMaintTypeScores && this.props.asbestosPriMaintTypeScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priMaintTypeScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priMaintTypeScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priMaintTypeScore: this.state.priMaintTypeScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>

            <div>
              <InputLabel className={classes.marginTopSmall}>Maintenance Frequency Score</InputLabel>
              <div className={classes.flexRow}>
                {this.props.asbestosPriMaintFreqScores && this.props.asbestosPriMaintFreqScores.map(res => {
                  return ScoreButton(
                    classes[`colorsButton${this.state.priMaintFreqScore === res.label ? res.color : 'Off'}`],
                    classes[`colorsDiv${this.state.priMaintFreqScore === res.label ? res.color : 'Off'}`],
                    res.label,
                    res.tooltip,
                    () => this.setState({ priMaintFreqScore: this.state.priMaintFreqScore === res.label ? null : res.label, })
                  )
                })}
              </div>
            </div>



            <InputLabel className={classes.marginTopSmall}>Thumbnail Image</InputLabel>
            {this.state.siteImageUrl && (
              <div className={classes.marginTopSmall}>
                <img
                  src={this.state.acmImageUrl}
                  alt=""
                  width="200px"
                  style={{
                    opacity: "0.5",
                    borderStyle: "solid",
                    borderWidth: "2px"
                  }}
                />
                <IconButton
                  style={{
                    position: "relative",
                    top: "2px",
                    left: "-120px",
                    borderStyle: "solid",
                    borderWidth: "2px",
                    fontSize: 8
                  }}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you wish to delete the image?"
                      )
                    )
                      this.deleteImage();
                  }}
                >
                  <Close />
                </IconButton>
              </div>
            )}
            <label>
              <UploadIcon className={classNames(classes.hoverCursor, classes.colorAccent)} />
              <input
                id="attr_upload_file"
                type="file"
                style={{ display: "none" }}
                onChange={e => {
                  if (this.state.acmImageUrl) {
                    storage.ref(this.state.acmImageRef).delete();
                  }
                  this.props.onUploadFile({
                    file: e.currentTarget.files[0],
                    storagePath: "sites/",
                    prefix: 'siteImage',
                    imageQuality: 30,
                    imageHeight: 100,
                  });
                }}
              />
              <LinearProgress
                className={classes.formInputLarge}
                variant="determinate"
                value={modalProps.uploadProgress}
              />
            </label>
          </CardContent>
        }
      </Card>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AcmCard)
);
