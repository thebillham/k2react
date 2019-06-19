import {
  EDIT_MODAL_DOC,
  EDIT_MODAL_SAMPLE,
  GET_ASBESTOS_ANALYSIS,
  GET_AIR_ANALYSTS,
  GET_BULK_ANALYSTS,
  GET_COCS,
  GET_SAMPLES,
  GET_SAMPLE_LOG,
  RESET_ASBESTOS_LAB,
  RESET_MODAL,
  SET_ANALYSIS_MODE,
  SET_ANALYST,
  SET_ANALYSIS_SESSION_ID,
} from "../constants/action-types";
import moment from "moment";
import {
  asbestosSamplesRef,
  asbestosAnalysisRef,
  asbestosSampleLogRef,
  cocsRef,
  stateRef,
} from "../config/firebase";
import { xmlToJson } from "../config/XmlToJson";

export const resetAsbestosLab = () => dispatch => {
  dispatch({ type: RESET_ASBESTOS_LAB });
};

export const fetchCocs = update => async dispatch => {
  // Make all calls update for now
  update = true;
  if (update) {
    cocsRef
      .where("deleted", "==", false)
      .where("versionUpToDate", "==", false)
      .orderBy("lastModified")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
    cocsRef
      .where("deleted", "==", false)
      .where("versionUpToDate", "==", true)
      .where("lastModified", ">", moment().subtract(1, 'days').toDate())
      .orderBy("lastModified")
      // .orderBy("dueDate", "desc")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
  } else {
    stateRef.doc("cocs").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_COCS, payload: doc.data() });
      } else {
        console.log("Coc doesn't exist");
      }
    });
  }
};

export const fetchCocsByJobNumber = (jobNumber) => async dispatch => {
  cocsRef
    .where("deleted", "==", false)
    .where("jobNumber", "==", jobNumber.toUpperCase())
    .orderBy("lastModified")
    .onSnapshot(querySnapshot => {
      var cocs = {};
      querySnapshot.forEach(doc => {
        cocs[doc.id] = doc.data();
      });
      dispatch({
        type: GET_COCS,
        payload: cocs,
        update: true
      });
    });
};

export const fetchCocsBySearch = (client, startDate, endDate) => async dispatch => {
  console.log(client);
  console.log(startDate);
  console.log(endDate);
  if (startDate === "") startDate = moment().subtract(6, 'months').toDate(); else startDate = new Date(startDate);
  if (endDate === "") endDate = new Date(); else endDate = new Date(endDate);
  console.log(startDate);
  console.log(endDate);
  if (client !== "") {
    cocsRef
      .where("deleted", "==", false)
      .where("client", "==", client)
      .where("lastModified", ">=", startDate)
      .where("lastModified", "<=", endDate)
      .orderBy("lastModified")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
  } else {
    console.log('blank client');
    cocsRef
      .where("deleted", "==", false)
      .where("lastModified", ">=", startDate)
      .where("lastModified", "<=", endDate)
      .orderBy("lastModified")
      .onSnapshot(querySnapshot => {
        var cocs = {};
        querySnapshot.forEach(doc => {
          cocs[doc.id] = doc.data();
        });
        dispatch({
          type: GET_COCS,
          payload: cocs,
          update: true
        });
      });
  }
};

