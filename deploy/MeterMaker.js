
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
    factoryAddr = '';
    vaultAddr = '0x0000000000000000000000000000000000000000';
    mtrAddr = '';
    mtrgAddr = '';
  } else if (chainId === '83') {
    // metertest
    factoryAddr = '';
    vaultAddr = '0x0000000000000000000000000000000000000000';
    mtrAddr = '';
    mtrgAddr = '';
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

module.exports.tags = ["SushiMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiBar", "SushiToken"]