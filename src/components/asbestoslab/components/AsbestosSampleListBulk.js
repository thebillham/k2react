import React from "react";
import classNames from 'classnames';
import moment from "moment";
import { writeDescription, getSampleColors, writeShorthandResult, getBasicResult } from '../../../actions/asbestosLab';
import { dateOf, titleCase, sentenceCase, personnelConvert, } from '../../../actions/helpers';
import { ASBESTOS_SAMPLE_EDIT_COC, } from '../../../constants/modal-types';
import { AsbButton, } from '../../../widgets/FormWidgets';
import SuggestionField from '../../../widgets/SuggestionField';
import Select from 'react-select';
import {
  DatePicker,
} from "@material-ui/pickers";

import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

function AsbestoSampleListBulk(props) {
  const { classes, doc, i, disabled, names, sampleType, onEdit, listType, that  } = props;
  let sample = doc && doc.samples && doc.samples[i+1] ? doc.samples[i+1] : {};
  let colors = getSampleColors(sample);
  let basicResult = getBasicResult(sample);
  return listType === "heading" ?
  (<div>
    <div className={classNames(classes.flexRow, classes.headingInline)}>
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall} />
      <div className={classes.columnMedSmall}>
        Building or General Area
      </div>
      <div className={classes.columnMedSmall}>
        Room or Specific Area
      </div>
      <div className={classes.columnMedLarge}>
        Description
      </div>
      <div className={classes.columnMedLarge}>
        Material
      </div>
      <div className={classes.columnMedSmall}>
        Sample Category
      </div>
      {!doc.historicalCoc && <div className={classes.columnMedLarge}>
        Sampled By
      </div>}
      {!doc.historicalCoc && <div className={classes.columnMedSmall}>
        Sample Date
      </div>}
      {doc.historicalCoc &&
        <div className={classes.columnExtraLarge}>
          Result
        </div>
      }
      <div className={classes.columnSmall} />
    </div>
    <div className={classNames(classes.flexRow, classes.infoLight)}>
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall} />
      <div className={classes.columnMedSmall}>
        <span className={classes.note}>e.g. 1st Floor or Block A</span>
      </div>
      <div className={classes.columnMedSmall}>
        <span className={classes.note}>e.g. South elevation or Kitchen</span>
      </div>
      <div className={classes.columnMedLarge}>
        <span className={classes.note}>e.g. Soffit or Blue patterned vinyl flooring</span>
      </div>
      <div className={classes.columnMedLarge}>
        <span className={classes.note}>e.g. fibre cement or vinyl with paper backing</span>
      </div>
      <div className={classes.columnMedSmall} />
      {!doc.historicalCoc && <div className={classes.columnMedLarge} />}
      {!doc.historicalCoc && <div className={classes.columnMedSmall} />}
      {doc.historicalCoc &&
        <div className={classes.columnExtraLarge} />
      }
      <div className={classes.columnSmall} />
    </div>
  </div>)
  : listType === "editable" ?
  (<div className={classes.flexRowHover}>
    <div className={classes.spacerSmall} />
    <div className={classes.columnSmall}>
      <div className={classes.circleShaded}>
        {i+1}
      </div>
    </div>
    <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
      <SuggestionField that={that} suggestions='genericLocationSuggestions'
        value={sample.genericLocation ? sample.genericLocation : ''}
        disabled={disabled}
        addedSuggestions={that.state.recentSuggestionsGenericLocation}
        onModify={(value) => {
          that.setState({
            modified: true,
            recentSuggestionsGenericLocation: that.state.recentSuggestionsGenericLocation.concat(value),
          });
          that.props.handleSampleChange(i, {genericLocation: titleCase(value.trim())});
        }} />
    </div>
    <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
      <SuggestionField that={that} suggestions='specificLocationSuggestions'
        defaultValue={sample.specificLocation ? sample.specificLocation : ''}
        disabled={disabled}
        onModify={(value) => {
          that.setState({ modified: true, });
          that.props.handleSampleChange(i, {specificLocation: titleCase(value.trim())});
        }} />
    </div>
    <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
      <SuggestionField that={that} suggestions='descriptionSuggestions'
        defaultValue={sample.description ? sample.description : ''}
        disabled={disabled}
        onModify={(value) => {
          that.setState({ modified: true, });
          that.props.handleSampleChange(i, {description: sentenceCase(value.trim())});
        }} />
    </div>
    <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
      <SuggestionField that={that} suggestions='materialSuggestions'
        defaultValue={sample.material ? sample.material : ''}
        disabled={disabled}
        onModify={(value) => {
          let category = '';
            let materialObj = Object.values(that.props.materialSuggestions).filter(e => e.label === value);
            if (materialObj.length > 0) {
              category = materialObj[0].category;
            }
          // }
          that.setState({ modified: true, });
          that.props.handleSampleChange(i, {material: value.trim(), category});
        }} />
    </div>
    <div className={classes.columnMedSmall}>
      <Select
        className={classes.selectTight}
        value={sample.category ? {value: sample.category, label: sample.category} : {value: '', label: ''}}
        options={that.props.asbestosMaterialCategories.map(e => ({ value: e.label, label: e.label }))}
        isDisabled={disabled}
        onChange={e => {
          that.setState({ modified: true, });
          that.props.handleSampleChange(i, {category: e.value});
        }}
      />
    </div>
    {!doc.historicalCoc && <div className={classes.columnMedLarge}>
      <Select
        isMulti
        className={classes.selectTight}
        value={sample.sampledBy ? sample.sampledBy.map(e => ({value: e.uid, label: e.name})) : that.state.defaultSampledBy}
        options={names.map(e => ({ value: e.uid, label: e.name }))}
        isDisabled={disabled}
        onChange={e => {
          let defaultSampledBy = that.state.defaultSampledBy;
          let personnelSelected = that.state.personnelSelected;
          let sampledBy = personnelConvert(e);

          if (personnelSelected === false) {
            personnelSelected = i;
            defaultSampledBy = sampledBy.map(e => ({value: e.uid, label: e.name}));
          }
          // } else if (personnelSelected === i) {
          //   defaultSampledBy = sampledBy.map(e => ({value: e.uid, label: e.name}));
          // }

          // if (e.length === 0) {
          //   personnelSelected = false;
          //   defaultSampledBy = e;
          // }

          that.setState({ modified: true, personnelSelected, defaultSampledBy});
          that.props.handleSampleChange(i, {sampledBy});
        }}
      />
    </div>}
    {!doc.historicalCoc && <div className={classes.columnMedSmall}>
      <DatePicker
        value={sample.sampleDate !== undefined ? sample.sampleDate :
          that.state.defaultSampleDate}
        autoOk
        format="ddd, D MMMM YYYY"
        disabled={disabled}
        clearable
        onChange={date => {
          let defaultSampleDate = that.state.defaultSampleDate;
          let dateSelected = that.state.dateSelected;

          if (dateSelected === false) {
            dateSelected = i;
            defaultSampleDate = dateOf(date);
          }
          // } else if (dateSelected === i) {
          //   defaultSampleDate = dateOf(date);
          // }
          that.setState({ modified: true, dateSelected, defaultSampleDate});
          that.props.handleSampleChange(i, {sampleDate: dateOf(date)});
        }}
      />
    </div>}
    {doc.historicalCoc &&
      <div className={classNames(classes.flexRow, classes.columnExtraLarge)}>
        {['ch','am','cr','umf','no'].map(res => {
          return AsbButton(that.props.classes[`colorsButton${colors[res]}`], that.props.classes[`colorsDiv${colors[res]}`], res, () => that.handleResultClick(res, i))
        })}
      </div>
    }
    <div className={classes.columnSmall}>
      {/*<Tooltip title={'Add Detailed Sample Information e.g. In-Situ Soil Characteristics'}>
        <IconButton onClick={() =>
          that.props.showModalSecondary({
            modalType: ASBESTOS_SAMPLE_EDIT_COC,
            modalProps: {
              doc: doc,
              sample: doc.samples[i+1] ? {...doc.samples[i+1], sampleNumber: i+1, jobNumber: doc.jobNumber} : {jobNumber: doc.jobNumber, sampleNumber: i+1},
              names: names,
              onExit: (modified) => {
                that.setState({
                  modified: modified,
                });
                //console.log('On Exit: ' + modified);
            }}
          })}>
          <EditIcon className={classes.iconRegular}  />
        </IconButton>
      </Tooltip>*/}
    </div>
  </div>)
  : sampleType === "air" ?
    (<div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall}>
        <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
          {i+1}
        </div>
      </div>
      <div className={classNames(classes.paddingSidesSmall)}>
        {writeDescription(sample)} (Bulk Sample)
      </div>
    </div>)
    :
    (<div className={disabled ? classes.flexRowHoverDisabled : classes.flexRowHover} key={i}>
      <div className={classes.spacerSmall} />
      <div className={classes.columnSmall}>
        <div className={disabled ? classes.circleShadedDisabled : classes.circleShaded}>
          {i+1}
        </div>
      </div>
      <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
        {sample.genericLocation ? sample.genericLocation : ''}
      </div>
      <div className={classNames(classes.paddingSidesSmall, classes.columnMedSmall)}>
        {sample.specificLocation ? sample.specificLocation : ''}
      </div>
      <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
        {sample.description ? sample.description : ''}
      </div>
      <div className={classNames(classes.paddingSidesSmall, classes.columnMedLarge)}>
        {sample.material ? sample.material : ''}
      </div>
      <div className={classes.columnMedSmall}>
        {sample.category ? sample.category : ''}
      </div>
      {!doc.historicalCoc && <div className={classes.columnMedLarge}>
        {sample.sampledBy ? sample.sampledBy.map(e => e.name).join(', ') : ''}
      </div>}
      {!doc.historicalCoc && <div className={classes.columnMedSmall}>
        {sample.sampleDate ? moment(dateOf(sample.sampleDate)).format('ddd, D MMMM YYYY') : ''}
      </div>}
      {doc.historicalCoc && <div className={classes.columnExtraLarge}>
        <div className={basicResult === 'none' ? classes.roundButtonShadedLong : basicResult === 'negative' ? classes.roundButtonShadedLongGreen : classes.roundButtonShadedLongRed}>
          {writeShorthandResult(sample.result)}
        </div>
      </div>}
      <div className={classes.columnSmall}>
        {!disabled && <IconButton onClick={onEdit}>
          <EditIcon className={classes.iconRegular}  />
        </IconButton>}
      </div>
    </div>);
}

export default AsbestoSampleListBulk;
