
import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

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
          <div style={{
            marginTop: 20,
            marginBottom: 16,
            fontWeight: 300,
            color: '#888',}}>{heading}</div>
          <FormGroup row>
            {options && options.map(opt => {
              if (opt.tooltip !== undefined) {
                return (
                  <Tooltip title={opt.tooltip} key={opt.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sample[base] && sample[base][opt.value] === true ?
                          true : false }
                        onChange={e => {
                          that.setState({
                            modified: true,
                            sample: {
                              ...sample,
                              [base]: {
                                ...sample[base],
                                [opt.value]: e.target.checked,
                              }
                            }
                          });
                        }}
                        value={opt.value}
                      />
                    }
                    label={opt.label}
                  />
              </Tooltip>);
              } else {
                return (
                <FormControlLabel
                  key={opt.value}
                  control={
                    <Checkbox
                      checked={sample[base] && sample[base][opt.value] === true ?
                        true : false }
                      onChange={e => {
                        that.setState({
                          modified: true,
                          sample: {
                            ...sample,
                            [base]: {
                              ...sample[base],
                              [opt.value]: e.target.checked,
                            }
                          }
                        });
                      }}
                      value={opt.value}
                    />
                  }
                  label={opt.label}
                />);
              }
            }

          )}
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
      {selections && selections.map(select => {
        if (select.tooltip !== undefined) {
          return (<Tooltip key={select.value} title={select.tooltip}><FormControlLabel value={select.value} control={<Radio />} label={select.label} /></Tooltip>);
        } else {
          return (<FormControlLabel key={select.value} value={select.value} control={<Radio />} label={select.label} />);
        }
      }
      )}
    </RadioGroup>
    {helperText && <FormHelperText style={{ width: 500, }}>{helperText}</FormHelperText>}
  </FormControl>);
};

export const TickyBox = (that, label, ref, obj, field, onClick, disabled) => {
  return(<FormControlLabel
    control={
      <Checkbox
        disabled={disabled}
        checked={obj[field] ?
          obj[field] :
          false }
        onChange={e => {
          ref.doc(obj.uid).update({[field]: e.target.checked});
          onClick(e.target.checked);
        }}
        value={field}
      />
    }
    label={label}
  />);
};

export const SampleTextyDisplay = (label, text) => {
  return (
    <div>
      <div style={{ fontWeight: 500, }}>{label}</div>
      <div style={{ fontSize: 12, padding: 6, marginBottom: 6, fontStyle: 'italic', }}>{text}</div>
    </div>
  );
}

export const SampleTextyLine = (label, text) => {
  return (
    <div style={{ marginBottom: 6,}}>
      <span style={{ fontWeight: 500, }}>{label}</span>
      <span style={{ fontSize: 12, padding: 12, }}>{text}</span>
    </div>
  );
}

export const AsbButton = (colors, label, onClick) => {
  return (
    <div
      style={{
        backgroundColor: colors[`${label}DivColor`],
        borderRadius: 5
      }}
    >
      <Button
        variant="outlined"
        style={{ margin: 5, color: colors[`${label}Color`]}}
        onClick={onClick}
      >
        {label.toUpperCase()}
      </Button>
    </div>
  )
}
