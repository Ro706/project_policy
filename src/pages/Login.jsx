import React, { useState, useContext } from "react";
import AuthCard from "../components/AuthCard";
import { useNavigate } from "react-router-dom";
import "../auth.css";
import { UserContext } from "../context/UserContext";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import app from "../firebaseConfig";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Sign in user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2. Send token to backend to get custom app JWT
      const res = await fetch("http://localhost:5000/api/auth/firebase-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Backend login failed.");
      }

      // 3. Login user in the app with the custom JWT
      login(data.authToken);
      navigate("/");
    } catch (err) {
      // Better error handling for Firebase errors
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const res = await fetch("http://localhost:5000/api/auth/firebase-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");
      login(data.authToken);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthCard title="Welcome Back">
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="auth-button">
          Log in
        </button>
        <button type="button" onClick={handleGoogleSignIn} className="auth-button google-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.62-6.62C34.11 2.83 29.41 0 24 0 14.4 0 6.4 5.2 2.8 12.7l7.9 6.1C13.4 12.9 18.2 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.9 24c0-1.57-.13-3.08-.38-4.5L24 19.5v8.9h12.4c-.6 3.18-2.4 5.5-5.1 7.2l7.9 6.1c4.6-4.5 7.2-11.1 7.2-19.7z"/>
            <path fill="#4285F4" d="M24 48c6.4 0 11.9-2.1 15.9-5.7l-7.9-6.1c-2.1 1.4-4.8 2.3-8 2.3-5.8 0-10.6-3.4-12.4-8.3l-7.9 6.1C6.4 42.8 14.4 48 24 48z"/>
            <path fill="#FBBC05" d="M11.6 29.6c-.9-2.5-1.4-5.2-1.4-8s.5-5.5 1.4-8l-7.9-6.1C5.2 15.2 0 21.4 0 24s5.2 8.8 11.6 13.9l7.9-6.1z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      </form>

      <p className="auth-link">
        Don’t have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign up</button>
      </p>
    </AuthCard>
  );
};

export default Login;
