import { auth, googleProvider, signInWithPopup } from "../firebase"
import { useState } from "react"
import axios from "axios"

const Login = () => {
  const [jwtToken, setJwtToken] = useState(null)

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
    }
    catch (error) {
      console.error("Sign In with popup error:", error)
    }
    try {
      const idToken = await result.user.getIdToken();
    }
    catch (error) {
      console.error("ID Token error:", error)
    }
    try {
      const response = await axios.post("http://localhost:5000/auth/login", { idToken })
    }
    catch (error) {
      console.error("Firebase response error:", error)
    }
    try {
      localStorage.setItem("jwt", response.data.jwt)
    }
    catch (error) {
      console.error("Error setting response:", error)
    }
    return (
      <div>
        <button onClick={handleLogin}>Login with Google</button>
        {jwtToken && <p>JWT: {jwtToken}</p>}
      </div>
    )
  }
}

