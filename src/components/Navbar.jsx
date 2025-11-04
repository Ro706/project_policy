import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../navbar.css";
// import logo from "../assets/Policy.png";
const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/getuser", {
          headers: { "auth-token": token },
        });
        const data = await res.json();
        if (data?.user?.name) setUserName(data.user.name);
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
        <h2 className="logo"></h2>
      {/* <img src={logo} alt="logo" className="logo" width={50} height={50}/>   */}
      <div
        className="user-menu"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        👋 Hello, {userName || "User"}
        {dropdownOpen && (
          <div className="dropdown">
            <button onClick={() => navigate("/account")}>Account</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
