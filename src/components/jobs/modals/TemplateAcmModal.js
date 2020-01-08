import React from "react";
// import ReactDOM from 'react-dom';
// import { WithContext as ReactTags } from 'react-tag-input';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
// import store from '../../store';
import { TEMPLATE_ACM } from "../../../constants/modal-types";
import { sitesRef, storage, templateAcmRef } from "../../../config/firebase";
import "../../../config/tags.css";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "react-select";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
// import Geosuggest from 'react-geosuggest';
import ImageUploader from "react-images-upload";
import ImageTools from "../../../config/ImageTools";
import SuggestionField from "../../../widgets/SuggestionField";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import UploadIcon from "@material-ui/icons/CloudUpload";
import Go from "@material-ui/icons/ArrowForwardIos";
import Close from "@material-ui/icons/Close";
import {
  hideModal,
  handleModalChange,
  handleModalSubmit,
  resetModal,
  onUploadFile,
  setModalError
} from "../../../actions/modal";
import { fetchSites, getDetailedWFMJob } from "../../../actions/jobs";
import { getSampleColors, updateResultMap } from "../../../actions/asbestosLab";
import { getUserAttrs } from "../../../actions/local";
import {
  sendSlackMessage,
  numericAndLessThanOnly,
  quillModules
} from "../../../actions/helpers";
import { AsbButton, ScoreButton } from "../../../widgets/FormWidgets";
import _ from "lodash";
import classNames from "classnames";

import "../../../config/geosuggest.css";

const mapStateToProps = state => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    doc: state.modal.modalProps.doc,
    userRefName: state.local.userRefName,
    asbestosMaterialCategories: state.const.asbestosMaterialCategories,
    materialSuggestions: state.const.asbestosMaterialSuggestions,
    asbestosManagementOptions: state.const.asbestosManagementOptions
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSites: update => dispatch(fetchSites(update)),
    hideModal: () => dispatch(hideModal()),
    setModalError: e => dispatch(setModalError(e)),
    resetModal: () => dispatch(resetModal()),
    getDetailedWFMJob: info => dispatch(getDetailedWFMJob(info)),
    onUploadFile: (file, pathRef, prefix, imageQuality) =>
      dispatch(onUploadFile(file, pathRef, prefix, imageQuality)),
    handleModalChange: _.debounce(
      target => dispatch(handleModalChange(target)),
      300
    ),
    handleSelectChange: target => dispatch(handleModalChange(target)),
    handleModalSubmit: (doc, pathRef) =>
      dispatch(handleModalSubmit(doc, pathRef))
  };
};

class TemplateAcmModal extends React.Component {
  state = {
    asbestosType: {
      ch: true,
      am: true,
      cr: true
    }
  };

  deleteImage = () => {
    storage.ref(this.state.acmImageRef).delete();
    this.setState({ acmImageUrl: null, acmImageRef: null });
  };

  loadTemplate = () => {
    if (this.props.doc) {
      this.setState(this.props.doc);
    }
  };

  handleAsbestosType = res => {
    this.setState({
      asbestosType: updateResultMap(res, this.state.asbestosType)
    });
  };

