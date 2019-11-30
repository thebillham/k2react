import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";

import List from "@material-ui/core/List";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { auth, methodsRef, docsRef } from "../../config/firebase";
import { SITE } from "../../constants/modal-types";

import SitesListItem from "./components/SitesListItem";

import {
  onSearchChange,
  onCatChange,
  fetchSites,
  fetchStaff,
} from "../../actions/local";
import { showModal } from "../../actions/modal";
import store from "../../store";

const mapStateToProps = state => {
  return {
    sites: state.local.sites,
    me: state.local.me,
    methods: state.local.methods,
    modal: state.modal.modalType,
    categories: state.const.documentCategories,
    category: state.local.category,
    search: state.local.search,
    staff: state.local.staff
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchSites: () => dispatch(fetchSites()),
    fetchStaff: () => dispatch(fetchStaff()),
    showModal: modal => dispatch(showModal(modal))
  };
};

class Sites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listselect: null
    };
  }

  UNSAFE_componentWillMount() {
    this.props.fetchSites();
  }

  render() {
    const { classes, } = this.props;
    return (
      <div className={classes.marginTopStandard}>
        <div className={classes.paleLarge}>Under Development</div>
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Sites)
);
