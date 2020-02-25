import moment from "moment";
import {
  sentenceCase,
  dateOf,
  andList,
  lower,
  titleCase,
  toDataURL,
  writeDates
} from "./helpers";
import { writeResult, getBasicResult } from "./asbestosLab";
import { handleJobChange } from "./jobs";

export const collateSamples = (site, siteJobs, siteAcm, samples) => {
  let registerList = [],
    registerMap = [],
    airMonitoringRecords = [];

  site.layout &&
    Object.values(site.layout).forEach(roomGroup => {
      console.log(roomGroup);
      let roomGroupTable = { label: roomGroup.label || null, rows: [] },
        roomGroupRows = [],
        roomGroupName = roomGroup.label || null;
      roomGroup.rooms &&
        roomGroup.rooms.forEach(room => {
          let roomName = room.label;
          if (roomName.includes("General") || roomName.includes("Generic"))
            roomName = "General Items";
          let roomTable = { label: roomName || "", rows: [] },
            rows = [];
          room.acm &&
            room.acm.forEach(acmUid => {
              let acm = siteAcm[acmUid];
              if (acm && acm.sampleType !== "air") {
                // Columns AMP/Survey Positive (2018)
                //  - Room/Area
                //  - Item
                //  - Material
                //  - Extent (Extent Num)
                //  - Sample
                //  - Asbestos Result/Presumed/Strongly Presumed
                //  - Material Risk
                //  - Priority Risk (Not On Survey)

                // Columns Survey Negative (2018-20)
                //  - Room/Area
                //  - Item
                //  - Material
                //  - Extent (Extent Num)
                //  - Sample

                // Columns AMP/Survey Positive (2019)
                //  - Room/Area
                //  - Item
                //  - Material
                //  - Extent (Extent Num)
                //  - Accessibility
                //  - Sample
                //  - Asbestos Result/Presumed/Strongly Presumed
                //  - Material Risk
                //  - Priority Risk (Not On Survey)
                //  - Total Risk (Not On Survey)

                //  - Recommendation (2020)
                let row = {
                  room: roomName || "N/A",
                  roomGroup: roomGroupName || "N/A",
                  item: acm.description || "N/A",
                  material: acm.material || "N/A",
                  label:
                    acm.description && acm.material
                      ? acm.description
                          .toLowerCase()
                          .includes(acm.material.toLowerCase())
                        ? acm.description
                        : acm.writeItemFirst
                        ? `${acm.description || ""} ${acm.material || ""}`
                        : `${acm.material || ""} ${acm.description || ""}`
                      : acm.description
                      ? acm.description
                      : acm.material
                      ? acm.material
                      : "no description",
                  extent: writeAcmExtent(acm),
                  sample: acm.sample
                    ? acm.idKey === "i"
                      ? `${acm.sample.jobNumber}-${acm.sample.sampleNumber}`
                      : acm.idKey === "s"
                      ? `As ${acm.sample.jobNumber}-${acm.sample.sampleNumber}`
                      : "-"
                    : "-",
                  acmRemoved: null,
                  accessibility: null,
                  materialRisk: null,
                  priorityRisk: null,
                  totalRisk: null,
                  recommendation: null
                };
                // Check if sample is negative
                if (
                  acm.idKey === "i" &&
                  acm.sample &&
                  acm.sample.result &&
                  acm.sample.result.no
                ) {
                  // Sample is negative
                } else {
                  // Check if sample is removed
                  if (acm.acmRemoved) {
                    row.acmRemoved = true;
                    row.recommendation = getAcmRemoved(acm);
                    row.accessibility = "N/A";
                    row.damageSurfaceNotes = "N/A";
                  } else {
                    row.idKey = acm.idKey;
                    row.accessibility = acm.accessibility || "N/A";
                    row.damageSurfaceNotes = getDamageSurfaceNotes(acm);
                    row.asbestosResult = getAsbestosResult(acm);
                    row.materialRisk = getMaterialRisk(acm);
                    row.priorityRisk = getPriorityRisk(acm);
                    if (row.materialRisk !== null && row.priorityRisk !== null)
                      row.totalRisk = getTotalRisk(
                        row.materialRisk,
                        row.priorityRisk
                      );
                    row.recommendation = getRecommendation(acm);
                  }
                }
                rows.push(row);
                registerList.push(row);
              } else if (acm && acm.sample) {
                let row = {
                  room: roomName || "N/A",
                  roomGroup: roomGroupName || "N/A",
                  date: acm.sample.startTime
                    ? moment(dateOf(acm.sample.startTime)).format("D MMMM YYYY")
                    : "N/A",
                  sample: `${acm.sample.jobNumber}-${acm.sample.sampleNumber}`,
                  location: acm.sample.specificLocation || roomName || "N/A",
                  sampleVolume: acm.sample.sampleVolume
                    ? acm.sample.sampleVolume.toFixed(1)
                    : "N/A",
                  startTime: acm.sample.startTime
                    ? moment(dateOf(acm.sample.startTime)).format("h:mma")
                    : "N/A",
                  totalTime: acm.sample.totalRunTime || "N/A",
                  fibreResult:
                    acm.sample.fibreResult || acm.sample.fibreResult === 0
                      ? acm.sample.fibreResult
                      : "N/A",
                  reportConcentration: acm.sample.reportConcentration || "N/A"
                };
                rows.push(row);
                airMonitoringRecords.push(row);
              }
            });
          roomTable.rows = rows;
          roomGroupRows.push(roomTable);
        });
      roomGroupTable.rows = roomGroupRows;
      registerMap.push(roomGroupTable);
    });

  return {
    registerList,
    registerMap,
    airMonitoringRecords
  };
};

export const writeAcmExtent = acm => {
  let str = `N/A`;
  if (acm.extent && acm.extentNum && acm.extentNumUnits) {
    str = `${sentenceCase(acm.extent)} (${acm.extentNum}${acm.extentNumUnits})`;
  } else if (acm.extent && acm.extentNum) {
    // Presume m²
    str = `${sentenceCase(acm.extent)} (${acm.extentNum}m²)`;
  } else if (acm.extentNum && acm.extentNumUnits) {
    str = `${acm.extentNum}${acm.extentNumUnits}`;
  } else if (acm.extentNum) {
    str = `${acm.extentNum}m²`;
  } else if (acm.extent) {
    str = sentenceCase(acm.extent);
  }
  return str;
};

export const getAcmRemoved = acm => {
  // Removed, see clearance report AS190209
  if (acm.acmRemovalJob) {
    let str = "Removed";
    if (acm.acmRemovalJob.removalDate)
      str =
        str +
        ` on ${moment(dateOf(acm.acmRemovalJob.removalDate)).format(
          "D MMMM YYYY"
        )}`;
    if (acm.acmRemovalJob.asbestosRemovalist)
      str =
        str +
        ` by ${acm.acmRemovalJob.asbestosRemovalist}${
          acm.acmRemovalJob.asbestosRemovalistLicence
            ? ` (${acm.acmRemovalJob.asbestosRemovalistLicence})`
            : ""
        }`;
    if (acm.referenceNumber)
      str = str + ` Job Number ${acm.acmRemovalJob.referenceNumber}`;
    return str;
  } else {
    return `Removed`;
  }
};

