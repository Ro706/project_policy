const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../mailer');









router.post('/firebase-signup', async (req, res) => {
    const firebaseToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
    const { name, phone } = req.body;

    if (!firebaseToken) {
        return res.status(401).json({ error: 'No Firebase ID token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        const { uid, email } = decodedToken;

        let user = await User.findOne({ $or: [{ firebaseId: uid }, { email: email }] });

        if (user) {
            // If user already exists in our DB, just generate a new JWT for them
            // Update name/phone if they are different and provided
            if (user.firebaseId !== uid) user.firebaseId = uid;
            if (name && user.name !== name) user.name = name;
            if (phone && user.phone !== phone) user.phone = phone;
            await user.save();
        } else {
            // Create new user in our DB
            user = await User.create({
                name: name,
                email: email,
                phone: phone,
                firebaseId: uid,
                isVerified: true, // Firebase handled email verification
            });
        }

        const data = { user: { id: user.id } };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken });

    } catch (error) {
        console.error("Firebase signup error:", error);
        res.status(401).json({ error: "Invalid Firebase ID token or backend signup failed." });
    }
});

router.post('/firebase-login', async (req, res) => {
    const firebaseToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;

    if (!firebaseToken) {
        return res.status(401).json({ error: 'No Firebase ID token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        const { uid } = decodedToken;

        const user = await User.findOne({ firebaseId: uid });

        if (!user) {
            return res.status(404).json({ error: 'User not found in local database. Please sign up.' });
        }

        const data = { user: { id: user.id } };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken });

    } catch (error) {
        console.error("Firebase login error:", error);
        res.status(401).json({ error: "Invalid Firebase ID token or backend login failed." });
    }
});

const admin = require('../firebase');
const fetchuser = require('../middleware/fetchalluser');



// GET /api/auth/getuser
// routes/auth.js
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});


// PUT /api/auth/updateuser
router.put('/updateuser', fetchuser, [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').optional({ nullable: true, checkFalsy: true }).matches(/^\+?[0-9]{10,14}$/).withMessage('Please enter a valid phone number (10-14 digits).'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, phone } = req.body;

        // Check if email is taken by another user
        const existingUserWithEmail = await User.findOne({ email: email, _id: { $ne: req.user.id } });
        if (existingUserWithEmail) {
            return res.status(400).json({ errors: [{ msg: 'This email is already in use by another account' }] });
        }

        // Check if phone is taken by another user
        const existingUserWithPhone = await User.findOne({ phone: phone, _id: { $ne: req.user.id } });
        if (existingUserWithPhone) {
            return res.status(400).json({ errors: [{ msg: 'This phone number is already in use by another account' }] });
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, email, phone }, { new: true }).select('-password');
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;