import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import { WFM_TIME } from "../../../constants/modal-types";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import { hideModal } from "../../../actions/modal";
import { setLastTimeSaved } from "../../../actions/jobs";
import Select from "react-select";

import { andList } from "../../../actions/helpers";
import { getTaskID } from "../../../actions/jobs";
import moment from "moment";

import { DatePicker, TimePicker } from "@material-ui/pickers";

const mapStateToProps = (state) => {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps,
    me: state.local.me,
    staff: state.local.staff,
    wfmJobs: state.jobs.wfmJobs,
    lastTimeSaved: state.jobs.lastTimeSaved,
    wfmAccessToken: state.local.wfmAccessToken,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideModal: () => dispatch(hideModal()),
    setLastTimeSaved: (time) => dispatch(setLastTimeSaved(time)),
  };
};

// const initState = {};

// const rowInit = {
//   staff: [],
//   jobs: [],
//   task: null,
//   note: '',
//   startTime: null,
//   endTime: null,
// };
const initState = {
  staff: [],
  jobs: [],
  task: null,
  note: "",
  startTime: null,
  endTime: null,
  comboTravelStart: null,
  comboSiteWorkStart: null,
  comboSiteWorkFinish: null,
  comboTravelFinish: null,
  status: null,
};

const taskIDs = [
  {
    label: "Travel and Site Work",
  },
  {
    label: "Travel",
    value: process.env.REACT_APP_WFM_TASK_TRAVEL,
  },
  {
    label: "Site Work",
    value: process.env.REACT_APP_WFM_TASK_SITEWORK,
  },
  {
    label: "Analysis",
    value: process.env.REACT_APP_WFM_TASK_ANALYSIS,
  },
  {
    label: "Report Writing",
    value: process.env.REACT_APP_WFM_TASK_REPORT,
  },
  {
    label: "Report Checking",
    value: process.env.REACT_APP_WFM_TASK_REVIEW,
  },
  {
    label: "Report KTPing",
    value: process.env.REACT_APP_WFM_TASK_KTP,
  },
  {
    label: "Training",
    value: process.env.REACT_APP_WFM_TASK_TRAINING,
  },
  {
    label: "Pre-Site Preparation",
    value: process.env.REACT_APP_WFM_TASK_PRE_SITE_PREPARATION,
  },
  {
    label: "Proposal Writing",
    value: process.env.REACT_APP_WFM_TASK_PROPOSAL_WRITING,
  },
  {
    label: "Consulting",
    value: process.env.REACT_APP_WFM_TASK_CONSULTING,
  },
  {
    label: "Report Issue",
    value: process.env.REACT_APP_WFM_TASK_REPORT_ISSUE,
  },
];

class WfmTimeModal extends React.Component {
  state = initState;

  loadProps = (fresh) => {
    let job =
      this.props.modalProps && this.props.modalProps.job
        ? this.props.modalProps.job
        : null;
    let lastTimeSaved = this.props.lastTimeSaved
      ? this.props.lastTimeSaved
      : null;
    this.setState({
      staff:
        this.state.staff.length > 0
          ? this.state.staff
          : [
              {
                value: this.props.me.wfmUUID,
                label: this.props.me.name,
              },
            ],
      jobs:
        this.state.jobs.length > 0
          ? this.state.jobs
          : job
          ? [
              {
                value: job.jobNumber,
                label: `${job.jobNumber} ${job.client}`,
              },
            ]
          : [],
      date: new Date(),
      startTime: fresh ? null : lastTimeSaved,
      endTime: fresh ? null : new Date(),
      comboTravelStart: fresh ? null : moment().subtract(4, "hours"),
      comboSiteWorkStart: fresh ? null : moment().subtract(3.5, "hours"),
      comboSiteWorkFinish: fresh ? null : moment().subtract(0.5, "hours"),
      comboTravelFinish: fresh ? null : new Date(),
      note: "",
    });
  };

