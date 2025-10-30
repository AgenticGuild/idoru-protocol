import { ethers } from "hardhat";

const IEAS_ABI = [
  "function attest((bytes32 schema,address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value)) returns (bytes32)"
];

async function main() {
  const [signer] = await ethers.getSigners();
  const eas = new ethers.Contract(process.env.EAS_ADDR as string, IEAS_ABI, signer);
  const att = {
    schema: ethers.ZeroHash,
    recipient: signer.address,
    expirationTime: 0,
    revocable: true,
    refUID: ethers.ZeroHash,
    data: "0x",
    value: 0n
  } as const;
  const tx = await eas.attest(att);
  const rc = await tx.wait();
  console.log("EAS attested tx:", rc?.hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
