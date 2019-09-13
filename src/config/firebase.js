import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

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
  prompt: "select_account"
});
p.addScope("https://www.googleapis.com/auth/calendar");

const firestore = firebase.firestore();

const provider = p;
const auth = firebase.auth();
const storage = firebase.storage();

const appSettingsRef = firestore.collection("appsettings");
const asbestosAnalysisRef = firestore.collection("lab").doc("asbestos").collection("analysis");
const asbestosSamplesRef = firestore.collection("lab").doc("asbestos").collection("samples");
const asbestosSampleLogRef = firestore.collection("lab").doc("asbestos").collection("sampleLog");
const cocsRef = firestore.collection("lab").doc("asbestos").collection("cocs");
const logsRef = firestore.collection("logs").doc("logs");
const assetsRef = firestore.collection("inventory").doc("entities").collection("assets");
const modelsRef = firestore.collection("inventory").doc("categories").collection("models");
const manufacturersRef = firestore.collection("inventory").doc("categories").collection("manufacturers");
const constRef = firestore.collection("appsettings").doc("constants");
const docsRef = firestore.collection("documents");
const geocodesRef = firestore.collection("state").doc("geocodes");
const helpRef = firestore.collection("help");
const incidentsRef = firestore.collection("incidents");
const jobsRef = firestore.collection("jobs");
const methodsRef = firestore.collection("methods");
const modulesRef = firestore.collection("modules");
const noticesRef = firestore.collection("notices");
const questionsRef = firestore.collection("questions");
const quizzesRef = firestore.collection("quizzes");
const sitesRef = firestore.collection("sites");
const stateRef = firestore.collection("state");
const toolsRef = firestore.collection("tools");
const trainingPathsRef = firestore.collection("trainingpaths");
const updateRef = firestore.collection("updates");
const usersRef = firestore.collection("users");
const vehiclesRef = firestore.collection("vehicles");

// Test collections
// const asbestosAnalysisRef = firestore.collection("test_lab").doc("asbestos").collection("analysis");
// const asbestosSamplesRef = firestore.collection("test_lab").doc("asbestos").collection("samples");
// const asbestosSampleLogRef = firestore.collection("test_lab").doc("asbestos").collection("sampleLog");
// const cocsRef = firestore.collection("test_lab").doc("asbestos").collection("cocs");
// const logsRef = firestore.collection("test_logs").doc("logs");

export { app, auth, firebase, firestore, provider, storage };
export {
  appSettingsRef,
  asbestosAnalysisRef,
  asbestosSamplesRef,
  asbestosSampleLogRef,
  assetsRef,
  modelsRef,
  manufacturersRef,
  cocsRef,
  constRef,
  docsRef,
  helpRef,
  incidentsRef,
  jobsRef,
  logsRef,
  methodsRef,
  modulesRef,
  noticesRef,
  questionsRef,
  quizzesRef,
  sitesRef,
  stateRef,
  toolsRef,
  trainingPathsRef,
  updateRef,
  usersRef,
  vehiclesRef
};
export default firebase;
