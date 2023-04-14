const express = require('express');
const { registerUser, loginUser, logOutUser, adminPolls } = require('../controllers/userController');
const protect = require('../middleware/protect');
const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logOut', logOutUser)



module.exports = router;