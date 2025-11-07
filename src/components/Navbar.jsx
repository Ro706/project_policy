import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/getuser", {
          method: "POST",
          headers: { "auth-token": token },
        });
        const data = await res.json();
        if (data?.name) setUserName(data.name);
      } catch {
        setUserName("User");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo"></h2>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/feedback" className="nav-link">Feedback</Link>
        </div>
      </div>
      <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
        👋 Hello, {userName || "User"}
        {dropdownOpen && (
          <div className="dropdown">
            <button onClick={() => navigate("/account")}>Account</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
      <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-nav-links">
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/feedback" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Feedback</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
