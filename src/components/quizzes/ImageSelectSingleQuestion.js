import React from 'react';
import { Typography, FormControl, FormLabel, RadioGroup, FormControlLabel,
  ListItem, ListItemSecondaryAction, Avatar, Radio, List } from '@material-ui/core';

class ImageSelectSingleQuestion extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      value: this.props.q.selected,
      options: [],
    }

    // this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount(){
    const shuffledincorrect = this.props.q.incorrect.sort(() => .5 - Math.random());
    let opt = shuffledincorrect.slice(0, this.props.q.numberofoptions - 1).concat(this.props.q.correct).sort(() => .5 - Math.random());
    this.setState({
      options: opt.map(o => { return (o.src) }),
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
          <FormLabel component="legend"> { q.question }</FormLabel>
            <RadioGroup
              name={q.uid}
              value={q.selected}
              onChange={this.props.onChanged}>
            { this.state.options.map(src => {
              return(
                <FormControlLabel key={src} value={src} control={<Radio />} label={<img alt="Option" src={src} width={q.width} height={q.height} />} />
              );
            })}
            </RadioGroup>
        </FormControl>
        <hr />
      </div>
    )

  }
}

export default ImageSelectSingleQuestion;
