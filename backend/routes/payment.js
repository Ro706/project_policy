const express = require('express');
const router = express.Router();
const fetchalluser = require('../middleware/fetchalluser');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const checkSubscription = require('../middleware/checkSubscription');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ROUTE 1: Create a new order using: POST "/api/payment/create-order". Login required
router.post('/create-order', fetchalluser, async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency,
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Verify payment using: POST "/api/payment/verify-payment". Login required
router.post('/verify-payment', fetchalluser, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is successful
            const payment = new Payment({
                user: req.user.id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: req.body.amount,
                currency: req.body.currency,
                status: 'success',
            });
            await payment.save();

            const user = await User.findById(req.user.id);
            user.isSubscribed = true;
            const expiryDate = user.isSubscribed && user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()
                ? new Date(user.subscriptionExpiresAt)
                : new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            user.subscriptionExpiresAt = expiryDate;
            await user.save();

            res.json({ status: 'success' });
        } else {
            res.status(400).json({ status: 'failure' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Check subscription status: GET "/api/payment/check-subscription". Login required
router.get('/check-subscription', fetchalluser, async (req, res) => {
    // Development-only bypass for easier testing
    if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: Bypassing subscription check for /api/payment/check-subscription');
        return res.json({ status: 'subscribed', amount: 49 }); // Default to Monthly plan amount for testing
    }

    // Production logic
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.isSubscribed) {
            const now = new Date();
            if (user.subscriptionExpiresAt < now) {
                // Subscription has expired
                user.isSubscribed = false;
                await user.save();
                return res.status(402).json({ error: "Subscription expired. Please pay to renew." });
            } else {
                // User is subscribed. Find the latest successful payment to determine the plan amount.
                const lastPayment = await Payment.findOne({ user: req.user.id, status: 'success' })
                    .sort({ createdAt: -1 });
                
                const planAmount = lastPayment ? lastPayment.amount : 0;

                return res.json({ status: 'subscribed', amount: planAmount });
            }
        } else {
            return res.status(402).json({ error: "You need to be subscribed to access this feature." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Get Razorpay key: GET "/api/payment/get-key". Login required
router.get('/get-key', fetchalluser, (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
