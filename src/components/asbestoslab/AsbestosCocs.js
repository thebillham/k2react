import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import {
  fetchCocs,
  fetchCocsByJobNumber,
  fetchCocsBySearch,
  setAnalyst,
  setAnalysisMode,
  deleteCoc,
} from "../../actions/asbestosLab";
import {
  fetchWFMClients,
} from "../../actions/local";

//Modals
import { COC } from "../../constants/modal-types";
import { showModal } from "../../actions/modal";
import CocModal from "./modals/CocModal";
import UpdateCertificateVersionModal from "./modals/UpdateCertificateVersionModal";
import QCAnalysisModal from "./modals/QCAnalysisModal";
import WAAnalysisModal from "./modals/WAAnalysisModal";
import SoilDetailsModal from "./modals/SoilDetailsModal";
import AsbestosSampleEditModal from "./modals/AsbestosSampleEditModal";
import DownloadLabCertificateModal from "./modals/DownloadLabCertificateModal";
import AsbestosSampleDetailsModal from "./modals/AsbestosSampleDetailsModal";
import AsbestosReceiveSamplesModal from "./modals/AsbestosReceiveSamplesModal";
import ConfirmResultModal from "./modals/ConfirmResultModal";
import SampleLogModal from "./modals/SampleLogModal";
import CocLogModal from "./modals/CocLogModal";

import AsbestosBulkCocCard from "./components/AsbestosBulkCocCard";

import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import moment from "moment";
import momenttimezone from "moment-timezone";
import momentbusinesstime from "moment-business-time";

const mapStateToProps = state => {
  return {
    cocs: state.asbestosLab.cocs,
    search: state.local.search,
    me: state.local.me,
    staff: state.local.staff,
    clients: state.local.wfmClients,
    bulkAnalysts: state.asbestosLab.bulkAnalysts,
    airAnalysts: state.asbestosLab.airAnalysts,
    analyst: state.asbestosLab.analyst,
    analysisMode: state.asbestosLab.analysisMode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    fetchCocsByJobNumber: jobNumber => dispatch(fetchCocsByJobNumber(jobNumber)),
    fetchCocsBySearch: (client, startDate, endDate) => dispatch(fetchCocsBySearch(client, startDate, endDate)),
    fetchWFMClients: () => dispatch(fetchWFMClients()),
    showModal: modal => dispatch(showModal(modal)),
    setAnalyst: analyst => dispatch(setAnalyst(analyst)),
    setAnalysisMode: analysisMode => dispatch(setAnalysisMode(analysisMode)),
  };
};

class AsbestosCocs extends React.Component {
  // static whyDidYouRender = true;
  state = {
    analyst: false,
    searchClient: '',
    searchJobNumber: '',
    searchStartDate: moment().subtract(100, 'days').format('YYYY-MM-DD'),
    searchEndDate: moment().format('YYYY-MM-DD'),
  };

  componentWillMount = () => {
    this.props.fetchCocs();
    if (this.props.clients.length === 0) this.props.fetchWFMClients();
    if (this.props.me && this.props.me.auth) {
      if (
        this.props.me.auth["Asbestos Air Analysis"] ||
        this.props.me.auth["Asbestos Admin"] ||
        this.props.me.auth["Asbestos Bulk Analysis"]
      ) {
        this.setState({
          analyst: true
        });
      }
    }
  };

  shouldComponentUpdate(nextProps) {
    if (Object.keys(this.props.cocs).length !== Object.keys(nextProps.cocs).length) {
      return true;
    } else {
      return false;
    }
  }

  searchCocs = (searchTerm) => {
    if (searchTerm === 'jobNumber') {
      if (this.state.searchJobNumber !== '') {

      }
    }
  }

