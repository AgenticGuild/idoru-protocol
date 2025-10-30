# Deployment Guide (Base Sepolia)

## Prerequisites
- Node 18+
- pnpm or npm
- RPC endpoint for Base Sepolia
- Deployer and Facilitator private keys
- USDC test token and EAS contract addresses (or use mocks on Hardhat)

## Env

Copy `.env.example` to `.env` and set:
- RPC_BASE_SEPOLIA
- DEPLOYER_PK
- FACILITATOR_PK
- USDC_ADDR
- EAS_ADDR
- FEE_COLLECTOR

## Install
```
pnpm install
```

## Compile and Test
```
pnpm compile
pnpm test
```

## Deploy
```
pnpm deploy
```
Outputs to `deployments/deployments.json`.

## Facilitator Node v2
```
pnpm facilitator
```
- GET /supported → configured scheme/network
- POST /price → 402 with X-PAYMENT-REQUIRED and domain + signature
- POST /verify → stateless header verification
- POST /verify-settlement → on-chain settled check
- POST /attest → EAS relay
