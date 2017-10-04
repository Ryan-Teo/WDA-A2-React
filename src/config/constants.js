import firebase from 'firebase'

// THIS SHOULD BE YOUR SETTING FROM FIREBASE
// YOU CAN RETRIEVE THESE AFTER CREATING YOUR FIREBASE PROJECT
const config = {
    apiKey: "AIzaSyB1lRbR7xaPOYz3uqcnsPsGPaMGB5ZNts0",
    authDomain: "wda-2-login.firebaseapp.com",
    databaseURL: "https://wda-2-login.firebaseio.com",
    projectId: "wda-2-login",
    storageBucket: "wda-2-login.appspot.com",
    messagingSenderId: "161724634984"
};

firebase.initializeApp(config);

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const ref = firebase.database().ref();
export const firebaseAuth = firebase.auth;
