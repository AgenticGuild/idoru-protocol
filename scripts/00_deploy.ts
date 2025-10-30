import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  const FEE_COLLECTOR = process.env.FEE_COLLECTOR || deployer.address;
  const FACILITATOR = ethers.Wallet.fromPrivateKey((process.env.FACILITATOR_PK || "0x" + "11".repeat(32)) as `0x${string}`).address;
  const USDC_ADDR = process.env.USDC_ADDR;
  const EAS_ADDR = process.env.EAS_ADDR;

  if (!USDC_ADDR || !EAS_ADDR) {
    // Dev fallback on hardhat: deploy mocks
    const Token = await ethers.getContractFactory("TestToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Eas = await ethers.getContractFactory("contracts/test/EasMock.sol:EasMock");
    const eas = await Eas.deploy();
    await eas.waitForDeployment();
    process.env.USDC_ADDR = await token.getAddress();
    process.env.EAS_ADDR = await eas.getAddress();
  }

  const Gateway = await ethers.getContractFactory("PaymentGatewayV2");
  const gw = await Gateway.deploy(deployer.address, FACILITATOR, FEE_COLLECTOR);
  await gw.waitForDeployment();

  const Receipt = await ethers.getContractFactory("WorkReceiptV2");
  const wr = await Receipt.deploy(await gw.getAddress(), process.env.EAS_ADDR!);
  await wr.waitForDeployment();

  const Id = await ethers.getContractFactory("AgentIdentityV2");
  const id = await Id.deploy(deployer.address);
  await id.waitForDeployment();

  const Vm = await ethers.getContractFactory("ValidatorMarket");
  const vm = await Vm.deploy(process.env.USDC_ADDR!, process.env.EAS_ADDR!, deployer.address);
  await vm.waitForDeployment();

  const Rep = await ethers.getContractFactory("ReputationGraph");
  const rep = await Rep.deploy(await vm.getAddress());
  await rep.waitForDeployment();

  const Cred = await ethers.getContractFactory("CreditEngine");
  const cred = await Cred.deploy(await rep.getAddress(), process.env.USDC_ADDR!, deployer.address);
  await cred.waitForDeployment();

  const out = {
    network: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      PaymentGatewayV2: await gw.getAddress(),
      WorkReceiptV2: await wr.getAddress(),
      AgentIdentityV2: await id.getAddress(),
      ValidatorMarket: await vm.getAddress(),
      ReputationGraph: await rep.getAddress(),
      CreditEngine: await cred.getAddress(),
      USDC: process.env.USDC_ADDR,
      EAS: process.env.EAS_ADDR
    }
  };

  const dir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "deployments.json"), JSON.stringify(out, null, 2));
  console.log("Deployments written to deployments/deployments.json\n", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
