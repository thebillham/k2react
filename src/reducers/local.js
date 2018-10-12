import {
          GET_STAFF,
          GET_DOCUMENTS,
          ADD_DOCUMENT,
          EDIT_USER,
          GET_USER,
        } from "../constants/action-types"

const localInit = {
  userRef: 'koRSGnzyz4dxfhvXjQklU8CzENG3',
  userRefName: 'Jeff',
  documents: [],
  staff: [],
  user: {},
};

// Properties related to local data retrieved from firebase
export default function localReducer(state = localInit, action) {
  switch (action.type) {
    case GET_STAFF:
      return { ...state, staff: action.payload };
    case GET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case GET_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}
