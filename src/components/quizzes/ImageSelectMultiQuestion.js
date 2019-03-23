import React from "react";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";

class ImageSelectMultiQuestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.q.selected,
      options: []
    };

    // this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount() {
    let q = this.props.q;
    const shuffledcorrect = q.correct.sort(() => 0.5 - Math.random());
    const shuffledincorrect = q.incorrect.sort(() => 0.5 - Math.random());
    if (q.correctmax === undefined)
      q.correctmax = Math.floor(q.numberofoptions / 2);
    if (q.correctmin === undefined) q.correctmin = 1;
    const correctnum = Math.floor(
      Math.random() * (q.correctmax - q.correctmin + 1) + q.correctmin
    );
    const correctList = shuffledcorrect.slice(0, correctnum);
    const incorrectList = shuffledincorrect.slice(
      0,
      q.numberofoptions - correctnum
    );
    this.props.updateLists(this.props.q.uid, correctList, incorrectList);
    let opt = incorrectList.concat(correctList).sort(() => 0.5 - Math.random());
    this.setState({
      options: opt.map(o => {
        return o.src;
      })
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
          <FormGroup>
            {this.state.options.map(src => {
              return (
                <FormControlLabel
                  key={src}
                  value={src}
                  control={
                    <Checkbox
                      checked={q.selected && q.selected.includes(src)}
                      onChange={this.props.onChanged}
                    />
                  }
                  label={
                    <img
                      alt="Option"
                      src={src}
                      width={q.width}
                      height={q.height}
                    />
                  }
                />
              );
            })}
          </FormGroup>
        </FormControl>
        <hr />
      </div>
    );
  }
}

export default ImageSelectMultiQuestion;
