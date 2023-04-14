const mongoose = require('mongoose');

const optionSChema = new mongoose.Schema({
  option: String,
  votes: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    question: String,
    options: [optionSChema],
    voted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created: {
      type: Date,
      default: Date.now(),
    },
    expiresIn: {
      type: Date,
      default: new Date(Date.now() + 1000 * 86400),
    },
  },
  {
    timestamps: true,
  }
);

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
