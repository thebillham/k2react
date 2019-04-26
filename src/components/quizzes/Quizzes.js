import React from "react";

import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Grid from "@material-ui/core/Grid";
import { QUIZ } from "../../constants/modal-types";

import { connect } from "react-redux";
import {
  onSearchChange,
  onCatChange,
  fetchQuizzes,
  fetchQuestions
} from "../../actions/local";
import { showModal } from "../../actions/modal";
import store from "../../store";
import QuizModal from "./QuizModal";
import QuizList from "./QuizList";
import { quizzesRef } from "../../config/firebase";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter
} from "react-router-dom";

const mapStateToProps = state => {
  return {
    quizzes: state.local.quizzes,
    questions: state.local.questions,
    categories: state.const.trainingcategories,
    category: state.local.category,
    search: state.local.search,
    me: state.local.me
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchQuizzes: () => dispatch(fetchQuizzes()),
    fetchQuestions: () => dispatch(fetchQuestions()),
    showModal: modal => dispatch(showModal(modal))
  };
};

class Quizzes extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchQuizzes();
    store.dispatch(onSearchChange(null));
    store.dispatch(onCatChange(null));
  }

  switch = category => {
    this.props.category === category
      ? store.dispatch(onCatChange(null))
      : store.dispatch(onCatChange(category));
    store.dispatch(onSearchChange(null));
    this.setState({
      modPath: null
    });
  };

  render() {
    return (
      <div style={{ marginTop: 80 }}>
        <QuizModal />
        {this.props.me.auth["Quiz Editor"] && (
          <Button
            variant="outlined"
            style={{ marginBottom: 16 }}
            onClick={() => {
              this.props.showModal({
                modalType: QUIZ,
                modalProps: {
                  title: "Add New Quiz",
                  doc: { numberofquestions: 1, optional: [], required: [] }
                }
              });
            }}
          >
            Add New Quiz
          </Button>
        )}
        <Button
          variant="outlined"
          style={{ marginLeft: 16, marginBottom: 16 }}
          onClick={() => {
            this.props.history.push("../questions/");
          }}
        >
          See All Questions
        </Button>
        <Grid container spacing={8}>
          {this.props.categories.map(cat => {
            return (
              <Grid item key={cat.key}>
                <Button
                  variant="outlined"
                  color={
                    this.props.category === cat.key ? "secondary" : "primary"
                  }
                  onClick={() => this.switch(cat.key)}
                >
                  {cat.desc}
                </Button>
              </Grid>
            );
          })}
        </Grid>
        <List style={{ paddingTop: 30 }}>
          {this.props.quizzes
            .filter(doc => {
              if (this.props.search) {
                if (doc.tags) {
                  return [...doc.tags, doc.title].find(tag =>
                    tag.toLowerCase().includes(this.props.search.toLowerCase())
                  );
                } else {
                  return doc.title
                    .toLowerCase()
                    .includes(this.props.search.toLowerCase());
                }
              } else if (this.props.category) {
                return doc.category === this.props.category;
              } else {
                return true;
              }
            })
            .map(doc => {
              return (
                <div key={doc.uid}>
                  <QuizList
                    quiz={doc}
                    showModal={() => {
                      if (!this.props.questions) this.props.fetchQuestions();
                      this.props.showModal({
                        modalType: QUIZ,
                        modalProps: { title: "Edit Quiz", doc: doc }
                      });
                    }}
                    deleteQuiz={() => {
                      if (
                        window.confirm(
                          `Are you sure you wish to delete the quiz '${
                            doc.title
                          }'?`
                        )
                      )
                        quizzesRef.doc(doc.uid).delete();
                    }}
                    editor={this.props.me.auth["Quiz Editor"]}
                  />
                </div>
              );
            })}
        </List>
      </div>
    );
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Quizzes)
);
