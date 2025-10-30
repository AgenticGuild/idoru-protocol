pub mod core;
pub mod protocol;
pub mod network;
pub mod bridge;

// Re-export commonly used types
pub use core::agent::{Agent, AgentRole};
pub use protocol::swarm::Swarm; 