import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Account from "./pages/Account";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import Pricing from "./pages/Pricing";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import chatbotIcon from "./assets/chatbot-icon.svg";
import { Navigate } from "react-router-dom";
import "./account.css";
import "./components/Chatbot.css";
import VerifyOtp from "./pages/VerifyOtp";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

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
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Routes>
      {!isChatOpen ? (
        <img
          src={chatbotIcon}
          alt="Chatbot Icon"
          className="chatbot-icon"
          onClick={toggleChat}
        />
      ) : (
        <Chatbot onClose={toggleChat} />
      )}
    </Router>
  );
}

export default App;
