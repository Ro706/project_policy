const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth
router.post(
  '/signup',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser){
        return res.status(400).json({ errors: [{ msg: 'User with this email already exists' }] });
      }
      // Hashing the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // create new User
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      //create a token
      const data ={
        user:{
          id : user.id
        }
      }
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
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

const fetchuser = require('../middleware/fetchalluser');

// GET /api/auth/getuser
// routes/auth.js
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


// PUT /api/auth/updateuser
router.put('/updateuser', fetchuser, async (req, res) => {
  try {
    const { name, phonenumber } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, phonenumber }, { new: true }).select('-password');
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;