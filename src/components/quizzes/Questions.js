import React from 'react';

import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import { QUESTION } from '../../constants/modal-types';

import { connect } from 'react-redux';
import { onSearchChange, onCatChange, fetchQuestions, } from '../../actions/local';
import { showModal } from '../../actions/modal';
import store from '../../store';
import QuestionList from './QuestionList';
import QuestionModal from '../modals/QuestionModal';

const mapStateToProps = state => {
  return {
    questions: state.local.questions,
    quiztags: state.const.quiztags,
    category: state.local.category,
    search: state.local.search,
    me: state.local.me,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchQuestions: () => dispatch(fetchQuestions()),
    showModal: modal => dispatch(showModal(modal)),
  }
}

class Questions extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      listselect: null,

    }

  }

  componentWillMount(){
    this.props.fetchQuestions();
    store.dispatch(onSearchChange(null));
    store.dispatch(onCatChange(null));
  }

  handleToggle = (uid) => {
    this.setState({
      listselect: uid,
    })
  }

  switch = (category) => {
    this.props.category === category ?
      store.dispatch(onCatChange(null))
      :
      store.dispatch(onCatChange(category));
    store.dispatch(onSearchChange(null));
    this.setState({
      modPath: null,
    });
  }

  render() {
    return (
      <div style = {{ marginTop: 80 }}>
        <QuestionModal />
        { this.props.me.auth['Quiz Editor'] &&
          <Button variant='outlined' style={{ marginBottom: 16, }} onClick={() => {this.props.showModal({ modalType: QUESTION, modalProps: { title: 'Add New Question', doc: { type: 'truefalse', tags: [], truefalse: 'True', } } })}}>
            Add New Question
          </Button>
        }
        <Grid container spacing={8}>
          { this.props.quiztags.map(tag => {
            return (
              <Grid item key={tag.id}>
                <Button variant="outlined" color={this.props.category === tag.id ? "secondary" : "primary"} onClick={() => this.switch(tag.id)}>
                  {tag.text}
                </Button>
              </Grid>
            );
          })}
        </Grid>
        <List style={{paddingTop: 30}}>
        { this.props.questions && this.props.questions.filter(doc => {
            if (this.props.search) {
              if (doc.tags) {
                return [...doc.tags, {text: doc.question}].find(tag => tag.text.toLowerCase().includes(this.props.search.toLowerCase()));
              } else {
                return doc.question.toLowerCase().includes(this.props.search.toLowerCase());
              }
            } else if (this.props.category) {
              return doc.tags && doc.tags.map(tag => tag.id).includes(this.props.category);
            } else {
              return true;
            }
          }).map(doc => {
            return(
              <div key={doc.uid}>
                <QuestionList question={doc} showModal={() => {
                  if (!doc.tags) doc.tags=[];
                  this.props.showModal({ modalType: QUESTION, modalProps: { title: 'Edit Question', doc: doc, } });
                }} />
              </div>
            )
          })}
        </List>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Questions);
