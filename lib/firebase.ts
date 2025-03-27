/*import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};*/
/*const firebaseConfig = {
    apiKey: "AIzaSyAhNurT3uME26ravc0tm7Ocdc_CLHHnaBo",
    authDomain: "marketplace-d9f86.firebaseapp.com",
    projectId: "marketplace-d9f86",
    storageBucket: "marketplace-d9f86.firebasestorage.app",
    messagingSenderId: "217891604252",
    appId: "1:217891604252:web:9d46832f1cf323bbd55cd9"
  };
*/
/*const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);*/


import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/*const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};*/

const firebaseConfig = {
    apiKey: "AIzaSyAhNurT3uME26ravc0tm7Ocdc_CLHHnaBo",
    authDomain: "marketplace-d9f86.firebaseapp.com",
    projectId: "marketplace-d9f86",
    storageBucket: "marketplace-d9f86.firebasestorage.app",
    messagingSenderId: "217891604252",
    appId: "1:217891604252:web:9d46832f1cf323bbd55cd9"
  };

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export app and Firebase services
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);

