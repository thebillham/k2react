import {

        } from "../constants/action-types"

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const constInit = {
  jobdescriptions: [
    'Environmental Scientist',
    'Environmental Technician',
    'Lab Technician',
    'Technical Writer',
    'Managing Director',
    'Operations Manager',
  ],
  offices: [
    'Auckland',
    'Christchurch',
    'Hamilton',
    'Nelson',
    'Wellington',
  ],
  asbestosmaterials: [],
  buildingmaterials: [],
  asbestostypes: ['Chrysotile', 'Amosite', 'Crocidolite'],
  docTagSuggestions: [
    { id: 'Meth', text: 'Methamphetamine' },
    { id: 'Asb', text: 'Asbestos' },
    { id: 'Stack', text: 'Stack' },
    { id: 'Bio', text: 'Biological' },
    { id: 'Noise', text: 'Noise' },
    { id: 'Analysis', text: 'Analysis' },
    { id: 'Test Method', text: 'Test Method' },
    { id: 'Background Reading', text: 'Background Reading' },
    { id: 'Health and Safety', text: 'Health and Safety' },
    { id: 'Legislation', text: 'Legislation' },
    { id: 'Cheat Sheet', text: 'Cheat Sheet' },
  ],
  tagDelimiters: [KeyCodes.comma, KeyCodes.enter],
}

// Properties related to constants such as word lists
export default function constReducer(state = constInit, action){
  switch (action.type) {
    default:
      return state;
  }
}
