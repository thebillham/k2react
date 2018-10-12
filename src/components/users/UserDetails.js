import React from "react";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { formStyles } from '../../config/styles';
import { Paper, List, ListItem, TextField, Typography, InputLabel,
  Select, FormControl, Input, Grid, CircularProgress } from '@material-ui/core';
import store from '../../store';
import { editUser, getUser } from '../../actions/local';
import { auth, usersRef } from '../../config/firebase';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    user: state.local.user,
    userRef: state.local.userRef,
    offices: state.const.offices,
    jobdescriptions: state.const.jobdescriptions,
  };
};

class UserDetails extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: {},
      userPath: props.match.params.user ? props.match.params.user : auth.currentUser.uid,
      isLoading: true,
    }
    this.onEditUser = this.onEditUser.bind(this);
  }

  onEditUser = target => {
    var change = {};
    change[target.id] = target.value;
    usersRef.doc(this.state.userPath).update(change);
  }

  componentWillMount(){
    usersRef.doc(this.state.userPath).onSnapshot((doc) => {
      this.setState({
        user: doc.data(),
        isLoading: false
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { user } = this.state;

    return (
      <div>
        <Grid container justify='center' className={classes.container}>
          <Grid item>
            <Paper className={classes.paper} elevation={1}>
              <List>
                { this.state.isLoading ?
                  <div>
                    <CircularProgress />
                  </div>
                :
                  <div>
                    <ListItem>
                      <TextField
                        label="Name"
                        id="name"
                        className={classes.textField}
                        value={user.name}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <Typography className={classes.note}><b>Workflow Max ID:</b> {user.wfm_id}</Typography>
                    </ListItem>
                    <ListItem>
                      <FormControl className={classes.textField}>
                        <InputLabel>Job Description</InputLabel>
                        <Select
                          value={user.jobdescription}
                          onChange={e => this.onEditUser({id: 'jobdescription', value: e.target.value})}
                          input={<Input name='jobdescription' id='jobdescription' />}
                        >
                          <option value='' />
                          { this.props.jobdescriptions.map((jobdescription) => {
                            return(
                              <option key={jobdescription} value={jobdescription}>{jobdescription}</option>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </ListItem>
                    <ListItem>
                      <FormControl className={classes.textField}>
                        <InputLabel>Office</InputLabel>
                        <Select
                          value={user.office}
                          onChange={e => this.onEditUser({id: 'office', value: e.target.value})}
                          input={<Input name='office' id='office' />}
                        >
                          <option value='' />
                          { this.props.offices.map((office) => {
                            return(
                              <option key={office} value={office}>{office}</option>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Start Date"
                        id="startdate"
                        type="date"
                        className={classes.textField}
                        value={user.startdate}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <Typography className={classes.labels}>Contact Information</Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Work Phone"
                        id="workphone"
                        className={classes.textField}
                        value={user.workphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="K2 Email"
                        id="email"
                        className={classes.textField}
                        value={user.email}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Gmail"
                        id="gmail"
                        className={classes.textField}
                        value={user.gmail}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <Typography className={classes.labels}>Personal Information</Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Personal Phone"
                        id="personalphone"
                        className={classes.textField}
                        value={user.personalphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Address"
                        id="address"
                        multiline
                        rowsMax="4"
                        className={classes.textField}
                        value={user.address}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                  </div>
                }
              </List>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(formStyles)(connect(mapStateToProps, {pure: false})(UserDetails));
