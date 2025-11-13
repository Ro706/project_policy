import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import "../navbar.css";
import logo from "../assets/Policy.png";

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
        <img src={logo} alt="logo" className="logo" />
        <div className="nav-links">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/about" className="nav-link">About</NavLink>
          <NavLink to="/pricing" className="nav-link">Pricing</NavLink>
          <NavLink to="/feedback" className="nav-link">Feedback</NavLink>
        </div>
      </div>
      <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
        <img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt="avatar" className="avatar" />
        <span className="user-name">Hello, {userName || "User"}</span>
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
          <div className="separator"></div>
          <NavLink to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
          <NavLink to="/pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</NavLink>
          <NavLink to="/feedback" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Feedback</NavLink>
          <div className="separator"></div>
          <Link to="/account" className="mobile-user-info" onClick={() => setMobileMenuOpen(false)}>
            <img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt="avatar" className="avatar" />
            <span>{userName || "User"}</span>
          </Link>
          <div className="separator"></div>
          <button className="logout-btn" onClick={() => {handleLogout(); setMobileMenuOpen(false);}}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
