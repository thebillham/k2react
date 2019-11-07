import { combineReducers } from "redux";

import asbestosLabReducer from "./asbestosLab";
import localReducer from "./local";
import modalReducer from "./modal";
import displayReducer from "./display";
import constReducer from "./const";
import footprintsReducer from "./footprints";
import jobsReducer from "./jobs";

const rootReducer = combineReducers({
  local: localReducer,
  modal: modalReducer,
  display: displayReducer,
  const: constReducer,
  footprints: footprintsReducer,
  asbestosLab: asbestosLabReducer,
  jobs: jobsReducer,
});

export default rootReducer;
