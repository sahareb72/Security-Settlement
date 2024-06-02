require('@nomicfoundation/hardhat-ignition');
require('@nomicfoundation/ignition-core');
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition/modules");
require('hardhat-deploy');
require('@nomiclabs/hardhat-ethers');
//require("@chainlink=smartcontractkit/chainlink-brownie-contracts@1.2.1");

const { SEPOLIA_API_URL, PRIVATE_KEY } = process.env;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_API_URL, // This is your Sepolia network URL from Infura or Alchemy
      accounts: [PRIVATE_KEY], // Your MetaMask account's private key
      chainId: 11155111
    },
  },

  namedAccounts: {
    deployer: {
      default: 0, // Here the 0th account will always be the deployer
    },
  },
};
