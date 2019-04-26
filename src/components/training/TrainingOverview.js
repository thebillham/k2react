import React from "react";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter
} from "react-router-dom";
import { connect } from "react-redux";

import Button from "@material-ui/core/Button";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";

import Edit from "@material-ui/icons/Edit";

import {
  TRAINING,
  QUIZ,
  QUESTION,
  DOCUMENT
} from "../../constants/modal-types";
import {
  fetchTrainingPaths,
  fetchStaff,
  fetchDocuments,
  fetchMethods,
  fetchQuizzes
} from "../../actions/local";
import { showModal } from "../../actions/modal";
import TrainingModuleModal from "./TrainingModuleModal";
import QuizModal from "../quizzes/QuizModal";
import QuestionModal from "../quizzes/QuestionModal";
import DocumentModal from "../library/DocumentModal";

const mapStateToProps = state => {
  return {
    me: state.local.me,
    paths: state.local.trainingpaths
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTrainingPaths: () => dispatch(fetchTrainingPaths()),
    fetchStaff: () => dispatch(fetchStaff()),
    fetchDocuments: () => dispatch(fetchDocuments()),
    fetchMethods: () => dispatch(fetchMethods()),
    fetchQuizzes: () => dispatch(fetchQuizzes()),
    showModal: modal => dispatch(showModal(modal))
  };
};

class TrainingOverview extends React.Component {
  componentWillMount() {
    this.props.fetchTrainingPaths();
  }
  render() {
    return (
      <div style={{ marginTop: 80 }}>
        {this.props.me.auth["Training Editor"] && (
          <div>
            <Button
              variant="outlined"
              style={{ marginBottom: 16 }}
              onClick={() => {
                let doc = {
                  title: "",
                  subtitle: "",
                  img: "",
                  trainers: [],
                  ktp: [],
                  steps: {
                    outline: {
                      enabled: true,
                      outline:
                        "<p>By the end of this module you will be able to complete X.</p><p><br></p><p>This covers:</p><ul><li>Thing 1</li><li>Thing 2</li></ul><p><br></p><p>If at any time you need assistance with the content in this module please speak to a trained team member.</p>"
                    },
                    bgreading: {
                      enabled: true,
                      outline:
                        "<p>This stage covers the background knowledge required to understand X.</p><p><br></p><p>By the end of this stage you should understand:</p><ul><li>Concept 1</li><li>Concept 2</li><li>Concept 3</li></ul>",
                      requiredcaption:
                        "Prior to undertaking X, you must have read the following documents.",
                      requiredreadings: [],
                      quiz: "",
                      supplementarycaption:
                        "Additional readings are below, it is not required that you have read these prior to X.",
                      supplementaryreadings: [],
                      readinglog: [],
                      quizlog: []
                    },
                    practical: {
                      enabled: true,
                      outline:
                        '<p>This stage covers the practical aspects of X.</p><p><br></p><p>By the end of this stage you should understand:</p><ul><li>How to use the following X equipment:</li><li class="ql-indent-1">Equipment 1</li><li class="ql-indent-1">Equipment 2</li><li class="ql-indent-1">Equipment 3</li><li>Skill 2</li><li>Skill 3</li><li>Skill 4</li></ul>',
                      requiredcaption:
                        "The following methods must be read before starting in-house training. A short quiz follows each one to assess comprehension.",
                      requiredmethods: [],
                      supplementarycaption:
                        "The following methods detail less common sampling techniques and procedures.",
                      supplementarymethods: [],
                      methodlog: [],
                      quizlog: []
                    },
                    inhouse: {
                      enabled: true,
                      outline:
                        "<p>In this stage you will undertake a mock biological assessment through to completion.</p><p><br></p><p>By the end of this stage you should understand:</p><ul><li>Task 1</li><li>Task 2</li><li>Task 3</li></ul>",
                      checklist: []
                    },
                    jobtypes: {},
                    sitevisits: {
                      enabled: true,
                      outline:
                        "In this stage you will conduct supervised visits on sites. These will be assessed by a trained site technician.",
                      jobtypes: [
                        {
                          name: "",
                          number: 0
                        }
                      ]
                    },
                    review: {
                      enabled: true
                    }
                  }
                };
                this.props.fetchStaff();
                this.props.fetchDocuments();
                this.props.fetchMethods();
                this.props.fetchQuizzes();
                this.props.showModal({
                  modalType: TRAINING,
                  modalProps: { title: "Add New Training Path", doc: doc }
                });
              }}
            >
              Add New Training Path
            </Button>
            {/*<Button variant='outlined' style={{ marginBottom: 16, marginLeft: 16, }} onClick={() => {
                this.props.showModal({ modalType: QUIZ, modalProps: { title: 'Add New Quiz', } })}}>
                Add New Quiz
              </Button>
              <Button variant='outlined' style={{ marginBottom: 16, marginLeft: 16, }} onClick={() => {
                this.props.showModal({ modalType: QUESTION, modalProps: { title: 'Add New Quiz Question', } })}}>
                Add New Quiz Question
              </Button>
              <Button variant='outlined' style={{ marginBottom: 16, marginLeft: 16, }} onClick={() => {
                this.props.showModal({ modalType: DOCUMENT, modalProps: { title: 'Add New Reading', } })}}>
                Add New Reading
              </Button>*/}
          </div>
        )}
        <TrainingModuleModal />
        <QuizModal />
        <QuestionModal />
        <DocumentModal />
        <GridList cellHeight={300} cols={4}>
          {this.props.paths.map(path => {
            const url = "/training/" + path.uid;
            return (
              <GridListTile key={path.uid}>
                <Link to={url}>
                  {path.img ? (
                    <img src={path.img} alt={path.title} />
                  ) : (
                    <img src={path.fileUrl} alt={path.title} />
                  )}
                </Link>
                <GridListTileBar
                  title={path.title}
                  subtitle={path.subtitle}
                  actionIcon={
                    <div>
                      {this.props.me.auth["Training Editor"] && (
                        <IconButton
                          onClick={() => {
                            this.props.fetchStaff();
                            this.props.fetchDocuments();
                            this.props.fetchMethods();
                            this.props.fetchQuizzes();
                            this.props.showModal({
                              modalType: TRAINING,
                              modalProps: {
                                title: "Edit Training Module",
                                doc: path
                              }
                            });
                          }}
                        >
                          <Edit style={{ color: "white" }} />
                        </IconButton>
                      )}
                    </div>
                  }
                />
              </GridListTile>
            );
          })}
        </GridList>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TrainingOverview);
