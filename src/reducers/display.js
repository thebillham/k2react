import { APP_HAS_LOADED, RESET_DISPLAY } from "../constants/action-types";

const displayInit = {
  initialLoading: true
};

// Properties related to all other displays
export default function displayReducer(state = displayInit, action) {
  switch (action.type) {
    case RESET_DISPLAY:
      return displayInit;
    case APP_HAS_LOADED:
      return {
        ...state,
        initialLoading: false
      };
    // case SHOW_MODAL:
    //   return { ...state, modalProps: action.modalProps, modalType: action.modalType}
    // case HIDE_MODAL:
    //   return {...state, modalInit };
    default:
      return state;
  }
}
