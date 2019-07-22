import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import { connect } from "react-redux";
import AsbestosBulkCocCard from "./AsbestosBulkCocCard";

class AsbestosBulkCocCardWrapper extends React.PureComponent {
  // static whyDidYouRender = true;

  render() {
    return (<AsbestosBulkCocCard job={this.props.job} />);
  }
}

export default AsbestosBulkCocCardWrapper;
