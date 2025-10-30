import { ethers } from "ethers";

export type FacilitatorConfig = {
  baseUrl: string;
  gateway: string;
  provider: ethers.Provider;
  signer: ethers.Signer;
};

export class X402Client {
  constructor(private readonly cfg: FacilitatorConfig) {}

  async supported() {
    const r = await fetch(`${this.cfg.baseUrl}/supported`);
    if (!r.ok) throw new Error(`supported failed: ${r.status}`);
    return r.json();
  }

  async price(quote: any) {
    const r = await fetch(`${this.cfg.baseUrl}/price`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(quote)
    });
    if (r.status !== 402) throw new Error(`expected 402, got ${r.status}`);
    const body = await r.json();
    return body;
  }

  async verify(payload: any) {
    const r = await fetch(`${this.cfg.baseUrl}/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  }

  async verifySettlement(payload: any) {
    const r = await fetch(`${this.cfg.baseUrl}/verify-settlement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.json();
  }

  async attest(att: any) {
    const r = await fetch(`${this.cfg.baseUrl}/attest`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(att)
    });
    if (!r.ok) throw new Error(`attest failed: ${r.status}`);
    return r.json();
  }
}