export const getAsbestosResult = acm => {
  let result = { text: "", color: "" };
  if (acm.idKey === "p") {
    result.text = "Presumed";
    result.color = "Warning";
  } else if (acm.idKey === "s") {
    result.text = "Strongly presumed";
    result.color = "StrongWarning";
  } else if (acm.sample) {
    // Presume Negative Samples aren't included
    result.text = writeResult(acm.sample.result, false, true);
    result.color = "Bad";
  }
  return result;
};

export const getMaterialRisk = acm => {
  let riskMap = {};

  // Product
  riskMap.product = {
    text: acm.material
      ? `${sentenceCase(acm.material)} (${acm.category || "Other"})`
      : "N/A",
    score: acm.productScore || null
  };

  // Damage
  riskMap.damage = {
    text: acm.damageDescription ? sentenceCase(acm.damageDescription) : "N/A",
    score: acm.damageScore || null
  };

  // Surface
  riskMap.surface = {
    text: acm.surfaceDescription ? sentenceCase(acm.surfaceDescription) : "N/A",
    score: acm.surfaceScore || null
  };

  // Asbestos Type
  riskMap.asbestosType = {
    text: "Unknown",
    score: 3
  };

  if (acm.idKey === "i" && acm.sample && acm.sample.result) {
    riskMap.asbestosType = {
      text: writeResult(acm.sample.result, false, true),
      score: acm.sample.result.cr ? 3 : acm.sample.result.am ? 2 : 1
    };
  } else if (acm.asbestosType && !acm.asbestosType.cr) {
    riskMap.asbestosType = {
      text: `${writeResult(acm.asbestosType, false, true)} (presumed)`,
      score: acm.asbestosType.am ? 2 : 1
    };
  }

  if (
    riskMap.product.score &&
    riskMap.damage.score &&
    riskMap.surface.score &&
    riskMap.asbestosType.score
  ) {
    riskMap.score =
      parseInt(riskMap.product.score) +
      parseInt(riskMap.damage.score) +
      parseInt(riskMap.surface.score) +
      parseInt(riskMap.asbestosType.score);
    if (riskMap.score >= 10) {
      riskMap.text = "High";
      riskMap.color = "Bad";
    } else if (riskMap.score >= 7) {
      riskMap.text = "Medium";
      riskMap.color = "Warning";
    } else if (riskMap.score >= 5) {
      riskMap.text = "Low";
      riskMap.color = "Ok";
    } else {
      riskMap.text = "Very low";
      riskMap.color = "Benign";
    }
  } else {
    riskMap.text = "N/A";
    riskMap.color = null;
  }

  return riskMap;
};

export const getPriorityRisk = acm => {
  let riskMap = {},
    totalActivity = 0,
    numActivity = 0,
    scoreActivity = 0,
    totalDisturbance = 0,
    numDisturbance = 0,
    scoreDisturbance = 0,
    totalExposure = 0,
    numExposure = 0,
    scoreExposure = 0,
    totalMaintenance = 0,
    numMaintenance = 0,
    scoreMaintenance = 0,
    score = 0,
    color = "",
    text = "";

  ["priMainActivityScore", "priSecondaryActivityScore"].forEach(x => {
    if (acm[x]) {
      totalActivity += parseInt(acm[x]);
      numActivity++;
    }
  });
  // Average and round up to nearest integer
  scoreActivity =
    numActivity > 0 ? Math.ceil(totalActivity / numActivity) : null;

  ["priLocationScore", "priAccessibilityScore", "priExtentScore"].forEach(x => {
    if (acm[x]) {
      totalDisturbance += parseInt(acm[x]);
      numDisturbance++;
    }
  });
  scoreDisturbance =
    numDisturbance > 0 ? Math.ceil(totalDisturbance / numDisturbance) : null;

  ["priOccupantScore", "priUseFreqScore", "priAvgTimeScore"].forEach(x => {
    if (acm[x]) {
      totalExposure += parseInt(acm[x]);
      numExposure++;
    }
  });
  scoreExposure =
    numExposure > 0 ? Math.ceil(totalExposure / numExposure) : null;

  ["priMaintTypeScore", "priMaintFreqScore"].forEach(x => {
    if (acm[x]) {
      totalMaintenance += parseInt(acm[x]);
      numMaintenance++;
    }
  });
  scoreMaintenance =
    numMaintenance > 0 ? Math.ceil(totalMaintenance / numMaintenance) : null;

  if (
    scoreActivity !== null &&
    scoreDisturbance !== null &&
    scoreExposure !== null &&
    scoreMaintenance !== null
  ) {
    score = scoreActivity + scoreDisturbance + scoreExposure + scoreMaintenance;
    if (score > 8) {
      text = "High";
      color = "Bad";
    } else if (score > 6) {
      text = "Medium";
      color = "Warning";
    } else if (score > 3) {
      text = "Low";
      color = "Ok";
    } else {
      text = "Very low";
      color = "Benign";
    }

    riskMap = {
      totalActivity,
      numActivity,
      scoreActivity,
      totalDisturbance,
      numDisturbance,
      scoreDisturbance,
      totalExposure,
      numExposure,
      scoreExposure,
      totalMaintenance,
      numMaintenance,
      scoreMaintenance,
      score,
      color,
      text
    };
  } else riskMap = null;

  return riskMap;
};

export const getTotalRisk = (mRisk, pRisk) => {
  let riskMap = {};
  if (mRisk.score !== null && pRisk.score !== null) {
    riskMap.score = parseInt(mRisk.score) + parseInt(pRisk.score);
    if (riskMap.score > 18) {
      riskMap.text = "High";
      riskMap.color = "Bad";
    } else if (riskMap.score > 12) {
      riskMap.text = "Medium";
      riskMap.color = "Warning";
    } else if (riskMap.score > 7) {
      riskMap.text = "Low";
      riskMap.color = "Ok";
    } else {
      riskMap.text = "Very low";
      riskMap.color = "Benign";
    }
  } else riskMap = null;
  return riskMap;
};

export const getDamageSurfaceNotes = acm => {
  if (acm.damageAndSurfaceNotes) return acm.damageAndSurfaceNotes;
  else return `${acm.damageDescription}, ${acm.surfaceDescription}`;
};

export const getRecommendation = acm => {
  let str1 = "",
    str2 = "";
  if (acm.managementPrimary) {
    if (acm.managementPrimary === "Removal") {
      if (acm.removalLicenceRequired === "Class A") {
        str1 = "REM-A";
      } else if (acm.removalLicenceRequired === "Class B") {
        str1 = "REM-B";
      } else if (acm.removalLicenceRequired === "Unlicensed") {
        str1 = "REM-U";
      } else str1 = "REM";
    } else if (acm.managementPrimary === "Deferral") {
      str1 = "DEFER";
    } else if (acm.managementPrimary === "Sealing") {
      str1 = "SEAL";
    } else if (acm.managementPrimary === "Encapsulate") {
      str1 = "ENCAP";
    } else if (acm.managementPrimary === "Enclosure") {
      str1 = "ENCL";
    } else if (acm.managementPrimary === "Further Inspection") {
      str1 = "INSP";
    } else if (acm.managementPrimary === "Test") {
      str1 = "INSP";
    }
  }
  if (acm.managementSecondary) {
    if (acm.managementSecondary === "Removal") {
      if (acm.removalLicenceRequired === "Class A") {
        str2 = "REM-A";
      } else if (acm.removalLicenceRequired === "Class B") {
        str2 = "REM-B";
      } else if (acm.removalLicenceRequired === "Unlicensed") {
        str2 = "REM-U";
      } else str2 = "REM";
    } else if (acm.managementSecondary === "Deferral") {
      str2 = "DEFER";
    } else if (acm.managementSecondary === "Sealing") {
      str2 = "SEAL";
    } else if (acm.managementSecondary === "Encapsulate") {
      str2 = "ENCAP";
    } else if (acm.managementSecondary === "Enclosure") {
      str2 = "ENCL";
    } else if (acm.managementSecondary === "Further Inspection") {
      str1 = "INSP";
    } else if (acm.managementSecondary === "Test") {
      str2 = "INSP";
    }
  }
  if (str1 !== "" && str2 !== "") return `${str1}/${str2}`;
  else if (str1 !== "") return str1;
  else if (str2 !== "") return str2;
  else return "N/A";
};

