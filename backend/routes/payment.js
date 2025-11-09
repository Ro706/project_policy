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
            const expiryDate = new Date();
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
router.get('/check-subscription', fetchalluser, checkSubscription, (req, res) => {
    res.json({ status: 'subscribed' });
});

module.exports = router;
