import { combineReducers } from 'redux'

import localReducer from './local';
import modalReducer from './modal';
import displayReducer from './display';
import constReducer from './const';

const rootReducer = combineReducers({
  local: localReducer,
  modal: modalReducer,
  display: displayReducer,
  const: constReducer,
});

export default rootReducer;
