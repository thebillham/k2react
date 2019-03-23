import { INIT_CONSTANTS } from "../constants/action-types";

const KeyCodes = {
  comma: 188,
  enter: 13
};

// const cardCols = 8;
const cardCols = 6;
// const cardHeight = 120;
const cardHeight = 180;
const cardVertCols = 8;
const cardVertHeight = 280;

const A4Cols = 6;
const A4Height = 420;

const A5Cols = 4;
const A5Height = 300;

const constInit = {
  qualificationtypes: {
    AsbestosAssessor: {
      name: "Asbestos Assessor",
      number: true,
      expiry: true,
      cols: cardCols,
      cellHeight: cardHeight
    },
    AsbestosAwarenessTraining: {
      name: "Asbestos Awareness Training",
      expiry: true,
      issuer: true,
      cols: A5Cols,
      cellHeight: A5Height
    },
    AsbestosExposureHealthMonitoring: {
      name: "Asbestos Exposure Health Monitoring",
      issuer: true,
      notes: true,
      cols: A4Cols,
      cellHeight: A4Height
    },
    DriverLicence: {
      name: "Driver Licence",
      number: true,
      expiry: true,
      class: true,
      cols: cardCols,
      cellHeight: cardHeight
    },
    FirstAid: {
      name: "First Aid",
      issuer: true,
      expiry: true,
      cols: A5Cols,
      cellHeight: A5Height
    },
    Inductions: {
      name: "Inductions/Company Cards",
      id: true,
      expiry: true,
      issuer: true,
      notes: true,
      cols: cardVertCols,
      cellHeight: cardVertHeight
    },
    IP402: {
      name: "IP402",
      cols: A4Cols,
      cellHeight: A4Height
    },
    MaskFit: {
      name: "Mask Fit Test",
      expiry: true,
      issuer: true,
      cols: A5Cols,
      cellHeight: A5Height
    },
    Membership: {
      name: "Membership",
      expiry: true,
      issuer: true,
      cols: A5Cols,
      cellHeight: A5Height
    },
    NZQAUnitStandard: {
      name: "NZQA Unit Standard",
      expiry: true,
      title: true,
      issuer: true,
      unit: true,
      cols: A5Cols,
      cellHeight: A5Height
    },
    Training: {
      name: "Other",
      title: true,
      id: true,
      issuer: true,
      expiry: true,
      notes: true,
      cols: A4Cols,
      cellHeight: A4Height
    },
    SiteSafeCourse: {
      name: "Site Safe Course",
      id: true,
      expiry: true,
      course: true,
      cols: cardCols,
      cellHeight: cardHeight
    },
    Tertiary: {
      name: "Tertiary Qualification (Highest Level)",
      full: true,
      abbrev: true,
      issuer: true,
      cols: A4Cols,
      cellHeight: A4Height
    },
    TertiaryOther: {
      name: "Tertiary Qualification (Other)",
      full: true,
      abbrev: true,
      issuer: true,
      cols: A4Cols,
      cellHeight: A4Height
    }
  },
  questiontypes: {
    truefalse: {
      name: "True or False",
      truefalse: true,
      image: true
    },
    multisingle: {
      name: "Multi-Choice, Single Answer",
      correct: true,
      incorrect: true,
      numberofoptions: true,
      image: true
    },
    multimulti: {
      name: "Multi-Choice, Multiple Answers",
      correct: true,
      correctmax: true,
      correctmin: true,
      incorrect: true,
      numberofoptions: true
    },
    shortstring: {
      name: "Short Answer",
      answer: true
    },
    sort: {
      name: "Word Sort",
      answers: true
    },
    // sortimage: {
    //   disabled: true,
    //   name: 'Image Sort',
    //   question: true,
    //   correct: true,
    //   incorrect: true,
    //   numberofoptions: true,
    //   tags: true,
    // },
    sortbucket: {
      name: "Bucket Word Sort",
      buckets: true
    }
    // sortbucketimage: {
    //   disabled: true,
    //   name: 'Bucket Image Sort',
    //   question: true,
    //   correct: true,
    //   incorrect: true,
    //   numberofoptions: true,
    //   tags: true,
    // },
    // imagemapsingle: {
    //   disabled: true,
    //   name: 'Image Map, Single Answer',
    //   question: true,
    //   correct: true,
    //   incorrect: true,
    //   numberofoptions: true,
    //   tags: true,
    // },
    // imagemapmulti: {
    //   disabled: true,
    //   name: 'Image Map, Multiple Answers',
    //   question: true,
    //   correct: true,
    //   incorrect: true,
    //   numberofoptions: true,
    //   tags: true,
    // },
    // imageselectsingle: {
    //   disabled: true,
    //   name: 'Image Select, Single Answer',
    //   question: true,
    //   correct: true,
    //   incorrect: true,
    //   numberofoptions: true,
    //   tags: true,
    // },
    // imageselectmulti: {
    //   disabled: true,
    //   name: 'Image Select, Multiple Answers',
    //   optionimages: true,
    //   question: true,
    //   correct: true,
    //   incorrect: true,
    //   numberofoptions: true,
    //   height: true,
    //   width: true,
    //   tags: true,
    // },
  },
  permissions: [
    {
      name: "K2 Staff",
      desc: "Gives the user access to view all K2 samples and jobs."
    },
    {
      name: "Admin",
      desc:
        "Gives the user full access and the ability to edit other users including granting them permissions."
    },
    {
      name: "Asbestos Admin",
      desc:
        "Gives the user the ability to report bulk and air analysis for other users."
    },
    {
      name: "Asbestos Air Analysis",
      desc:
        "Gives the user the ability to add fibre count results to air samples."
    },
    {
      name: "Asbestos Bulk Analysis",
      desc:
        "Gives the user the ability to add analysis results to bulk samples."
    },
    {
      name: "Analysis Checker",
      desc:
        "Gives the user the ability to check off air and bulk analysis results so they can be issued."
    },
    {
      name: "Training Editor",
      desc: "Gives the user the ability to edit and add new training modules."
    },
    {
      name: "Quiz Editor",
      desc:
        "Gives the user the ability to edit and add new questions and quizzes."
    }
  ],
  jobdescriptions: [
    "Administration Manager",
    "Asbestos Administrator",
    "Environmental Scientist",
    "Environmental Technician",
    "Lab Manager",
    "Lab Technician",
    "Managing Director",
    "Occupational Hygienist",
    "Operations Administrator",
    "Operations Manager",
    "Support",
    "Technical Writer"
  ],
  quiztags: [
    { id: "asbestos", text: "General Asbestos" },
    { id: "asbestos-analysis", text: "Asbestos Analysis" },
    { id: "asbestos-legislation", text: "Asbestos Legislation" },
    { id: "asbestos-surveying", text: "Asbestos Surveying" },
    { id: "biological-testing", text: "Biological Testing" },
    { id: "general-biology", text: "General Biology" },
    { id: "general-chemistry", text: "General Chemistry" },
    { id: "construction", text: "General Construction Knowledge" },
    { id: "safety", text: "General Safety" },
    { id: "general-taxonomy", text: "General Taxonomy" },
    { id: "meth-legislation", text: "Meth Legislation" },
    { id: "meth-testing", text: "Meth Testing" }
  ],
  trainingcategories: [
    {
      key: "gen",
      desc: "General"
    },
    {
      key: "stack",
      desc: "Stack"
    },
    {
      key: "air",
      desc: "Air Quality"
    },
    {
      key: "bio",
      desc: "Biological"
    },
    {
      key: "noise",
      desc: "Noise"
    },
    {
      key: "asb",
      desc: "Asbestos"
    },
    {
      key: "meth",
      desc: "Meth"
    },
    {
      key: "other",
      desc: "Other Testing"
    },
    {
      key: "eq",
      desc: "Equipment"
    },
    {
      key: "rep",
      desc: "Reporting"
    },
    {
      key: "admin",
      desc: "Admin"
    },
    {
      key: "software",
      desc: "Software"
    },
    {
      key: "haz",
      desc: "Hazards"
    }
  ],
  toolcategories: [
    {
      key: "gen",
      desc: "General"
    },
    {
      key: "conv",
      desc: "Conversions"
    },
    {
      key: "occ",
      desc: "OCC Health"
    },
    {
      key: "asb",
      desc: "Asbestos"
    },
    {
      key: "admin",
      desc: "Admin"
    }
  ],
  documentcategories: [
    {
      key: "gen",
      desc: "General"
    },
    {
      key: "manuals",
      desc: "Equipment Manuals"
    },
    {
      key: "k2methods",
      desc: "K2 Methods"
    },
    {
      key: "refmethods",
      desc: "Reference Methods"
    },
    {
      key: "legislation",
      desc: "Legislation"
    },
    {
      key: "guidelines",
      desc: "Guidelines"
    },
    {
      key: "cheatsheets",
      desc: "Cheatsheets"
    },
    {
      key: "other",
      desc: "Other"
    }
  ],
  noticecategories: [
    {
      key: "fav",
      desc: "Favourites"
    },
    {
      key: "gen",
      desc: "General"
    },
    {
      key: "leads",
      desc: "Job Leads"
    },
    {
      key: "jqfmeth",
      desc: "Meth Quality Feedback"
    },
    {
      key: "jqfasb",
      desc: "Asbestos Quality Feedback"
    },
    {
      key: "eq",
      desc: "Equipment"
    }
  ],
  offices: ["Auckland", "Christchurch", "Hamilton", "Nelson", "Wellington"],
  officecontacts: [
    {
      name: "Christchurch",
      workphone: "03 384 8966"
    },
    {
      name: "Auckland",
      workphone: "09 275 1261"
    }
  ],
  asbestosmaterials: [
    { label: "asbestos insulation board" },
    { label: "Bakelite" },
    { label: "bitumen" },
    { label: "bitumen pressed metal" },
    { label: "brick" },
    { label: "building paper" },
    { label: "ceiling tile" },
    { label: "cement" },
    { label: "cement sheet" },
    { label: "cement pipe" },
    { label: "ceramic" },
    { label: "corrugated cement sheet" },
    { label: "dust" },
    { label: "dust (tape sampled)" },
    { label: "dust (swab sampled)" },
    { label: "Decramastic tile" },
    { label: "fabric" },
    { label: "fibre cement" },
    { label: "fibreglass" },
    { label: "fibreglass insulation" },
    { label: "Fibrolite" },
    { label: "fibrous plaster" },
    { label: "Galbestos" },
    { label: "insulation" },
    { label: "insulfluff" },
    { label: "insulation board" },
    { label: "jointing compound" },
    { label: "lagging" },
    { label: "laminate" },
    { label: "laminated insulation board" },
    { label: "lath and plaster" },
    { label: "linoleum" },
    { label: "mastic" },
    { label: "metal" },
    { label: "millboard" },
    { label: "mortar" },
    { label: "Polite" },
    { label: "resin" },
    { label: "rope" },
    { label: "softboard" },
    { label: "softboard ceiling tile" },
    { label: "soil" },
    { label: "stucco" },
    { label: "textured plaster" },
    { label: "textured paint" },
    { label: "textured plaster over lath and plaster" },
    { label: "tile grout" },
    { label: "vermiculite" },
    { label: "vinyl" },
    { label: "vinyl tile" },
    { label: "vinyl with paper backing" },
    { label: "wood" },
    { label: "window putty" },
    { label: "Zelemite" }
  ],
  buildingmaterials: [],
  asbestostypes: ["Chrysotile", "Amosite", "Crocidolite"],
  docTagSuggestions: [
    { id: "Meth", text: "Methamphetamine" },
    { id: "Asb", text: "Asbestos" },
    { id: "Stack", text: "Stack" },
    { id: "Bio", text: "Biological" },
    { id: "Noise", text: "Noise" },
    { id: "Analysis", text: "Analysis" },
    { id: "Test Method", text: "Test Method" },
    { id: "Background Reading", text: "Background Reading" },
    { id: "Health and Safety", text: "Health and Safety" },
    { id: "Legislation", text: "Legislation" },
    { id: "Cheat Sheet", text: "Cheat Sheet" }
  ],
  tagDelimiters: [KeyCodes.comma, KeyCodes.enter]
};

// Properties related to constants such as word lists
export default function constReducer(state = constInit, action) {
  switch (action.type) {
    case INIT_CONSTANTS:
      return action.payload;
    default:
      return state;
  }
}
