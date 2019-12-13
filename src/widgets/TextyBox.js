import React from "react";

import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import { numericAndLessThanOnly, } from '../actions/helpers';

class TextyBox extends React.Component {
  state = {
    val: false,
    sampleNumber: null,
  };

  UNSAFE_componentWillMount() {
    if (this.props.sample)
      this.setState({
        sample: this.props.sample.sampleNumber,
      });
  }

    // <TextyBox that={this} sample={sample} base={null} field={'labComments'} label={null} helperText={'Note description of the material or any additional observations or comments. This will not be displayed on the certificate.'} multiline={true} rows={null} end={null} start={null} numericOnly={false} />

  render() {
    const { that, sample, base, field, label, helperText, multiline, rows, end, start, numericOnly, dp, initState } = this.props;

    if (sample.sampleNumber !== this.state.sampleNumber) this.setState({
      val: false,
      sampleNumber: sample.sampleNumber,
    });

    return (
      <TextField
        id={field}
        value={this.state.val !== false ? this.state.val : base ?
          (sample[base] && sample[base][field]) ? sample[base][field] : ''
          :
          sample[field] ? sample[field] : ''
        }
        label={label}
        style={{ width: '100%'}}
        helperText={helperText}
        multiline={multiline}
        rows={rows}
        InputProps={{
          endAdornment: end ? <InputAdornment position="end">{end}</InputAdornment> : null,
        }}
        onChange={e => {
          this.setState({
            val: numericOnly ? numericAndLessThanOnly(e.target.value, dp) : e.target.value,
          });

          if (base) {
            that.setState({
              changes: {
                ...that.state.changes,
                [base]: {
                  ...that.state.changes[base],
                  [field]: numericOnly ? numericAndLessThanOnly(e.target.value, dp) : e.target.value,
                },
              }
            });
          } else {
            that.setState({
              changes: {
                ...that.state.changes,
                [field]: numericOnly ? numericAndLessThanOnly(e.target.value, dp) : e.target.value,
              }
            });
          }
        }}
      />
    );
  }
}

export default TextyBox;
