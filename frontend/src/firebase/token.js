import { getAuth } from "firebase/auth";

const auth = getAuth();

export async function getFirebaseToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}