export const issueDocument = ({
  template,
  site,
  job,
  registerMap,
  registerList,
  airMonitoringRecords,
  staff
}) => dispatch => {
  // console.log(template);
  // console.log(site);
  // console.log(job);
  // console.log(registerMap);
  // console.log(registerList);
  // console.log(airMonitoringRecords);

  let latestIssue = 0;

  if (job.versions && Object.keys(job.versions).length > 0) {
    latestIssue = Math.max(
      ...Object.keys(job.versions).map(key => parseInt(key))
    );
  }

  // Basic Fields for Every Report
  let versionHistory = [];

  // console.log(latestIssue);

  if (latestIssue > 1) {
    Object.values(job.versions).forEach((v, index) => {
      console.log(v);
      console.log(index);
      let authors = {
        writer: [],
        checker: [],
        ktp: []
      };
      ["writer", "checker", "ktp"].forEach(field => {
        console.log(v[field]);
        if (v[field]) {
          v[field].forEach(s => {
            console.log(s);
            authors[field].push({
              name: s.name,
              asbestosAssessorNumber: staff[s.uid] ? staff[s.uid].aanumber : "",
              tertiary: staff[s.uid] ? staff[s.uid].tertiary : "",
              ip402: staff[s.uid] ? staff[s.uid].ip402 : false
            });
            console.log(field);
          });
        }
      });
      versionHistory.push({
        no: index + 1,
        changes: v.changes,
        date: moment(dateOf(v.date)).format("DD/MM/YYYY"),
        writer: andList(authors.writer.map(e => e.name)),
        checker: andList(authors.checker.map(e => e.name)),
        ktp: andList(authors.ktp.map(e => e.name)),
        writerFull: authors.writer.map(e => nameFullQuals(e)).join("\n\n"),
        checkerFull: authors.checker.map(e => nameFullQuals(e)).join("\n\n"),
        ktpFull: authors.ktp.map(e => nameFullQuals(e)).join("\n\n"),
        noAsbestos:
          registerList.filter(e => {
            return e.acmRemoved || e.asbestosResult;
          }).length > 0
            ? false
            : true
      });
    });
  }

  let json = {
    client: job.client,
    address: job.address,
    jobNumber: job.jobNumber,
    issueNumber: latestIssue,
    issueDate: moment().format("D MMMM YYYY"),
    versionNumber: job.latestVersion + 1 || 1,
    siteImageUrl:
      site.siteImageUrl.substring(0, site.siteImageUrl.lastIndexOf("&token")) ||
      null,
    versionHistory
  };
  if (template.includes("AMP")) {
    let sitePersonnel = [],
      siteVisits = [];
    if (site.siteVisits) {
      Object.values(site.siteVisits).forEach(v => {
        if (v.referenceNumber === job.jobNumber) {
          v.date && siteVisits.push(v.date);
          v.personnel &&
            v.personnel.forEach(s => {
              sitePersonnel.push({
                name: s.name,
                asbestosAssessorNumber: staff[s.uid]
                  ? staff[s.uid].aanumber
                  : "",
                tertiary: staff[s.uid] ? staff[s.uid].tertiary : "",
                ip402: staff[s.uid] ? staff[s.uid].ip402 : false
              });
            });
        }
      });
    }
    let authors = {
      writer: [],
      checker: [],
      ktp: []
    };
    if (job.versions && job.versions[`${latestIssue}`]) {
      let version = job.versions[`${latestIssue}`];
      ["writer", "checker", "ktp"].forEach(field => {
        if (version[field]) {
          version[field].forEach(s => {
            authors[field].push({
              name: s.name,
              tertiary: staff[s.uid] ? staff[s.uid].tertiary : "",
              ip402: staff[s.uid] ? staff[s.uid].ip402 : false
            });
          });
        }
      });
    }
    // Asbestos Management Plans
    json = {
      ...json,
      sitePersonnelNameTertiaryIp402: andList(
        sitePersonnel.map(e => nameTertiaryIp402(e))
      ),
      sitePersonnelAsbestosAssessorNumbers: andList(
        sitePersonnel.map(e => `${e.asbestosAssessorNumber}`)
      ),

      writerNameTertiaryIp402: andList(
        authors.writer.map(e => nameTertiaryIp402(e))
      ),
      checkerNameTertiaryIp402: andList(
        authors.checker.map(e => nameTertiaryIp402(e))
      ),
      ktpNameTertiaryIp402: andList(authors.ktp.map(e => nameTertiaryIp402(e))),

      registerMap,
      airMonitoringRecords,

      executiveSummary: job.executiveSummary,
      whereIsTheHazard: job.whereIsTheHazard,
      riskToHealth: job.riskToHealth,
      background: job.background,
      immediateActionsRequired: job.immediateActionsRequired,
      removalOrTreatmentOfAsbestos: job.removalOrTreatmentOfAsbestos
    };
  }
  console.log(json);
  dispatch(
    handleJobChange({
      job,
      o1: "issues",
      field: `${latestIssue}`,
      val: json,
      siteUid: site.uid
    })
  );
};

export const nameTertiaryIp402 = e => {
  return `${e.name}${e.tertiary !== "" &&
    ` (${e.tertiary}${e.ip402 && `, IP402`})`}`;
};

export const nameFullQuals = e => {
  let quals = [];
  if (e.tertiary) quals.push(e.tertiary);
  if (e.ip402) quals.push("BOHS IP402");
  if (e.asbestosAssessorNumber)
    quals.push(`Asbestos Assessor No. ${e.asbestosAssessorNumber}`);
  return `${e.name}\n${quals.join(", ")}`;
};

export const nameFullQualsOneLine = e => {
  let quals = [];
  if (e.tertiary) quals.push(e.tertiary);
  if (e.ip402) quals.push("BOHS IP402");
  if (e.asbestosAssessorNumber)
    quals.push(`Asbestos Assessor No. ${e.asbestosAssessorNumber}`);
  return `${e.name} (${quals.join(", ")})`;
};

export const writeExecutiveSummary = (job, siteAcm, template) => {
  if (template === 1 || true) {
    if (siteAcm) {
      let immediateRisk = false;
      Object.values(siteAcm).forEach(e => {
        if (e.immediateRisk) immediateRisk = true;
      });
      if (immediateRisk)
        return "There is an immediate risk to health from asbestos-containing materials on site.";
      else
        return "There is not an immediate risk to health from asbestos-containing materials on site.";
    } else {
      return "No asbestos-containing materials are present or presumed to be present on site.";
    }
  } else if (template === 2) {
  } else {
  }
};

