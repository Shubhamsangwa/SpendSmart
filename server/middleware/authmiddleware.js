const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'spendsmart_secret_change_in_production';

/**
 * Middleware: verify JWT token on protected routes.
 * Adds req.userId to the request if valid.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = authMiddleware;