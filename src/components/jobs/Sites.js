import React from "react";

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

  componentWillMount() {
    this.props.fetchSites();
    this.props.fetchStaff();
    store.dispatch(onSearchChange(null));
    store.dispatch(onCatChange(null));
  }

  render() {
    const {sites} = this.props;
    return (
      <div style={{ marginTop: 80 }}>
        <Grid container spacing={1}>
          <Grid item>
            {this.props.me.auth["Document Editor"] && (
              <Button
                variant="outlined"
                color="default"
                onClick={() => {
                  let doc = {
                    docType: "PDF",
                    tags: []
                  };
                  this.props.showModal({
                    modalType: SITE,
                    modalProps: { title: "Add New Site", doc: doc }
                  });
                }}
              >
                Add New Site
              </Button>
            )}
          </Grid>
        </Grid>
        <List style={{ paddingTop: 30 }}>
          {sites
            .filter(doc => {
              if (this.props.search) {
                let search = [];
                if (doc.tags) {
                  search = [
                    ...doc.tags.map(tag => (tag.text ? tag.text : tag)),
                    doc.title,
                    doc.publisher,
                    doc.author,
                    doc.subtitle,
                    doc.code
                  ];
                } else {
                  search = [
                    doc.title,
                    doc.publisher,
                    doc.author,
                    doc.subtitle,
                    doc.code
                  ];
                }
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
                return doc.category === this.props.category;
              } else {
                return true;
              }
            })
            .map(doc => {
              return (
                <div key={doc.uid}>
                  <SitesListItem
                    doc={doc}
                  />
                </div>
              );
            })}
        </List>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sites);
