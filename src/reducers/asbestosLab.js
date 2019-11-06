import {
  DELETE_COC,
  GET_ASBESTOS_ANALYSIS,
  GET_AIR_ANALYSTS,
  GET_ASBESTOS_SAMPLES,
  GET_BULK_ANALYSTS,
  GET_COCS,
  GET_SAMPLES,
  GET_SAMPLE_LOG,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  SET_ANALYSIS_SESSION_ID,
  RESET_ASBESTOS_LAB,
  SET_VIEW_SAMPLE_DETAIL
} from "../constants/action-types";

import { stateRef } from "../config/firebase";

const asbestosLabInit = {
    airAnalysts: [],
    analysisMode: "normal",
    analyst: "",
    asbestosAnalysis: [],
    bulkAnalysts: [],
    cocs: {},
    samples: {},
    sampleLog: [],
    sampleView: null,
    sessionID: '',
};

// Properties related to local data retrieved from firebase
export default function asbestosLabReducer(state = asbestosLabInit, action) {
  switch (action.type) {
    case GET_AIR_ANALYSTS:
      if (action.update)
        stateRef.doc("airAnalysts").set({ payload: action.payload });
      return {
        ...state,
        airAnalysts: action.payload
      };
    case GET_ASBESTOS_SAMPLES:
      if (action.update) stateRef.doc("asbestosSamples").set(action.payload);
      return {
        ...state,
        samplesAsbestos: action.payload
      };
    case GET_BULK_ANALYSTS:
      if (action.update)
        stateRef.doc("bulkAnalysts").set({ payload: action.payload });
      return {
        ...state,
        bulkAnalysts: action.payload
      };
    case GET_COCS:
      if (action.update) stateRef.doc("cocs").set(action.payload);
      return { ...state,
        cocs: {
          ...state.cocs,
          ...action.payload
        }
      };
    case DELETE_COC:
      let newCocs = state.cocs;
      delete newCocs[action.payload];
      //console.log(newCocs);
      return { ...state,
        cocs: { ...state.cocs }
      };
    case GET_ASBESTOS_ANALYSIS:
      if (action.update) stateRef.doc("asbestosAnalysis").set(action.payload);
      return { ...state,
        asbestosAnalysis: action.payload,
      }
    case GET_SAMPLES:
      return {
        ...state,
        samples: {
          ...state.samples,
          [action.cocUid]: {
            ...state.samples[action.cocUid],
            ...action.payload,
          },
        }
      };
    case GET_SAMPLE_LOG:
      if (action.update) stateRef.doc("asbestosSampleLog").set(action.payload);
      return {
        ...state,
        sampleLog: action.payload
      };
    case SET_VIEW_SAMPLE_DETAIL:
      return {
        ...state,
        sampleView: action.payload
      };
    case RESET_ASBESTOS_LAB:
      return asbestosLabInit;
    case SET_ANALYST:
      return {
        ...state,
        analyst: action.payload
      };
    case SET_ANALYSIS_MODE:
      return {
        ...state,
        analysisMode: action.payload
      };
    case SET_ANALYSIS_SESSION_ID:
      return {
        ...state,
        sessionID: action.payload
      };
    default:
      return state;
  }
}
