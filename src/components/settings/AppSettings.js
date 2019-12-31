import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { APP_SETTINGS } from "../../constants/modal-types";
import { appSettingsRef } from "../../config/firebase";
import "../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "react-select";

import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  handleTagDelete,
  handleTagAddition
} from "../../actions/modal";
import { getUserAttrs } from "../../actions/local";
import _ from "lodash";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    doc: state.const
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal()),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef)),
    handleTagDelete: tag => dispatch(handleTagDelete(tag)),
    handleTagAddition: tag => dispatch(handleTagAddition(tag)),
    getUserAttrs: _.debounce(userPath => dispatch(getUserAttrs(userPath)), 1000)
  };
};

const settings = {
  // APP CATEGORIES
  assetCategories: {
    label: 'Asset Categories',
    value: 'assetCategories',
    group: 'appCategories',
    fields: ['desc','key'],
    hint: 'Put each category on a new line in the form "category description|category key".',
  },
  documentCategories: {
    label: 'Document Categories',
    value: 'documentCategories',
    group: 'appCategories',
    fields: ['desc','key'],
    hint: 'Put each category on a new line in the form "category description|category key".',
  },
  incidentCategories: {
    label: 'Incident Categories',
    value: 'incidentCategories',
    group: 'appCategories',
    fields: ['desc','key'],
    hint: 'Put each category on a new line in the form "category description|category key".',
  },
  noticeCategories: {
    label: 'Notice Categories',
    value: 'noticeCategories',
    group: 'appCategories',
    fields: ['desc','key'],
    noSort: true,
    hint: 'Put each category on a new line in the form "category description|category key".',
  },
  toolCategories: {
    label: 'Tool Categories',
    value: 'toolCategories',
    group: 'appCategories',
    fields: ['desc','key'],
    hint: 'Put each category on a new line in the form "category description|category key".',
  },
  trainingCategories: {
    label: 'Training Categories',
    value: 'trainingCategories',
    group: 'appCategories',
    fields: ['desc','key'],
    hint: 'Put each category on a new line in the form "category description|category key".',
  },

  // TAG SUGGESTIONS
  docTagSuggestions: {
    label: 'Document Tag Suggestions',
    value: 'docTagSuggestions',
    group: 'tagSuggestions',
    fields: ['text','id'],
    hint: 'Put each tag on a new line in the form "tag name|tag id".',
  },
  quizTagSuggestions: {
    label: 'Quiz Tag Suggestions',
    value: 'quizTagSuggestions',
    group: 'tagSuggestions',
    fields: ['text','id'],
    hint: 'Put each tag on a new line in the form "tag name|tag id".',
  },

  // SITE
  siteTypes: {
    label: 'Site Types',
    value: 'siteTypes',
    group: 'sites',
    fields: ['label', 'value'],
    noSort: true,
    hint: 'Put each suggestion on a new line in the form "label|value".',
  },

  siteJobDescriptions: {
    label: 'Job Description Suggestions',
    value: 'siteJobDescriptions',
    group: 'sites',
    fields: ['label'],
    noSort: true,
    hint: 'Put each suggestion on a new line.',
  },

  siteVisitTypeAsbestos: {
    label: 'Site Visit Type Suggestions (Asbestos)',
    value: 'siteVisitTypeAsbestos',
    group: 'sites',
    fields: ['label','value'],
    noSort: true,
    hint: 'Put each visit type on a new line in the form "vist type name|visit type code".',
  },

  // SURVEY GENERIC

  genericLocationSuggestions: {
    label: 'Generic Location Suggestions',
    value: 'genericLocationSuggestions',
    group: 'surveyGeneric',
    fields: ['label','code'],
    hint: 'Put each tag on a new line in the form "room group name|room group code".',
  },
  specificLocationSuggestions: {
    label: 'Specific Location Suggestions',
    value: 'specificLocationSuggestions',
    group: 'surveyGeneric',
    fields: ['label','code'],
    hint: 'Put each suggestion on a new line in the form "room name|room code".',
  },
  buildingItems: {
    label: 'Building Items',
    value: 'buildingItems',
    group: 'surveyGeneric',
    fields: ['label','hint'],
    hint: 'Put each item on a new line in the form "item name|hint text"',
  },
  buildingMaterials: {
    label: 'Building Materials',
    value: 'buildingMaterials',
    group: 'surveyGeneric',
    fields: ['label'],
    hint: 'Put each material on a new line.',
  },
  extentSuggestions: {
    label: 'Extent Suggestions',
    value: 'extentSuggestions',
    group: 'surveyGeneric',
    fields: ['label'],
    hint: 'Put each suggestion on a new line',
  },
  damageSuggestions: {
    label: 'Damage Suggestions',
    value: 'damageSuggestions',
    group: 'surveyGeneric',
    fields: ['label'],
    hint: 'Put each suggestion on a new line',
  },

  // ACM ASSESSMENT
  asbestosDescriptionSuggestions: {
    label: 'Asbestos Description Suggestions',
    value: 'asbestosDescriptionSuggestions',
    group: 'acmAssessment',
    fields: ['label'],
    hint: 'Put each description on a new line.',
  },
  asbestosMaterialSuggestions: {
    label: 'Asbestos Material Suggestions',
    value: 'asbestosMaterialSuggestions',
    group: 'acmAssessment',
    fields: ['label','category','asbestosType','asbestosContent'],
    fallBack: [null,'Other',null,null],
    hint: 'Put each material on a new line in the form "description|material category|asbestos type|asbestos content (%)".',
  },
  asbestosMaterialCategories: {
    label: 'Asbestos Material Categories',
    value: 'asbestosMaterialCategories',
    group: 'acmAssessment',
    fields: ['label'],
    hint: 'Put each material category on a new line',
  },
  asbestosSurfaceSuggestions: {
    label: 'Surface Treatment Suggestions',
    value: 'asbestosSurfaceSuggestions',
    group: 'acmAssessment',
    fields: ['label'],
    hint: 'Put each suggestion on a new line',
  },
  asbestosAccessibilitySuggestions: {
    label: 'Accessibility Suggestions',
    value: 'asbestosAccessibilitySuggestions',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosProductScores: {
    label: 'Product Scores',
    value: 'asbestosProductScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosSurfaceScores: {
    label: 'Surface Scores',
    value: 'asbestosSurfaceScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosDamageScores: {
    label: 'Damage Scores',
    value: 'asbestosDamageScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriMainActivityScores: {
    label: 'Main Activity Scores',
    value: 'asbestosPriMainActivityScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriSecondaryActivityScores: {
    label: 'Secondary Activity Scores',
    value: 'asbestosPriSecondaryActivityScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriLocationScores: {
    label: 'Location Scores',
    value: 'asbestosPriLocationScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriAccessibilityScores: {
    label: 'Accessibility Scores',
    value: 'asbestosPriAccessibilityScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriExtentScores: {
    label: 'Extent Scores',
    value: 'asbestosPriExtentScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriOccupantsScores: {
    label: 'Occupant Scores',
    value: 'asbestosPriOccupantsScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriUseFreqScores: {
    label: 'Use Frequency Scores',
    value: 'asbestosPriUseFreqScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriAvgTimeScores: {
    label: 'Average Time Scores',
    value: 'asbestosPriAvgTimeScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriMaintTypeScores: {
    label: 'Maintenance Type Scores',
    value: 'asbestosPriMaintTypeScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosPriMaintFreqScores: {
    label: 'Maintenance Frequency Scores',
    value: 'asbestosPriMaintFreqScores',
    group: 'acmAssessment',
    fields: ['label', 'color', 'tooltip',],
    noSort: true,
    hint: 'Put each score on a new line in the form "label|color|tooltip".',
  },
  asbestosWhyNotSampledSuggestions: {
    label: 'Why Not Sampled Suggestions',
    value: 'asbestosWhyNotSampledSuggestions',
    group: 'acmAssessment',
    fields: ['label'],
    hint: 'Put each suggestion on a new line.',
  },
  asbestosInSoilSuggestions: {
    label: 'Asbestos in Soil Suggestions',
    value: 'asbestosInSoilSuggestions',
    group: 'acmAssessment',
    fields: ['label'],
    hint: 'Put each suggestion on a new line.',
  },
  asbestosInSoilConcentrations: {
    label: 'Asbestos in Soil Concentrations',
    value: 'asbestosInSoilConcentrations',
    group: 'acmAssessment',
    fields: ['label','value'],
    noSort: true,
    hint: 'Put each option on a new line in the form "label|value".',
  },
  asbestosInSoilForms: {
    label: 'Asbestos in Soil Forms',
    value: 'asbestosInSoilForms',
    group: 'acmAssessment',
    fields: ['label','value'],
    noSort: true,
    hint: 'Put each option on a new line in the form "label|value".',
  },
  acmInSoilLimits: {
    label: 'ACM in Soil Limits',
    value: 'acmInSoilLimits',
    group: 'acmAssessment',
    fields: ['label','value','heading','description'],
    noSort: true,
    hint: 'Put each option on a new line in the form "label|value|heading|description".',
  },
  noAsbestosResultReasons: {
    label: 'Reasons Why No Asbestos Result is Recorded',
    value: 'noAsbestosResultReasons',
    group: 'acmAssessment',
    fields: ['label','value'],
    noSort: true,
    hint: 'Put each suggestion on a new line in the form "label|value".',
  },

  // ASBESTOS AIR

  airLocationSuggestions: {
    label: 'Air Test Location Suggestions',
    value: 'airLocationSuggestions',
    group: 'airTestingAsbestos',
    fields: ['label','code'],
    hint: 'Put each tag on a new line in the form "room name|room code".',
  },

  airTestDescriptions: {
    label: 'Air Test Descriptions',
    value: 'airTestDescriptions',
    group: 'airTestingAsbestos',
    fields: ['label'],
    hint: 'Put each test description on a new line.',
  },

  // OTHER
  asbestosRemovalists: {
    label: 'Asbestos Removalists',
    value: 'asbestosRemovalists',
    group: 'other',
    fields: ['label','value'],
    hint: 'Put each suggestion on a new line in the form "name|class A licence number|class B licence number".',
  },

  permissions:  {
    label: 'App Permissions',
    value: 'permissions',
    group: 'other',
    fields: ['name','desc'],
    hint: 'Put each permission on a new line in the form "permission name|permission description".',
  },

  jobDescriptions:  {
    label: 'Job Descriptions',
    value: 'jobDescriptions',
    group: 'other',
    fields: [],
    hint: 'Put each job description on a new line.',
  },
  offices:  {
    label: 'Offices',
    value: 'offices',
    group: 'other',
    fields: [],
    hint: 'Put each office on a new line.',
  },
  officeContacts:  {
    label: 'Office Contacts',
    value: 'officeContacts',
    group: 'other',
    fields: ['name','workphone'],
    hint: 'Put each contact on a new line in the form "contact name|contact phone".',
  },
  menuItems: {
    label: 'Menu Items',
    value: 'menuItems',
    group: 'other',
    fields: [],
    hint: 'Enter each menu item on a new line.',
  },
  otherOptions: {
    label: 'Other Options',
    value: 'otherOptions',
    group: 'other',
    fields: ['option','value'],
    hint: 'Set option to true or false.',
  },
  appVersion: {
    label: 'App Version',
    value: 'appVersion',
    group: 'other',
    fields: [],
    hint: 'Enter the app version e.g. 1.2.6',
  },
};

const settingTypes = [
  {
    label: 'App Categories',
    options: Object.values(settings).filter(e => e.group === 'appCategories').map(e => ({label: e.label, value: e.value})),
  },
  {
    label: 'Tag Suggestions',
    options: Object.values(settings).filter(e => e.group === 'tagSuggestions').map(e => ({label: e.label, value: e.value})),
  },
  {
    label: 'Sites',
    options: Object.values(settings).filter(e => e.group === 'sites').map(e => ({label: e.label, value: e.value}))
  },
  {
    label: 'Survey Generic',
    options: Object.values(settings).filter(e => e.group === 'surveyGeneric').map(e => ({label: e.label, value: e.value})),
  },
  {
    label: 'ACM Assessment',
    options: Object.values(settings).filter(e => e.group === 'acmAssessment').map(e => ({label: e.label, value: e.value})),
  },
  {
    label: 'Asbestos Air Testing',
    options: Object.values(settings).filter(e => e.group === 'airTestingAsbestos').map(e => ({label: e.label, value: e.value})),
  },
  {
    label: 'Other Settings',
    options: Object.values(settings).filter(e => e.group === 'other').map(e => ({label: e.label, value: e.value})),
  }
];

class AppSettings extends React.Component {
  state = {
    setting: null,
    text: '',
  };

  reset = () => {
    this.setState({
      setting: null,
      text: '',
    });
    this.props.hideModal();
  }

  saveText = setting => {
    if (setting) {
      // console.log(setting);
      // console.log(this.state.text);
      let newMap = this.state.text
        .split("\n")
        .filter(Boolean);
      // console.log(newMap);
      // console.log(settings[setting]);
      if (!settings[setting].noSort) newMap = newMap.sort();
      // console.log(newMap);
      newMap = newMap.map(option => {
          if (settings[setting].fields.length === 0) return option;
          else {
            let fields = settings[setting].fields;
            let valueList = option.split("|");
            let fieldMap = {};

            for (var i = 0; i < fields.length; i++) {
              fieldMap[fields[i]] = valueList[i] ? valueList[i] : settings[setting].fallBack ? settings[setting].fallBack[i] ? settings[setting].fallBack[i] : settings[setting].fallBack[0] : valueList[0];
            }
            return fieldMap;
          }
        });
      console.log(newMap);

      appSettingsRef.doc('constants').set({ ...this.props.doc, [setting]: newMap });
    }
  }

  handleSelect = (setting, prevSetting) => {
    this.saveText(prevSetting);

    this.setState({
      setting: setting,
      text: this.props.doc[setting] ? this.props.doc[setting]
        .map(obj => {
          if (settings[setting].fields.length === 0) return obj;
          else {
            let fieldList = [];
            settings[setting].fields.forEach(field => {
              fieldList.push(obj[field]);
            });
            return fieldList.join('|');
          }
        })
        .join("\n") : ''
    });
  }

  render() {
    const { classes } = this.props;
    const { setting, text } = this.state;

    return (
      <Dialog
        open={this.props.modalType === APP_SETTINGS}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>App Settings</DialogTitle>
        <DialogContent>
          <FormGroup className={classes.dialogField}>
            <InputLabel shrink>App Setting</InputLabel>
            <Select
              options={settingTypes}
              onChange={e => this.handleSelect(e.value, setting)}
            />
            <TextField
              multiline
              InputProps={{
                classes: {
                  input: classes.textSpaced,
                },
              }}
              value={text}
              helperText={setting && settings[setting] ? settings[setting].hint : ''}
              className={classes.dialogFieldTall}
              onChange={e => this.setState({ text: e.target.value })}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.reset();
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.saveText(this.state.setting);
              this.reset();
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AppSettings)
);
