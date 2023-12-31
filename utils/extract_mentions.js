const User = require('../models/user_model');

// extract the hashtags in the tweet description
const extractMentions = async (tweet) => {
  const tweetId = tweet.id;
  const tweetDescription = tweet.description;
  if (tweetDescription === undefined || tweetDescription === '') return;
  const words = tweetDescription.split(/\s+|\n+/);
  const mentionWords = words.filter(
    (word, index, self) => /^@/.test(word) && self.indexOf(word) === index,
  );

  for (const mentionWord of mentionWords) {
    const username = mentionWord.replace('@', '');
    const mentionedUser = await User.findOne({ username });
    // Check for this mentionedUser if exists in the database
    // if he/she exists, update his/her data and save
    console.log(mentionedUser, 'kkkkkkkkkkkkkkkkkk');
    if (mentionedUser) {
      console.log(mentionedUser, 'kkkkkkkkkkkkkkkkkk');
      mentionedUser.mentionList.push(tweetId);
      console.log(mentionedUser, 'kkkkkkkkkkkkkkkkkk');
      await mentionedUser.save();
      console.log(mentionedUser, 'kkkkkkkkkkkkkkkkkk');
    }
  }
};

module.exports = extractMentions;
