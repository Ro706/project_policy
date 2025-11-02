import React from "react";
import "../auth.css";

const AuthCard = ({ title, children }) => {
  return (
    <div className="auth-card">
      <h2 className="auth-title">{title}</h2>
      {children}
    </div>
  );
};

export default AuthCard;
