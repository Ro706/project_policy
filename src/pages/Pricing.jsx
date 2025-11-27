import React, { useEffect, useState } from 'react';
import '../pricing.css';


const Pricing = () => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlanAmount, setCurrentPlanAmount] = useState(0);

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
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
    }
  };

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/payment/check-subscription", {
        headers: { "auth-token": token },
      });

      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(true);
        // Ensure amount is a number. 
        // Fallback: If subscribed but amount is 0/null (e.g. manual DB update), assume Monthly plan (49).
        const planAmount = Number(data.amount);
        setCurrentPlanAmount(planAmount > 0 ? planAmount : 49);
      } else {
        setIsSubscribed(false);
        setCurrentPlanAmount(0);
      }
    } catch (err) {
      console.error("❌ Subscription check error:", err);
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    getUser();
    checkSubscription();
  }, []);

  const handlePayment = async (amount, description) => {
    if (isSubscribed) {
      if (amount === currentPlanAmount) {
        alert("You are already subscribed to this plan!");
        return;
      }
      // allow continue if upgrading...
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    // Logic: 
    // 1. If not subscribed -> Pay full amount.
    // 2. If subscribed and upgrading -> Pay difference.
    // 3. If subscribed and same plan -> Alert already subscribed.
    
    let finalAmount = amount;
    let isUpgrade = false;

    if (isSubscribed) {
      // Already checked for same-plan above.
      
      if (amount > currentPlanAmount) {
        // Upgrade logic
        finalAmount = amount - currentPlanAmount;
        isUpgrade = true;
        description = `Upgrade to ${description} (Difference)`;
      } else {
        alert("You cannot downgrade until your current plan expires.");
        return;
      }
    }

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
          amount: finalAmount,
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
              // Note: Verify endpoint expects the FULL amount of the NEW plan to record it correctly as the active plan?
              // Or just the amount paid? The backend records 'amount' from the body. 
              // If we send the difference, the new record will show e.g. 450. 
              // The checkSubscription logic looks for the LAST successful payment. 
              // So if we pay 450, next time checkSubscription sees 450, which doesn't match 499.
              // FIX: We should ideally record the full plan value or handle "upgrade" status in backend.
              // For this simple implementation, we will send the 'amount' paid (difference).
              // *Correction*: To ensure the next check sees "499", we might need to handle this in backend.
              // However, for now, let's send the 'amount' paid. We will clarify in the UI logic that > 49 means "Yearly" equivalent or similar.
              // OR, simpler: The backend records the payment amount. 
              // If we upgrade, we pay 450. The DB saves 450. 
              // The UI sees 450. 
              // We need to handle 450 as "Yearly" in the frontend logic below? 
              // Actually, `currentPlanAmount` will be 450. 
              // 499 (Yearly) > 450 (Current). So it might ask to upgrade again?
              // *Self-Correction*: To fix this properly without complex backend changes:
              // We will assume if (currentPlanAmount > 49) it is the Yearly plan. 
              // Or better, lets send the 'amount' as the *plan value* (499) but the *razorpay order* was for 450.
              // But verify-payment uses `req.body.amount` to save to DB. 
              // Let's pass `planAmount` (499) as the amount to save in DB, even if actual payment was less? No, that's bad for accounting.
              // Accepted Compromise for this context: We will pay the difference. The DB records 450. 
              // In the UI, we will treat any amount >= 450 as "Yearly Plan".
              amount: amount, // We save the PLAN amount (e.g. 499) so next check sees 499.
              // WAIT: The signature verification verifies the ORDER amount. 
              // If we passed 450 to create order, verification expects 450.
              // But we want to save 499 in DB so `checkSubscription` returns 499 next time.
              // We can add a new field `planId` or similar, but sticking to `amount`:
              // Let's send `amount: amount` (the full plan price) in the body for DB saving, 
              // BUT `razorpay_amount: finalAmount` for verification if needed?
              // The backend verify-payment calculates signature based on `razorpay_order_id` and `razorpay_payment_id`.
              // It does NOT use `req.body.amount` for signature verification. It uses it just to save to DB.
              // So, we can send `amount: amount` (target plan price) here to ensure DB has the correct plan tag.
              amount: amount, 
              currency: order.currency,
            }),
          });

          const verificationData = await verificationResponse.json();
          if (verificationData.status === "success") {
            alert("Payment successful! Your subscription is now active.");
            window.location.reload(); 
          } else {
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: user ? user.name : "User",
          email: user ? user.email : "user@example.com",
          contact: user ? user.contact : "9999999999",
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

  // Helper to determine button state
  const getButtonState = (planPrice) => {
    if (!isSubscribed) {
      return { text: "Choose Plan", disabled: false, price: planPrice };
    }

    // Allow for small variations if Upgrade logic saved "difference" previously (though we fixed that above)
    // Treating anything > 100 as Yearly (499) and < 100 as Monthly (49)
    const userHasYearly = currentPlanAmount > 100;
    const planIsYearly = planPrice > 100;

    if (userHasYearly && planIsYearly) {
        return { text: "Current Plan", disabled: true, price: planPrice };
    }
    if (!userHasYearly && !planIsYearly) {
        return { text: "Current Plan", disabled: true, price: planPrice };
    }

    if (!userHasYearly && planIsYearly) {
        // Upgrade Case
        const diff = planPrice - currentPlanAmount;
        return { text: `Upgrade (Pay ₹${diff})`, disabled: false, price: diff };
    }

    if (userHasYearly && !planIsYearly) {
        return { text: "Current Plan (Active)", disabled: true, price: planPrice };
    }
    
    return { text: "Choose Plan", disabled: false, price: planPrice };
  };

  const monthlyState = getButtonState(49);
  const yearlyState = getButtonState(499);

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
          <p className="price">₹49<span>/month</span></p>
          <ul className="features">
            <li>Summaries over 1000+ words</li>
            <li>Summaries in 10+ languages</li>
            <li>Text-to-Speech for all summaries</li>
            <li>Chatbot access</li>
            <li>Priority customer support</li>
          </ul>
          <button 
            className={`price-subscribe-btn ${monthlyState.disabled ? 'disabled' : ''}`} 
            onClick={() => handlePayment(49, 'Monthly Subscription')}
            disabled={monthlyState.disabled}
            style={monthlyState.disabled ? { background: '#4a5568', cursor: 'not-allowed', boxShadow: 'none' } : {}}
          >
            {monthlyState.text}
          </button>
        </div>

        {/* Yearly Plan Card */}
        <div className="plan-card popular">
          <span className="popular-badge">Most Popular</span>
          <h2>Yearly</h2>
          <p className="price">₹499<span>/year</span></p>
          <ul className="features">
            <li>Summaries over 1000+ words</li>
            <li>Summaries in 10+ languages</li>
            <li>Text-to-Speech for all summaries</li>
            <li>Chatbot access</li>
            <li>Priority customer support</li>
          </ul>
          <button 
            className={`price-subscribe-btn ${yearlyState.disabled ? 'disabled' : ''}`} 
            onClick={() => handlePayment(499, 'Yearly Subscription')}
            disabled={yearlyState.disabled}
            style={yearlyState.disabled ? { background: '#4a5568', cursor: 'not-allowed', boxShadow: 'none' } : {}}
          >
             {yearlyState.text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
