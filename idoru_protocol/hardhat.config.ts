import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PK || "";
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  paths: {
    sources: "contracts",
    tests: "test",
    scripts: "scripts",
    cache: "cache",
    artifacts: "artifacts"
  },
  networks: {
    hardhat: {},
    baseSepolia: {
      url: BASE_SEPOLIA_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  }
};

export default config;


