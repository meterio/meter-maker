const metermakerABI = require("./abi/metermaker.json").abi;
const erc20ABI = require("./abi/erc20safe.json").abi;
const Web3 = require("web3");
const meterify = require("meterify").meterify;
const BigNumber = require("bignumber.js");
const {
  metermakerAddr,
  meterAddr,
  reserve,
  rpcUrl,
  minMTRToTransfer,
  maxMTRToTransfer,
} = require("./const");

const loadWeb3 = () => {
  const web3 = meterify(new Web3(), rpcUrl);
  return web3;
};

const enableAccount = (web3) => {
  const privkey = process.env.MTR_HOLDER_PRIV_KEY;
  const acct = web3.eth.accounts.privateKeyToAccount(privkey);
  web3.eth.accounts.wallet.add(privkey);
  console.log("enabled account: ", acct.address);
  return acct.address;
};

const transferMTRToMeterMaker = async () => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  console.log("addresss: ", ownerAddr);
  const balance = await web3.eth.getEnergy(ownerAddr);
  // const balance = '200000000000000000000'
  let mtrAmount = new BigNumber(balance).minus(reserve);
  if (mtrAmount.isGreaterThan(maxMTRToTransfer)) {
    mtrAmount = new BigNumber(maxMTRToTransfer);
  }
  console.log("Buyback MTR balance:", balance);
  console.log(`Transfer MTR to MeterMaker: ${mtrAmount}`);
  if (mtrAmount.isLessThan(minMTRToTransfer)) {
    console.log("not enough MTR balance to start buyback");
    process.exit(-1);
  }
  const mtrSysContract = new web3.eth.Contract(erc20ABI, meterAddr);
  const receipt = await mtrSysContract.methods
    .transfer(metermakerAddr, mtrAmount.toFixed(0))
    .send({ from: ownerAddr });
  return receipt;
};

const callBuybackOnMeterMaker = async () => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const metermakerInst = new web3.eth.Contract(metermakerABI, metermakerAddr);
  const receipt = await metermakerInst.methods
    .buybackMTRG()
    .send({ from: ownerAddr });
  return receipt;
};

module.exports = {
  transferMTRToMeterMaker,
  callBuybackOnMeterMaker,
};
