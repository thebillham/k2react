import {

        } from "../constants/action-types"

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const constInit = {
  qualificationtypes: {
    AsbestosAssessor: {
      name: 'Asbestos Assessor',
      number: true,
      expiry: true,
    },
    AsbestosAwarenessTraining: {
      name: 'Asbestos Awareness Training',
      expiry: true,
      issuer: true,
    },
    AsbestosExposureHealthMonitoring: {
      name: 'Asbestos Exposure Health Monitoring',
      issuer: true,
      notes: true,
    },
    DriverLicence: {
      name: 'Driver Licence',
      number: true,
      expiry: true,
      class: true,
    },
    EWP: {
      name: 'EWP',
      number: true,
      expiry: true,
      issuer: true,
    },
    Inductions: {
      name: 'Inductions/Company Cards',
      id: true,
      expiry: true,
      issuer: true,
      notes: true,
    },
    IP402: {
      name: 'IP402',
    },
    MaskFit: {
      name: 'Mask Fit Test',
      expiry: true,
      issuer: true,
    },
    NZQAUnitStandard: {
      name: 'NZQA Unit Standard',
      expiry: true,
      title: true,
      issuer: true,
      unit: true,
    },
    SiteSafeCourse: {
      name: 'Site Safe Course',
      id: true,
      expiry: true,
      course: true,
    },
    Tertiary: {
      name: 'Tertiary Qualification (Highest Level)',
      full: true,
      abbrev: true,
      issuer: true,
    },
    TertiaryOther: {
      name: 'Tertiary Qualification (Other)',
      full: true,
      issuer: true,
    },
  },
  permissions: [
    {
      name: 'K2 Staff',
      desc: 'Gives the user access to view all K2 samples and jobs.'
    },
    {
      name: 'Admin',
      desc: 'Gives the user full access and the ability to edit other users including granting them permissions.'
    },
    {
      name: 'Asbestos Air Analysis',
      desc: 'Gives the user the ability to add fibre count results to air samples.'
    },
    {
      name: 'Asbestos Bulk Analysis',
      desc: 'Gives the user the ability to add analysis results to bulk samples.',
    },
    {
      name: 'Analysis Checker',
      desc: 'Gives the user the ability to check off air and bulk analysis results so they can be issued.',
    },
  ],
  jobdescriptions: [
    'Administration Manager',
    'Asbestos Administrator',
    'Environmental Scientist',
    'Environmental Technician',
    'Lab Manager',
    'Lab Technician',
    'Managing Director',
    'Occupational Hygienist',
    'Operations Administrator',
    'Operations Manager',
    'Technical Writer',
  ],
  quiztags: [
    'asbestos',
    'meth',
    'asbestos-analysis',
    'chemistry',
    'biology',
    'asbestos-surveying',
    'construction',
    'legislation',
    'asbestos-materials',
    'asbestos-analysis',
    'asbestos-sampling',
    'asbestos-contamination',
  ],
  trainingcategories: [
    {
      key: 'gen',
      desc: 'General'
    },
    {
      key: 'stack',
      desc: 'Stack'
    },
    {
      key: 'air',
      desc: 'Air Quality'
    },
    {
      key: 'bio',
      desc: 'Biological'
    },
    {
      key: 'noise',
      desc: 'Noise'
    },
    {
      key: 'asb',
      desc: 'Asbestos'
    },
    {
      key: 'meth',
      desc: 'Meth'
    },
    {
      key: 'other',
      desc: 'Other Testing'
    },
    {
      key: 'eq',
      desc: 'Equipment'
    },
    {
      key: 'rep',
      desc: 'Reporting'
    },
    {
      key: 'admin',
      desc: 'Admin'
    },
    {
      key: 'software',
      desc: 'Software'
    },
    {
      key: 'haz',
      desc: 'Hazards'
    },
  ],
  toolcategories: [
    {
      key: 'gen',
      desc: 'General'
    },
    {
      key: 'conv',
      desc: 'Conversions'
    },
    {
      key: 'occ',
      desc: 'OCC Health'
    },
    {
      key: 'asb',
      desc: 'Asbestos'
    },
    {
      key: 'admin',
      desc: 'Admin'
    },
  ],
  documentcategories: [
    {
      key: 'gen',
      desc: 'General',
    },
    {
      key: 'manuals',
      desc: 'Equipment Manuals',
    },
    {
      key: 'k2methods',
      desc: 'K2 Methods',
    },
    {
      key: 'refmethods',
      desc: 'Reference Methods',
    },
    {
      key: 'legislation',
      desc: 'Legislation',
    },
    {
      key: 'guidelines',
      desc: 'Guidelines',
    },
    {
      key: 'cheatsheets',
      desc: 'Cheatsheets',
    },
    {
      key: 'other',
      desc: 'Other',
    },
  ],
  noticecategories: [
    {
      key: 'fav',
      desc: 'Favourites'
    },
    {
      key: 'gen',
      desc: 'General'
    },
    {
      key: 'leads',
      desc: 'Job Leads'
    },
    {
      key: 'jqfmeth',
      desc: 'Meth Quality Feedback'
    },
    {
      key: 'jqfasb',
      desc: 'Asbestos Quality Feedback'
    },
    {
      key: 'eq',
      desc: 'Equipment'
    },
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
