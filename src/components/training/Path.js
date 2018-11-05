import React from 'react';
import { trainingPathsRef, methodsRef } from '../../config/firebase';

const bio = {
  img: 'https://www.k2.co.nz/wp-content/uploads/bb-plugin/cache/moisture-926141-1024x690-landscape.jpg',
  title: 'Biological Testing',
  subtitle: 'Training on methods of biological sampling and writing biological reports.',
  steps: [
    {
      label: 'Outline',
      rows: [
        {
          key: 'outline1',
          left: [
            {
              title: 'Training Outline',
              text: '<p>By the end of this module you will be able to complete non-viable biological sampling.</p>This covers: <ul><li>A basic understanding of principles behind biological sampling</li><li>How to conduct a biological site visit</li><li>Use of relevant equipment</li><ul><li>Buck Bioslide</li><li>Quicktake</li><li>Surface Samplers</li><li>Moisture Meters</li></ul><li>Writing a basic biological report</li></ul><p>If at any time you need assistance with the content in this module please speak to a trained biological testing team member.</p>',
            },
          ],
          right: [
            {
              title: 'Training Staff',
              text: '<b>Trainers</b><br/><a href="../../staff/details/HP8g8wmSQH9uYjdy5D8D">Jess Newcombe</a></br /><a href="../../staff/details/koRSGnzyz4dxfhvXjQklU8CzENG3">Kelly Hutchinson</a><br /><br /><b>KTP</b><br /><a href="../../staff/details/HP8g8wmSQH9uYjdy5D8D">Jess Newcombe</a>'
            },
          ],
        },
      ],
    },
    {
      required: {
        readinglog: ['MCJBqoQDCVeIkXEiJfaI', 'rTGXzhGLKMKSVfhmvuJp', 'RUTKYuEpyDw8sFC9zUF5', 'rgib8pstBVQIRT4o49DA', ],
        quizlog: ['bio-stage1'],
      },
      label: 'Background Reading',
      rows: [
        {
          key: 'bg1',
          left: [
            {
              title: 'Stage 1: Background Reading',
              text: '<p>This stage covers the background knowledge required to understand biological sampling.</p><p>By the end of this stage you should understand:<ul><li>Basic micro-biology – what is mould? And how dangerous is it?</li><li>What causes microbial growth in homes and businesses</li><li>Common sources of unwanted moisture in homes</li><li>Remediation strategies – what can be done?</li></p>',
            },
          ],
          right: [
            {
              type: 'progress',
              title: 'Stage Progress',
              text: 'You have completed 3 of 5 required readings. You have completed one supplementary reading.',
            },
          ],
        },
        {
          key: 'bg2',
          left: [
            {
              title: 'Background Readings',
              text: 'Prior to undertaking biological sampling, you must have read the following documents:',
              links: [
                {
                  type: 'reading',
                  title: 'Moisture in Homes',
                  text: 'Covers common sources of moisture in homes.',
                  link: 'MCJBqoQDCVeIkXEiJfaI',
                  required: true,
                },
                {
                  type: 'reading',
                  title: 'Bio Review',
                  text: 'A basic summary of the biological principles behind sampling.',
                  link: 'rTGXzhGLKMKSVfhmvuJp',
                  required: true,
                },
                {
                  type: 'reading',
                  title: 'Mould Presentation',
                  text: 'Examples of different common fungi you might encounter on a job.',
                  link: 'RUTKYuEpyDw8sFC9zUF5',
                  required: true,
                },
                {
                  type: 'reading',
                  title: 'Effect of Toxic Black Mould (Video)',
                  text: 'Skin infection due to Strachybotrys exposure.',
                  link: 'rgib8pstBVQIRT4o49DA',
                  required: true,
                },
                {
                  type: 'quiz',
                  title: 'Biological Background Readings',
                  link: 'bio-stage1',
                  required: true,
                },
              ],
            },
          ],
          right: [
            {
              title: 'Supplementary Readings',
              text: 'Additional readings are below, it is not required that you have read these prior to testing:',
              links: [
                {
                  type: 'reading',
                  title: 'Moisture in Homes',
                  text: 'Covers common sources of moisture in homes.',
                  link: 'MCJBqoQDCVeIkXEiJfaI',
                },
                {
                  type: 'reading',
                  title: 'Bio Review',
                  text: 'A basic summary of the biological principles behind sampling.',
                  link: '/',
                },
                {
                  type: 'reading',
                  title: 'Glossary',
                  text: 'Glossary of Biological Terms.',
                  link: '/',
                },
                {
                  type: 'reading',
                  title: 'Mould Presentation',
                  text: 'Examples of different common fungi you might encounter on a job.',
                  link: '/',
                },
                {
                  type: 'reading',
                  title: 'Effect of Toxic Black Mould (Video)',
                  text: 'Skin infection due to Strachybotrys exposure.',
                  link: '/',
                },
              ],
            }

          ],
        },
      ],
    },
    {
      label: 'Practical Training',
      required: {
        readinglog: ['4.21-17-biological-part1', '4.21-17-biological-part2', '4.21-17-biological-part3', '4.21-17-biological-part4', '4.21-17-biological-part5',],
        quizlog: ['bio-stage1'],
      },
      rows: [
        {
          key: 'prac1',
          left: [
            {
              title: 'Stage 2: Practical',
              text: '<p>This stage covers the practical aspects of biological sampling.</p><p>By the end of this stage you should understand:<ul><li>How to use the following biological sampling equipment:<ul><li>Buck Bioslide</li><li>Quicktake</li><li>Surface Samplers</li><li>Moisture Meters</li></ul></li><li>The required information to gather during a biological site investigation</li><li>Sending your samples for analysis</li><li>How to report your findings</li></p>'
            },
          ],
          right: [
            {
              type: 'progress',
              title: 'Stage Progress',
              text: 'You have read 2 of 5 methods. You have an average quiz score of 72%',
            },
          ],
        },
        {
          key: 'prac2',
          left: [
            {
              title: 'Required Methods',
              text: 'The following methods must be read before starting in-house training. A short quiz follows each one to assess comprehension.',
              links: [
                {
                  type: 'method',
                  title: 'Biological Sampling Part 1',
                  text: 'Overview of Methods',
                  link: '4.21-17-biological-part1',
                  quiz: 'bio-stage1',
                  required: true,
                },
                {
                  type: 'method',
                  title: 'Biological Sampling Part 2',
                  text: 'Allergenoco and SAS Sampler',
                  link: '4.21-17-biological-part2',
                  quiz: 'bio-stage1',
                  required: true,
                },
                {
                  type: 'method',
                  title: 'Biological Sampling Part 3',
                  text: 'Other Sampling Methods',
                  link: '4.21-17-biological-part3',
                  quiz: 'bio-stage1',
                  required: true,
                },
                {
                  type: 'method',
                  title: 'Biological Sampling Part 4',
                  text: 'Background Information',
                  link: '4.21-17-biological-part4',
                  quiz: 'bio-stage1',
                  required: true,
                },
                {
                  type: 'method',
                  title: 'Biological Sampling Part 5',
                  text: 'Bioslide Sampler',
                  link: '4.21-17-biological-part5',
                  quiz: 'bio-stage1',
                  required: true,
                },
              ],
            },
          ],
          right: [
            {
              title: 'Additional Training',
              text: '<p>The following methods detail less common sampling techniques and procedures.</p>',
              links: [
                {
                  type: 'method',
                  title: 'Bio-Aerosols',
                  text: '',
                  link: '/',
                  quiz: 'bio-stage1',
                },
                {
                  type: 'method',
                  title: 'Viable Sampling',
                  text: '',
                  link: '/',
                  quiz: 'bio-stage1',
                },
                {
                  type: 'method',
                  title: 'Core Sampling',
                  text: '',
                  link: '/',
                  quiz: 'bio-stage1',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: 'In-House Training',
      rows: [
        {
          key: 'in1',
          left: [
            {
              title: 'Stage 3: In-House Training',
              text: '<p>In this stage you will undertake a mock biological assessment through to completion.</p><p>By the end of this stage you should understand:<ul><li>Creating a biological job in Work Flow Max</li><li>Determining what equipment and documentation you require</li><li>Where and how to send away samples</li><li>How to interpret biological results</li>Writing basic biological reports</li></ul></p>',
            },
          ],
          right: [
            {
              type: 'progress',
              title: 'Stage Progress',
              text: 'You have been signed off on 13 of 24 tasks.',
            },
          ],
        },
      ],
    },
    {
      label: 'Supervised Site Visits',
      rows: [
        {
          key: 'sup1',
          left: [
            {
              title: 'Stage 4: Supervised Site Visits',
              text: '<p>In this stage you will conduct supervised visits on sites. These will be assessed by a trained site technician.</p>',
            },
          ],
          right: [
            {
              type: 'progress',
              title: 'Stage Progress',
              text: 'You have completed 3 of 4 site visits competently.',
            },
          ],
        },
      ],
    },
    {
      label: 'Review and Sign-Off',
      summaryPage: true,
      rows: [
        {
          key: 'rev1',
          left: [
            {
              title: 'Biological Testing Training summary',
              text: 'This page will display a summary of all trainings completed, quiz scores, etc.',
            },
          ],
        }
      ],
    },
  ],
}

const methodbio1 = {
  updateDate: '',
  title: 'Biological Sampling Part 1',
  subtitle: 'Overview of Methods',
  preparedBy: '',
  checkedBy: '',
  documentController: '',
  tmCode: 'TM 4.21-17 Part 1',
  version: '4.1',
  changes: [
    {
      version: '4.0',
      changes: 'Document created.',
      person: 'Stuart Keer-Keer',
      date: '',
    },
    {
      version: '4.1',
      changes: 'Added method update table.<br />Minor grammatical changes.<br />Genus and species changed to italics.',
      person: 'Max Gallagher',
      date: '',
    },
  ],
  sections: [
    {
      title: 'Summary',
      text: 'Mould assessments require use of numerous assessment tools to determine if there is a risk to health. This method details the tools.',
      sections: [
        {
          title: 'Important Note',
          text: 'Air sampling for mould spores and bacteria is highly variable and on its own not defendable.  You must use all the tools detailed in this method when doing a biological assessment.',
        },
        {
          title: 'Reading',
          text: '<p>Refer to the reading list at the end of this procedure.  This will empower you with a bucket load of knowledge to do the work better.</p><p> “Bacteria and Fungus Sampling Guide” An understanding of the different types of bacteria and fungus will ensure the correct sample method is being used.</p>',
        },
        {
          title: 'Site Assessment Tools',
          text: '<p>Biological assessments are done by considering all information from a site. This includes:</p><ul><li><b>Odour</b> – note the character, intensity and location of any odour. This is often an indication of active growth.</li><li><b>Listen</b> – talk to people on site, often gives good insights as to what has occurred.</li><li><b>Observe</b> – look for areas of active growth, note the size and nature of it.</li><li><b>Moisture determination</b> – mould and often bacteriological contaminations are more often a result of water leaks.  Measure the moisture content.</li><li><b>Humidity</b> – high humidity will result in mould growth.</li><li><b>Photograph</b> – record any growth for the report</li></ul>',
        },
        {
          title: 'Site Assessment Sampling Tools',
          text: '<ul></ul>'
        },
      ],
    },
    {
      title: 'Viable - Living Air Sampling',
      sections: [
        {
          title: 'Viable Sampling Equipment',
          text: '<p>The ideal sample volume for viable samples is 1000 L. If it is a particularly contaminated site then a lower volume can be used, as low as 300L. Samples can be gathered by two methods. These are a </p><ul><li>Portable Air Ideal Sampler</li><li>Occupational Health Pump and Cassette</li></ul><p>If a portable air ideal sampler is to be used then it needs to be hired from the lab. Sampling is conducted by drawing a known quantity of sample air over a specially treated agar plate. Two different agar plates are used per site, one plate specific to bacteria and one plate specific to fungi.</p><p>After sampling is completed each treated dish is sealed air tight to prevent any contamination during transport.</p>',
        },
        {
          type: 'table',
          title: 'Types of Viable Air Sampler',
          header: ['Type','Sampler','Application'],
          rows: [
            {
              cols: [
                'Nutrient Plate',
                'Air Ideal',
                '<p>Low levels of biological growth</p><p>Counts of yeast, bacteria and fungus</p>',
              ],
            },
            {
              cols: [
                'Nutrient Plate',
                'Air Ideal',
                '<p>Low levels of biological growth</p><p>Break down of samples</p>',
              ],
            },
            {
              cols: [
                'Nutrient Plate',
                'Air Ideal',
                '<p>High levels of biological growth</p><p>Break down of samples</p><p>Compost plant, recycling plant</p>',
              ],
            },
            {
              cols: [
                'Gelatine on a Filter',
                'SKC sample pump',
                '<p>Low levels of biological growth</p><p>No break down e.g. compressed air</p>',
              ],
            },
            {
              cols: [
                'Gelatine on a Filter',
                'SKC sample pump',
                '<p>High levels of biological growth</p><p>Break down given</p>',
              ],
            },
          ],
        },
        {
          title: 'Gelatine on a Filter',
          text: 'Can sample at 3 L/min maximum.  If you sample faster you will destroy the gelatine on the filter. Samples must be at the lab within 24 hours from time of sampling.',
        },
        {
          title: 'Sample Volume',
          text: 'Compressed air at least 1000 L of air needs to be sampled.  At 3 L/min that is at least 5.5 hours.  The air ideal that can be rented from Biodet samples at 100 L/min, this would take 10 minutes per sample.',
        },
        {
          title: 'Sample Stability',
          text: 'You need to protect the media from drying out. Take the following actions.<ul><li>Keep samples chilled in a sealed container</li><li>Ensure samples are at the lab in under 24 hours from sampling.</li></ul>',
        },
        {
          title: 'Compressed Gas Testing',
          text: 'If you are using the air ideal in compressed gas testing. Using a bucket or manifold you need to ensure that there is no back pressure on the sampler. If there is it will shut down.',
        },
      ],
    },
    {
      title: 'Non-Viable Sampling Equipment',
      text: 'The ideal sample volume for non viable samples is 150 L. There are three options for gathering samples, these are:<ul><li>Allegenco sampler - with microscopic slides</li><li>Quicktake Pump and Cassette (This Lives in the Auckland Office)</li><li>Buck Bioslide and pre-prepared slides (This lives in the Christchurch Office)</li></ul>If the Allegenco sampler is to be used then it needs to be hired from the (Biodet) laboratory.',
    },
    {
      title: 'Physical Swabs',
      text: 'Physical swabs are taken in areas of visible fungal growth, or on surfaces such as fan blades or air ventilation system tubing.  Physical swabs can be used for identification of any other contaminating species.',
      sections: [
        {
          title: 'Sellotape© Samples',
          text: 'A non-culturable way to “swab” a surface. This lifts off the moulds present on a surface, which are then analysed under a microscope and identified.',
        },
        {
          title: 'Culturable Swap Samples',
          text: 'Must be kept cold. These need to be ordered from the lab prior to sampling. Mould and bacteria on a surface is cultured to give a breakdown of what is present.',
        },
      ],
    },
    {
      title: 'Biological Background',
      sections: [
        {
          title: 'First Cab off the Rank',
          text: 'When an area gets wet it is likely that the first air contaminant is going to be bacteria. Pseudomonas is one form of bacteria that grows quickly and has health effects to people. There are other gram negative bacteria as well that may grow. Bacteria needs lots of water to grow and be constantly wet.',
        },
        {
          title: 'Next Arrival - <i>Pen.</i> & <i>Asp.</i>',
          text: 'Next to the party a few days later is the fast growing mould. Aspergillus and penicillium species (sp.). The spores from these are small. These moulds give off Microbial Volatile Organic Compounds (mVOCs) which is the odour you smell.',
        },
        {
          title: 'Late Arrival - <i>Strachybotrys</i>',
          text: 'The late arrival to the party is Stachybotrys sp. A bit like some sort of Madonna, does not arrive for a couple of months and requires areas to be kept moist all the time or won’t show. Of course, when it does show, the health effects are significant.',
        },
      ],
    },
    {
      title: 'Reference and Deviations',
      text: '<ul><li>The equipment operation of this method is based on the Biodet Services in-house methods.</li><li>Canadian “Indoor Air Quality in Office Buildings: A Technical Guide”</li><li>“Bacteria and Fungus Sampling Guide” An understanding of the different types of bacteria and fungus will ensure the correct sample method is being used.</li></ul>'
    },
  ],
}

const methodbio2 = {
  updateDate: '',
  title: 'Biological Sampling Part 2',
  subtitle: 'Allergenoco and SAS Sampler',
  preparedBy: '',
  checkedBy: '',
  documentController: '',
  tmCode: 'TM 4.21-17 Part 2',
  version: '1.1',
  changes: [
    {
      version: '1.0',
      changes: 'Document created.',
      person: 'Stuart Keer-Keer',
      date: '',
    },
    {
      version: '1.1',
      changes: 'Added method update table.',
      person: 'Max Gallagher',
      date: '',
    },
  ],
  sections: [
    {
      title: 'Introduction',
      text: 'This details methods to gather biological air samples.  Before using the methods here you need to have read and understood the training document “Bacteria and Fungus Sampling Guide” An understanding of the different types of bacteria and fungus will ensure the correct sample method is being used.',
      sections: [
        {
          title: 'Types of Sampling',
          text: 'There are two types of method to use.<ul><li>Non cultured Fungus and Bacteria (non viable = non living)</li><li>Cultured Fungus and Bacteria (viable = living )</li></ul><p>Viable samples are kept at room temperature for 5 days and the fungus and bacteria grows and is counted and analysed.  Non viable samples contain dust, particulate, spores are analysed by inspection under a microscope.</p>'
        },
      ],
    },
    {
      title: 'Culturable Sampling Equipment',
      text: 'There are two options for gathering samples that are cultured:<ul><li>Cassette and Occupational Health pump</li><li>Portable Ideal Sampler</li></ul><p>The ideal sample volume for viable samples is 1000 L.  If it is a particularly contaminated site then a lower volume can be used, as low as 300L. Samples can be gathered by two methods.</p><p>If a portable air ideal sampler is to be used then it needs to be hired from the lab. Sampling is conducted by drawing a known quantity of sample air over a specially treaded agar plate. Two different agar plates are used per site, one plate specific to bacteria and one plate specific to fungi.</p><p>After sampling is completed each treated dish is sealed air tight to prevent any contamination during transport.</p>',
      sections: [
        {
          title: 'AirIDEAL Sampler',
          text: 'Living, or viable bacteria and fungi are sampled using an Air IDEAL Sampler. This is different to sampling for non-cultured bacteria and fungi, in that samples collected are cultured and incubated in a lab for five days. They are then analysed in a lab by examination under a microscope to identify and isolate any growth formed on the plates.',
        },
        {
          type: 'image',
          src: 'https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/methods%2Ftm4.21-17%2FairIDEALsampler.png?alt=media&token=e1d31062-7622-4f82-91fc-0da4ff9e4286',
          caption: 'Portable AirIDEAL Sampler',
        },
      ],
    },
    {
      title: 'Non-Viable Sampling Equipment',
      text: 'The ideal sample volume for non viable samples is 150 L. There are three options for gathering samples, these are:<ul><li>Buck Bioslide sampler - with microscopic slides</li><li>Occupational Health Pump and Cassette</li><li>Quicktake and Cassette</li><ul>If the Allegenco sampler is to be used then it needs to be hired from the laboratory.',
      sections: [
        {
          title: 'Allergenco Sampler',
          text: '<p>This method traps dead fungi and organisms that may be present in the air. Often dead fungal spores can still cause unhealthy side effects to humans. This is referred to as non viable fungi, dust and fibres.</p><p>This method is similar to that of the SAS Sampler.  A known sample of air is sucked through a small opening at the top of the sampling device. The air drawn into the sampler and forced to collide with a glass slide containing a gel. This allows any fibres or spores to become lodged in the gel and allow identification after sampling.</p><p>Samples are analysed under a microscope, known fibres and spores are catalogued, counted and reported. Any unidentifiable fibres are also counted and added to the final totals, this includes skin cells, fibres, and siliceous and amorphous matter.</p>',
        },
        {
          type: 'image',
          src: 'https://firebasestorage.googleapis.com/v0/b/k2flutter-f03a1.appspot.com/o/methods%2Ftm4.21-17%2FAllergenco.png?alt=media&token=aac15266-8f4b-4b6c-8deb-8d848ef23d01',
          caption: 'Portable Allergenco Sampler',
        },
      ],
    },
    {
      title: 'Safety',
      text: '<p>Micro-organisms can provide a health risk to humans, as bacteria and viruses can cause diseases, ranging from Legionnaire’s disease to the common cold.  Fungal spores can cause allergic reactions or asthmatic attacks, or after prolonged exposure, other diseases.</p><p>If there have been complaints on site from people feeling ill in a short period of time, then some sort of breathing protection will need to be taken.  If people are extremely sick, then do not conduct sampling there as it becomes a public health matter.</p><p>People that have AIDS or are undergoing chemotherapy have compromised immune systems and should not go to areas that my have potentially hazardous microbe contaminations.</p><ul><li>Sterility, for example, in a hospital, can only be determined if all the equipment is in there, and by using culturable air sampling.</li><li>Presence of mycelia fragments and spore clusters is indicative of recent growth.</li></ul>',
      sections: [
        {
          title: 'Sample Contamination',
          text: 'Once the samples are taken, they need to be sealed before they leave the site, to ensure that there is no contamination during travel.',
        },
        {
          title: 'Ordering Equipment',
          text: 'K2 Environmental Ltd. uses Biodet equipment and sends the samples to Biodet to be analysed',
        },
      ],
    },
    {
      title: 'Reference and Deviations',
      text: '<ul><li>The equipment operation of this method is based on the Biodet Services in-house methods.</li><li>Canadian “Indoor Air Quality in Office Buildings: A Technical Guide”</li></ul>'
    },
  ],
}

const methodbio3 = {
  updateDate: '',
  title: 'Biological Sampling Part 1',
  subtitle: 'Overview of Methods',
  preparedBy: '',
  checkedBy: '',
  documentController: '',
  tmCode: 'TM 4.21-17 Part 1',
  version: '4.1',
  changes: [
    {
      version: '4.0',
      changes: 'Document created.',
      person: 'Stuart Keer-Keer',
      date: '',
    },
    {
      version: '4.1',
      changes: 'Added method update table.<br />Minor grammatical changes.<br />Genus and species changed to italics.',
      person: 'Max Gallagher',
      date: '',
    },
  ],
  sections: [
  ],
}

const methodbio4 = {
  updateDate: '',
  title: 'Biological Sampling Part 1',
  subtitle: 'Overview of Methods',
  preparedBy: '',
  checkedBy: '',
  documentController: '',
  tmCode: 'TM 4.21-17 Part 1',
  version: '4.1',
  changes: [
    {
      version: '4.0',
      changes: 'Document created.',
      person: 'Stuart Keer-Keer',
      date: '',
    },
    {
      version: '4.1',
      changes: 'Added method update table.<br />Minor grammatical changes.<br />Genus and species changed to italics.',
      person: 'Max Gallagher',
      date: '',
    },
  ],
  sections: [
  ],
}

const methodbio5 = {
  updateDate: '',
  title: 'Biological Sampling Part 1',
  subtitle: 'Overview of Methods',
  preparedBy: '',
  checkedBy: '',
  documentController: '',
  tmCode: 'TM 4.21-17 Part 1',
  version: '4.1',
  changes: [
    {
      version: '4.0',
      changes: 'Document created.',
      person: 'Stuart Keer-Keer',
      date: '',
    },
    {
      version: '4.1',
      changes: 'Added method update table.<br />Minor grammatical changes.<br />Genus and species changed to italics.',
      person: 'Max Gallagher',
      date: '',
    },
  ],
  sections: [
  ],
}

function UploadtoFirebase(props) {
  trainingPathsRef.doc('bio').set(bio);
  methodsRef.doc('4.21-17-biological-part1').set(methodbio1);
  methodsRef.doc('4.21-17-biological-part2').set(methodbio2);
  // methodsRef.doc('4.21-17-biological-part3').set(methodbio3);
  // methodsRef.doc('4.21-17-biological-part4').set(methodbio4);
  // methodsRef.doc('4.21-17-biological-part5').set(methodbio5);
}

export default UploadtoFirebase;
