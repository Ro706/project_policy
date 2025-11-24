import React, { useEffect, useState, useContext } from "react";
import SummaryModal from "../components/SummaryModal";
import SummaryCard from "../components/SummaryCard";
import { UserContext } from "../context/UserContext";
import useScript from "../hooks/useScript";

const Account = () => {
  const { user, token } = useContext(UserContext);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState("");
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const razorpayStatus = useScript("https://checkout.razorpay.com/v1/checkout.js");

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    }
  }, [user]);

  const checkSubscription = async () => {
    setSubscriptionLoading(true);
    try {
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
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const getSummaries = async () => {
    try {
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
    if (token) {
      getSummaries();
      checkSubscription();
    }
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/updateuser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('User update failed with errors:', data.errors);
        throw new Error(data.errors ? data.errors[0].msg : 'Failed to update user.');
      }

      // The user state will be updated through the context, no need to setUser here
      setIsEditing(false);
    } catch (err) {
      console.error("❌ User update error:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
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
    if (razorpayStatus !== 'ready') {
      console.log('Razorpay script not ready');
      return;
    }

    try {
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
          contact: user.phone,
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
      <div className="profile-card">
        {!isEditing ? (
          <div className="profile-header">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=0d8abc&color=fff`}
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>{user.phone}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                readOnly
              />
              <span className="readonly-explanation">Email address cannot be changed.</span>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="subscription-info">
        <h3>Subscription Status</h3>
        {subscriptionLoading ? (
          <p>Loading status...</p>
        ) : isSubscribed ? (
          <p>You are subscribed!</p>
        ) : (
          <button onClick={handlePayment}  disabled={razorpayStatus !== 'ready'}>
            Subscribe
          </button>
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
