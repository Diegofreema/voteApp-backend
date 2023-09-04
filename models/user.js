const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: 'String',
    required: true,
    unique: true,
  },
  email: {
    type: 'String',
    required: true,
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    trim: true,
  },
  password: {
    type: 'String',
    required: true,
  },
  polls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poll' }],
  created: {
    type: Date,
    default: Date.now(),
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (attempted, next) {
  try {
    return await this.password.compare(attempted, this.password);
  } catch (error) {
    next(error);
  }
};
userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.SECRET, {
    expiresIn: '1d',
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
