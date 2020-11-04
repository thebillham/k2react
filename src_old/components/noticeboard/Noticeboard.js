import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import NoticeCard from "./components/NoticeCard";
import NoticeModal from "./modals/NoticeModal";
import CommentModal from "./modals/CommentModal";
import WhosReadModal from "./modals/WhosReadModal";
import LinearProgress from "@material-ui/core/LinearProgress";
import Add from '@material-ui/icons/Add';
import Dropzone from 'react-dropzone'

// import IncidentModal from "../incidents/modals/IncidentModal";
import { NOTICES, COMMENT, WHOS_READ } from "../../constants/modal-types";
import { onCatChange, onSearchChange } from "../../actions/local";
import { auth, usersRef, stateRef, firestore } from "../../config/firebase";
import moment from "moment";
import classNames from "classnames";
import {
  fetchNotices,
  fetchNoticeReads,
} from "../../actions/local";
import { showModal } from "../../actions/modal";

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    notices: state.local.notices,
    noticeReads: state.local.noticeReads,
    categories: state.const.noticeCategories,
    search: state.local.search,
    category: state.local.category,
    modalType: state.modal.modalType,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSearchChange: search => dispatch(onSearchChange(search)),
    onCatChange: cat => dispatch(onCatChange(cat)),
    showModal: modal => dispatch(showModal(modal)),
    fetchNotices: (update) => dispatch(fetchNotices(update)),
    fetchNoticeReads: (update) => dispatch(fetchNoticeReads(update)),
  };
};

class Noticeboard extends React.PureComponent {
  // static whyDidYouRender = true;
  constructor(props) {
    super(props);
    this.state = {
      hideRead: false,
      noticeLimit: 12,
    };
  }

