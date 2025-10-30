import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentIdentityV2", () => {
  it("mints locked and disallows transfers", async () => {
    const [owner, user] = await ethers.getSigners();
    const Id = await ethers.getContractFactory("AgentIdentityV2");
    const id = await Id.deploy(owner.address);
    await id.waitForDeployment();

    const tokenId = await id.register.staticCall(user.address, "ipfs://token", ethers.ZeroHash);
    await (await id.connect(owner).register(user.address, "ipfs://token", ethers.ZeroHash)).wait();

    expect(await id.locked(tokenId)).to.eq(true);
    await expect(id.connect(user)["safeTransferFrom(address,address,uint256)"](user.address, owner.address, tokenId)).to.be.reverted;
  });
});



