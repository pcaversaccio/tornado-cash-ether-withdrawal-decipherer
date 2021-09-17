# Deciphering the Ether Transactions in the Tornado.Cash Withdrawals
Ether withdrawals at [Tornado.Cash](https://tornado.cash) are recorded as [internal transactions](https://info.etherscan.com/understanding-an-ethereum-transaction). To perform a correlation analysis, it is very useful to have the underlying Ether withdrawal transaction data. I use the [Etherscan API](https://docs.etherscan.io) to retrieve the data and decrypt the internal transactions. This is not magic, but an important structuring process.

## How to Use It
First, create an account on [Etherscan](https://etherscan.io/register) and generate a new API key accordingly (each Etherscan account is limited to creating 3 keys at any one time). Thereafter, create a `.env` file in the root directory of this project repository, adding the Etherscan API key. Example:
```
ETHERSCAN_API_KEY=RQHAU...
```

Assuming you have installed a modern version of [Node.js](https://nodejs.org/en), simply run `npm i`. Eventually, prepare a JSON file called `data.json` that lists all the Tornado.Cash transaction hashes you want to decipher as an array. Example:
```json
[   
    "0xcf20018eaa16807a42e4d3e317995266052d385f817fe46e301585821c749c7b",
    "0x5cec75fd2f2c676a813dd4fa497b1b865dfab1a04044345ee6171c1c0059d993",
    "0xbd37119d7273123c4a46e5f8bdcc11a47a8519fecddc78e2330abd837880fba6",
    ︙
    "0xfdc04e88dc0c7c660c7515611f4ae7700449694047b6ee9ce4bb08297d3b0db4",
    "0xabe430c0a4a7154ff02285ca93393d4492b7cc1a3f887887ae352dda52d3ba60"
]
``` 
> *Pro tip:* You can export the transaction history from Etherscan as `CSV` file.

Now you are ready and you can run the script by typing `node main.js` into the terminal. The final output will be a `CSV` file with three columns:
- Transaction hash
- Withdrawal address
- Withdrawal amount in wei

### Case Distinction
**Case 1:** To preserve privacy a relayer is used to withdraw to an address with no ETH balance. Therefore, there will be two distinct internal transactions:
1. ETH withdrawal transaction to the Tornado.Cash user's withdrawal address
2. Relayer ETH fee transaction to the relayer's address

This also holds true for all available token transfers such as DAI or WBTC. However, in this context the internal ETH transfers are merely gas fees for smart contract interactions rather than token value transfers. [Example transaction](https://etherscan.io/tx/0xcf20018eaa16807a42e4d3e317995266052d385f817fe46e301585821c749c7b)

**Case 2:** The ETH withdrawal is triggered by the Tornado.Cash user's withdrawal address. Therefore, there will be only one internal transaction:
1. ETH withdrawal transaction to the Tornado.Cash user's withdrawal address
   
[Example transaction](https://etherscan.io/tx/0x41dffbeedacce3db511882e4ebb7f74d4a38abc67153d2992d916743465eb0bc)

**Case 3:** The token withdrawal is triggered by the Tornado.Cash user's withdrawal address. Therefore, there will be no internal transaction as per the Tornado.Cash smart contract design. [Example transaction](https://etherscan.io/tx/0x8008a51138dd9165f7e3558e99002408d636e99728385a371be020bad4a6847b)

## Reference
[1] https://tornado.cash
