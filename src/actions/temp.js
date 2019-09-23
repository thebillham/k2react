import { docsRef, noticesRef, noticeReadsRef, firebase, asbestosSamplesRef, firestore, asbestosWASubsamplesRef } from "../config/firebase";
import moment from 'moment';

export const fixIds = () => dispatch => {
  //console.log("Running fixIds");
  docsRef.get().then(docSnap => {
    docSnap.forEach(doc => {
      if (doc.id.includes(":")) {
        // var id = doc.id.replace(":", "-");
        // //console.log("Changing id " + doc.id + " to " + id);
        // //console.log("Deleting document " + doc.id);
        // //console.log("Deleting document " + doc.id);
        // var data = doc.data();
        // docsRef.doc(id).set(data);
        docsRef.doc(doc.id).delete();
      }
    });
  });
};

export const transferNoticeboardReads = () => {
  noticesRef
    .get().then(querySnapshot => {
      var notices = [];
      querySnapshot.forEach(doc => {
        let notice = doc.data();
        if (notice.staff) {
          notice.staff.forEach(staff => {
            console.log(`Adding ${staff} to ${notice.uid}`);
            noticeReadsRef.add({
              noticeUid: notice.uid,
              staffUid: staff,
              date: new Date(),
            });
          });
        }
      });
    });
}

// export const restructureWAAnalysisSamples = () => {
//   console.log('Restructuring....');
//   asbestosSamplesRef.get().then(querySnapshot => {
//     let batch = firestore.batch();
//     querySnapshot.forEach(sampleDoc => {
//       let sample = sampleDoc.data();
//       // console.log(sample);
//       if (sample.waSoilAnalysis !== undefined) {
//         batch.update(asbestosSamplesRef.doc(sample.uid), {
//           layers: firebase.firestore.FieldValue.delete(),
//           waLayerNum: firebase.firestore.FieldValue.delete(),
//         });
//         if (sample.waSoilAnalysis.formDescription !== undefined)
//           batch.update(asbestosSamplesRef.doc(sample.uid), {
//             waAnalysisFormDescription: sample.waSoilAnalysis.formDescription,
//           });
//         if (sample.waSoilAnalysis.fractiongt7WeightAshed !== undefined)
//           batch.update(asbestosSamplesRef.doc(sample.uid), {
//             waAnalysisWeightAshedGt7: sample.waSoilAnalysis.fractiongt7WeightAshed,
//           });
//         if (sample.waSoilAnalysis.fractionto7WeightAshed !== undefined)
//           batch.update(asbestosSamplesRef.doc(sample.uid), {
//             waAnalysisWeightAshedTo7: sample.waSoilAnalysis.fractionto7WeightAshed,
//           });
//         if (sample.waSoilAnalysis.fractionlt2WeightAshed !== undefined)
//           batch.update(asbestosSamplesRef.doc(sample.uid), {
//             waAnalysisWeightAshedLt2: sample.waSoilAnalysis.fractionlt2WeightAshed,
//           });
//         if (sample.waSoilAnalysis.fractionlt2WeightAshedSubsample !== undefined)
//           batch.update(asbestosSamplesRef.doc(sample.uid), {
//             waAnalysisWeightAshedLt2Subsample: sample.waSoilAnalysis.fractionlt2WeightAshedSubsample,
//           });
//         let subsamples = [];
//         Object.keys(sample.waSoilAnalysis).forEach(key => {
//           console.log(key.slice(0, 11));
//           if (key.slice(0, 11) == 'subfraction' &&
//             (sample.waSoilAnalysis[key].concentration !== undefined ||
//              sample.waSoilAnalysis[key].containerID !== undefined ||
//              sample.waSoilAnalysis[key].form !== undefined ||
//              sample.waSoilAnalysis[key].tareWeight !== undefined ||
//              sample.waSoilAnalysis[key].weight !== undefined)
//             ) {
//             console.log(key.slice(11, 14));
//             let subsample = {
//               ...sample.waSoilAnalysis[key],
//               fraction: key.slice(11, 14),
//             };
//             subsamples.push(subsample);
//           }
//         });
//         if (subsamples.length > 0) {
//           batch.update(asbestosSamplesRef.doc(sample.uid), {
//             waAnalysisSubsamples: subsamples,
//           });
//         }
//       }
//     });
//     batch.commit();
//   })
// }

export const restructureWAAnalysisSamples = () => {
  console.log('Restructuring....');
  asbestosSamplesRef.get().then(querySnapshot => {
    let batch = firestore.batch();
    querySnapshot.forEach(sampleDoc => {
      let sample = sampleDoc.data();
      // console.log(sample);
      if (sample.waAnalysisSubsamples !== undefined && sample.waAnalysisSubsamples.length > 0) {
        sample.waAnalysisSubsamples.forEach(subsample => {
          let containerID = 'XXX';
          let fraction = '-';
          let form = 'fff';
          if (subsample.containerID !== undefined) containerID = subsample.containerID;
          if (subsample.fraction !== undefined) fraction = subsample.fraction;
          if (subsample.form !== undefined) form = subsample.form;
          subsample.sampleUid = sample.uid;
          subsample.jobNumber = sample.jobNumber;
          subsample.cocUid = sample.cocUid;
          let uid = `${sample.jobNumber}-${sample.sampleNumber}-${containerID}-${fraction}-${form}-CREATED-${moment().format('x')}-${Math.round(
            Math.random() * 1000
          )}`;
          batch.set(asbestosWASubsamplesRef.doc(uid), subsample);
        });
      }
    });
    batch.commit();
  })
}
