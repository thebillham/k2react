import {
  APP_HAS_LOADED,
  ASBESTOS_SAMPLE_DISPLAY_MODE,
  ASBESTOS_LAB_EXPANDED,
  RESET_DISPLAY,
  TAB_STAFF,
  TAB_MY_DETAILS,
  FILTER_STAFF,
  FILTER_MAP,
  FILTER_MAP_RESET,
} from "../constants/action-types";

const filterStaff = {
  officeFilters: {},
  officeFilterOn: false,
  attrFilters: {},
  attrFilterOn: false,
  authFilters: {},
  authFilterOn: false,
  attrFilters: {},
  attrFilterOn: false,
  docview: "none",
};

const filterMap = {
  filterViewCompleted: false,
  filterJobLead: '',
  filterOnJobLead: false,
  filterCategory: '',
  filterOnCategory: false,
  filterState: '',
  filterOnState: false,

  filterK2Jobs: false,

  filterCreatedInTheLast: false,
  createdInTheLast: 7,
  filterCompletedInTheLast: false,
  completedInTheLast: 7,
  filterUpdatedInTheLast: false,
  updatedInTheLast: 7,
  filterActionsOverdueBy: false,
  actionsOverdueBy: 7,
}

const displayInit = {
  asbestosSampleDisplayAdvanced: false,
  initialLoading: true,
  tabStaff: 0,
  tabMyDetails: 0,
  filterStaff: filterStaff,
  filterMap: filterMap,
  asbestosLabExpanded: null,
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
    case ASBESTOS_SAMPLE_DISPLAY_MODE:
      return {
        ...state,
        asbestosSampleDisplayAdvanced: !state.asbestosSampleDisplayAdvanced
      }
    case ASBESTOS_LAB_EXPANDED:
      return {
        ...state,
        asbestosLabExpanded: action.payload,
      }
    case TAB_STAFF:
      return {
        ...state,
        tabStaff: action.payload,
      }
    case TAB_MY_DETAILS:
      return {
        ...state,
        tabMyDetails: action.payload,
      }
    case FILTER_STAFF:
      return {
        ...state,
        filterStaff: action.payload,
      }
    case FILTER_MAP:
      return {
        ...state,
        filterMap: action.payload,
      }
    case FILTER_MAP_RESET:
      return {
        ...state,
        filterMap: filterMap,
      }
    default:
      return state;
  }
}
