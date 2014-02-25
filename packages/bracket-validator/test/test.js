var BracketGenerator = require('bracket-generator'),
    BracketValidator = require('../index'),
    _ = require('lodash-node/compat'),
    assert = require('assert'),
    year = '2013',
    sport = 'ncaa-mens-basketball',
    BracketData = require('bracket-data'),
    data = new BracketData({year: year, sport: sport, props: ['constants', 'order']});


describe('A few random brackets: test only', function () {
    for (var i = 0; i < 20; i++) {
        (function () {
            it('the created and flat brackets should be equal', function () {
                var bg = new BracketGenerator({data: data, winners: 'random', year: year}),
                        flat = bg.flatBracket(),
                        bv = new BracketValidator({flatBracket: flat, year: year, sport: sport, testOnly: true}).validate();

                assert.equal(flat, bv);
            });
        })();
    }
});

describe('New validator has correct properties', function () {
    it('Has the four necessary properties and no more', function () {
        var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport});

        var hasOwnProperties = [];
        var other = [];

        for (var x in validator) {
            if (validator.hasOwnProperty(x)) {
                hasOwnProperties.push(x);
            } else {
                other.push(x);
            }
        }

        assert.equal(other.length, 2);
        assert.equal(hasOwnProperties.length, 2);
        assert.equal(_.contains(other, 'reset'), true);
        assert.equal(_.contains(other, 'validate'), true);
        assert.equal(_.contains(hasOwnProperties, 'options'), true);
        assert.equal(_.contains(hasOwnProperties, 'flatBracket'), true);
    });
});

describe('Incomplete Brackets', function () {
    it('Splits Correctly', function () {
        var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX',
            v = new BracketValidator({flatBracket: bracket, year: year, sport: sport}),
            validator = v.validate();

        assert.equal(false, validator instanceof Error);
    });

    it('Should have an error if we dont want unfinished brackets', function () {
        var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX',
            validator = new BracketValidator({flatBracket: bracket, allowEmpty: false, year: year, sport: sport}).validate();

        assert.equal(validator.message, 'Bracket has unpicked matches');
        assert.equal(true, validator instanceof Error);
    });
});

describe('Final four', function () {
    it('Regions dont need to be set for final four to be set', function () {
        var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX66 FF MW E E'.replace(/\s/g, ''),
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(false, validator instanceof Error);
    });


    it('Teams cant win a game in final four without winning region', function () {
        var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX6X FF MW E E'.replace(/\s/g, ''),
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
        assert.equal(validator.message, "Final teams are selected without all regions finished");
    });
});

describe('Can be reset', function () {
    it('Teams cant win a game in final four without winning region', function () {
        var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX6X FF MW E E'.replace(/\s/g, ''),
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport});

        var validated = validator.validate();
        assert.equal(true, validated instanceof Error);
        assert.equal(validated.message, "Final teams are selected without all regions finished");

        validator.reset('MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX66 FF MW E E'.replace(/\s/g, ''));
        assert.equal(false, validator.validate() instanceof Error);

        validator.reset('sdfsdf'.replace(/\s/g, ''));
        assert.equal(true, validator.validate() instanceof Error);
    });
});

describe('Bad Brackets', function () {
    it('Champ game participants are illegal', function () {
        var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSEE',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('This bracket is garbage and shouldnt break anything', function () {
        var bracket = 'heyowhatsupinthehizzzzzzzouse123FF123FF',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('There is a first round game missing', function () {
        var bracket = 'EX85463721432121W185463721432121S185463721432121MW185463721432121FFSEE',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('There is a regional final missing', function () {
        var bracket = 'E185463721432121W185463721432121S18546372143212XMW185463721432121FFSEE',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Championship game participants are wtf', function () {
        var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSNX',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Wrong keys', function () {
        var bracket = 'N185463721432121W185463721432121S185463721432121MW185463721432121FFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Not subsets', function () {
        var bracket = 'E185463721432121W185463721432123S185463721432121MW185463721432121FFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Incorrect number of picks', function () {
        var bracket = 'E185463721432121W18546372143212S185463721432121MW185463721432121FFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: false, allowEmpty: false, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: '', allowEmpty: false, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: null, allowEmpty: false, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({allowEmpty: false, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: 'boop', allowEmpty: false, year: year, sport: sport}).validate();

        assert.equal(true, validator instanceof Error);
    });
});