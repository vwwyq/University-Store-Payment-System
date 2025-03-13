import { Navigate } from "react-router-dom"

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("jwt")
  return token ? children : <Navigate to="/login" />
};

export default PrivateRoute
