import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const facilitator = process.env.FACILITATOR_ADDR || deployer.address;
  const feeCollector = process.env.FEE_COLLECTOR || deployer.address;
  const easAddr = process.env.EAS_ADDR || ethers.ZeroAddress;
  const usdcAddr = process.env.USDC_ADDR || ethers.ZeroAddress;

  const AgentIdentityV2 = await ethers.getContractFactory("AgentIdentityV2");
  const agentIdentity = await AgentIdentityV2.deploy(deployer.address);
  await agentIdentity.waitForDeployment();

  const PaymentGatewayV2 = await ethers.getContractFactory("PaymentGatewayV2");
  const gateway = await PaymentGatewayV2.deploy(deployer.address, facilitator, feeCollector);
  await gateway.waitForDeployment();

  const WorkReceiptV2 = await ethers.getContractFactory("WorkReceiptV2");
  const receipt = await WorkReceiptV2.deploy(await gateway.getAddress(), easAddr);
  await receipt.waitForDeployment();

  const ValidatorMarket = await ethers.getContractFactory("ValidatorMarket");
  const validator = await ValidatorMarket.deploy(usdcAddr, easAddr, deployer.address);
  await validator.waitForDeployment();

  const ReputationGraph = await ethers.getContractFactory("ReputationGraph");
  const rep = await ReputationGraph.deploy(await validator.getAddress());
  await rep.waitForDeployment();

  const CreditEngine = await ethers.getContractFactory("CreditEngine");
  const credit = await CreditEngine.deploy(await rep.getAddress(), usdcAddr, deployer.address);
  await credit.waitForDeployment();

  const deployments = {
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    AgentIdentityV2: await agentIdentity.getAddress(),
    PaymentGatewayV2: await gateway.getAddress(),
    WorkReceiptV2: await receipt.getAddress(),
    ValidatorMarket: await validator.getAddress(),
    ReputationGraph: await rep.getAddress(),
    CreditEngine: await credit.getAddress()
  };

  const outPath = path.join(process.cwd(), "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deployments, null, 2));
  console.log("Deployments saved to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