  render() {
    const { modalProps, doc, classes } = this.props;
    const colors = getSampleColors({ result: this.state.asbestosType });
    console.log(this.state);
    return (
      <Dialog
        open={this.props.modalType === TEMPLATE_ACM}
        onClose={this.props.hideModal}
        onEnter={this.loadTemplate}
        fullWidth
        maxWidth={"sm"}
      >
        <DialogTitle>
          {modalProps.title ? modalProps.title : "Add ACM Template"}
        </DialogTitle>
        <DialogContent>
          <InputLabel>Template Name</InputLabel>
          <TextField
            value={
              this.state.templateName
                ? this.state.templateName
                : this.state.description && this.state.material
                ? `${this.state.description} ${this.state.material}`
                : this.state.description
                ? this.state.description
                : this.state.material
                ? this.state.material
                : ""
            }
            onChange={e => this.setState({ templateName: e.target.value })}
          />
          <InputLabel className={classes.marginTopSmall}>
            Item Description
          </InputLabel>
          <SuggestionField
            that={this}
            suggestions="descriptionSuggestions"
            value={this.state.description || ""}
            controlled
            onModify={value => this.setState({ description: value })}
          />

          <FormControlLabel
            className={classes.marginTopSmall}
            control={
              <Switch
                checked={this.state.inaccessibleItem || false}
                onClick={e => {
                  this.setState({ inaccessibleItem: e.target.checked });
                }}
                value="inaccessibleItem"
                color="secondary"
              />
            }
            label="Inaccessible Item"
          />

          {!this.state.inaccessibleItem && (
            <div>
              <InputLabel className={classes.marginTopSmall}>
                Material
              </InputLabel>
              <SuggestionField
                that={this}
                suggestions="materialSuggestions"
                value={this.state.material || ""}
                controlled
                onModify={value => {
                  let category = "",
                    asbestosType = this.state.asbestosType
                      ? this.state.asbestosType
                      : { ch: true, am: true, cr: true },
                    asbestosContent = this.state.asbestosContent
                      ? this.state.asbestosContent
                      : "",
                    materialObj = Object.values(
                      this.props.materialSuggestions
                    ).filter(e => e.label === value);
                  if (materialObj.length > 0) {
                    category = materialObj[0].category;
                    if (materialObj[0].asbestosType)
                      asbestosType = {
                        ch: materialObj[0].asbestosType.includes("ch"),
                        am: materialObj[0].asbestosType.includes("am"),
                        cr: materialObj[0].asbestosType.includes("cr")
                      };
                    if (materialObj[0].asbestosContent)
                      asbestosContent = parseInt(
                        materialObj[0].asbestosContent
                      );
                  }
                  this.setState({
                    material: value.trim(),
                    category,
                    asbestosType,
                    asbestosContent
                  });
                }}
              />
              <InputLabel className={classes.marginTopSmall}>
                Material Category
              </InputLabel>
              <Select
                className={classes.selectTight}
                value={
                  this.state.category
                    ? { value: this.state.category, label: this.state.category }
                    : { value: "", label: "" }
                }
                options={this.props.asbestosMaterialCategories.map(e => ({
                  value: e.label,
                  label: e.label
                }))}
                onChange={e => {
                  this.setState({ category: e.value });
                }}
              />
            </div>
          )}

          <InputLabel className={classes.marginTopSmall}>
            Default Accessibility Score
          </InputLabel>
          <div className={classes.flexRow}>
            {[
              {
                label: "Easy",
                color: "Ok",
                tooltip:
                  "May be disturbed during normal occupancy. Does not require any equipment to access."
              },
              {
                label: "Medium",
                color: "Warning",
                tooltip:
                  "Requires equipment (e.g. a ladder) to access. Within fuse boxes."
              },
              {
                label: "Difficult",
                color: "Bad",
                tooltip:
                  "Requires specialist equipment, dismantling of machinery or modification of the building to access."
              }
            ].map(res => {
              return ScoreButton(
                classes[
                  `colorsButton${
                    this.state.accessibility === res.label ? res.color : "Off"
                  }`
                ],
                classes[
                  `colorsDiv${
                    this.state.accessibility === res.label ? res.color : "Off"
                  }`
                ],
                res.label,
                res.tooltip,
                () => this.setState({ accessibility: res.label })
              );
            })}
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={this.state.genericItem || false}
                onClick={e => {
                  this.setState({ genericItem: e.target.checked });
                }}
                value="genericItem"
                color="secondary"
              />
            }
            label="Generic Item"
          />
          {this.state.genericItem && (
            <div>
              <InputLabel className={classes.marginTopSmall}>
                Default Blurb for Report
              </InputLabel>
              <ReactQuill
                value={this.state.genericItemBlurb || ""}
                modules={quillModules}
                theme="snow"
                className={classes.marginBottomMedium}
                onChange={(content, delta, source) => {
                  if (source === "user")
                    this.setState({ genericItemBlurb: content });
                }}
              />
            </div>
          )}

          <TextField
            id="extent"
            label="Default Extent"
            style={{ width: "100%" }}
            value={this.state.extent}
            onChange={e => this.setState({ extent: e.target.value })}
          />

          {!this.state.inaccessibleItem && (
            <div>
              <div className={classes.flexRowSpread}>
                <div>
                  <InputLabel className={classes.marginTopSmall}>
                    Default Product Score
                  </InputLabel>
                  <div className={classes.flexRow}>
                    {[
                      {
                        label: "1",
                        color: "Ok",
                        tooltip:
                          "Non-friable or low friability. Asbestos-reinforced composites. (Cement, vinyl tiles, plaster, plastics, mastics, etc.)"
                      },
                      {
                        label: "2",
                        color: "Warning",
                        tooltip:
                          "Medium friability (AIB, asbestos rope and textiles, paper-backed vinyl, gaskets, etc.)"
                      },
                      {
                        label: "3",
                        color: "Bad",
                        tooltip:
                          "Highly friable (ACD, loose asbestos, boiler or pipe lagging, sprayed asbestos, etc.)"
                      }
                    ].map(res => {
                      return ScoreButton(
                        classes[
                          `colorsButton${
                            this.state.productScore === res.label
                              ? res.color
                              : "Off"
                          }`
                        ],
                        classes[
                          `colorsDiv${
                            this.state.productScore === res.label
                              ? res.color
                              : "Off"
                          }`
                        ],
                        res.label,
                        res.tooltip,
                        () => this.setState({ productScore: res.label })
                      );
                    })}
                  </div>
                </div>

                <div>
                  <InputLabel className={classes.marginTopSmall}>
                    Default Surface Score
                  </InputLabel>
                  <div className={classes.flexRow}>
                    {[
                      {
                        label: "0",
                        color: "Benign",
                        tooltip:
                          "Composite materials (Reinforced plastics, resins, vinyl tiles, Bakelite, etc.)"
                      },
                      {
                        label: "1",
                        color: "Ok",
                        tooltip:
                          "Non-friable material, sealed moderately friable product or enclosed highly friable product."
                      },
                      {
                        label: "2",
                        color: "Warning",
                        tooltip:
                          "Encapsulated highly friable product or unsealed moderately friable product."
                      },
                      {
                        label: "3",
                        color: "Bad",
                        tooltip: "Unsealed highly friable product."
                      }
                    ].map(res => {
                      return ScoreButton(
                        classes[
                          `colorsButton${
                            this.state.surfaceScore === res.label
                              ? res.color
                              : "Off"
                          }`
                        ],
                        classes[
                          `colorsDiv${
                            this.state.surfaceScore === res.label
                              ? res.color
                              : "Off"
                          }`
                        ],
                        res.label,
                        res.tooltip,
                        () => this.setState({ surfaceScore: res.label })
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={classes.flexRowSpread}>
                <div>
                  <InputLabel className={classes.marginTopSmall}>
                    Default Asbestos Type
                  </InputLabel>
                  <div className={classes.flexRow}>
                    {["ch", "am", "cr"].map(res => {
                      return AsbButton(
                        classes[`colorsButton${colors[res]}`],
                        classes[`colorsDiv${colors[res]}`],
                        res,
                        () => this.handleAsbestosType(res)
                      );
                    })}
                  </div>
                </div>

                <div>
                  <InputLabel className={classes.marginTopSmall}>
                    Estimated Asbestos Concentration
                  </InputLabel>
                  <TextField
                    value={
                      this.state.asbestosContent
                        ? this.state.asbestosContent
                        : ""
                    }
                    style={{ width: "100%" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      )
                    }}
                    onChange={e => {
                      this.setState({
                        asbestosContent: numericAndLessThanOnly(
                          e.target.value,
                          1
                        )
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <InputLabel className={classes.marginTopSmall}>
            Default Comment for Report
          </InputLabel>
          <ReactQuill
            value={this.state.comment || ""}
            modules={quillModules}
            className={classes.marginBottomMedium}
            theme="snow"
            onChange={(content, delta, source) => {
              if (source === "user") this.setState({ comment: content });
            }}
          />

          <InputLabel className={classes.marginTopSmall}>
            Default Basic Primary Management
          </InputLabel>
          <Select
            className={classes.selectTight}
            value={
              this.state.managementPrimary
                ? {
                    value: this.state.managementPrimary,
                    label: this.state.managementPrimary
                  }
                : { value: "", label: "" }
            }
            options={this.props.asbestosManagementOptions.map(e => ({
              value: e.label,
              label: e.label
            }))}
            onChange={e => {
              this.setState({ managementPrimary: e.value });
            }}
          />

          <InputLabel className={classes.marginTopSmall}>
            Default Basic Secondary Management
          </InputLabel>
          <Select
            className={classes.selectTight}
            value={
              this.state.managementSecondary
                ? {
                    value: this.state.managementSecondary,
                    label: this.state.managementSecondary
                  }
                : { value: "", label: "" }
            }
            options={this.props.asbestosManagementOptions.map(e => ({
              value: e.label,
              label: e.label
            }))}
            onChange={e => {
              this.setState({ managementSecondary: e.value });
            }}
          />

          <InputLabel className={classes.marginTopSmall}>
            Default Management Recommendations
          </InputLabel>
          <ReactQuill
            value={this.state.recommendations || ""}
            modules={quillModules}
            theme="snow"
            className={classes.marginBottomMedium}
            onChange={(content, delta, source) => {
              if (source === "user")
                this.setState({ recommendations: content });
            }}
          />

          <InputLabel className={classes.marginTopSmall}>
            Thumbnail Image
          </InputLabel>
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
                    window.confirm("Are you sure you wish to delete the image?")
                  )
                    this.deleteImage();
                }}
              >
                <Close />
              </IconButton>
            </div>
          )}
          <label>
            <UploadIcon
              className={classNames(classes.hoverCursor, classes.colorAccent)}
            />
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
                  prefix: "siteImage",
                  imageQuality: 30,
                  imageHeight: 100
                });
              }}
            />
            <LinearProgress
              className={classes.formInputLarge}
              variant="determinate"
              value={modalProps.uploadProgress}
            />
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.resetModal} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() =>
              this.props.handleModalSubmit({
                doc: this.state,
                pathRef: templateAcmRef,
                docid: "random"
              })
            }
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
  )(TemplateAcmModal)
);