export const writeWhereIsTheHazard = (job, siteAcm, template) => {
  // The asbestos cement arc chutes are present in both electrical cabinets
  // The asbestos-containing gaskets and bitumen are in both engine bays
  // All asbestos-containing materials must be managed
  // The presumed asbestos-containing materials in the main cabin and engine bays 1 and 2 must also be managed

  if (template === 1 || true) {
    if (siteAcm) {
      let immediateRisk = [],
        bullets = [],
        acmGroups = [],
        genericRoom = false,
        sampledAcm = Object.values(siteAcm).filter(e => e.idKey === "i") || [],
        identifiedAcm =
          Object.values(siteAcm).filter(
            e =>
              e.idKey === "i" &&
              e.sample &&
              e.sample.result &&
              getBasicResult(e.sample) === "positive" &&
              e.acmRemoved !== true
          ) || [],
        presumedAcm =
          Object.values(siteAcm).filter(
            e =>
              (e.idKey === "p" || e.idKey === "s") &&
              e.acmRemoved !== true &&
              (!e.sample ||
                !e.sample.result ||
                getBasicResult(e.sample) === "positive")
          ) || [];
      Object.values(siteAcm).forEach(e => {
        if (e.immediateRisk) immediateRisk.push(e);
      });
      if (immediateRisk.length > 0) {
        bullets.push(
          `The ${andList(
            immediateRisk.map(e => `${e.material} ${e.description}`)
          ).toLowerCase()} ${
            immediateRisk.length === 1 ? "presents" : "present"
          } an immediate risk to health and must be remediated as soon as practicable.`
        );
      }
      // No positive samples and no presumed items
      if (presumedAcm.length === 0 && identifiedAcm.length === 0) return null;
      let presumedRooms = {},
        acmMaterials = {},
        acmRooms = {};

      identifiedAcm.length > 0 &&
        identifiedAcm.forEach(e => {
          // First see what rooms each material is in
          if (e.material || e.description) {
            if (e.room && e.room.label) {
              let room = e.room.label;
              if (
                e.room.label.toLowerCase() === "generic items/materials" ||
                e.room.label.toLowerCase() === "general items/materials"
              )
                room = "other areas";
              let item = e.writeItemFirst
                ? `${
                    e.description && e.material
                      ? `${e.description} `
                      : e.description
                  }${e.material && e.material}`
                : `${
                    e.material && e.description ? `${e.material} ` : e.material
                  }${e.description && e.description}`;
              if (acmMaterials[item]) {
                acmMaterials[item].rooms[room] = true;
              } else {
                acmMaterials[item] = { rooms: { [room]: true } };
              }
              if (acmRooms[room]) {
                acmRooms[room].materials[item] = true;
              } else {
                acmRooms[room] = { materials: { [item]: true } };
              }
            }
          }
        });

      Object.values(acmRooms) &&
        Object.keys(acmRooms).forEach(e => {
          acmRooms[e].materials &&
            bullets.push(
              `The asbestos-containing ${andList(
                Object.keys(acmRooms[e].materials)
              ).toLowerCase()} ${
                Object.keys(acmRooms[e].materials).length === 1 &&
                andList(Object.keys(acmRooms[e].materials)).slice(-1) !== "s"
                  ? "is"
                  : "are"
              } in the ${e}`
            );
        });

      presumedAcm.length > 0 &&
        presumedAcm.forEach(e => {
          // This needs to be expanded to cover rooms with the same name
          if (e.room && e.room.label) {
            if (e.room.uid === "generic") genericRoom = true;
            else presumedRooms[e.room.label] = true;
          }
        });
      if (genericRoom) presumedRooms["other areas"] = true;

      if (identifiedAcm.length > 0) {
        // Positive samples and presumed items
        if (presumedAcm.length > 0) {
          if (Object.keys(presumedRooms).length > 0)
            bullets.push(
              `The presumed asbestos-containing materials in the ${andList(
                Object.keys(presumedRooms)
              )} <strong style="color: red">must</strong> also be managed.`
            );
        } else {
          // Positive samples only, no presumed items
        }
      } else {
        if (sampledAcm.length > 0) {
          // Nothing sampled was positive, only presume items
        } else {
          // Only presumed items, nothing sampled
        }
        if (Object.keys(presumedRooms).length > 0)
          bullets.push(
            `The presumed asbestos-containing materials in the ${lower(
              andList(Object.keys(presumedRooms))
            )} <strong style="color: red">must</strong> be managed.`
          );
      }

      console.log(bullets);
      console.log(bullets.map(e => `<li>${e}</li>`));

      return `<h2>Where is the Hazard?</h2><ul>${bullets
        .map(e => `<li>${e}</li>`)
        .join("")}</ul>`;
    } else {
      return null;
    }
  } else if (template === 2) {
  } else {
  }
};

export const writeRiskToHealth = (job, siteAcm, template) => {
  // There is not an immediate risk to health. However, any activity that disturbs the asbestos-containing materials should be discontinued to prevent exposure to airborne asbestos.
  if (template === 1 || true) {
    let str = "";
    if (siteAcm) {
      let immediateRisk = [],
        acmGroups = [],
        sampledAcm = Object.values(siteAcm).filter(e => e.idKey === "i") || [],
        identifiedAcm =
          Object.values(siteAcm).filter(
            e =>
              e.idKey === "i" &&
              e.sample &&
              e.sample.result &&
              getBasicResult(e.sample) === "positive" &&
              e.acmRemoved !== true
          ) || [],
        presumedAcm =
          Object.values(siteAcm).filter(
            e =>
              (e.idKey === "p" || e.idKey === "s") &&
              e.acmRemoved !== true &&
              (!e.sample ||
                !e.sample.result ||
                getBasicResult(e.sample) === "positive")
          ) || [];
      Object.values(siteAcm).forEach(e => {
        if (e.immediateRisk) immediateRisk.push(e);
      });
      // No positive samples and no presumed items
      if (presumedAcm.length === 0 && identifiedAcm.length === 0)
        str =
          "No asbestos-containing materials are present or presumed to be present at this site.";
      if (immediateRisk.length > 0) {
        str = `There is an immediate risk to health from the ${andList(
          immediateRisk.map(e => `${e.material} ${e.description}`)
        ).toLowerCase()}. This must be remediated as soon as practicable.`;
      } else {
        str = `There is not an immediate risk to health. However, any activity that disturbs the ${
          identifiedAcm.length > 0 && presumedAcm.length > 0
            ? "identified and presumed "
            : identifiedAcm.length > 0
            ? "identified "
            : "presumed "
        }asbestos-containing materials should be discontinued to prevent exposure to airborne asbestos.`;
      }
    } else {
      str =
        "No asbestos-containing materials are present or presumed to be present at this site.";
    }
    return `<h2>Risk to Health</h2>${str}`;
  } else if (template === 2) {
  } else {
  }
};

