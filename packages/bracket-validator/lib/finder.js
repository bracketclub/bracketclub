var _ = require('lodash'),
    async = require('async'),
    realurl = require('realurl'),

    BracketValidator = require('./validator'),
    quickCheck = require('./quickCheck')();

function Finder(options) {
  options = options || {};
  this.appName = options.appName || '',
  this.trackTwitter = options.trackTwitter || [];

  this.getAppUrls = function(url) {
    return url.indexOf(this.appName) > -1;
  };

  this.urlsToMatches = function(url) {
    var matches = url.match(quickCheck);
    return matches.length > 0 ? matches[0] : matches;
  };

  this.looksGood = function(item) {
    var regExp = new RegExp('^' + quickCheck.source + '$');
    return regExp.test(item);
  };
}

Finder.prototype.findFrom = function(from) {
  return _.find(from, this.looksGood);
};

Finder.prototype.find = function(tweet, cb) {

  var self = this;

  tweet = _.defaults(tweet, {text: '', entities: {}});

  var expandedUrls = _.pluck(tweet.entities.urls, 'expanded_url'),
      appUrls = _.filter(expandedUrls, this.getAppUrls, this),
      urlMatches = _.compact(_.map(appUrls, this.urlsToMatches, this)),
      otherUrls = _.without(expandedUrls, appUrls),
      hashtags = _.without(_.pluck(tweet.entities.hashtags, 'text'), this.trackTwitter),
      textChunks = tweet.text.split(' ');

  async.waterfall([
    function(_cb) {
      // Most common scenario will be a t.co shortened tweetyourbracket.com url with a hash on it
      // Then test for a valid hashtag
      // Also test for a chunk of text that looks good
      _cb(null, self.findFrom(urlMatches) || self.findFrom(hashtags) || self.findFrom(textChunks));
    },
    function(bracket, _cb) {
      if (bracket) return _cb(null, bracket);
      // Last, check shortened urls to see if the are tweetyourbracket urls
      async.concat(otherUrls, _.bind(realurl.get, realurl), function(err, realUrls) {
        if (err) return _cb(err, null);
        var appUrls = _.filter(realUrls, self.getAppUrls, self),
            urlMatches = _.compact(_.map(appUrls, self.urlsToMatches, self)),
            bracket = self.findFrom(urlMatches);

        _cb(null, bracket);
      });
    }
  ],function(err, res) {
    self.validate(res, cb);
  });

};

Finder.prototype.validate = function(bracket, cb) {
  var bv = new BracketValidator({flatBracket: bracket, testOnly: true});
  bv.validate(cb);
};

module.exports = Finder;
