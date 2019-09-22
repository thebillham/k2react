import { docsRef, noticesRef, noticeReadsRef } from "../config/firebase";

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
