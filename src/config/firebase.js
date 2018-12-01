import * as firebase from 'firebase';

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
const database = firebase.firestore();
database.settings({timestampsInSnapshots: true})
const usersRef = database.collection("users");
const asbestosSamplesRef = database.collection("samplesasbestos");
const jobsRef = database.collection("jobheaders");
const cocsRef = database.collection("cocs");
const vehiclesRef = database.collection("vehicles");
const docsRef = database.collection("documents");
const modulesRef = database.collection("modules");
const toolsRef = database.collection("tools");
const noticesRef = database.collection("notices");
const quizzesRef = database.collection("quizzes");
const questionsRef = database.collection("questions");
const trainingPathsRef = database.collection("trainingpaths");
const methodsRef = database.collection("methods");
const helpRef = database.collection("help");
const updateRef = database.collection("updates");

export { app, provider, auth, database, storage };
export { usersRef, docsRef, modulesRef, toolsRef,
  noticesRef, quizzesRef, questionsRef, trainingPathsRef,
  methodsRef, asbestosSamplesRef, jobsRef, helpRef, updateRef,
  cocsRef, vehiclesRef };
export default firebase;
