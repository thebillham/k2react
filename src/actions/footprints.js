import { MARK_FOOTPRINT,
      } from "../constants/action-types";
import { auth } from '../config/firebase';

export const markFootprint = area => dispatch => {
  dispatch({
    type: MARK_FOOTPRINT,
    payload: { help: true, },
  });
};
