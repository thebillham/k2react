import { quizzesRef, questionsRef } from '../../config/firebase';

const biobackgroundreadings0001 = {
  question: 'Select the major group(s) of micro-organism(s) from the list below.',
  correct: ['Algae','Fungi','Viruses','Protozoa','Bacteria',],
  incorrect: ['Plankton','Hymenoptera','Linnaeus','Pollen','Aquificae',],
  numberofoptions: 5,
  correctmax: 3,
  correctmin: 3,
  tags: ['biological','taxonomy',],
  type: 'multi-multi',
}

const biobackgroundreadings0002 = {
  question: 'What do (most) fungi need to grow?',
  correct: ['Air','Food','Water','Warmth',],
  incorrect: ['Sunlight','Darkness','A supportive home with two parents',],
  numberofoptions: 4,
  correctmax: 2,
  correctmin: 2,
  tags: ['biological',],
  type: 'multi-multi',
}

const biobackgroundreadings0003 = {
  question: 'All mould is toxic.',
  correct: ['False'],
  incorrect: ['True'],
  numberofoptions: 2,
  tags: ['biological',],
  type: 'multi-single',
}

const biobackgroundreadings0004 = {
  question: 'Select all beneficial uses of fungi.',
  correct: ['Poisoning your enemies','Making beer','Anti-biotics','Cancer treatment','Bio Control','Laundry detergent','Cheese','Soy Sauce','Bread','Decomposition of organic matter','Waste management','Wine','Tempeh','Plant growth','Fire restoration','Soil production','Plant communication','Building materials','Tattooing',],
  incorrect: [],
  numberofoptions: 5,
  correctmin: 5,
  tags: ['biological',],
  type: 'multi-multi',
}

const biobackgroundreadings0005 = {
  question: 'Roughly how many sexes of fungi are there?',
  correct: ['36,000'],
  incorrect: ['One','Two','Four','100','54,000'],
  numberofoptions: 4,
  tags: ['biological',],
  type: 'multi-single',
}

const biobackgroundreadings0006 = {
  question: 'All fungi are moulds.',
  correct: ['False',],
  incorrect: ['True',],
  numberofoptions: 2,
  tags: ['biological',],
  type: 'multi-single',
}

const biobackgroundreadings0007 = {
  question: 'Place the taxonomic ranks in the correct order.',
  answers: [
    'Domain',
    'Kingdom',
    'Phylum',
    'Class',
    'Order',
    'Family',
    'Genus',
    'Species',
  ],
  tags: ['biological','taxonomy',],
  type: 'sort',
}

const biobackgroundreadings0008 = {
  question: 'What are the five most common genera of mould?',
  correct: [
    'Cladosporium',
    'Penicillium',
    'Aspergillus',
    'Alternaria',
    'Trichoderma',
  ],
  incorrect: [
    'Cercopithicus',
    'Stachybotrys',
    'Acremonium',
    'Epicoccum',
    'Candida',
    'Ittibitium',
    'Parastratiosphecomyia',
  ],
  numberofoptions: 8,
  correctmax: 5,
  correctmin: 5,
  tags: ['biological',],
  type: 'multi-multi',
}

const bioglossary0001 = {
  question: 'What two words have been banned from biological reports?',
  answer: '^(?=.*\\bimmunocompromised\\b)(?=.*\\bcarcinogenic\\b).*$',
  tags: ['biological','glossary',],
  selected: '',
  type: 'short-string',
}

const bioglossary0002 = {
  question: 'Match the following terms to their meaning.',
  sortedanswers: [
    'Fungus',
    'Fungi',
    'Fungal',
    'Mould',
    'Bacteria',
    'Efflorescence',
    'Hyphal Fragments',
    'Deteriogenic',
    'Pathogenic',
    'Toxigenic',
    'Allergenic',
    'Non-viable',
    'Viable',
  ],
  matchedanswers: [
    'Living organisms that have cell walls which contain chitin (not cellulose like plants) which feed on organic matter (but do not ingest it like animals and protozoa). Unlike bacteria their DNA is enclosed in a nucleus.',
    'Plural form of fungus',
    'Caused by a fungus or fungi',
    'Fungi that grow in multicellular hyphae structures, this is not a taxonomic classification rather a structural one – this means that some fungi can be moulds at some life stages and mushrooms at others',
    'Single celled organisms which have a cell wall but lack organelles (fancy inside stuff) including a nucleus',
    'A salt crust that forms on inorganic building materials (concrete, brick etc) when water draws up through it. Often confused with mould.',
    'Thread like structure produced by fungi. These are the main growth stage so if they present the growth is active. They can also be inserted into other cells to feed off them or joined together for sex times',
    'Causes decay',
    'Causes disease. This is usually used for moulds that grow in or on you.',
    'Produces toxins which cause negative health effects including difficulty breathing and damage to internal organs.',
    'Commonly causes an allergic reaction',
    'Not capable of living.',
    'Capable of living',
  ],
  tags: ['biological','glossary',],
  type: 'matched',
}

