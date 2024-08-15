const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

router.get('/verify-code', (req, res) => {
  res.render('verify-code');
});

router.get('/reset-password', (req, res) => {
  res.render('reset-password');
});

module.exports = router;