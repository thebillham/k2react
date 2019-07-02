
import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

export const SampleTickyBox = (that, label, sample, field) => {
  return(<FormControlLabel
    control={
      <Checkbox
        checked={sample[field] ?
          sample[field] :
          false }
        onChange={e => {
          that.setState({
            modified: true,
            sample: {
              ...sample,
              [field]: e.target.checked,
            }
          });
        }}
        value={field}
      />
    }
    label={label}
  />);
};

export const SampleTickyBoxGroup = (that, sample, heading, base, options) => {
  return(<div>
          <div className={this.props.classes.subheading}>{heading}</div>
          <FormGroup row>
            {options && options.map(opt => <FormControlLabel
              control={
                <Checkbox
                  checked={sample[base] && sample[base][opt.field] ?
                    sample[base][opt.field] :
                    false }
                  onChange={e => {
                    that.setState({
                      modified: true,
                      sample: {
                        ...sample,
                        [base]: {
                          ...sample[base],
                          [opt.field]: e.target.checked,
                        }
                      }
                    });
                  }}
                  value={opt.field}
                />
              }
              label={opt.label}
            />)}
          </FormGroup>
          </div>);
};

export const SampleTextyBox = (that, sample, field, label, helperText, multiline, rows, end, start) => {
  return(<TextField
    id={field}
    value={sample[field] ? sample[field] : ''}
    label={label}
    style={{ width: '100%'}}
    helperText={helperText}
    multiline={multiline}
    rows={rows}
    InputProps={{
      endAdornment: end ? <InputAdornment position="end">{end}</InputAdornment> : null,
    }}
    onChange={e => {
      that.setState({
        modified: true,
        sample: {
          ...sample,
          [field]: e.target.value,
        }
      });
    }}
  />);
};

export const SampleRadioSelector = (that, sample, field, defaultValue, label, selections, helperText) => {
  return(<FormControl component="fieldset">
    <RadioGroup
      aria-label={label}
      name={field}
      value={sample[field] ? sample[field] : defaultValue }
      row
      onChange={e => {
        that.setState({
          modified: true,
          sample: {
            ...sample,
            [field]: e.target.value,
          }
        });
      }}
    >
      {selections && selections.map(select => <FormControlLabel key={select.value} value={select.value} control={<Radio />} label={select.label} />)}
    </RadioGroup>
    {helperText && <FormHelperText style={{ width: 500, }}>{helperText}</FormHelperText>}
  </FormControl>);
};
