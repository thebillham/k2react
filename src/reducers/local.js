import {
  GET_STAFF,
  GET_AIRANALYSTS,
  GET_BULKANALYSTS,
  GET_DOCUMENTS,
  GET_EDIT_STAFF,
  GET_EDIT_STAFF_ATTR,
  GET_GEOCODES,
  GET_USER,
  GET_WFM_JOBS,
  GET_WFM_JOB,
  GET_WFM_LEADS,
  GET_WFM_CLIENTS,
  GET_QUIZZES,
  GET_QUIZLOG,
  GET_QUESTIONS,
  GET_TRAININGS,
  GET_COCS,
  GET_SAMPLES,
  GET_METHODS,
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
  GET_CURRENT_JOB_STATE,
  GET_HELP,
  GET_UPDATES,
  RESET_LOCAL,
  UPDATE_STAFF,
  GET_VEHICLES,
  SET_MODAL_ERROR,
  SET_ANALYST,
  SET_ANALYSIS_MODE,
  SAVE_WFM_ITEMS,
  SAVE_WFM_STATS
} from "../constants/action-types";

import { stateRef } from "../config/firebase";

const localInit = {
  airanalysts: [],
  analysismode: "normal",
  analyst: "",
  auth: [],
  bulkanalysts: [],
  category: "gen",
  cocs: {},
  currentJobState: {},
  documents: [],
  editstaff: {},
  geocodes: {},
  helps: [],
  me: {},
  methodLog: [],
  methods: [],
  notices: [],
  questions: [],
  quizzes: [],
  readingLog: [],
  samples: {},
  search: null,
  staff: {},
  steppers: [],
  tools: [],
  trainingpaths: [],
  updates: [],
  user: {},
  userRef: null,
  userRefName: null,
  vehicles: [],
  wfmJob: null,
  wfmItems: [],
  wfmJobs: [],
  wfmLeads: [],
  wfmClients: [],
  wfmStats: {}
};

// Properties related to local data retrieved from firebase
export default function localReducer(state = localInit, action) {
  switch (action.type) {
    case GET_AIRANALYSTS:
      if (action.update)
        stateRef.doc("airanalysts").set({ payload: action.payload });
      return {
        ...state,
        airanalysts: action.payload
      };
    case GET_ASBESTOS_SAMPLES:
      if (action.update) stateRef.doc("asbestossamples").set(action.payload);
      return {
        ...state,
        samplesasbestos: action.payload
      };
    case GET_BULKANALYSTS:
      if (action.update)
        stateRef.doc("bulkanalysts").set({ payload: action.payload });
      return {
        ...state,
        bulkanalysts: action.payload
      };
    case GET_COCS:
      if (action.update) stateRef.doc("cocs").set(action.payload);
      return { ...state, cocs: action.payload };
    case GET_DOCUMENTS:
      if (action.update)
        stateRef.doc("documents").set({ payload: action.payload });
      return { ...state, documents: action.payload };
    case GET_HELP:
      return {
        ...state,
        helps: action.payload
      };
    case GET_ME:
      return {
        ...state,
        me: {
          ...state.me,
          ...action.payload
        }
      };
    case GET_METHODLOG:
      return {
        ...state,
        me: {
          ...state.me,
          methodLog: action.payload
        }
      };
    case GET_METHODS:
      if (action.update)
        stateRef.doc("methods").set({ payload: action.payload });
      return {
        ...state,
        methods: action.payload
      };
    case GET_NOTICES:
      if (action.update)
        stateRef.doc("notices").set({ payload: action.payload });
      return {
        ...state,
        notices: action.payload
      };
    case GET_QUESTIONS:
      if (action.update)
        stateRef.doc("questions").set({ payload: action.payload });
      return {
        ...state,
        questions: action.payload
      };
    case GET_QUIZLOG:
      return {
        ...state,
        me: {
          ...state.me,
          quizLog: action.payload
        }
      };
    case GET_QUIZZES:
      if (action.update)
        stateRef.doc("quizzes").set({ payload: action.payload });
      return {
        ...state,
        quizzes: action.payload
      };
    case GET_READINGLOG:
      return {
        ...state,
        me: {
          ...state.me,
          readingLog: action.payload
        }
      };
    case GET_SAMPLES:
      // if (action.update) {
      //   stateRef.doc("samples").set({ payload: {
      //     ...state.samples,
      //     [action.cocUid]: action.payload
      //     }
      //   });
      // }
      return {
        ...state,
        samples: { ...state.samples, [action.cocUid]: action.payload }
      };
    case GET_STAFF:
      if (action.update) stateRef.doc("staff").set(action.payload);
      return { ...state, staff: action.payload };
    case GET_EDIT_STAFF:
      return {
        ...state,
        editstaff: {
          ...state.editstaff,
          ...action.payload,
        }
      };
    case GET_TOOLS:
      if (action.update) stateRef.doc("tools").set({ payload: action.payload });
      return {
        ...state,
        tools: action.payload
      };
    case GET_TRAININGS:
      if (action.update)
        stateRef.doc("trainings").set({ payload: action.payload });
      return {
        ...state,
        trainingpaths: action.payload
      };
    case GET_UPDATES:
      return {
        ...state,
        updates: action.payload
      };
    case GET_USER:
      return {
        ...state,
        user: action.payload
      };
    case GET_VEHICLES:
      if (action.update)
        stateRef.doc("vehicles").set({ payload: action.payload });
      return {
        ...state,
        vehicles: action.payload
      };
    case GET_WFM_JOBS:
      return {
        ...state,
        wfmJobs: action.payload
      };
    case GET_WFM_JOB:
      return {
        ...state,
        wfmJob: action.payload
      };
    case GET_WFM_LEADS:
      return {
        ...state,
        wfmLeads: action.payload
      };
    case GET_WFM_CLIENTS:
      return {
        ...state,
        wfmClients: action.payload
      };
    case SAVE_WFM_ITEMS:
      return {
        ...state,
        wfmItems: action.payload
      };
    case SAVE_WFM_STATS:
      return {
        ...state,
        wfmStats: action.payload
      };
    case GET_GEOCODES:
      return {
        ...state,
        geocodes: action.payload
      };
    case GET_CURRENT_JOB_STATE:
      return {
        ...state,
        currentJobState: action.payload
      };
    case CAT_CHANGE:
      return {
        ...state,
        category: action.payload
      };
    case DELETE_NOTICE:
      return {
        ...state,
        me: {
          ...state.me,
          deletednotices: action.payload
        }
      };
    case FAV_NOTICE:
      return {
        ...state,
        me: {
          ...state.me,
          favnotices: action.payload
        }
      };
    case RESET_LOCAL:
      return localInit;
      return {
        ...state,
        samples: {
          ...state.samples,
          [action.cocUid]: action.payload
        }
      };
    case SEARCH_CHANGE:
      return {
        ...state,
        search: action.payload
      };
    case UPDATE_STAFF:
      return {
        ...state,
        staff: {
          ...state.staff,
          [action.userPath]: {
            ...state.staff[action.userPath],
            ...action.payload
          }
        }
      };
    case READ_NOTICE:
      return {
        ...state,
        me: {
          ...state.me,
          readnotices: action.payload
        }
      };
    case SET_STEPPER:
      return {
        ...state,
        stepper: action.payload
      };
    case SET_ANALYST:
      return {
        ...state,
        analyst: action.payload
      };
    case SET_ANALYSIS_MODE:
      return {
        ...state,
        analysismode: action.payload
      };
    default:
      return state;
  }
}
