import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import { MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./config/theme";
import store, { history } from "./store/index";
import whyDidYouRender from "@welldone-software/why-did-you-render";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
// import LogRocket from 'logrocket';
// LogRocket.init('wisi23/k2');

// WRAP APP IN APP-WIDE COMPONENTS
// Provider: Gives all components access to the redux store so properties don't need to be passed between components
// ConnectedRouter: For navigation, renders components based on links
// MuiThemeProvider: Styles all app components
// IntlProvider: Used for date formatting

whyDidYouRender(React, {
  onlyLogs: true,
  titleColor: "green",
  diffNameColor: "aqua"
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <App />
        </MuiPickersUtilsProvider>
      </ConnectedRouter>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById("root")
);

// registerServiceWorker();
