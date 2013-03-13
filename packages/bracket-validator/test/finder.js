var assert = require('assert'),
    BracketFinder = require('../index').finder,
    BracketGenerator = require('../index').generator,
    shorturl = require('shorturl'),

    APP_NAME = 'tweetyourbracket.com',
    APP_HASHTAGS = ['tybrkt'],

    bf = new BracketFinder({
      appName: APP_NAME,
      trackTwitter: APP_HASHTAGS
    }),

    bg = new BracketGenerator({
      winners: 'random'
    });

describe('Bracket Finder', function() {
  var bracket = bg.flatBracket(),
      tweetWithExpandedUrl = {
        text: 'Some text of the tweet',
        entities: {
          urls: [{
            expanded_url: 'http://espn.com/' + bracket
          }]
        }
      },
      tweetWithText = {
        text: 'Some text of ' + bracket + ' the tweet',
        entities: {
          urls: []
        }
      },
      tweetWithHashtag = {
        text: 'Some text blah #' + bracket + ' blah blah',
        entities: {
          urls: [],
          hashtags: [{
            text: bracket
          },{
            text: APP_HASHTAGS[0]
          }]
        }
      },
      tweetWithShortenedUrl = {
        text: 'Some more text blah blah blah',
        entities: {
          urls: [{
            expanded_url: ''
          }]
        }
      };

  it('should return a valid bracket from the url', function() {
    bf(tweetWithExpandedUrl, function(err, res) {
      assert.equal(bracket, res);
    });
  });

  it('should return a valid bracket from the text', function() {
    bf(tweetWithText, function(err, res) {
      assert.equal(bracket, res);
    });
  });

  it('should return a valid bracket from the hashtags', function() {
    bf(tweetWithHashtag, function(err, res) {
      assert.equal(bracket, res);
    });
  });

  it('should return a valid bracket from a shortened url', function() {
    shorturl('http://' + APP_NAME + '/#' + bracket, function(result) {
      tweetWithShortenedUrl.entities.urls[0].expanded_url = 'aaaa';
      bf(tweetWithShortenedUrl, function(err, res) {
        assert.equal(bracket, res);
      });
    });
  });

});