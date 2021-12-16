//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

require('dotenv').config();
const { transferMTRToMeterMaker, callBuybackOnMeterMaker } = require('./utils');

(async () => {
  try {
    // transfer mtr to meterMaker
    const trReceipt = await transferMTRToMeterMaker();
    console.log('Transfer Tx: ', trReceipt.transactionHash);
    if (!trReceipt || !trReceipt.transactionHash) {
      console.log('Invalid mtr transfer receipt, end early');
      process.exit(-1);
    }

    // send buyback tx
    const bbReceipt = await callBuybackOnMeterMaker();
    console.log('MTRG Buyback Tx: ', bbReceipt.transactionHash)
    if (!bbReceipt || !bbReceipt.transactionHash) {
      console.log('Invalid buyback receipt, end early');
      process.exit(-1);
    }

  } catch (e) {
    console.log('Error Happened: ', e);
    process.exit(-2);
  }
})();
