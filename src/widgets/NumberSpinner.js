import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import Increase from '@material-ui/icons/Add';
import Decrease from '@material-ui/icons/Remove';

class NumberSpinner extends React.PureComponent {
  state = {
  };

  componentWillMount = () => {

  };

  increaseNumber = () => {
    let increment = this.props.increment ? this.props.increment : 1;
    let increase = this.props.value + increment;
    if (increase > this.props.max) increase = this.props.max;
    this.props.onChange(increase);
  }

  decreaseNumber = () => {

  }

  render() {
    const {
      max,
      min,
      increment,
      onChange,
      value,
    } = this.props;

    return (
      <div>
        <Decrease />
        <Input
          className={classes.formInputNumber}
          type='number'
          value={value}
          onChange={onChange(eve)}
          inputProps={{
            min: min ? min : 1,
          }}
        />
        <Increase />
      </div>
    );
  }
}

export default withStyles(styles)(NumberSpinner);
