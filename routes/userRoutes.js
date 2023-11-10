const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.all('/signup', authController.signUp);
router.post('/confirmEmail', authController.confirmEmail);
router.post('/resendConfirmEmail', authController.resendConfirmEmail);
router.patch('/AssignUsername', authController.AssignUsername);
router.patch('/AssignPassword', authController.AssignPassword);
router.post('/login', authController.login);

//  Micro endPoints router
router.post('/checkBirthDate', userController.checkBirthDate);
router.post('/checkAvailableUsername', userController.checkAvailableUsername);
router.post('/checkAvailableEmail', userController.checkAvailableEmail);
router.post('/checkExistedEmail', userController.checkExistedEmail);

// router.patch('/updateMe', authController.protect, userController.updateMe);
// router.delete('/deleteMe', authController.protect, userController.deleteMe);
//router.post('/forgotPassword', authController.forgotPassword);
// router.patch(
//   '/updateMyPassword',
//   authController.protect,
//   authController.updatePassword,
// );
//router.patch('/resetPassword/:token', authController.resetPassword);
// /:the name of the variable we send with

module.exports = router;
