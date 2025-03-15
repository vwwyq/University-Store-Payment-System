import { getFirebaseToken } from "../../firebase/token"; // Import function to get Firebase token

const API_URL = "https://your-backend.com/auth/firebase-login"; // Replace with your actual backend URL

export async function sendTokenToBackend() {
  const token = await getFirebaseToken();
  if (!token) {
    console.error("User not authenticated");
    return null;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseToken: token }), // Send Firebase Token
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate");
    }

    const data = await response.json();
    return data.jwt; // Return the JWT received from the backend
  } catch (error) {
    console.error("Error sending token to backend:", error);
    return null;
  }
}
