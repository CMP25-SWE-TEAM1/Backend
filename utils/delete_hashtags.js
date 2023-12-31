const Hashtag = require('../models/hashtag_model');

const deleteHashtags = async (tweet) => {
  const tweetId = tweet.id;
  const tweetDescription = tweet.description;
  if (tweetDescription === undefined || tweetDescription === '') return;
  const words = tweetDescription.split(/\s+|\n+/);
  const hashtagWords = words.filter(
    (word, index, self) => /^#/.test(word) && self.indexOf(word) === index,
  );
  for (const hashtagWord of hashtagWords) {
    const hashtag = await Hashtag.findOne({ title: hashtagWord });
    // Check for this hashtag if it exists in the database
    // if it exists, update its data and save
    if (hashtag) {
      hashtag.count--;
      hashtag.tweet_list.pull(tweetId);

      if (hashtag.count == 0) {
        await Hashtag.findOneAndDelete({ title: hashtagWord });
      } else {
        await hashtag.save();
      }
    }
  }
};

module.exports = deleteHashtags;
