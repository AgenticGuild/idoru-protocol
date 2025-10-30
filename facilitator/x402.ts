import { ethers } from "ethers";

export type Quote = {
  payer: string;
  payee: string;
  token: string;
  amount: bigint;
  fee: bigint;
  expiry: bigint;
  nonce: bigint;
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
    { name: "nonce", type: "uint256" },
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

export type PaymentRequirements = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  outputSchema?: Record<string, unknown> | null;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, unknown> | null;
};

export type PaymentPayload = {
  x402Version: number;
  scheme: string;
  network: string;
  payload: unknown;
};

export function encodeXPaymentHeader(obj: PaymentPayload): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64");
}

export function decodeXPaymentHeader(b64: string): PaymentPayload {
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
}

export function baseSepoliaKind() {
  return { scheme: "exact", network: "evm:base-sepolia" };
}



