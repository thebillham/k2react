import React from "react";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import { connect } from "react-redux";
import NoticeCard from "./NoticeCard";
import { onCatChange, onSearchChange } from "../../actions/local";
import { auth, usersRef } from "../../config/firebase";
import store from "../../store";
import {
  onFavNotice,
  onReadNotice,
  onDeleteNotice,
  fetchNotices
} from "../../actions/local";

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
    fetchNotices: () => dispatch(fetchNotices()),
    onSearchChange: search => dispatch(onSearchChange(search)),
    onCatChange: cat => dispatch(onCatChange(cat)),
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

  onChangeNotice = (action, uid) => {
    let notices = [];
    if (this.props.me[action] !== undefined) notices = [...this.props.me[action]];
    console.log(notices);
    let newArray = [];
    if (notices === undefined) {
      newArray = [uid];
    } else if (notices.includes(uid)) {
      newArray = notices.filter(item => item !== uid);
    } else {
    notices.push(uid);
      newArray = notices;
    }

    usersRef.doc(auth.currentUser.uid).set(
        {
          [action]: newArray
        },
        { merge: true }
      );
  };

  render() {
    return (
      <div style={{ marginTop: 80 }}>
        <Button
          variant="outlined"
          style={{ marginBottom: 16 }}
          onClick={() => {}}
          >
          Add New Notice
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
        <Grid container spacing={16} style={{ paddingTop: 30 }}>
          {this.props.notices
            .filter(notice => {
              if (
                notice.auth !== undefined &&
                this.props.me.auth.includes(notice.auth) === false
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
                    fav={this.props.me.favnotices && this.props.me.favnotices.includes(notice.uid)} read={this.props.me.readnotices && this.props.me.readnotices.includes(notice.uid)}
                    onFavNotice={() => this.onChangeNotice('favnotices', notice.uid)}
                    onDeleteNotice={() => this.onChangeNotice('deletednotices', notice.uid)}
                    onReadNotice={() => this.onChangeNotice('readnotices', notice.uid)}
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
