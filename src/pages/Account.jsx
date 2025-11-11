import React, { useEffect, useState } from "react";
import SummaryModal from "../components/SummaryModal";
import SummaryCard from "../components/SummaryCard";
const Account = () => {
  const [user, setUser] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubscribed, setIsSubscribed] = useState(false);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/payment/check-subscription", {
        headers: { "auth-token": token },
      });

      if (res.ok) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("❌ Subscription check error:", err);
      setIsSubscribed(false);
    }
  };

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
      setFormData({ name: data.name, email: data.email });
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
    checkSubscription();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/updateuser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update user.");

      const data = await res.json();
      setUser(data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ User update error:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/summary/delete/${id}`, {
        method: "DELETE",
        headers: {
          "auth-token": token,
        },
      });

      if (!res.ok) throw new Error("Failed to delete summary.");

      setSummaries(summaries.filter((summary) => summary._id !== id));
    } catch (err) {
      console.error("❌ Summary delete error:", err);
      setError(err.message);
    }
  };

  const openModal = (summary) => {
    setSelectedSummary(summary);
  };

  const closeModal = () => {
    setSelectedSummary(null);
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");

      const keyRes = await fetch("http://localhost:5000/api/payment/get-key", {
        headers: { "auth-token": token },
      });
      if (!keyRes.ok) throw new Error("Failed to fetch Razorpay key.");
      const { key } = await keyRes.json();

      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ amount: 100, currency: "INR" }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order.");

      const order = await orderRes.json();

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "project_policy",
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount,
              currency: order.currency,
            }),
          });

          if (verifyRes.ok) {
            alert("Payment successful!");
            checkSubscription();
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("❌ Payment error:", err);
      setError(err.message);
    }
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
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <button type="submit">Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <>
            <h2>Hello, {user.name}</h2>
            <p>Email: {user.email}</p>
            <button onClick={() => setIsEditing(true)}>Edit</button>
          </>
        )}
      </div>

      <div className="subscription-info">
        <h3>Subscription Status</h3>
        {isSubscribed ? (
          <p>You are subscribed!</p>
        ) : (
          <button onClick={handlePayment}>Subscribe</button>
        )}
      </div>

      <h3 style={{ marginTop: "30px" }}>📝 Your Summaries</h3>
      {summaries.length === 0 ? (
        <p>No summaries found yet.</p>
      ) : (
        <div className="summary-list">
          {summaries.map((item) => (
            <SummaryCard
              key={item._id}
              summary={item}
              onOpenModal={openModal}
              onDelete={handleDelete}
            />
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
