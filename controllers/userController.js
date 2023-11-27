const express = require('express');
const User = require('../models/user_model');
const { bucket, uuidv4 } = require('../utils/firebase');
const catchAsync = require('../utils/catchAsync');

const DEFAULT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/gigachat-img.appspot.com/o/56931877-1025-4348-a329-663dadd37bba-black.jpg?alt=media&token=fca10f39-2996-4086-90db-0cd492a570f2';

const UserController = {
  checkBirthDate: (req, res) => {
    const { birthDate } = req.body;
    if (!birthDate) {
      return res
        .status(400)
        .json({ error: 'birthDate is required in the request body' });
    }
    const userAge = calculateAge(birthDate);

    if (userAge >= 13) {
      res.json({ message: 'User is above 13 years old.' });
    } else {
      res.status(403).json({
        error: 'User must be at least 13 years old Or Wrong date Format ',
      });
    }
  },

  checkAvailableUsername: catchAsync(async (req, res, next) => {
    const { username } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ error: 'Username is required in the request body' });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    res.status(200).json({ message: 'Username is available' });
  }),

  checkAvailableEmail: catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'Email is required in the request body' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.active) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(200).json({ message: 'Email is available' });
  }),

  ExistedEmailORusername: catchAsync(async (req, res, next) => {
    const { email, username } = req.body;

    if (!email && !username) {
      return res
        .status(400)
        .json({ error: 'Email or username is required in the request body' });
    }

    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser.active) {
        return res.status(200).json({ message: 'Email is existed' });
      }
    } else {
      const existingUser = await User.findOne({ username });

      if (existingUser && existingUser.active) {
        return res.status(200).json({ message: 'username is existed' });
      }
    }
    res.status(404).json({ error: 'Email or username  not existed' });
  }),

  getProfile: async (req, res) => {
    try {
      const { username } = req.params.username;
      if (!username) return res.status(400).send({ error: 'Bad Request' });

      const user = await User.findOne({ username: username }).select(
        'username nickname _id bio profileImage bannerImage location website birthDate joinedAt followingUsers followersUsers',
      );

      if (!user) return res.status(404).send({ error: 'user not found' });

      const result = {};
      result.status = 'success';
      result.user = {
        username: user.username,
        nickname: user.nickname,
        _id: user._id,
        bio: user.bio,
        profile_image: user.profileImage,
        banner_image: user.bannerImage,
        location: user.location,
        website: user.website,
        birth_date: user.birthDate,
        joined_date: user.joinedAt,
        followings_num: user.followersUsers.length,
        followers_num: user.followingUsers.length,
      };

      return res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      // get the sent data
      const updatedProfileData = {};
      if (req.query.bio) updatedProfileData.bio = req.query.bio;
      if (req.query.location) updatedProfileData.location = req.query.location;
      if (req.query.website) updatedProfileData.website = req.query.website;
      if (req.query.nickname) updatedProfileData.nickname = req.query.nickname;
      if (req.query.birthDate)
        updatedProfileData.birthDate = req.query.birthDate;

      if (Object.keys(updatedProfileData).length === 0)
        return res.status(400).send('Bad Request');
      // update tha user
      const user = await User.findByIdAndUpdate(
        req.user._id,
        updatedProfileData,
        { new: true },
      );

      // check if the user doesn't exist
      if (!user) return res.status(404).send('user not Found');

      return res.status(204).end();
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfileImage: async (req, res) => {
    try {
      if (!req.file) return res.status(400).send('Bad Request');

      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.createWriteStream().end(req.file.buffer);

      // Get the download URL with a token
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '12-31-9999', // Set the expiration date to infinity :D
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: url },
        { new: true },
      ).select('profileImage');

      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: url,
      };
      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  updateProfileBanner: async (req, res) => {
    try {
      if (!req.file) return res.status(400).send('Bad Request');

      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.createWriteStream().end(req.file.buffer);

      // Get the download URL with a token
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '12-31-9999', // Set the expiration date to infinity :D
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileBanner: url },
        { new: true },
      ).select('profileBanner');

      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: url,
      };
      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  deleteProfileImage: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: DEFAULT_IMAGE_URL },
        { new: true },
      ).select('profileImage');
      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: DEFAULT_IMAGE_URL,
      };

      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  deleteProfileBanner: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileBanner: DEFAULT_IMAGE_URL },
        { new: true },
      ).select('profileBanner');
      if (!user) return res.status(404).send('user not Found');

      const result = {
        status: 'image uploaded successfully',
        image_profile_url: DEFAULT_IMAGE_URL,
      };

      res.status(200).send(result);
    } catch (error) {
      // Handle and log errors
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  calculateAge: (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age -= 1;
    }
    return age;
  },
};

const filterObj = (obj, ...filter) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //Object.key(objName) array contian the key names of the object properties
    if (filter.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = UserController;