export const writeBackground = (job, site, staff, template) => {
  // •	K2 Environmental Ltd was contracted by $CLIENT$ to conduct an asbestos management survey on the DSC3208 locomotive and provide a management plan based on the results
  // •	A site visit was conducted on $SITEDATE$ by $SITEPERSONNEL$
  // •	Clearance works were carried out in February 2019
  // •	This Asbestos Management Plan sets out actions to be taken to manage Asbestos and Asbestos Containing Materials (ACMs) in accordance with the Health and Safety at Work (Asbestos) Regulations 2016

  if (template === 1 || true) {
    let bullets = [];
    bullets.push(
      `K2 Environmental Ltd was contracted by ${
        job.client
      } to conduct an asbestos management survey ${
        site.type === "train"
          ? `on the ${
              site.assetClass && site.assetNumber
                ? `${site.assetClass}${site.assetNumber} locomotive`
                : `${site.siteName} locomotive`
            }`
          : `at ${site.siteName}`
      } and provide an Asbestos Management Plan based on the results`
    );

    let siteVisits = [];
    site.siteVisits &&
      Object.values(site.siteVisits)
        .filter(e => e.type === "mgmt")
        .forEach(e => {
          siteVisits.push(
            `${moment(dateOf(e.date)).format("dddd, D MMMM YYYY")}${
              e.personnel
                ? ` by ${andList(
                    e.personnel.map(s => {
                      let name = s.name;
                      if (staff[s.uid] && staff[s.uid].aanumber)
                        name += ` (${staff[s.uid].aanumber})`;
                      return name;
                    })
                  )}`
                : ""
            }`
          );
        });

    if (siteVisits.length > 0) {
      bullets.push(
        siteVisits.length === 1
          ? `An asbestos management survey was conducted on ${siteVisits[0]}`
          : `Asbestos management surveys were conducted on ${andList(
              siteVisits
            )}`
      );
    }

    // let clearances = [];
    // site.asbestosRemovals &&
    //   Object.values(site.asbestosRemovals).forEach(e => {
    //     clearances.push(moment(dateOf(e.clearanceDate)).format("MMMM YYYY"));
    //   });
    //
    // if (clearances.length > 0) {
    //   bullets.push(
    //     `Clearance works were carried out in ${andList(clearances)}`
    //   );
    // }

    site.asbestosRemovals &&
      site.asbestosRemovals.forEach(rem => {
        bullets.push(
          `${rem.description} was carried out by ${rem.asbestosRemovalist}${
            rem.asbestosRemovalistLicence
              ? ` (${rem.asbestosRemovalistLicence})`
              : ""
          }${
            rem.removalDate
              ? ` on ${moment(dateOf(rem.removalDate)).format("D MMMM YYYY")}`
              : ""
          }${
            rem.issueDate
              ? ` (Clearance issued on ${moment(dateOf(rem.issueDate)).format(
                  "D MMMM YYYY"
                )})`
              : ""
          }`
        );
      });

    bullets.push(
      `This Asbestos Management Plan sets out actions to be taken to manage Asbestos and Asbestos-Containing Materials (ACMs) in accordance with the Health and Safety at Work (Asbestos) Regulations 2016`
    );

    return `<h2>Background</h2><ul>${bullets
      .map(e => `<li>${e}</li>`)
      .join("")}</ul>`;
  } else if (template === 2) {
  } else {
  }
};

