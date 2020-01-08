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
  writeWhereIsTheHazard
} from "../../../../actions/asbestosReportHelpers";

function ExecutiveSummaryAmp(props) {
  const { job, siteUid, onChange, template, classes, siteAcm, that } = props;
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
    </div>
  );
}

export default ExecutiveSummaryAmp;