  clearProps = () => {
    if (this.state.endTime) this.props.setLastTimeSaved(this.state.endTime);
    this.setState(initState);
  };

  addWfmTime = (close) => {
    // console.log('Getting WFM Time');
    // [...Array(defaultRows).keys()].forEach(num => {
    //   // Check if has been filled in
    //   let k = `${num+1}`,
    //     item = this.state[k];
    let item = this.state;
    let tasks = [];
    if (item.staff.length > 0 && item.jobs.length > 0 && item.task !== null) {
      if (
        item.task.label === "Travel and Site Work" &&
        item.comboTravelStart &&
        item.comboSiteWorkStart &&
        item.comboSiteWorkFinish &&
        item.comboTravelFinish
      ) {
        tasks = [
          {
            task: process.env.REACT_APP_WFM_TASK_TRAVEL,
            startTime: item.comboTravelStart,
            endTime: item.comboSiteWorkStart,
          },
          {
            task: process.env.REACT_APP_WFM_TASK_SITEWORK,
            startTime: item.comboSiteWorkStart,
            endTime: item.comboSiteWorkFinish,
          },
          {
            task: process.env.REACT_APP_WFM_TASK_TRAVEL,
            startTime: item.comboSiteWorkFinish,
            endTime: item.comboTravelFinish,
          },
        ];
      } else if (item.startTime) {
        tasks = [
          {
            task: item.task.value,
            startTime: item.startTime,
            endTime: item.endTime,
          },
        ];
      }
      tasks.forEach((t) => {
        // Prepare job for API
        let task = t.task,
          day = moment(item.date).format("YYYYMMDD"),
          startTime = moment(t.startTime).format("HH:mm"),
          originalStartTime = startTime,
          endTime = moment(t.endTime).format("HH:mm"),
          minutes = moment(t.endTime).diff(t.startTime, "minutes"),
          minutesOffset = 0,
          note = item.note;

        if (minutes === 0) {
          endTime = moment(t.endTime).add(1, "minutes").format("HH:mm");
          minutes = 1;
        }
        let totalMinutes = minutes;

        item.jobs.forEach((job) => {
          // console.log(job);
          let noteAddendum = "";
          let jobNote = note;
          if (item.jobs.length > 1) {
            let sharedJobList = [];
            item.jobs.forEach((sharedJob) => {
              if (sharedJob !== job) sharedJobList.push(sharedJob.label);
            });
            noteAddendum = `Time shared with ${andList(
              sharedJobList
            )} (Time has already been divided up by MyK2)`;
            if (jobNote !== "") jobNote = `${jobNote}\n${noteAddendum}`;
            else jobNote = noteAddendum;
            if (startTime === originalStartTime) {
              minutes = parseInt(totalMinutes / item.jobs.length);
              if (minutes === 0) minutes = 1;
              minutesOffset = minutes;
              endTime = moment(t.startTime)
                .add(minutesOffset, "minutes")
                .format("HH:mm");
            }
          }
          item.staff.forEach((staff) => {
            // console.log(staff);
            let data = {
              job: job.value,
              task,
              staff: staff.value,
              day,
              startTime,
              endTime,
              minutes,
              note: jobNote,
              accessToken: this.props.wfmAccessToken,
            };
            this.setState({
              status: "Loading",
            });
            getTaskID(data, this);
          });
          if (item.jobs.length > 1) {
            // console.log(startTime);
            // console.log(endTime);
            startTime = endTime;
            minutes = parseInt(totalMinutes / item.jobs.length);
            if (minutes === 0) minutes = 1;
            minutesOffset = minutesOffset + minutes;
            endTime = moment(item.startTime)
              .add(minutesOffset, "minutes")
              .format("HH:mm");
            // console.log(minutes);
            // console.log(minutesOffset);
            // console.log(startTime);
            // console.log(endTime);
          }
        });
      });
    }
    if (close) this.props.hideModal();
    else this.loadProps(true);
  };

