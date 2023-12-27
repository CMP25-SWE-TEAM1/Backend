// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const User = require('../models/user_model');
// const homepageController = require('../controllers/homepage_controller');
// const app = require('../app');
// const Tweet = require('../models/tweet_model');

// const user0 = {
//   username: 'sara',
//   email: 'sara@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const user1 = {
//   username: 'karreeem_',
//   email: 'kareemalaa555@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   tweetList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const userWithoutFollowing = {
//   username: 'Amr',
//   email: 'Amr@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   tweetList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const userWithFollowingWithNoTweets = {
//   username: 'Samy',
//   email: 'Samy@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   tweetList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const followingUserWithoutTweetList = {
//   username: 'Ahmed',
//   email: 'Ahmed@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   tweetList: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// const tweet = {
//   description: 'tweeeeeeeeeeeet #Gaza #Palestine',
//   media: [
//     {
//       data: 'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//       type: 'jpg',
//       _id: '654c193b688f342c88a547e9',
//     },
//   ],
//   views: 0,
//   repliesCount: 1,
//   likersList: ['654eed855b0fe11cd47fc7eb', '6550d2f9f9088e88318fd10c'],
//   retweetList: [],
//   quoteRetweetList: [],
//   type: 'tweet',
//   referredTweetId: '654c208f3476660250272d80',
//   createdAt: '2023-11-30T23:25:51.078Z',
//   isDeleted: false,
//   __v: 0,
//   userId: '654e915d9d2badfa163e3c97',
// };

// const tweetOwner = {
//   username: 'malek',
//   email: 'malek@gmail.com',
//   bio: 'we are dead',
//   birthDate: '6-4-2002',
//   password: '$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS',
//   bannerImage:
//     'https://pbs.twimg.com/profile_banners/1326868125124603904/1665947156/1500x500',
//   profileImage:
//     'https://userpic.codeforces.org/2533580/title/1904ded19f91a6d0.jpg',
//   phone: '01147119716',
//   nickname: 'Kareem Alaa',
//   website: 'www.wearedead.com',
//   followersUsers: [],
//   followingUsers: [],
//   location: 'cairo',
//   joinedAt: '12-9-2020',
//   active: true,
//   isDeleted: false,
// };

// let token;
// let testUser0;
// let testUser1;

// let testTweetOwner;
// let testUserWithoutFollowing;
// let testUserWithFollowingWithNoTweets;
// let testFollowingUserWithoutTweetList;
// async function createUser(userData) {
//   let user = await new User(userData);
//   return user;
// }

// async function createTweet(tweetData) {
//   let tweet = await new Tweet(tweetData);
//   return tweet;
// }

// async function deleteUser(userData) {
//   await User.deleteOne(userData);
// }

// async function deleteTweet(tweetData) {
//   await Tweet.deleteOne(tweetData);
// }

// beforeAll(async () => {
//   try {
//     // const mongoServer = await MongoMemoryServer.create();
//     // await mongoose.connect(mongoServer.getUri());

//     if (!process.argv.includes('--dev')) {
//       const DB = 'mongodb://127.0.0.1:27017/GigaChatUnitTest';
//       mongoose
//         .connect(DB, {
//           useNewUrlParser: true,
//           useUnifiedTopology: true,
//         })
//         .then(() => console.log('DB connection successful!'))
//         .catch((error) => {
//           console.error('Error connecting to the database:', error);
//         });
//     }
//     testTweetOwner = await createUser(tweetOwner);
//     tweet.userId = testTweetOwner._id;

//     testTweet = await createTweet(tweet);
//     console.log('line1');
//     user1.tweetList.push({ tweetId: testTweet._id, type: 'tweet' });
//     console.log('line2');

//     testUser1 = await createUser(user1);
//     console.log('line3');

//     user0.followingUsers.push(testUser1._id);
//     console.log('line4');

//     testUser0 = await createUser(user0);
//     console.log('line5');

//     testUserWithoutFollowing = await createUser(userWithoutFollowing);
//     console.log('line6');

//     testFollowingUserWithoutTweetList = await createUser(
//       followingUserWithoutTweetList,
//     );
//     console.log('line7');

//     userWithFollowingWithNoTweets.followingUsers.push(
//       testFollowingUserWithoutTweetList._id,
//     );

//     console.log('line8');

//     testUserWithFollowingWithNoTweets = await createUser(
//       userWithFollowingWithNoTweets,
//     );
//     console.log('line9');

//     // token = authController.signToken(testUser0._id.toString());
//   } catch (error) {
//     console.error('Error during setup:', error);
//   }
// });

// afterAll(async () => {
//   await deleteUser(user0);
//   await deleteUser(user1);
//   await deleteUser(tweetOwner);
//   await deleteTweet(tweet);
//   await mongoose.disconnect();
//   await mongoose.connection.close();
// });

// describe('GET /api/homepage/following', () => {
//   it('responds with 200 and following tweets when user exists', async () => {
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/homepage/following')
//       .set('Authorization', `Bearer ${token}`);
//     expect(response.status).toBe(200);
//     expect(response.body.tweetList[0].tweetDetails._id).toBe(
//       testTweet._id.toString(),
//     );
//     expect(response.body.tweetList[0].followingUser._id).toBe(
//       testUser1._id.toString(),
//     );
//     expect(response.body.tweetList[0].tweetDetails.tweet_owner._id).toBe(
//       testTweetOwner._id.toString(),
//     );
//     expect(response.body.tweetList[0].type).toBe('tweet');
//     expect(response.body.tweetList[0].isLiked).toBe(false);
//     expect(response.body.tweetList[0].isFollowed).toBe(false);
//   });

//   it('responds with 401 when user unAuthorized', async () => {
//     const response = await request(app).get('/api/homepage/following');
//     expect(response.status).toBe(401);
//   });

//   it('responds with undefined tweetList when no following user', async () => {
//     token = jwt.sign(
//       { id: testUserWithoutFollowing._id.toString() },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//       },
//     );
//     const response = await request(app)
//       .get('/api/homepage/following')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(404);
//     expect(response.body.tweetList).toBe(undefined);
//   });

//   it('responds with undefined tweetList when user has following users without tweetList ', async () => {
//     token = jwt.sign(
//       { id: testUserWithFollowingWithNoTweets._id.toString() },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//       },
//     );
//     const response = await request(app)
//       .get('/api/homepage/following')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(404);
//     expect(response.body.tweetList).toBe(undefined);
//   });

//   it('responds with 500 when internal server error happens', async () => {
//     jest
//       .spyOn(mongoose.model('User'), 'aggregate')
//       .mockImplementation(async () => new Error('Simulated error during save'));
//     console.log(testUser0, 'loooooooooooool');
//     token = jwt.sign({ id: testUser0._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     const response = await request(app)
//       .get('/api/homepage/following')
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(500);
//   });
// });
