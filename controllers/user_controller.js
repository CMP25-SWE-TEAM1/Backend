const express = require('express');
const User = require('../models/user_model');
const Media = require('../models/media_model');
const { deleteMedia } = require('../controllers/media_controller');
const Chat = require('../models/chat_model');
const Message = require('../models/message_model');
const mongoose = require('mongoose');

const { bucket, uuidv4 } = require('../utils/firebase');
const catchAsync = require('../utils/catch_async');

const DEFAULT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/gigachat-img.appspot.com/o/56931877-1025-4348-a329-663dadd37bba-black.jpg?alt=media&token=fca10f39-2996-4086-90db-0cd492a570f2';


/**
Controller for handling user profile.
@module controllers/userController
*/


/**
 * Check the user's birth date to determine if they are above 13 years old.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 400 - Bad Request if birthDate is not provided in the request body.
 * @returns {Object} - JSON response indicating whether the user is above 13 years old.
 * @throws {Object} 403 - Forbidden if the user is not at least 13 years old or if the date format is incorrect.
 *
 * @example
 * // Example request body
 * const requestBody = {
 *   birthDate: '2000-01-01'
 * };
 *
 * // Example usage in Express route
 * app.post('/checkBirthDate', checkBirthDate);
 */  
exports.checkBirthDate = async (req, res) => {
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
};

/**
 * Check if a username is available for registration.
 * @memberof module:controllers/userController 
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Object} 400 - Bad Request if the username is not provided in the request body.
 * @throws {Object} 409 - Conflict if the username already exists.
 * @returns {Object} - JSON response indicating whether the username is available or not.
 *
 * @example
 * // Example request body
 * const requestBody = {
 *   username: 'newUser123'
 * };
 *
 * // Example usage in Express route
 * app.post('/checkAvailableUsername', checkAvailableUsername);
 */
exports.checkAvailableUsername = catchAsync(async (req, res, next) => {
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
});


/**
 * Check if an email is available for registration.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Object} 400 - Bad Request if the email is not provided in the request body or has an invalid format.
 * @throws {Object} 409 - Conflict if the email already exists and is active.
 * @returns {Object} - JSON response indicating whether the email is available or not.
 *
 * @example
 * // Example request body
 * const requestBody = {
 *   email: 'newuser@example.com'
 * };
 *
 * // Example usage in Express route
 * app.post('/checkAvailableEmail', checkAvailableEmail);
 */
exports.checkAvailableEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: 'Email is required in the request body' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.active) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  res.status(200).json({ message: 'Email is available' });
});

/**
 * Check if an email or username already exists in the system and is active.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Object} 400 - Bad Request if both email and username are not provided in the request body.
 * @returns {Object} - JSON response indicating whether the email or username exists and is active.
 * @throws {Object} 404 - Not Found if neither the email nor the username exists or is not active.
 *
 * @example
 * // Example request body with email
 * const requestBodyWithEmail = {
 *   email: 'existinguser@example.com'
 * };
 *
 * // Example request body with username
 * const requestBodyWithUsername = {
 *   username: 'existingUser123'
 * };
 *
 * // Example usage in Express route
 * app.post('/existedEmailORusername', existedEmailORusername);
 */
exports.existedEmailORusername = catchAsync(async (req, res, next) => {
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
});

/**
 * Get the profile information for a specific user.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 400 - Bad Request if the username is not provided in the request parameters.
 * @throws {Object} 404 - Not Found if the user with the specified username is not found.
 * @throws {Object} 500 - Internal Server Error for other unexpected errors.
 * @returns {Object} - JSON response containing the profile information of the specified user.
 *
 * @example
 * // Example request parameters
 * const requestParams = {
 *   username: 'desiredUsername'
 * };
 *
 * // Example usage in Express route
 * app.get('/profile/:username', getProfile);
 */
exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currUser = req.user;

    if (!username) return res.status(400).send({ error: 'Bad Request' });

    const aggregateResult = await User.aggregate([
      { $match: { username: username, active: true, isDeleted: false } },
      {
        $project: {
          username: 1,
          nickname: 1,
          _id: 1,
          bio: 1,
          profileImage: 1,
          bannerImage: 1,
          location: 1,
          website: 1,
          birthDate: 1,
          joinedAt: 1,
          blockingUsers: 1,
          mutedUsers: 1,
          num_of_posts: { $size: '$tweetList' },
          num_of_likes: { $size: '$likedTweets' },
          followings_num: { $size: '$followingUsers' },
          followers_num: { $size: '$followersUsers' },
          isCurrUserBlocked: {
            $in: [currUser._id, '$blockingUsers'],
          },
          isWantedUserFollowed: {
            $in: [currUser._id, '$followersUsers'],
          },
          isFollowingMe: {
            $in: [currUser._id, '$followingUsers'],
          },
        },
      },
    ]);
    const wantedUser = aggregateResult[0];

    if (!wantedUser) return res.status(404).send({ error: 'user not found' });

    const isWantedUserBlocked = currUser.blockingUsers.includes(wantedUser._id);
    const isWantedUserMuted = currUser.mutedUsers.includes(wantedUser._id);

    const isCurruser = wantedUser._id.toString() === currUser._id.toString();

    const result = {};
    result.status = 'success';
    result.user = {
      username: wantedUser.username,
      nickname: wantedUser.nickname,
      _id: wantedUser._id,
      bio: wantedUser.bio,
      profile_image: wantedUser.profileImage,
      banner_image: wantedUser.bannerImage,
      location: wantedUser.location,
      website: wantedUser.website,
      birth_date: wantedUser.birthDate,
      joined_date: wantedUser.joinedAt,
      followings_num: wantedUser.followings_num,
      followers_num: wantedUser.followers_num,
      is_wanted_user_blocked: isWantedUserBlocked,
      is_wanted_user_muted: isWantedUserMuted,
      is_curr_user_blocked: wantedUser.isCurrUserBlocked,
      is_wanted_user_followed: wantedUser.isWantedUserFollowed,
      is_curr_user: isCurruser,
      num_of_posts: wantedUser.num_of_posts,
      num_of_likes: wantedUser.num_of_likes,
      isFollowingMe: wantedUser.isFollowingMe,
    };

    return res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Get the profile information for a user based on their unique identifier.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 400 - Bad Request if the user ID is not provided in the request parameters.
 * @throws {Object} 404 - Not Found if the user with the specified ID is not found.
 * @throws {Object} 500 - Internal Server Error for other unexpected errors.
 * @returns {Object} - JSON response containing the profile information of the specified user.
 *
 * @example
 * // Example request parameters
 * const requestParams = {
 *   id: '6065a95b754f76f609a0b4a5' // Replace with an actual user ID
 * };
 *
 * // Example usage in Express route
 * app.get('/profileById/:id', getProfileById);
 */
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const currUser = req.user;

    if (!id) return res.status(400).send({ error: 'Bad Request' });

    const aggregateResult = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          active: true,
          isDeleted: false,
        },
      },
      {
        $project: {
          username: 1,
          nickname: 1,
          _id: 1,
          bio: 1,
          profileImage: 1,
          bannerImage: 1,
          location: 1,
          website: 1,
          birthDate: 1,
          joinedAt: 1,
          blockingUsers: 1,
          mutedUsers: 1,
          num_of_posts: { $size: '$tweetList' },
          num_of_likes: { $size: '$likedTweets' },
          followings_num: { $size: '$followingUsers' },
          followers_num: { $size: '$followersUsers' },
          isCurrUserBlocked: {
            $in: [currUser._id, '$blockingUsers'],
          },
          isWantedUserFollowed: {
            $in: [currUser._id, '$followersUsers'],
          },
          isFollowingMe: {
            $in: [currUser._id, '$followingUsers'],
          },
        },
      },
    ]);
    const wantedUser = aggregateResult[0];

    if (!wantedUser) return res.status(404).send({ error: 'user not found' });

    const isWantedUserBlocked = currUser.blockingUsers.includes(wantedUser._id);
    const isWantedUserMuted = currUser.mutedUsers.includes(wantedUser._id);

    const isCurruser = wantedUser._id.toString() === currUser._id.toString();

    const result = {};
    result.status = 'success';
    result.user = {
      username: wantedUser.username,
      nickname: wantedUser.nickname,
      _id: wantedUser._id,
      bio: wantedUser.bio,
      profile_image: wantedUser.profileImage,
      banner_image: wantedUser.bannerImage,
      location: wantedUser.location,
      website: wantedUser.website,
      birth_date: wantedUser.birthDate,
      joined_date: wantedUser.joinedAt,
      followings_num: wantedUser.followings_num,
      followers_num: wantedUser.followers_num,
      is_wanted_user_blocked: isWantedUserBlocked,
      is_wanted_user_muted: isWantedUserMuted,
      is_curr_user_blocked: wantedUser.isCurrUserBlocked,
      is_wanted_user_followed: wantedUser.isWantedUserFollowed,
      is_curr_user: isCurruser,
      num_of_posts: wantedUser.num_of_posts,
      num_of_likes: wantedUser.num_of_likes,
      isFollowingMe: wantedUser.isFollowingMe,
    };

    return res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Get the profile information for the currently authenticated user.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 500 - Internal Server Error for unexpected errors.
 * @returns {Object} - JSON response containing the profile information of the currently authenticated user.
 *
 * @example
 * // Example usage in Express route
 * app.get('/currUserProfile', getCurrUserProfile);
 */
