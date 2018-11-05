import React from 'react';
import { FormControl, FormLabel, TextField, } from '@material-ui/core';

function ShortStringQuestion(props) {
  return (
    <div style = {{ marginTop: 24 }}>
      <FormControl component="fieldset">
        { props.q.image && <img src={props.q.image} height='300' style={{ borderRadius: 16 }}/> }
        <FormLabel component="legend"> { props.q.question }</FormLabel>
        <TextField
          id="standard-name"
          style={{ width: 200, }}
          value={ props.q.selected }
          onChange={ props.onChanged }
          margin="normal"
          />
      </FormControl>
      <hr />
    </div>
  );
}

export default ShortStringQuestion;
