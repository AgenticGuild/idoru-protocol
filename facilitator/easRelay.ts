import { ethers } from "ethers";

// Minimal EAS interface for relaying a basic attestation
const IEAS_ABI = [
  "function attest((bytes32 schema,address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value)) returns (bytes32)"
];

export type AttestationInput = {
  schema: string;
  recipient: string;
  expirationTime: number;
  revocable: boolean;
  refUID: string;
  data: string;
  value: bigint;
};

export async function relayAttestation(
  provider: ethers.Provider,
  signer: ethers.Wallet,
  easAddress: string,
  att: AttestationInput
) {
  const eas = new ethers.Contract(easAddress, IEAS_ABI, signer.connect(provider));
  const tx = await eas.attest(att);
  const rc = await tx.wait();
  return rc?.hash as string;
}



