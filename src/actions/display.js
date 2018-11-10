import { APP_HAS_LOADED,
        RESET_DISPLAY,
      } from "../constants/action-types";

export const resetDisplay = () => dispatch => {
  dispatch({ type: RESET_DISPLAY });
};

export const appHasLoaded = () => dispatch => {
  dispatch({
    type: APP_HAS_LOADED,
  });
};
