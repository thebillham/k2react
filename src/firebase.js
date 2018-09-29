import firebase from 'firebase'
const config = {
  apiKey: "AIzaSyDDKJ9pXS7mSHs-Ay8Rw2szoHbyIGnPfiw",
  authDomain: "k2flutter-f03a1.firebaseapp.com",
  databaseURL: "https://k2flutter-f03a1.firebaseio.com",
  projectId: "k2flutter-f03a1",
  storageBucket: "k2flutter-f03a1.appspot.com",
  messagingSenderId: "303642156934"
};
firebase.initializeApp(config);
var p = new firebase.auth.GoogleAuthProvider();
p.setCustomParameters({
  prompt: 'select_account'
});
export const provider = p;
export const auth = firebase.auth();
export default firebase;
