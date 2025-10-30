import { ethers } from "ethers";

export type Quote = {
  payer: string;
  payee: string;
  token: string;
  amount: bigint;
  fee: bigint;
  expiry: bigint;
  pid: string; // bytes32 hex
};

export const domain = (chainId: number, verifyingContract: string) => ({
  name: "x402 Payment",
  version: "1",
  chainId,
  verifyingContract
});

export const types = {
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

export async function signQuote(
  wallet: ethers.Wallet,
  chainId: number,
  verifyingContract: string,
  q: Quote
) {
  return await wallet.signTypedData(domain(chainId, verifyingContract), types as any, q as any);
}


