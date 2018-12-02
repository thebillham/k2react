import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
<<<<<<< HEAD
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
=======
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
>>>>>>> 947a2ba95b689774eab952b8a181ffa246ab3010

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
    const { q } = this.props;

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
