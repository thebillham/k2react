import React from 'react';
import Paper from '@material-ui/core/Paper';
import PDFViewer from 'mgr-pdf-viewer-react';

export default class HazardRegister extends React.Component {
  state = {
    numPages: null,
    pageNumber: 2,
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  pageUp () {
    this.setState({ pageNumber: this.pageNumber + 1 });
  }

  pageDown () {
    this.setState({ pageNumber: this.pageNumber - 1});
  }

  render() {
    const { pageNumber, numPages } = this.state;

    return (
        <PDFViewer document={
          {url: '/ref/SM-3.2.21-bio.pdf'}
        } />
    );
  }

}
