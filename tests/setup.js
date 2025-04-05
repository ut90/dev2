const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'library_management_jwt_secret_key';

const generateValidToken = () => {
  return jwt.sign(
    { id: 1, email: 'admin@example.com', role: '管理者' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const validToken = generateValidToken();

module.exports = {
  generateValidToken,
  validToken
};
