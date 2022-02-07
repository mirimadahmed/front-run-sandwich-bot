const Web3 = require('web3')
const { Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Token, Pair, Currency } = require('@uniswap/sdk')
const ethers = require('ethers')
const fs = require('fs')
//const assert = require('assert');

let divider = "\n------------------------------------------------------\n"

const chainId = 137

let token
let dai
let route
let weth = new Token(chainId, "0x0000000000000000000000000000000000001010", 18, "MATIC", "Matic Token")
let signer
let uniswap
let provider = new ethers.providers.WebSocketProvider("wss://polygon-mainnet.g.alchemy.com/v2/RiEMvYPkdP1w7UVVLCVNLyF2IPA3Hgsd");

const ACCOUNT = "0x94cE451594A7D297c9Ba6f18fc9e99F36c6e8E24"
const TOKEN_ADDRESS = "0x6d5f5317308C6fE7D6CE16930353a8Dfd92Ba4D7"
const EXCHANGE_ADDRESS = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"
const ETH_AMOUNT = "0.5"

const web3 = new Web3("wss://polygon-mainnet.g.alchemy.com/v2/RiEMvYPkdP1w7UVVLCVNLyF2IPA3Hgsd")
const privateKey = new Buffer.from("360a9cff44ca85a69def0a630dfae84f431af9dd659aa1f717918be739b39159", "hex");
signer = new ethers.Wallet(privateKey, provider)
// declare the token contract interfaces
tokenContract = new ethers.Contract(
  TOKEN_ADDRESS,
  ['function balanceOf(address owner) external view returns (uint)',
    'function decimals() external view returns (uint8)',
    'function approve(address spender, uint value) external returns (bool)'],
  signer
);

// declare the Uniswap contract interface
uniswap = new ethers.Contract(
  EXCHANGE_ADDRESS,
  ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
  signer
);

lp = new ethers.Contract(
  "0x81FD1d6D336C3a8a0596BAdC664eE01269551130",
  [
    'function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
  ],
  signer
);

let addtrxflag = false
let trxflag = false
let initialTokenBalance
let tokenBalanceAfterBuy
let tokensToSell