  bumpDates = () => {
    if (
      this.state.comboTravelStart &&
      this.state.comboSiteWorkStart &&
      this.state.comboSiteWorkFinish &&
      this.state.comboTravelFinish &&
      this.state.comboTravelStart < this.state.comboSiteWorkStart &&
      this.state.comboSiteWorkStart < this.state.comboSiteWorkFinish &&
      this.state.comboSiteWorkFinish < this.state.comboTravelFinish
    )
      return true;
    else return false;
    // let comboSiteWorkStart = this.state.comboSiteWorkStart;
    // let comboSiteWorkFinish = this.state.comboSiteWorkFinish;
    // let comboTravelFinish = this.state.comboTravelFinish;
    // if (comboSiteWorkStart && comboSiteWorkStart < comboTravelStart) {
    //   let difference = 1;
    //   // Keep the difference between the two dates the same if possible
    //   if (this.state.comboTravelStart) difference = moment(comboSiteWorkStart).diff(this.state.comboTravelStart, 'hours', true);
    //   comboSiteWorkStart = moment(comboTravelStart).add(difference, 'hour');
    //   if (comboSiteWorkStart && comboSiteWorkStart < comboTravelStart) {
    //     let difference = 1;
    //     // Keep the difference between the two dates the same if possible
    //     if (this.state.comboTravelStart) difference = moment(comboSiteWorkStart).diff(this.state.comboTravelStart, 'hours', true);
    //     comboSiteWorkStart = moment(comboTravelStart).add(difference, 'hour');
    //   }
    // }
  };