export const writeRecommendations = (job, siteAcm, template) => {
  if (template === 1 || true) {
    if (siteAcm) {
      let immediateRisk = [],
        acmGroups = [],
        sampledAcm = Object.values(siteAcm).filter(e => e.idKey === "i") || [],
        identifiedAcm =
          Object.values(siteAcm).filter(
            e =>
              e.idKey === "i" &&
              e.sample &&
              e.sample.result &&
              getBasicResult(e.sample) === "positive" &&
              e.acmRemoved !== true
          ) || [],
        presumedAcm =
          Object.values(siteAcm).filter(
            e =>
              (e.idKey === "p" || e.idKey === "s") &&
              e.acmRemoved !== true &&
              (!e.sample ||
                !e.sample.result ||
                getBasicResult(e.sample) === "positive")
          ) || [];
      // No positive samples and no presumed items, remove section
      if (presumedAcm.length === 0 && identifiedAcm.length === 0) return null;

      let str = `<h2>Immediate Actions Required</h2>`,
        sections = [],
        sectionStr = "";

      // Check if immediate remediation needed
      let genericRoom = false,
        immediateRiskRooms = {};
      Object.values(siteAcm).forEach(e => {
        if (e.immediateRisk) {
          if (e.room && e.room.value === "generic") genericRoom = true;
          else if (e.room && e.room.label)
            immediateRiskRooms[e.room.label] = true;
          immediateRisk.push(e);
        }
      });

      if (immediateRisk.length > 0) {
        let roomStr = genericRoom
          ? andList(Object.keys(immediateRiskRooms).concat("other areas"))
          : andList(Object.keys(immediateRiskRooms));

        sectionStr = `<h3>Management of High Risk Materials</h3>`;
        sectionStr += `<ul><li>The ${andList(
          immediateRisk.map(e => `${e.material} ${e.description}`)
        ).toLowerCase()} ${
          immediateRisk.length === 1 ? "presents" : "present"
        } an immediate risk to health and must be remediated as soon as practicable.</li><li>Access to the ${roomStr} should be restricted to persons wearing appropriate PPE and RPE until the risk is remediated.</li></ul>`;
        sections.push(sectionStr);
      }

      // Warning Labels - Find what rooms need it

      sectionStr = `<h3>Asbestos Warning Labels</h3>`;

      let riskRooms = {};
      genericRoom = false;
      identifiedAcm.length > 0 &&
        identifiedAcm.forEach(e => {
          if (e.room && e.room.label) {
            if (e.room.value === "generic") genericRoom = true;
            else riskRooms[e.room.label] = true;
          }
        });

      let roomStr = genericRoom
        ? andList(Object.keys(riskRooms).concat("other areas"))
        : andList(Object.keys(riskRooms));
      sectionStr += `<ul><li>Warning labels must be placed on <i>all</i> access points to the ${roomStr}</li><li>Warning labels must be placed on <i>all</i> ${
        identifiedAcm.length > 0 && presumedAcm.length > 0
          ? "identified and presumed"
          : identifiedAcm.length > 0
          ? "identified"
          : "presumed"
      } asbestos-containing materials</li><li>A general warning needs to be placed at the door to the main cabin.</li></ul>`;
      sections.push(sectionStr);

      // Check if ACD present
      let dustPresent = false;
      identifiedAcm.length > 0 &&
        identifiedAcm.forEach(e => {
          if (e.material && e.material.toLowerCase().includes("dust"))
            dustPresent = true;
        });
      sections.push(
        `<h3>Work Activities</h3><ul><li>Do not perform any activity that will disturb the ${
          dustPresent ? "asbestos-contaminated dust or " : ""
        } asbestos-containing materials including:<ul><li>Drilling, sanding</li>${
          dustPresent ? "<li>Vacuuming or sweeping</li>" : ""
        }<li>Any other implement that causes the release of airborne asbestos</li></ul></li></ul>`
      );
      sections.push(
        `<h3>Training and Inductions</h3><ul>Train and induct any employees or occupants of the risk<ul><li>An Asbestos Awareness Course is required training for all people that are on site full time</li><li>Any person coming on site to work must be inducted; they must be aware of the hazard</li></ul></li></ul>`
      );
      str += sections.join("\n\n");

      // Removal or Treatment of Asbestos
      let str2 = `<h2>Removal or Treatment of Asbestos</h2>`;
      let acmMaterials = {};
      sections = [];

      identifiedAcm
        .concat(presumedAcm)
        .filter(e => e.sampleType !== "air")
        .forEach(e => {
          // First see what rooms each material is in
          if (e.material || e.description) {
            if (e.room && e.room.label) {
              let room = e.room.label;
              if (e.room.uid === "generic") room = "other areas";
              let item = e.genericItem
                ? e.description
                : e.writeItemFirst
                ? `${
                    e.description && e.material
                      ? `${e.description} `
                      : e.description
                  }${e.material && e.material}`
                : `${
                    e.material && e.description ? `${e.material} ` : e.material
                  }${e.description && e.description}`;
              item = item.toLowerCase();
              if (acmMaterials[item]) {
                acmMaterials[item].acm.push(e);
                acmMaterials[item].rooms[room] = true;
              } else {
                acmMaterials[item] = { acm: [e], rooms: { [room]: true } };
              }
            }
          }
        });

      Object.keys(acmMaterials).forEach(e => {
        let managementPrimary = "",
          managementSecondary = "",
          removalLicenceRequired = "",
          material,
          recommendations = "",
          inaccessibleItem = false,
          damage = 0,
          surface = 0,
          accessibility = 0,
          singular = true,
          acmCount = 0;
        console.log(e);
        acmMaterials[e].acm &&
          acmMaterials[e].acm.forEach(acm => {
            console.log(acm);
            if (!acm.singularItem) singular = false;
            if (acm.inaccessibleItem) inaccessibleItem = true;
            if (acm.managementPrimary)
              managementPrimary = acm.managementPrimary;
            if (acm.managementSecondary)
              managementSecondary = acm.managementSecondary;
            material = acm.material;
            if (acm.recommendations) recommendations += acm.recommendations;
            if (acm.removalLicenceRequired)
              removalLicenceRequired = acm.removalLicenceRequired;

            if (acm.damageScore) damage += parseInt(acm.damageScore);
            if (acm.surfaceScore) surface += parseInt(acm.surfaceScore);
            if (acm.accessibility) {
              if (acm.accessibility === "Medium") accessibility += 1;
              else if (acm.accessibility === "Difficult") accessibility += 2;
            }
            acmCount++;
          });

        let genericArea = false;
        let roomList = [];
        acmMaterials[e].rooms &&
          Object.keys(acmMaterials[e].rooms).forEach(room => {
            if (room === "other areas") genericArea = true;
            else roomList.push(room);
          });

        let assessments = [];
        let are = singular ? "is" : "are",
          have = singular ? "has" : "have",
          their = singular ? "its" : "their",
          they = singular ? "It" : "They";

        if (damage / acmCount > 2) assessments.push(`${have} extensive damage`);
        else if (damage / acmCount > 1)
          assessments.push(`${have} moderate damage`);
        else assessments.push(`${are} in good condition`);

        if (surface / acmCount > 2)
          damage / acmCount > 1
            ? assessments.push(
                `${are} highly friable in ${their} current state`
              )
            : assessments.push(`highly friable in ${their} current state`);
        else if (surface / acmCount > 1)
          damage / acmCount > 1
            ? assessments.push(
                `${are} moderately friable in ${their} current state`
              )
            : assessments.push(`moderately friable in ${their} current state`);
        else
          damage / acmCount > 1
            ? assessments.push(`${are} non-friable in ${their} current state`)
            : assessments.push(`non-friable in ${their} current state`);

        if (accessibility / acmCount > 2)
          damage / acmCount > 1
            ? assessments.push(`${are} difficult to access`)
            : assessments.push(`difficult to access`);
        else if (surface / acmCount > 1)
          damage / acmCount > 1
            ? assessments.push(`${are} moderately accessible`)
            : assessments.push(`moderately accessible`);
        else
          damage / acmCount > 1
            ? assessments.push(`${are} easily accessible`)
            : assessments.push(`easily accessible`);

        sectionStr = `<h3>${titleCase(e)}</h3><ul>`;
        if (inaccessibleItem) {
          sectionStr += `<li>The ${e} was inaccessible at the time of the survey and must be presumed to contain asbestos-containing materials</li><li>The area should be treated with caution until an inspection can be made<li>`;
        } else {
          sectionStr += `<li>The ${e} ${are} present ${
            genericArea ? `throughout the site` : `in the ${andList(roomList)}`
          }</li>`;
          sectionStr += `<li>${they} ${andList(
            assessments
          ).toLowerCase()}</li>`;
          if (recommendations && recommendations !== "") {
            if (recommendations.substring(0, 4) === "<ul>")
              recommendations = recommendations.slice(4, -5);
            console.log(recommendations);
            sectionStr += recommendations;
          } else {
            if (managementPrimary === "Removal") {
              sectionStr += `<li>Removal is recommended to eliminate any potential risk.`;
              if (removalLicenceRequired === "Class A") {
                sectionStr += ` The removalist <strong style="color: red">must</strong> hold a Class A Asbestos Removalist licence.`;
              } else if (removalLicenceRequired === "Class B") {
                sectionStr += ` The removalist must hold a Class A or B Asbestos Removalist licence.`;
              } else if (removalLicenceRequired === "Unlicensed") {
                sectionStr += ` The ${
                  singular ? "item" : "material"
                } can be removed by a competent person following best practices.`;
              }
              sectionStr += `</li>`;
            } else if (managementPrimary === "Seal") {
              sections += `<li>Paint or seal any visible damage to prevent fibre release.</li>`;
            }
          }
          sectionStr += `</ul>`;
        }
        sections.push(sectionStr);
      });
      str2 += sections.join("\n\n");

      console.log({
        immediateActionsRequired: str,
        removalOrTreatmentOfAsbestos: str2
      });

      return {
        immediateActionsRequired: str,
        removalOrTreatmentOfAsbestos: str2
      };
    } else {
      return null;
    }
  }
};

export const writeAssetOverview = ({ site, job, classDescriptions }) => {
  // DC4260 is a DC Class Diesel Locomotive managed by KiwiRail
  // It was manufactured by General Motors (EMD), Canada in 1967
  // The locomotive was overhauled and modified with Low Cab at Clyde Engineering, South Australia in May 1979 and repainted at KiwiRail Worburn Railway Workshops in 2008
  let assetDescription = "";
  classDescriptions.forEach(c => {
    if (c.label === site.assetClass) assetDescription = c.description;
  });
  if ("aeiou".includes(site.assetClass[0]))
    assetDescription = `an ${site.assetClass} Class ${assetDescription}`;
  else assetDescription = `a ${site.assetClass} Class ${assetDescription}`;
  let bullets = [];
  bullets.push(
    `${site.assetClass}${site.assetNumber} is ${assetDescription} managed by ${job.client}`
  );
  bullets.push(
    `It was manufactured by ${site.manufacturedBy}, ${site.countryOfOrigin} in ${site.manufactureYear}`
  );
  bullets.push(site.notesOnModification);
  return `<ul>${bullets.map(e => `<li>${e}</li>`).join("")}</ul>`;
};

