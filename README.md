# Idoru Protocol

<div align="center">
  <img src="https://raw.githubusercontent.com/AgenticGuild/idoru-protocol/main/assets/logo.png" alt="Idoru Protocol Logo" width="200"/>
  <br>
  <p>
    <strong>Agentic SwarmNets for High-Performance Concurrency</strong>
  </p>
  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</div>

## Overview

Idoru Protocol is a hybrid Rust/Go platform that enables high-performance concurrency for multi-agent systems with on-chain finalization via Avalanche Subnets. It provides a framework for building agent-based applications that require both off-chain computation and on-chain state management.

The protocol combines the power of Rust's concurrency model for off-chain agent simulation with Go's HyperSDK for on-chain state finalization, creating a seamless bridge between high-performance computing and blockchain technology.

## Features

### Rust Off-Chain Components
- **Agent Roles**: Specialized agent types (Explorer, WarGamer) with role-specific behaviors
- **HPC Concurrency**: Parallel execution of agent simulations using Tokio
- **Swarm Orchestration**: Coordinated management of multiple agents
- **Bridging Layer**: HTTP-based communication with on-chain components (with placeholders for gRPC/Zero-Copy)
- **Debugging Interface**: Simple eGUI for monitoring agent states and simulation progress

### Go On-Chain Components
- **IdoruVM**: HyperSDK-based virtual machine for Avalanche Subnets
- **Resonance Actions**: On-chain finalization of agent states
- **Batch Processing**: Efficient handling of multiple agent updates in a single transaction
- **State Management**: Key-value storage for agent data with resonance tracking

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Rust Off-Chain │────▶│  Bridging Layer │────▶│  Go On-Chain    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Agent Roles    │     │  HTTP/gRPC      │     │  IdoruVM        │
│  HPC Simulation │     │  Zero-Copy      │     │  Resonance      │
│  Swarm Logic    │     │  Communication  │     │  State Storage  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Getting Started

### Prerequisites
- Rust 1.70+
- Go 1.21+
- Avalanche CLI
- HyperSDK

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AgenticGuild/idoru-protocol.git
   cd idoru-protocol
   ```

2. **Build the Rust component**
   ```bash
   cd rust
   cargo build --release
   ```

3. **Build the Go component**
   ```bash
   cd go
   go build -o idoru_vm ./vm
   ```

4. **Deploy the Avalanche Subnet**
   ```bash
   avalanche subnet create idoru_snet --vm ./idoru_vm --genesis ./config/genesis.json
   avalanche subnet deploy idoru_snet
   ```

### Running the Protocol

#### Command-line Mode
```bash
./target/release/idoru_protocol --agent-count 5 --iterations 3
```

#### GUI Mode
```bash
./target/release/idoru_protocol --agent-count 5 --iterations 3 --gui
```

## Use Cases

- **Multi-Agent Simulations**: Run complex agent-based simulations with role-specific behaviors
- **Distributed Computing**: Leverage HPC concurrency for computationally intensive tasks
- **On-Chain Finalization**: Record and verify agent states on Avalanche Subnets
- **Agent Collaboration**: Enable agents to work together through resonance mechanics

## Contributing

We welcome contributions to Idoru Protocol! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

Idoru Protocol is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Avalanche](https://www.avax.network/) for the Subnet infrastructure
- [HyperSDK](https://github.com/ava-labs/hypersdk) for the VM framework
- [Tokio](https://tokio.rs/) for Rust concurrency
- All contributors and supporters of the project

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/AgenticGuild">AgenticGuild</a></p>
</div>
