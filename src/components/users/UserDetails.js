import React from "react";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { formStyles } from '../../config/styles';

import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
// import IconButton from '@material-ui/core/IconButton';

import { auth, usersRef } from '../../config/firebase';

import Error from '@material-ui/icons/Error';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';

import UserAttrModal from '../modals/UserAttrModal';
import AttrList from './AttrList';
import { USERATTR } from '../../constants/modal-types';
import { showModal } from '../../actions/modal';
import { getUserAttrs } from '../../actions/local';
import _ from 'lodash';

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    offices: state.const.offices,
    jobdescriptions: state.const.jobdescriptions,
    permissions: state.const.permissions,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal)),
    getUserAttrs: userPath => dispatch(getUserAttrs(userPath)),
  };
};

class UserDetails extends React.Component {
  constructor(props){
    super(props);
    var userPath = auth.currentUser.uid;
    if (props.match.params.user) userPath = props.match.params.user;
    this.state = {
      tabValue: 0,
      userPath: userPath,
      isLoading: false,
    }
    this.onEditUser = _.debounce(this.onEditUser, 300);
  }

  handleTabChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  componentWillMount = () => {
    if (this.props.match.params.user) {
      if (!(this.props.staff[this.props.match.params.user] && this.props.staff[this.props.match.params.user].attrs)) {
        this.props.getUserAttrs(this.props.match.params.user);
      }
    } else if (!this.props.match.params.user && !this.props.me.attrs) {
      this.props.getUserAttrs(auth.currentUser.uid);
    }
  }

  onEditUser = (target, select) => {
    let change = {}
    change[target.id] = target.value;
    if (select) {
      this.setState({
        user: {
          ...this.state.user,
          ...change,
        },
      });
    }
    usersRef.doc(this.state.userPath).update(change);
  }

  onEditAuth = (target, auth) => {
    if (this.props.me.auth && this.props.me.auth['Admin']) {
      let change = {};
      if (auth) change = auth;
      change[target.id] = target.value;
      this.setState({
        user: {
          ...this.state.user,
          auth: change,
        },
      });
      usersRef.doc(this.state.userPath).update({auth: change});
    }
  }


  displayTimeAtK2 = () => {
    var user = {};
    if (this.props.match.params.user) {
      user = this.props.staff[this.props.match.params.user];
    } else {
      user = this.props.me;
    }
    if (user.startdate) {
      var timeAtK2 = new Date() - new Date(user.startdate);
      var divideBy = {
        d: 86400000,
        m: 2629800000,
        y: 31557600000,
      };
      var years = Math.floor(timeAtK2/divideBy['y']);
      timeAtK2 = timeAtK2 % divideBy['y'];
      var months = Math.floor(timeAtK2/divideBy['m']);
      timeAtK2 = timeAtK2 % divideBy['m'];
      var days = Math.floor(timeAtK2/divideBy['d']);
      let y = ' years ';
      let m = ' months and ';
      let d = ' days';
      if (years === 1) y = ' year ';
      if (months === 1) m = ' month and ';
      if (days === 1) d = ' day';
      return (years + y + months + m + days + d);
    } else {
      return ('No start date set')
    }
  }

