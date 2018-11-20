import React from "react";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { formStyles } from '../../config/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { auth, docsRef, usersRef } from '../../config/firebase';
import { FormattedDate } from 'react-intl';

const mapStateToProps = state => {
  return {
    auth: state.local.auth,
  };
};


class DocumentViewer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      doc: {},
      read: null,
      docID: null,
      isLoading: true,
      isReading: false,
      docAuth: false,
    }
  }

  componentWillMount(){
    docsRef.doc(this.props.match.params.uid).get().then((doc) => {
      if (this.props.auth.includes(doc.data().auth) || doc.data().auth === undefined){
        usersRef.doc(auth.currentUser.uid).collection("readinglog").doc(doc.id).get().then((log) => {
          this.setState({
            docID: doc.id,
            doc: doc.data(),
            isLoading: false,
            docAuth: true,
            read: log.exists && log.data().date.toDate(),
          });
        });
      }
    });
  }

  openLink = url => {
    window.open(url, '_blank');
  }

  markAsRead = uid => {
    this.setState({
      isReading: true,
    });
    usersRef.doc(auth.currentUser.uid).collection("readinglog").doc(uid).get().then((doc) => {
      if (doc.exists) {
        // document exists, remove thereby marking as unread
        usersRef.doc(auth.currentUser.uid).collection("readinglog").doc(uid).delete().then(() => {
          this.setState({
            read: null,
            isReading: false,
          });
        });
      } else {
        var readDate = new Date();
        usersRef.doc(auth.currentUser.uid).collection("readinglog").doc(uid).set({
            date: readDate,
        }).then(() => {
          this.setState({
            read: readDate,
            isReading: false,
          })
        })
      }
    });
  }

  render() {
    const { classes } = this.props;
    const { doc } = this.state;

    return (
      <div style = {{ marginTop: 80 }}>
            <Card className={classes.card}>
              <CardContent>
                  { this.state.isLoading ?
                    <div>
                      <CircularProgress />
                    </div>
                  :
                    (<div>
                        <Typography className={classes.labels}>{doc.title}</Typography>
                        <Typography className={classes.note}>{doc.code}</Typography>
                        <Typography className={classes.note}>{doc.author ? doc.author : doc.publisher}</Typography>
                        <Typography className={classes.note}><b>Last updated: </b>
                          {doc.date ? <FormattedDate value={doc.date.toDate()} month='long' day='numeric' year='numeric' /> : 'Unknown' }
                        </Typography>
                        <Typography className={classes.note}><b>Date read: </b>
                          {this.state.read ? <FormattedDate value={this.state.read} month='long' day='numeric' year='numeric' /> : 'N/A' }
                        </Typography>
                        <Button variant="outlined" color={this.state.read ? "secondary" : "primary"} onClick={() => this.markAsRead(this.state.docID)} style={{marginTop: 16, height: 40, width: 160 }}>
                          {this.state.isReading ? <CircularProgress size={24} color={this.state.read ? "secondary" : "primary"} /> : [(this.state.read ? 'Mark as Unread' : 'Mark as Read')] }
                        </Button>
                        <Typography className={classes.note}>{doc.desc}</Typography>
                        { doc.link && (
                              <Button variant="outlined" color={"primary"} onClick={() => this.openLink(doc.link)} style={{marginTop: 16, height: 40, width: 160 }}>
                                Follow Link
                              </Button>
                          )}
                    </div>
                  )}
              </CardContent>
            </Card>
            {/* {
              doc.docType == 'pdf' &&
              (<div>
                <Document
                  file={doc.link}
                  onLoadSuccess={this.onDocumentLoad}
                >
                  <Page pageNumber={this.state.pageNumber} />
                </Document>
                <p>Page {this.state.pageNumber} of {this.state.numPages}</p>
                {doc.link}
              </div>)
            } */}
      </div>
    );
  }
}

export default withStyles(formStyles)(connect(mapStateToProps)(DocumentViewer));
