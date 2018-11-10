import {
          SHOW_MODAL,
          HIDE_MODAL,
          EDIT_MODAL,
          EDIT_MODAL_DOC,
          ADD_TAG,
          DELETE_TAG,
          RESET_MODAL,
        } from "../constants/action-types"

export const modalInit = {
  modalType: null,
  modalProps: {
    doc: {},
    isUploading: false,
    uploadProgress: 0,
    tags: [],
  },
};

// All properties related to dialog boxes etc.
export default function modalReducer(state = modalInit, action){
  switch (action.type) {
    case RESET_MODAL:
      return modalInit;
    case SHOW_MODAL:
      return {
        modalProps: {
          ...state.modalProps,
          ...action.modalProps,
        },
        modalType: action.modalType
      }
    case EDIT_MODAL_DOC:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            ...action.payload,
           },
         }
      }
    case EDIT_MODAL:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          ...action.payload}
        }
    case HIDE_MODAL:
      return modalInit;
    case ADD_TAG:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          tags: [
            ...state.modalProps.tags,
            action.payload,
          ]
        },
      }
    case DELETE_TAG:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          tags: {
            ...state.modalProps.tags.filter((tag, index) => index !== action.payload)
          }
        }
      }
    default:
      return state;
  }
}