const biomoistureinhomes0001 = {
  question: 'Mould is a water problem.',
  correct: ['True'],
  incorrect: ['False'],
  numberofoptions: 2,
  tags: ['biological','moisture in homes'],
  type: 'multi-single',
}

const biomoistureinhomes0002 = {
  question: 'On a rainy day, is indoor or outdoor air drier?',
  correct: ['Outdoor'],
  incorrect: ['Indoor'],
  numberofoptions: 2,
  tags: ['biological','moisture in homes'],
  type: 'multi-single',
}

const biomoistureinhomes0003 = {
  question: 'What should you always inspect on the exterior of all houses during a biological assessment?',
  answer: '\\b(gutters|gutter|roof|roofs)\\b',
  tags: ['biological','moisture in homes'],
  selected: '',
  type: 'short-string',
}

const biomoistureinhomes0004 = {
  question: 'Where should extraction vents vent to?',
  answer: '\\b(outside|outdoors)\\b',
  tags: ['biological','moisture in homes'],
  selected: '',
  type: 'short-string',
}

const biomoistureinhomes0005 = {
  question: 'What is the minimum number of windows you should open to ventilate your home?',
  answer: '\\b(2|two)\\b',
  tags: ['biological','moisture in homes'],
  selected: '',
  type: 'short-string',
}

const biomoistureinhomes0006 = {
  question: 'What forms when warm air hits a cold surface?',
  answer: '\\bcondensation\\b',
  tags: ['biological','moisture in homes'],
  selected: '',
  type: 'short-string',
}

const biomoistureinhomes0007 = {
  question: 'What action(s) should you not do if you want to avoid mould growth in your home?',
  correct: [
    'Use an unflued gas heater',
    'Put mattresses on the floor',
    'Dry clothes inside',
  ],
  incorrect: [
    'Move away from Dunedin',
    'Put lids on boiling pots',
    'Open your windows daily',
    'Wipe down condensation on windows',
    'Heat your home',
    'Fix all leaks promptly',
    'Clear your gutters regularly',
    'Clean your home regularly',
    'Do a little dance',
  ],
  numberofoptions: 6,
  tags: ['biological','moisture in homes'],
  type: 'multi-multi',
}

const biopresentation0001 = {
  question: 'Which types of people are considered part of the vulnerable group?',
  correct: [
    'Pregnant',
    'Children',
    'Elderly',
    'Compromised Immune System',
    'Asthma',
    'Hay fever',
    'Respiratory Illness',
    'Specific fungal allergies',
    'Brain injury',
  ],
  incorrect: [
    'Red Heads',
    'Cry Babies',
    'Men',
    'Overweight',
    'Amputees',
    'Athletes',
  ],
  numberofoptions: 5,
  tags: ['biological','presentation',],
  type: 'multi-multi',
}

const biopresentation0002 = {
  question: 'Match the mould to its photo.',
  sortedanswers: [
    'Cladosporium',
    'Penicillium',
    'Aspergillus',
    'Ulocladium',
    'Basidiomycetes',
    'Chaetomium',
    'Stachybotrys',
  ],
  matchedanswers: [

  ],
  numberofoptions: 4,
  tags: ['biological','presentation',],
  type: 'matched-image',
}

const biopresentation0003 = {
  question: 'Sort the symptoms into the correct categories',
  buckets: [
    {
      label: 'Common fungi symptoms',
      answers: [
        'Nasal and sinus congestion',
        'Runny nose',
        'Wheezing',
        'Difficulty breathing',
        'Chest tightness',
        'Cough',
        'Throat irritation',
        'Sneezing fits',
        'Hypersensitivity',
      ],
    },
    {
      label: 'Toxic fungi symptoms',
      answers: [
        'Death',
        'Cancer',
        'Chronic inflammation',
        'Migraine',
        'Increased risk of infection',
        'Toxin vulnerability',
        'Ergotism',
        'Fatigue',
        'Weakness',
        'Vertigo',
        'Memory loss',
        'Appetite swings',
        'Mood Swings',
        'Metallic taste in mouth',
        'Tingling and numbness',
        'Difficulty concentrating',
        'Morning Stiffness',
      ],
    },
    {
      label: 'Pathogenic fungi symptoms',
      answers: [
        'Itchy, stinging or burning skin',
        'Fever',
        'Cottage cheese discharge',
        'Brain Abscess',
        'Stomach pain',
        'Meningitis',
        'Ringworm',
        'Diaper Rash',
        'Coughing up blood',
        'Scaly Rash',
        'Moist, raw skin',
        'Blisters that itch',
        'Pneumonia',
      ],
    },
  ],
  tags: ['biological','presentation',],
  type: 'sort-bucket',
}

