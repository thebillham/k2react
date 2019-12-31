import {
  GET_STAFF,
  GET_DOCUMENTS,
  GET_EDIT_STAFF,
  CLEAR_EDIT_STAFF,
  GET_FIRESTORE_COLLECTION,
  GET_USER,
  CLEAR_LOG,
  GET_ASSETS,
  GET_LOGS,
  GET_QUIZZES,
  GET_QUIZLOG,
  GET_QUESTIONS,
  GET_TRAININGS,
  GET_METHODS,
  SEARCH_CHANGE,
  CAT_CHANGE,
  GET_TOOLS,
  GET_INCIDENTS,
  GET_NOTICES,
  GET_NOTICE_READS,
  GET_READINGLOG,
  GET_METHODLOG,
  GET_ME,
  SET_STEPPER,
  GET_HELP,
  GET_UPDATES,
  RESET_LOCAL,
  UPDATE_STAFF,
  GET_VEHICLES,
} from "../constants/action-types";

import { stateRef } from "../config/firebase";

const localInit = {
  auth: [],
  acmTemplates: [],
  assets: [],
  bmTemplates: [],
  category: "",
  documents: [],
  editstaff: {},
  incidents: [],
  helps: [],
  logs: [],
  me: {},
  methodLog: [],
  methods: [],
  notices: [],
  noticeReads: [],
  questions: [],
  quizzes: [],
  readingLog: [],
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
};

// Properties related to local data retrieved from firebase
export default function localReducer(state = localInit, action) {
  switch (action.type) {
    case GET_FIRESTORE_COLLECTION:
      if (action.update)
        stateRef.doc(action.statePath).set({ payload: action.payload });
      return {
        ...state,
        [action.statePath]: action.payload,
      }
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
    case GET_ASSETS:
      if (action.update) {
        let assets = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
        action.payload.forEach(asset => {
          assets[asset.id.charAt(0)].push(asset);
        });
        stateRef.doc("assets").set(assets);
      }
      return {
        ...state,
        assets: action.payload,
      }
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
    case GET_NOTICE_READS:
      if (action.update) {
        let users = {};
        let notices = {};
        action.payload.forEach(noticeRead => {
          if (notices[noticeRead.noticeUid]) notices[noticeRead.noticeUid].push(noticeRead.staffUid);
            else notices[noticeRead.noticeUid] = [noticeRead.staffUid];
          if (users[noticeRead.staffUid]) users[noticeRead.staffUid].push(noticeRead.noticeUid);
            else users[noticeRead.staffUid] = [noticeRead.noticeUid];
        });
        Object.keys(users).forEach(user => {
          stateRef.doc("noticereads").collection("users").doc(user).set({ payload: users[user] });
        });
        Object.keys(notices).forEach(notice => {
          stateRef.doc("noticereads").collection("notices").doc(notice).set({ payload: notices[notice] });
        });
      }
      return {
        ...state,
        noticeReads: action.payload
      };
    case GET_INCIDENTS:
      if (action.update)
        stateRef.doc("incidents").set({ payload: action.payload });
      return {
        ...state,
        incidents: action.payload
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
    case GET_LOGS:
      return {
        ...state,
        logs: action.payload,
      };
    case CLEAR_LOG:
      return {
        ...state,
        logs: [],
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
    case CLEAR_EDIT_STAFF:
      return {
        ...state,
        editstaff: {},
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
    case CAT_CHANGE:
      return {
        ...state,
        category: action.payload
      };
    case RESET_LOCAL:
      return localInit;
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
    case SET_STEPPER:
      return {
        ...state,
        stepper: action.payload
      };
    default:
      return state;
  }
}
