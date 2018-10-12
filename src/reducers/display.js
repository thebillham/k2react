import {

        } from "../constants/action-types"

const displayInit = {

};

// Properties related to all other displays
export default function displayReducer(state = displayInit, action){
  switch (action.type) {
    // case SHOW_MODAL:
    //   return { ...state, modalProps: action.modalProps, modalType: action.modalType}
    // case HIDE_MODAL:
    //   return {...state, modalInit };
    default:
      return state;
  }
}
