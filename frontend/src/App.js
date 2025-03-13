import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login"
import PrivateRoute from "./components/PrivateRoute"
import Wallet from "./components/Wallet"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
