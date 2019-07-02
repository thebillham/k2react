
import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel'

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
}
