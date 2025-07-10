const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SECRET = process.env.JWT_SECRET; // use this consistently

// const authenticateUser = async (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

//   try {
//     const decoded = jwt.verify(token, SECRET);
//     req.user = {
//       id: decoded.id,
//       role: decoded.role
//     };
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid token.' });
//   }
// };

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.error('authenticateUser error: No Authorization header');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error('authenticateUser error:', err);
    res.status(401).json({ error: 'Invalid token.' });
  }
};


const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { authenticateUser, verifyAdmin };
