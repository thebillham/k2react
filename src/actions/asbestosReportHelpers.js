import moment from "moment";
import { sentenceCase, dateOf, andList } from "./helpers";
import { writeResult, getBasicResult } from "./asbestosLab";

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
          let roomTable = { label: room.label || "", rows: [] },
            rows = [],
            roomName = room.label;
          console.log(room);
          room.acm &&
            room.acm.forEach(acmUid => {
              let acm = siteAcm[acmUid];
              if (acm.sampleType !== "air") {
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
                    row.recommendation = getAcmRemoved(acm);
                  } else {
                    row.accessibility = acm.accessibility || "N/A";
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
              } else if (acm.sample) {
                console.log(acm);
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
                  fibreResult: acm.sample.fibreResult || "N/A",
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

export const getRecommendation = acm => {
  let str = "N/A";
  if (acm.managementPrimary) {
    if (acm.managementPrimary === "Removal") {
      if (acm.removalLicenceRequired === "Class A") {
        str = "REM-A";
      } else if (acm.removalLicenceRequired === "Class B") {
        str = "REM-B";
      } else if (acm.removalLicenceRequired === "Unlicenced") {
        str = "REM-U";
      } else str = "REM";
    } else if (acm.managementPrimary === "Deferral") {
      str = "DEFER";
    } else if (acm.managementPrimary === "Sealing") {
      str = "SEAL";
    } else if (acm.managementPrimary === "Encapsulate") {
      str = "ENCAP";
    } else if (acm.managementPrimary === "Enclosure") {
      str = "ENCL";
    } else if (acm.managementPrimary === "Test") {
      str = "TEST";
    }
  }
  return str;
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
  console.log(template);
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

  console.log(latestIssue);

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
        no: index,
        changes: v.changes,
        date: moment(dateOf(v.date)).format("DD MM YYYY"),
        writer: andList(authors.writer.map(e => e.name)),
        checker: andList(authors.checker.map(e => e.name)),
        ktp: andList(authors.ktp.map(e => e.name)),
        writerFull: authors.writer.map(e => nameFullQuals(e)).join("\n\n"),
        checkerFull: authors.checker.map(e => nameFullQuals(e)).join("\n\n"),
        ktpFull: authors.ktp.map(e => nameFullQuals(e)).join("\n\n")
      });
    });
  }

  let json = {
    client: job.client,
    address: job.address,
    jobNumber: job.jobNumber,
    issueNumber: latestIssue,
    issueDate: moment().format("d MMMM YYYY"),
    versionNumber: job.latestVersion + 1 || 1,
    versionHistory
  };
  if (template.includes("AMP")) {
    let sitePersonnel = [],
      siteVisits = [];
    if (site.siteVisitsAsbestos) {
      Object.values(site.siteVisitsAsbestos).forEach(v => {
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
    let writer = [],
      checker = [],
      ktp = [];
    if (job.versions && job.versions[`${latestIssue}`]) {
      let version = job.versions[`${latestIssue}`];
      ["writer", "checker", "ktp"].forEach(field => {
        if (version[field]) {
          version[field].forEach(s => {
            [field].push({
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
      reportAuthor: andList(writer.map(e => nameTertiaryIp402(e))),
      reportChecker: andList(checker.map(e => nameTertiaryIp402(e))),
      reportKtp: andList(ktp.map(e => nameTertiaryIp402(e)))
    };
  }
  console.log(json);
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
      let immediateRisk = false;
      let bullets = [],
        acmGroups = [],
        sampledAcm = Object.values(siteAcm).filter(e => e.idKey === "i") || [],
        identifiedAcm =
          Object.values(siteAcm).filter(
            e =>
              e.idKey === "i" &&
              e.sample &&
              e.sample.result &&
              getBasicResult(e.sample) === "positive"
          ) || [],
        presumedAcm =
          Object.values(siteAcm).filter(
            e => e.idKey === "p" || e.idKey === "s"
          ) || [];
      Object.values(siteAcm).forEach(e => {
        if (e.immediateRisk) immediateRisk = true;
      });
      // No positive samples and no presumed items
      if (presumedAcm.length === 0 && identifiedAcm.length === 0) return null;
      if (identifiedAcm.length > 0) {
        // Positive samples and presumed items
        if (presumedAcm.length > 0) {
          let presumedRooms = {},
            presumedGeneric = false;
          presumedAcm.forEach(e => {
            // This needs to be expanded to cover rooms with the same name
            if (e.room && e.room.label) {
              if (e.room.uid === "generic") presumedGeneric = true;
              else presumedRooms[e.room.label] = true;
            }
          });
          if (presumedGeneric) presumedRooms["other areas"] = true;
          console.log(presumedRooms);
          if (Object.keys(presumedRooms).length > 0)
            bullets.push(
              `The presumed asbestos-containing materials in the ${sentenceCase(
                andList(Object.keys(presumedRooms))
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
      }

      return `<ul>${bullets.map(e => `<li>${e}</li>`)}</ul>`;
    } else {
      return null;
    }
  } else if (template === 2) {
  } else {
  }
};
