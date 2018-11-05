import * as firebase from 'firebase';
import { FirebaseConfig } from "./keys";

const app = firebase.initializeApp(FirebaseConfig);
var p = new firebase.auth.GoogleAuthProvider();
p.setCustomParameters({
  prompt: 'select_account'
});

const provider = p;
const auth = firebase.auth();
const storage = firebase.storage();
const database = firebase.firestore();
database.settings({timestampsInSnapshots: true})
const usersRef = database.collection("users");
const docsRef = database.collection("documents");
const modulesRef = database.collection("modules");
const toolsRef = database.collection("tools");
const noticesRef = database.collection("notices");
const quizzesRef = database.collection("quizzes");
const questionsRef = database.collection("questions");
const trainingPathsRef = database.collection("trainingpaths");
const methodsRef = database.collection("methods");

export { app, provider, auth, database, storage };
export { usersRef, docsRef, modulesRef, toolsRef,
  noticesRef, quizzesRef, questionsRef, trainingPathsRef,
  methodsRef, };
export default firebase;
