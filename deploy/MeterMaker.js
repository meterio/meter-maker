
module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()

  let factoryAddr = '';
  let vaultAddr = '';
  let mtrgAddr = '';
  let mtrAddr = '';
  
  console.log("CHAIN ID: ", chainId)
  if (chainId === '82') {
    // metermain
    factoryAddr = '0x56aD9A9149685b290ffeC883937caE191e193135';
    vaultAddr = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    mtrAddr = '0x687a6294d0d6d63e751a059bf1ca68e4ae7b13e2';
    mtrgAddr = '0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3';
  } else if (chainId === '83') {
    // metertest
    factoryAddr = '0x9010c6F0Bbb5D5CDBa88bFEf987A8597dCCA4b90';
    vaultAddr = '0x1d18C6fcA6817175FfF59763A36aC03CA9755165';
    mtrAddr = '0x4cb6cef87d8cadf966b455e8bd58fff32aba49d1';
    mtrgAddr = '0x8a419ef4941355476cf04933e90bf3bbf2f73814';
  } else {
    throw Error("No Info for MeterMaker!")
  }

  await deploy("MeterMaker", {
    from: deployer,
    args: [factoryAddr, vaultAddr, mtrAddr, mtrgAddr],
    log: true,
    deterministicDeployment: false
  })

  const maker = await ethers.getContract("MeterMaker")
  if (await maker.owner() !== dev) {
    console.log("Setting maker owner")
    await (await maker.transferOwnership(dev, true, false)).wait()
  }
}

module.exports.tags = ["MeterMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02" ]