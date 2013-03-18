var APP_NAME = 'lukekarrys.com',
    APP_HASHTAGS = ['tybrkt'],

    _ = require('lodash'),

    BracketFinder = require('../lib/finder'),
    bf = new BracketFinder({
      appName: APP_NAME,
      trackTwitter: APP_HASHTAGS
    }),
    BracketGenerator = require('../lib/generator'),
    bracket = new BracketGenerator().flatBracket(),
    assert = require('assert'),
    shorturl = require('shorturl'),

    fullTweet = {
      text: 'There is no important'+bracket+'text in this tweet',
      entities: {
        urls: [{
          expanded_url: 'http://espn.com/#' + bracket
        },{
          expanded_url: 'http://is.gd/WpcYwJ' // espn.com
        }],
        hashtags: [{
          text: APP_HASHTAGS[0]
        }]
      }
    },

    goodUrl = {expanded_url: 'http://' + APP_NAME + '/#' + bracket},
    goodText = 'Some text of ' + bracket + ' the tweet',
    goodHashtag = {text: bracket};

describe('Bracket Finder', function() {

  it('should return a valid bracket from the url', function(done) {
    var testTweet = _.cloneDeep(fullTweet);
    testTweet.entities.urls.push(goodUrl);
    bf.find(testTweet, function(err, res) {
      assert.equal(bracket, res);
      done();
    });
  });

  it('should return a valid bracket from the text', function(done) {
    var testTweet = _.cloneDeep(fullTweet);
    testTweet.text = goodText;
    bf.find(testTweet, function(err, res) {
      assert.equal(bracket, res);
      done();
    });
  });

  it('should return a valid bracket from the hashtags', function(done) {
    var testTweet = _.cloneDeep(fullTweet);
    testTweet.entities.hashtags.push(goodHashtag);
    bf.find(testTweet, function(err, res) {
      assert.equal(bracket, res);
      done();
    });
  });

  it('should return a valid bracket from a shortened url', function(done) {
    shorturl(goodUrl.expanded_url, function(shortenedUrl) {
      var testTweet = _.cloneDeep(fullTweet);
      testTweet.entities.urls.push({expanded_url: shortenedUrl});
      bf.find(testTweet, function(err, res) {
        assert.equal(bracket, res);
        done();
      });
    });
  });

  it('should not return a bracket from a bad tweet', function(done) {
    var testTweet = _.cloneDeep(fullTweet);
    bf.find(testTweet, function(err, res) {
      assert.equal(null, res);
      done();
    });
  });

});