import React, { Component } from 'react';
import Transaction from './Transaction';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response => response.json())
        .then(json => this.setState({ transactionPoolMap: json }));
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response => {
            if(response.status === 200) {
                alert('Success');
                history.push('/blocks');
            } else {
                alert('Mine transaction request failed.');
            }
        });
    }

    componentDidMount() {
        this.fetchTransactionPoolMap();

        this.fetchTransactionPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        );
    }

    componentWillUnmount() {
        clearInterval(this.fetchTransactionPoolMapInterval);
    }

    render() {
        return (
            <div className = 'TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <h3>TRANSACTION POOL</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return (
                            <div key = {transaction.id}>
                                <hr/>
                                <Transaction transaction = {transaction} />
                            </div>
                        )
                    })
                }
                <hr />
                <Button
                bsStyle = "info"
                bsSize = "large"
                onClick={this.fetchMineTransactions}>
                    Mine the Transactions ⛏ </Button>
            </div>
        )
    }
}
export default TransactionPool;