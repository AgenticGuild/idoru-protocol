import fetch from "node-fetch";
import { ethers } from "ethers";

export type FacilitatorConfig = {
  baseUrl: string;
};

export class IdoruClient {
  constructor(private cfg: FacilitatorConfig) {}

  async supported() {
    const r = await fetch(`${this.cfg.baseUrl}/supported`);
    return r.json();
  }

  async price(q: any) {
    const r = await fetch(`${this.cfg.baseUrl}/price`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(q) });
    return r.json();
  }

  async verify(pid: string) {
    const r = await fetch(`${this.cfg.baseUrl}/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pid }) });
    return r.json();
  }

  async attest(body: any) {
    const r = await fetch(`${this.cfg.baseUrl}/attest`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return r.json();
  }
}

export const Eip1271 = {
  async sign(wallet: ethers.Wallet, data: Uint8Array) {
    return wallet.signMessage(data);
  }
};


