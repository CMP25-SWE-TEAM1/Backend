const { searchUser, searchTweets, searchHashtag } = require('./search_helper');
const { paginate } = require('../utils/api_features');


/**
Controller for handling search. 
@module controllers/searchController
*/

/**
 * This function performs a search based on the type specified in the request query.
 * It can search for words in tweets, search for users with usernames or with part of their username, or search for hashtags.
 *
 * @async
 * @function search
 * @param {Object} req - The request object from the client. It should contain the type of search and the search word in the query.
 * @param {Object} res - The response object that will be sent to the client. It will contain the status of the request and the data (search results) if successful.
 * @param {Function} next - The next middleware function in the application’s request-response cycle.
 * @throws Will throw an error if the type of search or the search word is not specified in the request query.
 * @throws Will also throw an error if the type of search is not one of the allowed types ('user', 'tweet', 'hashtag').
 * @throws Will throw an error if there are no results for the search word.
 * @throws Will also throw an error if there is an issue with the database query.
 * @returns {Object} res - The response object containing the status of the request and the data (search results) if successful.
 */

exports.search = async (req, res, next) => {
  try {
    let result;
    const type = req.query.type;

    // Check For the type of search

    if (!type || type == undefined)
      return res.status(400).send({
        error:
          'Search request must have a type in query one of these values [ user , tweet , hashtag ] ',
      });

    // Check for the search word if missed

    const searchWord = req.query.word;
    if (!searchWord || searchWord == undefined)
      return res
        .status(400)
        .send({ error: 'Search request must have a search word in query' });
    req.searchWord = searchWord;

    if (type == 'user') {
      // return matching users using their username or screen name or part of them
      result = await searchUser(req, res, next);
    } else if (type == 'tweet') {
      // return tweets that include the search query
      result = await searchTweets(req, res, next);
    } else if (type == 'hashtag') {
      //return hashtags that include the search query
      result = await searchHashtag(req, res, next);
    } else {
      // not allowed search type
      return res.status(400).send({
        error:
          'Only these values [ user , tweet , hashtag ] are allowed in type of search request',
      });
    }

    // paginate result

    try {
      if (result == undefined || result.length == 0)
        return res
          .status(404)
          .send({ error: 'There is no result for this search word' });
      const paginatedResults = paginate(result, req);

      // send result
      return res
        .status(200)
        .send({ status: 'success', results: paginatedResults });
    } catch (error) {
      console.log(error.message);
      return res.status(404).send({ error: error.message });
    }
  } catch (error) {
    // Handle and log errors
    console.error(error.message);
    return res.status(500).send({ error: error.message });
  }
};
