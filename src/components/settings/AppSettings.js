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
import Select from "@material-ui/core/Select";

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
    doc: state.modal.modalProps.doc
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

class AppSettings extends React.Component {
  state = {
    setting: "asbestosmaterials"
  };

  render() {
    const { doc, classes } = this.props;
    const { setting } = this.state;
    const settingTypes = [
      "Asbestos Materials",
      "Building Items",
      "Building Materials",
      "Room Suggestions",
      "Extent Suggestions",
      "Damage Suggestions",
      "Incident Categories",
      "Surface Suggestions",
      "Why Not Sampled Suggestions",
      "Asbestos Types",
      "Skills List",
      "Generic Location Suggestions",
      "Specific Location Suggestions",
      "Asbestos Description Suggestions",
      "Asbestos Material Suggestions",
      "Document Tag Suggestions",
      "Quiz Tag Suggestions",
      "Asset Categories",
      "Document Categories",
      "Notice Categories",
      "Tool Categories",
      "Training Categories",
      "Job Descriptions",
      "Offices",
      "Office Contacts",
      "Permissions",
      "Reasons Why No Asbestos Result is Recorded",
    ];
    return (
      <Dialog
        open={this.props.modalType === APP_SETTINGS}
        onClose={() => this.props.hideModal}
      >
        <DialogTitle>App Settings</DialogTitle>
        <DialogContent>
          <form>
            <FormGroup>
              <FormControl className={classes.dialogField}>
                <InputLabel shrink>App Setting</InputLabel>
                <Select
                  onChange={e => {
                    this.setState({ setting: e.target.value });
                  }}
                  value={setting}
                  input={<Input name="setting" id="setting" />}
                >
                  {settingTypes.sort().map(setting => {
                    return (
                      <option key={setting} value={setting}>
                        {setting}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
              {setting === "Asbestos Materials" && (
                <TextField
                  id="asbestosmaterials"
                  label="Asbestos Materials"
                  multiline
                  defaultValue={
                    doc &&
                    doc.asbestosmaterials &&
                    doc.asbestosmaterials
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each material on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Building Materials" && (
                <TextField
                  id="buildingmaterials"
                  label="Building Materials"
                  multiline
                  defaultValue={
                    doc &&
                    doc.buildingmaterials &&
                    doc.buildingmaterials
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each material on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Building Items" && (
                <TextField
                  id="buildingitems"
                  label="Building Items"
                  multiline
                  defaultValue={
                    doc &&
                    doc.buildingitems &&
                    doc.buildingitems
                      .map(obj => {
                        return obj.hint == undefined ? `${obj.label}` : `${obj.label}|${obj.hint}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each item on a new line in the form "item name|hint text".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            hint: list[1] ? list[1] : list[0],
                            label: list[0]
                          };
                        })
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Skills List" && (
                <TextField
                  id="skillslist"
                  label="Skills List"
                  multiline
                  defaultValue={
                    doc &&
                    doc.buildingitems &&
                    doc.buildingitems
                      .map(obj => {
                        return obj.hint == undefined ? `${obj.label}` : `${obj.label}|${obj.hint}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each item on a new line in the form "item name|hint text".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            hint: list[1] ? list[1] : list[0],
                            label: list[0]
                          };
                        })
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Generic Location Suggestions" && (
                <TextField
                  id="genericLocationSuggestions"
                  label="Specific Location Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.genericLocationSuggestions &&
                    doc.genericLocationSuggestions
                      .map(obj => {
                        return `${obj.label}|${obj.code}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each tag on a new line in the form "room group name|room group code".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            code: list[1] ? list[1] : list[0],
                            label: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Specific Location Suggestions" && (
                <TextField
                  id="specificLocationSuggestions"
                  label="Specific Location Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.specificLocationSuggestions &&
                    doc.specificLocationSuggestions
                      .map(obj => {
                        return `${obj.label}|${obj.code}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each tag on a new line in the form "room name|room code".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            code: list[1] ? list[1] : list[0],
                            label: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Asbestos Description Suggestions" && (
                <TextField
                  id="asbestosDescriptionSuggestions"
                  label="Asbestos Description Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.asbestosDescriptionSuggestions &&
                    doc.asbestosDescriptionSuggestions
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each description on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Asbestos Material Suggestions" && (
                <TextField
                  id="asbestosMaterialSuggestions"
                  label="Asbestos Material Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.asbestosMaterialSuggestions &&
                    doc.asbestosMaterialSuggestions
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each material on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Room Suggestions" && (
                <TextField
                  id="roomsuggestions"
                  label="Room Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.roomsuggestions &&
                    doc.roomsuggestions
                      .map(obj => {
                        return `${obj.label}|${obj.code}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each tag on a new line in the form "room name|room code".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            code: list[1] ? list[1] : list[0],
                            label: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Extent Suggestions" && (
                <TextField
                  id="extentsuggestions"
                  label="Extent Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.extentsuggestions &&
                    doc.extentsuggestions
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each suggestion on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Damage Suggestions" && (
                <TextField
                  id="damagesuggestions"
                  label="Damage Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.damagesuggestions &&
                    doc.damagesuggestions
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each suggestion on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Surface Suggestions" && (
                <TextField
                  id="surfacesuggestions"
                  label="Surface Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.surfacesuggestions &&
                    doc.surfacesuggestions
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each suggestion on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Why Not Sampled Suggestions" && (
                <TextField
                  id="whynotsampledsuggestions"
                  label="Why Not Sampled Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.whynotsampledsuggestions &&
                    doc.whynotsampledsuggestions
                      .map(obj => {
                        return obj.label;
                      })
                      .join("\n")
                  }
                  helperText="Put each suggestion on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          return { label: option };
                        })
                    });
                  }}
                />
              )}

              {setting === "Asbestos Types" && (
                <TextField
                  disabled
                  id="asbestostypes"
                  label="Asbestos Types"
                  multiline
                  defaultValue={
                    doc &&
                    doc.asbestostypes &&
                    doc.asbestostypes
                      .map(obj => {
                        return obj;
                      })
                      .join("\n")
                  }
                  helperText="Put each type on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value.split("\n").filter(Boolean)
                    });
                  }}
                />
              )}

              {setting === "Document Tag Suggestions" && (
                <TextField
                  id="docTagSuggestions"
                  label="Document Tag Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.docTagSuggestions &&
                    doc.docTagSuggestions
                      .map(obj => {
                        return `${obj.text}|${obj.id}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each tag on a new line in the form "tag name|tag id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            id: list[1] ? list[1] : list[0],
                            text: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Asset Categories" && (
                <TextField
                  id="assetcategories"
                  label="Asset Categories"
                  multiline
                  defaultValue={
                    doc &&
                    doc.assetcategories &&
                    doc.assetcategories
                      .map(obj => {
                        return `${obj.desc}|${obj.key}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each category on a new line in the form "category description|category id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            key: list[1] ? list[1] : list[0],
                            desc: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Document Categories" && (
                <TextField
                  id="documentcategories"
                  label="Document Categories"
                  multiline
                  defaultValue={
                    doc &&
                    doc.documentcategories &&
                    doc.documentcategories
                      .map(obj => {
                        return `${obj.desc}|${obj.key}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each category on a new line in the form "category description|category id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            key: list[1] ? list[1] : list[0],
                            desc: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Notice Categories" && (
                <TextField
                  id="noticecategories"
                  label="Notice Categories"
                  multiline
                  defaultValue={
                    doc &&
                    doc.noticecategories &&
                    doc.noticecategories
                      .map(obj => {
                        return `${obj.desc}|${obj.key}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each category on a new line in the form "category description|category id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            key: list[1] ? list[1] : list[0],
                            desc: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Incident Categories" && (
                <TextField
                  id="incidentcategories"
                  label="Incident Categories"
                  multiline
                  defaultValue={
                    doc &&
                    doc.incidentcategories &&
                    doc.incidentcategories
                      .map(obj => {
                        return `${obj.desc}|${obj.key}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each category on a new line in the form "category description|category id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            key: list[1] ? list[1] : list[0],
                            desc: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Tool Categories" && (
                <TextField
                  id="toolcategories"
                  label="Tool Categories"
                  multiline
                  defaultValue={
                    doc &&
                    doc.toolcategories &&
                    doc.toolcategories
                      .map(obj => {
                        return `${obj.desc}|${obj.key}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each category on a new line in the form "category description|category id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            key: list[1] ? list[1] : list[0],
                            desc: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Training Categories" && (
                <TextField
                  id="trainingcategories"
                  label="Training Categories"
                  multiline
                  defaultValue={
                    doc &&
                    doc.trainingcategories &&
                    doc.trainingcategories
                      .map(obj => {
                        return `${obj.desc}|${obj.key}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each category on a new line in the form "category description|category id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            key: list[1] ? list[1] : list[0],
                            desc: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Job Descriptions" && (
                <TextField
                  id="jobdescriptions"
                  label="Job Descriptions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.jobdescriptions &&
                    doc.jobdescriptions
                      .map(obj => {
                        return obj;
                      })
                      .join("\n")
                  }
                  helperText="Put each job description on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                    });
                  }}
                />
              )}

              {setting === "Office Contacts" && (
                <TextField
                  id="officecontacts"
                  label="Office Contacts"
                  multiline
                  defaultValue={
                    doc &&
                    doc.officecontacts &&
                    doc.officecontacts
                      .map(obj => {
                        return `${obj.name}|${obj.workphone}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each contact on a new line in the form "contact name|contact phone".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            workphone: list[1] ? list[1] : list[0],
                            name: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Offices" && (
                <TextField
                  id="offices"
                  label="Offices"
                  multiline
                  defaultValue={
                    doc &&
                    doc.offices &&
                    doc.offices
                      .map(obj => {
                        return obj;
                      })
                      .join("\n")
                  }
                  helperText="Put each office on a new line."
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                    });
                  }}
                />
              )}

              {setting === "Permissions" && (
                <TextField
                  id="permissions"
                  label="Permissions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.permissions &&
                    doc.permissions
                      .map(obj => {
                        return `${obj.name}|${obj.desc}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each permission on a new line in the form "permission name|permission description".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map(option => {
                          let list = option.split("|");
                          return {
                            desc: list[1] ? list[1] : list[0],
                            name: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Quiz Tag Suggestions" && (
                <TextField
                  id="quiztags"
                  label="Quiz Tag Suggestions"
                  multiline
                  defaultValue={
                    doc &&
                    doc.quiztags &&
                    doc.quiztags
                      .map(obj => {
                        return `${obj.text}|${obj.id}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each tag on a new line in the form "tag name|tag id".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            id: list[1] ? list[1] : list[0],
                            text: list[0]
                          };
                        })
                    });
                  }}
                />
              )}

              {setting === "Reasons Why No Asbestos Result is Recorded" && (
                <TextField
                  id="noAsbestosResultReasons"
                  label="Reasons Why No Asbestos Result is Recorded"
                  multiline
                  defaultValue={
                    doc &&
                    doc.noAsbestosResultReasons &&
                    doc.noAsbestosResultReasons
                      .map(obj => {
                        return `${obj.label}|${obj.value}`;
                      })
                      .join("\n")
                  }
                  helperText='Put each tag on a new line in the form "reason label|reason value".'
                  className={classes.dialogField}
                  onChange={e => {
                    this.props.handleModalChange({
                      id: e.target.id,
                      value: e.target.value
                        .split("\n")
                        .filter(Boolean)
                        // .sort()
                        .map(option => {
                          let list = option.split("|");
                          return {
                            value: list[1] ? list[1] : list[0],
                            label: list[0]
                          };
                        })
                    });
                  }}
                />
              )}


            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.hideModal();
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              doc.uid = "constants";
              this.props.handleModalSubmit({
                doc: doc,
                pathRef: appSettingsRef
              });
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
