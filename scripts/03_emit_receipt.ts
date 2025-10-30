import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [_, __, agent] = await ethers.getSigners();
  const deployments = JSON.parse(fs.readFileSync("deployments/deployments.json", "utf8"));
  const wrAddr: string = deployments.contracts.WorkReceiptV2;
  const gwAddr: string = deployments.contracts.PaymentGatewayV2;

  const gw = await ethers.getContractAt("PaymentGatewayV2", gwAddr);
  const wr = await ethers.getContractAt("WorkReceiptV2", wrAddr);

  // For demo, use a deterministic pid; ensure it's settled before calling
  const payments = await gw.payments(ethers.id("pid-demo"));
  if (!payments || payments[0] === ethers.ZeroAddress) {
    console.log("Demo payment not found; run 02_demo_payment.ts first.");
    return;
  }
  if (!payments[6]) {
    console.log("Demo payment not settled; aborting.");
    return;
  }
  const attId = ethers.ZeroHash;
  const resHash = ethers.id("demo-result");
  const id = await wr.logReceipt.staticCall(ethers.id("pid-demo"), agent.address, attId, resHash, true);
  const tx = await wr.logReceipt(ethers.id("pid-demo"), agent.address, attId, resHash, true);
  await tx.wait();
  console.log("Logged receipt id:", id.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
