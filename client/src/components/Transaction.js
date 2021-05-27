import React from 'react';

const Transaction = ({ transaction }) => {
    const { input, outputMap } = transaction;
    const recipients = Object.keys(outputMap);
    
    return (
        <div className = 'Transaction'>
            <div>From: {input.address.length > 20 ? `${input.address.substring(0,20)}...` : input.address} | Balance: {input.amount}</div>
            {
                recipients.map(recipient => (
                        <div key={recipient}>
                            To: {recipient.length > 20 ? `${recipient.substring(0,20)}...` : recipient} | Sent: {outputMap[recipient]}
                        </div>
                ))
            }

        </div>
    )
}

export default Transaction;