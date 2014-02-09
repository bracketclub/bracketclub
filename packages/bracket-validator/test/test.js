var BracketGenerator = require('bracket-generator'),
    BracketValidator = require('../index'),
    _isEqual = require('lodash-node/modern/objects/isEqual'),
    _random = require('lodash-node/modern/utilities/random'),
    strRepeat = function (str, qty) {
        if (qty < 1) return '';
        var result = '';
        while (qty > 0) {
            if (qty & 1) result += str;
            qty >>= 1, str += str;
        }
        return result;
    },
    _pad = function (str, length, padStr, type) {
        length = ~~length;

        var padlen  = 0;

        if (!padStr)
            padStr = ' ';
        else if (padStr.length > 1)
            padStr = padStr.charAt(0);

        switch (type) {
            case 'right':
                padlen = length - str.length;
                return str + strRepeat(padStr, padlen);
            case 'both':
                padlen = length - str.length;
                return strRepeat(padStr, Math.ceil(padlen / 2)) + str + strRepeat(padStr, Math.floor(padlen / 2));
            default: // 'left'
                padlen = length - str.length;
                return strRepeat(padStr, padlen) + str;
        }
    },
    assert = require('assert'),
    year = process.env.BRACKET_YEAR,
    BracketData = require('bracket-data'),
    bracket = new BracketData({year: year}),
    data = bracket.bracket,
    CONSTS = bracket.constants,
    totalRegions = CONSTS.REGION_COUNT,
    finalGames = totalRegions - 1,
    firstRoundOrder = bracket.order,
    firstRoundOrderLength = firstRoundOrder.length - 1,

    iterations = Math.pow(2, firstRoundOrderLength),

    intToBinary = function (i, length) {
        return _pad((i).toString(2), length, '0');
    },

    // Creates a bracket with one defined region and everything else random
    fullBracketBinary = function (i) {
        return intToBinary(i, firstRoundOrderLength) +
            intToBinary(_random(0, iterations - 1), firstRoundOrderLength) +
            intToBinary(_random(0, iterations - 1), firstRoundOrderLength) +
            intToBinary(_random(0, iterations - 1), firstRoundOrderLength) +
            intToBinary(_random(0, Math.pow(2, finalGames) - 1), finalGames);
    },

    i = 0;

// var generateValidate = function (i) {
//         var bg = new BracketGenerator({data: data, winners: i ? fullBracketBinary(i) : 'random', year: year}),
//             expanded = bg.bracketWithTeamInfo(),
//             flat = bg.flatBracket(),
//             bv = new BracketValidator({flatBracket: flat, year: year}).validate();

//         assert.equal(true, _isEqual(expanded, bv));
//     };

// describe('A few random brackets', function () {
//     for (i; i < 20; i++) {
//         (function () {
//             it('the created and validated brackets should be equal', function () {
//                 generateValidate();
//                 generateValidate(i);
//             });
//         })();
//     }
// });

i = 0;
describe('A few random brackets: test only', function () {
    for (i; i < 20; i++) {
        (function () {
            it('the created and flat brackets should be equal', function () {
                var bg = new BracketGenerator({data: data, winners: 'random', year: year}),
                        flat = bg.flatBracket(),
                        bv = new BracketValidator({flatBracket: flat, year: year, testOnly: true}).validate();

                assert.equal(flat, bv);
            });
        })();
    }
});

describe('Incomplete Brackets', function () {
    it('Splits Correctly', function () {
        var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(false, validator instanceof Error);
    });

    it('Should have an error if we dont want unfinished brackets', function () {
        var bracket = 'MW1812463XXXXXXXXXW19XX614XXXXXXXXXSXX54XXXXXXXXXXXEXX12463XXXXXXXXXFFXXX',
            validator = new BracketValidator({flatBracket: bracket, notEmpty: true, year: year}).validate();

        assert.equal(validator.message, 'Bracket has unpicked matches');
        assert.equal(true, validator instanceof Error);
    });
});

it('Regions dont need to be set for final four to be set', function () {
    var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX66 FF MW E E'.replace(/\s/g, ''),
        validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

    assert.equal(false, validator instanceof Error);
});


it('Teams cant win a game in final four without winning region', function () {
    var bracket = 'MW1XXXXXXX1XXX1X1 W16XXXXXXX16XXX16X16 SXXX13XXXXXXXXXXX EXXXX6XXXXX6XX6X FF MW E E'.replace(/\s/g, ''),
        validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

    assert.equal(true, validator instanceof Error);
    assert.equal(validator.message, "Final teams are selected without all regions finished");
});

describe('Bad Brackets', function () {
    it('Champ game participants are illegal', function () {
        var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSEE',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('This bracket is garbage and shouldnt break anything', function () {
        var bracket = 'heyowhatsupinthehizzzzzzzouse123FF123FF',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('There is a first round game missing', function () {
        var bracket = 'EX85463721432121W185463721432121S185463721432121MW185463721432121FFSEE',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('There is a regional final missing', function () {
        var bracket = 'E185463721432121W185463721432121S18546372143212XMW185463721432121FFSEE',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Championship game participants are wtf', function () {
        var bracket = 'E185463721432121W185463721432121S185463721432121MW185463721432121FFSNX',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Wrong keys', function () {
        var bracket = 'N185463721432121W185463721432121S185463721432121MW185463721432121FFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Not subsets', function () {
        var bracket = 'E185463721432121W185463721432123S185463721432121MW185463721432121FFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Incorrect number of picks', function () {
        var bracket = 'E185463721432121W18546372143212S185463721432121MW185463721432121FFXXX',
            validator = new BracketValidator({flatBracket: bracket, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: false, notEmpty: true, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: '', notEmpty: true, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({flatBracket: null, notEmpty: true, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

    it('Bad types', function () {
        var validator = new BracketValidator({notEmpty: true, year: year}).validate();

        assert.equal(true, validator instanceof Error);
    });

});