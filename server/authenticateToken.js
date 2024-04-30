const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      console.log(err)
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
