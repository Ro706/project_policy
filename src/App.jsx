import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
    const isAuthenticated = localStorage.getItem("token"); // ✅ Check if user is logged in
    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
