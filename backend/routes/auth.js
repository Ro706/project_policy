const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../mailer');

// POST /api/auth
router.post(
  '/signup',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').matches(/^\+?[0-9]{10,14}$/).withMessage('Please enter a valid phone number (10-14 digits).'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingUserWithEmail = await User.findOne({ email: req.body.email });
      if (existingUserWithEmail){
        return res.status(400).json({ errors: [{ msg: 'User with this email already exists' }] });
      }

      const existingUserWithPhone = await User.findOne({ phone: req.body.phone });
      if (existingUserWithPhone){
        return res.status(400).json({ errors: [{ msg: 'User with this phone number already exists' }] });
      }

      // Hashing the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      // create new User
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword,
        otp,
        otpExpires
      });

      // Send OTP email
      await transporter.sendMail({
        to: user.email,
        subject: 'Verify your email address',
        html: `<p>Your OTP for verification is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`
      });

      res.json({ success: true, message: 'OTP sent to your email address.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
    '/verify-otp',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'User not found' }] });
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
            }

            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({ authToken });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.post(
    '/resend-otp',
    [
        body('email').isEmail().withMessage('Invalid email address'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'User not found' }] });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            // Send OTP email
            await transporter.sendMail({
                to: user.email,
                subject: 'Verify your email address',
                html: `<p>Your new OTP for verification is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`
            });

            res.json({ success: true, message: 'New OTP sent to your email address.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.post(
  '/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password is required').exists()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(400).json({ errors: [{ msg: 'Please verify your email address before logging in.' }] });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Create token
      const data = {
        user: {
          id: user.id
        }
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

const admin = require('../firebase');
const fetchuser = require('../middleware/fetchalluser');

router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { name, email, uid } = decodedToken;

        let user = await User.findOne({ googleId: uid });

        if (user) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            return res.json({ authToken });
        } else {
            user = await User.create({
                name,
                email,
                googleId: uid,
                isVerified: true
            });
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            return res.json({ authToken });
        }
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ error: "Invalid Google token" });
    }
});

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