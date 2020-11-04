import React from "react";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  collateSamples,
  issueDocument
} from "../../../../actions/asbestosReportHelpers";
import InputLabel from "@material-ui/core/InputLabel";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";

import RefreshIcon from "@material-ui/icons/Sync";

import { quillModules } from "../../../../actions/helpers";
import {
  writeExecutiveSummary,
  writeWhereIsTheHazard,
  writeRiskToHealth,
  writeBackground,
  writeRecommendations
} from "../../../../actions/asbestosReportHelpers";

function ExecutiveSummaryAmp(props) {
  const {
    job,
    siteUid,
    site,
    staff,
    onChange,
    template,
    classes,
    siteAcm,
    that
  } = props;
  return (
    <div>
      <div className={classes.flexRowSpread}>
        <InputLabel className={classes.marginTopSmall}>
          Executive Summary
        </InputLabel>
        <Tooltip title="Refresh automatic content">
          <IconButton
            onClick={() => {
              let content = writeExecutiveSummary(job, siteAcm, template);
              that.setState({ executiveSummary: content });
              props.onChange({
                job,
                field: "executiveSummary",
                val: content,
                siteUid
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <ReactQuill
        value={that.state.executiveSummary || job.executiveSummary || ""}
        modules={quillModules}
        className={classes.marginBottomMedium}
        theme="snow"
        onChange={(content, delta, source) => {
          if (source === "user") {
            that.setState({ executiveSummary: content });
            props.onChange({
              job,
              field: "executiveSummary",
              val: content,
              siteUid
            });
          }
        }}
      />

      <div className={classes.flexRowSpread}>
        <InputLabel className={classes.marginTopSmall}>
          Where is the Hazard?
        </InputLabel>
        <Tooltip title="Refresh automatic content">
          <IconButton
            onClick={() => {
              let content = writeWhereIsTheHazard(job, siteAcm, template);
              that.setState({ whereIsTheHazard: content });
              props.onChange({
                job,
                field: "whereIsTheHazard",
                val: content,
                siteUid
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <ReactQuill
        value={that.state.whereIsTheHazard || job.whereIsTheHazard || ""}
        modules={quillModules}
        className={classes.marginBottomMedium}
        theme="snow"
        onChange={(content, delta, source) => {
          if (source === "user") {
            console.log(content);
            that.setState({ whereIsTheHazard: content });
            props.onChange({
              job,
              field: "whereIsTheHazard",
              val: content,
              siteUid
            });
          }
        }}
      />

      <div className={classes.flexRowSpread}>
        <InputLabel className={classes.marginTopSmall}>
          Risk to Health
        </InputLabel>
        <Tooltip title="Refresh automatic content">
          <IconButton
            onClick={() => {
              let content = writeRiskToHealth(job, siteAcm, template);
              that.setState({ riskToHealth: content });
              props.onChange({
                job,
                field: "riskToHealth",
                val: content,
                siteUid
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <ReactQuill
        value={that.state.riskToHealth || job.riskToHealth || ""}
        modules={quillModules}
        className={classes.marginBottomMedium}
        theme="snow"
        onChange={(content, delta, source) => {
          if (source === "user") {
            console.log(content);
            that.setState({ riskToHealth: content });
            props.onChange({
              job,
              field: "riskToHealth",
              val: content,
              siteUid
            });
          }
        }}
      />

      <div className={classes.flexRowSpread}>
        <InputLabel className={classes.marginTopSmall}>Background</InputLabel>
        <Tooltip title="Refresh automatic content">
          <IconButton
            onClick={() => {
              let content = writeBackground(job, site, staff, template);
              that.setState({ background: content });
              props.onChange({
                job,
                field: "background",
                val: content,
                siteUid
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <ReactQuill
        value={that.state.background || job.background || ""}
        modules={quillModules}
        className={classes.marginBottomMedium}
        theme="snow"
        onChange={(content, delta, source) => {
          if (source === "user") {
            console.log(content);
            that.setState({ background: content });
            props.onChange({
              job,
              field: "background",
              val: content,
              siteUid
            });
          }
        }}
      />

      <div className={classes.flexRowSpread}>
        <InputLabel className={classes.marginTopSmall}>
          Immediate Actions Required
        </InputLabel>
        <Tooltip title="Refresh automatic content">
          <IconButton
            onClick={() => {
              let content = writeRecommendations(job, siteAcm, template);
              that.setState({
                immediateActionsRequired: content.immediateActionsRequired
              });
              props.onChange({
                job,
                field: "immediateActionsRequired",
                val: content.immediateActionsRequired,
                siteUid
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <ReactQuill
        value={
          that.state.immediateActionsRequired ||
          job.immediateActionsRequired ||
          ""
        }
        modules={quillModules}
        className={classes.marginBottomMedium}
        theme="snow"
        onChange={(content, delta, source) => {
          if (source === "user") {
            console.log(content);
            that.setState({ immediateActionsRequired: content });
            props.onChange({
              job,
              field: "immediateActionsRequired",
              val: content,
              siteUid
            });
          }
        }}
      />

      <div className={classes.flexRowSpread}>
        <InputLabel className={classes.marginTopSmall}>
          Removal or Treatment of Asbestos
        </InputLabel>
        <Tooltip title="Refresh automatic content">
          <IconButton
            onClick={() => {
              let content = writeRecommendations(job, siteAcm, template);
              that.setState({
                removalOrTreatmentOfAsbestos:
                  content.removalOrTreatmentOfAsbestos
              });
              props.onChange({
                job,
                field: "removalOrTreatmentOfAsbestos",
                val: content.removalOrTreatmentOfAsbestos,
                siteUid
              });
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <ReactQuill
        value={
          that.state.removalOrTreatmentOfAsbestos ||
          job.removalOrTreatmentOfAsbestos ||
          ""
        }
        modules={quillModules}
        className={classes.marginBottomMedium}
        theme="snow"
        onChange={(content, delta, source) => {
          if (source === "user") {
            console.log(content);
            that.setState({ removalOrTreatmentOfAsbestos: content });
            props.onChange({
              job,
              field: "removalOrTreatmentOfAsbestos",
              val: content,
              siteUid
            });
          }
        }}
      />
    </div>
  );
}

export default ExecutiveSummaryAmp;
