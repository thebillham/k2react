
import React from 'react';
import { withStyles } from "@material-ui/core/styles";

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

export const AsbestosClickyBasic = (fgColor, bgColor, tooltip, label, toggle) => {
  return(<Tooltip title={tooltip}>
    <div className={bgColor}>
      <Button
        variant="outlined"
        className={fgColor}
        onClick={event => {
          // event.stopPropagation();
          toggle();
        }}
      >
        {label}
      </Button>
    </div>
  </Tooltip>);
};
