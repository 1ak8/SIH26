const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, gender, abhaId } = req.body;
  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide name, email, password, and phone');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  const user = await User.create({ name, email, password, phone, role: role || 'patient', gender, abhaId });

  if (user.role === 'patient') {
    await PatientProfile.create({ user: user._id, abhaId: user.abhaId });
  }

  res.status(201).json({
    success: true,
    data: {
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role, abhaId: user.abhaId,
      token: generateToken(user._id),
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role, abhaId: user.abhaId,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

module.exports = { register, login, getMe };
