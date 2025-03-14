import { getAuth } from "firebase/auth";

const auth = getAuth();

export async function getFirebaseToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(); // Get Firebase-provided JWT
  }
  return null;
}
