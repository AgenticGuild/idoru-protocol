import { expect } from "chai";
import { ethers } from "hardhat";

describe("ValidatorMarket", () => {
  it("stake, attest, and slash on challenge", async () => {
    const [owner, validator, challenger] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("TestToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const EasMock = await ethers.getContractFactory("contracts/test/EasMock.sol:EasMock");
    const eas = await EasMock.deploy();
    await eas.waitForDeployment();

    const Vm = await ethers.getContractFactory("ValidatorMarket");
    const vm = await Vm.deploy(await token.getAddress(), await eas.getAddress(), owner.address);
    await vm.waitForDeployment();

    await token.mint(validator.address, ethers.parseEther("100"));
    await token.connect(validator).approve(await vm.getAddress(), ethers.parseEther("50"));
    await vm.connect(validator).stake(ethers.parseEther("50"));
    expect(await vm.validatorStake(validator.address)).to.eq(ethers.parseEther("50"));

    const att = ethers.id("att");
    await expect(vm.connect(validator).attest(att)).to.emit(vm, "Attested");

    await expect(vm.connect(owner).challenge(att, validator.address, ethers.parseEther("10")))
      .to.emit(vm, "Slashed");
    expect(await vm.validatorStake(validator.address)).to.eq(ethers.parseEther("40"));
  });
});



