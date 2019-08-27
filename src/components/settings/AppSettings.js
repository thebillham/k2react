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
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
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
    hint: 'Put each tag on a new line in the form "room name|room code".',
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
    fields: ['label','category'],
    fallBack: 'Other',
    hint: 'Put each material on a new line in the form "description|material category".',
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
    fields: ['label'],
    hint: 'Put each category on a new line.',
  },
  asbestosWhyNotSampledSuggestions: {
    label: 'Why Not Sampled Suggestions',
    value: 'asbestosWhyNotSampledSuggestions',
    group: 'acmAssessment',
    fields: ['label'],
    hint: 'Put each suggestion on a new line.',
  },
  noAsbestosResultReasons: {
    label: 'Reasons Why No Asbestos Result is Recorded',
    value: 'noAsbestosResultReasons',
    group: 'acmAssessment',
    fields: ['label','value'],
    noSort: true,
    hint: 'Put each suggestion on a new line in the form "label|value".',
  },

  // OTHER
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
    label: 'Survey Generic',
    options: Object.values(settings).filter(e => e.group === 'surveyGeneric').map(e => ({label: e.label, value: e.value})),
  },
  {
    label: 'ACM Assessment',
    options: Object.values(settings).filter(e => e.group === 'acmAssessment').map(e => ({label: e.label, value: e.value})),
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
      console.log(setting);
      let newMap = this.state.text
        .split("\n")
        .filter(Boolean);
      if (!setting.noSort) newMap = newMap.sort();
      newMap = newMap.map(option => {
          if (settings[setting].fields.length === 0) return option;
          else {
            let fields = settings[setting].fields;
            let valueList = option.split("|");
            let fieldMap = {};

            for (var i = 0; i < fields.length; i++) {
              fieldMap[fields[i]] = valueList[i] ? valueList[i] : settings[setting].fallBack ? settings[setting].fallBack : valueList[0];
            }
            console.log(fieldMap);

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
    const { doc, classes } = this.props;
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
              helperText={setting ? settings[setting].hint : ''}
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
