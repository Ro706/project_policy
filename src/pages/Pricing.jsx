import React from 'react';
import '../pricing.css';

const Pricing = () => {
  // In a real app, this would be moved to a shared hook or context
  const handlePayment = async (amount, description) => {
    // This logic is copied from Home.jsx and should be refactored in a real-world scenario
    try {
      const token = localStorage.getItem("token");
      const orderUrl = "http://localhost:5000/api/payment/create-order";
      const orderResponse = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order.");
      }

      const order = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Policy Summarizer",
        description: description,
        order_id: order.id,
        handler: async (response) => {
          const verificationUrl = "http://localhost:5000/api/payment/verify-payment";
          const verificationResponse = await fetch(verificationUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount / 100,
              currency: order.currency,
            }),
          });

          const verificationData = await verificationResponse.json();
          if (verificationData.status === "success") {
            alert("Payment successful! Your subscription is now active.");
            // Optionally redirect or update UI
            window.location.reload(); // Simple way to refresh user status
          } else {
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong with the payment. Please try again.");
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock premium features and get the most out of our platform.</p>
      </div>
      <div className="pricing-cards">
        {/* Monthly Plan Card */}
        <div className="plan-card">
          <h2>Monthly</h2>
          <p className="price">₹99<span>/month</span></p>
          <ul className="features">
            <li>Summaries over 1000+ words</li>
            <li>Summaries in 10+ languages</li>
            <li>Text-to-Speech for all summaries</li>
            <li>Priority customer support</li>
          </ul>
          <button className="subscribe-btn" onClick={() => handlePayment(99, 'Monthly Subscription')}>
            Choose Plan
          </button>
        </div>

        {/* Yearly Plan Card */}
        <div className="plan-card popular">
          <span className="popular-badge">Most Popular</span>
          <h2>Yearly</h2>
          <p className="price">₹999<span>/year</span></p>
          <ul className="features">
            <li>Summaries over 1000+ words</li>
            <li>Summaries in 10+ languages</li>
            <li>Text-to-Speech for all summaries</li>
            <li>Priority customer support</li>
          </ul>
          <button className="subscribe-btn" onClick={() => handlePayment(999, 'Yearly Subscription')}>
            Choose Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
