const mongoose = require('mongoose');
const Tweet = require('../models/tweet_model');
const User = require('../models/user_model');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/api_features');

/**TODO:
 * 1 . add auth
 * */
exports.getFollowingTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    const user = await User.findById('654abf68d532cc9d284b6f90')
      .populate({
        path: 'followingUsers',
        populate: {
          path: 'tweetList',
          model: 'Tweet',
        },
      })
      .exec();
    const tweets = [];
    const { followingUsers } = user;
    followingUsers.forEach((followingUser) =>
      tweets.push(...followingUser.tweetList),
    );
    req.query.type = 'array';
    const apiFeatures = new APIFeatures(tweets, req.query).sort().paginate();
    res.status(200).send(await apiFeatures.query);
  },
);
