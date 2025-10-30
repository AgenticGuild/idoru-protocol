import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaymentGatewayV2", () => {
  it("quotes and settles a payment", async () => {
    const [deployer, payer, payee] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Gateway = await ethers.getContractFactory("PaymentGatewayV2");
    const gw = await Gateway.deploy(deployer.address, deployer.address, deployer.address);
    await gw.waitForDeployment();

    // build quote
    const pid = ethers.id("pid-1");
    const quote = {
      payer: payer.address,
      payee: payee.address,
      token: await token.getAddress(),
      amount: ethers.parseEther("100"),
      fee: ethers.parseEther("1"),
      expiry: Math.floor(Date.now() / 1000) + 3600,
      pid
    };

    // sign quote as facilitator (deployer)
    const chain = await ethers.provider.getNetwork();
    const domain = {
      name: "x402 Payment",
      version: "1",
      chainId: Number(chain.chainId),
      verifyingContract: await gw.getAddress()
    } as const;
    const types = {
      Quote: [
        { name: "payer", type: "address" },
        { name: "payee", type: "address" },
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "fee", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "pid", type: "bytes32" }
      ]
    } as const;
    const sig = await deployer.signTypedData(domain, types as any, quote as any);

    // facilitator posts quote
    await gw.connect(deployer).quote(quote, sig);

    // fund payer and approve
    await token.mint(payer.address, ethers.parseEther("200"));
    await token.connect(payer).approve(await gw.getAddress(), ethers.parseEther("100"));

    // pay
    await gw.connect(payer).pay(pid);

    const p = await gw.payments(pid);
    expect(p[6]).to.eq(true); // settled
  });
});


