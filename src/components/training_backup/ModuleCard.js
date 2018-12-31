import React from "react";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { formStyles } from '../../config/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/icons/Input';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { modulesRef } from '../../config/firebase';

const mapStateToProps = state => {
  return {
    trainingcategories: state.const.trainingcategories,
  };
};

class ModuleCard extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      mod: {},
      isLoading: true,
    }
  }

  onEdit = target => {
    var change = {};
    change[target.id] = target.value;
    modulesRef.doc(this.props.mod).update(change);
  }

  componentWillMount(){
    modulesRef.doc(this.props.mod).onSnapshot((doc) => {
      this.setState({
        mod: doc.data(),
        isLoading: false
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { mod } = this.state;

    return (
      <div>
            <Card className={classes.card}>
              <CardHeader
                style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
                title={
                  <Typography className={classes.cardHeaderType} color="textSecondary">
                    Training Module Summary
                  </Typography>
                }
              />
              <CardContent>
                <List>
                  { this.state.isLoading ?
                    <div>
                      <CircularProgress />
                    </div>
                  :
                    <div>
                      <ListItem>
                        <TextField
                          label="Title"
                          id="title"
                          className={classes.textField}
                          value={mod.title}
                          onChange={e => this.onEdit(e.target)}
                          InputLabelProps = {{ shrink: true }}
                        />
                      </ListItem>
                      <ListItem>
                        <FormControl className={classes.textField}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={mod.category}
                            onChange={e => this.onEdit({id: 'category', value: e.target.value})}
                            input={<Input name='category' id='category' />}
                          >
                            <option value='' />
                            { this.props.trainingcategories.map((category) => {
                              return(
                                <option key={category.key} value={category.key}>{category.desc}</option>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </ListItem>
                      <ListItem>
                        <TextField
                          label="Description"
                          id="description"
                          multiline
                          rows={2}
                          rowsMax={5}
                          className={classes.textField}
                          value={mod.description}
                          onChange={e => this.onEdit(e.target)}
                          InputLabelProps = {{ shrink: true }}
                        />
                      </ListItem>
                    </div> }
                  </List>
                </CardContent>
              </Card>
            </div>
    );
  }
}

export default withStyles(formStyles)(connect(mapStateToProps, {pure: false})(ModuleCard));