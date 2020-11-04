import reduxThunk from "redux-thunk";
import { createBrowserHistory } from "history";
import { connectRouter, routerMiddleware } from "connected-react-router";
import rootReducer from "../reducers";
import { createStore, applyMiddleware, compose } from "redux";

export const history = createBrowserHistory();

const store = createStore(
  connectRouter(history)(rootReducer),
  {},
  compose(applyMiddleware(routerMiddleware(history), reduxThunk))
);

export default store;
