import React from 'react';
import { Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';

class MultiSingleQuestion extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      value: this.props.q.selected,
      options: [],
    }

    // this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount(){
    let options = [];
    // const shuffledcorrect = this.props.q.correct.sort(() => .5 - Math.random());
    const shuffledincorrect = this.props.q.incorrect.sort(() => .5 - Math.random());
    let opt = shuffledincorrect.slice(0, this.props.q.numberofoptions - 1).concat(this.props.q.correct).sort(() => .5 - Math.random());
    this.setState({
      options: opt,
    })
  };

  // onChanged = e => {
  //   this.setState({ value: e.target.value });
  // };

  render() {
    const { classes, q } = this.props;

    return (
      <div style = {{ marginTop: 24 }}>
        <FormControl component="fieldset">
          { q.image && <img src={q.image} height='300' style={{ borderRadius: 16 }}/> }
          <FormLabel component="legend"> { q.question }</FormLabel>
          <RadioGroup
            name={q.uid}
            value={q.selected}
            onChange={this.props.onChanged}
            >
            { this.state.options.map(opt => {
              return(
                <FormControlLabel key={opt.text} value={opt.text} control={<Radio />} label={opt.text} />
              );
            })}
          </RadioGroup>
        </FormControl>
        <hr />
      </div>
    )

  }
}

export default MultiSingleQuestion;
