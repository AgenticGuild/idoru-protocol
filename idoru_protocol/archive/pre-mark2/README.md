# Idoru Protocol MVP

A minimal implementation of the Idoru Protocol, demonstrating HPC concurrency with Rust and on-chain finalization with Go/HyperSDK on Avalanche Subnets.

## Components

### Rust Off-Chain
- HPC concurrency simulation with agent roles (Explorer, WarGamer)
- Agent management with Swarm orchestration
- Bridging to on-chain state (HTTP, with placeholders for gRPC/Zero-Copy)
- Simple eGUI for debugging and visualization

### Go On-Chain (HyperSDK)
- IdoruVM for Avalanche Subnets
- ResonanceAction for finalizing agent states
- SwarmBatch action for multiple updates in one transaction
- Simple key-value storage for agent data

## Prerequisites

- Rust 1.70+
- Go 1.21+
- Avalanche CLI
- HyperSDK

## Building

### Rust Component
```bash
cd rust
cargo build --release
```

### Go Component
```bash
cd go
go build -o idoru_vm ./vm
```

## Running

1. Start the Avalanche Subnet:
```bash
avalanche subnet create idoru_snet --vm ./idoru_vm --genesis ./config/genesis.json
avalanche subnet deploy idoru_snet
```

2. Run the Rust HPC simulation:
```bash
# Command-line mode
./target/release/idoru_protocol --agent-count 5 --iterations 3

# GUI mode
./target/release/idoru_protocol --agent-count 5 --iterations 3 --gui
```

## Architecture

- Rust handles off-chain HPC concurrency and agent simulation
- Go/HyperSDK manages on-chain state and resonance finalization
- HTTP bridging connects the off-chain and on-chain components
- Agent roles (Explorer, WarGamer) demonstrate different simulation behaviors
- SwarmBatch action allows efficient batch updates on-chain

## License

MIT 