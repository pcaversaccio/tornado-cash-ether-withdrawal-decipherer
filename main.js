import { createRequire } from 'module';
import fetch from 'node-fetch';
const require = createRequire(import.meta.url);
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

const baseUrl = 'https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=';
const data = require('./data.json'); // Data with the transaction hashes

for (let i = 0; i < data.length; i++) {
    const response = await fetch(`${baseUrl}${data[i]}&apikey=${process.env.ETHERSCAN_API_KEY}`);
    const res = await response.json();

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
    } else if (res.result.length == 1) {
        const out = [{
            hash: data[i],
            address: res.result[0].to,
            value: res.result[0].value
        }
    ];
    csvWriter.writeRecords(out);
    } else {
        const out = [{
            hash: data[i],
            address: 'N/A',
            value: 'N/A'
        }
    ];
    csvWriter.writeRecords(out);
    };
    console.log('Iteration step: ', i)
}
