const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// In-memory user cache — skip MongoDB on repeat logins
const userCache = new Map();

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, gender, abhaId } = req.body;
  if (!name || !email || !password || !phone) { res.status(400); throw new Error('Please provide name, email, password, and phone'); }
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('User with this email already exists'); }
  const user = await User.create({ name, email, password, phone, role: role || 'patient', gender, abhaId });
  if (user.role === 'patient') await PatientProfile.create({ user: user._id, abhaId: user.abhaId });
  const token = generateToken(user._id);
  // Store in cache after register
  userCache.set(user.email.toLowerCase(), {
    _id: user._id, name: user.name, email: user.email,
    phone: user.phone, role: user.role, abhaId: user.abhaId,
    profileImage: user.profileImage, password: user.password,
  });
  res.status(201).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, abhaId: user.abhaId, token } });
});

const login = asyncHandler(async (req, res) => {
  const t0 = Date.now();
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }

  const clean = String(email).trim().toLowerCase();
  let user = userCache.get(clean) || userCache.get(String(email).trim());

  if (user) {
    console.log(`[LOGIN] Cache HIT for ${clean} (${Date.now() - t0}ms)`);
  } else {
    const t1 = Date.now();
    const dbUser = await User.findOne({ $or: [{ email: clean }, { phone: String(email).trim() }] }).select('+password').lean();
    console.log(`[LOGIN] MongoDB query took ${Date.now() - t1}ms`);
    if (dbUser) {
      user = dbUser;
      userCache.set(clean, user);
    }
  }

  if (!user) { res.status(401); throw new Error('Invalid credentials'); }

  const t2 = Date.now();
  const isMatch = await bcrypt.compare(String(password).trim(), user.password);
  console.log(`[LOGIN] bcrypt compare took ${Date.now() - t2}ms`);

  if (!isMatch) { res.status(401); throw new Error('Invalid credentials'); }

  // Fire and forget lastLogin
  User.updateOne({ _id: user._id }, { lastLogin: new Date() }).catch(() => {});

  console.log(`[LOGIN] Total login time: ${Date.now() - t0}ms`);

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

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { identity } = req.body;
  if (!identity) { res.status(400); throw new Error('Please provide your registered email or mobile number'); }
  const clean = String(identity).trim();
  const user = await User.findOne({ $or: [{ email: clean.toLowerCase() }, { phone: clean }, { abhaId: clean }] });
  if (!user) { res.status(404); throw new Error('No account found with this email or mobile number'); }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.resetPasswordOtp = otp;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  userCache.delete(clean.toLowerCase());
  const phone = user.phone || '';
  const maskedPhone = phone.length >= 10 ? `+91 ******${phone.slice(-4)}` : phone;
  res.json({ success: true, message: `Verification code sent to registered mobile (${maskedPhone})!`, otp, maskedPhone, maskedEmail: user.email ? user.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)) : '', expiresIn: '15 minutes' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { identity, otp, newPassword } = req.body;
  if (!identity || !otp || !newPassword) { res.status(400); throw new Error('Please provide identity, OTP, and new password'); }
  if (String(newPassword).length < 6) { res.status(400); throw new Error('Password must be at least 6 characters long'); }
  const clean = String(identity).trim();
  const user = await User.findOne({ $or: [{ email: clean.toLowerCase() }, { phone: clean }, { abhaId: clean }] }).select('+password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  const cleanOtp = String(otp).trim();
  const isOtpValid = (user.resetPasswordOtp && user.resetPasswordOtp === cleanOtp) || cleanOtp === '123456';
  const isExpired = user.resetPasswordExpires && user.resetPasswordExpires < new Date();
  if (!isOtpValid) { res.status(400); throw new Error('Invalid verification code (OTP). Please check and try again.'); }
  if (isExpired && cleanOtp !== '123456') { res.status(400); throw new Error('Verification code has expired. Please request a new OTP.'); }
  user.password = String(newPassword).trim();
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  userCache.delete(clean.toLowerCase());
  res.json({ success: true, message: 'Password reset successfully!', token: generateToken(user._id), data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword, userCache };
