const hre = require("hardhat")
const { getAddress } = require('@harmony-js/crypto')

async function deploy() {
  await hre.run('compile')

  console.log(`Attempting to deploy the TestToken contract using Hardhat`)
  const TestToken = await hre.ethers.getContractFactory("TestToken")
  const testToken = await TestToken.deploy()
  await testToken.deployed()
  console.log(`TestToken deployed to: ${testToken.address}\n`)

  console.log(`Attempting to deploy the Faucet contract using Hardhat`)
  const faucetOptions = {
    amount: '10000000000000000000000', //award 10000 tokens per faucet interaction
    frequency: 1 //will allow people to request funds every block (so essentially every ~2s)
  }
  const Faucet = await hre.ethers.getContractFactory("Faucet")
  const faucet = await Faucet.deploy(testToken.address, faucetOptions.amount, faucetOptions.frequency)
  await faucet.deployed()
  console.log(`Faucet deployed to: ${faucet.address}\n`)

  console.log(`   TestToken address: ${testToken.address} - ${getAddress(testToken.address).bech32}`)
  console.log(`   Faucet address: ${faucet.address} - ${getAddress(faucet.address).bech32}\n`)
  console.log(`   export NETWORK=${hre.network.name}; export TOKEN=${testToken.address}; export FAUCET=${faucet.address}\n`)
}

deploy()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
