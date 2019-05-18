import { combineReducers } from "redux";

import asbestosLabReducer from "./asbestosLab";
import localReducer from "./local";
import modalReducer from "./modal";
import displayReducer from "./display";
import constReducer from "./const";
import footprintsReducer from "./footprints";

const rootReducer = combineReducers({
  local: localReducer,
  modal: modalReducer,
  display: displayReducer,
  const: constReducer,
  footprints: footprintsReducer,
  asbestosLab: asbestosLabReducer,
});

export default rootReducer;
