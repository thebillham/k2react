import {
          GET_STAFF,
          GET_DOCUMENTS,
          GET_USER,
          GET_WFM,
          GET_QUIZZES,
          GET_TRAININGS,
          GET_COCS,
          GET_SAMPLES,
          GET_MODULES,
          SEARCH_CHANGE,
          CAT_CHANGE,
          GET_TOOLS,
          GET_NOTICES,
          GET_READINGLOG,
          GET_METHODLOG,
          GET_ME,
          DELETE_NOTICE,
          READ_NOTICE,
          FAV_NOTICE,
          SET_STEPPER,
          GET_ASBESTOS_SAMPLES,
          GET_HELP,
          GET_UPDATES,
          RESET_LOCAL,
        } from "../constants/action-types"

const localInit = {
  auth: [],
  me: {},
  userRef: null,
  userRefName: null,
  documents: [],
  quizzes: [],
  staff: [],
  tools: [],
  user: {},
  wfmJobs: [],
  modules: [],
  trainingpaths: [],
  notices: [],
  readingLog: [],
  methodLog: [],
  search: null,
  category: 'gen',
  steppers: [],
  samplesasbestos: {},
  cocs: {},
  helps: [],
  updates: [],
};

// Properties related to local data retrieved from firebase
export default function localReducer(state = localInit, action) {
  switch (action.type) {
    case RESET_LOCAL:
      return localInit;
    case GET_STAFF:
      console.log('Fired get staff');
      return { ...state, staff: action.payload };
    case GET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case GET_COCS:
      return { ...state, cocs: action.payload };
    case GET_SAMPLES:
      return {
        ...state,
        cocs: {
          ...state.cocs,
          [action.jobnumber]: {
            ...state.cocs[action.jobnumber],
            samples: action.payload,
        }
      }
    };
    case GET_ME:
      console.log('Fired get me!');
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
    case GET_QUIZZES:
      return {
        ...state,
        quizzes: action.payload,
      }
    case GET_TRAININGS:
      return {
        ...state,
        trainingpaths: action.payload,
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
    case GET_HELP:
      return {
        ...state,
        helps: action.payload,
      }
    case GET_UPDATES:
      return {
        ...state,
        updates: action.payload,
      }
    case GET_READINGLOG:
      return {
        ...state,
        readingLog: action.payload,
      }
    case GET_METHODLOG:
      return {
        ...state,
        methodLog: action.payload,
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
      case SET_STEPPER:
        return {
          ...state,
          stepper: action.payload,
        }
      case GET_ASBESTOS_SAMPLES:
        return {
          ...state,
          samplesasbestos: action.payload,
        }
    default:
      return state;
  }
}
