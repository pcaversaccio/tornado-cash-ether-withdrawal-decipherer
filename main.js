/*
Author: Pascal Marco Caversaccio
E-Mail: pascal.caversaccio@hotmail.ch
*/

/* 
A small hack: In order to use the native module,
we will have to import the `createRequire` function 
from the `module` module. Thereafter, older CommonJS 
syntax will work again.
*/
import { createRequire } from 'module';
import fetch from 'node-fetch';
const require = createRequire(import.meta.url);

/*
We use `dotenv` to securley inject the Etherscan API key for the API calls. 
`dotenv` is a zero-dependency module that loads environment variables 
from a .env file into process.env.
*/
require('dotenv').config();

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define the CSV structure
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [{
            id: 'hash',
            title: 'TxHash'
        },
        {
            id: 'address',
            title: 'ToAddress'
        },
        {
            id: 'value',
            title: 'WithdrawalAmount'
        },
    ]
});

const baseUrl = 'https://api.etherscan.io/api?module=account&action=txlistinternal&txhash='; // Etherscan API base URL for internal transactions retrievals
const data = require('./data.json'); // Load data JSON file with the transaction hashes

// Loop through all transaction hashes
for (let i = 0; i < data.length; i++) {
    const response = await fetch(`${baseUrl}${data[i]}&apikey=${process.env.ETHERSCAN_API_KEY}`);
    const res = await response.json();

    /*
    Case 1: To preserve privacy a relayer is used to withdraw to an address with no ETH balance.
    Therefore, there will be two distinct internal transactions:
    1. ETH withdrawal transaction to the Tornado.Cash user's withdrawal address
    2. Relayer ETH fee transaction to the relayer's address
    This also holds true for all available token transfers such as DAI or WBTC. However,
    in this context the internal ETH transfers are merely gas fees for smart contract 
    interactions rather than token value transfers.  
    */
    if (res.result.length == 2) {
    const out = [{
            hash: data[i],
            address: res.result[0].to,
            value: res.result[0].value
        },
        {
            hash: data[i],
            address: res.result[1].to,
            value: res.result[1].value
        }
    ];
    csvWriter.writeRecords(out);

    /*
    Case 2: The ETH withdrawal is triggered by the Tornado.Cash user's withdrawal address.
    Therefore, there will be only one internal transaction:
    1. ETH withdrawal transaction to the Tornado.Cash user's withdrawal address
    */
    } else if (res.result.length == 1) {
        const out = [{
            hash: data[i],
            address: res.result[0].to,
            value: res.result[0].value
        }
    ];
    csvWriter.writeRecords(out);

    /*
    Case 3: The token withdrawal is triggered by the Tornado.Cash user's withdrawal address.
    Therefore, there will be no internal transaction as per the Tornado.Cash smart contract design.
    */
    } else {
        const out = [{
            hash: data[i],
            address: 'N/A',
            value: 'N/A'
        }
    ];
    csvWriter.writeRecords(out);
    };

    console.log('Iteration step: ', i); // Logging the iteration steps for convenience
}
