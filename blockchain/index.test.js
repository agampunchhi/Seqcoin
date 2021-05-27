const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');


describe('Blockchain', () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        errorMock = jest.fn();
        originalChain = blockchain.chain;
        global.console.error = errorMock;
    });
    it('contains a `chain` array instance', () => {
        expect(blockchain.chain instanceof Array ).toBe(true);
    });
    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });
    it('adds a new block to the chain', () => {
        const newData = 'yeet it';
        blockchain.addBlock({data: newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain doesnt start with genesis block', () => {
           it('returns false', () => {
               blockchain.chain[0] = {data: 'fake-genesis'};
               expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
           }); 
        });
        describe('when the chain starts with genesis block and has multiple blocks', () => {
            beforeEach(() => {
                    blockchain.addBlock({ data: 'Bonks' });
                    blockchain.addBlock({ data: 'Bingus' });
                    blockchain.addBlock({ data: 'Floppa' });
                    blockchain.addBlock({ data: 'Nagnee' });
            });
            describe('lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lmao';

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('chain contains block with invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'bad-data-lmao';

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
            describe('and the chain contains a block with jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock = new Block({ timestamp, lastHash, hash, nonce, difficulty, data});
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
         });
    });
    describe('replaceChain()', () => {
        let logMock;

        beforeEach(() => {

            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe('when new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });
            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });
        describe('when new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'Bonks' });
                newChain.addBlock({ data: 'Bingus' });
                newChain.addBlock({ data: 'Floppa' });
                newChain.addBlock({ data: 'Nagnee' });
            });
            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'random';
                    blockchain.replaceChain(newChain.chain);

                });
                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });
                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
                it('logs about chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
           
        });
        describe('and `validateTransactions` is true', () => {
            it('calls validTransactionData()', () => {
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;
                newChain.addBlock({ data: 'yeet' });
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });
    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;
        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'yee-add', amount: 55 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });
        describe('transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });
        describe('transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
        describe('transaction data has atleast one malformed outputMap', () => {
            describe('transaction is not a reward transaction', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('transaction is a reward transaction', () => {
                it('returns false and logs an error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({ data: [transaction, rewardTransaction ]});
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
        describe('and transaction data has atleast one malformed input', () => {
            it('returns false and logs an error', () => {
                wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    yeetRecipient: 100,
                };
                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                }

                newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
        describe('and a block contains multiple identical transactions', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction],
                });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});