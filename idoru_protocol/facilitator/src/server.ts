import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { signQuote, Quote } from "./x402";
import { relayAttestation } from "./easRelay";
import { gatewayContract } from "./batchSettler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const rpc = process.env.RPC || process.env.BASE_SEPOLIA_RPC || "";
const provider = new ethers.JsonRpcProvider(rpc);
const facilitatorPk = process.env.FACILITATOR_PK || "";
const wallet = new ethers.Wallet(facilitatorPk);
const gatewayAddr = process.env.GATEWAY_ADDR || "";
const easAddr = process.env.EAS_ADDR || "";

app.get("/supported", (_req, res) => {
  res.json({ version: "2", network: "base-sepolia", chainId: 84532 });
});

app.post("/price", async (req, res) => {
  try {
    const q: Quote = req.body;
    const chain = await provider.getNetwork();
    const sig = await signQuote(wallet, Number(chain.chainId), gatewayAddr, q);
    res.setHeader("X-PAYMENT-REQUIRED", "true");
    res.json({ signature: sig, domain: { name: "x402 Payment", version: "1", chainId: Number(chain.chainId), verifyingContract: gatewayAddr } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { pid } = req.body as { pid: string };
    const signer = wallet.connect(provider);
    const gw = gatewayContract(gatewayAddr, signer);
    const p = await gw.payments(pid);
    res.json({ settled: Boolean(p[6]) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/refund", async (_req, res) => {
  // Placeholder: refunds are facilitator-only on-chain; expose policy here
  res.json({ ok: true });
});

app.post("/attest", async (req, res) => {
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


