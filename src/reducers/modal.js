import {
  ADD_TAG,
  DELETE_TAG,
  EDIT_MODAL_DOC,
  EDIT_MODAL_DOC_STEPS,
  EDIT_MODAL_DOC_SAMPLES,
  EDIT_MODAL_GLOSSARY,
  EDIT_MODAL_SAMPLE,
  EDIT_MODAL,
  HIDE_MODAL,
  HIDE_MODAL_SECONDARY,
  RESET_MODAL,
  RESET_MODAL_SECONDARY,
  SET_MODAL_ERROR,
  SHOW_MODAL,
  SHOW_MODAL_SECONDARY,
} from "../constants/action-types";

const modalInit = {
  modalType: null,
  modalProps: {
    doc: {
      personnel: [],
      dates: [],
      type: ""
    },
    isUploading: false,
    uploadProgress: 0,
    tags: []
  },
  modalTypeSecondary: null,
  modalPropsSecondary: {
    doc: {

    },
  },
};

// All properties related to dialog boxes etc.
export default function modalReducer(state = modalInit, action) {
  switch (action.type) {
    case RESET_MODAL:
      return modalInit;
    case RESET_MODAL_SECONDARY:
      return {...state,
        modalTypeSecondary: null,
        modalPropsSecondary: {
          doc: {

          },
        }
      }
    case SHOW_MODAL:
      return {
        modalProps: {
          ...state.modalProps,
          ...action.modalProps
        },
        modalType: action.modalType
      };
    case SHOW_MODAL_SECONDARY:
      return {
        ...state,
        modalPropsSecondary: {
          ...state.modalPropsSecondary,
          ...action.modalProps
        },
        modalTypeSecondary: action.modalType
      };
    case EDIT_MODAL_DOC:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            ...action.payload
          }
        }
      };
    case EDIT_MODAL_DOC_SAMPLES:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            samples: {...action.payload}
          }
        }
      };
    case EDIT_MODAL_DOC_STEPS:
      if (state.modalProps.doc && state.modalProps.doc.steps) {
        if (action.payload.object) {
          return {
            ...state,
            modalProps: {
              ...state.modalProps,
              doc: {
                ...state.modalProps.doc,
                steps: {
                  ...state.modalProps.doc.steps,
                  [action.payload.step]: {
                    ...state.modalProps.doc.steps[action.payload.step],
                    [action.payload.id]: {
                      ...state.modalProps.doc.steps[action.payload.step][
                        action.payload.id
                      ],
                      ...action.payload.value
                    }
                  }
                }
              }
            }
          };
        } else {
          return {
            ...state,
            modalProps: {
              ...state.modalProps,
              doc: {
                ...state.modalProps.doc,
                steps: {
                  ...state.modalProps.doc.steps,
                  [action.payload.step]: {
                    ...state.modalProps.doc.steps[action.payload.step],
                    [action.payload.id]: action.payload.value
                  }
                }
              }
            }
          };
        }
      } else return state;
    case EDIT_MODAL_GLOSSARY:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            glossary: {
              ...state.modalProps.doc.glossary,
              [action.payload.number]: {
                ...state.modalProps.doc.glossary[action.payload.number],
                [action.payload.type]: action.payload.value
              }
            }
          }
        }
      };
    case EDIT_MODAL_SAMPLE:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            samples: {
              ...state.modalProps.doc.samples,
              [action.payload.number]: {
                ...state.modalProps.doc.samples[action.payload.number],
                [action.payload.type]: action.payload.value
              }
            }
          }
        }
      };
    case EDIT_MODAL:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          ...action.payload
        }
      };
    case HIDE_MODAL:
      return {
        ...state,
        modalType: null
      };
    case HIDE_MODAL_SECONDARY:
      return {
        ...state,
        modalTypeSecondary: null
      };
    case ADD_TAG:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            tags: [...state.modalProps.doc.tags, action.payload]
          }
        }
      };
    case DELETE_TAG:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            tags: [
              ...state.modalProps.doc.tags.filter(
                (tag, index) => index !== action.payload
              )
            ]
          }
        }
      };
    case SET_MODAL_ERROR:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          error: action.payload
        }
      };
    default:
      return state;
  }
}
