import { MARK_FOOTPRINT } from "../constants/action-types";

export const markFootprint = area => dispatch => {
  dispatch({
    type: MARK_FOOTPRINT,
    payload: { [area]: true }
  });
};
