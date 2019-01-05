import {
          ADD_TAG,
          DELETE_TAG,
          EDIT_MODAL_DOC,
          EDIT_MODAL_DOC_STEPS,
          EDIT_MODAL_SAMPLE,
          EDIT_MODAL,
          HIDE_MODAL,
          RESET_MODAL,
          SET_MODAL_ERROR,
          SHOW_MODAL,
        } from "../constants/action-types"

export const modalInit = {
  modalType: null,
  modalProps: {
    doc: {
      personnel: [],
      dates: [],
      samples: {},
    },
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
         },
      }
    case EDIT_MODAL_DOC_STEPS:
      console.log(`handling step ${action.payload.step}`);
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
                      ...state.modalProps.doc.steps[action.payload.step][action.payload.id],
                      ...action.payload.value,
                    },
                  },
                },
              },
            },
          }
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
                    [action.payload.id]: action.payload.value,
                  },
                },
              },
            },
          }
        }
      }
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
                [action.payload.type]: action.payload.value,
              }
           },
         },
       },
      }
    case EDIT_MODAL:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          ...action.payload}
        }
    case HIDE_MODAL:
      return {
        ...state,
        modalType: null,
      };
    case ADD_TAG:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            tags: [
              ...state.modalProps.doc.tags,
              action.payload,
            ],
          },
        },
      }
    case DELETE_TAG:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          doc: {
            ...state.modalProps.doc,
            tags: [
              ...state.modalProps.doc.tags.filter((tag, index) => index !== action.payload)
            ]
          },
        },
      }
    case SET_MODAL_ERROR:
      return {
        ...state,
        modalProps: {
          ...state.modalProps,
          error: action.payload
        }
      }
    default:
      return state;
  }
}
