## Protocol Overview

Idoru Protocol connects payment, verification, and reputation:

- Payment → Receipt → Reputation → Credit

### Flow
1. Facilitator provides price quote (EIP-712 x402) to payer.
2. Payer settles via `PaymentGatewayV2` (escrow → split).
3. Work completes; validator submits EAS attestation.
4. `WorkReceiptV2` logs receipt, linking payment and attestation.
5. `ReputationGraph` updates agent scores.
6. `CreditEngine` grants lines based on reputation and collateral.

### Diagram
```mermaid
flowchart LR
  P[Payer] -- X-PAYMENT Quote --> F[Facilitator]
  F -- EIP-712 --> P
  P -- ERC20 --> G[PaymentGatewayV2]
  G -- net --> A[Agent]
  G -- fee --> C[FeeCollector]
  A -- work done --> V[Validator]
  V -- EAS Attest --> E[EAS]
  E -- UID --> R[WorkReceiptV2]
  R -- delta --> RG[ReputationGraph]
  RG -- score --> CE[CreditEngine]
```
