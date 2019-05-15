import React from "react";
import { connect } from "react-redux";
// import { Document, Page } from 'react-pdf';
import { withStyles } from "@material-ui/core/styles";
import { formStyles } from "../../config/styles";
import { DOCUMENT } from "../../constants/modal-types";

import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";

import { auth, docsRef, usersRef } from "../../config/firebase";
import { showModal } from "../../actions/modal";
import DocumentModal from "./modals/DocumentModal";
import { FormattedDate } from "react-intl";
// import 'react-pdf/dist/Page/AnnotationLayer.css';

const mapStateToProps = state => {
  return {
    me: state.local.me
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showModal: modal => dispatch(showModal(modal))
  };
};

class DocumentViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: {},
      read: null,
      docID: null,
      isLoading: true,
      isReading: false,
      docAuth: false,
      activeStep: 0
    };
  }

  componentWillMount() {
    docsRef
      .doc(this.props.match.params.uid)
      .get()
      .then(doc => {
        if (
          this.props.me.auth[doc.data().auth] ||
          doc.data().auth === undefined
        ) {
          usersRef
            .doc(auth.currentUser.uid)
            .collection("readinglog")
            .doc(doc.id)
            .get()
            .then(log => {
              this.setState({
                docID: doc.id,
                doc: doc.data(),
                isLoading: false,
                docAuth: true,
                read: log.exists && log.data().date.toDate()
              });
            });
        }
      });
  }

  handleStep = step => () => {
    this.setState({
      activeStep: step
    });
  };

  openLink = url => {
    window.open(url, "_blank");
  };

  markAsRead = uid => {
    this.setState({
      isReading: true
    });
    usersRef
      .doc(auth.currentUser.uid)
      .collection("readinglog")
      .doc(uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          // document exists, remove thereby marking as unread
          usersRef
            .doc(auth.currentUser.uid)
            .collection("readinglog")
            .doc(uid)
            .delete()
            .then(() => {
              this.setState({
                read: null,
                isReading: false
              });
            });
        } else {
          var readDate = new Date();
          usersRef
            .doc(auth.currentUser.uid)
            .collection("readinglog")
            .doc(uid)
            .set({
              date: readDate
            })
            .then(() => {
              this.setState({
                read: readDate,
                isReading: false
              });
            });
        }
      });
  };

  getLinkName = docType => {
    switch (docType) {
      case "PDF":
        return "Open PDF";
      case "Image":
        return "Open Image";
      case "File":
        return "Download File";
      default:
        return "Open Link";
    }
  };

  render() {
    const { classes } = this.props;
    const { doc, activeStep } = this.state;
    const editor = this.props.me.auth["Document Editor"];

    return (
      <div style={{ marginTop: 80 }}>
        <DocumentModal />
        <Card className={classes.card}>
          <CardContent>
            {this.state.isLoading ? (
              <div>
                <CircularProgress />
              </div>
            ) : (
              <div>
                <Typography className={classes.labels}>{doc.title}</Typography>
                <Typography className={classes.note}>
                  <i>{doc.subtitle}</i>
                </Typography>
                <Typography className={classes.note}>{doc.code}</Typography>
                <Typography className={classes.note}>{doc.author}</Typography>
                <Typography className={classes.note}>
                  {doc.publisher}
                </Typography>
                <Typography className={classes.note}>
                  <i>{doc.desc}</i>
                </Typography>
                {doc.source && (
                  <Typography className={classes.note}>
                    <b>Source: </b>
                    {doc.source}
                  </Typography>
                )}
                {doc.references && (
                  <Typography className={classes.note}>
                    <b>References: </b>
                    {doc.references}
                  </Typography>
                )}
                <Typography className={classes.note} style={{ marginTop: 12 }}>
                  <b>Date published: </b>
                  {doc.date ? (
                    <FormattedDate
                      value={
                        doc.date instanceof Date ? doc.date : new Date(doc.date)
                      }
                      month="long"
                      day="numeric"
                      year="numeric"
                    />
                  ) : (
                    "Unknown"
                  )}
                </Typography>
                <Typography className={classes.note}>
                  <b>Last updated: </b>
                  {doc.updateDate ? (
                    <FormattedDate
                      value={
                        doc.date instanceof Date
                          ? doc.date
                          : new Date(doc.updateDate)
                      }
                      month="long"
                      day="numeric"
                      year="numeric"
                    />
                  ) : (
                    "Unknown"
                  )}
                </Typography>
                <Typography className={classes.note}>
                  <b>Date read: </b>
                  {this.state.read ? (
                    <FormattedDate
                      value={
                        doc.date instanceof Date ? doc.date : this.state.read
                      }
                      month="long"
                      day="numeric"
                      year="numeric"
                    />
                  ) : (
                    "N/A"
                  )}
                </Typography>
                <Button
                  variant="outlined"
                  color={this.state.read ? "secondary" : "primary"}
                  onClick={() => this.markAsRead(this.state.docID)}
                  style={{ marginTop: 16, height: 40, width: 160 }}
                >
                  {this.state.isReading ? (
                    <CircularProgress
                      size={24}
                      color={this.state.read ? "secondary" : "primary"}
                    />
                  ) : (
                    [this.state.read ? "Mark as Unread" : "Mark as Read"]
                  )}
                </Button>
                {doc.link && (
                  <Button
                    variant="outlined"
                    color={"primary"}
                    onClick={() => this.openLink(doc.link)}
                    style={{
                      marginTop: 16,
                      marginLeft: 16,
                      height: 40,
                      width: 160
                    }}
                  >
                    {this.getLinkName(doc.docType)}
                  </Button>
                )}
                {editor && (
                  <Button
                    variant="outlined"
                    color={"primary"}
                    style={{
                      marginTop: 16,
                      marginLeft: 16,
                      height: 40,
                      width: 160
                    }}
                    onClick={() =>
                      this.props.showModal({
                        modalType: DOCUMENT,
                        modalProps: { title: "Edit Document", doc: doc }
                      })
                    }
                  >
                    Edit Document
                  </Button>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%"
                  }}
                >
                  {doc.content && (
                    <div
                      style={{ color: "#444" }}
                      dangerouslySetInnerHTML={{ __html: doc.content }}
                    />
                  )}
                  {(doc.docType === "PDF" || doc.docType === "Image") && (
                    <div
                      style={{ color: "#444", width: "90%" }}
                      dangerouslySetInnerHTML={{
                        __html: `<p></p><iframe width="90%" height="1132" src="${
                          doc.fileUrl
                        }" frameBorder="0"></iframe><p></p>`
                      }}
                    />
                  )}
                  {doc.steps && (
                    <div>
                      <Stepper nonLinear activeStep={activeStep}>
                        {Object.keys(doc.steps).map((step, index) => {
                          return (
                            <Step key={step}>
                              <StepButton
                                onClick={this.handleStep(parseInt(step))}
                              >
                                {doc.steps[step].title}
                              </StepButton>
                            </Step>
                          );
                        })}
                      </Stepper>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: doc.steps[this.state.activeStep].content
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(formStyles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DocumentViewer)
);
