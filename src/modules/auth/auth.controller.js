// modules/auth/auth.controller.js
// Auth controller for CRM backend

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const { ROLES, STATUS } = require('../../core/constants');

// Create Super Admin (first user)
exports.createSuperAdmin = async (req, res, next) => {
  try {
    const { user_name, contact, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const superAdmin = await User.create({
      user_name,
      contact,
      email,
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      status: STATUS.ACTIVE
    });
    res.status(201).json({ success: true, data: superAdmin });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, status: STATUS.ACTIVE } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const token = jwt.sign(
      { reg_id: user.reg_id, role: user.role },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    res.cookie(
      process.env.COOKIE_NAME || 'auth_token',
      token,
      {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/',
      }
    );
    res.json({
  success: true,
  message: 'Login successful.',
  data: {
    reg_id: user.reg_id,
    user_name: user.user_name,
    email: user.email,
    branch_id: user.branch_id,
    role: user.role
  }
});
  } catch (err) {
    next(err);
  }
}; 