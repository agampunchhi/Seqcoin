const { GENESIS_DATA, MINE_RATE} = require('../config');
const { cryptoHash } = require('../util/');
const hexToBinary = require('hex-to-binary');

class Block {
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }
    static genesis() {
        return new this(GENESIS_DATA);
    }
    static mineBlock({ lastBlock, data}) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ orignalBlock: lastBlock, timestamp});
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
       }while(hexToBinary(hash).substring(0, difficulty)!== '0'.repeat(difficulty));
        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash,
        });
    }
    static adjustDifficulty({ orignalBlock , timestamp }) {
        const { difficulty } = orignalBlock;
        if( difficulty < 1 ) return 1;
        if((timestamp - orignalBlock.timestamp) > MINE_RATE) return difficulty - 1;
        return difficulty + 1 ;
    }
}
module.exports = Block;