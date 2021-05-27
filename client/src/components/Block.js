import { has } from 'core-js/core/dict';
import React, { Component } from 'react';
import  { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = { displayTransaction: false };

    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }

    get displayTransaction() {
        const { data } = this.props.block;
        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length > 35 ? `${stringifiedData.substring(0, 35)}...`
        : stringifiedData;

        if(this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction = {transaction} />
                            </div>
                        ))
                    }
                    <br/>
                    <Button 
                    bsStyle="info" 
                    bsSize = "small" 
                    onClick = {this.toggleTransaction}>Hide Info</Button>
                </div>
            )
        }

        return (
            <div>
            <div>Data: {dataDisplay}</div>
            <Button 
            bsStyle="info" 
            bsSize = "small" 
            onClick = {this.toggleTransaction}>Show Info</Button>
            </div>
        )
    }

    render() {

        const { timestamp, hash, data } = this.props.block;

        const hashDisplay = `${hash.substring(0, 15)}...`;
   
        if(hash !== '77e1b6ba22719652116d3fb67593335c43120f6e453831c05adc7e8d769d6254')
        {
        return (
            <div className = 'Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        )
        } else {
            return (
            <div className = 'Block'>
                <div>INITIAL BLOCK</div>
            </div>
            )
        }
    }
};

export default Block;