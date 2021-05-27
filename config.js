const MINE_RATE = 10000;
const INITIAL_DIFFICULTY = 3;
const initTime = Date.parse('20 Aug 2001 21:50:00 GMT');

const GENESIS_DATA = {
    timestamp: initTime ,
    lastHash: 'null',
    hash: '77e1b6ba22719652116d3fb67593335c43120f6e453831c05adc7e8d769d6254',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: ['Block initialised.'],
};
const STARTING_BALANCE = 100;

const REWARD_INPUT = { address: '*authorized-reward*' };

const MINING_REWARD = 5;
module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD};