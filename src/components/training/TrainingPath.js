import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';

import AddCircle from '@material-ui/icons/AddCircle';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Lock from '@material-ui/icons/Lock';
import LockOpen from '@material-ui/icons/LockOpen';

import { trainingPathsRef } from '../../config/firebase';
import { fetchStaff, fetchQuizLog, fetchMethodLog, fetchReadingLog,
  fetchQuizzes, fetchDocuments, fetchMethods,
 } from '../../actions/local';
import QuizWidget from './QuizWidget';
import TrainingNode from './TrainingNode';
import TrainingLink from './TrainingLink';
import TrainingReview from './TrainingReview';

const iconStyle = {
  color: '#FF2D00',
  fontSize: 40,
}

const mapStateToProps = state => {
  return {
    me: state.local.me,
    staff: state.local.staff,
    quizzes: state.local.quizzes,
    methods: state.local.methods,
    documents: state.local.documents,
   };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchStaff: () => dispatch(fetchStaff()),
    fetchReadingLog: () => dispatch(fetchReadingLog()),
    fetchStaff: () => dispatch(fetchStaff()),
    fetchDocuments: () => dispatch(fetchDocuments()),
    fetchMethods: () => dispatch(fetchMethods()),
    fetchQuizzes: () => dispatch(fetchQuizzes()),
    fetchQuizLog: () => dispatch(fetchQuizLog()),
    fetchMethodLog: () => dispatch(fetchMethodLog()),
  }
}

