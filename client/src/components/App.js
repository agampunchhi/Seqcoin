import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

class App extends Component {
    state = { walletInfo: {} };

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
        .then((response => response.json())).then(json => this.setState({ walletInfo: json }));
    }



    render() {
        const { address, balance } = this.state.walletInfo;
        return (
            <div className = 'App'>
                <img className='logo' src={logo}></img>
                <br/>
                <div>
                <h1>SEQCOIN</h1>
                </div>
                <br/>
                <div><Link to='/blocks'>BLOCKS</Link></div>
                <div><Link to='/conduct-transaction'>CCONDUCT A TRANSACTION</Link></div>
                <div><Link to='/transaction-pool'>TRANSACTION POOL</Link></div>
                <div>
                    <hr/>
                </div>
                <div className = 'WalletInfo'>
                <div>ADDRESS: {address}</div>
                <div>BALANCE: {balance}</div>
                </div>
            </div>
        );
    }
}

export default App;