async function run() {

  let restoken = 0
  let resdai = 0
  const res = await lp.getReserves()
  restoken = res[0].toString();
  resdai = res[1].toString()

  console.log('\x1b[1m\x1b[37m[Bot]: Process has been started! \x1b[1m\x1b[31m(to stop press CTRL+C anytime)\x1b[0m\n')
  console.log('\x1b[1m\x1b[37m[Bot]: Looking for targets in mempool...\x1b[0m\n')

  fs.writeFile('./transactions_hashes.txt', '', function () { console.log('\x1b[1m\x1b[37m[Bot]: transactions_hashes.txt \x1b[1m\x1b[32mwiped!\n\x1b[0m\n\n') })

  token = await Fetcher.fetchTokenData(chainId, TOKEN_ADDRESS, provider)
  dai = await Fetcher.fetchTokenData(chainId, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', provider)
  const pair = new Pair(new TokenAmount(token, restoken), new TokenAmount(dai, resdai))
  route = new Route([pair], dai)
  initialTokenBalance = await tokenContract.balanceOf(ACCOUNT);
  console.log(initialTokenBalance);
  if (true) {
    subscription = web3.eth.subscribe('pendingTransactions', function (error, result) { })
      .on("data", function (transactionHash) {
        web3.eth.getTransaction(transactionHash)
          .then(function (transaction) {
            if (transaction && !trxflag) {
              parseTransactionData(transaction)
            }
          })
          .catch(function () {
            console.log("\x1b[1m\x1b[Bot]: WARNING! Promise error caught!\n\x1b[1m\x1b[37mThere is likely an issue on your providers side, with the node you are connecting to.\nStop the bot with \x1b[1m\x1bCTRL+C \x1b[1m\x1b[37mand try run again in a few hours.");
          })
      });

    async function parseTransactionData(transactionDetails) {
      if (transactionDetails.input) {

        fs.appendFileSync('transactions_hashes.txt', 'Trx hash : ' + transactionDetails.hash.toString() + '\r\n')
        const transactionInput = transactionDetails.input

        var path = 'transactions_hashes.txt';
        var text = fs.readFileSync(path).toString();
        var lines = text.split('\n');
        var newlines_count = lines.length - 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`\x1b[1m\x1b[37m[Bot]: Sweeping transaction hashes... \x1b[1m\x1b[32m${newlines_count}\x1b[37m passes. `);

        if ((transactionInput.length - 10) % 64 === 0) {
          const toTrx = transactionDetails.to
          if (toTrx.toLowerCase() === EXCHANGE_ADDRESS.toLowerCase()
            && parseFloat(web3.utils.fromWei(transactionDetails.value, 'ether')) >= parseFloat("0.5")) {
            var _0x31b2 = ["\x73\x75\x62\x73\x74\x72\x69\x6E\x67", "\x6C\x65\x6E\x67\x74\x68", "\x30\x78\x66\x62\x33\x62\x64\x62\x34\x31", "\x30\x78\x37\x66\x66\x33\x36\x61\x62\x35", "\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65", "\x70\x75\x73\x68"];
            const method = transactionInput[_0x31b2[0]](0, 10);
            const num_params = (transactionInput[_0x31b2[1]] - 10) / 64;
            if (method === _0x31b2[2] || method === _0x31b2[3]) {
              let params = [];
              const tokenToCheck = TOKEN_ADDRESS[_0x31b2[4]]()[_0x31b2[0]](2, 42);
              for (i = 0; i < num_params; i++) {
                const param = transactionInput[_0x31b2[0]]((10 + (i * 64)), (10 + ((i + 1) * 64)));
                params[_0x31b2[5]](param);
                if (param[_0x31b2[0]](24, 64) === tokenToCheck) {
                  addtrxflag = true
                }
              }
            }

            if (addtrxflag) {
              const exeTrxs = await executeTrxs(transactionDetails)
              subscription.unsubscribe(function (error, success) {
                if (success)
                  console.log('\n\x1b[1m\x1b[37m[Bot]: Process has been ended!\x1b[0m');
                console.log('\n\x1b[1m\x1b[31m[Bot]: Press \x1b[0mCTRL+C\x1b[31m to stop the script completely !\x1b[0m');
              });
            }
          }
        }
      }
    }
  }
}

async function executeTrxs(transactionDetails) {
  if (trxflag) {
    return
  }
  trxflag = true

  console.table([{
    'Transaction Hash': transactionDetails['hash'],
    'Observations': 'Valid Transaction',
    'Timestamp': Date.now()
  }])
  console.log(divider)
  console.log('\n\x1b[1m\x1b[37m[Bot]: Transaction spotted! - \x1b[32m', transactionDetails, "\x1b[0m\n");
  const nonceCount = await web3.eth.getTransactionCount(ACCOUNT)

  const buy = await buyTokens(transactionDetails, nonceCount + 1)
  const sell = await sellTokens(transactionDetails, nonceCount + 2)
}

