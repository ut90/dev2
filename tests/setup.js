const jwt = require('jsonwebtoken');

const generateValidToken = () => {
  return jwt.sign(
    { id: 1, email: 'admin@example.com', role: '管理者' },
    process.env.JWT_SECRET || 'library_management_jwt_secret_key',
    { expiresIn: '1h' }
  );
};

jest.mock('../middleware/auth', () => ({
  authenticateStaff: (req, res, next) => {
    req.user = { id: 1, email: 'admin@example.com', role: '管理者' };
    next();
  },
  isAdmin: (req, res, next) => {
    next();
  }
}));

module.exports = {
  generateValidToken
};
