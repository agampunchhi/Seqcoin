const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash }= require("../util/");
const hexToBinary = require('hex-to-binary');

describe('Block',  () => {
    const timestamp = 2000;
    const lastHash = 'yee-hash';
    const hash = 'pp-hash';
    const data = [ 'blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({
        timestamp, lastHash, hash, data, nonce, difficulty });
    it('has a timestamp, lastHash, hash and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });
    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        //console.log('genesisBLock', genesisBlock);
        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ lastBlock, data});

        it('returns a block Instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });
        it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });
        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });
        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });
        it('creates SHA-256 `hash` based on proper inputs', () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp, 
                    lastBlock.hash,
                    data, 
                    minedBlock.nonce, 
                    minedBlock.difficulty
                    ));
        });
        it('sets a `hash` matching difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });
        it('adjusts difficulty', () => {
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });
    describe('adjustDifficulty()', () => {
        it('raises difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                orignalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty+1);
        });

        it('lowers difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                orignalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty-1);
        });
        it('has lower limit of one', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({ orignalBlock: block})).toEqual(1);
        });
    });
});
