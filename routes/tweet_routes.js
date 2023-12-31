const express = require('express');
const tweetController = require('../controllers/tweet_controller');
const authController = require('../controllers/auth_controller');
const { like, unlike } = require('../controllers/user_interactions_controller');
const searchController = require('../controllers/search_controller');

const tweetRouter = express.Router();

tweetRouter.post('/', authController.protect, tweetController.addTweet);

tweetRouter.get('/search', authController.protect, searchController.search);

tweetRouter.get('/:tweetId', authController.protect, tweetController.getTweet);

tweetRouter.delete('/:tweetId', authController.protect,tweetController.deleteTweet);

tweetRouter.get('/likers/:tweetId', authController.protect,tweetController.getTweetLikers,);
tweetRouter.get('/retweeters/:tweetId', authController.protect,tweetController.getTweetRetweeters,);

tweetRouter.patch('/retweet/:tweetId', authController.protect,tweetController.retweetTweet,);

tweetRouter.get('/replies/:tweetId', authController.protect, tweetController.getTweetReplies);

tweetRouter.post('/like/:tweetId', authController.protect, like);

tweetRouter.post('/unlike/:tweetId', authController.protect, unlike);

tweetRouter.patch('/unretweet/:tweetId', authController.protect,tweetController.undoRetweetTweet,);

tweetRouter.get('/tweetOwner/:tweetId',authController.protect,tweetController.getTweetOwner);

module.exports = tweetRouter;
