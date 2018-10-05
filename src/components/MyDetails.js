import React from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import UploadIcon from '@material-ui/icons/CloudUpload';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';

import CreatableSelect from 'react-select/lib/Creatable';

import AttrCard from './widgets/AttrCard.js';
import TrainingCard from './widgets/TrainingCard.js';
import JobCard from './widgets/JobCard.js';

import {auth, database, storage} from '../firebase/firebase.js';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 17,
  },

  progress: {
    margin: theme.spacing.unit * 2,
    size: 100,
    color: '#FF2D00',
  },

  hidden: {
    display: 'none',
  },

  paper: {
    ...theme.mixins.gutters(),
    display: 'flex',
    paddingTop: theme.spacing.unit * 2,
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
    padding: theme.spacing.unit * 20,
    height: '100vh',
    overflow: 'auto',
  },

  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    // marginBottom: theme.spacing.unit * 2,
    width: 500,
  },

  dialogField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
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

const jobdescriptionOptions = [
    { label: 'Environmental Technician' },
    { label: 'Environmental Scientist' },
    { label: 'Lab Technician' },
    { label: 'Administration Manager' },
    { label: 'Operations Manager' },
    { label: 'Technical Writer' },
  ].map(suggestion => ({
    value: suggestion.label,
    label: suggestion.label,
  }));

