const { verifySignature } = require('../util');
const Wallet = require('./index');
const Transaction = require('./transaction');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;
    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-pub-key';
        amount = 50;
        transaction = new Transaction({ senderWallet, recipient, amount });
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });
    
    describe('outputMap', () => {
        it('has an `outputMap', () => {
            expect(transaction).toHaveProperty('outputMap');
        });
        it('outputs amount to recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });
        it('outputs remaining bal for `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });
    describe('input', () => {
        it('has an input', () => {
            expect(transaction).toHaveProperty('input');
        });
        it('has a timestamp in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });
        it('sets the `amount` to `senderWallet` balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });
        it('sets the `address` to the `senderWallet` publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });
        it('signs the input', () => {
            expect(
            verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: transaction.input.signature
                })
            ).toBe(true)
        });
    });
    describe('validTransaction()', () => {
        let errorMock;
        beforeEach(() => {
            errorMock = jest.fn();

            global.console.error = errorMock;
        })
        describe('transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });
        describe('transaction is invalid', () => {
            describe('and outputMap value is invalid', () => {
                it('returns false and logs error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 99999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
            });
        });
            describe('transaction input signature is invalid', () => {
                it('returns false and logs error', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
            });
        });
    });

    });
    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe('amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                    senderWallet, recipient: 'yeet-digger', amount: 9999999
                })}).toThrow('Amount exceeds balance');
            });
        });
        describe('and amount is valid', () => {
        beforeEach(() => {
            originalSignature = transaction.input.signature;
            originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
            nextRecipient = 'next-recipient';
            nextAmount = 50;

            transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount });
        })
        it('outputs amount to next recipient', () => {
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
        });
        it('subtracts amount from original sender output amount', () => {
            expect(transaction.outputMap[senderWallet.publicKey])
            .toEqual(originalSenderOutput - nextAmount);
        });
        it('maintains total output that matches input amount', () => {
            expect(Object.values(transaction.outputMap)
            .reduce((total, outputAmount) => total + outputAmount))
            .toEqual(transaction.input.amount);
        });
        it('re-signs the transaction', () => {
            expect(transaction.input.signature).not.toEqual(originalSignature);
        });
        describe('add another update for same recipient', () => {
            let addedAmount;
            beforeEach(() => {
                addedAmount = 80;
                transaction.update({
                    senderWallet, recipient: nextRecipient, amount: addedAmount
                });
            it('adds to recipient amount', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
            });
            it('subtract amount from original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(originalSenderOutput - nextAmount - addedAmount);
            });
            })
        });
    });
    });
    describe('rewardTransaction()', () => {
        let rewardTransaction, minerWallet;
        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({ minerWallet });
        });
        it('creates transaction with reward input', () => {
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        });
        it('creates one transaction for the miner with the `MINING_REWARD`', () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        });
    });
});