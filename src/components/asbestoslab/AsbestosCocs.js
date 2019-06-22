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
import AsbestosSampleDetailsModal from "./modals/AsbestosSampleDetailsModal";
import DownloadLabCertificateModal from "./modals/DownloadLabCertificateModal";
import SampleHistoryModal from "./modals/SampleHistoryModal";
import CocLogModal from "./modals/CocLogModal";

import AsbestosBulkCocCard from "./components/AsbestosBulkCocCard";

import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
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

  searchCocs = (searchTerm) => {
    if (searchTerm === 'jobNumber') {
      if (this.state.searchJobNumber !== '') {

      }
    }
  }

  render() {
    const { cocs } = this.props;
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

    return (
      <div style={{ marginTop: 80 }}>
        <CocModal />
        <UpdateCertificateVersionModal />
        <SampleHistoryModal />
        <QCAnalysisModal />
        <WAAnalysisModal />
        <AsbestosSampleDetailsModal />
        <DownloadLabCertificateModal />
        <CocLogModal />
        <SoilDetailsModal />
        <Button
          variant="outlined"
          style={{ marginBottom: 16, width: 220, }}
          onClick={() => {
            this.props.showModal({
              modalType: COC,
              modalProps: {
                title: "Add New Chain of Custody",
                doc: { dates: [], personnel: [], samples: {}, deleted: false, versionUpToDate: false, }
              }
            });
          }}
        >
          New Chain of Custody
        </Button>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          {this.state.analyst && (
            <div
              style={{
                borderRadius: 4,
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "#ccc",
                width: 220,
                marginBottom: 16,
                marginRight: 12,
                height: '100%',
                padding: 12
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <InputLabel style={{ marginLeft: 12 }}>
                  Report Analysis As:
                </InputLabel>
              </div>
              <div>
                <FormControl style={{ width: 200, marginBottom: 19, }}>
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
          <div
            style={{
              borderRadius: 4,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#ccc",
              width: 400,
              height: '100%',
              padding: 12,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <InputLabel style={{ marginLeft: 12 }}>
                Get Chains of Custody by Job Number
              </InputLabel>
            </div>
            <div>
              <FormControl style={{ width: 150, marginRight: 8, }}>
                <InputLabel shrink>Job Number</InputLabel>
                <Input
                  id="searchJobNumber"
                  value={this.state.searchJobNumber}
                  onChange={e => this.setState({ searchJobNumber: e.target.value})}
                  startAdornment={<InputAdornment position="start">AS</InputAdornment>}
                />
              </FormControl>
              <Button
                variant="outlined"
                style={{ marginTop: 16, marginBottom: 16 }}
                onClick={() => this.props.fetchCocsByJobNumber(`AS${this.state.searchJobNumber}`)}
              >
                Go
              </Button>
            </div>
          </div>
          <div
            style={{
              borderRadius: 4,
              marginLeft: 12,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#ccc",
              width: 800,
              height: '100%',
              padding: 12
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <InputLabel style={{ marginLeft: 12 }}>
                Search Historic Chains of Custody
              </InputLabel>
            </div>
            <div style={{ flexDirection: 'row', display: 'flex', }}>
              <FormControl style={{ width: 400}}>
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
                onChange={e => this.setState({ searchStartDate: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                id="searchEndDate"
                label="To"
                type="date"
                value={this.state.searchEndDate}
                onChange={e => this.setState({ searchEndDate: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button
                variant="outlined"
                style={{ marginTop: 16, marginBottom: 16, marginLeft: 9, }}
                onClick={() => this.props.fetchCocsBySearch(this.state.searchClient, this.state.searchStartDate, this.state.searchEndDate)}
              >
                Go
              </Button>
            </div>
          </div>
        </div>
        {Object.keys(cocs).length < 1 ? (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            No CoCs found.
            {/*<CircularProgress
              style={{
                margin: 40
              }}
            />*/}
          </div>
        ) : (
          <div style={{ marginTop: 16, }}>
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
                if (cocs[job].reportversion)
                  version = cocs[job].reportversion + 1;
                return <AsbestosBulkCocCard key={job} job={cocs[job]} />;
              })}
          </div>
        )}
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
