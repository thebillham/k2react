import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../config/styles";
import { connect } from "react-redux";
import {
  fetchCocs,
  setAnalyst,
  setAnalysisMode
} from "../../actions/local";

//Modals
import { COC } from "../../constants/modal-types";
import { showModal } from "../../actions/modal";
import CocModal from "./CocModal";
import UpdateCertificateVersion from "./UpdateCertificateVersion";
import QCAnalysis from "./QCAnalysis";
import WAAnalysis from "./WAAnalysis";
import AsbestosLabDetails from "./AsbestosLabDetails";
import DownloadLabCertificateModal from "./DownloadLabCertificateModal";
import SampleHistoryModal from "./SampleHistoryModal";
import CocLog from "./CocLog";

import CocList from "./CocList";

import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";

const mapStateToProps = state => {
  return {
    cocs: state.local.cocs,
    search: state.local.search,
    me: state.local.me,
    staff: state.local.staff,
    bulkAnalysts: state.local.bulkAnalysts,
    airAnalysts: state.local.airAnalysts,
    analyst: state.local.analyst,
    analysisMode: state.local.analysisMode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCocs: () => dispatch(fetchCocs()),
    showModal: modal => dispatch(showModal(modal)),
    setAnalyst: analyst => dispatch(setAnalyst(analyst)),
    setAnalysisMode: analysisMode => dispatch(setAnalysisMode(analysisMode))
  };
};

class AsbestosLab extends React.Component {
  state = {
    analyst: false
  };

  componentWillMount = () => {
    this.props.fetchCocs();
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

  render() {
    const { cocs } = this.props;

    return (
      <div style={{ marginTop: 80 }}>
        <CocModal />
        <UpdateCertificateVersion />
        <SampleHistoryModal />
        <QCAnalysis />
        <WAAnalysis />
        <AsbestosLabDetails />
        <DownloadLabCertificateModal />
        <CocLog />
        <Button
          variant="outlined"
          style={{ marginBottom: 16 }}
          onClick={() => {
            this.props.showModal({
              modalType: COC,
              modalProps: {
                title: "Add New Chain of Custody",
                doc: { dates: [], personnel: [], samples: {}, type: "bulk", deleted: false, }
              }
            });
          }}
        >
          New Chain of Custody (Bulk)
        </Button>
        {/*<Button variant='outlined' style={{ marginBottom: 16, marginLeft: 16, }} onClick={() => {this.props.showModal({ modalType: COC, modalProps: { title: 'Add New Chain of Custody', doc: {dates: [], samples: {}, personnel: [], type: 'air',} } })}}>
          New Chain of Custody (Air)
        </Button>*/}
        {this.state.analyst && (
          <div
            style={{
              borderRadius: 4,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#ccc",
              width: 220,
              marginBottom: 12,
              padding: 12
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <InputLabel style={{ marginLeft: 12 }}>
                Report Analysis As:
              </InputLabel>
            </div>
            <div>
              <FormControl style={{ width: 200 }}>
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
              {/*<FormControl style={{ width: 180, }}>
            <InputLabel shrink>Mode</InputLabel>
            <Select
              value={this.props.analysisMode}
              onChange={e => this.props.setAnalysisMode(e.target.value)}
              input={<Input name='mode' id='mode' />}
            >
              { ['normal','quality control','practice',].map((mode) => {
                return(
                  <option key={mode} value={mode}>{mode}</option>
                );
              })}
            </Select>
          </FormControl>*/}
            </div>
          </div>
        )}
        {Object.keys(cocs).length < 1 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CircularProgress
              style={{
                margin: 40
              }}
            />
          </div>
        ) : (
          <div>
            {Object.keys(cocs)
              .filter(job => {
                if (this.props.search) {
                  let terms = this.props.search.split(" ");
                  let search =
                    job + " " + cocs[job].client + " " + cocs[job].address;
                  let result = true;
                  terms.forEach(term => {
                    if (!search.toLowerCase().includes(term.toLowerCase()))
                      result = false;
                  });
                  return result;
                } else {
                  return true;
                }
              })
              .map(job => {
                let version = 1;
                if (cocs[job].reportversion)
                  version = cocs[job].reportversion + 1;
                return <CocList key={job} job={cocs[job]} />;
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
  )(AsbestosLab)
);