import React, { useState, useContext } from "react";
import AuthCard from "../components/AuthCard";
import { useNavigate } from "react-router-dom";
import "../auth.css";
import { UserContext } from "../context/UserContext";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../firebaseConfig";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
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
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.errors ? data.errors[0].msg : "Signup failed");
      }
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google signup failed");
      login(data.authToken);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthCard title="Create Account">
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="auth-button">
          Sign up
        </button>
      </form>

      <div className="auth-divider">OR</div>

      <button type="button" onClick={handleGoogleSignUp} className="auth-button google-btn">
          <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span>Sign up with Google</span>
        </button>


      <p className="auth-link">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")}>Log in</button>
      </p>
    </AuthCard>
  );
};

export default Signup;
