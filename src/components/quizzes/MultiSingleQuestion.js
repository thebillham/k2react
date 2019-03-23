import React from "react";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

class MultiSingleQuestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.q.selected,
      options: []
    };

    // this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount() {
    // const shuffledcorrect = this.props.q.correct.sort(() => .5 - Math.random());
    const shuffledincorrect = this.props.q.incorrect.sort(
      () => 0.5 - Math.random()
    );
    let opt = shuffledincorrect
      .slice(0, this.props.q.numberofoptions - 1)
      .concat(this.props.q.correct)
      .sort(() => 0.5 - Math.random());
    this.setState({
      options: opt
    });
  }

  // onChanged = e => {
  //   this.setState({ value: e.target.value });
  // };

  render() {
    const { q } = this.props;

    return (
      <div style={{ marginTop: 24 }}>
        <FormControl component="fieldset">
          {q.image && (
            <img
              alt=""
              src={q.image}
              height="300"
              style={{ borderRadius: 16 }}
            />
          )}
          <FormLabel component="legend"> {q.question}</FormLabel>
          <RadioGroup
            name={q.uid}
            value={q.selected}
            onChange={this.props.onChanged}
          >
            {this.state.options.map(opt => {
              if (typeof opt === "object") {
                opt = opt.text;
              }
              return (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio />}
                  label={opt}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
        <hr />
      </div>
    );
  }
}

export default MultiSingleQuestion;
