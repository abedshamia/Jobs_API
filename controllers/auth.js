const {StatusCodes} = require('http-status-codes');
const pool = require('../db/connect');
const bcrypt = require('bcryptjs');
const {BadRequestError, UnauthenticatedError} = require('./../errors/index');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const {name, email, password} = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError('Missing required fields');
  }

  const existedUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existedUser.rows[0]) {
    throw new BadRequestError('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, hashedPassword]
  );

  const token = await jwt.sign(
    {userId: user.rows[0].id, email: user.rows[0].email, name: user.rows[0].name},
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  res.status(StatusCodes.CREATED).json({
    message: 'User created successfully',
    token,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
    },
  });
};

const login = async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    throw new BadRequestError('Missing required fields');
  }

  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (!user.rows[0]) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  const validatePassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validatePassword) {
    throw new BadRequestError('Invalid password');
  }

  const token = await jwt.sign(
    {userId: user.rows[0].id, email: user.rows[0].email},
    process.env.JWT_SECRET
  );
  console.log(token);

  res.status(StatusCodes.OK).json({
    message: 'User logged in successfully',
    token,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
    },
  });
};

module.exports = {
  register,
  login,
};
