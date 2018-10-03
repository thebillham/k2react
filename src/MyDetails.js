import React from 'react';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import PDFViewer from 'mgr-pdf-viewer-react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import firebase, { auth, database } from './firebase.js';
import AttrCard from './AttrCard.js';
import JobCard from './JobCard.js';

const styles = theme => ({
  paper: {
    ...theme.mixins.gutters(),
    display: 'flex',
    paddingTop: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 2,
    width: 700,
    justifyContent: 'center',
  },

  tabContainer: {
    justifyContent: 'center',
  },

  button: {
    margin: theme.spacing.unit,
  },

  tabBar: {
    background: '#3D9976',
  },

  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },

  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    // marginBottom: theme.spacing.unit * 2,
    width: 500,
  },

  note: {
    marginLeft: theme.spacing.unit,
    fontSize: 12,
    color: '#888',
    // marginBottom: theme.spacing.unit * 2,
  },
  labels: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit,
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: theme.spacing.unit * 2,
  },
});

class MyDetails extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      docRef: this.props.userRef,
      attr: [],
      myJobs: [],
      user: null,
      tab: 0,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentWillMount(){
    database.collection("users").doc(this.state.docRef)
      .onSnapshot((doc) => {
        this.setState({ user: doc.data(), });
        database.collection("users").doc(this.state.docRef).collection("attr")
          .onSnapshot((querySnapshot) => {
            var attrs = [];
            querySnapshot.forEach((doc) => {
              attrs.push(doc.data());
            });
            this.setState({
              attr: attrs,
            });
          });
        database.collection("users").doc(this.state.docRef).collection("myjobs")
          .onSnapshot((querySnapshot) => {
            var jobs = [];
            querySnapshot.forEach((doc) => {
              jobs.push(doc.data());
            });
            this.setState({
              myJobs: jobs,
            });
          });
      });
  }

  handleChange = (event) => {
    var change = {};
    change[event.target.id] = event.target.value;
    database.collection("users").doc(this.state.docRef)
      .update(change);
  }

  handleSelectChange = name => event => {
    // this.setState({ [name]: event.target.value });
    var change = {};
    change[name] = event.target.value;
    database.collection("users").doc(this.state.docRef)
      .update(change);
  }

  handleTabChange = (event, value) => {
    this.setState({ tab: value });
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.appBarSpacer} />
        {this.state.user ?
          <div>
          <AppBar position="static" className={classes.tabBar}>
            <Tabs
              value={this.state.tab}
              onChange={this.handleTabChange}
              centered
              >
                <Tab label="General Information" />
                <Tab label="Qualifications" />
                <Tab label="Training" />
              </Tabs>
            </AppBar>
            { this.state.tab === 0 &&
            <Grid container spacing={24} className={classes.tabContainer}>
              <Grid item xs={12} xl={6}>
                <Paper className={classes.paper} elevation={1}>
                    <List>
                      <ListItem>
                        <TextField
                          label="Name"
                          id="name"
                          className={classes.textField}
                          value={this.state.user.name}
                          onChange={this.handleChange}
                        /><br />
                      </ListItem>
                      <ListItem>
                        <Typography className={classes.note}><b>Workflow Max ID:</b> {this.state.user.wfm_id}</Typography>
                      </ListItem>
                      <ListItem>
                      <TextField
                        label="Job Description"
                        id="jobdescription"
                        className={classes.textField}
                        value={this.state.user.jobdescription}
                        onChange={this.handleChange}
                      />
                    </ListItem>
                    <ListItem>
                      <FormControl className={classes.textField}>
                        <InputLabel>Office</InputLabel>
                        <Select
                          native
                          value={this.state.user.office}
                          onChange={this.handleSelectChange('office')}
                          input={<Input name='office' id='office' />}
                        >
                          <option value="" />
                          <option value='Auckland'>Auckland</option>
                          <option value='Christchurch'>Christchurch</option>
                          <option value='Hamilton'>Hamilton</option>
                          <option value='Nelson'>Nelson</option>
                          <option value='Wellington'>Wellington</option>
                        </Select>
                      </FormControl>
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Start Date"
                        id="startdate"
                        type="date"
                        className={classes.textField}
                        value={this.state.user.startdate}
                        onChange={this.handleSelectChange}
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
                        value={this.state.user.workphone}
                        onChange={this.handleChange}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="K2 Email"
                        id="email"
                        className={classes.textField}
                        value={this.state.user.email}
                        onChange={this.handleChange}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Gmail"
                        id="gmail"
                        className={classes.textField}
                        value={this.state.user.gmail}
                        onChange={this.handleChange}
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
                        value={this.state.user.personalphone}
                        onChange={this.handleChange}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField
                        label="Home Address"
                        id="address"
                        multiline
                        rowsMax="4"
                        className={classes.textField}
                        value={this.state.user.address}
                        onChange={this.handleChange}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>}
            { this.state.tab === 1 &&
            <Grid container spacing={24} className={classes.tabContainer}>
              <Grid item xs={12} xl={6}>
                <Paper className={classes.paper} elevation={1}>
                  <List>
                      <ListItem>
                        <Typography className={classes.labels}>Qualifications</Typography>
                      </ListItem>
                      <ListItem>
                        <Button variant="outlined" className={classes.button} onClicked={this.addNewAttr}>Add New</Button>
                      </ListItem>
                      {this.state.attr ?
                        <div>
                          {this.state.attr.map((attr) => {
                            return (
                              <ListItem>
                                <AttrCard attr={attr} />
                              </ListItem>
                            )
                          })}
                        </div>
                        :
                        "No attributes"
                      }
                  </List>
                </Paper>
              </Grid>
            </Grid> }
            { this.state.tab === 2 &&
            <Grid container spacing={24} className={classes.tabContainer}>
              <Grid item xs={12} xl={6}>
                <Paper className={classes.paper} elevation={1}>
                  <List>
                    <ListItem>
                      <Typography className={classes.labels}>Job History</Typography>
                    </ListItem>
                    {this.state.myJobs ?
                      <div>
                        {this.state.myJobs.map((job) => {
                          return (
                            <ListItem>
                              <JobCard job={job} />
                            </ListItem>
                          )
                        })}
                      </div>
                      :
                      "No job history"
                    }
                  </List>
                </Paper>
              </Grid>
            </Grid> }
        </div>
        : 'Loading user...'}
      </div>
    );
  }
}

MyDetails.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyDetails);
