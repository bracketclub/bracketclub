var validator = require('./validator'),
    _ = require('underscore'),
    quickCheck = require('./quickCheck')(),
    async = require('async'),
    realurl = require('realurl');

module.exports = function(opts) {

  var appName = opts.appName,
      trackTwitter = opts.trackTwitter;

  return function(tweet, cb) {

    var validate = function(testBracket) {
          if (testBracket && validator.validateTournament(testBracket, {testOnly: true}) !== false) {
            return testBracket;
          }
          return null;
        },
        expandedUrls = _.pluck(tweet.entities.urls, 'expanded_url'),
        getAppUrls = function(url) {
          return url.indexOf(appName) > -1;
        },
        urlsToHashes = function(url) {
          return url.split('#')[1];
        },
        appUrls = _.filter(expandedUrls, getAppUrls),
        appHashes = _.compact(_.map(appUrls, urlsToHashes)),
        otherUrls = _.without(expandedUrls, appUrls),
        hashtags = _.without(_.pluck(tweet.entities.hashtags, 'text'), trackTwitter),
        textChunks = tweet.text.split(' '),
        looksGood = function(item) {
          return quickCheck.test(item);
        },
        bracket = null;

    // Most common scenario will be a t.co shortened tweetyourbracket.com url with a hash on it
    bracket = _.find(appHashes, looksGood);
    if (validate(bracket)) return cb(null, bracket);

    // Also test for a valid hashtag
    bracket = _.find(hashtags, looksGood);
    if (validate(bracket)) return cb(null, bracket);

    // Also test for a chunk of text that looks good
    bracket = _.find(textChunks, looksGood);
    if (validate(bracket)) return cb(null, bracket);

    // Last, check shortened urls to see if the are tweetyourbracket urls
    async.concat(otherUrls, realurl.get, function(err, realUrls) {
      if (err) return cb(err, null);
      var realTYBUrlHash = _.find(_.compact(_.map(_.filter(realUrls, getAppUrls), urlsToHashes)), looksGood);
      if (validate(realTYBUrlHash)) return cb(null, realTYBUrlHash);
      cb(null, null);
    });
  };

};