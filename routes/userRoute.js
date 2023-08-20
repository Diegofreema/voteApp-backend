const express = require('express');
const {
  registerUser,
  loginUser,
  logOutUser,
  adminPolls,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verify,
} = require('../controllers/userController');
const protect = require('../middleware/protect');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logOut', logOutUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.put('/confirmation/:verificationToken', verify);
router.post('/confirm', verifyEmail);

module.exports = router;
