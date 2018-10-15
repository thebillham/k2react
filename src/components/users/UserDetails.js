import React from "react";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { formStyles } from '../../config/styles';
import { Paper, List, ListItem, TextField, Typography, InputLabel,
  Select, FormControl, Input, Grid, CircularProgress, Card, CardHeader,
  CardContent, IconButton } from '@material-ui/core';
import store from '../../store';
import { editUser, getUser } from '../../actions/local';
import { auth, usersRef } from '../../config/firebase';
import { CloudUpload, Warning, Add, ExpandLess, ExpandMore, Edit, Delete } from '@material-ui/icons';

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
        <Grid container justify='space-evenly' className={classes.container} spacing={16}>
          <Grid item xs={4}>
            <Card className={classes.card}>
              <CardHeader
                style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
                title={
                  <Typography className={classes.cardHeaderType} color="textSecondary">
                    General Details
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card className={classes.card}>
              <CardHeader
                style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
                title={
                  <Typography className={classes.cardHeaderType} color="textSecondary">
                    Qualifications
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
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row'}}>
                            <Typography className={classes.labels}>Tertiary Education</Typography>
                            <IconButton><ExpandLess className={classes.formIcon} /></IconButton>
                          </Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton><Add className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item><Typography className={classes.note}><b>BA</b> <i>Bachelor of Arts (Philosophy)</i><br/>2012</Typography></Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton><Edit className={classes.formIcon} /></IconButton>
                            <IconButton><Delete className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item><Typography className={classes.note}><i>Certificate in Design</i><br/>2008</Typography></Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton><Edit className={classes.formIcon} /></IconButton>
                            <IconButton><Delete className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>

                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row'}}>
                            <Typography className={classes.labels}>Health and Safety</Typography>
                            <IconButton><ExpandLess className={classes.formIcon} /></IconButton>
                          </Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton><Add className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Warning className={classes.warningIcon} />
                            <Typography className={classes.note}><b>Mask Fit Test</b> 19 April 2016</Typography>
                          </Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <IconButton><Edit className={classes.formIcon} /></IconButton>
                            <IconButton><Delete className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Warning className={classes.warningIcon} />
                            <Typography className={classes.note}><b>Site Safe Passport (ID 465670)</b><br /><b>Expires:</b>8 June 2017</Typography>
                          </Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <IconButton><Edit className={classes.formIcon} /></IconButton>
                            <IconButton><Delete className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>

                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Typography className={classes.labels}>ID Cards</Typography>
                            <IconButton><ExpandMore className={classes.formIcon} /></IconButton>
                          </Grid>
                          <Grid>
                            <IconButton><Add className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>

                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Typography className={classes.labels}>Asbestos</Typography>
                            <IconButton><ExpandLess className={classes.formIcon} /></IconButton>
                          </Grid>
                          <Grid>
                            <IconButton><Add className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Typography className={classes.note}><b>Asbestos Assessors License</b> 8 January 2018<br />AA161000161</Typography>
                          </Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <IconButton><Edit className={classes.formIcon} /></IconButton>
                            <IconButton><Delete className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <ListItem>
                        <Grid container justify='space-between'>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <Typography className={classes.note}><b>IP402</b> 14 August 2018<br /></Typography>
                          </Grid>
                          <Grid item style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                            <IconButton><Edit className={classes.formIcon} /></IconButton>
                            <IconButton><Delete className={classes.formIcon} /></IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>




                    </div>
                  }
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2}>
            <Grid container direction='column' spacing={16}>
              <Grid item>
                <Card className={classes.card}>
                  <CardHeader
                    style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
                    title={
                      <Typography className={classes.cardHeaderType} color="textSecondary">
                        Profile Photo
                      </Typography>
                    }
                    action={
                      <div>
                        <IconButton><CloudUpload className={classes.dashboardIcon} /></IconButton>
                      </div>
                    }
                  />
                  <CardContent>
                    <Grid content justify='center' >
                      <Grid item>
                        <img src="https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/dummyprofilephoto.jpg?alt=media&token=0fa9ec7e-14b0-4b94-ae10-adc79824040f" height="250" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card className={classes.card}>
                  <CardHeader
                    style={{ background: 'linear-gradient(to right bottom, #ff5733, #fff)'}}
                    title={
                      <Typography className={classes.cardHeaderType} color="textSecondary">
                        Signature
                      </Typography>
                    }
                    action={
                      <div>
                        <IconButton><CloudUpload className={classes.dashboardIcon} /></IconButton>
                      </div>
                    }
                  />
                  <CardContent>
                    <Grid content justify='center' >
                      <Grid item>
                        <img src="https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/gop.png?alt=media&token=d4d0f0da-9057-4e8e-8397-50cd87af3e44" height="100" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(formStyles)(connect(mapStateToProps, {pure: false})(UserDetails));
