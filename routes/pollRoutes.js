const express = require('express');
const {
  allPolls,
  createPoll,
  adminPolls,
  deletePoll,
  vote,
  singlePoll,
} = require('../controllers/pollController');
const protect = require('../middleware/protect');
const router = express.Router();

router.get('/', allPolls);
router.get('/:id', singlePoll);
router.post('/create', protect, createPoll);
// router.get('/:id')
router.delete('/:id', protect, deletePoll);
// router.post('/:id')
router.post('/vote/:id', protect, vote);
router.get('/polls', protect, adminPolls);

module.exports = router;
