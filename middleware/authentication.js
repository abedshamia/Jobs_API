const jwt = require('jsonwebtoken');
const {UnauthenticatedError} = require('../errors');

const auth = (req, res, next) => {
  //Check Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided');
  }

  //Get token
  const token = authHeader.split(' ')[1];
  //Verify token
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {userId: payload.userId, name: payload.name, email: payload.email};
    next();
  } catch (err) {
    throw new UnauthenticatedError('Invalid token');
  }
};

module.exports = auth;
