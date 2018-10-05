import * as firebase from 'firebase';

let config = {
  apiKey: "AIzaSyDDKJ9pXS7mSHs-Ay8Rw2szoHbyIGnPfiw",
  authDomain: "k2flutter-f03a1.firebaseapp.com",
  databaseURL: "https://k2flutter-f03a1.firebaseio.com",
  projectId: "k2flutter-f03a1",
  storageBucket: "k2flutter-f03a1.appspot.com",
  messagingSenderId: "303642156934"
};
const app = firebase.initializeApp(config);
var p = new firebase.auth.GoogleAuthProvider();
p.setCustomParameters({
  prompt: 'select_account'
});

const provider = p;
const auth = firebase.auth();
const storage = firebase.storage();
const database = firebase.firestore();
database.settings({timestampsInSnapshots: true})
export { app, provider, auth, database, storage };
export default firebase;
