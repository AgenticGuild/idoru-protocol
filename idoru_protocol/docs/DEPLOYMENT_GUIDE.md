## Deployment Guide (Base Sepolia)

Prereqs: Node 18+, funded deployer key, Base Sepolia RPC.

1. Setup env
```
export BASE_SEPOLIA_RPC=...
export DEPLOYER_PK=0x...
export FEE_COLLECTOR=0x...
export EAS_ADDR=0x...
export USDC_ADDR=0x...
```

2. Install
```
npm install
```

3. Compile
```
npm run build
```

4. Deploy
```
npm run deploy:base-sepolia
```

5. Record addresses
- `deployments.json` is generated at repo root.

6. Facilitator Node v2
```
cd facilitator
npm install
RPC=$BASE_SEPOLIA_RPC FACILITATOR_PK=0x... GATEWAY_ADDR=$(jq -r .PaymentGatewayV2 ../deployments.json) EAS_ADDR=$EAS_ADDR npm run dev
```

Endpoints:
- /supported
- /price
- /verify
- /attest
