import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer, payer, payee] = await ethers.getSigners();
  const deployments = JSON.parse(fs.readFileSync("deployments/deployments.json", "utf8"));
  const gwAddr: string = deployments.contracts.PaymentGatewayV2;
  const usdcAddr: string = deployments.contracts.USDC;

  const token = await ethers.getContractAt("contracts/test/TestToken.sol:TestToken", usdcAddr);
  const gw = await ethers.getContractAt("PaymentGatewayV2", gwAddr);

  const amount = ethers.parseEther("10");
  const fee = ethers.parseEther("0.1");
  const nonce = 42n;
  const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const pid = await gw.computePid(payer.address, payee.address, usdcAddr, amount, nonce, expiry);
  const quote = { payer: payer.address, payee: payee.address, token: usdcAddr, amount, fee, expiry, nonce, pid } as const;

  const chain = await ethers.provider.getNetwork();
  const domain = { name: "x402 Payment", version: "1", chainId: Number(chain.chainId), verifyingContract: gwAddr } as const;
  const types = { Quote: [
    { name: "payer", type: "address" },
    { name: "payee", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "fee", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "pid", type: "bytes32" }
  ] } as const;
  const sig = await deployer.signTypedData(domain, types as any, quote as any);

  await (await gw.connect(deployer).quote(quote, sig)).wait();

  await (await token.mint(payer.address, amount)).wait();
  await (await token.connect(payer).approve(gwAddr, amount)).wait();
  await (await gw.connect(payer).pay(pid)).wait();

  console.log("Settled pid:", pid);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
