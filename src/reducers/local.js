import {
          GET_STAFF,
          AUTH_USER,
          GET_DOCUMENTS,
          GET_USER,
          GET_WFM,
          GET_MODULES,
          SEARCH_CHANGE,
          CAT_CHANGE,
          GET_TOOLS,
          GET_NOTICES,
          GET_READINGLOG,
        } from "../constants/action-types"

const localInit = {
  auth: [],
  userRef: null,
  userRefName: null,
  documents: [],
  staff: [],
  tools: [],
  user: {},
  wfmJobs: [],
  modules: [],
  notices: [],
  readingLog: [],
  search: null,
  category: 'gen',
};

// Properties related to local data retrieved from firebase
export default function localReducer(state = localInit, action) {
  switch (action.type) {
    case GET_STAFF:
      return { ...state, staff: action.payload };
    case AUTH_USER:
      return { ...state, auth: action.payload };
    case GET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case GET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case GET_WFM:
      return {
        ...state,
        wfmJobs: action.payload,
      }
    case GET_MODULES:
      return {
        ...state,
        modules: action.payload,
      }
    case SEARCH_CHANGE:
      return {
        ...state,
        search: action.payload,
      }
    case CAT_CHANGE:
      return {
        ...state,
        category: action.payload,
      }
    case GET_TOOLS:
      return {
        ...state,
        tools: action.payload,
      }
    case GET_NOTICES:
      return {
        ...state,
        notices: action.payload,
      }
    case GET_READINGLOG:
      return {
        ...state,
        readingLog: action.payload,
      }
    default:
      return state;
  }
}