  render() {
    const { cocs, classes } = this.props;
    moment.tz.setDefault("Pacific/Auckland");
    moment.updateLocale('en', {
      // workingWeekdays: [1,2,3,4,5],
      workinghours: {
        0: null,
        1: ['08:30:00', '17:00:00'],
        2: ['08:30:00', '17:00:00'],
        3: ['08:30:00', '17:00:00'],
        4: ['08:30:00', '17:00:00'],
        5: ['08:30:00', '17:00:00'],
        6: null,
      },
      holidays: [],
    });

    console.log('Asbestos Cocs Re-Rendering');

    return (
      <div style={{ marginTop: 80 }}>
        <CocModal />
        <UpdateCertificateVersionModal />
        <SampleLogModal />
        <QCAnalysisModal />
        <WAAnalysisModal />
        <AsbestosSampleEditModal />
        <DownloadLabCertificateModal />
        <CocLogModal />
        <SoilDetailsModal />
        <ConfirmResultModal />
        <AsbestosSampleDetailsModal />
        <AsbestosReceiveSamplesModal />
        <Button
          variant="outlined"
          className={classes.marginBottomSmall}
          onClick={() => {
            this.props.showModal({
              modalType: COC,
              modalProps: {
                title: "Add New Chain of Custody",
                doc: { dates: [], personnel: [], samples: {}, deleted: false, versionUpToDate: false, mostRecentIssueSent: false, }
              }
            });
          }}
        >
          New Chain of Custody
        </Button>
        <div className={classes.flexRow}>
          <div className={classes.searchBoxRoot}>
            <InputLabel className={classes.marginLeftBottomSmall}>Search by Job Number</InputLabel>
            <div>
              <FormControl>
                <InputLabel shrink>Job Number</InputLabel>
                <Input
                  id="searchJobNumber"
                  value={this.state.searchJobNumber}
                  onChange={e => this.setState({ searchJobNumber: e.target.value})}
                  startAdornment={<InputAdornment position="start">AS</InputAdornment>}
                />
              </FormControl>
              <Button
                className={classes.buttonGo}
                onClick={() => this.props.fetchCocsByJobNumber(`AS${this.state.searchJobNumber}`)}
              >
                Go
              </Button>
            </div>
          </div>
          <div className={classes.spacerSmall} />
          <div className={classes.searchBoxRoot} >
            <InputLabel className={classes.marginLeftBottomSmall}>Search by Client and/or Date</InputLabel>
            <div className={classes.flexRow}>
              <FormControl className={classes.formSelectClient}>
                <InputLabel shrink>Client</InputLabel>
                <Select
                  value={this.state.searchClient}
                  onChange={e => {
                    if (e.target.value === "-") this.setState({searchClient: ""}); else this.setState({searchClient: e.target.value});
                  }}
                  input={<Input name="searchClient" id="searchClient" />}
                >
                  {this.props.clients.map(client => {
                    return (
                      <option key={client.wfmID} value={client.name}>
                        {client.name}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                id="searchStartDate"
                label="From"
                type="date"
                value={this.state.searchStartDate}
                className={classes.formSelectDate}
                onChange={e => this.setState({ searchStartDate: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                id="searchEndDate"
                label="To"
                type="date"
                className={classes.formSelectDate}
                value={this.state.searchEndDate}
                onChange={e => this.setState({ searchEndDate: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button
                className={classes.buttonGo}
                onClick={() => this.props.fetchCocsBySearch(this.state.searchClient, this.state.searchStartDate, this.state.searchEndDate)}
              >
                Go
              </Button>
            </div>
          </div>
          <div className={classes.spacerSmall} />
          {this.state.analyst && (
            <div className={classes.searchBoxRoot}>
              <InputLabel className={classes.marginLeftBottomSmall}>
                Report Analysis As:
              </InputLabel>
              <div>
                <FormControl className={classes.formSelectStaff}>
                  <InputLabel shrink>Analyst</InputLabel>
                  <Select
                    value={this.props.analyst}
                    onChange={e => this.props.setAnalyst(e.target.value)}
                    input={<Input name="analyst" id="analyst" />}
                  >
                    {this.props.bulkAnalysts.map(analyst => {
                      return (
                        <option key={analyst.uid} value={analyst.name}>
                          {analyst.name}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            </div>
          )}
        </div>
        {Object.keys(cocs)
          .filter(job => {
            let res = true;
            if (this.props.search) {
              let terms = this.props.search.split(" ");
              let search =
                job + " " + cocs[job].client + " " + cocs[job].address;
              terms.forEach(term => {
                if (!search.toLowerCase().includes(term.toLowerCase()))
                  res = false;
              });
            }
            if (this.state.searchClient !== "" && cocs[job].client !== this.state.searchClient) res = false;
            if (this.state.searchStartDate !== "" && moment(cocs[job].lastModified.toDate()).isBefore(new Date(this.state.searchStartDate), 'day')) res = false;
            if (this.state.searchEndDate !== "" && moment(cocs[job].lastModified.toDate()).isAfter(new Date(this.state.searchEndDate), 'day')) res = false;
            if (this.state.searchJobNumber !== "" && cocs[job].jobNumber.includes(this.state.searchJobNumber.toUpperCase()) === false) res = false;
            if (cocs[job].deleted === true) res = false;
            return res;
          }).length < 1 ? (
            <div className={classes.marginTopSmall}>
              <LinearProgress color="secondary" />
            </div>
          ) : (
            <div className={classes.marginTopSmall}>
              {Object.keys(cocs)
                .filter(job => {
                  let res = true;
                  if (this.props.search) {
                    let terms = this.props.search.split(" ");
                    let search =
                      job + " " + cocs[job].client + " " + cocs[job].address;
                    terms.forEach(term => {
                      if (!search.toLowerCase().includes(term.toLowerCase()))
                        res = false;
                    });
                  }
                  if (this.state.searchClient !== "" && cocs[job].client !== this.state.searchClient) res = false;
                  if (this.state.searchStartDate !== "" && moment(cocs[job].lastModified.toDate()).isBefore(new Date(this.state.searchStartDate), 'day')) res = false;
                  if (this.state.searchEndDate !== "" && moment(cocs[job].lastModified.toDate()).isAfter(new Date(this.state.searchEndDate), 'day')) res = false;
                  if (this.state.searchJobNumber !== "" && cocs[job].jobNumber.includes(this.state.searchJobNumber.toUpperCase()) === false) res = false;
                  if (cocs[job].deleted === true) res = false;
                  return res;
                })
                .map(job => {
                  // what is the version thing doing
                  let version = 1;
                  // console.log(cocs[job]);
                  if (cocs[job].reportversion)
                    version = cocs[job].reportversion + 1;
                  return <AsbestosBulkCocCard key={job} job={cocs[job]} />;
                })}
            </div>
          )
        }
      </div>
    );
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AsbestosCocs)
);
