var BracketGenerator = require('../index'),
    assert = require('assert'),
    year = process.env.BRACKET_YEAR,
    generator = new BracketGenerator({year: year});

describe('A few random brackets', function () {
    it('Generates a flat bracket', function () {
        assert.equal(true, typeof generator.flatBracket() === 'string');
    });
});