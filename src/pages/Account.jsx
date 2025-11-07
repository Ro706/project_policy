import React, { useEffect, useState } from "react";
import SummaryModal from "../components/SummaryModal";

const Account = () => {
  const [user, setUser] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");
  const [selectedSummary, setSelectedSummary] = useState(null);

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

  const getSummaries = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");

      const res = await fetch("http://localhost:5000/api/summary/getall", {
        headers: { "auth-token": token },
      });

      if (!res.ok) throw new Error("Failed to fetch summaries.");

      const data = await res.json();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Summary fetch error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    getUser();
    getSummaries();
  }, []);

  const openModal = (summary) => {
    setSelectedSummary(summary);
  };

  const closeModal = () => {
    setSelectedSummary(null);
  };

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        ⚠️ {error} — Try logging in again.
      </div>
    );
  }

  if (!user) return <p style={{ padding: "20px" }}>Loading account...</p>;

  return (
    <div className="account-container">
      <div className="account-info">
        <h2>Hello, {user.name}</h2>
        <p>Email: {user.email}</p>
      </div>

      <h3 style={{ marginTop: "30px" }}>📝 Your Summaries</h3>
      {summaries.length === 0 ? (
        <p>No summaries found yet.</p>
      ) : (
        <div className="summary-list">
          {summaries.map((item, idx) => (
            <div
              key={idx}
              className="summary-card"
              onClick={() => openModal(item.summaryText)}
            >
              <strong>Summary #{idx + 1}</strong>
              <p className="truncate">{item.summaryText}</p>
              <small>
                Created: {new Date(item.date).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {selectedSummary && (
        <SummaryModal summary={selectedSummary} onClose={closeModal} />
      )}
    </div>
  );
};

export default Account;
