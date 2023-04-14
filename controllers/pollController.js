const asyncHandler = require('express-async-handler');
const Poll = require('../models/poll');
const User = require('../models/user');

const allPolls = asyncHandler(async (req, res) => {
  const polls = await Poll.find();
  if (polls.length > 0) {
    res.status(200).json(polls);
  } else {
    res.status(400);
    throw new Error('No polls available at this time');
  }
});
const singlePoll = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const poll = await Poll.findById(id);
  if (poll) {
    res.status(200).json(poll);
  } else {
    res.status(400);
    throw new Error('No matching poll at this time');
  }
});

const createPoll = asyncHandler(async (req, res, next) => {
  const { question, options } = req.body;
  const user = await User.findById(req.user._id);

  if (!question || !options) {
    res.status(400);
    throw new Error('Please fill all fields');
  }
  //  && user.isAdmin === true
  if (user) {
    const poll = await Poll.create({
      question,
      options: options.map((option) => ({
        option,
        votes: 0,
      })),
    });
    res.status(201).json(poll);
  } else {
    res.status(400);
    throw new Error('Please log in');
  }
});
const adminPolls = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const polls = await Poll.find();
  if (user) {
    return res.status(200).json(polls);
  } else {
    res.status(400);
    throw new Error('No polls for an Unauthorized user');
  }
});

const deletePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const poll = await Poll.findById(id);
  const user = await User.findById(req.user._id);
  if (!poll) {
    res.status(400);
    throw new Error('No polls available');
  }
  if (user && poll) {
    await poll.deleteOne();
    res.status(202).json(poll);
  } else {
    res.status(400);
    throw new Error('Not an Unauthorized user, please login');
  }
});

const vote = asyncHandler(async (req, res) => {
  const userId = await User.findById(req.user._id);

  const pollId = req.params.id;
  const answer = req.body.answer;

  if (!userId) {
    res.status(400);
    throw new Error('Please log in');
  }
  if (answer) {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      res.status(400);
      throw new Error('No poll found');
    }
    const vote = poll.options.map((option) => {
      if (option.option === answer) {
        return {
          option: option.option,
          _id: option._id,
          votes: option.votes + 1,
        };
      } else {
        return option;
      }
    });

    const ifVoted = poll.voted.filter(
      (vote) => vote.toString() === userId._id.toString()
    );
    console.log(ifVoted, 96);
    if (ifVoted.length > 0) {
      res.status(400);
      throw new Error('Already voted');
    } else {
      poll.voted.push(userId);
      poll.options = vote;
      await poll.save();
      res.status(202).json(poll);
    }
  } else {
    res.status(400);
    throw new Error('No answer provided');
  }
});

module.exports = {
  allPolls,
  createPoll,
  adminPolls,
  deletePoll,
  vote,
  singlePoll,
};
