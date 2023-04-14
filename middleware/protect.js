const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const User = require('../models/user');

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = await req.cookies.token;
 
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, Please login');
    }

    const verified = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(verified._id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
     res.status(401);
     throw new Error('User Not authorized, Please login');
  }
});

module.exports = protect;
