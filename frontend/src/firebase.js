import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, initializeAuth, signInWithPopup } from "firebase/auth"
//import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_API_KEY")
    ? firebaseConfig
    : {
      apiKey: "demo-mode",
      authDomain: "demo-mode",
      projectId: "demo-mode",
      storageBucket: "demo-mode",
      messagingSenderId: "demo-mode",
      appId: "demo-mode"
    }
);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