export const writeRiskOverview = (job, siteAcm) => {
  // There is not an immediate risk to health. However, any activity that disturbs the asbestos-containing materials should be discontinued to prevent exposure to airborne asbestos.
  let riskToHealthStr = "",
    immediateActionsRequiredStr = "",
    shortTermActionsStr = "";
  if (siteAcm) {
    let immediateRisk = [],
      immediateActionsRequired = [],
      shortTermActions = [],
      acmGroups = [],
      sampledAcm = Object.values(siteAcm).filter(e => e.idKey === "i") || [],
      identifiedAcm =
        Object.values(siteAcm).filter(
          e =>
            e.idKey === "i" &&
            e.sample &&
            e.sample.result &&
            getBasicResult(e.sample) === "positive" &&
            e.acmRemoved !== true
        ) || [],
      presumedAcm =
        Object.values(siteAcm).filter(
          e =>
            (e.idKey === "p" || e.idKey === "s") &&
            e.acmRemoved !== true &&
            (!e.sample ||
              !e.sample.result ||
              getBasicResult(e.sample) === "positive")
        ) || [];
    Object.values(siteAcm).forEach(e => {
      let label =
        e.description && e.material
          ? e.description.toLowerCase().includes(e.material.toLowerCase())
            ? e.description
            : e.writeItemFirst
            ? `${e.description || ""} ${e.material || ""}`
            : `${e.material || ""} ${e.description || ""}`
          : e.description
          ? e.description
          : e.material || "no description";
      label = label.toLowerCase();
      if (e.immediateRisk) immediateRisk.push(e);
      if (e.immediateActionRequired) {
        if (e.immediateActionRequired === "Removal") {
          if (e.removalLicenceRequired === "Class A") {
            immediateActionsRequired.push(
              `Removal of the ${label} (Class A removal)`
            );
          } else if (e.removalLicenceRequired === "Class B") {
            immediateActionsRequired.push(
              `Removal of the ${label} (Class B removal)`
            );
          } else if (e.removalLicenceRequired === "Unlicensed") {
            immediateActionsRequired.push(
              `Removal of the ${label} (Unlicensed removal)`
            );
          } else immediateActionsRequired.push(`Removal of the ${label}`);

          // } else if (e.immediateActionRequired === "Deferral") {
          //   immediateActionsRequired.push(`Deferral of the ${label}`);
        } else if (e.immediateActionRequired === "Sealing") {
          immediateActionsRequired.push(`Sealing of the ${label}`);
        } else if (e.immediateActionRequired === "Encapsulate") {
          immediateActionsRequired.push(`Encapsulation of the ${label}`);
        } else if (e.immediateActionRequired === "Enclosure") {
          immediateActionsRequired.push(`Enclosure of the ${label}`);
        } else if (e.immediateActionRequired === "Further Inspection") {
          immediateActionsRequired.push(
            `Arrange further inspection of the ${label}`
          );
        } else if (e.immediateActionRequired === "Test") {
          immediateActionsRequired.push(
            `Arrange further inspection of the ${label}`
          );
        }
      } else if (e.immediateRisk)
        immediateActionsRequired.push(`Removal of the ${label}`);
      if (e.shortTermActionText) shortTermActions.push(e.shortTermActionText);
      else if (e.shortTermAction) {
        if (e.shortTermAction === "Removal") {
          if (e.removalLicenceRequired === "Class A") {
            shortTermActions.push(`Removal of the ${label} (Class A removal)`);
          } else if (e.removalLicenceRequired === "Class B") {
            shortTermActions.push(`Removal of the ${label} (Class B removal)`);
          } else if (e.removalLicenceRequired === "Unlicensed") {
            shortTermActions.push(
              `Removal of the ${label} (Unlicensed removal)`
            );
          } else shortTermActions.push(`Removal of the ${label}`);

          // } else if (e.shortTermAction === "Deferral") {
          //   shortTermActions.push(`Deferral of the ${label
          //   }`);
        } else if (e.shortTermAction === "Sealing") {
          shortTermActions.push(`Sealing of the ${label}`);
        } else if (e.shortTermAction === "Encapsulate") {
          shortTermActions.push(`Encapsulation of the ${label}`);
        } else if (e.shortTermAction === "Enclosure") {
          shortTermActions.push(`Enclosure of the ${label}`);
        } else if (e.shortTermAction === "Further Inspection") {
          shortTermActions.push(`Arrange further inspection of the ${label}`);
        } else if (e.shortTermAction === "Test") {
          shortTermActions.push(`Arrange further inspection of the ${label}`);
        }
      }
    });
    // No positive samples and no presumed items
    if (presumedAcm.length === 0 && identifiedAcm.length === 0)
      riskToHealthStr =
        "No asbestos-containing materials are present or presumed to be present at this site.";
    if (immediateRisk.length > 0) {
      riskToHealthStr = `There is an immediate risk to health from the ${andList(
        immediateRisk.map(e => `${e.material} ${e.description}`)
      ).toLowerCase()}. This must be remediated as soon as practicable.`;
    } else {
      riskToHealthStr = `There is not an immediate risk to health. However, if any ${
        identifiedAcm.length > 0 && presumedAcm.length > 0
          ? "identified and presumed "
          : identifiedAcm.length > 0
          ? "identified "
          : "presumed "
      }asbestos-containing materials are damaged or disturbed during maintenance or otherwise, this is likely to release respirable asbestos fibres.`;
    }
    if (immediateActionsRequired.length > 0)
      immediateActionsRequiredStr = `<ul>${immediateActionsRequired
        .map(a => `<li>${a}</li>`)
        .join("")}</ul>`;
    else immediateActionsRequiredStr = "No immediate actions are required.";
    if (shortTermActions.length > 0)
      shortTermActionsStr = `<ol>${shortTermActions
        .map(a => `<li>${a}</li>`)
        .join("")}</ol>`;
    else shortTermActionsStr = "No short-term actions are required.";
  } else {
    riskToHealthStr =
      "No asbestos-containing materials are present or presumed to be present at this site.";
    immediateActionsRequiredStr = "No immediate actions are required.";
    shortTermActionsStr = "No short term actions are required.";
  }
  return { riskToHealthStr, immediateActionsRequiredStr, shortTermActionsStr };
};

export const writeSiteVisitAndRemovalHistory = ({ site, staff }) => {
  let dates = [];
  site.siteVisits.forEach(c => {
    if (c.type === "mgmt")
      dates.push({
        date: dateOf(c.date),
        dateFormatted: moment(dateOf(c.date)).format("DD/MM/YYYY"),
        desc: `An asbestos management survey was conducted by ${andList(
          c.personnel.map(
            s =>
              `${s.name}${
                staff[s.uid].tertiary || staff[s.uid].ip402
                  ? ` (${staff[s.uid].tertiary}${
                      staff[s.uid].ip402 ? `, BOHS IP402` : ""
                    })`
                  : ""
              }`
          )
        )} of K2 Environmental Ltd`
      });
    else if (c.type !== "stg4")
      dates.push({
        date: dateOf(c.date),
        dateFormatted: moment(dateOf(c.date)).format("DD/MM/YYYY"),
        desc: `A site visit was conducted by ${andList(
          c.personnel.map(
            s =>
              `${s.name}${
                staff[s.uid].tertiary ||
                staff[s.uid].ip402 ||
                staff[s.uid].aanumber
                  ? ` (${staff[s.uid].tertiary}${
                      staff[s.uid].ip402 ? `, BOHS IP402` : ""
                    }${
                      staff[s.uid].aanumber ? `, ${staff[s.uid].aanumber}` : ""
                    })`
                  : ""
              }`
          )
        )} of K2 Environmental Ltd`
      });
  });
  site.asbestosRemovals &&
    Object.values(site.asbestosRemovals).forEach(c => {
      dates.push({
        date: dateOf(c.removalDate),
        dateFormatted: moment(dateOf(c.removalDate)).format("DD/MM/YYYY"),
        desc: `${c.description} by ${c.asbestosRemovalist} (${c.asbestosRemovalistLicence})`
      });
      dates.push({
        date: dateOf(c.clearanceDate),
        dateFormatted: moment(dateOf(c.clearanceDate)).format("DD/MM/YYYY"),
        desc: `An asbestos removal clearance was given by ${andList(
          c.personnel.map(
            s =>
              `${s.name}${
                staff[s.uid].tertiary || staff[s.uid].aanumber
                  ? ` (${staff[s.uid].tertiary}, ${staff[s.uid].aanumber})`
                  : ""
              }`
          )
        )}`
      });
    });
  return dates.sort((a, b) => a.date - b.date);
};

