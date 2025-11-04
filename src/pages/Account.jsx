import React, { useEffect, useState } from "react";

const Account = () => {
  const [user, setUser] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");

  // ✅ Fetch logged-in user info
  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");

      const res = await fetch("http://localhost:5000/api/auth/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user details.");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("❌ User fetch error:", err);
      setError(err.message);
    }
  };

  // ✅ Fetch saved summaries
  const getSummaries = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");

      const res = await fetch("http://localhost:5000/api/summary/getall", {
        headers: { "auth-token": token },
      });

      if (!res.ok) throw new Error("Failed to fetch summaries.");

      const data = await res.json();
      setSummaries(Array.isArray(data) ? data : []); // safety check
    } catch (err) {
      console.error("❌ Summary fetch error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    getUser();
    getSummaries();
  }, []);

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        ⚠️ {error} — Try logging in again.
      </div>
    );
  }

  if (!user) return <p style={{ padding: "20px" }}>Loading account...</p>;

  return (
    <div className="account-page" style={{ padding: "30px", color: "#fff" }}>
      <h2>Hello, {user.name}</h2>
      <p>Email: {user.email}</p>

      <h3 style={{ marginTop: "30px" }}>📝 Your Summaries</h3>
      {summaries.length === 0 ? (
        <p>No summaries found yet.</p>
      ) : (
        <div className="summary-list">
          {summaries.map((item, idx) => (
            <div
              key={idx}
              className="summary-item"
              style={{
                background: "#1e2235",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <strong>Summary #{idx + 1}</strong>
              <pre style={{ whiteSpace: "pre-wrap" }}>{item.summary}</pre>
              <small>
                Created: {new Date(item.date).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Account;
