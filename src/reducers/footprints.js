import { MARK_FOOTPRINT } from "../constants/action-types";

const footprintsInit = {
  footprints: {}
};

// Properties related to local data retrieved from firebase
export default function footprintsReducer(state = footprintsInit, action) {
  switch (action.type) {
    case MARK_FOOTPRINT:
      return {
        ...state,
        footprints: {
          ...state.footprints,
          ...action.payload
        }
      };
    default:
      return state;
  }
}
