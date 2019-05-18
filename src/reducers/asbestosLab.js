import {
  GET_ASBESTOS_ANALYSIS,
  GET_AIR_ANALYSTS,
  GET_ASBESTOS_SAMPLES,
  GET_BULK_ANALYSTS,
  GET_COCS,
  GET_SAMPLES,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  RESET_ASBESTOS_LAB,
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
    case GET_ASBESTOS_ANALYSIS:
      if (action.update) stateRef.doc("asbestosAnalysis").set(action.payload);
      return { ...state,
        asbestosanalysis: action.payload,
      }
    case GET_SAMPLES:
      return {
        ...state,
        samples: { ...state.samples, [action.cocUid]: action.payload }
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
    default:
      return state;
  }
}
