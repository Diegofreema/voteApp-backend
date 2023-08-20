const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');
const Token = require('../models/tokenModel');
const sendEmail = require('../util/sendEmail');
const Email = require('../models/emailModel');

const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
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
  const userEmail = await User.findOne({ email });
  if (userEmail) {
    res.status(400);
    throw new Error('Email has been already taken');
  }

  const user = await User.create({
    username,
    password,
    email,
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
      email,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid username');
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please add username and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found, please signup');
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (user && passwordIsCorrect) {
    const { _id, username, isAdmin, email, confirmed } = user;
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
      email,
      _id,
      token,
      isAdmin,
      confirmed,
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
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log('email', email);
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000),
  }).save();
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `
  <h2>Hello ${user.username}</h2>
  <p>Please use the url below to reset your password</p>
  <p>This reset token will expire in 30 minutes</p>

  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

  <p>Regards</p>
  <p>E-vote</p>
  `;
  const subject = 'Reset Your Password';

  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, user.email, sent_from);
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500);
    throw new Error('Email not sent, Please try again later');
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const token = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!token) {
    res.status(404);
    throw new Error('Token is not valid or has expired');
  }

  const user = await User.findOne({ _id: token.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: 'You have successfully updated your password',
  });
});
const verifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }
  let emailExist = await Email.findOne({ userId: user._id });
  if (emailExist) {
    await emailExist.deleteOne();
  }
  let verificationToken = crypto.randomBytes(32).toString('hex') + user._id;

  await new Email({
    userId: user._id,
    emailToken: verificationToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000),
  }).save();
  const verifyUrl = `${process.env.FRONTEND_URL}/confirmation/${verificationToken}`;
  const message = `
  <h2>Hello ${user.username}</h2>
  <p>Please use the url below to verify your email</p>
  <p>This email verification token will expire in 30 minutes</p>

  <a href=${verifyUrl} clicktracking=off>${verifyUrl}</a>

  <p>Regards</p>
  <p>E-vote</p>
  `;

  const subject = 'Verify Your Email';

  const sent_from = process.env.EMAIL_USER;
  try {
    await sendEmail(subject, message, user.email, sent_from);

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500);
    throw new Error('Email not sent, Please try again later');
  }
});
const verify = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  console.log(verificationToken);
  const email = await Email.findOne({
    emailToken: verificationToken,
    expiresAt: { $gt: Date.now() },
  });
  console.log(email);

  if (!email) {
    res.status(404);
    throw new Error('Email verification token is not valid or has expired');
  }

  const user = await User.findOne({ _id: email.userId });
  user.confirmed = true;
  await user.save();
  res.status(200).json({
    message: 'You have successfully been verified',
  });
});

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verify,
};