  UNSAFE_componentWillMount() {
    // console.log(this.props.staff);
    // console.log(this.props.noticeReads);
    // if (this.props.staff && Object.keys(this.props.staff).length === 0) this.props.fetchStaff();
    if (this.props.noticeReads && this.props.noticeReads.length === 0) this.props.fetchNoticeReads();
    if (this.props.notices && this.props.notices.length === 0) this.props.fetchNotices();
    // this.props.fetchNoticeReads(true);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props != nextProps || this.state != nextState) return true;
  //   return false;
  // }

  switch = category => {
    this.props.category === category
      ? this.props.onCatChange(null)
      : this.props.onCatChange(category);
    this.props.onSearchChange(null);
    this.setState({
      modPath: null,
      noticeLimit: 12,
    });
  };

  select = uid => {
    this.setState({
      modPath: uid
    });
  };

  render() {
    const { classes, noticeReads, modalType } = this.props;
    // console.log(noticeReads);
    const unslicedNotices = this.props.notices
      .filter(notice => {
        // console.log(notice.uid);
        if (
          this.props.me.favnotices &&
          this.props.me.favnotices.includes(notice.uid) &&
          (this.props.category === "fav" || this.props.category === "" || this.props.category === null)
        ) {
          return true;
        }
        if (this.props.me.settings && this.props.me.settings.showReadNotices !== undefined &&
          !this.props.me.settings.showReadNotices && noticeReads && noticeReads.includes(notice.uid)) return false;
        if (
          notice.auth !== undefined &&
          this.props.me.auth &&
          this.props.me.auth[notice.auth] === false
        ) {
          return false;
        }
        if (
          this.props.me.deletednotices &&
          this.props.me.deletednotices.includes(notice.uid)
        ) {
          return false;
        }
        if (this.props.category === "imp" && notice.important) return true;
        if (this.props.search) {
          let search = [
              notice.categorydesc,
              notice.text,
              notice.author,
            ];
          if (notice.category === 'has') search = search.concat([
            notice.incidentdesc,
            notice.incidentno,
            notice.incidentstaff,
            notice.job,
          ]);
          if (notice.comments) {
            Object.values(notice.comments).forEach(comment => {
              search = search.concat([
                comment.text,
                comment.author.name,
              ]);
            })
          }
          // console.log(search);
          let searchterm = this.props.search.toLowerCase().split(" ");
          let res = true;
          searchterm.forEach(term => {
            if (
              search.find(
                tag => tag && tag.toLowerCase().includes(term)
              ) === undefined
            )
              res = false;
          });
          return res;
        } else if (this.props.category) {
          return notice.category === this.props.category;
        } else {
          return true;
        }
      });
    const notices = unslicedNotices.slice(0, this.state.noticeLimit);
    // console.log('Re-rendering Noticeboard');
    return (
      <div className={classes.marginTopStandard}>
        {modalType === NOTICES && <NoticeModal />}
        {modalType === COMMENT && <CommentModal />}
        {modalType === WHOS_READ && <WhosReadModal />}

        <Button
          variant="outlined"
          className={classes.marginRightBottomSmall}
          onClick={() => {
            this.props.showModal({
              modalType: NOTICES,
              modalProps: {
                title: "Add New Notice",
                doc: {
                  message: '',
                  category: 'gen',
                  categorydesc: 'General',
                  author: this.props.me.name,
                  authorUid: auth.currentUser.uid,
                  auth: '',
                  date: moment().format('YYYY-MM-DD'),
                }
              }
            });
          }}
          >
          Add New Notice
        </Button>

        <FormControlLabel
          control={
            <Checkbox
              checked={this.props.me && this.props.me.settings && this.props.me.settings.showReadNotices !== undefined ? this.props.me.settings.showReadNotices : true}
              onChange={(event) => { usersRef.doc(auth.currentUser.uid).update({ settings: {
                ...this.props.me.settings,
                showReadNotices: event.target.checked,
              }})}}
              value='hideRead'
              color='secondary'
            />
          }
          label="Show Read Notices"
        />

        {/*<Dropzone onDrop={acceptedFiles => {
          acceptedFiles.forEach(f => {
            const reader = new FileReader();
            reader.onload = () => {
            // Do whatever you want with the file contents
              let noticeRead = JSON.parse(reader.result).payload;

              stateRef.doc("noticereads").collection("users").doc(f.name.slice(0, -5)).set({payload: Object.values(noticeRead).filter(e => e.value !== undefined).map(e => e.value) });
              console.log(noticeRead);
            }
            reader.readAsText(f);
          });
        }}>
          {({getRootProps, getInputProps}) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>*/}

        <Grid container spacing={1}>
          { this.props.categories.map(cat => {
            return (
              <Grid item key={cat.key}>
                <Button
                  color={this.props.category === cat.key ? "secondary" : "primary"}
                  variant="outlined"
                  onClick={() => this.switch(cat.key)}
                >
                  {cat.desc}
                </Button>
              </Grid>
            );
          })}
        </Grid>

        {this.props.notices && this.props.notices.length === 0 ?
          <div className={classes.marginTopSmall}>
            <LinearProgress color="secondary" />
          </div>
          :
          notices.length === 0 ?
          <div className={classNames(classes.marginTopSmall, classes.noItems)}>
            No notices to display.
          </div>
          :
          <Grid container spacing={2} style={{ paddingTop: 30 }}>
            {notices.map(notice => {
                return (
                  <Grid item sm={12} md={6} lg={4} xl={3} key={notice.uid}>
                    <NoticeCard notice={notice} />
                  </Grid>
                );
              })}
          </Grid>
        }
        {this.state.noticeLimit < unslicedNotices.length && <div className={classes.flexRowCentered}>
          <Button
            onClick={ () => { this.setState({ noticeLimit: this.state.noticeLimit + 12}) }}>
            <Add className={classes.marginRightSmall} /> View More
          </Button>
        </div>}
      </div>
    );
  }
}

export default withStyles(styles)(connect(
  mapStateToProps,
  mapDispatchToProps
)(Noticeboard));
