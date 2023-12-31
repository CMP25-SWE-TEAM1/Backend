const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/user_controller');
const chatController = require('../controllers/chat_controller');
const authController = require('../controllers/auth_controller');
const searchController = require('../controllers/search_controller');
const userInteracrionsController = require('../controllers/user_interactions_controller');
const { upload } = require('../utils/firebase');

//google endpoint
userRouter.post('/googleAuth', authController.googleAuth);
userRouter.post(
  '/confirmPassword',
  authController.protect,
  authController.confirmPassword,
);
//  Micro endPoints router
userRouter.post('/checkBirthDate', userController.checkBirthDate); // stage 1

userRouter.post(
  '/checkAvailableUsername',
  userController.checkAvailableUsername,
);

userRouter.post('/checkAvailableEmail', userController.checkAvailableEmail); // stage 1

userRouter.post(
  '/existedEmailORusername',
  userController.existedEmailORusername,
);

userRouter.post('/signup', authController.signUp); // stage 1

userRouter.post('/confirmEmail', authController.confirmEmail);

userRouter.post('/resendConfirmEmail', authController.resendConfirmEmail);

userRouter.patch('/AssignUsername', authController.AssignUsername);

userRouter.patch('/AssignPassword', authController.AssignPassword);

userRouter.post('/login', authController.login);

userRouter.post('/forgotpassword', authController.forgotPassword);

userRouter.patch('/resetpassword', authController.resetPassword);
userRouter.post(
  '/checkPasswordResetToken',
  authController.checkPasswordResetToken,
);

userRouter.get(
  '/profile/:username',
  authController.protect,
  userController.getProfile,
);
userRouter.get(
  '/profileById/:id',
  authController.protect,
  userController.getProfileById,
);

userRouter.get(
  '/profile',
  authController.protect,
  userController.getCurrUserProfile,
);

userRouter.patch(
  '/profile',
  authController.protect,
  userController.updateProfile,
);

userRouter.patch(
  '/profile/image',
  [authController.protect, upload.single('profile_image')],
  userController.updateProfileImage,
);

userRouter.patch(
  '/profile/banner',
  [authController.protect, upload.single('profile_banner')],
  userController.updateProfileBanner,
);

userRouter.get(
  '/chat/:userId',
  authController.protect,
  chatController.getMessages,
);

userRouter.get(
  '/chat/messagesAfterCertainTime/:userId',
  authController.protect,
  chatController.getMessagesAfterCertainTime,
);

userRouter.get(
  '/chat/messagesBeforeCertainTime/:userId',
  authController.protect,
  chatController.getMessagesBeforeCertainTime,
);

userRouter.post(
  '/:username/follow',
  authController.protect,
  userInteracrionsController.follow,
);

userRouter.post(
  '/:username/unfollow',
  authController.protect,
  userInteracrionsController.unfollow,
);

userRouter.get(
  '/profile/:username/followers',
  authController.protect,
  userInteracrionsController.getFollowers,
);

userRouter.get(
  '/profile/:username/followings',
  authController.protect,
  userInteracrionsController.getFollowings,
);

userRouter.delete(
  '/profile/image',
  authController.protect,
  userController.deleteProfileImage,
);

userRouter.delete(
  '/profile/banner',
  authController.protect,
  userController.deleteProfileBanner,
);

userRouter.patch(
  '/updateusername',
  authController.protect,
  authController.updateUsername,
);

userRouter.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword,
);

userRouter.get('/useremail', authController.protect, authController.userEmail);

userRouter.post(
  '/updateemail',
  authController.protect,
  authController.updateEmail,
);

userRouter.post(
  '/verifyemail',
  authController.protect,
  authController.verifyEmail,
);

userRouter.patch(
  '/:username/mute',
  authController.protect,
  userInteracrionsController.mute,
);

userRouter.patch(
  '/:username/unmute',
  authController.protect,
  userInteracrionsController.unmute,
);

userRouter.patch(
  '/:username/block',
  authController.protect,
  userInteracrionsController.block,
);

userRouter.patch(
  '/:username/unblock',
  authController.protect,
  userInteracrionsController.unblock,
);

userRouter.get(
  '/blockList',
  authController.protect,
  userInteracrionsController.getBlockList,
);

userRouter.get(
  '/mutedList',
  authController.protect,
  userInteracrionsController.getMuteList,
);

userRouter.get('/search', authController.protect, searchController.search);
module.exports = userRouter;