export const fetchAsbestosAnalysis = update => async dispatch => {
  if (update) {
    asbestosAnalysisRef
      .onSnapshot(querySnapshot => {
        var analysis = [];
        querySnapshot.forEach(doc => {
          analysis.push(doc.data());
        });
        dispatch({
          type: GET_ASBESTOS_ANALYSIS,
          payload: { analysis },
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosanalysis").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_ASBESTOS_ANALYSIS, payload: doc.data() });
      } else {
        console.log("Asbestos Analysis doesn't exist");
      }
    });
  }
}

export const fetchSamples = (cocUid, jobNumber, modal) => async dispatch => {
  asbestosSamplesRef
    .where("jobNumber", "==", jobNumber)
    .where("deleted","==",false)
    .onSnapshot(sampleSnapshot => {
      let samples = {};
      sampleSnapshot.forEach(sampleDoc => {
        let sample = sampleDoc.data();
        sample.uid = sampleDoc.id;
        samples[sample.sampleNumber] = sample;
        // console.log('fetch samples method');
        dispatch({
          type: GET_SAMPLES,
          cocUid: cocUid,
          payload: samples
        });
        if (modal) {
          dispatch({
            type: EDIT_MODAL_DOC,
            payload: {samples: samples},
          });
        }
      });
    });
};

export const fetchSampleLog = (update) => async dispatch => {
  if (update) {
    let startDate = moment().subtract(20, 'days').toDate();
    asbestosSampleLogRef
      .where("reportDate", ">", startDate)
      .orderBy("reportDate")
      .onSnapshot(logSnapshot => {
        let logs = {};
        logSnapshot.forEach(logDoc => {
          let log = logDoc.data();
          log.uid = logDoc.id;
          logs[log.uid] = log;
        });
        dispatch({
          type: GET_SAMPLE_LOG,
          payload: logs,
          update: true,
        });
      });
  } else {
    stateRef.doc("asbestosSampleLog").onSnapshot(doc => {
      if (doc.exists) {
        dispatch({ type: GET_SAMPLE_LOG, payload: doc.data() });
      } else {
        console.log("Sample log doesn't exist");
      }
    });

  }
};

export const handleCocSubmit = ({ doc, docid, userName, userUid }) => dispatch => {
  // console.log(doc.samples);
  let sampleList = [];
  if (doc.samples) {
    // console.log(doc.samples);
    Object.keys(doc.samples).forEach(sample => {
      // console.log(sample);
      if (!doc.samples[sample].uid) {
        let datestring = new Intl.DateTimeFormat("en-GB", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
          .format(new Date())
          .replace(/[.:/,\s]/g, "_");
        let uid = `${
          doc.jobNumber
        }-SAMPLE-${sample}-CREATED-${datestring}-${Math.round(
          Math.random() * 1000
        )}`;
        // console.log(`UID for new sample is ${uid}`);
        let log = {
          type: 'Create',
          log: `Sample ${sample} (${doc.samples[sample].description} ${doc.samples[sample].material}) created.`,
          date: new Date(),
          userName: userName,
          user: userUid,
          sample: uid,
        };
        doc.cocLog.push(log);
        doc.samples[sample].uid = uid;
        doc.samples[sample].deleted = false;
        doc.samples[sample].createdDate = new Date();
        doc.samples[sample].createdBy = {id: userUid, name: userName};
        sampleList.push(uid);
      } else {
        // console.log(`UID for old sample is ${doc.samples[sample].uid}`);
        sampleList.push(doc.samples[sample].uid);
      }
      if (
        (doc.samples[sample].description || doc.samples[sample].material) &&
        !doc.samples[sample].disabled &&
        (doc.samples[sample].cocUid === undefined ||
          doc.samples[sample].cocUid === doc.uid)
      ) {
        // console.log(`Submitting sample ${sample} to ${docid}`);
        let sample2 = doc.samples[sample];
        if (sample2.description)
          sample2.description =
            sample2.description.charAt(0).toUpperCase() +
            sample2.description.slice(1);
        if (doc.type === "air") {
          sample2.isAirSample = true;
          sample2.material = "Air Sample";
        }
        sample2.jobNumber = doc.jobNumber;
        sample2.cocUid = docid;
        console.log(docid);
        sample2.sampleNumber = parseInt(sample, 10);
        if ("disabled" in sample2) delete sample2.disabled;
        // console.log("Sample 2");
        // console.log(sample2);
        asbestosSamplesRef.doc(doc.samples[sample].uid).set(sample2);
      }
    });
  }
  let doc2 = doc;
  if ("samples" in doc2) delete doc2.samples;
  doc2.uid = docid;
  doc2.sampleList = sampleList;
  // console.log(doc2);
  cocsRef.doc(docid).set(doc2);
  dispatch({ type: RESET_MODAL });
};

export const setAnalyst = analyst => dispatch => {
  dispatch({
    type: SET_ANALYST,
    payload: analyst
  });
};

export const setAnalysisMode = mode => dispatch => {
  dispatch({
    type: SET_ANALYSIS_MODE,
    payload: mode
  });
};

export const setSessionID = session => dispatch => {
  dispatch({
    type: SET_ANALYSIS_SESSION_ID,
    payload: session,
  });
}

export const handleSampleChange = (number, type, value) => dispatch => {
  dispatch({
    type: EDIT_MODAL_SAMPLE,
    payload: {
      number: number + 1,
      type: type,
      value: value
    }
  });
};

export const logSample = (coc, sample, cocStats) => dispatch => {
  // let dateString = moment(new Date()).format('YYYY-MM-DD');
  let transitTime = sample.createdDate && sample.receivedDate ? moment.duration(moment(sample.receivedDate.toDate()).diff(sample.createdDate.toDate())).asMilliseconds() : null;
  let labTime = sample.receivedDate && sample.analysisDate ? moment.duration(moment(sample.analysisDate.toDate()).diff(sample.receivedDate.toDate())).asMilliseconds() : null;
  let analysisTime = sample.receivedDate && sample.analysisStartDate ? moment.duration(moment(sample.analysisDate.toDate()).diff(sample.analysisStartDate.toDate())).asMilliseconds() : null;
  let turnaroundTime = sample.receivedDate ? moment.duration(moment().diff(sample.receivedDate.toDate())).asMilliseconds() : null;

  let log = {
    client: coc.client ? coc.client : '',
    address: coc.address ? coc.address: '',
    sampleDates: coc.dates ? coc.dates: [],
    jobNumber: coc.jobNumber ? coc.jobNumber : '',
    samplePersonnel: coc.personnel ? coc.personnel: [],
    priority: coc.priority ? coc.priority: 0,
    cocUid: coc.uid ? coc.uid : '',
    cocType: coc.type ? coc.type : '',
    totalSamples: cocStats.totalSamples ? cocStats.totalSamples : 0,
    maxTurnaroundTime: cocStats.maxTurnaroundTime ? cocStats.maxTurnaroundTime : 0,
    averageTurnaroundTime: cocStats.averageTurnaroundTime ? cocStats.averageTurnaroundTime : 0,
    genericLocation: sample.genericLocation ? sample.genericLocation : '',
    specificLocation: sample.specificLocation ? sample.specificLocation : '',
    sampleUid: sample.uid ? sample.uid : '',
    sampleNumber: sample.sampleNumber ? sample.sampleNumber : '',
    description: sample.description ? sample.description : '',
    material: sample.material ? sample.material : '',
    result: sample.result ? sample.result : {},
    receivedBy: sample.receivedUser ? sample.receivedUser : '',
    receivedDate: sample.receivedDate ? sample.receivedDate : null,
    analysisBy: sample.analyst ? sample.analyst : '',
    analysisDate: sample.analysisDate ? sample.analysisDate : null,
    resultBy: sample.analysisUser ? sample.analysisUser : '',
    reportedBy: sample.reportUser ? sample.reportUser : '',
    reportDate: new Date(),
    turnaroundTime: turnaroundTime,
    analysisTime: analysisTime,
    transitTime: transitTime,
    labTime: labTime,
    analysisTime: analysisTime,
    analysisType: sample.analysisType ? sample.analysisType : 'normal',
  };
  asbestosSampleLogRef.doc().set(log);
}

export const writeResult = result => {
  let detected = [];
  if (result === undefined) return "Not analysed";
  Object.keys(result).forEach(type => {
    if (result[type]) detected.push(type);
  });
  if (detected.length < 1) return "Not analysed";
  if (detected[0] === "no") return "No asbestos detected";
  let asbestos = [];
  if (result["ch"]) asbestos.push("chrysotile");
  if (result["am"]) asbestos.push("amosite");
  if (result["cr"]) asbestos.push("crocidolite");
  if (asbestos.length > 0) {
    asbestos[asbestos.length - 1] =
      asbestos[asbestos.length - 1] + " asbestos";
  }
  let str = "";
  if (asbestos.length === 1) {
    str = asbestos[0];
  } else if (asbestos.length > 1) {
    var last_element = asbestos.pop();
    str = asbestos.join(", ") + " and " + last_element;
  }
  detected.forEach(detect => {
    if (detect === "umf") {
      if (asbestos.length > 0) {
        str = str + " and unknown mineral fibres (UMF)";
      } else {
        str = "unknown mineral fibres (UMF)";
      }
    }
  });
  return str.charAt(0).toUpperCase() + str.slice(1) + " detected";
};

export const writeShorthandResult = result => {
  let detected = [];
  if (result === undefined) return "N/A";
  Object.keys(result).forEach(type => {
    if (result[type]) detected.push(type);
  });
  if (detected.length < 1) return "N/A";
  if (detected[0] === "no") return "NO";
  let str = '';
  if (result["ch"]) str = "CH ";
  if (result["am"]) str = str + "AM ";
  if (result["cr"]) str = str + "CR ";
  if (result["umf"]) str = str + "UMF ";
  return str.slice(0, -1);
};

export const writeSoilDetails = details => {
  let dictionary = {
    subFractionType: {
      cobbles: 'cobbly ',
      gravel: 'gravelly ',
      sand: 'sandy ',
      clay: 'clayey ',
      silt: 'silty ',
      topsoil: 'organic soily ',
      organicclay: 'organic clayey ',
      organicsilt: 'organic silty ',
      organicsand: 'organic sandy ',
      peat: 'peaty ',
    },
    majorFractionQualifier: {
      fine: 'fine ',
      medium: 'medium ',
      coarse: 'coarse ',
      finetocoarse: 'fine to coarse ',
      finetomedium: 'fine to medium ',
      mediumtocoarse: 'medium to coarse ',
      firm: 'firm ',
      spongy: 'spongy ',
      plastic: 'plastic ',
      fibrous: 'fibrous ',
      amorphous: 'amorphous ',
    },
    majorFractionType: {
      boulders: 'BOULDERS ',
      cobbles: 'COBBLES ',
      gravel: 'GRAVEL ',
      sand: 'SAND ',
      clay: 'CLAY ',
      silt: 'SILT ',
      topsoil: 'ORGANIC TOPSOIL ',
      organicclay: 'ORGANIC CLAY ',
      organicsilt: 'ORGANIC SILT ',
      organicsand: 'ORGANIC SAND ',
      peat: 'PEAT ',
    },
    minorFractionType: {
      cobbles: 'cobbles',
      gravel: 'gravel',
      sand: 'sand',
      clay: 'clay',
      silt: 'silt',
      topsoil: 'organic soil',
      organicclay: 'organic clay',
      organicsilt: 'organic silt',
      organicsand: 'organic sand',
      peat: 'peat',
    }
  }
  let sections = [];
  if (details.majorFractionType) {

    // SOIL NAME
    let str = '';
    let minorFractions = [];
    if (details.subFractionType && details.subFractionType !== 'none') {
      str = dictionary.subFractionType[details.subFractionType];
    }
    if ((details.majorFractionType === 'sand' || details.majorFractionType === 'gravel' || details.majorFractionType === 'organicsand' || details.majorFractionType === 'peat') && details.majorFractionQualifier) {
      str = str + dictionary.majorFractionQualifier[details.majorFractionQualifier];
    }
    str = str + dictionary.majorFractionType[details.majorFractionType];
    if (details.someFractionTypes) {
      let fractionArray = [];
      Object.keys(details.someFractionTypes).forEach(key => {
        if (details.someFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) {
        if (fractionArray.length > 1) {
          minorFractions.push('some ' + fractionArray.slice(0, -1).map(x => dictionary.minorFractionType[x]).join(', ') + ' and ' + fractionArray.slice(-1).map(x => dictionary.minorFractionType[x]));
        } else {
          minorFractions.push('some ' + dictionary.minorFractionType[fractionArray[0]]);
        }
      }
    }
    if (details.minorFractionTypes) {
      let fractionArray = [];
      Object.keys(details.minorFractionTypes).forEach(key => {
        if (details.minorFractionTypes[key] === true) fractionArray.push(key);
      });
      console.log(fractionArray);
      if (fractionArray.length > 0) {
        if (fractionArray.length > 1) {
          minorFractions.push('minor ' + fractionArray.slice(0, -1).map(x => dictionary.minorFractionType[x]).join(', ') + ' and ' + fractionArray.slice(-1).map(x => dictionary.minorFractionType[x]));
        } else {
          minorFractions.push('minor ' + dictionary.minorFractionType[fractionArray[0]]);
        }
      }
    }
    if (details.traceFractionTypes) {
      let fractionArray = [];
      Object.keys(details.traceFractionTypes).forEach(key => {
        if (details.traceFractionTypes[key] === true) fractionArray.push(key);
      });
      if (fractionArray.length > 0) {
        if (fractionArray.length > 1) {
          minorFractions.push('trace of ' + fractionArray.slice(0, -1).map(x => dictionary.minorFractionType[x]).join(', ') + ' and ' + fractionArray.slice(-1).map(x => dictionary.minorFractionType[x]));
        } else {
          minorFractions.push('trace of ' + dictionary.minorFractionType[fractionArray[0]]);
        }
      }
    }
    if (minorFractions.length > 0) {
      if (minorFractions.length === 1) str += 'with ' + minorFractions[0];
      else str += 'with ' + minorFractions.slice(0, -1).join(', ') + ' and ' + minorFractions.slice(-1);
    }
    sections.push(str);
    str = '';

    // VISUAL CHARACTERISTICS
    let section = [];
    if (details.colour && details.colour !== '') {
      let colour = '';
      if (details.colourShade && details.colourShade !== '') colour += details.colourShade + ' ';
      if (details.colourQualifier && details.colourQualifier !== '') colour += details.colourQualifier + ' ';
      colour += details.colour;
      if (details.colourPattern && details.colourPattern !== '' && details.colourSecondary && details.colourSecondary !== '') {
        colour += ', ' + details.colourPattern + ' ' + details.colourSecondary;
      }
      section.push(colour);
    }
    if (details.structure && details.structure !== '') {
      section.push(details.structure);
    }
    if (section.length > 0) {
      sections.push(section.join(', '));
    }

  } else {
    sections = ['No details'];
  }
  return sections.map(x => x.trim()).join('; ');
};