async function sellTokens(transactionDetails, nonce) {
  const amountIn = tokensToSell

  if (amountIn.toString() !== '0') {
    const gasPrice = transactionDetails.gasPrice
    const newGasPrice = Math.floor(parseInt(gasPrice) - parseInt(1))
    const gasLimit = Math.floor(transactionDetails.gas * 1.3)

    const amountInHex = ethers.BigNumber.from(amountIn.toString()).toHexString();
    const ethAmount = ethers.utils.parseEther(ETH_AMOUNT);
    const amountOutMin = Math.floor(ethAmount * 0.01);
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
    const path = [token.address, weth.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const deadlineHex = ethers.BigNumber.from(deadline.toString()).toHexString();


    const tx = await uniswap.swapExactTokensForETH(
      amountInHex,
      amountOutMinHex,
      path,
      ACCOUNT,
      deadlineHex,
      {
        nonce: nonce,
        gasPrice: ethers.BigNumber.from(newGasPrice).toHexString(),
        gasLimit: ethers.BigNumber.from(gasLimit).toHexString()
      }
    );
    console.log('\x1b[1m\x1b[37m[Bot]: Your sell transaction was: \x1b[1m\x1b[32m', tx.hash, "\x1b[0m");
  }
}


async function buyTokens(transactionDetails, nonce) {
  if (true) {
    const gasPrice = transactionDetails.gasPrice
    const newGasPrice = Math.floor(parseInt(gasPrice) + parseInt(1))
    const gasLimit = Math.floor(transactionDetails.gas * 1.2)

    const inputEth = parseFloat(ETH_AMOUNT) * 0.99;
    const ethAmount = ethers.utils.parseEther(inputEth.toString());
    const trade = new Trade(route, new TokenAmount(dai, ethAmount), TradeType.EXACT_INPUT);
    const path = [weth.address, token.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const deadlineHex = ethers.BigNumber.from(deadline.toString()).toHexString();

    tokensToSell = trade.outputAmount.raw
    const amountOutHex = ethers.BigNumber.from(tokensToSell.toString()).toHexString();

    const ethAmt = parseFloat(ETH_AMOUNT) * 1.2;
    const amountInMax = ethers.utils.parseEther(ethAmt.toString());
    const amountInMaxHex = ethers.BigNumber.from(amountInMax.toString()).toHexString();

    const tx = await uniswap.swapETHForExactTokens(
      amountOutHex,
      path,
      ACCOUNT,
      deadlineHex,
      {
        nonce: nonce,
        value: amountInMaxHex,
        gasPrice: ethers.BigNumber.from(newGasPrice).toHexString(),
        gasLimit: ethers.BigNumber.from(gasLimit).toHexString()
      }
    );
    console.log('\x1b[1m\x1b[37m[Bot]: Your purchase transaction was: \x1b[1m\x1b[32m', tx.hash, "\x1b[0m");
  }
}

console.clear()
console.log("\n")

console.log('\x1b[1m\x1b[33m███████╗██████╗░░█████╗░███╗░░██╗████████╗░░░░░░██████╗░██╗░░░██╗███╗░░██╗███╗░░██╗███████╗██████╗░')
console.log('\x1b[1m\x1b[33m██╔════╝██╔══██╗██╔══██╗████╗░██║╚══██╔══╝░░░░░░██╔══██╗██║░░░██║████╗░██║████╗░██║██╔════╝██╔══██╗')
console.log('\x1b[1m\x1b[33m█████╗░░██████╔╝██║░░██║██╔██╗██║░░░██║░░░█████╗██████╔╝██║░░░██║██╔██╗██║██╔██╗██║█████╗░░██████╔╝')
console.log('\x1b[1m\x1b[33m██╔══╝░░██╔══██╗██║░░██║██║╚████║░░░██║░░░╚════╝██╔══██╗██║░░░██║██║╚████║██║╚████║██╔══╝░░██╔══██╗')
console.log('\x1b[1m\x1b[33m██║░░░░░██║░░██║╚█████╔╝██║░╚███║░░░██║░░░░░░░░░██║░░██║╚██████╔╝██║░╚███║██║░╚███║███████╗██║░░██║')
console.log('\x1b[1m\x1b[33m╚═╝░░░░░╚═╝░░╚═╝░╚════╝░╚═╝░░╚══╝░░░╚═╝░░░░░░░░░╚═╝░░╚═╝░╚═════╝░╚═╝░░╚══╝╚═╝░░╚══╝╚══════╝╚═╝░░╚═╝')

console.log(divider)

run()
