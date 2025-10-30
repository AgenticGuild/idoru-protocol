import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaymentGatewayV2 refund", () => {
  it("facilitator can refund after expiry + challenge window", async () => {
    const [owner, payer, payee, facilitator] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("TestToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Gateway = await ethers.getContractFactory("PaymentGatewayV2");
    const gw = await Gateway.deploy(owner.address, facilitator.address, owner.address);
    await gw.waitForDeployment();
    await gw.connect(owner).setChallengeWindow(1);

    const nonce = 7n;
    const expiry = BigInt(Math.floor(Date.now() / 1000) + 1);
    const pid = await gw.computePid(
      payer.address,
      payee.address,
      await token.getAddress(),
      ethers.parseEther("10"),
      nonce,
      expiry
    );
    const quote = {
      payer: payer.address,
      payee: payee.address,
      token: await token.getAddress(),
      amount: ethers.parseEther("10"),
      fee: 0n,
      expiry,
      nonce,
      pid
    } as const;

    const chain = await ethers.provider.getNetwork();
    const domain = { name: "x402 Payment", version: "1", chainId: Number(chain.chainId), verifyingContract: await gw.getAddress() } as const;
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
    const sig = await owner.signTypedData(domain, types as any, quote as any);
    await gw.connect(facilitator).quote(quote, sig);

    // wait expiry + window
    await ethers.provider.send("evm_increaseTime", [3]);
    await ethers.provider.send("evm_mine", []);

    await gw.connect(facilitator).refund(pid);
    const p = await gw.payments(pid);
    expect(p[7]).to.eq(true); // refunded
  });
});



