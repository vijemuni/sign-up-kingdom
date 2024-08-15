const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationCode } = require('../utils/email');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const userId = await User.create(name, email, password);
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, redirectUrl: 'http://127.0.0.1:5500/Papers%20Kingdom/index.html' });
  
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await User.setVerificationCode(user.id, verificationCode);
    await sendVerificationCode(email, verificationCode);
    res.json({ message: 'Verification code sent', userId: user.id });
  } catch (error) {
    console.error('Error in forgot-password route:', error);
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const isValid = await User.verifyCode(userId, code);
    if (isValid) {
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
      res.json({ message: 'Code verified', token });
    } else {
      res.status(400).json({ message: 'Invalid or expired code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying code', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.updatePassword(decoded.userId, newPassword);
    await User.clearVerificationCode(decoded.userId);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;