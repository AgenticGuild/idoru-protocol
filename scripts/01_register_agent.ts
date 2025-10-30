import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [caller] = await ethers.getSigners();
  const deployments = JSON.parse(fs.readFileSync("deployments/deployments.json", "utf8"));
  const idAddr: string = deployments.contracts.AgentIdentityV2;

  const Id = await ethers.getContractFactory("AgentIdentityV2");
  const id = Id.attach(idAddr);

  const tokenId = await id.register.staticCall(caller.address, "ipfs://agent/metadata", ethers.ZeroHash);
  const tx = await id.register(caller.address, "ipfs://agent/metadata", ethers.ZeroHash);
  await tx.wait();
  console.log("Agent registered tokenId:", tokenId.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
