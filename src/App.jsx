import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Account from "./pages/Account";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import Navbar from "./components/Navbar";
import { Navigate } from "react-router-dom";
import "./account.css";
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/account" element={<ProtectedRoute element={<Account />} />} />
        <Route path="/about" element={<ProtectedRoute element={<About />} />} />
        <Route path="/feedback" element={<ProtectedRoute element={<Feedback />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