  render() {
    const { classes, modalType } = this.props;
    const names = Object.values(this.props.staff)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((e) => ({ value: e.wfmUUID, label: e.name }));
    const jobNumbers = Object.values(this.props.wfmJobs)
      .sort((a, b) => a.jobNumber.localeCompare(b.jobNumber))
      .map((e) => ({
        value: e.jobNumber,
        label: `${e.jobNumber} ${e.client}`,
      }));
    // console.log(jobNumbers);
    // console.log(names);
    let noSubmit = true;
    // [...Array(defaultRows).keys()].forEach(num => {
    //   if (this.state[`${num+1}`] &&
    //     this.state[`${num+1}`].staff.length > 0 &&
    //     this.state[`${num+1}`].jobs.length > 0 &&
    //     this.state[`${num+1}`].task !== null &&
    //     this.state[`${num+1}`].startTime !== null
    //   ) noSubmit = false;
    // });
    if (
      this.state.task &&
      this.state.task.label === "Travel and Site Work" &&
      this.state.staff.length > 0 &&
      this.state.jobs.length > 0 &&
      this.state.task !== null &&
      this.state.comboTravelStart !== null &&
      this.state.comboSiteWorkStart !== null &&
      this.state.comboSiteWorkFinish !== null &&
      this.state.comboTravelFinish !== null
    )
      noSubmit = false;
    else if (
      this.state.staff.length > 0 &&
      this.state.jobs.length > 0 &&
      this.state.task !== null &&
      this.state.startTime !== null &&
      this.state.endTime !== null
    )
      noSubmit = false;

    // console.log(noSubmit);

    return (
      <div>
        {modalType === WFM_TIME && (
          <Dialog
            open={modalType === WFM_TIME}
            onClose={this.props.hideModal}
            maxWidth="sm"
            fullWidth={true}
            onEnter={() => this.loadProps(false)}
            onExit={this.clearProps}
          >
            <DialogTitle>Add Time to WorkflowMax</DialogTitle>
            <DialogContent>
              {this.state.status === "Loading" ? (
                <div
                  style={{ width: "100%" }}
                  className={classes.flexRowCenter}
                >
                  <CircularProgress color="secondary" size={32} />
                </div>
              ) : (
                <div>
                  <Select
                    style={{ width: "100%" }}
                    isMulti
                    className={classes.selectTight}
                    value={this.state.jobs}
                    options={jobNumbers}
                    onChange={(e) => this.setState({ jobs: e })}
                  />
                  <Select
                    style={{ width: "100%" }}
                    isMulti
                    className={classes.selectTight}
                    value={this.state.staff}
                    options={names}
                    onChange={(e) => this.setState({ staff: e })}
                  />
                  <Select
                    style={{ width: "100%" }}
                    className={classes.selectTight}
                    value={this.state.task}
                    options={taskIDs}
                    onChange={(e) => this.setState({ task: e })}
                  />
                  {this.state.task &&
                  this.state.task.label === "Travel and Site Work" ? (
                    <div className={classes.flexRowSpread}>
                      <DatePicker
                        style={{ width: "100%" }}
                        value={this.state.date}
                        autoOk
                        label="Day"
                        openTo="date"
                        onChange={(date) => {
                          this.setState({ date });
                        }}
                      />
                      <TimePicker
                        style={{ width: "100%" }}
                        value={this.state.comboTravelStart}
                        autoOk
                        label="Travel Start"
                        onChange={(comboTravelStart) =>
                          this.setState({ comboTravelStart })
                        }
                      />
                      <TimePicker
                        style={{ width: "100%" }}
                        value={this.state.comboSiteWorkStart}
                        autoOk
                        label="Site Work Start"
                        onChange={(comboSiteWorkStart) =>
                          this.setState({ comboSiteWorkStart })
                        }
                      />
                      <TimePicker
                        style={{ width: "100%" }}
                        value={this.state.comboSiteWorkFinish}
                        autoOk
                        label="Site Work Finish"
                        onChange={(comboSiteWorkFinish) =>
                          this.setState({ comboSiteWorkFinish })
                        }
                      />
                      <TimePicker
                        style={{ width: "100%" }}
                        value={this.state.comboTravelFinish}
                        autoOk
                        label="Travel Finish"
                        onChange={(comboTravelFinish) =>
                          this.setState({ comboTravelFinish })
                        }
                      />
                    </div>
                  ) : (
                    <div className={classes.flexRowSpread}>
                      <DatePicker
                        style={{ width: "100%" }}
                        value={this.state.date}
                        autoOk
                        label="Day"
                        openTo="date"
                        onChange={(date) => {
                          this.setState({ date });
                        }}
                      />
                      <TimePicker
                        style={{ width: "100%" }}
                        value={this.state.startTime}
                        autoOk
                        label="From"
                        onChange={(startTime) => {
                          let endTime = this.state.endTime;
                          if (endTime && endTime < startTime) {
                            let difference = 1;
                            // Keep the difference between the two dates the same if possible
                            if (this.state.startTime)
                              difference = moment(endTime).diff(
                                this.state.startTime,
                                "hours",
                                true
                              );
                            endTime = moment(startTime).add(difference, "hour");
                          }
                          this.setState({ startTime, endTime });
                        }}
                      />
                      <TimePicker
                        style={{ width: "100%" }}
                        value={this.state.endTime}
                        autoOk
                        label="To"
                        onChange={(endTime) => {
                          let startTime = this.state.startTime;
                          if (startTime && startTime > endTime) {
                            let difference = -1;
                            // Keep the difference between the two dates the same if possible
                            if (this.state.endTime)
                              difference = moment(startTime).diff(
                                this.state.endTime,
                                "hours",
                                true
                              );
                            startTime = moment(endTime).add(difference, "hour");
                          }
                          this.setState({ startTime, endTime });
                        }}
                      />
                    </div>
                  )}
                  <TextField
                    style={{ width: "100%" }}
                    label={"Note"}
                    multiline
                    rows={5}
                    defaultValue={this.state.note}
                    onChange={(e) => this.setState({ note: e.target.value })}
                  />
                </div>
              )}
              {/*[...Array(defaultRows).keys()].map(num => {
            return num === 0 && this.state[`${num+1}`] ? this.getItemRow(num, jobNumbers, names) : null;
            // console.log(this.state[`${num+1}`]);
            // if (this.state[`${num+1}`] && num === 0 ? true :
            //   (this.state[`${num}`] &&
            //     this.state[`${num}`].staff.length > 0 &&
            //     this.state[`${num}`].jobs.length > 0 &&
            //     this.state[`${num}`].task !== null &&
            //     this.state[`${num}`].startTime !== null
            //     )
            //   ) return this.state[`${num+1}`] ? this.getItemRow(num, jobNumbers, names) : null;
            // else return null;
          })*/}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.props.hideModal()} color="secondary">
                Cancel
              </Button>
              <Button
                disabled={noSubmit}
                onClick={() => this.addWfmTime(false)}
              >
                Save and Add Another
              </Button>
              <Button
                disabled={noSubmit}
                onClick={() => this.addWfmTime(true)}
                color="primary"
              >
                Submit and Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }

  // getItemRow = (num, jobNumbers, names) => {
  //   let k = `${num+1}`,
  //     classes = this.props.classes;
  //   console.log(k);
  //   return(
  //     <Grid container key={num} direction="row" justify="space-between" alignItems="flex-end">
  //       <Grid item xs={3}>
  //         <div className={classes.flexRowLeftAlignEllipsis}>
  //           <div style={{ width: 80, }}>
  //             {this.state[k].status === "Loading" && <CircularProgress color="secondary" size={8} />}
  //           </div>
  //           <Select
  //             style={{width: '100%'}}
  //             isMulti
  //             className={classes.selectTight}
  //             value={this.state[k].jobs}
  //             options={jobNumbers}
  //             onChange={e =>
  //               this.setState({ [k]: {...this.state[k], jobs: e }})
  //             }
  //           />
  //         </div>
  //       </Grid>
  //       <Grid item xs={2}>
  //         <Select
  //           style={{width: '100%'}}
  //           isMulti
  //           className={classes.selectTight}
  //           value={this.state[k].staff}
  //           options={names}
  //           onChange={e =>
  //             this.setState({ [k]: {...this.state[k], staff: e }})
  //           }
  //           />
  //       </Grid>
  //       <Grid item xs={2}>
  //         <Select
  //           style={{width: '100%'}}
  //           className={classes.selectTight}
  //           value={this.state[k].task}
  //           options={taskIDs}
  //           onChange={e =>
  //             this.setState({ [k]: {...this.state[k], task: e }})
  //           }
  //         />
  //       </Grid>
  //       <Grid item xs={1}>
  //         <DatePicker
  //           style={{width: '100%'}}
  //           value={this.state[k].date}
  //           autoOk
  //           label="Day"
  //           openTo="date"
  //           onChange={date => {
  //             this.setState({ [k]: {...this.state[k], date }})
  //           }}
  //         />
  //       </Grid>
  //       <Grid item xs={1}>
  //         <TimePicker
  //           style={{width: '100%'}}
  //           value={this.state[k].startTime}
  //           autoOk
  //           label="From"
  //           openTo="date"
  //           onChange={startTime => {
  //             let endTime = this.state[k].endTime;
  //             if (endTime && endTime < startTime) {
  //               let difference = 1;
  //               // Keep the difference between the two dates the same if possible
  //               if (this.state[k].startTime) difference = moment(endTime).diff(this.state[k].startTime, 'hours', true);
  //               endTime = moment(startTime).add(difference, 'hour');
  //             }
  //               this.setState({ [k]: {...this.state[k], startTime, endTime, }})
  //           }}
  //         />
  //       </Grid>
  //       <Grid item xs={1}>
  //         <TimePicker
  //             style={{width: '100%'}}
  //             value={this.state[k].endTime}
  //             autoOk
  //             label="To"
  //             openTo="date"
  //             onChange={endTime => {
  //               let startTime = this.state[k].startTime;
  //               if (startTime && startTime > endTime) {
  //                 let difference = -1;
  //                 // Keep the difference between the two dates the same if possible
  //                 if (this.state[k].endTime) difference = moment(startTime).diff(this.state[k].endTime, 'hours', true);
  //                 startTime = moment(endTime).add(difference, 'hour');
  //               }
  //               this.setState({ [k]: {...this.state[k], startTime, endTime, }})
  //             }}
  //           />
  //       </Grid>
  //       <Grid item xs={2}>
  //         <TextField
  //       style={{width: '100%'}}
  //       label={'Note'}
  //       multiline
  //       defaultValue={this.state[k].note}
  //       onChange={e => {
  //         this.setState({ [k]: {...this.state[k], note: e.target.value, }});
  //       }}
  //     />
  //       </Grid>
  //     </Grid>
  //   );
  // }

  getItemRow = (num, jobNumbers, names) => {
    let k = `${num + 1}`,
      classes = this.props.classes;
    console.log(k);
    return (
      <div key={num}>
        <Select
          style={{ width: "100%" }}
          isMulti
          className={classes.selectTight}
          value={this.state[k].jobs}
          options={jobNumbers}
          onChange={(e) =>
            this.setState({ [k]: { ...this.state[k], jobs: e } })
          }
        />
        <Select
          style={{ width: "100%" }}
          isMulti
          className={classes.selectTight}
          value={this.state[k].staff}
          options={names}
          onChange={(e) =>
            this.setState({ [k]: { ...this.state[k], staff: e } })
          }
        />
        <Select
          style={{ width: "100%" }}
          className={classes.selectTight}
          value={this.state[k].task}
          options={taskIDs}
          onChange={(e) =>
            this.setState({ [k]: { ...this.state[k], task: e } })
          }
        />
        <div className={classes.flexRowSpread}>
          <DatePicker
            style={{ width: "100%" }}
            value={this.state[k].date}
            autoOk
            label="Day"
            openTo="date"
            onChange={(date) => {
              this.setState({ [k]: { ...this.state[k], date } });
            }}
          />
          <TimePicker
            style={{ width: "100%" }}
            value={this.state[k].startTime}
            autoOk
            label="From"
            openTo="date"
            onChange={(startTime) => {
              let endTime = this.state[k].endTime;
              if (endTime && endTime < startTime) {
                let difference = 1;
                // Keep the difference between the two dates the same if possible
                if (this.state[k].startTime)
                  difference = moment(endTime).diff(
                    this.state[k].startTime,
                    "hours",
                    true
                  );
                endTime = moment(startTime).add(difference, "hour");
              }
              this.setState({ [k]: { ...this.state[k], startTime, endTime } });
            }}
          />
          <TimePicker
            style={{ width: "100%" }}
            value={this.state[k].endTime}
            autoOk
            label="To"
            openTo="date"
            onChange={(endTime) => {
              let startTime = this.state[k].startTime;
              if (startTime && startTime > endTime) {
                let difference = -1;
                // Keep the difference between the two dates the same if possible
                if (this.state[k].endTime)
                  difference = moment(startTime).diff(
                    this.state[k].endTime,
                    "hours",
                    true
                  );
                startTime = moment(endTime).add(difference, "hour");
              }
              this.setState({ [k]: { ...this.state[k], startTime, endTime } });
            }}
          />
        </div>
        <TextField
          style={{ width: "100%" }}
          label={"Note"}
          multiline
          rows={5}
          defaultValue={this.state[k].note}
          onChange={(e) =>
            this.setState({ [k]: { ...this.state[k], note: e.target.value } })
          }
        />
        {this.state[k].status === "Loading" && (
          <CircularProgress color="secondary" size={8} />
        )}
      </div>
    );
  };
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(WfmTimeModal)
);
