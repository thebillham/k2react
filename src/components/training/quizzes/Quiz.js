import React from "react";

import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import {
  auth,
  quizzesRef,
  usersRef,
  questionsRef
} from "../../../config/firebase";
import { styles } from "../../../config/styles";
import TrueFalseQuestion from "./questions/TrueFalseQuestion";
import MultiMultiQuestion from "./questions/MultiMultiQuestion";
import MultiSingleQuestion from "./questions/MultiSingleQuestion";
import ShortStringQuestion from "./questions/ShortStringQuestion";
import SortQuestion from "./questions/SortQuestion";
import BucketQuestion from "./questions/BucketQuestion";
import ImageMapQuestion from "./questions/ImageMapQuestion";
import ImageSelectSingleQuestion from "./questions/ImageSelectSingleQuestion";
import ImageSelectMultiQuestion from "./questions/ImageSelectMultiQuestion";
import SortImageQuestion from "./questions/SortImageQuestion";
import BucketImageQuestion from "./questions/BucketImageQuestion";
import { Bar, XAxis, YAxis, BarChart } from "recharts";
import moment from "moment";

const mapStateToProps = state => {
  return {
    categories: state.const.trainingcategories,
    category: state.local.category,
    search: state.local.search
  };
};

class Quiz extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quiz: {},
      questions: [],
      isLoading: true,
      listselect: null
    };

    this.onSortChanged = this.onSortChanged.bind(this);
    this.updateLists = this.updateLists.bind(this);
  }

  componentWillMount() {
    quizzesRef
      .doc(this.props.match.params.quiz)
      .get()
      .then(quiz => {
        usersRef
          .doc(auth.currentUser.uid)
          .collection("quizlog")
          .doc(quiz.id)
          .get()
          .then(log => {
            console.log(`Log part done`);
            // get required questions first
            let questions = [];
            const shuffled = quiz
              .data()
              .optional.sort(() => 0.5 - Math.random())
              .slice(
                0,
                quiz.data().numberofquestions - quiz.data().required.length
              )
              .concat(quiz.data().required)
              .sort(() => 0.5 - Math.random());
            shuffled.forEach(uid => {
              questionsRef
                .doc(uid)
                .get()
                .then(q => {
                  let question = q.data();
                  question.uid = q.id;
                  questions.push(question);
                  if (questions.length === quiz.data().numberofquestions) {
                    // if (questions.length == uidlist.length) {
                    this.setState({
                      quiz: quiz.data(),
                      questions: questions,
                      isLoading: false,
                      completed: log.exists && log.data().latestSubmit.toDate()
                    });
                  }
                });
            });
          });
      });
  }

  updateLists = (uid, correct, incorrect) => {
    let questions = this.state.questions;
    const index = questions.findIndex(q => q.uid === uid);
    questions[index].correct = correct;
    questions[index].incorrect = incorrect;
    this.setState({
      questions: questions
    });
  };

  onSingleChanged = (uid, val) => {
    let questions = this.state.questions;
    const index = questions.findIndex(q => q.uid === uid);
    questions[index].selected = val;
    this.setState({
      questions: questions
    });
  };

  onMultiChecked = (uid, val, single) => {
    let questions = this.state.questions;
    const index = questions.findIndex(q => q.uid === uid);
    if (questions[index].selected === undefined || single) {
      questions[index].selected = [val];
    } else {
      const s = questions[index].selected.findIndex(item => item === val);
      if (s > -1) {
        questions[index].selected.splice(s, 1);
      } else {
        questions[index].selected.push(val);
      }
    }
    this.setState({
      questions: questions
    });
  };

  onSortChanged = (uid, items) => {
    let questions = this.state.questions;
    const index = questions.findIndex(q => q.uid === uid);
    questions[index].selected = items;
    this.setState({
      questions: questions
    });
  };

  handleToggle = uid => {
    this.setState({
      listselect: uid
    });
  };

  onSubmit = () => {
    // calculate scores
    let tagScores = {};
    let quizScore = 0;
    let questionScores = [];
    let unansweredList = [];

    this.state.questions.forEach((q, index) => {
      let score = 0;
      if (
        q.selected === undefined ||
        q.selected === null ||
        q.selected.length === 0
      ) {
        unansweredList.push(q.uid);
      } else if (q.type === "truefalse") {
        if (q.truefalse === q.selected) score = 1;
      } else if (q.type === "multisingle") {
        var opt = q.correct[0];
        if (typeof opt === "object") opt = opt.text;
        if (opt === q.selected) score = 1;
      } else if (q.type === "multimulti") {
        let num = 0;
        q.correct.forEach(opt => {
          if (typeof opt === "object") opt = opt.text;
          if (q.selected.includes(opt)) {
            score = score + 1;
          }
          num = num + 1;
        });
        q.incorrect.forEach(opt => {
          if (typeof opt === "object") opt = opt.text;
          if (q.selected.includes(opt)) {
            score = score - 1;
            num = num + 1;
          }
        });
        if (score < 0) score = 0;
        score = score / num;
      } else if (q.type === "shortstring") {
        if (
          new RegExp(q.answer.toLowerCase(), "").test(q.selected.toLowerCase())
        )
          score = 1;
      } else if (q.type === "sort" || q.type === "sortimage") {
        q.selected.forEach((item, index) => {
          if (q.answers[index] === item) {
            score = score + 1;
          } else {
            score = score - 1;
          }
        });
        if (score < 0) score = 0;
        score = score / q.selected.length;
      } else if (q.type === "sortbucket" || q.type === "sortbucketimage") {
        let num = 0;
        q.selected.forEach((bucket, index) => {
          bucket.answers.forEach(answer => {
            num = num + 1;
            if (q.buckets[index].answers.includes(answer)) {
              score = score + 1;
            } else {
              score = score - 1;
            }
          });
        });
        if (score < 0) score = 0;
        score = score / num;
      } else if (q.type === "imagemapsingle") {
        if (q.selected[0]._id === q.correct) {
          score = 1;
        }
      } else if (q.type === "imagemapmulti") {
        let corrects = q.correct.length;
        q.selected.forEach(obj => {
          if (q.correct.includes(obj._id)) {
            score = score + 1;
            corrects = corrects - 1;
          } else {
            score = score - 1;
          }
        });
        if (score < 0) score = 0;
        score = score / (q.selected.length + corrects);
      } else if (q.type === "imageselectsingle") {
        if (q.correct[0].src === q.selected) score = 1;
      } else if (q.type === "imageselectmulti") {
        let num = 0;
        q.correct.forEach(opt => {
          if (q.selected.includes(opt.src)) {
            score = score + 1;
          }
          num = num + 1;
        });
        q.incorrect.forEach(opt => {
          if (q.selected.includes(opt.src)) {
            score = score - 1;
            num = num + 1;
          }
        });
        if (score < 0) score = 0;
        score = score / num;
      }

      questionScores.push(score);
      quizScore = quizScore + score;

      if (q.tags) {
        q.tags.forEach(tag => {
          if (tagScores[tag.text]) {
            tagScores[tag.text] = {
              score: tagScores[tag.text].score + score,
              num: tagScores[tag.text].num + 1
            };
          } else {
            tagScores[tag.text] = {
              score: score,
              num: 1
            };
          }
        });
      }
    });

    this.setState({
      tags: tagScores,
      tagScores: Object.keys(tagScores).map(key => {
        return {
          name: key,
          value: (tagScores[key].score / tagScores[key].num) * 100
        };
      }),
      quizScore:
        Math.round((quizScore / this.state.questions.length) * 1000) / 10,
      questionScores: questionScores.map(q => {
        return q * 100;
      }),
      unansweredList: unansweredList,
      submitted: true
    });

    let scores = [];
    usersRef
      .doc(auth.currentUser.uid)
      .collection("quizlog")
      .doc(this.props.match.params.quiz)
      .get()
      .then(doc => {
        if (doc.exists) scores = doc.data().scores;
        scores.push({ date: new Date(), score: this.state.quizScore });
        usersRef
          .doc(auth.currentUser.uid)
          .collection("quizlog")
          .doc(this.props.match.params.quiz)
          .set({
            latestSubmit: new Date(),
            scores: scores
          });
      });
    usersRef
      .doc(auth.currentUser.uid)
      .get()
      .then(doc => {
        var quiztags = {};
        if (doc.data().quiztags) quiztags = doc.data().quiztags;
        Object.keys(this.state.tags).forEach(tag => {
          if (quiztags[tag]) {
            quiztags[tag] = {
              score: quiztags[tag].score + this.state.tags[tag].score,
              num: quiztags[tag].num + this.state.tags[tag].num
            };
          } else {
            quiztags[tag] = {
              score: this.state.tags[tag].score,
              num: this.state.tags[tag].num
            };
          }
        });
        this.setState({ quiztags: quiztags });
        usersRef
          .doc(auth.currentUser.uid)
          .set({ quiztags: quiztags }, { merge: true });
      });
  };

  render() {
    const { classes } = this.props;
    const {
      quiz,
      questions,
      tagScores,
      questionScores,
      quizScore,
      unansweredList
    } = this.state;
    return (
      <div style={{ marginTop: 80 }}>
        <Card className={classes.card}>
          <CardContent>
            {this.state.isLoading ? (
              <div>
                <CircularProgress />
              </div>
            ) : (
              <div>
                <Typography className={classes.labels}>{quiz.title}</Typography>
                <Typography className={classes.note}>{quiz.desc}</Typography>
                <Typography className={classes.note}>
                  <b>Date completed: </b>
                  {this.state.read ? moment(this.state.read).format('D MMMM YYYY') : (
                    "N/A"
                  )}
                </Typography>
                {this.state.submitted ? (
                  <List>
                    <div>
                      <b>Total Score: </b> {quizScore} %
                    </div>
                    {questions.map((q, index) => {
                      return (
                        <div key={q.uid}>
                          <div>{q.question}</div>
                          {unansweredList.includes(q.uid) ? (
                            <div style={{ color: "grey" }}>Not answered</div>
                          ) : (
                            <div>
                              {questionScores[index] > 0 ? (
                                <div style={{ color: "green" }}>
                                  {questionScores[index]}% Correct
                                </div>
                              ) : (
                                <div style={{ color: "red" }}>Incorrect</div>
                              )}
                            </div>
                          )}
                          <hr />
                        </div>
                      );
                    })}
                    <BarChart width={850} height={400} data={tagScores}>
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={{ angle: -90, size: 8 }}
                        height={200}
                        tickMargin={100}
                      />
                      <YAxis domain={[0, 100]} />
                      <Bar barSize={2} dataKey="value" fill="#FF2D00" />
                    </BarChart>
                  </List>
                ) : (
                  <List>
                    {questions.map(q => {
                      switch (q.type) {
                        case "truefalse":
                          return (
                            <TrueFalseQuestion
                              q={q}
                              key={q.uid}
                              onChanged={e =>
                                this.onSingleChanged(q.uid, e.target.value)
                              }
                            />
                          );
                        case "multisingle":
                          return (
                            <MultiSingleQuestion
                              q={q}
                              key={q.uid}
                              onChanged={e =>
                                this.onSingleChanged(q.uid, e.target.value)
                              }
                            />
                          );
                        case "multimulti":
                          return (
                            <MultiMultiQuestion
                              q={q}
                              key={q.uid}
                              updateLists={this.updateLists}
                              onChanged={e =>
                                this.onMultiChecked(q.uid, e.target.value)
                              }
                            />
                          );
                        case "shortstring":
                          return (
                            <ShortStringQuestion
                              q={q}
                              key={q.uid}
                              onChanged={e =>
                                this.onSingleChanged(q.uid, e.target.value)
                              }
                            />
                          );
                        case "sort":
                          return (
                            <SortQuestion
                              q={q}
                              key={q.uid}
                              onChanged={this.onSortChanged}
                            />
                          );
                        case "sortimage":
                          return (
                            <SortImageQuestion
                              q={q}
                              key={q.uid}
                              onChanged={this.onSortChanged}
                            />
                          );
                        case "sortbucket":
                          return (
                            <BucketQuestion
                              q={q}
                              key={q.uid}
                              onChanged={this.onSortChanged}
                            />
                          );
                        case "sortbucketimage":
                          return (
                            <BucketImageQuestion
                              q={q}
                              key={q.uid}
                              onChanged={this.onSortChanged}
                            />
                          );
                        case "imagemapsingle":
                          return (
                            <ImageMapQuestion
                              q={q}
                              key={q.uid}
                              onChanged={this.onMultiChecked}
                              single
                            />
                          );
                        case "imagemapmulti":
                          return (
                            <ImageMapQuestion
                              q={q}
                              key={q.uid}
                              onChanged={this.onMultiChecked}
                            />
                          );
                        case "imageselectsingle":
                          return (
                            <ImageSelectSingleQuestion
                              q={q}
                              key={q.uid}
                              onChanged={e =>
                                this.onSingleChanged(q.uid, e.target.value)
                              }
                            />
                          );
                        case "imageselectmulti":
                          return (
                            <ImageSelectMultiQuestion
                              q={q}
                              key={q.uid}
                              updateLists={this.updateLists}
                              onChanged={e =>
                                this.onMultiChecked(q.uid, e.target.value)
                              }
                            />
                          );
                        default:
                          return <div key={q.uid}>{q.question}</div>;
                      }
                    })}
                    <div>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => this.onSubmit()}
                      >
                        Submit
                      </Button>
                    </div>
                  </List>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(connect(mapStateToProps)(Quiz));
