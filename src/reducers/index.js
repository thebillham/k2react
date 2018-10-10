import { GET_STAFF,
          GET_DOCUMENTS,
          ADD_DOCUMENT,
          SHOW_MODAL,
          HIDE_MODAL,
        } from "../constants/action-types"
import { combineReducers } from 'redux'

const initialState = {
  documents: [{title: 'Test'}, {title: 'Test2'}, {title: 'Another test'}],
  staff: [],
  modalType: null,
  modalProps: {},
};

const modalInit = {
  modalType: null,
  modalProps: {},
}
//
// const rootReducer = (state = initialState, action) => {
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case GET_STAFF:
      return { ...state, staff: action.payload };
  //   default:
  //     return state;
  // }
// };
//
// function documentReducer(state = initialState, action) {
  // switch (action.type) {
    case GET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };
//     default:
//       return state;
//   }
// }
//
// function modalReducer(state = initialState, action) {
//   switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modalProps: action.modalProps, modalType: action.modalType}
    case HIDE_MODAL:
      return {...state, modalInit };
    default:
      return state;
  }
}

// const rootReducer = combineReducers({
//   staffReducer,
//   documentReducer,
//   modalReducer,
// });

export default rootReducer;
