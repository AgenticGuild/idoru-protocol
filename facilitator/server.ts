import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { signQuote, Quote, baseSepoliaKind, decodeXPaymentHeader, PaymentRequirements } from "./x402";
import { relayAttestation } from "./easRelay";
import { gatewayContract } from "./batchSettler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const rpc = process.env.RPC_BASE_SEPOLIA || process.env.BASE_SEPOLIA_RPC || "";
const provider = new ethers.JsonRpcProvider(rpc);
const facilitatorPk = process.env.FACILITATOR_PK || "";
const wallet = new ethers.Wallet(facilitatorPk);
const gatewayAddr = process.env.GATEWAY_ADDR || "";
const easAddr = process.env.EAS_ADDR || "";

app.get("/supported", (_req: Request, res: Response) => {
  res.json({ kinds: [baseSepoliaKind()] });
});

app.post("/price", async (req: Request, res: Response) => {
  try {
    const q: Quote = req.body;
    const chain = await provider.getNetwork();
    const sig = await signQuote(wallet, Number(chain.chainId), gatewayAddr, q);
    res.status(402);
    res.setHeader("X-PAYMENT-REQUIRED", "true");
    res.json({ signature: sig, domain: { name: "x402 Payment", version: "1", chainId: Number(chain.chainId), verifyingContract: gatewayAddr } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// x402-compliant verify
// Request: { x402Version, paymentHeader, paymentRequirements }
app.post("/verify", async (req: Request, res: Response) => {
  try {
    const { x402Version, paymentHeader, paymentRequirements } = req.body as {
      x402Version: number;
      paymentHeader: string;
      paymentRequirements: PaymentRequirements;
    };
    if (!x402Version || !paymentHeader || !paymentRequirements) {
      return res.status(400).json({ isValid: false, invalidReason: "missing fields" });
    }
    const decoded = decodeXPaymentHeader(paymentHeader);
    if ((decoded as any).scheme !== "exact" || (decoded as any).network !== baseSepoliaKind().network) {
      return res.json({ isValid: false, invalidReason: "unsupported scheme/network" });
    }
    // Minimal verification: ensure amounts and addresses exist
    const ok = Boolean((decoded as any).payload?.pid && paymentRequirements.payTo && paymentRequirements.asset);
    return res.json({ isValid: ok, invalidReason: ok ? null : "invalid payload" });
  } catch (e: any) {
    res.status(400).json({ isValid: false, invalidReason: e.message });
  }
});

// x402-compliant settle (verify on-chain settlement)
app.post("/verify-settlement", async (req: Request, res: Response) => {
  try {
    const { x402Version, paymentHeader } = req.body as { x402Version: number; paymentHeader: string };
    if (!x402Version || !paymentHeader) return res.status(400).json({ success: false, error: "missing fields" });
    const decoded = decodeXPaymentHeader(paymentHeader) as any;
    const pid: string | undefined = decoded?.payload?.pid;
    if (!pid) return res.json({ success: false, error: "pid missing", txHash: null, networkId: null });
    const signer = wallet.connect(provider);
    const gw = gatewayContract(gatewayAddr, signer);
    const p = await gw.payments(pid);
    if (Boolean(p[6])) {
      return res.json({ success: true, error: null, txHash: null, networkId: String((await provider.getNetwork()).chainId) });
    } else {
      return res.json({ success: false, error: "not settled on-chain", txHash: null, networkId: null });
    }
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message, txHash: null, networkId: null });
  }
});

app.post("/refund", async (_req: Request, res: Response) => {
  // TODO(idoru-mark2): implement facilitator-initiated on-chain refund policy
  res.json({ ok: true });
});

app.post("/attest", async (req: Request, res: Response) => {
  try {
    const signer = wallet.connect(provider);
    const hash = await relayAttestation(provider, signer, easAddr, req.body);
    res.json({ txHash: hash });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 4020;
app.listen(port, () => console.log(`Facilitator v2 listening on :${port}`));



