import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import theme from "./config/theme";
import store, { history } from "./store/index";

// WRAP APP IN APP-WIDE COMPONENTS
// Provider: Gives all components access to the redux store so properties don't need to be passed between components
// ConnectedRouter: For navigation, renders components based on links
// MuiThemeProvider: Styles all app components
// IntlProvider: Used for date formatting

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();
