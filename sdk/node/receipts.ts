import { ethers } from "ethers";

const WR_ABI = [
  "function logReceipt(bytes32 paymentId,address agent,bytes32 attestationId,bytes32 resultHash,bool success) returns (uint256)",
];

export async function logReceipt(
  provider: ethers.Provider,
  signer: ethers.Signer,
  workReceiptAddress: string,
  paymentId: string,
  agent: string,
  attestationId: string,
  resultHash: string,
  success: boolean
) {
  const wr = new ethers.Contract(workReceiptAddress, WR_ABI, signer.connect(provider));
  const tx = await wr.logReceipt(paymentId, agent, attestationId, resultHash, success);
  const rc = await tx.wait();
  return rc?.hash as string;
}
