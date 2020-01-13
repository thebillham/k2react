import React from "react";
import classNames from "classnames";
import moment from "moment";
import {
  writeDescription,
  getAirSampleData
} from "../../../actions/asbestosLab";
import { dateOf, numericOnly, titleCase } from "../../../actions/helpers";
import { ASBESTOS_SAMPLE_EDIT_COC } from "../../../constants/modal-types";
import SuggestionField from "../../../widgets/SuggestionField";
import Select from "react-select";

import { DateTimePicker } from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import EditIcon from "@material-ui/icons/Edit";

function AsbestoSampleListAir(props) {
  const {
    classes,
    doc,
    i,
    disabled,
    names,
    sampleType,
    onEdit,
    listType,
    that
  } = props;
  let sample =
    doc && doc.samples && doc.samples[i + 1] ? doc.samples[i + 1] : {};
  let calcs = {};
  if (
    (sample.initialFlowRate && sample.finalFlowRate) ||
    (sample.startTime && sample.endTime)
  )
    calcs = getAirSampleData(sample);
  // console.log(calcs);
  // console.log(sample);
  // console.log(doc);

  return listType === "heading" ? (
    <div>
      <div className={classNames(classes.flexRow, classes.headingInline)}>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall} />
        <div className={classes.columnMed}>Location</div>
        <div className={classes.columnSmall} />
        <div className={classes.columnDoubleSmall}>Flow Rates (mL/min)</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall}>Average Rate</div>
        <div className={classes.columnDoubleMedSmall}>Times</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmallCentered}>Run Time</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMed}>Sample Volume</div>
        <div className={classes.spacerSmall} />
        {doc.historicalCoc && (
          <div className={classes.columnSmall}>Fibre Result</div>
        )}
        {doc.historicalCoc && (
          <div className={classes.columnSmall}>Reported Concentration</div>
        )}
        <div className={classes.columnMedLargeCentered}>Sampling Errors</div>
      </div>
      <div className={classNames(classes.flexRow, classes.infoLight)}>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmall} />
        <div className={classes.columnMed} />
        <div className={classes.columnSmall} />
        <div className={classes.columnSmallCentered}>Initial</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnSmallCentered}>Final</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall} />
        <div className={classes.columnMedSmallCentered}>Start</div>
        <div className={classes.columnMedSmallCentered}>Finish</div>
        <div className={classes.spacerSmall} />
        <div className={classes.columnMedSmall} />
        <div className={classes.spacerSmall} />
        <div className={classes.columnMed} />
        <div className={classes.spacerSmall} />
        {doc.historicalCoc && <div className={classes.columnSmall} />}
        {doc.historicalCoc && <div className={classes.columnSmall} />}
        <div className={classes.columnMedLarge} />
      </div>
    </div>
  ) : listType === "editable" ? (
    <div
      className={classNames(
        classes.paddingTopBottomSmall,
        classes.flexRowHover
      )}
      key={i}
    >
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall}>
        <div
          className={
            disabled ? classes.circleShadedDisabled : classes.circleShaded
          }
        >
          {i + 1}
        </div>
      </div>
      <div className={classNames(classes.paddingSidesSmall, classes.columnMed)}>
        <SuggestionField
          that={that}
          suggestions="airLocationSuggestions"
          defaultValue={sample.specificLocation ? sample.specificLocation : ""}
          disabled={disabled}
          onModify={value => {
            that.setState({ modified: true });
            that.props.handleSampleChange(i, {
              specificLocation: titleCase(value.trim())
            });
          }}
        />
      </div>
      <div className={classes.columnSmall} />
      <div className={classes.columnSmall}>
        <TextField
          value={sample.initialFlowRate ? sample.initialFlowRate : ""}
          onChange={e => {
            that.setState({ modified: true });
            that.props.handleSampleChange(i, {
              initialFlowRate: numericOnly(e.target.value.trim())
            });
          }}
        />
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall}>
        <TextField
          value={sample.finalFlowRate ? sample.finalFlowRate : ""}
          onChange={e => {
            that.setState({ modified: true });
            that.props.handleSampleChange(i, {
              finalFlowRate: numericOnly(e.target.value.trim())
            });
          }}
        />
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnMedSmall}>
        {sample.initialFlowRate && sample.finalFlowRate ? (
          <span
            className={
              calcs.differenceTooHigh
                ? classes.informationBoxError
                : calcs.sampleRateLow || calcs.sampleRateHigh
                ? classes.informationBoxWarning
                : classes.informationBoxOk
            }
          >
            {calcs.averageFlowRate
              ? `${parseFloat(calcs.averageFlowRate).toFixed(1)} mL/min`
              : ""}
          </span>
        ) : (
          <span />
        )}
      </div>
      <div className={classes.columnMedSmall}>
        <DateTimePicker
          value={sample.startTime ? sample.startTime : null}
          autoOk
          format="D/MM/YY, hh:mma"
          disabled={disabled}
          clearable
          openTo="year"
          views={["year", "month", "date", "hours", "minutes"]}
          onChange={date => {
            that.setState({ modified: true });
            that.props.handleSampleChange(i, { startTime: dateOf(date) });
          }}
        />
      </div>
      <div className={classes.columnMedSmall}>
        <DateTimePicker
          value={sample.endTime ? sample.endTime : null}
          autoOk
          format="D/MM/YY, hh:mma"
          disabled={disabled}
          clearable
          openTo="year"
          views={["year", "month", "date", "hours", "minutes"]}
          onChange={date => {
            that.setState({ modified: true });
            that.props.handleSampleChange(i, {
              endTime: dateOf(date),
              totalRunTime: null
            });
          }}
        />
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnMedSmall}>
        <TextField
          value={sample.totalRunTime ? sample.totalRunTime : calcs.runTime}
          InputProps={{
            endAdornment: <InputAdornment position="end">mins</InputAdornment>
          }}
          onChange={e => {
            that.setState({ modified: true });
            that.props.handleSampleChange(i, {
              totalRunTime: numericOnly(e.target.value.trim())
            });
          }}
        />
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnMed}>
        {calcs.sampleVolume ? (
          <span
            className={
              calcs.sampleVolumeMuchTooLow
                ? classes.informationBoxError
                : calcs.sampleVolumeTooLow
                ? classes.informationBoxWarning
                : classes.informationBoxOk
            }
          >
            {`${parseFloat(calcs.sampleVolume).toFixed(1)}L`}
          </span>
        ) : (
          ""
        )}
      </div>
      {doc.historicalCoc && (
        <div className={classes.columnSmall}>
          <TextField
            value={sample.fibreResult || ""}
            onChange={e => {
              that.setState({ modified: true });
              that.props.handleSampleChange(i, {
                fibreResult: numericOnly(e.target.value.trim())
              });
            }}
          />
        </div>
      )}
      {doc.historicalCoc && <div className={classes.columnSmall} />}
      <div className={classes.columnMedLarge}>
        {calcs.differenceTooHigh || calcs.sampleVolumeMuchTooLow ? (
          <div className={classes.boldRed}>
            {calcs.differenceTooHigh && (
              <Tooltip title="The difference between flow rates is greater than 10 per cent. The sample must be rejected.">
                <div>Difference between flow rates is too high.</div>
              </Tooltip>
            )}
            {calcs.sampleVolumeMuchTooLow && (
              <Tooltip title="Sample volumes of less than 100L are not recommended because of the increased loss of precision in the results obtained. They may also lead to higher reporting limits than may be desired.">
                <div>Sample volume too low to be accurate.</div>
              </Tooltip>
            )}
          </div>
        ) : calcs.sampleRateLow ||
          calcs.sampleRateHigh ||
          calcs.sampleVolumeTooLow ? (
          <div className={classes.boldOrange}>
            {calcs.sampleRateLow && (
              <Tooltip title="Flow rates of less than 400 mL/min may preclude countable fibres from being collected from the airborne dust cloud.">
                <div>Flow rate lower than recommended.</div>
              </Tooltip>
            )}
            {calcs.sampleRateHigh && (
              <Tooltip title="Flow rates greater than 8000 mL/min may result in interference from excessively large particles and may also cause leakage problems for most available filter holders.">
                <div>Flow rate higher than recommended.</div>
              </Tooltip>
            )}
            {calcs.sampleVolumeTooLow && (
              <Tooltip title="Asbestos clearance air tests must have a sample volume of 360L or greater.">
                <div>Sample volume too low for clearances.</div>
              </Tooltip>
            )}
          </div>
        ) : calcs.runTime && calcs.averageFlowRate ? (
          <div className={classes.boldGreen}>
            No Sampling Errors or Warnings
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  ) : sampleType === "air" ? (
    <div
      className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover}
      key={i}
    >
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall}>
        <div
          className={
            disabled ? classes.circleShadedDisabled : classes.circleShaded
          }
        >
          {i + 1}
        </div>
      </div>
      <div className={classNames(classes.paddingSidesSmall, classes.columnMed)}>
        {sample.specificLocation ? sample.specificLocation : ""}
      </div>
      <div className={classes.columnSmall} />
      <div className={classes.columnSmallCentered}>
        {sample.initialFlowRate
          ? `${parseFloat(sample.initialFlowRate).toFixed(1)} mL/min`
          : ""}
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmallCentered}>
        {sample.finalFlowRate
          ? `${parseFloat(sample.finalFlowRate).toFixed(1)} mL/min`
          : ""}
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnMedSmallCentered}>
        {sample.averageFlowRate ? (
          <span
            className={
              sample.differenceTooHigh
                ? sample.informationBoxError
                : sample.sampleRateLow || sample.sampleRateHigh
                ? classes.informationBoxWarning
                : classes.informationBoxOk
            }
          >
            {`${parseFloat(sample.averageFlowRate).toFixed(1)} mL/min`}
          </span>
        ) : (
          ""
        )}
      </div>
      <div className={classes.columnMedSmallCentered}>
        {sample.startTime
          ? moment(dateOf(sample.startTime)).format("D/MM/YY, hh:mma")
          : ""}
      </div>
      <div className={classes.columnMedSmallCentered}>
        {sample.endTime
          ? moment(dateOf(sample.endTime)).format("D/MM/YY, hh:mma")
          : ""}
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnMedSmallCentered}>
        {sample.runTime ? `${sample.runTime} mins` : ""}
      </div>
      <div className={classes.spacerSmall} />
      <div className={classes.columnMedCentered}>
        {sample.sampleVolume ? (
          <span
            className={
              sample.sampleVolumeMuchTooLow
                ? classes.informationBoxError
                : sample.sampleVolumeTooLow
                ? classes.informationBoxWarning
                : classes.informationBoxOk
            }
          >
            {`${parseFloat(sample.sampleVolume).toFixed(1)}L`}
          </span>
        ) : (
          ""
        )}
      </div>
      {doc.historicalCoc && (
        <div className={classes.columnSmall}>{sample.fibreResult || ""}</div>
      )}
      {doc.historicalCoc && (
        <div className={classes.columnSmall}>
          {calcs.reportConcentration ? (
            <div
              className={
                calcs.reportConcentration.includes("<")
                  ? classes.informationBoxOk
                  : calcs.informationBoxError
              }
            >
              {calcs.reportConcentration}
            </div>
          ) : (
            ""
          )}
        </div>
      )}
      <div className={classes.columnMedLarge}>
        {!disabled && (
          <IconButton onClick={onEdit}>
            <EditIcon className={classes.iconRegular} />
          </IconButton>
        )}
      </div>
    </div>
  ) : (
    <div
      className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover}
      key={i}
    >
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall}>
        <div
          className={
            disabled ? classes.circleShadedDisabled : classes.circleShaded
          }
        >
          {i + 1}
        </div>
      </div>
      <div
        className={classNames(
          classes.paddingSidesSmall,
          classes.columnMedSmall
        )}
      >
        {sample.specificLocation ? sample.specificLocation : "Untitled"} (Air
        Sample)
      </div>
    </div>
  );
}

export default AsbestoSampleListAir;