export const writeAcmSummary = registerMap => {
  console.log(registerMap);
  let acmSummary = [];
  registerMap.forEach(roomGroup => {
    roomGroup.rows.forEach(room => {
      let roomAcm = [];
      room.rows.forEach(row => {
        console.log(row);
        if (!row.acmRemoved && row.asbestosResult) {
          roomAcm.push(
            `${row.label[0].toUpperCase()}${row.label
              .slice(1)
              .toLowerCase()} (${
              row.idKey === "i"
                ? "identified"
                : row.idKey === "s"
                ? "strongly presumed"
                : "presumed"
            })`.toLowerCase()
          );
        }
      });
      if (roomAcm.length > 0) {
        if (room.label.includes("General") || room.label.includes("Generic")) {
          acmSummary.push({
            label: "General Items",
            summary: `${roomAcm.join(
              "@~"
            )}@~Gaskets and electrical components such as switches, fuse insulation, etc. (presumed)`
          });
        } else
          acmSummary.push({
            label: room.label,
            summary: roomAcm
              .map(e => `${e[0].toUpperCase()}${e.slice(1)}`)
              .join("@~")
          });
      }
    });
  });
  console.log(acmSummary);
  return acmSummary;
};

export const issueTrainAmp = ({
  site,
  job,
  registerMap,
  registerList,
  airMonitoringRecords,
  staff,
  siteAcm,
  classDescriptions
}) => dispatch => {
  console.log(site);
  console.log(job);
  console.log(registerMap);
  console.log(registerList);
  console.log(airMonitoringRecords);
  let latestIssue = 0;

  if (job.versions && Object.keys(job.versions).length > 0) {
    latestIssue = Math.max(
      ...Object.keys(job.versions).map(key => parseInt(key))
    );
  }

  // Basic Fields for Every Report
  let versionHistory = [];
  if (latestIssue > 1) {
    Object.values(job.versions).forEach((v, index) => {
      let authors = {
        writer: [],
        checker: [],
        ktp: []
      };
      ["writer", "checker", "ktp"].forEach(field => {
        console.log(v[field]);
        if (v[field]) {
          v[field].forEach(s => {
            authors[field].push(s.name);
          });
        }
      });
      versionHistory.push({
        issueNumber: index + 1,
        changes: v.changes,
        date: moment(dateOf(v.date)).format("DD/MM/YYYY"),
        writer: authors.writer.join("\n"),
        checker: authors.checker.join("\n"),
        ktp: authors.ktp.join("\n")
      });
    });
  }

  let authors = {
    writer: [],
    checker: [],
    ktp: []
  };
  if (job.versions && job.versions[`${latestIssue}`]) {
    let version = job.versions[`${latestIssue}`];
    ["writer", "checker", "ktp"].forEach(field => {
      if (version[field]) {
        version[field].forEach(s => {
          authors[field].push({
            name: s.name,
            asbestosAssessorNumber: staff[s.uid] ? staff[s.uid].aanumber : "",
            tertiary: staff[s.uid] ? staff[s.uid].tertiary : "",
            ip402: staff[s.uid] ? staff[s.uid].ip402 : false
          });
        });
      }
    });
  }

  let surveyPersonnel = [],
    surveyDates = [];
  if (site.siteVisits) {
    Object.values(site.siteVisits).forEach(v => {
      if (v.referenceNumber === job.jobNumber) {
        v.date && surveyDates.push(v.date);
        v.personnel &&
          v.personnel.forEach(s => {
            surveyPersonnel.push({
              name: s.name,
              asbestosAssessorNumber: staff[s.uid] ? staff[s.uid].aanumber : "",
              tertiary: staff[s.uid] ? staff[s.uid].tertiary : "",
              ip402: staff[s.uid] ? staff[s.uid].ip402 : false
            });
          });
      }
    });
  }

  let riskOverview = writeRiskOverview(job, siteAcm);

  let json = {
    client: job.client,
    assetName: `${site.assetClass}${site.assetNumber}`,
    assetClass: site.assetClass,
    assetNumber: site.assetNumber,
    jobNumber: job.jobNumber,
    issueNumber: latestIssue,
    assetOverview: writeAssetOverview({ site, job, classDescriptions }),
    immediateActionsRequired: riskOverview.immediateActionsRequiredStr,
    shortTermActions: riskOverview.shortTermActionsStr,
    riskToHealth: riskOverview.riskToHealthStr,
    acmSummary: writeAcmSummary(registerMap),
    siteVisits: writeSiteVisitAndRemovalHistory({ site, staff }),
    writer:
      authors["writer"].length > 0
        ? authors["writer"].map(e => nameFullQuals(e)).join("\n\n")
        : "",
    checker:
      authors["checker"].length > 0
        ? authors["checker"].map(e => nameFullQuals(e)).join("\n\n")
        : "",
    ktp:
      authors["ktp"].length > 0
        ? authors["ktp"].map(e => nameFullQuals(e)).join("\n\n")
        : "",
    surveyPersonnel: surveyPersonnel
      .map(e => nameFullQualsOneLine(e))
      .join("\n"),
    surveyDates: writeDates(surveyDates.map(date => ({ date })), "date"),
    siteImageUrl:
      site.siteImageUrl.substring(0, site.siteImageUrl.lastIndexOf("&token")) ||
      null,
    asbestosRemovalRecords: site.clearances
      ? Object.values(site.clearances).map(c => ({
          asbestosRemovalist: c.asbestosRemovalist,
          asbestosRemovalistLicence: c.asbestosRemovalistLicence,
          removalDate: c.removalDate
            ? moment(dateOf(c.removalDate)).format("DD MMMM YYYY")
            : "",
          description: c.description,
          clearanceDate: c.clearanceDate
            ? moment(dateOf(c.clearanceDate)).format("DD MMMM YYYY")
            : "",
          asbestosAssessorName: c.personnel
            ? c.personnel
                .map(p => `${p.name} (K2 Environmental Ltd)`)
                .join("\n")
            : "",
          asbestosAssessorLicence: c.personnel
            ? c.personnel.map(p => staff[p.uid].aanumber).join("\n")
            : "",
          issueDate: c.issueDate
            ? moment(dateOf(c.issueDate)).format("DD MMMM YYYY")
            : ""
        }))
      : "",
    versionHistory,
    airMonitoringRecords,
    registerMap
  };

  console.log(json);
  dispatch(
    handleJobChange({
      job,
      o1: "issues",
      field: `${latestIssue}`,
      val: json,
      siteUid: site.uid
    })
  );
};
