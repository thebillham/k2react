import { INIT_CONSTANTS,
      } from "../constants/action-types";
import { constRef } from '../config/firebase';

export const initConstants = () => dispatch => {
  constRef.get().then(doc => {
    dispatch({
      type: INIT_CONSTANTS,
      payload: doc.data(),
    });
  });
};
