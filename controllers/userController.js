const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(404);
    throw new Error('Please fill all field');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Please password should be at least 6 characters');
  }
  const userExists = await User.findOne({ username });
  if (userExists) {
    res.status(400);
    throw new Error('Username has been already taken');
  }

  const user = await User.create({
    username,
    password,
  });
  const token = user.generateToken();

  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    const { _id, username } = user;
    res.status(201).json({
      _id,
      username,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid username');
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error('Please add username and password');
  }

  const user = await User.findOne({ username });

  if (!user) {
    res.status(400);
    throw new Error('User not found, please signup');
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (user && passwordIsCorrect) {
    const { _id, username, isAdmin } = user;
    const token = user.generateToken();

    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: 'none',
      secure: true,
    });
    res.status(201).json({
      username,
      _id,
      token,
      isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid username or password');
  }
});

const logOutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  });
  return res.status(200).json({
    message: 'successfully loggedOut',
  });
});

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
};
