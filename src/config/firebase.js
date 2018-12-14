import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';

const FirebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: process.env.REACT_APP_GOOGLE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_GOOGLE_DATABASE_URL,
  projectId: process.env.REACT_APP_GOOGLE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_GOOGLE_SENDER_ID
};

const app = firebase.initializeApp(FirebaseConfig);
var p = new firebase.auth.GoogleAuthProvider();
p.setCustomParameters({
  prompt: 'select_account'
});
p.addScope('https://www.googleapis.com/auth/calendar');

const provider = p;
const auth = firebase.auth();
const storage = firebase.storage();
const firestore = firebase.firestore();
firestore.settings({timestampsInSnapshots: true})
const usersRef = firestore.collection("users");
const asbestosSamplesRef = firestore.collection("samplesasbestos");
const jobsRef = firestore.collection("jobheaders");
const cocsRef = firestore.collection("cocs");
const vehiclesRef = firestore.collection("vehicles");
const docsRef = firestore.collection("documents");
const modulesRef = firestore.collection("modules");
const toolsRef = firestore.collection("tools");
const noticesRef = firestore.collection("notices");
const quizzesRef = firestore.collection("quizzes");
const questionsRef = firestore.collection("questions");
const trainingPathsRef = firestore.collection("trainingpaths");
const methodsRef = firestore.collection("methods");
const helpRef = firestore.collection("help");
const updateRef = firestore.collection("updates");
const asbestosAnalysisRef = firestore.collection("analysisasbestos");

export { app, provider, auth, firestore, storage, firebase };
export { usersRef, docsRef, modulesRef, toolsRef,
  noticesRef, quizzesRef, questionsRef, trainingPathsRef,
  methodsRef, asbestosSamplesRef, jobsRef, helpRef, updateRef,
  cocsRef, vehiclesRef, asbestosAnalysisRef,  };
export default firebase;