exports.getCurrUserProfile = async (req, res) => {
  try {
    const currUser = req.user;

    const result = {};
    result.status = 'success';
    result.user = {
      username: currUser.username,
      nickname: currUser.nickname,
      _id: currUser._id,
      bio: currUser.bio,
      profile_image: currUser.profileImage,
      banner_image: currUser.bannerImage,
      location: currUser.location,
      website: currUser.website,
      birth_date: currUser.birthDate,
      joined_date: currUser.joinedAt,
      followings_num: currUser.followingUsers.length,
      followers_num: currUser.followersUsers.length,
      num_of_posts: currUser.tweetList.length,
      num_of_likes: currUser.likedTweets.length,
    };

    return res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Update the profile information for the currently authenticated user.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 400 - Bad Request if no profile information is provided in the request body.
 * @throws {Object} 500 - Internal Server Error for unexpected errors.
 * @returns {Object} - No content (204) if the update is successful.
 *
 * @example
 * // Example request body
 * const requestBody = {
 *   bio: 'New bio',
 *   location: 'New location',
 *   website: 'https://newwebsite.com',
 *   nickname: 'NewNickname',
 *   birth_date: '1990-01-01' // ISO 8601 date string
 * };
 *
 * // Example usage in Express route
 * app.put('/updateProfile', updateProfile);
 */
exports.updateProfile = async (req, res) => {
  try {
    // get the sent data from the request body

    console.log(req.body);

    const { bio, location, website, nickname, birth_date } = req.body;

    if (
      bio === undefined &&
      location === undefined &&
      website === undefined &&
      nickname === undefined &&
      birth_date === undefined
    ) {
      return res.status(400).send({ error: 'Bad Request' });
    }

    if (bio !== undefined) req.user.bio = bio;
    if (location !== undefined) req.user.location = location;
    if (website !== undefined) req.user.website = website;
    if (nickname !== undefined) req.user.nickname = nickname;
    if (birth_date !== undefined) req.user.birthDate = new Date(birth_date);

    await req.user.save();

    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Update the profile image for the currently authenticated user.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 400 - Bad Request if no profile image URL is provided in the request body.
 * @throws {Object} 404 - Not Found if the specified profile image URL doesn't exist in the database.
 * @throws {Object} 500 - Internal Server Error for unexpected errors.
 * @returns {Object} - No content (204) if the update is successful.
 *
 * @example
 * // Example request body
 * const requestBody = {
 *   profile_image: 'https://example.com/profile-image.jpg'
 * };
 *
 * // Example usage in Express route
 * app.put('/updateProfileImage', updateProfileImage);
 */
exports.updateProfileImage = async (req, res) => {
  try {
    const { profile_image } = req.body;

    if (!profile_image) return res.status(400).send({ error: 'Bad request' });

    const media = await Media.findOne({ url: profile_image });

    if (!media)
      return res.status(404).send({ error: "The file doesn't exist" });

    req.user.profileImage = profile_image;

    await req.user.save();

    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Update the profile banner for the currently authenticated user.
 * @memberof module:controllers/userController
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 400 - Bad Request if no profile banner URL is provided in the request body.
 * @throws {Object} 404 - Not Found if the specified profile banner URL doesn't exist in the database.
 * @throws {Object} 500 - Internal Server Error for unexpected errors.
 * @returns {Object} - No content (204) if the update is successful.
 *
 * @example
 * // Example request body
 * const requestBody = {
 *   profile_banner: 'https://example.com/profile-banner.jpg'
 * };
 *
 * // Example usage in Express route
 * app.put('/updateProfileBanner', updateProfileBanner);
 */
exports.updateProfileBanner = async (req, res) => {
  try {
    const { profile_banner } = req.body;

    if (!profile_banner) return res.status(400).send({ error: 'Bad request' });

    const media = await Media.findOne({ url: profile_banner });

    if (!media)
      return res.status(404).send({ error: "The file doesn't exist" });

    req.user.bannerImage = profile_banner;

    await req.user.save();

    return res.status(204).end();
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Delete the profile image of the currently authenticated user.
 * @memberof module:controllers/userController
 * 
 * @async
 * @function
 * @memberof module:controllers/userController
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 500 - Internal Server Error if an unexpected error occurs during the image deletion process.
 * @returns {Object} - JSON response indicating the status of the image deletion.
 *
 * @example
 * // Example usage in Express route
 * app.delete('/deleteProfileImage', deleteProfileImage);
 */
exports.deleteProfileImage = async (req, res) => {
  try {
    await deleteMedia(req.user.profileImage);

    req.user.profileImage = DEFAULT_IMAGE_URL;

    await req.user.save();

    const result = {
      status: 'image deleted successfully',
      image_profile_url: DEFAULT_IMAGE_URL,
    };

    res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Delete the profile image for the currently authenticated user and set a default image URL.
 * @memberof module:controllers/userController
 * 
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 500 - Internal Server Error for unexpected errors during media deletion or user profile update.
 * @returns {Object} - JSON response indicating the success of the operation and the new profile image URL.
 *
 * @example
 * // Example usage in Express route
 * app.delete('/deleteProfileImage', deleteProfileImage);
 */
exports.deleteProfileBanner = async (req, res) => {
  try {
    if (!req.user.bannerImage)
      return res
        .status(400)
        .send({ error: 'Bad Request, Banner already deleted' });

    await deleteMedia(req.user.bannerImage);

    req.user.bannerImage = null;

    await req.user.save();

    const result = {
      status: 'image deleted successfully',
    };

    res.status(200).send(result);
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Get messages between the currently authenticated user and another user.
 * @memberof module:controllers/userController
 * 
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Object} 404 - Not Found if the specified user doesn't exist or the user tries to talk to themselves.
 * @throws {Object} 500 - Internal Server Error for unexpected errors during the message retrieval process.
 * @returns {Object} - JSON response containing the messages between the two users.
 *
 * @example
 * // Example usage in Express route
 * app.get('/api/user/chat/{userId}', getMessages);
 */
exports.getMessages = async (req, res) => {
  try {
    const recieverUser = await User.findById(req.params.userId).select('_id');
    // user cant talk to him/herself

    if (
      recieverUser &&
      recieverUser._id.toString() !== req.user._id.toString()
    ) {
      // get the chat id of certain user

      const chatId = await User.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
        },
        {
          $project: { chatList: 1 },
        },
      ])
        .lookup({
          from: 'chats',
          localField: 'chatList',
          foreignField: '_id',
          as: 'chats',
        })
        .unwind('chats')
        .project({ chats: 1, _id: 0 })
        .addFields({
          'chats.exist': {
            $in: [
              new mongoose.Types.ObjectId(req.params.userId),
              '$chats.usersList',
            ],
          },
        })
        .project({ id: '$chats._id', exist: '$chats.exist' })
        .match({
          exist: true,
        });
      // if chat id exist get the messages in it else send empty array
      // and also specify if the message is mine or not in the response
      if (chatId.length > 0) {
        const size = parseInt(req.query.count, 10) || 10;

        const skip = ((req.query.page || 1) - 1) * size;
        const messages = await Chat.aggregate([
          {
            $match: { _id: chatId[0].id },
          },
          {
            $project: { messagesList: 1, _id: 0 },
          },
        ])
          .lookup({
            from: 'messages',
            localField: 'messagesList',
            foreignField: '_id',
            as: 'message',
          })
          .unwind('message')
          .project({ message: 1 })
          .addFields({
            'message.mine': {
              $eq: [
                new mongoose.Types.ObjectId(req.user._id),
                '$message.sender',
              ],
            },
          })
          .project({
            id: '$message._id',
            description: '$message.description',
            media: '$message.media',
            isDeleted: '$message.isDeleted',
            mine: '$message.mine',
            seen: '$message.seen',
            sendTime: '$message.sendTime',
          })
          .sort({ id: -1 })
          .skip(skip)
          .limit(size)
          .sort({ id: 1 });
        // after sending respose all unseen messages in this chat of the another user not mine is now seen to me so update its state
        const messages2 = await Chat.aggregate([
          {
            $match: { _id: chatId[0].id },
          },
          {
            $project: { messagesList: 1, _id: 0 },
          },
        ])
          .lookup({
            from: 'messages',
            localField: 'messagesList',
            foreignField: '_id',
            as: 'message',
          })
          .unwind('message')
          .project({ message: 1 })
          .project({
            id: '$message._id',
            sender: '$message.sender',
            seen: '$message.seen',
          })
          .match({
            sender: { $ne: new mongoose.Types.ObjectId(req.user._id) },
            seen: { $eq: false },
          })
          .project({ id: 1 })
          .group({
            _id: null,
            arrayOfIds: { $push: '$id' },
          })
          .project({
            arrayOfIds: 1,
            _id: 0,
          });
        if (messages2.length > 0) {
          await Message.updateMany(
            { _id: { $in: messages2[0].arrayOfIds } },
            { $set: { seen: true } },
          );
        }
        res.status(200).json({
          status: 'messages get success',
          data: messages,
        });
      } else {
        const messages = [];
        res.status(200).json({
          status: 'messages get success',
          data: messages,
        });
      }
    } else {
      res.status(404).json({
        status: 'This User Doesnt exist',
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Calculate the age based on the given birth date.
 * @memberof module:controllers/userController
 * 
 * @function
 * @param {string} birthDate - The birth date in string format (e.g., 'YYYY-MM-DD').
 * @returns {number} - The calculated age.
 *
 * @example
 * // Example usage
 * const birthDate = '1990-01-15';
 * const age = calculateAge(birthDate);
 * console.log(age); // Output: 33 (assuming the current date is 2023-01-15)
 */
function calculateAge(birthDate) {
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
}

exports.calculateAge = calculateAge;
