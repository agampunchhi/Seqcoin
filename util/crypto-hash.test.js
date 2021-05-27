const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {

    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('yeet')).toEqual('4a9e257992192a0aa867f87edec05b2815b4c5974629e30edac64481cd471a0f');
    });

    it('produces same hash with same input in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'two', 'one'));
    });
    it('produces unique hash when properties changed on input', () => {
        const yeet = {};
        const originalHash = cryptoHash(yeet);
        yeet['a'] = 'a';

        expect(cryptoHash(yeet)).not.toEqual(originalHash);
    });
});