import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import StepButton from '@material-ui/core/StepButton';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

// import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { methodsRef, usersRef, auth } from '../../config/firebase';
// import MethodNode from './MethodNode';
import store from '../../store';
import { setStepper } from '../../actions/local';

const mapStateToProps = state => {
  return {
    steppers: state.local.steppers,
    methodLog: state.local.methodLog,
  };
};

class Method extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      method: {},
      isLoading: true,
      activeStep: 0,
      completed: new Set(),
    }
  }

  componentDidMount(){
    let step = 0;
    if (this.props.steppers[this.props.match.params.uid]) step = this.props.steppers[this.props.match.params.uid];
    var completed = new Set();
    var com = [];
    var logs = [];
    this.props.methodLog.forEach(m => {
      if (m.uid === this.props.match.params.uid) {
        if (m.sections) {
          Object.keys(m.sections).forEach(k => {
            completed.add(parseInt(k));
          });
        }
      }
    });
    methodsRef.doc(this.props.match.params.uid).get().then((doc) => {
      this.setState({
        totalSteps: Object.keys(doc.data().steps).length,
        method: doc.data(),
        isLoading: false,
        completed: completed,
        com: com,
        logs: logs,
        activeStep: step,
      });
    });
  }

  handleNext = () => {
    let activeStep;

    if (this.isLastStep() && !this.allStepsCompleted()) {
      // It's the last step, but not all steps have been completed,
      // find the first step that has been completed
      const steps = this.getSteps();
      activeStep = steps.findIndex((step, i) => !this.state.completed.has(i));
    } else {
      activeStep = this.state.activeStep + 1;
    }
    this.setState({
      activeStep,
    });
    store.dispatch(setStepper(this.props.steppers, this.props.match.params.uid, this.state.activeStep));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
    store.dispatch(setStepper(this.props.steppers, this.props.match.params.uid, this.state.activeStep));
  };

  handleStep = step => () => {
    this.setState({
      activeStep: step,
    });
    store.dispatch(setStepper(this.props.steppers, this.props.match.params.uid, this.state.activeStep));
  };

  handleComplete = () => {
    const completed = new Set(this.state.completed);
    completed.add(this.state.activeStep);
    this.setState({
      completed,
    });
    this.completeMethod(this.state.activeStep);
    if (completed.size !== this.state.totalSteps) {
      this.handleNext();
    }
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
      completed: new Set(),
    });
    store.dispatch(setStepper(this.props.steppers, this.props.match.params.uid, this.state.activeStep));
  };

  isStepComplete(step) {
    return this.state.completed.has(step);
  }

  completedSteps() {
    return this.state.completed.size;
  }

  isLastStep() {
    return this.state.activeStep === this.state.totalSteps - 1;
  }

  allStepsCompleted() {
    return this.completedSteps() === this.state.totalSteps;
  }

  completeMethod = step => {
    var methodCompletedDate = '';

    usersRef.doc(auth.currentUser.uid).collection("methodlog").doc(this.props.match.params.uid).get().then((doc) => {
      let sections = {};
      if (doc.exists) sections = doc.data().steps;
      if (sections === undefined) sections = {};
      sections[step] = new Date();
      if (this.allStepsCompleted()) methodCompletedDate = sections[step];
      usersRef.doc(auth.currentUser.uid).collection("methodlog").doc(this.props.match.params.uid).set({
          methodCompleted: methodCompletedDate,
          steps: sections,
      });
    });
  }

  render() {
    const { method, activeStep, totalSteps } = this.state;

    return (
        <div style = {{ marginTop: 80 }}>
          { this.state.isLoading ?
            <div>
              <CircularProgress />
            </div>
          :
            <div>
              <div style={{ textAlign: 'center', fontSize: 24, color: 'white', backgroundColor: '#006D44', padding: 12, }}>{ method.title }</div>
                <div style={{ textAlign: 'center', fontSize: 24, color: 'white', backgroundColor: '#006D44', padding: 12, }}>{ method.tmCode }</div>
              <div style={{ textAlign: 'center', fontSize: 18, color: 'white', backgroundColor: '#006D44', padding: 12, }}>{ method.subtitle }</div>
              <Stepper nonLinear activeStep={activeStep}>
                { Object.keys(method.steps).map((key, index) => {
                  return(
                    <Step key={key}>
                      <StepButton
                        onClick={this.handleStep(index)}
                        completed={this.state.completed.has(index)}
                        >
                        {method.steps[key].title}
                      </StepButton>
                    </Step>
                  );
                })}
              </Stepper>
              <div style={{ marginTop: 12, }}>
                { this.allStepsCompleted() ? (
                  <div>
                    <Typography style = {{ marginBottom: 8, }}>
                      All sections read.
                    </Typography>
                    <Button onClick={this.handleReset}>Reset</Button>
                  </div>
                ) : (
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={this.handleBack}
                    style={{ marginRight: 12 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleNext}
                    style={{ marginRight: 12 }}
                  >
                    Next
                  </Button>
                  {activeStep !== totalSteps &&
                    (this.state.completed.has(activeStep) ? (
                      <Typography variant="caption" style={{ display: 'inline-block' }}>
                        Section {activeStep + 1} already read
                      </Typography>
                    ) : (
                      <Button variant="contained" color="primary" onClick={this.handleComplete}>
                        {this.completedSteps() === totalSteps - 1 ? 'Mark Method as Read' : 'Mark Section as Read'}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Paper style={{
                padding: 20,
                margin: 20,
                maxWidth: 800,
              }}>
                <div style={{ fontSize: 26, fontWeight: 600, color: '#004c2f', }} dangerouslySetInnerHTML={{ __html: method.steps[activeStep] && method.steps[activeStep].content}} />
              </Paper>
            </div>
        }
        </div>
      );
    }
}

export default connect(mapStateToProps)(Method);;
