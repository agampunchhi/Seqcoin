import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom'; 
import App from './components/App';
import './index.css';
import history from './history';
import Blocks from './components/Blocks';
import TransactionPool from './components/TransactionPool';
import ConductTransaction from './components/ConductTransaction';

render(
    <Router history={history}>
        <Switch>
            <Route exact={true} path='/' component={App}/>
            <Route path='/blocks' component={Blocks}/>
            <Route path = '/conduct-transaction' component = {ConductTransaction}/>
            <Route path='/transaction-pool' component={TransactionPool}/>
        </Switch>
    </Router>,
    document.getElementById('root')
);
