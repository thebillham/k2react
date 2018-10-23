import {
          GET_STAFF,
          GET_DOCUMENTS,
          GET_USER,
          GET_WFM,
          GET_MODULES,
          SEARCH_CHANGE,
          CAT_CHANGE,
          GET_TOOLS,
          GET_NOTICES,
          GET_READINGLOG,
          GET_ME,
          DELETE_NOTICE,
          READ_NOTICE,
          FAV_NOTICE,
        } from "../constants/action-types"

const localInit = {
  auth: [],
  me: {},
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
    case GET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case GET_ME:
      return {
        ...state,
        me: {
          ...state.me,
          ...action.payload,
        }
      }
    case GET_USER:
      return {
        ...state,
        user: action.payload,
      }
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
    case DELETE_NOTICE:
      return {
        ...state,
        me: {
          ...state.me,
          deletednotices: action.payload,
        }
      }
      case FAV_NOTICE:
        return {
          ...state,
          me: {
            ...state.me,
            favnotices: action.payload,
          }
        }
      case READ_NOTICE:
        return {
          ...state,
          me: {
            ...state.me,
            readnotices: action.payload,
          }
        }
    default:
      return state;
  }
}
