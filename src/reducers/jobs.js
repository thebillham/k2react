import {
  GET_SITES,
  GET_WFM_JOBS,
  GET_WFM_JOB,
  CLEAR_WFM_JOB,
  GET_WFM_CONTACT,
  GET_WFM_LEADS,
  GET_WFM_CLIENTS,
  SAVE_WFM_ITEMS,
  SAVE_WFM_STATS,
  GET_JOB_LIST,
  GET_SITE_JOB,
  GET_SITE_JOBS,
  ADD_TO_JOB_LIST,
  GET_JOB_STATS,
  GET_GEOCODES,
  ADD_TO_GEOCODES,
  GET_CURRENT_JOB_STATE,
  RESET_JOBS,
  SET_LAST_TIME_SAVED,
} from "../constants/action-types";

import { stateRef } from "../config/firebase";

const jobsInit = {
  currentJobState: {},
  geocodes: {},
  sites: {},
  wfmJob: null,
  wfmItems: [],
  wfmJobs: [],
  wfmLeads: [],
  wfmClients: [],
  wfmStats: {},
  jobs: {},
  jobList: {},
  jobStats: {},
  lastTimeSaved: null,
};

// Properties related to local data retrieved from firebase
export default function jobsReducer(state = jobsInit, action) {
  switch (action.type) {
    case GET_SITES:
      if (action.update) stateRef.doc("sites").set({ payload: action.payload });
      return {
        ...state,
        sites: action.payload
      };
    case GET_WFM_JOBS:
      return {
        ...state,
        wfmJobs: action.payload
      };
    case GET_WFM_JOB:
      return {
        ...state,
        wfmJob: {...state.wfmJob, ...action.payload}
      };
    case CLEAR_WFM_JOB:
      return {
        ...state,
        wfmJob: null,
      }
    case GET_WFM_CONTACT:
      return {
        ...state,
        wfmJob: {...state.wfmJob, ...action.payload}
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
    case ADD_TO_GEOCODES:
      return {
        ...state,
        geocodes: {
          ...state.geocodes,
          ...action.payload,
        }
      }
    case GET_SITES:
      if (action.update) stateRef.doc("sites").set({ payload: action.payload });
      return {
        ...state,
        sites: action.payload
      };
    case GET_CURRENT_JOB_STATE:
      return {
        ...state,
        currentJobState: action.payload
      };
    case GET_JOB_STATS:
      return {
        ...state,
        jobStats: action.payload,
      }
    case GET_SITE_JOB:
      return {
        ...state,
        sites: {
          ...state.sites,
          [action.payload.site]: {
            ...state.sites[action.payload.site],
            jobs: {
              ...state.sites[action.payload.site].jobs,
              [action.payload.job.uid]: action.payload.job,
            }
          },
        }
      }
    case GET_SITE_JOBS:
      return {
        ...state,
        sites: {
          ...state.sites,
          [action.payload.site]: {
            ...state.sites[action.payload.site],
            jobs: {
              ...state.sites[action.payload.site].jobs,
              ...action.payload.jobs,
            }
          }
        }
      }
    case GET_JOB_LIST:
      return {
        ...state,
        jobList: {
          ...state.jobList,
          ...action.payload,
        },
      }
    case ADD_TO_JOB_LIST:
      return {
        ...state,
        jobList: {
          ...state.jobList,
          [action.payload.wfmID]: action.payload,
        },
      }
    case SET_LAST_TIME_SAVED:
      return {
        ...state,
        lastTimeSaved: action.payload,
      }
    case RESET_JOBS:
      return jobsInit;
    default:
      return state;
  }
}