const biopresentation0004 = {
  question: 'Dwayne and Stewart got to site to do a walkthrough of a potentially mould infested property for a client.  The next day they are both off sick with migraines.  What did Dwayne and Stewart most likely do wrong?',
  correct: ['Not wear correct PPE'],
  incorrect: [
    'Go out for a drink after',
    'Not drink enough water',
    'Worked too hard',
    'Licked the lead paint on the window sills',
    'Stay up too late playing games',
    'Get nagged at by the annoying client',
    'Co-ordinated a sickie to go hang at the beach',
    'Be weak',
    'Lifted with their back not their knees',
  ],
  numberofoptions: 5,
  tags: ['biological','presentation',],
  type: 'multi-single',
}

const biopresentation0005 = {
  question: 'What do we look for/at in biological assessments?',
  correct: [
    'Ventilation',
    'Extraction',
    'Cupboard under the sink',
    'Wet soil in the sub-floor space',
    'Insulation',
    'Suspected ACM',
    'Efflorescence',
    'Liquefaction',
    'Clothes drying inside',
    'Mattresses on the floor',
    'Pooling Water',
    'Roof Space',
    'Leaks in the Hot Water Cupboard',
    'Indoor plants',
    'Backs of curtains',
    'Behind stand-alone wardrobe',
    'Gutters',
    'Nearby trees and vegetation',
  ],
  incorrect: [
    'Peoples mail',
    'Underwear Drawer',
    'Jewellery Box',
    'Medicine Cabinet',
  ],
  numberofoptions: 8,
  tags: ['biological','presentation',],
  type: 'multi-multi',
}

const biobackgroundreadings = {
  title: 'Biological Background Readings Quiz',
  category: 'bio',
  desc: 'Review of required backgrounds readings.',
  numberofquestions: 8,
  required: [],
  optional: [
    'bio-backgroundreadings0001',
    'bio-backgroundreadings0002',
    'bio-backgroundreadings0003',
    'bio-backgroundreadings0004',
    'bio-backgroundreadings0005',
    'bio-backgroundreadings0006',
    'bio-backgroundreadings0007',
    'bio-backgroundreadings0008',
    'bio-glossary0001',
    'bio-moistureinhomes0001',
    'bio-moistureinhomes0002',
    'bio-moistureinhomes0003',
    'bio-moistureinhomes0004',
    'bio-moistureinhomes0005',
    'bio-moistureinhomes0006',
    'bio-moistureinhomes0007',
    'bio-presentation0001',
    'bio-presentation0003',
    'bio-presentation0004',
    'bio-presentation0005',
  ],
}

function QuestionsToFirebase(props) {
  quizzesRef.doc('bio-backgroundreadings').set(biobackgroundreadings);
  questionsRef.doc('bio-backgroundreadings0001').set(biobackgroundreadings0001);
  questionsRef.doc('bio-backgroundreadings0002').set(biobackgroundreadings0002);
  questionsRef.doc('bio-backgroundreadings0003').set(biobackgroundreadings0003);
  questionsRef.doc('bio-backgroundreadings0004').set(biobackgroundreadings0004);
  questionsRef.doc('bio-backgroundreadings0005').set(biobackgroundreadings0005);
  questionsRef.doc('bio-backgroundreadings0006').set(biobackgroundreadings0006);
  questionsRef.doc('bio-backgroundreadings0007').set(biobackgroundreadings0007);
  questionsRef.doc('bio-backgroundreadings0008').set(biobackgroundreadings0008);
  questionsRef.doc('bio-glossary0001').set(bioglossary0001);
  questionsRef.doc('bio-moistureinhomes0001').set(biomoistureinhomes0001);
  questionsRef.doc('bio-moistureinhomes0002').set(biomoistureinhomes0002);
  questionsRef.doc('bio-moistureinhomes0003').set(biomoistureinhomes0003);
  questionsRef.doc('bio-moistureinhomes0004').set(biomoistureinhomes0004);
  questionsRef.doc('bio-moistureinhomes0005').set(biomoistureinhomes0005);
  questionsRef.doc('bio-moistureinhomes0006').set(biomoistureinhomes0006);
  questionsRef.doc('bio-moistureinhomes0007').set(biomoistureinhomes0007);
  questionsRef.doc('bio-presentation0001').set(biopresentation0001);
  questionsRef.doc('bio-presentation0003').set(biopresentation0003);
  questionsRef.doc('bio-presentation0004').set(biopresentation0004);
  questionsRef.doc('bio-presentation0005').set(biopresentation0005);
}

export default QuestionsToFirebase;
