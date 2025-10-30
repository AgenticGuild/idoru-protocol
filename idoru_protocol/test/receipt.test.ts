import { expect } from "chai";
import { ethers } from "hardhat";

describe("WorkReceiptV2", () => {
  it("requires settled payment and valid attestation (mock)", async () => {
    const [deployer, payer, payee] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Gateway = await ethers.getContractFactory("PaymentGatewayV2");
    const gw = await Gateway.deploy(deployer.address, deployer.address, deployer.address);
    await gw.waitForDeployment();

    // mock EAS that always returns true
    const EasMock = await ethers.getContractFactory("contracts/test/EasMock.sol:EasMock");
    const eas = await EasMock.deploy();
    await eas.waitForDeployment();

    const Receipt = await ethers.getContractFactory("WorkReceiptV2");
    const wr = await Receipt.deploy(await gw.getAddress(), await eas.getAddress());
    await wr.waitForDeployment();

    const pid = ethers.id("pid-2");
    const quote = {
      payer: payer.address,
      payee: payee.address,
      token: await token.getAddress(),
      amount: ethers.parseEther("1"),
      fee: 0n,
      expiry: Math.floor(Date.now() / 1000) + 3600,
      pid
    };
    const chain = await ethers.provider.getNetwork();
    const domain = { name: "x402 Payment", version: "1", chainId: Number(chain.chainId), verifyingContract: await gw.getAddress() } as const;
    const types = { Quote: [
      { name: "payer", type: "address" },
      { name: "payee", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "fee", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "pid", type: "bytes32" }
    ] } as const;
    const sig = await deployer.signTypedData(domain, types as any, quote as any);

    await gw.connect(deployer).quote(quote, sig);
    await token.mint(payer.address, ethers.parseEther("5"));
    await token.connect(payer).approve(await gw.getAddress(), ethers.parseEther("1"));
    await gw.connect(payer).pay(pid);

    const attId = ethers.ZeroHash;
    const id = await wr.logReceipt.staticCall(pid, payee.address, attId, ethers.id("res"), true);
    const tx = await wr.logReceipt(pid, payee.address, attId, ethers.id("res"), true);
    await tx.wait();
    expect(Number(id)).to.be.greaterThan(0);
  });
});


