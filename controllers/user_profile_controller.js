const express = require('express');
const User = require('../models/user_model');
const mongoose = require('mongoose');
const { paginate } = require('../utils/api_features');

/**
 * This function retrieves the tweets of a specific user.
 * It checks if the current user has blocked the specified user or if the specified user has blocked the current user.
 * If the current user and the specified user have not blocked each other, the function retrieves the tweets of the specified user.
 *
 * @async
 * @memberof module:controllers/userController
 * @function getUserTweets
 * @param {Object} req - The request object from the client. It should contain the user's ID and the username of the user whose tweets are to be retrieved.
 * @param {Object} res - The response object that will be sent to the client. It will contain the status of the request and the data (tweets) if successful.
 * @throws Will throw an error if the specified user is not found or if the specified user has no tweets.
 * @throws Will also throw an error if there is an issue with the database query.
 * @returns {Object} res - The response object containing the status of the request and the data (tweets) if successful.
 */
exports.getUserTweets = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);

    username = req.params.username;

    const user = await User.findOne({ username });

    if (!user) return res.status(404).send({ error: 'User Not Found' });

    if (me.blockingUsers.includes(user._id)) {
      return res.status(200).send({
        message:
          "you block this user ! you can't see his tweets and he can't see your tweets",
      });
    }

    if (user.blockingUsers.includes(me._id)) {
      return res.status(200).send({
        message:
          "this user blocks you ! you can't see his tweets and he can't see your tweets",
      });
    }

    if (user.tweetList == undefined || user.tweetList.length == 0)
      return res.status(404).send({ error: 'This user has no tweets' });

    const tweets = await User.aggregate([
      {
        $match: { _id: user._id },
      },
    ])
      .unwind('tweetList')
      .lookup({
        from: 'tweets',
        localField: 'tweetList.tweetId',
        foreignField: '_id',
        as: 'tweetList.tweet',
      })
      .unwind('tweetList.tweet')
      .match({
        $expr: {
          $not: { $in: ['$tweetList.tweet.userId', '$blockingUsers'] },
        },
      })
      .match({
        $expr: {
          $not: { $in: ['$tweetList.tweet.userId', me.blockingUsers] },
        },
      })
      .lookup({
        from: 'users',
        localField: 'tweetList.tweet.userId',
        foreignField: '_id',
        as: 'tweetList.tweet.tweet_owner',
      })
      .match({
        'tweetList.tweet.isDeleted': false,
        'tweetList.tweet.tweet_owner.active': true,
        'tweetList.tweet.tweet_owner.isDeleted': false,
      })
      .sort({
        'tweetList._id': -1,
      })
      .unwind('tweetList.tweet.tweet_owner')
      .match({
        $expr: {
          $not: { $in: ['$_id', '$tweetList.tweet.tweet_owner.blockingUsers'] },
          $not: { $in: [me._id, '$tweetList.tweet.tweet_owner.blockingUsers'] },
        },
      })
      .project({
        tweetList: {
          tweet: {
            id: '$tweetList.tweet._id',
            referredTweetId: '$tweetList.tweet.referredReplyId',
            referredReplyId: 1,
            description: 1,
            likesNum: { $size: '$tweetList.tweet.likersList' },
            repliesNum: '$tweetList.tweet.repliesCount',
            repostsNum: { $size: '$tweetList.tweet.retweetList' },
            media: 1,
            type: '$tweetList.type',
            creation_time: '$tweetList.tweet.createdAt',
            tweet_owner: {
              id: '$tweetList.tweet.userId',
              username: 1,
              nickname: 1,
              bio: 1,
              profile_image: '$tweetList.tweet.tweet_owner.profileImage',
              followers_num: {
                $size: '$tweetList.tweet.tweet_owner.followersUsers',
              },
              following_num: {
                $size: '$tweetList.tweet.tweet_owner.followingUsers',
              },
            },
            isLiked: { $in: [req.user._id, '$tweetList.tweet.likersList'] },
            isRetweeted: {
              $in: [req.user._id, '$tweetList.tweet.retweetList'],
            },
            isFollowed: {
              $in: [
                req.user._id,
                '$tweetList.tweet.tweet_owner.followersUsers',
              ],
            },
            isFollowingMe: {
              $in: [
                req.user._id,
                '$tweetList.tweet.tweet_owner.followingUsers',
              ],
            },
          },
        },
      })
      .group({
        _id: '$_id',
        tweetList: { $push: '$tweetList.tweet' },
      });
    try {
      if (tweets[0].tweetList == undefined || tweets[0].tweetList.length == 0)
        return res.status(404).send({ error: 'This user has no tweets' });
      const paginatedTweets = paginate(tweets[0].tweetList, req, res);
      return res.send({ status: 'success', posts: paginatedTweets });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * This function retrieves the tweets that a specific user has liked.
 * It checks if the current user has blocked the specified user or if the specified user has blocked the current user.
 * If the current user and the specified user have not blocked each other, the function retrieves the tweets that the specified user has liked.
 *
 * @async
 * @memberof module:controllers/userController
 * @function getUserLikedTweets
 * @param {Object} req - The request object from the client. It should contain the user's ID and the username of the user whose liked tweets are to be retrieved.
 * @param {Object} res - The response object that will be sent to the client. It will contain the status of the request and the data (tweets) if successful.
 * @throws Will throw an error if the specified user is not found or if the specified user has not liked any tweets.
 * @throws Will also throw an error if there is an issue with the database query.
 * @returns {Object} res - The response object containing the status of the request and the data (tweets) if successful.
 */
exports.getUserLikedTweets = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);

    username = req.params.username;

    const user = await User.findOne({ username });

    if (!user) return res.status(404).send({ error: 'User Not Found' });

    if (me.blockingUsers.includes(user._id)) {
      return res.status(200).send({
        message:
          "you block this user ! you can't see his tweets and he can't see your tweets",
      });
    }

    if (user.blockingUsers.includes(me._id)) {
      return res.status(200).send({
        message:
          "this user blocks you ! you can't see his tweets and he can't see your tweets",
      });
    }

    // if (user.tweetList == undefined || user.tweetList.length == 0)
    //   return res.status(404).send({ error: 'This user has no tweets' });

    const tweets = await User.aggregate([
      {
        $match: { _id: user._id },
      },
    ])
      .project({
        likedTweets: 1,
      })
      .unwind('likedTweets')
      .lookup({
        from: 'tweets',
        localField: 'likedTweets',
        foreignField: '_id',
        as: 'likedTweets',
      })
      .unwind('likedTweets')
      .lookup({
        from: 'users',
        localField: 'likedTweets.userId',
        foreignField: '_id',
        as: 'likedTweets.tweet_owner',
      })
      .unwind('likedTweets.tweet_owner')
      .match({
        $expr: {
          $not: { $in: [me._id, '$likedTweets.tweet_owner.blockingUsers'] },
        },
      })
      .match({
        $expr: {
          $not: { $in: ['$likedTweets.userId', me.blockingUsers] },
        },
      })
      .match({
        'likedTweets.isDeleted': false,
        'likedTweets.tweet_owner.active': true,
        'likedTweets.tweet_owner.isDeleted': false,
      })
      .match({
        $expr: {
          $not: { $in: ['$_id', '$likedTweets.tweet_owner.blockingUsers'] },
        },
      })
      .match({
        $expr: {
          $not: { $in: [me._id, '$likedTweets.tweet_owner.blockingUsers'] },
        },
      })
      .sort({
        'likedTweets._id': -1,
      })
      .unwind('likedTweets.tweet_owner')
      .project({
        likedTweets: {
          id: '$likedTweets._id',
          referredTweetId: '$likedTweets.referredReplyId',
          referredReplyId: 1,
          description: 1,
          likesNum: { $size: '$likedTweets.likersList' },
          repliesNum: '$likedTweets.repliesCount',
          repostsNum: { $size: '$likedTweets.retweetList' },
          media: 1,
          type: 1,
          creation_time: '$likedTweets.createdAt',
          tweet_owner: {
            id: '$likedTweets.userId',
            username: 1,
            nickname: 1,
            bio: 1,
            profile_image: '$likedTweets.tweet_owner.profileImage',
            followers_num: {
              $size: '$likedTweets.tweet_owner.followersUsers',
            },
            following_num: {
              $size: '$likedTweets.tweet_owner.followingUsers',
            },
          },
          isLiked: { $in: [req.user._id, '$likedTweets.likersList'] },
          isRetweeted: { $in: [req.user._id, '$likedTweets.retweetList'] },
          isFollowed: {
            $in: [req.user._id, '$likedTweets.tweet_owner.followersUsers'],
          },
          isFollowingMe: {
            $in: [req.user._id, '$likedTweets.tweet_owner.followingUsers'],
          },
        },
      })
      .group({
        _id: '$_id',
        likedTweets: { $push: '$likedTweets' },
      });

    try {
      if (
        tweets.length == 0 ||
        tweets[0].likedTweets == undefined ||
        tweets[0].likedTweets.length == 0
      )
        return res.status(404).send({ error: 'This user has no liked tweets' });
      const paginatedTweets = paginate(tweets[0].likedTweets, req);
      return res.send({ status: 'success', posts: paginatedTweets });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};
