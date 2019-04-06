import React from "react";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import { connect } from "react-redux";
import NoticeCard from "./NoticeCard";
import NoticeModal from "../modals/NoticeModal";
import { NOTICES } from "../../constants/modal-types";
import { onCatChange, onSearchChange } from "../../actions/local";
import { auth, usersRef, noticesRef } from "../../config/firebase";
import store from "../../store";
import {
  onFavNotice,
  onReadNotice,
  onDeleteNotice,
  fetchNotices,
} from "../../actions/local";
import { showModal } from "../../actions/modal";

const mapStateToProps = state => {
  return {
    staff: state.local.staff,
    me: state.local.me,
    notices: state.local.notices,
    categories: state.const.noticecategories,
    search: state.local.search,
    category: state.local.category
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSearchChange: search => dispatch(onSearchChange(search)),
    onCatChange: cat => dispatch(onCatChange(cat)),
    showModal: modal => dispatch(showModal(modal)),
    fetchNotices: (update) => dispatch(fetchNotices(update)),
  };
};

class Noticeboard extends React.Component {
  componentWillMount() {
    this.props.fetchNotices();
  }

  switch = category => {
    this.props.category === category
      ? this.props.onCatChange(null)
      : this.props.onCatChange(category);
    this.props.onSearchChange(null);
    this.setState({
      modPath: null
    });
  };

  select = uid => {
    this.setState({
      modPath: uid
    });
  };

  onReadNotice = notice => {
    let newArray = [];
    if (notice.staff === undefined) {
      newArray = [auth.currentUser.uid];
    } else {
      let staff = [...notice.staff];
      if (staff.includes(auth.currentUser.uid)) {
        newArray = staff.filter(item => item !== auth.currentUser.uid);
      } else {
        staff.push(auth.currentUser.uid);
        newArray = staff;
      }
    }
    noticesRef.doc(notice.uid).set(
      {
        staff: newArray,
      },
      { merge: true }
    );
    this.props.fetchNotices(true);
  }

  onFavNotice = uid => {
    let newArray = [];
    if (this.props.me.favnotices === undefined) {
      newArray = [uid];
    } else {
      let notices = [...this.props.me.favnotices];
      if (notices.includes(uid)) {
        newArray = notices.filter(item => item !== uid);
      } else {
        notices.push(uid);
        newArray = notices;
      }
    }
    usersRef.doc(auth.currentUser.uid).set(
        {
          favnotices: newArray
        },
        { merge: true }
      );
  }

  onDeleteNotice = (notice) => {
    if (window.confirm("Are you sure you wish to delete this notice?")) {
      noticesRef.doc(notice.uid).delete();
      this.props.fetchNotices(true);
    }
  }

  onEditNotice = note => {
    this.props.showModal({
      modalType: NOTICES,
      modalProps: {
        title: "Edit Notice",
        doc: note,
      }
    });
  }

  render() {
    return (
      <div style={{ marginTop: 80 }}>
        <NoticeModal />
        <Button
          variant="outlined"
          style={{ marginBottom: 16 }}
          onClick={() => {
            this.props.showModal({
              modalType: NOTICES,
              modalProps: {
                title: "Add New Notice",
                doc: {
                  message: '',
                  category: 'gen',
                  author: this.props.me.name,
                  auth: '',
                  date: new Date(),
                }
              }
            });
          }}
          >
          Add New Notice
        </Button>
        <Grid container spacing={8}>
          {[
            {
              key: "fav",
              desc: "Favourite",
            },
            {
              key: "imp",
              desc: "Important",
            },
            ...this.props.categories].map(cat => {
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
        <Grid container spacing={16} style={{ paddingTop: 30 }}>
          {this.props.notices
            .filter(notice => {
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
              if (
                this.props.me.favnotices &&
                this.props.category === "fav" &&
                this.props.me.favnotices.includes(notice.uid)
              ) {
                return true;
              }
              if (this.props.search) {
                if (notice.tags) {
                  return [...notice.tags, notice.text].find(tag =>
                    tag.toLowerCase().includes(this.props.search.toLowerCase())
                  );
                } else {
                  return notice.text
                    .toLowerCase()
                    .includes(this.props.search.toLowerCase());
                }
              } else if (this.props.category) {
                return notice.category === this.props.category;
              } else {
                return true;
              }
            })
            .map(notice => {
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={notice.uid}>
                  <NoticeCard
                    notice={notice}
                    staff={this.props.staff}
                    fav={this.props.me.favnotices && this.props.me.favnotices.includes(notice.uid)}
                    read={notice.staff && notice.staff.includes(auth.currentUser.uid)}
                    edit={notice.author === this.props.me.name || this.props.me.auth['Admin']}
                    onFavNotice={() => this.onFavNotice(notice.uid)}
                    onReadNotice={() => this.onReadNotice(notice)}
                    onEditNotice={() => this.onEditNotice(notice)}
                    onDeleteNotice={() => this.onDeleteNotice(notice)}
                  />
                </Grid>
              );
            })}
        </Grid>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Noticeboard);
