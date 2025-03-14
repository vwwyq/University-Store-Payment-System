/*import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "your_apiKey",
    authDomain: "your_authDomain",
    projectId: "your_projectId",
    storageBucket: "your_storageBucket",
    messagingSenderId: "your_messagingSenderId",
    appId: "your_appId"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };*/
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUH_WUSLcSugrwxNizGbGg0yOPRknOwIs",
  authDomain: "usps3-bc166.firebaseapp.com",
  projectId: "usps3-bc166",
  storageBucket: "usps3-bc166.firebasestorage.app",
  messagingSenderId: "1004137574922",
  appId: "1:1004137574922:web:c64083f3621860debce5f3",
  measurementId: "G-CLJHCZXW3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };