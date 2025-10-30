# Protocol Overview

Idoru Protocol Mark II links payments, receipts, validator reputation, and credit.

1) Payment: Facilitator quotes EIP-712 payment, payer escrows via `PaymentGatewayV2`.
2) Receipt: After settlement, work receipt logs with a valid EAS attestation.
3) Reputation: Validator stake weights drive aggregated agent reputation in `ReputationGraph`.
4) Credit: Reputation unlocks credit lines in `CreditEngine`.

```mermaid
sequenceDiagram
  participant Client
  participant Facilitator
  participant Gateway
  participant EAS
  participant WorkReceipt
  Client->>Facilitator: POST /price (request)
  Facilitator-->>Client: 402 + EIP-712 quote
  Client->>Gateway: approve + pay(pid)
  Gateway-->>Client: PaymentSettled(pid)
  Client->>EAS: attest(work)
  EAS-->>Client: attestationId
  Client->>WorkReceipt: logReceipt(pid, attestationId)
```

```mermaid
flowchart LR
  A[Validator stake] --> B[Weighted attestations]
  B --> C[ReputationGraph]
  C --> D[CreditEngine]
```

