import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [signer] = await ethers.getSigners();
  const deployments = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const agentAddr = deployments.AgentIdentityV2 as string;
  const Agent = await ethers.getContractAt("AgentIdentityV2", agentAddr);
  const tx = await Agent.connect(signer).register(
    signer.address,
    "ipfs://sample-agent-metadata",
    ethers.ZeroHash
  );
  const receipt = await tx.wait();
  console.log("Agent registered tx:", receipt?.hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


