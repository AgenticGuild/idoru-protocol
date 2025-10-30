# Idoru Protocol Mark II

High-performance agent payments, receipts, reputation, and credit on Base Sepolia.

## Quick start

- Install deps
  - pnpm install (or npm install)
- Compile and test
  - pnpm compile && pnpm test
- Configure env
  - cp .env.example .env and set RPC_BASE_SEPOLIA, DEPLOYER_PK, FACILITATOR_PK, USDC_ADDR, EAS_ADDR, FEE_COLLECTOR
- Deploy (Base Sepolia)
  - pnpm deploy
- Run facilitator
  - pnpm facilitator

## Value prop

- x402-compatible facilitator for seamless paywalls
- EIP-712 quoted payments with escrow and refunds
- Receipts gated by payment settlement and EAS attestations
- Validator staking/attestation with simple slashing
- Reputation aggregation and credit line provisioning

See `docs/` for full protocol overview, deployment guide, and architecture diagrams.
