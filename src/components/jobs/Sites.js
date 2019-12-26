import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  withRouter
} from "react-router-dom";

import List from "@material-ui/core/List";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Grow from '@material-ui/core/Grow';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import { connect } from "react-redux";
import { auth, methodsRef, docsRef } from "../../config/firebase";
import { SITE } from "../../constants/modal-types";

import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";

import SiteModal from './modals/SiteModal';

import {
  onSearchChange,
  onCatChange,
  fetchStaff,
} from "../../actions/local";
import {
  fetchSites,
  getJobColor,
  getSiteIcon,
} from "../../actions/jobs";
import { showModal } from "../../actions/modal";
import store from "../../store";

const mapStateToProps = state => {
  return {
    sites: state.jobs.sites,
    me: state.local.me,
    methods: state.local.methods,
    modalType: state.modal.modalType,
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
    const { classes, sites, } = this.props;
    const defaultImagePath = 'https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/sites%2FSite%20Photo%20Placeholder.png?alt=media&token=eb19d430-70b5-4290-a683-08abfc6b410b';
    return (
      <div className={classes.marginTopStandard}>
        {this.props.modalType === SITE && <SiteModal />}
        <div className={classes.flexRowRightAlign}>
          <Tooltip title="Add New Site">
            <IconButton onClick={e => this.props.showModal({ modalType: SITE, modalProps: { doc: { deleted: false, }} })}>
              <AddIcon className={classes.iconRegular} />
            </IconButton>
          </Tooltip>
        </div>
        <Grid container spacing={2}>
          { sites && Object.values(sites).filter(a => {
            if (this.props.search) {
              let search = [
                  a.siteName,
                  a.primaryJobType,
                  a.type,
                ];
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
            } else {
              return true;
            }
          }).sort((a,b) => a.siteName && a.siteName.localeCompare(b.siteName)).map(site => {
            const color = classes[getJobColor(site.primaryJobType)];
            return (
              <Grid item sm={12} md={6} lg={4} xl={3} key={site.uid}>
                <Grow in={true}
                  style={{ transformOrigin: '0 0 0' }}
                  timeout={1000}>
                  <Card className={classes.siteCard}>
                    <CardHeader
                      avatar={
                        <Avatar className={color} style={{ backgroundColor: 'white' }}>
                          {getSiteIcon(site.type)}
                        </Avatar>
                      }
                      action={
                        <IconButton onClick={e => {
                          this.props.showModal({ modalType: SITE, modalProps: { doc: site, }})
                        }}>
                          <EditIcon />
                        </IconButton>
                      }
                      title={site.siteName}
                      subheader={site.client}
                    />
                    <Link to={'site/' + site.uid}>
                      <CardMedia
                        style={{
                          height: 0,
                          paddingTop: '56.25%', // 16:9
                        }}
                        className={classes.hoverImage}
                        image={site.siteImageUrl ? site.siteImageUrl : defaultImagePath}
                      />
                    </Link>
                    {/*<CardContent>
                    </CardContent>
                    <CardActions>
                    </CardActions>*/}
                  </Card>
                </Grow>
              </Grid>
            )
          })}
        </Grid>
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
