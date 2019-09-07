import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../config/styles";
import Increase from '@material-ui/icons/Add';
import Decrease from '@material-ui/icons/Remove';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';

class NumberSpinner extends React.PureComponent {
  state = {
  };

  componentWillMount = () => {

  };

  increaseNumber = () => {
    let increment = this.props.increment ? parseInt(this.props.increment) : 1;
    let value = this.props.value ? parseInt(this.props.value) : 1;
    let increase = value + increment;
    if (this.props.max && increase > this.props.max) increase = this.props.max;
    this.props.onChange(increase);
  }

  decreaseNumber = () => {
    let increment = this.props.increment ? parseInt(this.props.increment) : 1;
    let value = this.props.value ? parseInt(this.props.value) : 1;
    let decrease = value - increment;
    if (this.props.min && decrease < this.props.min) decrease = this.props.min;
    this.props.onChange(decrease);
  }

  render() {
    const {
      max,
      min,
      increment,
      onChange,
      value,
      classes,
    } = this.props;

    return (
      <div className={classes.flexRow}>
        <IconButton onClick={this.decreaseNumber}>
          <Decrease />
        </IconButton>
        <div className={classes.circleShaded}>{this.props.input ?
          <Input
            className={classes.formInputNumber}
            type='number'
            value={value ? value : 1}
            onChange={e => onChange(e.target.value)}
            inputProps={{
              min: min ? min : 1,
            }}
          /> :
          value ? value : 1}
        </div>
        <IconButton onClick={this.increaseNumber}>
          <Increase />
        </IconButton>
      </div>
    );
  }
}

export default withStyles(styles)(NumberSpinner);