class TrainingPath extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      path: {},
      steps: [],
      isLoading: true,
      activeStep: 0,
      completed: new Set(),
    }
  }

  componentWillMount(){
    this.props.fetchStaff();
    this.props.fetchDocuments();
    this.props.fetchMethods();
    this.props.fetchQuizzes();
    this.props.fetchReadingLog();
    this.props.fetchMethodLog();
    this.props.fetchQuizLog();
    trainingPathsRef.doc(this.props.match.params.uid).get().then((doc) => {
      this.setState({
        totalSteps: doc.data().steps.length,
        path: doc.data(),
        isLoading: false,
      });
      let steps = this.getSteps();
      this.setState({
        steps: steps,
      });
    });
  }

  getSteps = () => {
    let possibleStages = [
      {
        id: 'outline',
        label: 'Outline',
      },
      {
        id: 'bgreading',
        label: 'Background Readings',
      },
      {
        id: 'practical',
        label: 'Practical Training',
      },
      {
        id: 'inhouse',
        label: 'In-House Training',
      },
      {
        id: 'sitevisits',
        label: 'Site Visits',
      },
      {
        id: 'review',
        label: 'Review',
      },
    ];
    let steps = [];
    possibleStages.forEach(stage => {
      if (this.state.path.steps[stage.id] && this.state.path.steps[stage.id].enabled) {
        steps.push(stage);
      }
    });
    return steps;
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
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleStep = step => () => {
    this.setState({
      activeStep: step,
    });
  };

  handleComplete = () => {
    const completed = new Set(this.state.completed);
    completed.add(this.state.activeStep);
    this.setState({
      completed,
    });
    if (completed.size !== this.state.totalSteps) {
      this.handleNext();
    }
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
      completed: new Set(),
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
      case 'quiz':
        return (<QuizWidget quiz={node} />);
      case 'link':
        return (<TrainingLink link={node} />);
      case 'reading':
        return (<TrainingLink link={node} />);
      case 'method':
        return (<TrainingLink link={node} />);
      case 'review':
        return (<TrainingReview path={this.state.path} />)
      case 'ArrowBack':
        return (<ArrowBack style={iconStyle} />);
      case 'ArrowDownward':
        return (<ArrowDownward style={iconStyle} />);
      case 'ArrowForward':
        return (<ArrowForward style={iconStyle} />);
      case 'ArrowUpward':
        return (<ArrowUpward style={iconStyle} />);
      case 'AddCircle':
        return (<AddCircle style={iconStyle} />);
      case 'Lock':
        return (<Lock style={iconStyle} />);
      case 'LockOpen':
        return (<LockOpen style={{ color: '#444', fontSize: 40, }} />);
      case 'spacer':
        return(<Paper style={{ width: '100%', height: '100%'}}>Hello</Paper>);
      default:
        return (<TrainingNode node={node} />);
    }
  }

  getTrainingHtml = () => {
    const { path } = this.state;
    const staff = { ...this.props.staff, [this.props.me.uid]: this.props.me };
    if ((path.trainers && path.trainers.length > 0) || (path.ktp && path.ktp.length > 0)) {
      let trainers = [];
      let ktp = [];
      let html = '<b>Trainers</b><br />';
      path.trainers && path.trainers.forEach(trainer => {
        html = html + (staff[trainer] && staff[trainer].name) + '<br/>';
      });
      html = html + '<br /><b>KTP</b><br />';
      path.ktp && path.ktp.forEach(trainer => {
        html = html + (staff[trainer] && staff[trainer].name) + '<br/>';
      });
      return html;
    } else {
      return 'No staff assigned.'
    }
  }

  getStageProgress = stage => {
    const { path } = this.state;
    const { me } = this.props;
    if (stage === 'bgreading') {
      let totalReadings = path.steps.bgreading && path.steps.bgreading.requiredreadings && path.steps.bgreading.requiredreadings.length;
      let readingsCompleted = me.readingLog && me.readingLog.filter(log => path.steps.bgreading && path.steps.bgreading.requiredreadings && path.steps.bgreading.requiredreadings.includes(log.uid));
      let suppTotalReadings = path.steps.bgreading && path.steps.bgreading.supplementaryreadings && path.steps.bgreading.supplementaryreadings.length;
      let suppReadingsCompleted = me.readingLog && me.readingLog.filter(log => path.steps.bgreading && path.steps.bgreading.supplementaryreadings && path.steps.bgreading.supplementaryreadings.includes(log.uid));
      let quiztext = '';
      let quizlog = me.quizLog && me.quizLog.filter(log => log.uid === path.steps.bgreading.quiz)[0];
      if (!path.steps.bgreading.quiz) {
        quiztext = 'There is no quiz for this section.';
      } else if (!quizlog) {
        quiztext = 'You have not completed the quiz.';
      } else {
        let hiScore = 0;
        let totalScore = 0;
        let totalTries = 0;
        quizlog.scores && quizlog.scores.forEach(score => {
          totalTries = totalTries + 1;
          totalScore = totalScore + score.score;
          if (score.score > hiScore) hiScore = score.score;
        });
        let latestScore = quizlog.scores[totalTries - 1].score;
        let averageScore = Math.round(10 * totalScore / totalTries) / 10;

        quiztext = `Your latest score in the quiz is ${latestScore}%, your highest score is ${hiScore}% and your average score from ${totalTries} attempts is ${averageScore}%`;
      }

      let readingsUpdated = readingsCompleted && readingsCompleted.filter(reading => reading.date < reading.updatedate);
      let suppReadingsUpdated = suppReadingsCompleted && suppReadingsCompleted.filter(reading => reading.date < reading.updatedate);
      let updatetext = '';
      if (readingsUpdated && readingsUpdated.length > 0) updatetext = `<li>${readingsUpdated.length} required readings have had important updates since they were last read.</li>`;
      if (suppReadingsUpdated && suppReadingsUpdated.length > 0) updatetext = updatetext + `<li>${suppReadingsUpdated} supplementary readings have had important updates since they were last read.</li>`;

      return `<ul><li>You have completed ${readingsCompleted && readingsCompleted.length} of ${totalReadings} required readings.</li><li>You have completed ${suppReadingsCompleted && suppReadingsCompleted.length} of ${suppTotalReadings} supplementary readings.</li><li>${quiztext}</li>${updatetext}`;
    } else if (stage === 'practical') {
      let totalMethods = 5;
      let methodsRead = [{}, {}, {}];
      let suppTotalMethods = 2;
      let suppMethodsRead = 2;
      let methodsQuiz = 1;
      let suppMethodsQuiz = 2;
      return `<ul><li>You have read ${methodsRead && methodsRead.length} of ${totalMethods} required methods</li></ul>`
    } else if (stage === 'inhouse') {
      let totalCheck = 21;
      let checkComplete = 11;
      return `You have completed ${checkComplete} tasks out of ${totalCheck}.`
    } else if (stage === 'sitevisits') {
      let jobTypes = [
        {
          name: 'Job type 1',
          completed: 2,
          total: 3,
        },
        {
          name: 'Job type 2',
          completed: 1,
          total: 3,
        },
        {
          name: 'Job type 3',
          completed: 0,
          total: 3,
        },
      ];
      let html = '<ul>';
      html = html + jobTypes.map(type => (`<li>You have completed ${type.completed} of ${type.total} site visits for ${type.name}</li>`));
      html = html + '</ul';
      return html;
    } else {
      return 'No data.';
    }
  }

  renderPage = page => {
    const { path } = this.state;
    const { quizzes } = this.props;

    const outline = (
      <Grid item>
        <Grid container direction='row'>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Training Outline', text: path.steps.outline.outline }) }
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Training Staff', text: this.getTrainingHtml()}) }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );

    const bgreading = (
      <Grid item>
        <Grid container direction='row'>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Background Reading', text: path.steps.bgreading.outline }) }
              </Grid>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Background Readings', text: path.steps.bgreading.requiredcaption, links:
                  path.steps.bgreading.requiredreadings.map(uid => this.props.documents.filter(doc => doc.uid === uid)[0])
                  .concat(quizzes.filter(quiz => (quiz.uid === path.steps.bgreading.quiz))[0]) }) }
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Stage Progress', text: this.getStageProgress('bgreading')}) }
              </Grid>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Supplementary Readings', text: path.steps.bgreading.supplementarycaption, links: path.steps.bgreading.supplementaryreadings.map(uid => this.props.documents.filter(doc => doc.uid === uid)[0]) }) }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );

    const practical = (
      <Grid item>
        <Grid container direction='row'>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Practical Training', text: path.steps.practical.outline }) }
              </Grid>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Required Methods', text: path.steps.practical.requiredcaption, links:
                  path.steps.practical.requiredmethods.map(uid => this.props.methods.filter(doc => doc.uid === uid)[0]) }) }
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Stage Progress', text: this.getStageProgress('practical')}) }
              </Grid>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Additional Training', text: path.steps.practical.supplementarycaption, links:
                  path.steps.practical.supplementarymethods.map(uid => this.props.methods.filter(doc => doc.uid === uid)[0]) }) }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );

    const inhouse = (
      <Grid item>
        <Grid container direction='row'>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'In-House Training', text: path.steps.inhouse.outline }) }
              </Grid>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Checklist', text: 'Complete the following tasks.', links: path.steps.inhouse.checklist }) }
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Stage Progress', text: this.getStageProgress('inhouse')}) }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );

    const sitevisits = (
      <Grid item>
        <Grid container direction='row'>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Site Visits', text: path.steps.sitevisits.outline }) }
              </Grid>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Required Methods', text: 'The following methods must be read before starting in-house training. A short quiz follows each one to assess comprehension.', links: path.steps.sitevisits.requiredmethods }) }
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container direction='column' justify='center' alignItems='center'>
              <Grid item style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                { this.renderNode({ title: 'Stage Progress', text: this.getStageProgress('sitevisits')}) }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );

    const review = (
      this.renderNode({ type: 'review'})
    );

    switch (page) {
      case 'outline':
        return outline;
        break;
      case 'bgreading':
        return bgreading;
        break;
      case 'practical':
        return practical;
        break;
      case 'inhouse':
        return inhouse;
        break;
      case 'sitevisits':
        return sitevisits;
        break;
      case 'review':
        return review;
        break;
      default:
        return outline;
    }
  }

  render() {
    const { path, activeStep, totalSteps, steps } = this.state;

    return (
        <div style = {{ marginTop: 80 }}>
          { this.state.isLoading ?
            <div>
              <CircularProgress />
            </div>
          :
            <div>
              <div style={{ textAlign: 'center', fontSize: 24, color: 'white', backgroundColor: '#006D44', padding: 12, }}>{ path.title }</div>
              <Stepper nonLinear activeStep={activeStep}>
                { steps.map((step, index) => {
                  return(
                    <Step key={step.id}>
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
              <div style={{ marginTop: 12, }}>
                { this.allStepsCompleted() ? (
                  <div>
                    <Typography style = {{ marginBottom: 8, }}>
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
                      <Typography variant="caption" style={{ display: 'inline-block' }}>
                        Step {activeStep + 1} already completed
                      </Typography>
                    ) : (
                      <Button variant="contained" color="primary" onClick={this.handleComplete}>
                        {this.completedSteps() === totalSteps - 1 ? 'Finish' : 'Complete Step'}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Grid container direction='column'>
              {
                steps && steps[activeStep] && this.renderPage(steps[activeStep].id)
              }
              </Grid>
            </div>
        }
        </div>
      );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrainingPath);
