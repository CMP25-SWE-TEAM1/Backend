
const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const { upload } = require('../utils/firebase');


userRouter.get('/profile/:username', UserController.getProfile);

userRouter.post('/profile', UserController.updateProfile);

userRouter.post('/profile/image', upload.single('profile_image'),UserController.updateProfileImage);

module.exports = userRouter; 