class MyDetails extends React.Component {
  constructor(props){
    super(props);

    const attrRef = storage.ref().child('attr');

    this.state = {
      userRef: this.props.userRef,
      attr: [],
      myJobs: [],
      trainings: [],
      user: null,
      confirmDeleteDialogOpen: false,
      attrDialogOpen: false,
      attrObj: {},
      trainingDialogOpen: false,
      trainingObj: {},
      isUploading: false,
      progress: 0,
      staffList: [],
      deleteAttrObj: null,
      deleteTrainingObj: null,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.addNewAttr = this.addNewAttr.bind(this);
    this.editAttr = this.editAttr.bind(this);
    this.handleAttrDialogClose = this.handleAttrDialogClose.bind(this);
    this.handleAttrDialogAdd = this.handleAttrDialogAdd.bind(this);
    this.handleAttrObjChange = this.handleAttrObjChange.bind(this);
    this.onAttrUploadFile = this.onAttrUploadFile.bind(this);
    this.deleteAttr = this.deleteAttr.bind(this);
    this.handleDeleteAttrClick = this.handleDeleteAttrClick.bind(this);

    this.addNewTraining = this.addNewTraining.bind(this);
    this.editTraining = this.editTraining.bind(this);
    this.handleTrainingDialogAdd = this.handleTrainingDialogAdd.bind(this);
    this.handleTrainingObjChange = this.handleTrainingObjChange.bind(this);
    this.handleTrainingDialogClose = this.handleTrainingDialogClose.bind(this);
    this.deleteTraining = this.deleteTraining.bind(this);
    this.handleDeleteTrainingClick = this.handleDeleteTrainingClick.bind(this);

    this.cancelDelete = this.cancelDelete.bind(this);
  }

  handleUploadSuccess = filename => {
    this.setState({ progress: 100, isUploading: false });
    storage.ref("attr")
      .child(filename)
      .getDownloadURL()
      .then(url => this.state.attrObj['imgurl'] = url );
  };

  componentWillMount(){
    database.collection("users").orderBy('name')
      .onSnapshot((querySnapshot) => {
        var users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data().name);
        });
        this.setState({
          staffList: users,
        });
      });
    database.collection("users").doc(this.props.userRef)
      .onSnapshot((doc) => {
        this.setState({ user: doc.data(), });
        database.collection("users").doc(this.props.userRef).collection("attr")
          .onSnapshot((querySnapshot) => {
            var attrs = [];
            querySnapshot.forEach((doc) => {
              let attr = doc.data();
              attr.uid = doc.id;
              attrs.push(attr);
            });
            this.setState({
              attr: attrs,
            });
          });
        database.collection("users").doc(this.props.userRef).collection("training")
          .onSnapshot((querySnapshot) => {
            var trainings = [];
            querySnapshot.forEach((doc) => {
              let training = doc.data();
              training.uid = doc.id;
              trainings.push(training);
            });
            this.setState({
              trainings: trainings,
            });
          });
        database.collection("users").doc(this.props.userRef).collection("myjobs")
          .onSnapshot((querySnapshot) => {
            var jobs = [];
            querySnapshot.forEach((doc) => {
              let job = doc.data();
              job.uid = doc.id;
              jobs.push(job);
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
    database.collection("users").doc(this.props.userRef)
      .update(change);
  }

  handleSelectChange = name => event => {
    // this.setState({ [name]: event.target.value });
    var change = {};
    change[name] = event.target.value;
    database.collection("users").doc(this.props.userRef)
      .update(change);
  }
  //
  // handleReactSelectChange = name => input => {
  //   var change = {};
  //   change[name] = String(input.value);
  //   database.collection("users").doc(this.props.userRef)
  //     .update(change);
  // }

  handleAttrObjChange = (event) => {
    this.state.attrObj[event.target.id] = event.target.value;
  }

  addNewAttr () {
    this.setState({
      attrDialogOpen: true,
      attrObj: {},
    });
  }

  editAttr (attr) {
    this.setState({
      attrDialogOpen: true,
      attrObj: attr,
    })
  }

  handleDeleteAttrClick (attr) {
    this.setState({
      deleteAttrObj: attr,
      confirmDeleteDialogOpen: true,
    });
  }

  handleDeleteTrainingClick (training) {
    this.setState({
      deleteTrainingObj: training,
      confirmDeleteDialogOpen: true,
    });
  }

  cancelDelete () {
    this.setState({
      deleteAttrObj: null,
      deleteTrainingObj: null,
      confirmDeleteDialogOpen: false,
    });
  }

  deleteAttr () {
    this.setState({
      confirmDeleteDialogOpen: false,
    });
    if (this.state.deleteAttrObj.fileRef) {
      storage.ref().child(this.state.deleteAttrObj.fileRef).delete();
    }
    database.collection("users").doc(this.state.userRef).collection("attr").doc(this.state.deleteAttrObj.uid).delete();
    this.setState({
      deleteAttrObj: null,
    });
  }

  deleteTraining () {
    this.setState({
      confirmDeleteDialogOpen: false,
    });
    database.collection("users").doc(this.state.userRef).collection("training").doc(this.state.deleteTrainingObj.uid).delete();
    this.setState({
      deleteTrainingObj: null
    });
  }

  handleAttrDialogClose () {
    if (!this.state.attrObj.uid) {
      storage.ref().child(this.state.attrObj.fileRef).delete();
    }
    this.setState({
      attrDialogOpen: false,
    });
  }

  handleAttrDialogAdd () {
    database.collection("users").doc(this.props.userRef).collection("attr").add(this.state.attrObj);
    this.setState({
      attrDialogOpen: false,
    });
  }

  onAttrUploadFile = file => {
    this.setState({
      isUploading: true,
      progress: 0,
    })
    var path = 'attr/' + this.state.userRef + '/' + file.name;
    var uploadTask = storage.ref(path).put(file);
    uploadTask.on('state_changed',
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({
          progress: progress,
        });
      }, (error) => {
      console.log(error.code);
    }, (snapshot) => {
      uploadTask.snapshot.ref.getDownloadURL().then((url) => {
        this.state.attrObj['fileRef'] = path;
        this.state.attrObj['fileUrl'] = url;
        this.setState({
          isUploading: false,
          progress: 100,
        });
      });
    });
  }

  handleTrainingObjChange = (event) => {
    this.state.trainingObj[event.target.id] = event.target.value;
  }

  addNewTraining () {
    this.setState({
      trainingDialogOpen: true,
      trainingObj: {},
    });
  }

  editTraining (training) {
    this.setState({
      trainingDialogOpen: true,
      trainingObj: training,
    })
  }

  handleTrainingDialogClose () {
    this.setState({
      trainingDialogOpen: false,
    });
  }

  handleTrainingDialogAdd () {
    database.collection("users").doc(this.props.userRef).collection("training").add(this.state.trainingObj);
    this.setState({
      trainingDialogOpen: false,
    });
  }

  render() {
    const { classes } = this.props;

    const AttrDialog = (
      <Dialog
        open={this.state.attrDialogOpen}
        onClose={this.handleAttrDialogClose}
        >
          <DialogTitle>Add New Attribute</DialogTitle>
          <DialogContent>
            <DialogContentText></DialogContentText>
            <form>
              <FormGroup>
                <TextField
                  id="name"
                  label="Name"
                  value={this.state.attrObj.name}
                  className={classes.dialogField}
                  onChange={this.handleAttrObjChange}
                />
                <TextField
                  id="date_acquired"
                  label="Date Acquired"
                  type="date"
                  className={classes.dialogField}
                  value={this.state.attrObj.date_acquired}
                  onChange={this.handleAttrObjChange}
                />
                <TextField
                  id="date_expires"
                  label="Expiry Date"
                  type="date"
                  className={classes.dialogField}
                  value={this.state.attrObj.date_expires}
                  onChange={this.handleAttrObjChange}
                />
                {
                  this.state.attrObj.fileUrl &&
                  <img src={this.state.attrObj.fileUrl} style={{width: 140, height: 'auto'}} />
                }
                <label>
                  <UploadIcon className={classes.accentButton} />
                  <input id='attr_upload_file' type='file' className={classes.hidden} onChange={e => {this.onAttrUploadFile(e.currentTarget.files[0])}} />
                  <LinearProgress variant="determinate" value={this.state.progress} />
                </label>
              </FormGroup>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAttrDialogClose} color="secondary">Cancel</Button>
            {this.state.isUploading ? <Button onClick={this.handleAttrDialogAdd} color="primary" disabled >Submit</Button>
            : <Button onClick={this.handleAttrDialogAdd} color="primary" >Submit</Button>}
          </DialogActions>
      </Dialog>);

    const TrainingDialog = (
      <Dialog
      open={this.state.trainingDialogOpen}
      onClose={this.handleTrainingDialogClose}
      >
        <DialogTitle>Log New Training Session</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <form>
            <FormGroup>
              <TextField
                id="type"
                label="Type"
                value={this.state.trainingObj.type}
                className={classes.dialogField}
                onChange={this.handleTrainingObjChange}
              />

              <TextField
                id="date"
                label="Date"
                type="date"
                className={classes.dialogField}
                value={this.state.trainingObj.date}
                onChange={this.handleTrainingObjChange}
              />
              <TextField
                id="jobnumber"
                label="Job Number"
                className={classes.dialogField}
                value={this.state.trainingObj.jobnumber}
                onChange={this.handleTrainingObjChange}
              />

              <FormControl className={classes.textField}>
                <InputLabel>Supervisor</InputLabel>
                  <Select
                    value={this.state.trainingObj.supervisor}
                    onChange={this.handleTrainingObjChange}
                  >
                    <MenuItem value="" />
                    { this.state.staffList.map((staff) => {
                      return (
                        <MenuItem value={staff}>{staff}</MenuItem>
                      )})
                    }
                  </Select>
                </FormControl>

            </FormGroup>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleTrainingDialogClose} color="secondary">Cancel</Button>
          <Button onClick={this.handleTrainingDialogAdd} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>);

    const ConfirmDeleteDialog = (
      <Dialog
        open={this.state.confirmDeleteDialogOpen}
        onClose={this.cancelDelete}
        >
          <DialogTitle>Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this item? This action cannot be undone.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancelDelete} color="secondary">Cancel</Button>
            {this.state.deleteAttrObj &&
            <Button onClick={this.deleteAttr} color="primary">Delete</Button>}
            {this.state.deleteTrainingObj &&
            <Button onClick={this.deleteTraining} color="primary">Delete</Button>}
          </DialogActions>
      </Dialog>
    );

    return (
      <div className={classes.root}>
        {this.state.user ?
          <div>
            { this.props.tab === 0 &&
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
                        />
                      </ListItem>
                      <ListItem>
                        <Typography className={classes.note}><b>Workflow Max ID:</b> {this.state.user.wfm_id}</Typography>
                      </ListItem>
                      <ListItem>
                        {/* <CreatableSelect
                          isClearable
                          className={classes.textField}
                          value={this.state.user.jobdescription}
                          onChange={this.handleReactSelectChange('jobdescription')}
                          onInputChange={this.handleReactSelectChange('jobdescription')}
                          options={jobdescriptionOptions}
                          textFieldProps={{
                            label: 'Job Description',
                            InputLabelProps: {
                              shrink: true,
                            }
                          }}
                        /> */}
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
                        onChange={this.handleChange}
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
            { this.props.tab === 1 &&
            <Grid container spacing={24} className={classes.tabContainer}>
              <Grid item xs={12} xl={6}>
                <Paper className={classes.paper} elevation={1}>
                  <List>
                      <ListItem>
                        <Typography className={classes.labels}>Qualifications</Typography>
                      </ListItem>
                      <ListItem>
                        <Button variant="outlined" className={classes.button} onClick={this.addNewAttr}>Add New</Button>
                        {AttrDialog}
                      </ListItem>
                      {this.state.attr ?
                        <div>
                          {this.state.attr.map((attr) => {
                            return (
                              <ListItem>
                                <AttrCard attr={attr} onEditClick={(e) => this.editAttr(attr)} onDeleteClick={(e) => this.handleDeleteAttrClick(attr)} />
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
            { this.props.tab === 2 &&
            <Grid container spacing={24} className={classes.tabContainer}>
              <Grid item xs={12} xl={6}>
                <Paper className={classes.paper} elevation={1}>
                  <List>
                      <ListItem>
                        <Typography className={classes.labels}>Training Log</Typography>
                      </ListItem>
                      <ListItem>
                        <Button variant="outlined" className={classes.button} onClick={this.addNewTraining}>Add New</Button>
                        {TrainingDialog}
                      </ListItem>
                      {this.state.trainings ?
                        <div>
                          {this.state.trainings.map((training) => {
                            return (
                              <ListItem>
                                <TrainingCard training={training} onEditClick={(e) => this.editTraining(training)} onDeleteClick={(e) => this.handleDeleteTrainingClick(training)} />
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
            { this.props.tab === 3 &&
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
            {ConfirmDeleteDialog}
        </div>
        :
        <Grid container spacing={24} className={classes.tabContainer}>
          <Grid item xs={12} xl={6}>
            <Paper className={classes.paper} elevation={1}>
                <List>
                  <ListItem>
                    <CircularProgress className={classes.progress} />
                  </ListItem>
                  <ListItem>
                    <Typography className={classes.labels}>
                      Loading user...
                    </Typography>
                  </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>}
      </div>
    );
  }
}

MyDetails.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyDetails);
