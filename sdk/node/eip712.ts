import { ethers } from "ethers";

export type Quote = {
  payer: string;
  payee: string;
  token: string;
  amount: bigint;
  fee: bigint;
  expiry: bigint;
  nonce: bigint;
  pid: string;
};

export function computePid(
  verifyingContract: string,
  chainId: number,
  payer: string,
  payee: string,
  token: string,
  amount: bigint,
  nonce: bigint,
  expiry: bigint
) {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "address", "address", "address", "uint256", "uint256", "uint256"],
      [verifyingContract, BigInt(chainId), payer, payee, token, amount, nonce, expiry]
    )
  );
}

export function domain(chainId: number, verifyingContract: string) {
  return { name: "x402 Payment", version: "1", chainId, verifyingContract } as const;
}

export const types = {
  Quote: [
    { name: "payer", type: "address" },
    { name: "payee", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "fee", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "pid", type: "bytes32" }
  ]
} as const;

export async function signQuote(w: ethers.Wallet, chainId: number, verifyingContract: string, q: Quote) {
  return await w.signTypedData(domain(chainId, verifyingContract), types as any, q as any);
}