  render() {
    const { classes } = this.props;
    var { tabValue } = this.state;

    // User variable is assigned at this stage so that attributes are immediately updated when changed.
    var user = {};
    if (this.props.match.params.user) {
      user = this.props.staff[this.props.match.params.user];
    } else {
      user = this.props.me;
    }

    if (!user.maskfitsize) user.maskfitsize = '';

    let sixmonths = new Date();
    sixmonths = sixmonths.setMonth(sixmonths.getMonth() - 6);

    let admin = false;
    if (this.props.me.auth && this.props.me.auth['Admin']) admin = true;
    return (
      <div style={{ marginTop: 80, }}>
        <UserAttrModal />
        <Paper style={{ padding: 20, }}>
          <div style={{ marginBottom: 20, }}>
            <Tabs
              value = { tabValue }
              onChange = { this.handleTabChange }
              indicatorColor = "secondary"
              textColor = "secondary"
              centered
            >
              <Tab label="General Detals" />
              <Tab label="Certificates" />
              <Tab label="Personal Gear" />
              <Tab label="Emergency Contacts" />
              <Tab label="Permissions" />
            </Tabs>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', }}>
            { tabValue === 0 &&
              <div>
                { this.state.isLoading ?
                <div>
                  <CircularProgress />
                </div>
              :
                <Grid container justify='center' direction='row'>
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <TextField
                        label="Preferred Name"
                        id="name"
                        helperText="This is the name that will be displayed on reports and test certificates."
                        className={classes.textField}
                        defaultValue={user.name}
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
                          onChange={e => this.onEditUser({id: 'jobdescription', value: e.target.value}, true)}
                          value={user.jobdescription}
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
                          onChange={e => this.onEditUser({id: 'office', value: e.target.value}, true)}
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
                        label="Start Date At K2"
                        id="startdate"
                        type="date"
                        className={classes.textField}
                        defaultValue={user.startdate}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        disabled
                        label="Time At K2"
                        className={classes.textField}
                        value={this.displayTimeAtK2()}
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
                        type="tel"
                        defaultValue={user.workphone}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="K2 Email"
                        id="email"
                        type="email"
                        helperText="Enter your '@k2.co.nz' email address."
                        className={classes.textField}
                        defaultValue={user.email}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Gmail"
                        id="gmail"
                        type="email"
                        helperText="Enter your '@gmail.com' email address."
                        className={classes.textField}
                        defaultValue={user.gmail}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                    <ListItem>
                      <Typography className={classes.labels}>Personal Contact Information</Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Personal Phone"
                        id="personalphone"
                        type="tel"
                        className={classes.textField}
                        defaultValue={user.personalphone}
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
                        defaultValue={user.address}
                        onChange={e => this.onEditUser(e.target)}
                        InputLabelProps = {{ shrink: true }}
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              }
              </div>
            }
            { tabValue === 1 &&
              <div>
                { this.state.isLoading || !user ?
                  <div>
                    <CircularProgress />
                  </div>
                :
                  <div style={{ position: 'relative', width: '60vw'}}>
                    <div>
                      <Button variant='outlined' onClick={() => {this.props.showModal({ modalType: USERATTR, modalProps: { userPath: this.state.userPath, title: 'Add New Item', staffName: user.name } })}}>
                        Add New Item
                      </Button>
                    </div>
                    {
                      user.attrs && Object.keys(user.attrs).length > 0 ?
                      <div>
                        { Object.keys(user.attrs).map(key => {
                        return(
                          <AttrList key = { key} attr={user.attrs[key]} userPath={ this.state.userPath } staffName={ user.name } />
                        );
                      }) }</div> :
                      <ListItem>
                        Click the button to add your qualifications, training and health & safety records.
                      </ListItem>
                    }
                  </div>
                }
              </div>
            }
            { tabValue === 2 &&
                <div>
                  { this.state.isLoading ?
                  <div>
                    <CircularProgress />
                  </div>
                :
                  <Grid container justify='center' direction='row'>
                    <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                      <ListItem>
                        <Typography className={classes.labels}>Mask</Typography>
                      </ListItem>
                      <ListItem>
                       {
                         user.maskfit === 'OK' ?
                         <div style={{ color: 'green', fontWeight: 500 }}>Mask Fit Tested <CheckCircleOutline /></div>
                         :
                         <div style={{ color: 'red', fontWeight: 500 }}>{user.maskfit === 'Expired' ? 'Mask Fit Test Expired!' : 'Mask Fit Not Tested'}<Error /></div>
                       }
                      </ListItem>
                      <ListItem>
                        <div>Enter your mask fit certificate into your <i>Certificates</i> list.</div>
                      </ListItem>
                      <ListItem>
                        <TextField
                          label="Model"
                          id="maskfitmodel"
                          className={classes.textField}
                          defaultValue={user.maskfitmodel}
                          onChange={e => this.onEditUser(e.target)}
                          InputLabelProps = {{ shrink: true }}
                        />
                      </ListItem>
                      <ListItem>
                        <FormControl className={classes.textField}>
                          <InputLabel>Mask Size</InputLabel>
                          <Select
                            value={user.maskfitsize}
                            onChange={e => this.onEditUser({id: 'maskfitsize', value: e.target.value}, true)}
                            input={<Input name='maskfitsize' id='maskfitsize' />}
                          >
                            <option value='' />
                            { ['S','M','L'].map((maskfitsize) => {
                              return(
                                <option key={maskfitsize} value={maskfitsize}>{maskfitsize}</option>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </ListItem>
                      <ListItem>
                        <TextField
                          label="Fit Factor"
                          id="maskfitfactor"
                          className={classes.textField}
                          defaultValue={user.maskfitfactor}
                          onChange={e => this.onEditUser(e.target)}
                          InputLabelProps = {{ shrink: true }}
                        />
                      </ListItem>
                      <ListItem>
                        <TextField
                          label="Particulate Filters Replaced On"
                          id="maskparticulatefilters"
                          className={classes.textField}
                          type='date'
                          defaultValue={user.maskparticulatefilters}
                          onChange={e => this.onEditUser(e.target)}
                          InputLabelProps = {{ shrink: true }}
                        />
                      </ListItem>
                      <ListItem>
                        <TextField
                          label="Organic Filters Replaced On"
                          id="maskorganicfilters"
                          className={classes.textField}
                          type='date'
                          defaultValue={user.maskorganicfilters}
                          onChange={e => this.onEditUser(e.target)}
                          InputLabelProps = {{ shrink: true }}
                        />
                      </ListItem>
                      {
                        user.maskorganicfilters && new Date(user.maskorganicfilters) <= sixmonths &&
                        <ListItem>
                          <div style={{ color: 'red', fontWeight: 500, }}>Replace organic filters! <Error /></div>

                        </ListItem>
                      }
                    </Grid>
                    <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                      <ListItem>
                        <Typography className={classes.labels}>Other PPE</Typography>
                      </ListItem>
                      <ListItem>
                        <FormControlLabel
                          style={{ marginLeft: 1, }}
                          control={
                            <Checkbox
                              checked={user.ppeHighVis}
                              onChange={e => this.onEditUser({id: 'ppeHighVis', value: e.target.checked}, true)}
                              value='ppeHighVis'
                            />
                          }
                          label="High-Vis"
                        />
                      </ListItem>
                      <ListItem>
                        <FormControlLabel
                          style={{ marginLeft: 1, }}
                          control={
                            <Checkbox
                              checked={user.ppeHardHat}
                              onChange={e => this.onEditUser({id: 'ppeHardHat', value: e.target.checked}, true)}
                              value='ppeHardHat'
                            />
                          }
                          label="Hard Hat"
                        />
                      </ListItem>
                      <ListItem>
                        <FormControlLabel
                          style={{ marginLeft: 1, }}
                          control={
                            <Checkbox
                              checked={user.ppeBoots}
                              onChange={e => this.onEditUser({id: 'ppeBoots', value: e.target.checked}, true)}
                              value='ppeBoots'
                            />
                          }
                          label="Steel-Cap Boots"
                        />
                      </ListItem>
                      <ListItem>
                        <FormControlLabel
                          style={{ marginLeft: 1, }}
                          control={
                            <Checkbox
                              checked={user.ppeGlasses}
                              onChange={e => this.onEditUser({id: 'ppeGlasses', value: e.target.checked}, true)}
                              value='ppeGlasses'
                            />
                          }
                          label="Safety Glasses"
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                }
                </div>
            }
            { tabValue === 3 &&
              <div>
                { this.state.isLoading || !user ?
                    <div>
                      <CircularProgress />
                    </div>
                  :
                    <Grid container justify='center' direction='row'>
                      <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                        <ListItem>
                          <Typography className={classes.labels}>Primary Emergency Contact</Typography>
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Name"
                            id="emergencyprimaryname"
                            className={classes.textField}
                            defaultValue={user.emergencyprimaryname}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Relation"
                            id="emergencyprimaryrelation"
                            className={classes.textField}
                            defaultValue={user.emergencyprimaryrelation}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Home Phone"
                            id="emergencyprimaryhomephone"
                            className={classes.textField}
                            defaultValue={user.emergencyprimaryhomephone}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Work Phone"
                            id="emergencyprimaryworkphone"
                            className={classes.textField}
                            defaultValue={user.emergencyprimaryworkphone}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Mobile"
                            id="emergencyprimarymobile"
                            className={classes.textField}
                            defaultValue={user.emergencyprimarymobile}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Email"
                            id="emergencyprimaryemail"
                            className={classes.textField}
                            defaultValue={user.emergencyprimaryemail}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Home Address"
                            id="emergencyprimaryhomeaddress"
                            className={classes.textField}
                            defaultValue={user.emergencyprimaryhomeaddress}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={9} md={8} lg={7} xl={6}>
                        <ListItem>
                          <Typography className={classes.labels}>Secondary Emergency Contact</Typography>
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Name"
                            id="emergencysecondaryname"
                            className={classes.textField}
                            defaultValue={user.emergencysecondaryname}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Relation"
                            id="emergencysecondaryrelation"
                            className={classes.textField}
                            defaultValue={user.emergencysecondaryrelation}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Home Phone"
                            id="emergencysecondaryhomephone"
                            className={classes.textField}
                            defaultValue={user.emergencysecondaryhomephone}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Work Phone"
                            id="emergencysecondaryworkphone"
                            className={classes.textField}
                            defaultValue={user.emergencysecondaryworkphone}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Mobile"
                            id="emergencysecondarymobile"
                            className={classes.textField}
                            defaultValue={user.emergencysecondarymobile}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Email"
                            id="emergencysecondaryemail"
                            className={classes.textField}
                            defaultValue={user.emergencysecondaryemail}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                        <ListItem>
                          <TextField
                            label="Home Address"
                            id="emergencysecondaryhomeaddress"
                            className={classes.textField}
                            defaultValue={user.emergencysecondaryhomeaddress}
                            onChange={e => this.onEditUser(e.target)}
                            InputLabelProps = {{ shrink: true }}
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  }
              </div>
            }
            { tabValue === 4 &&
                <div>
                  { this.state.isLoading ?
                  <div>
                    <CircularProgress />
                  </div>
                :
                  <Grid container justify='flex-start' direction='row' style={{ width: 800 }}>
                    <Grid item>
                      {
                        this.props.permissions.map(permission => {
                          return (
                            <div key={permission.name}>
                              <ListItem key={permission.name} dense>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      disabled={!admin}
                                      checked={user.auth ? user.auth[permission.name] : false}
                                      onChange={e => this.onEditAuth({id: permission.name, value: e.target.checked}, user.auth)}
                                      value={permission.name}
                                    />
                                  }
                                  label={permission.name}
                                />
                              </ListItem>
                              <ListItem dense>
                                <FormHelperText>{permission.desc}</FormHelperText>
                              </ListItem>
                            </div>
                        );
                      })
                    }
                    </Grid>
                  </Grid>
                }
                </div>
            }

          </div>
        </Paper>
      </div>
    );
  }
}

export default withStyles(formStyles)(connect(mapStateToProps, mapDispatchToProps)(UserDetails));
