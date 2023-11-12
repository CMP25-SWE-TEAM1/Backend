const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user_model');
const Hashtag = require('../models/hashtag_model');
const {
  selectNeededInfoForUser,
  selectNeededInfoForTweets,
  APIFeatures
} = require('../utils/api_features');

exports.getAllHashtages = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    req.query.sort = '-count';
    req.query.fields = 'title count';
    const apiFeatures = new APIFeatures(Hashtag.find(), req.query)
      .sort()
      .limitFields()
      .paginate();
    res.status(200).send(await apiFeatures.query);
  },
);

exports.getHastagTweets = catchAsync(
  async (
    req,
    res,
    next = (e) => {
      res.send(400).send(e);
    },
  ) => {
    const hashtagId = req.params.trend;
    const hashtag = await Hashtag.findById(hashtagId)
      .lean()
      .populate({
        path: 'tweet_list',
        populate: {
          path: 'userId',
          model: 'User',
        },
      })
      .exec();
      //TODO: Remove after adding auth
    req.user = await User.findById('654eed855b0fe11cd47fc7eb'); 
    if (!hashtag) {
      res.status(404).send('HashTag not found');
    } else {
      // filter deleted tweets and anu not tweet type
      hashtag.tweet_list = hashtag.tweet_list.filter(
        (tweet) => tweet.isDeleted !== true && tweet.type !== 'reply',
      );

      hashtag.tweet_list = await Promise.all(
        hashtag.tweet_list.map(async (tweet) => {
          tweet = { ...tweet, tweetOwner: tweet.userId };
          await selectNeededInfoForUser(tweet, req);
          return tweet;
        }),
      );

      res
        .status(200)
        .send(await selectNeededInfoForTweets(hashtag.tweet_list, req));
    }
  },
);
