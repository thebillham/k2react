import React from "react";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Step from "@material-ui/core/Step";
import Stepper from "@material-ui/core/Stepper";
import StepButton from "@material-ui/core/StepButton";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";

// import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import { trainingPathsRef } from "../../config/firebase";
// import TrainingGridCol from './TrainingGridCol';
import QuizWidget from "./QuizWidget";
import TrainingNode from "./TrainingNode";
import TrainingLink from "./TrainingLink";

import ArrowBack from "@material-ui/icons/ArrowBack";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import AddCircle from "@material-ui/icons/AddCircle";
import Lock from "@material-ui/icons/Lock";
import LockOpen from "@material-ui/icons/LockOpen";

const iconStyle = {
  color: "#FF2D00",
  fontSize: 40
};

class TrainingPath extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      path: {},
      isLoading: true,
      activeStep: 0,
      completed: new Set()
    };
  }

  componentWillMount() {
    trainingPathsRef
      .doc(this.props.match.params.uid)
      .get()
      .then(doc => {
        this.setState({
          totalSteps: doc.data().steps.length,
          path: doc.data(),
          isLoading: false
        });
      });
  }

  getSteps = () => {
    let steps = [];
    this.state.path.steps.forEach(step => {
      steps.push(step.label);
    });
    return steps;
  };

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
      activeStep
    });
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1
    }));
  };

  handleStep = step => () => {
    this.setState({
      activeStep: step
    });
  };

  handleComplete = () => {
    const completed = new Set(this.state.completed);
    completed.add(this.state.activeStep);
    this.setState({
      completed
    });
    if (completed.size !== this.state.totalSteps) {
      this.handleNext();
    }
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
      completed: new Set()
    });
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

  renderNode(node) {
    switch (node.type) {
      case "quiz":
        return <QuizWidget quiz={node} />;
      case "link":
        return <TrainingLink link={node} />;
      case "reading":
        return <TrainingLink link={node} />;
      case "method":
        return <TrainingLink link={node} />;
      case "ArrowBack":
        return <ArrowBack style={iconStyle} />;
      case "ArrowDownward":
        return <ArrowDownward style={iconStyle} />;
      case "ArrowForward":
        return <ArrowForward style={iconStyle} />;
      case "ArrowUpward":
        return <ArrowUpward style={iconStyle} />;
      case "AddCircle":
        return <AddCircle style={iconStyle} />;
      case "Lock":
        return <Lock style={iconStyle} />;
      case "LockOpen":
        return <LockOpen style={{ color: "#444", fontSize: 40 }} />;
      case "spacer":
        return <Paper style={{ width: "100%", height: "100%" }}>Hello</Paper>;
      default:
        return <TrainingNode node={node} />;
    }
  }

  render() {
    const { path, activeStep, totalSteps } = this.state;

    return (
      <div style={{ marginTop: 80 }}>
        {this.state.isLoading ? (
          <div>
            <CircularProgress />
          </div>
        ) : (
          <div>
            <div
              style={{
                textAlign: "center",
                fontSize: 24,
                color: "white",
                backgroundColor: "#006D44",
                padding: 12
              }}
            >
              {path.title}
            </div>
            <Stepper nonLinear activeStep={activeStep}>
              {path.steps.map((step, index) => {
                return (
                  <Step key={step.label}>
                    <StepButton
                      onClick={this.handleStep(index)}
                      completed={this.state.completed.has(index)}
                    >
                      {step.label}
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
            <div style={{ marginTop: 12 }}>
              {this.allStepsCompleted() ? (
                <div>
                  <Typography style={{ marginBottom: 8 }}>
                    All steps completed - you're finished
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
                      <Typography
                        variant="caption"
                        style={{ display: "inline-block" }}
                      >
                        Step {activeStep + 1} already completed
                      </Typography>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleComplete}
                      >
                        {this.completedSteps() === totalSteps - 1
                          ? "Finish"
                          : "Complete Step"}
                      </Button>
                    ))}
                </div>
              )}
            </div>
            <Grid container direction="column">
              {path.steps[activeStep].rows.map(row => {
                return (
                  <Grid item key={row.key}>
                    <Grid container direction="row">
                      <Grid item xs={12} lg={6}>
                        <Grid
                          container
                          direction="column"
                          justify="center"
                          alignItems="center"
                        >
                          {row.left &&
                            row.left.map(node => {
                              return (
                                <Grid
                                  item
                                  key={node.title}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%"
                                  }}
                                >
                                  {this.renderNode(node)}
                                </Grid>
                              );
                            })}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <Grid
                          container
                          direction="column"
                          justify="center"
                          alignItems="center"
                        >
                          {row.right &&
                            row.right.map(node => {
                              return (
                                <Grid
                                  item
                                  key={node.title}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%"
                                  }}
                                >
                                  {this.renderNode(node)}
                                </Grid>
                              );
                            })}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        )}
      </div>
    );
  }
}

export default TrainingPath;
