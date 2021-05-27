const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');
const Block = require('../blockchain/block');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey');
    });
    describe('signing data', () => {
        const data = 'yeet';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });
        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false); 
        });
    });
    describe('createTransaction()', () => {
        describe('and amount exceeds balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'yeet-digger' }))
                .toThrow('Amount exceeds balance');
            });
        });
    describe('and amount is valid', () => {
        let transaction, amount, recipient;

        beforeEach(() => {
            amount = 50;
            recipient = 'yeet-digger',
            transaction = wallet.createTransaction({ amount, recipient });
        });

        it('creates instance of `Transaction`', () => {
            expect(transaction instanceof Transaction).toBe(true);
        });
        it('transaction input matches with wallet', () => {
            expect(transaction.input.address).toEqual(wallet.publicKey);
        });
        it('outputs the amount to recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });
    describe('a chain is passed', () => {
        it('calls `Wallet.calculateBalance`', () => {
            const calculateBalanceMock = jest.fn();

            const originalCalculateBalance = Wallet.calculateBalance;
            Wallet.calculateBalance = calculateBalanceMock;

            wallet.createTransaction({
                recipient: 'yeet',
                amount: 10,
                chain: new Blockchain().chain
            });
            expect(calculateBalanceMock).toHaveBeenCalled();
            Wallet.calculateBalance = originalCalculateBalance;
        });
    });
    });
    });
    describe('calculateBalance()', () => {
        let blockchain;
        beforeEach(() => {
            blockchain = new Blockchain();
        });
        describe('and no outputs for the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE);
            });
        });
        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });
                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                });
                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });
            it('adds sum of all outputs to wallet balance', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] 
                    + transactionTwo.outputMap[wallet.publicKey]);
            });
            describe('and wallet has made a transaction', () => {
                let recentTransaction;
                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'yeet-call',
                        amount: 25
                    });
                    blockchain.addBlock({ data: [recentTransaction] });
                });
                it('returns output amount of recent transaction', () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });
                describe('and there are outputs next to and after recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;
                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-yeet',
                            amount: 60
                        });
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction ]});
                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 70
                        });
                        blockchain.addBlock({ data: [nextBlockTransaction ]});
                    });
                    it('includes output amounts in returned balance', () => {
                        expect(Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })).toEqual(recentTransaction.outputMap[wallet.publicKey]
                            + sameBlockTransaction.outputMap[wallet.publicKey]
                            + nextBlockTransaction.outputMap[wallet.publicKey]);
                    });
                }); 
            });
        });
    });
});