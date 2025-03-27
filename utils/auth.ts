import { getAuth, onAuthStateChanged } from "firebase/auth";

export const checkUserAuth = (callback: (user: any) => void) => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/auth/verify-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        callback(userData);
      } else {
        console.error("User verification failed");
      }
    } else {
      callback(null);
    }
  });
};
